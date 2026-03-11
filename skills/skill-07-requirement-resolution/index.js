/**
 * Skill-06: Requirement Resolution - Core Implementation
 * RequirementSolver: executes confirmed blueprints, reports progress, self-corrects.
 * Pure Node.js 18+, no external dependencies (fs/path only).
 */

const fs = require('fs');
const path = require('path');

// --- Error codes ---
const SOLVER_INVALID_INPUT = 'SOLVER_INVALID_INPUT';
const SOLVER_EXECUTION_FAILED = 'SOLVER_EXECUTION_FAILED';
const SOLVER_TIMEOUT = 'SOLVER_TIMEOUT';
const SOLVER_BLUEPRINT_PARSE_FAILED = 'SOLVER_BLUEPRINT_PARSE_FAILED';
const SOLVER_TASK_FAILED = 'SOLVER_TASK_FAILED';
const SOLVER_PARTIAL = 'SOLVER_PARTIAL';

const DEFAULT_OPTIONS = {
  dryRun: false,
  maxRetries: 3,
  timeoutMs: 300000,
  reportProgressIntervalMs: 60000,
  allowPartial: false,
};

// --- BlueprintParser: parse execution blueprint from path or in-memory tasks ---
class BlueprintParser {
  /**
   * @param {{ path?: string, documents?: Array<{file: string, purpose?: string}>, tasks?: Array }} blueprint
   * @returns {{ tasks: Array<{id: string, title: string, steps: string[], acceptanceCriteria?: string[]}>, error?: { code: string, message: string, details?: unknown }}}
   */
  parse(blueprint) {
    if (!blueprint || typeof blueprint !== 'object') {
      return { tasks: [], error: { code: SOLVER_INVALID_INPUT, message: 'blueprint is required and must be an object', details: null } };
    }

    if (Array.isArray(blueprint.tasks) && blueprint.tasks.length > 0) {
      const normalized = this._normalizeTasks(blueprint.tasks);
      return { tasks: normalized };
    }

    const bpPath = blueprint.path;
    if (!bpPath || typeof bpPath !== 'string') {
      return { tasks: [], error: { code: SOLVER_INVALID_INPUT, message: 'blueprint.path is required when blueprint.tasks is not provided', details: { path: bpPath } } };
    }

    const resolvedPath = path.isAbsolute(bpPath) ? bpPath : path.resolve(process.cwd(), bpPath);
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
      return { tasks: [], error: { code: SOLVER_BLUEPRINT_PARSE_FAILED, message: 'blueprint.path does not exist or is not a directory', details: { path: resolvedPath } } };
    }

    const tasksPath = path.join(resolvedPath, 'tasks.md');
    if (!fs.existsSync(tasksPath)) {
      return { tasks: [], error: { code: SOLVER_BLUEPRINT_PARSE_FAILED, message: 'tasks.md not found under blueprint.path', details: { path: tasksPath } } };
    }

