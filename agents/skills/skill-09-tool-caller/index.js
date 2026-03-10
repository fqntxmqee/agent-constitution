/**
 * Skill-09: Tool Caller - 工具调用智能体
 * 纯 JavaScript (Node.js 18+)，无外部依赖（仅 fs/path/child_process）
 * 响应时间 < 5 秒
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ---------------------------------------------------------------------------
// 标准错误码（与 SKILL.md 一致，用户要求带 TOOL_ 前缀的已使用）
// ---------------------------------------------------------------------------
const ErrorCodes = {
  TOOL_TIMEOUT: 'TOOL_TIMEOUT',
  TOOL_RETRY_EXHAUSTED: 'TOOL_RETRY_EXHAUSTED',
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  INVALID_PARAMS: 'INVALID_PARAMS',
  EXECUTION_ERROR: 'EXECUTION_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
};

// ---------------------------------------------------------------------------
// ErrorHandler - 错误处理器（失败重试逻辑在 ToolExecutor，此处做标准化）
// ---------------------------------------------------------------------------
class ErrorHandler {
  /**
   * 将异常或原始错误标准化为 { code, message, details }
   * @param {Error|{code:string, message:string, details?:any}} err
   * @param {string} [defaultCode] - 当 err 无 code 时使用
   * @returns {{ code: string, message: string, details?: any }}
   */
  static normalize(err, defaultCode = ErrorCodes.EXECUTION_ERROR) {
    if (err && typeof err.code === 'string' && Object.values(ErrorCodes).includes(err.code)) {
      return {
        code: err.code,
        message: err.message || 'Unknown error',
        details: err.details,
      };
    }
    const message = err && (err.message || String(err));
    const details = err && err.stack ? String(err.stack).slice(0, 500) : undefined;
    return {
      code: defaultCode,
      message: message || 'Unknown error',
      details,
    };
  }

  /**
   * 创建标准错误对象（用于抛出并在上层捕获后放入 response.error）
   */
  static create(code, message, details) {
    const e = new Error(message);
    e.code = code;
    e.details = details;
    return e;
  }
}

// ---------------------------------------------------------------------------
// ToolDiscovery - 工具发现器（发现可用工具列表）
// ---------------------------------------------------------------------------
class ToolDiscovery {
  constructor(options = {}) {
    this.toolsDir = options.toolsDir || path.join(__dirname, 'config');
    this.registry = new Map(); // name -> { name, description, paramsSchema, metadata, run? }
    this._loadRegistry();
  }

  _loadRegistry() {
    const toolsPath = path.join(this.toolsDir, 'tools.json');
    try {
      if (fs.existsSync(toolsPath)) {
        const data = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
        const list = Array.isArray(data.tools) ? data.tools : (data && data) || [];
        for (const t of list) {
          if (t && t.name) this.registry.set(t.name, { ...t });
        }
      }
    } catch (_) {
      // 无 config 时使用内存注册表
    }
    // 内置示例工具（便于单文件无 config 时仍可发现与执行）
    if (!this.registry.has('echo')) {
      this.registry.set('echo', {
        name: 'echo',
        description: 'Echo back input text',
        paramsSchema: { type: 'object', properties: { text: { type: 'string' } } },
        metadata: {},
        run: async (params) => ({ echoed: params && params.text != null ? params.text : '' }),
      });
    }
    if (!this.registry.has('ping')) {
      this.registry.set('ping', {
        name: 'ping',
        description: 'Ping pong',
        paramsSchema: { type: 'object' },
        metadata: {},
        run: async () => ({ pong: true, timestamp: new Date().toISOString() }),
      });
    }
  }

  /**
   * 发现可用工具列表，可选按名称或标签过滤
   * @param {string} [filter] - 按名称或 description 包含过滤
   * @returns {{ tools: Array<{ name, description, paramsSchema?, metadata? }> }}
   */
  discover(filter) {
    let list = Array.from(this.registry.values()).map(({ name, description, paramsSchema, metadata }) => ({
      name,
      description: description || '',
      paramsSchema: paramsSchema || {},
      metadata: metadata || {},
    }));
    if (filter && typeof filter === 'string') {
      const f = filter.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(f) || (t.description && t.description.toLowerCase().includes(f)));
    }
    return { tools: list };
  }

  /**
   * 按名称获取工具定义，不存在返回 null
   */
  getTool(name) {
    if (!name || typeof name !== 'string') return null;
    return this.registry.get(name) || null;
  }

  /**
   * 注册工具（便于测试或动态扩展）
   */
  register(tool) {
    if (tool && tool.name) this.registry.set(tool.name, { ...tool });
  }
}

