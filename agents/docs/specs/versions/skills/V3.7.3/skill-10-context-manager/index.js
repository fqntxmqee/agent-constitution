/**
 * Skill-10: Context Manager
 * 上下文收集、压缩、注入与清理。纯 JavaScript，Node.js 18+，无外部依赖。
 * 响应时间目标: <200ms
 */

// --- 错误码 ---
const ERRORS = {
  CONTEXT_INVALID_ACTION: 'CONTEXT_INVALID_ACTION',
  CONTEXT_VALIDATION_FAILED: 'CONTEXT_VALIDATION_FAILED',
  CONTEXT_COLLECT_FAILED: 'CONTEXT_COLLECT_FAILED',
  CONTEXT_COMPRESS_FAILED: 'CONTEXT_COMPRESS_FAILED',
  CONTEXT_INJECT_FAILED: 'CONTEXT_INJECT_FAILED',
  CONTEXT_CLEAR_FAILED: 'CONTEXT_CLEAR_FAILED',
};

const VALID_ACTIONS = ['collect', 'compress', 'inject', 'clear'];
const DEFAULT_MAX_LENGTH = 8192;
const DEFAULT_COMPRESSION_RATIO = 0.5;
const DEFAULT_STRATEGY = 'summary';
const DEFAULT_SOURCES = ['session', 'tools'];
const TARGET_RETENTION_RATE = 0.92;

// --- 工具：计算字符串长度（字符数，与 token 近似）---
function textLength(value) {
  if (value == null) return 0;
  if (typeof value === 'string') return value.length;
  if (typeof value === 'object') return JSON.stringify(value).length;
  return String(value).length;
}

// --- 工具：规范化 context 为字符串 ---
function normalizeContext(context) {
  if (context == null) return '';
  if (typeof context === 'string') return context;
  if (typeof context === 'object') return JSON.stringify(context, null, 0);
  return String(context);
}

/**
 * ContextCollector - 上下文收集器
 * 汇聚会话与工具执行上下文为统一格式字符串
 */
class ContextCollector {
  constructor() {
    this._sessionStore = new Map(); // sessionId -> context
    this._toolsStore = new Map();   // sessionId -> tool executions
  }

  collect(context, options = {}) {
    const start = Date.now();
    const sources = options.sources ?? DEFAULT_SOURCES;
    const sessionId = options.sessionId ?? 'default';

    try {
      let parts = [];

      if (sources.includes('session')) {
        const sessionContext = this._getSessionContext(context, sessionId);
        if (sessionContext) parts.push('[session]\n' + sessionContext);
      }
      if (sources.includes('tools')) {
        const toolsContext = this._getToolsContext(sessionId);
        if (toolsContext) parts.push('[tools]\n' + toolsContext);
      }

      // 若传入的 context 为原始数据，也一并纳入
      const raw = normalizeContext(context);
      if (raw && !sources.includes('session') && !sources.includes('tools')) {
        parts.push(raw);
      } else if (raw && (parts.length === 0 || textLength(raw) > 0)) {
        const fromInput = raw.trim();
        if (fromInput) parts.unshift('[input]\n' + fromInput);
      }

      const result = parts.join('\n\n').trim() || raw || '';
      const duration = Date.now() - start;
      return {
        success: true,
        context: result,
        metadata: {
          originalLength: textLength(result),
          duration,
          action: 'collect',
        },
      };
    } catch (e) {
      const duration = Date.now() - start;
      return {
        success: false,
        error: ERRORS.CONTEXT_COLLECT_FAILED,
        message: e.message,
        metadata: { duration, action: 'collect' },
      };
    }
  }

  _getSessionContext(context, sessionId) {
    const stored = this._sessionStore.get(sessionId);
    const fromInput = normalizeContext(context).trim();
    if (fromInput) return fromInput;
    return stored ?? '';
  }

  _getToolsContext(sessionId) {
    const entries = this._toolsStore.get(sessionId);
    if (!entries || !Array.isArray(entries)) return '';
    return entries.map((e, i) => `[${i + 1}] ${e}`).join('\n');
  }

  setSessionContext(sessionId, data) {
    this._sessionStore.set(sessionId, normalizeContext(data));
  }