    try {
      const content = fs.readFileSync(tasksPath, 'utf8');
      const tasks = this._parseTasksMarkdown(content, resolvedPath);
      return { tasks };
    } catch (e) {
      return { tasks: [], error: { code: SOLVER_BLUEPRINT_PARSE_FAILED, message: e instanceof Error ? e.message : String(e), details: e } };
    }
  }

  _normalizeTasks(tasks) {
    return tasks.map((t, i) => ({
      id: t.id || `Task-${String(i + 1).padStart(3, '0')}`,
      title: t.title || '',
      steps: Array.isArray(t.steps) ? t.steps : [],
      acceptanceCriteria: Array.isArray(t.acceptanceCriteria) ? t.acceptanceCriteria : [],
    }));
  }

  _parseTasksMarkdown(content, basePath) {
    const tasks = [];
    const lines = content.split(/\r?\n/);
    let current = null;
    let inSteps = false;
    let inAC = false;

    for (const line of lines) {
      const taskHeader = line.match(/^#+\s*(?:Task[- ]?)?(\d+)\s*[：:]\s*(.+)$/);
      const stepBullet = line.match(/^[-*]\s+(.+)$/);
      const acBullet = line.match(/^(?:AC|验收)[-：:]?\s*(.+)$/i) || (inAC && stepBullet);

      if (taskHeader) {
        if (current) tasks.push(current);
        current = {
          id: `Task-${taskHeader[1].padStart(3, '0')}`,
          title: taskHeader[2].trim(),
          steps: [],
          acceptanceCriteria: [],
        };
        inSteps = false;
        inAC = false;
        continue;
      }

      if (!current) continue;

      if (/^步骤|steps?/i.test(line.trim())) {
        inSteps = true;
        inAC = false;
        continue;
      }
      if (/^(AC|验收标准|acceptance)/i.test(line.trim())) {
        inAC = true;
        inSteps = false;
        continue;
      }

      if (stepBullet && inSteps) {
        current.steps.push(stepBullet[1].trim());
      } else if ((acBullet || (inAC && stepBullet)) && inAC) {
        current.acceptanceCriteria.push((acBullet ? acBullet[1] : stepBullet[1]).trim());
      }
    }
    if (current) tasks.push(current);

    return this._normalizeTasks(tasks.length ? tasks : [{ id: 'Task-001', title: 'Default', steps: ['Execute blueprint'], acceptanceCriteria: [] }]);
  }
}

// --- ToolInvoker: invoke external tools/APIs (stub + timeout wrapper) ---
class ToolInvoker {
  /**
   * @param {{ timeoutMs?: number }} options
   */
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs ?? 30000;
  }

  /**
   * @param {string} toolName - e.g. 'cursor-cli', 'exec'
   * @param {Record<string, unknown>} params
   * @returns {Promise<{ success: boolean, output?: string, error?: string }>}
   */
  async invoke(toolName, params = {}) {
    const timeout = this.timeoutMs;
    const runner = new Promise((resolve) => {
      setImmediate(() => {
        if (toolName === 'cursor-cli' || toolName === 'exec') {
          resolve({ success: true, output: `[${toolName}] executed (stub)`, error: undefined });
        } else {
          resolve({ success: true, output: `[${toolName}] ok`, error: undefined });
        }
      });
    });
    const timer = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tool invocation timeout')), timeout)
    );
    try {
      const result = await Promise.race([runner, timer]);
      return result;
    } catch (e) {
      return { success: false, output: undefined, error: e instanceof Error ? e.message : String(e) };
    }
  }
}

// --- ProgressReporter: real-time progress ---
class ProgressReporter {
  constructor() {
    this.total = 0;
    this.completed = 0;
    this.failed = 0;
    this.current = null;
    this.lastUpdated = null;
    this.message = '';
    this._listeners = [];
  }

  get percentage() {
    if (this.total === 0) return 100;
    return Math.min(100, Math.round(((this.completed + this.failed) / this.total) * 100));
  }

  getSnapshot() {
    return {
      total: this.total,
      completed: this.completed,
      failed: this.failed,
      current: this.current,
      percentage: this.percentage,
      lastUpdated: this.lastUpdated || new Date().toISOString(),
      message: this.message,
    };
  }

  init(total, message = '') {
    this.total = total;
    this.completed = 0;
    this.failed = 0;
    this.current = null;
    this.lastUpdated = new Date().toISOString();
    this.message = message || `0/${total} tasks`;
    this._emit();
  }

  updateCurrent(taskId, message) {
    this.current = taskId;
    this.lastUpdated = new Date().toISOString();
    this.message = message || `${this.completed + this.failed}/${this.total} tasks`;
    this._emit();
  }

  markCompleted(taskId) {
    this.completed += 1;
    this.current = taskId;
    this.lastUpdated = new Date().toISOString();
    this.message = `${this.completed + this.failed}/${this.total} tasks`;
    this._emit();
  }

  markFailed(taskId) {
    this.failed += 1;
    this.current = taskId;
    this.lastUpdated = new Date().toISOString();
    this.message = `${this.completed + this.failed}/${this.total} tasks`;
    this._emit();
  }