// ---------------------------------------------------------------------------
// ToolExecutor - 工具执行器（调用工具执行，带超时与重试）
// ---------------------------------------------------------------------------
class ToolExecutor {
  constructor(discovery, errorHandler = ErrorHandler) {
    this.discovery = discovery;
    this.errorHandler = errorHandler;
  }

  /**
   * 带超时的 Promise 包装
   */
  _withTimeout(promise, ms) {
    if (ms <= 0) return promise;
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(this.errorHandler.create(ErrorCodes.TOOL_TIMEOUT, 'Tool call timeout', { timeoutMs: ms })), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
  }

  /**
   * 执行单次调用（不重试）
   */
  async _runOnce(toolName, params, timeoutMs) {
    const tool = this.discovery.getTool(toolName);
    if (!tool) throw this.errorHandler.create(ErrorCodes.TOOL_NOT_FOUND, `Tool not found: ${toolName}`, { toolName });

    const run = tool.run;
    if (typeof run !== 'function') {
      throw this.errorHandler.create(ErrorCodes.EXECUTION_ERROR, `Tool has no run function: ${toolName}`, { toolName });
    }

    const raw = await this._withTimeout(Promise.resolve(run(params)), timeoutMs);
    return raw;
  }

  /**
   * 执行工具，带重试与超时
   * @returns {Promise<any>} 原始结果（不解析）
   */
  async execute(toolName, params, options = {}) {
    const timeout = Math.min(Number(options.timeout) || 5000, 5000);
    const retries = Math.min(Math.max(0, Number(options.retries) || 3), 5);
    const retryDelay = Math.min(Math.max(0, Number(options.retryDelay) || 1000), 2000);

    let lastError;
    const attempts = 1 + retries;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const result = await this._runOnce(toolName, params, timeout);
        return { result, attempts: attempt };
      } catch (e) {
        lastError = e;
        if (e.code === ErrorCodes.TOOL_NOT_FOUND || e.code === ErrorCodes.INVALID_PARAMS) {
          throw e;
        }
        if (attempt < attempts) {
          await new Promise((r) => setTimeout(r, retryDelay));
        }
      }
    }
    const code = lastError && lastError.code === ErrorCodes.TOOL_TIMEOUT
      ? ErrorCodes.TOOL_TIMEOUT
      : ErrorCodes.TOOL_RETRY_EXHAUSTED;
    const err = this.errorHandler.create(
      code,
      code === ErrorCodes.TOOL_TIMEOUT ? lastError.message : 'Retries exhausted',
      { attempts, lastError: lastError && lastError.message, details: lastError && lastError.details }
    );
    err.attempts = attempts;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// ResultParser - 结果解析器（按 format 解析工具返回）
// ---------------------------------------------------------------------------
class ResultParser {
  /**
   * @param {any} raw - 工具返回的原始值
   * @param {{ format?: string }} options - format: 'json' | 'raw'
   * @returns {any} 解析后的 result
   */
  parse(raw, options = {}) {
    const format = (options.format === 'raw' ? 'raw' : 'json').toLowerCase();

    if (format === 'raw') return raw;

    if (typeof raw === 'object' && raw !== null && !(raw instanceof Buffer)) {
      return raw;
    }
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (e) {
        throw ErrorHandler.create(ErrorCodes.PARSE_ERROR, 'Failed to parse tool result as JSON', e.message);
      }
    }
    if (Buffer.isBuffer(raw)) {
      try {
        return JSON.parse(raw.toString('utf8'));
      } catch (e) {
        throw ErrorHandler.create(ErrorCodes.PARSE_ERROR, 'Failed to parse buffer as JSON', e.message);
      }
    }
    return raw;
  }
}

// ---------------------------------------------------------------------------
// ToolCaller - 主类，call() 为入口
// ---------------------------------------------------------------------------
class ToolCaller {
  constructor(options = {}) {
    this.discovery = (options.discovery instanceof ToolDiscovery)
      ? options.discovery
      : new ToolDiscovery(options.discovery || {});
    this.executor = new ToolExecutor(this.discovery, ErrorHandler);
    this.parser = new ResultParser();
  }