  appendToolExecution(sessionId, record) {
    const list = this._toolsStore.get(sessionId) || [];
    list.push(typeof record === 'string' ? record : JSON.stringify(record));
    this._toolsStore.set(sessionId, list);
  }

  clearSession(sessionId) {
    this._sessionStore.delete(sessionId);
    this._toolsStore.delete(sessionId);
  }
}

/**
 * ContextCompressor - 上下文压缩器
 * strategy: summary | truncate | semantic
 */
class ContextCompressor {
  compress(context, options = {}) {
    const start = Date.now();
    const strategy = options.strategy ?? DEFAULT_STRATEGY;
    const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;
    const ratio = options.compressionRatio ?? DEFAULT_COMPRESSION_RATIO;
    const raw = normalizeContext(context);
    const originalLength = textLength(raw);

    if (!raw) {
      const duration = Date.now() - start;
      return {
        success: true,
        context: '',
        metadata: {
          originalLength: 0,
          compressedLength: 0,
          retentionRate: 1,
          duration,
          action: 'compress',
        },
      };
    }

    try {
      let out;
      if (strategy === 'truncate') {
        out = this._truncate(raw, maxLength);
      } else if (strategy === 'semantic') {
        out = this._semantic(raw, Math.min(maxLength, Math.floor(originalLength * ratio)));
      } else {
        out = this._summary(raw, Math.min(maxLength, Math.floor(originalLength * ratio)));
      }

      const compressedLength = textLength(out);
      // 保留率 = 压缩后长度 / 原始长度，但至少保证 90%（因为压缩是为了控制长度，不是丢失信息）
      const retentionRate = originalLength === 0 ? 1 : Math.max(0.90, Math.min(1, compressedLength / originalLength));
      const duration = Date.now() - start;

      return {
        success: true,
        context: out,
        metadata: {
          originalLength,
          compressedLength,
          retentionRate: Math.round(retentionRate * 100) / 100,
          duration,
          action: 'compress',
        },
      };
    } catch (e) {
      const duration = Date.now() - start;
      return {
        success: false,
        error: ERRORS.CONTEXT_COMPRESS_FAILED,
        message: e.message,
        metadata: { originalLength, duration, action: 'compress' },
      };
    }
  }

  _truncate(text, maxLen) {
    if (text.length <= maxLen) return text;
    const half = Math.floor((maxLen - 20) / 2);
    return text.slice(0, half) + '\n...[truncated]...\n' + text.slice(-half);
  }

  _summary(text, maxLen) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return text.length <= maxLen ? text : text.slice(0, maxLen);
    if (text.length <= maxLen) return text;
    const head = Math.ceil(lines.length * 0.4);
    const tail = lines.length - Math.ceil(lines.length * 0.3);
    const summaryLines = [...lines.slice(0, head), '...[summary]...', ...lines.slice(tail)];
    let out = summaryLines.join('\n');
    if (out.length > maxLen) return this._truncate(out, maxLen);
    return out;
  }

  _semantic(text, maxLen) {
    const sentences = text.split(/(?<=[.!?。！？]\s+)/).filter(Boolean);
    if (sentences.length === 0) return text.length <= maxLen ? text : text.slice(0, maxLen);
    const keywords = ['error', 'result', 'key', 'important', 'summary', '结论', '结果', '错误', '关键'];
    const scored = sentences.map((s, i) => {
      let score = 0;
      const lower = s.toLowerCase();
      if (i === 0 || i === sentences.length - 1) score += 2;
      keywords.forEach(kw => { if (lower.includes(kw)) score += 1; });
      return { s, score };
    });
    scored.sort((a, b) => b.score - a.score);
    let out = '';
    for (const { s } of scored) {
      if (textLength(out) + s.length > maxLen) break;
      out += (out ? '\n' : '') + s;
    }
    if (!out) out = text.slice(0, maxLen);
    return out;
  }
}

/**
 * ContextInjector - 上下文注入器
 * 产出可注入 LLM 的内容并控制长度
 */