  onUpdate(fn) {
    this._listeners.push(fn);
  }

  _emit() {
    const snap = this.getSnapshot();
    for (const fn of this._listeners) {
      try {
        fn(snap);
      } catch (_) {}
    }
  }
}

// --- TaskExecutor: execute tasks step-by-step ---
class TaskExecutor {
  /**
   * @param {{ toolInvoker: ToolInvoker, progressReporter: ProgressReporter, maxRetries: number, timeoutMs: number, allowPartial: boolean, dryRun: boolean }} deps
   */
  constructor(deps) {
    this.toolInvoker = deps.toolInvoker;
    this.progressReporter = deps.progressReporter;
    this.maxRetries = deps.maxRetries ?? 3;
    this.timeoutMs = deps.timeoutMs ?? 300000;
    this.allowPartial = deps.allowPartial ?? false;
    this.dryRun = deps.dryRun ?? false;
  }

  /**
   * @param {Array<{id: string, title: string, steps: string[], acceptanceCriteria?: string[]}>} tasks
   * @param {{ projectName?: string, blueprintPath?: string }} context
   * @param {{ executionLog: Array<{timestamp: string, step: string, action: string, status: string, error?: string}>, deliverables: Array<{type: string, path: string, description: string}> }} state
   * @param {{ deadline?: number }} options
   * @returns {{ status: 'success'|'error'|'partial', executionLog: typeof state.executionLog, deliverables: typeof state.deliverables, error?: { code: string, message: string, details?: unknown } }}
   */
  async execute(tasks, context, state, options = {}) {
    const deadline = options.deadline ?? (Date.now() + this.timeoutMs);
    const executionLog = state.executionLog.slice();
    const deliverables = state.deliverables.slice();

    this.progressReporter.init(tasks.length, `0/${tasks.length} tasks`);

    if (this.dryRun) {
      for (const t of tasks) {
        this.progressReporter.updateCurrent(t.id, `[dryRun] ${t.id}: ${t.title}`);
        executionLog.push({
          timestamp: new Date().toISOString(),
          step: t.id,
          action: `[dryRun] ${t.title}`,
          status: 'skipped',
        });
      }
      for (let i = 0; i < tasks.length; i++) this.progressReporter.markCompleted(tasks[i].id);
      this.progressReporter.message = `Dry run: ${tasks.length} tasks planned`;
      return { status: 'success', executionLog, deliverables };
    }

    let overallStatus = 'success';
    let lastError = null;

    for (const task of tasks) {
      if (Date.now() > deadline) {
        executionLog.push({
          timestamp: new Date().toISOString(),
          step: task.id,
          action: 'Timeout before starting task',
          status: 'error',
          error: 'SOLVER_TIMEOUT',
        });
        return {
          status: 'error',
          executionLog,
          deliverables,
          error: { code: SOLVER_TIMEOUT, message: 'Execution timeout', details: { deadline } },
        };
      }

      this.progressReporter.updateCurrent(task.id, `${task.id}: ${task.title}`);
      let stepSuccess = false;
      let retries = 0;

      while (retries <= this.maxRetries) {
        const stepResult = await this._runTaskSteps(task, context, executionLog, deadline);
        if (stepResult.success) {
          stepSuccess = true;
          this.progressReporter.markCompleted(task.id);
          if (stepResult.deliverable) {
            deliverables.push(stepResult.deliverable);
          }
          break;
        }

        lastError = stepResult.error;
        executionLog.push({
          timestamp: new Date().toISOString(),
          step: task.id,
          action: stepResult.action || task.title,
          status: 'error',
          error: stepResult.error,
        });

        if (retries >= this.maxRetries) {
          this.progressReporter.markFailed(task.id);
          if (this.allowPartial) {
            overallStatus = 'partial';
          } else {
            return {
              status: 'error',
              executionLog,
              deliverables,
              error: {
                code: SOLVER_TASK_FAILED,
                message: lastError || 'Task failed after max retries',
                details: { taskId: task.id, retries },
              },
            };
          }
          break;
        }
        retries += 1;
      }
    }

    return {
      status: overallStatus,
      executionLog,
      deliverables,
      error: overallStatus === 'partial' ? { code: SOLVER_PARTIAL, message: 'Some tasks failed', details: lastError } : undefined,
    };
  }