  /**
   * 校验并补全输入
   */
  _normalizeInput(input) {
    if (!input || typeof input !== 'object') {
      throw ErrorHandler.create(ErrorCodes.INVALID_PARAMS, 'Invalid input: must be an object', input);
    }
    if (input.action === 'discover') {
      return {
        action: 'discover',
        options: input.options && typeof input.options === 'object' ? input.options : {},
      };
    }
    const toolName = input.toolName;
    if (toolName == null || typeof toolName !== 'string' || !toolName.trim()) {
      throw ErrorHandler.create(ErrorCodes.INVALID_PARAMS, 'toolName is required and must be a non-empty string', input);
    }
    const params = input.params != null && typeof input.params === 'object' ? input.params : {};
    const options = input.options && typeof input.options === 'object' ? input.options : {};
    return {
      toolName: toolName.trim(),
      params,
      options: {
        timeout: Math.min(5000, Math.max(100, Number(options.timeout) || 5000)),
        retries: Math.min(5, Math.max(0, Number(options.retries) ?? 3)),
        retryDelay: Math.min(2000, Math.max(0, Number(options.retryDelay) ?? 1000)),
        format: options.format === 'raw' ? 'raw' : 'json',
      },
    };
  }

  /**
   * 简单参数校验：若工具定义了 paramsSchema.required，检查 params 是否包含
   */
  _validateParams(tool, params) {
    const schema = tool.paramsSchema;
    if (!schema || !Array.isArray(schema.required)) return;
    for (const key of schema.required) {
      if (!(key in params)) {
        throw ErrorHandler.create(ErrorCodes.INVALID_PARAMS, `Missing required parameter: ${key}`, { required: schema.required });
      }
    }
  }

  /**
   * 主入口
   * @param {{
   *   toolName?: string,
   *   params?: object,
   *   options?: { timeout?, retries?, retryDelay?, format? },
   *   action?: 'discover'
   * }} input
   * @returns {Promise<{
   *   success: boolean,
   *   result?: any,
   *   error?: { code: string, message: string, details?: any },
   *   metadata: { duration: number, attempts?: number, toolName?: string, timestamp: string, total?: number }
   * }>}
   */
  async call(input) {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    try {
      const normalized = this._normalizeInput(input);

      if (normalized.action === 'discover') {
        const filter = normalized.options.filter;
        const discovered = this.discovery.discover(filter);
        const duration = Date.now() - start;
        return {
          success: true,
          result: discovered,
          metadata: { duration, total: discovered.tools.length, timestamp },
        };
      }

      const { toolName, params, options } = normalized;
      const tool = this.discovery.getTool(toolName);
      if (!tool) {
        const duration = Date.now() - start;
        return {
          success: false,
          result: null,
          error: ErrorHandler.normalize(ErrorHandler.create(ErrorCodes.TOOL_NOT_FOUND, `Tool not found: ${toolName}`, { toolName })),
          metadata: { duration, attempts: 1, toolName, timestamp },
        };
      }

      this._validateParams(tool, params);
    } catch (e) {
      if (e.code === ErrorCodes.INVALID_PARAMS) {
        const duration = Date.now() - start;
        return {
          success: false,
          result: null,
          error: ErrorHandler.normalize(e),
          metadata: { duration, attempts: 1, toolName: input && input.toolName, timestamp },
        };
      }
      throw e;
    }

    const { toolName, params, options } = this._normalizeInput(input);
    let attempts = 1;
    let rawResult;

    try {
      const execOut = await this.executor.execute(toolName, params, options);
      rawResult = execOut.result;
      attempts = execOut.attempts;
    } catch (e) {
      const duration = Date.now() - start;
      const attemptCount = (e && e.attempts != null) ? e.attempts : 1;
      return {
        success: false,
        result: null,
        error: ErrorHandler.normalize(e, ErrorCodes.EXECUTION_ERROR),
        metadata: { duration, attempts: attemptCount, toolName, timestamp },
      };
    }

    let result;
    try {
      result = this.parser.parse(rawResult, options);
    } catch (e) {
      const duration = Date.now() - start;
      return {
        success: false,
        result: null,
        error: ErrorHandler.normalize(e, ErrorCodes.PARSE_ERROR),
        metadata: { duration, attempts, toolName, timestamp },
      };
    }

    const duration = Date.now() - start;
    return {
      success: true,
      result,
      metadata: { duration, attempts, toolName, timestamp },
    };
  }
}

// ---------------------------------------------------------------------------
// 单例导出
// ---------------------------------------------------------------------------
const caller = new ToolCaller();

module.exports = {
  ToolCaller,
  ToolDiscovery,
  ToolExecutor,
  ErrorHandler,
  ResultParser,
  ErrorCodes,
  caller,
};