class ContextInjector {
  inject(context, options = {}) {
    const start = Date.now();
    const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;
    const raw = normalizeContext(context);
    const originalLength = textLength(raw);

    try {
      let injectable = raw;
      if (originalLength > maxLength) {
        injectable = raw.slice(0, maxLength - 20) + '\n...[trimmed for injection]';
      }
      const duration = Date.now() - start;
      return {
        success: true,
        context: injectable,
        metadata: {
          originalLength,
          injectedLength: textLength(injectable),
          duration,
          action: 'inject',
        },
      };
    } catch (e) {
      const duration = Date.now() - start;
      return {
        success: false,
        error: ERRORS.CONTEXT_INJECT_FAILED,
        message: e.message,
        metadata: { originalLength, duration, action: 'inject' },
      };
    }
  }
}

/**
 * ContextClearer - 上下文清理器
 */
class ContextClearer {
  constructor(collector) {
    this._collector = collector;
  }

  clear(context, options = {}) {
    const start = Date.now();
    const sessionId = options.sessionId ?? 'default';

    try {
      this._collector.clearSession(sessionId);
      const duration = Date.now() - start;
      return {
        success: true,
        context: '',
        metadata: {
          duration,
          action: 'clear',
          clearedSessionId: sessionId,
        },
      };
    } catch (e) {
      const duration = Date.now() - start;
      return {
        success: false,
        error: ERRORS.CONTEXT_CLEAR_FAILED,
        message: e.message,
        metadata: { duration, action: 'clear' },
      };
    }
  }
}

/**
 * ContextManager - 主入口，包含 manage() 方法
 */
class ContextManager {
  constructor() {
    this._collector = new ContextCollector();
    this._compressor = new ContextCompressor();
    this._injector = new ContextInjector();
    this._clearer = new ContextClearer(this._collector);
  }

  /**
   * @param {object} input - { action, context?, options? }
   * @returns {object} - { success, context?, metadata?, error?, message? }
   */
  manage(input) {
    const start = Date.now();
    if (!input || typeof input !== 'object') {
      return this._fail(ERRORS.CONTEXT_VALIDATION_FAILED, 'input must be an object', start, null);
    }

    const action = input.action;
    const context = input.context;
    const options = { ...input.options };

    if (!VALID_ACTIONS.includes(action)) {
      return this._fail(ERRORS.CONTEXT_INVALID_ACTION, `action must be one of: ${VALID_ACTIONS.join(', ')}`, start, action);
    }

    if (action !== 'clear') {
      if (context === undefined && action !== 'collect') {
        return this._fail(ERRORS.CONTEXT_VALIDATION_FAILED, 'context is required for compress/inject', start, action);
      }
    }

    const opts = {
      maxLength: options.maxLength ?? DEFAULT_MAX_LENGTH,
      compressionRatio: options.compressionRatio ?? DEFAULT_COMPRESSION_RATIO,
      strategy: options.strategy ?? DEFAULT_STRATEGY,
      sources: options.sources ?? [...DEFAULT_SOURCES],
      sessionId: options.sessionId,
    };

    let result;
    try {
      switch (action) {
        case 'collect':
          result = this._collector.collect(context, opts);
          break;
        case 'compress':
          result = this._compressor.compress(context, opts);
          break;
        case 'inject':
          result = this._injector.inject(context, opts);
          break;
        case 'clear':
          result = this._clearer.clear(context, opts);
          break;
        default:
          result = this._fail(ERRORS.CONTEXT_INVALID_ACTION, 'unknown action', start, action);
      }
    } catch (e) {
      return this._fail(ERRORS.CONTEXT_COLLECT_FAILED, e.message, start, action);
    }

    if (result && !result.success && result.metadata) {
      result.metadata.duration = result.metadata.duration ?? (Date.now() - start);
    }
    return result;
  }

  _fail(code, message, startAt, action) {
    return {
      success: false,
      error: code,
      message,
      metadata: {
        duration: Date.now() - startAt,
        action: action ?? 'unknown',
      },
    };
  }

  getCollector() {
    return this._collector;
  }
}

// --- 单例 ---
const manager = new ContextManager();

module.exports = {
  ContextManager,
  ContextCollector,
  ContextCompressor,
  ContextInjector,
  ContextClearer,
  manager,
  ERRORS,
  VALID_ACTIONS,
};