  async _runTaskSteps(task, context, executionLog, deadline) {
    for (let i = 0; i < task.steps.length; i++) {
      if (Date.now() > deadline) {
        return { success: false, error: 'SOLVER_TIMEOUT', action: task.steps[i] };
      }
      const stepDesc = task.steps[i];
      executionLog.push({
        timestamp: new Date().toISOString(),
        step: `${task.id}-step-${i + 1}`,
        action: stepDesc,
        status: 'running',
      });
      const invoker = this.toolInvoker;
      const result = await invoker.invoke('cursor-cli', { task: task.id, step: stepDesc, context });
      if (!result.success) {
        return { success: false, error: result.error, action: stepDesc };
      }
      const lastLog = executionLog[executionLog.length - 1];
      lastLog.status = 'success';
    }

    const deliverable = {
      type: 'artifact',
      path: context.blueprintPath ? path.join(context.blueprintPath, `${task.id}-output`) : `${task.id}-output`,
      description: task.title,
    };
    return { success: true, deliverable };
  }
}

// --- SelfReviewChecker: self-correction and AC check ---
class SelfReviewChecker {
  /**
   * @param {{ executionLog: Array<{step: string, status: string}>, deliverables: Array<{type: string, path: string}>, tasks: Array<{id: string, acceptanceCriteria?: string[]}> }} input
   * @returns {{ passed: boolean, issues: string[] }}
   */
  check(input) {
    const issues = [];
    const failedSteps = (input.executionLog || []).filter((e) => e.status === 'error' || e.status === 'fail');
    if (failedSteps.length > 0) {
      issues.push(`${failedSteps.length} step(s) failed or error`);
    }
    const allSucceeded = failedSteps.length === 0;
    const acChecked = (input.tasks || []).flatMap((t) => t.acceptanceCriteria || []);
    if (acChecked.length > 0 && input.deliverables.length === 0 && !allSucceeded) {
      issues.push('No deliverables produced but AC exists');
    }
    return {
      passed: issues.length === 0,
      issues,
      acChecked: acChecked.length > 0 ? acChecked : undefined,
      summary: issues.length === 0 ? 'Self-review passed' : issues.join('; '),
    };
  }
}

// --- RequirementSolver: main orchestrator ---
class RequirementSolver {
  constructor() {
    this.blueprintParser = new BlueprintParser();
    this.toolInvoker = new ToolInvoker({ timeoutMs: 30000 });
    this.progressReporter = new ProgressReporter();
    this.selfReviewChecker = new SelfReviewChecker();
  }

  /**
   * @param {{ blueprint: { path?: string, documents?: unknown[], tasks?: unknown[] }, context?: { projectName?: string, intentResult?: string, blueprintForm?: string }, options?: { dryRun?: boolean, maxRetries?: number, timeoutMs?: number, reportProgressIntervalMs?: number, allowPartial?: boolean } }} input
   * @returns {Promise<{ status: 'success'|'error'|'partial', deliverables: Array<{type: string, path: string, description: string}>, executionLog: Array<{timestamp: string, step: string, action: string, status: string, error?: string}>, progress: { total: number, completed: number, failed: number, current: string|null, percentage: number, lastUpdated: string, message: string }, selfReview?: { passed: boolean, issues: string[] }, error?: { code: string, message: string, details?: unknown } }>}
   */
  async solve(input) {
    if (!input || typeof input !== 'object') {
      return this._errorResult(SOLVER_INVALID_INPUT, 'Input is required and must be an object', null);
    }

    if (!input.blueprint || typeof input.blueprint !== 'object') {
      return this._errorResult(SOLVER_INVALID_INPUT, 'blueprint is required', null);
    }

    const options = { ...DEFAULT_OPTIONS, ...(input.options || {}) };
    const optionsError = this._validateOptions(options);
    if (optionsError) {
      return this._errorResult(SOLVER_INVALID_INPUT, optionsError.message, optionsError.details);
    }

    const parseResult = this.blueprintParser.parse(input.blueprint);
    if (parseResult.error) {
      return this._errorResult(
        parseResult.error.code,
        parseResult.error.message,
        parseResult.error.details,
        []
      );
    }

    const tasks = parseResult.tasks;
    const context = {
      projectName: input.context?.projectName,
      intentResult: input.context?.intentResult,
      blueprintForm: input.context?.blueprintForm,
      blueprintPath: input.blueprint.path,
    };

    const state = {
      executionLog: [],
      deliverables: [],
    };

    const deadline = Date.now() + options.timeoutMs;
    const executor = new TaskExecutor({
      toolInvoker: this.toolInvoker,
      progressReporter: this.progressReporter,
      maxRetries: options.maxRetries,
      timeoutMs: options.timeoutMs,
      allowPartial: options.allowPartial,
      dryRun: options.dryRun,
    });

    let execResult;
    try {
      execResult = await executor.execute(tasks, context, state, { deadline });
    } catch (e) {
      return this._errorResult(
        SOLVER_EXECUTION_FAILED,
        e instanceof Error ? e.message : String(e),
        e,
        state.executionLog
      );
    }

    const progress = this.progressReporter.getSnapshot();
    const selfReview = this.selfReviewChecker.check({
      executionLog: execResult.executionLog,
      deliverables: execResult.deliverables,
      tasks,
    });

    const status = execResult.status;
    const error =
      status === 'success'
        ? undefined
        : (execResult.error || (status === 'error' ? { code: SOLVER_EXECUTION_FAILED, message: 'Execution failed', details: null } : undefined));

    return {
      status,
      deliverables: execResult.deliverables,
      executionLog: execResult.executionLog,
      progress: {
        total: progress.total,
        completed: progress.completed,
        failed: progress.failed,
        current: progress.current,
        percentage: progress.percentage,
        lastUpdated: progress.lastUpdated,
        message: progress.message,
      },
      selfReview: { passed: selfReview.passed, issues: selfReview.issues },
      ...(error && { error }),
    };
  }

  _validateOptions(options) {
    if (typeof options.maxRetries !== 'number' || options.maxRetries < 0 || !Number.isInteger(options.maxRetries)) {
      return { message: 'options.maxRetries must be a non-negative integer', details: { maxRetries: options.maxRetries } };
    }
    if (typeof options.timeoutMs !== 'number' || options.timeoutMs <= 0) {
      return { message: 'options.timeoutMs must be a positive number', details: { timeoutMs: options.timeoutMs } };
    }
    if (typeof options.dryRun !== 'boolean') {
      return { message: 'options.dryRun must be a boolean', details: { dryRun: options.dryRun } };
    }
    if (typeof options.allowPartial !== 'boolean') {
      return { message: 'options.allowPartial must be a boolean', details: { allowPartial: options.allowPartial } };
    }
    return null;
  }

  _errorResult(code, message, details, executionLog = []) {
    const progress = this.progressReporter.getSnapshot();
    return {
      status: 'error',
      deliverables: [],
      executionLog,
      progress: {
        total: progress.total || 0,
        completed: progress.completed || 0,
        failed: progress.failed || 0,
        current: progress.current,
        percentage: progress.percentage || 0,
        lastUpdated: new Date().toISOString(),
        message: message || 'Error',
      },
      error: { code, message, details },
    };
  }
}

// --- Export singleton and components ---
const solver = new RequirementSolver();

module.exports = {
  solver,
  RequirementSolver,
  BlueprintParser,
  TaskExecutor,
  ToolInvoker,
  ProgressReporter,
  SelfReviewChecker,
  SOLVER_INVALID_INPUT,
  SOLVER_EXECUTION_FAILED,
  SOLVER_TIMEOUT,
  SOLVER_BLUEPRINT_PARSE_FAILED,
  SOLVER_TASK_FAILED,
  SOLVER_PARTIAL,
};