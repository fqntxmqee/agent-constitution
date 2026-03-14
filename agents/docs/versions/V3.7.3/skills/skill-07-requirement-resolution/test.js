/**
 * Skill-06 Requirement Resolution - Test Suite
 * 10 test cases, Node.js assert only. Output: [PASS]/[FAIL] per case, then total (X/10).
 */

const assert = require('assert');
const {
  solver,
  RequirementSolver,
  SOLVER_INVALID_INPUT,
  SOLVER_TIMEOUT,
  SOLVER_TASK_FAILED,
  SOLVER_PARTIAL,
} = require('./index.js');

const TASKS_ONE = [
  { id: 'Task-001', title: 'Single task', steps: ['Step 1'], acceptanceCriteria: ['AC1'] },
];
const TASKS_TWO = [
  { id: 'Task-001', title: 'First', steps: ['Step 1'], acceptanceCriteria: [] },
  { id: 'Task-002', title: 'Second', steps: ['Step 2'], acceptanceCriteria: [] },
];
const TASKS_THREE = [
  { id: 'Task-001', title: 'T1', steps: ['S1'], acceptanceCriteria: [] },
  { id: 'Task-002', title: 'T2', steps: ['S2'], acceptanceCriteria: [] },
  { id: 'Task-003', title: 'T3', steps: ['S3'], acceptanceCriteria: [] },
];

let passed = 0;
const total = 10;

function ok(name, condition, message) {
  if (condition) {
    console.log(`${name}: [PASS]`);
    passed += 1;
    return;
  }
  console.log(`${name}: [FAIL] ${message || 'assertion failed'}`);
}

async function run() {
  // TC-01: 正常执行成功 - 验证 status 为 success
  {
    const name = 'TC-01';
    const r = await solver.solve({
      blueprint: { tasks: TASKS_ONE },
    });
    ok(name, r.status === 'success', `expected status success, got ${r.status}`);
  }

  // TC-02: dryRun 模式 - 验证不实际执行但返回正确结构
  {
    const name = 'TC-02';
    const r = await solver.solve({
      blueprint: { tasks: TASKS_TWO },
      options: { dryRun: true },
    });
    const structureOk =
      r.status === 'success' &&
      Array.isArray(r.executionLog) &&
      Array.isArray(r.deliverables) &&
      typeof r.progress === 'object';
    const noActualDeliverables = r.deliverables.length === 0;
    const dryRunEntries = r.executionLog.filter((e) => e.action && e.action.startsWith('[dryRun]'));
    ok(
      name,
      structureOk && noActualDeliverables && dryRunEntries.length === TASKS_TWO.length,
      `dryRun: structure=${structureOk}, noDeliverables=${noActualDeliverables}, dryRunEntries=${dryRunEntries.length}`
    );
  }

  // TC-03: 重试成功 - 验证失败后重试最终成功
  {
    const name = 'TC-03';
    const customSolver = new RequirementSolver();
    let invokeCount = 0;
    customSolver.toolInvoker = {
      invoke: async () => {
        invokeCount += 1;
        if (invokeCount < 2) return { success: false, error: 'Simulated failure' };
        return { success: true, output: 'ok' };
      },
    };
    const r = await customSolver.solve({
      blueprint: { tasks: TASKS_ONE },
      options: { maxRetries: 2 },
    });
    ok(name, r.status === 'success' && invokeCount >= 2, `expected success after retry, status=${r.status}, invokes=${invokeCount}`);
  }

  // TC-04: 重试用尽 - 验证超过 maxRetries 后报错
  {
    const name = 'TC-04';
    const customSolver = new RequirementSolver();
    customSolver.toolInvoker = {
      invoke: async () => ({ success: false, error: 'Always fail' }),
    };
    const r = await customSolver.solve({
      blueprint: { tasks: TASKS_ONE },
      options: { maxRetries: 1 },
    });
    ok(
      name,
      r.status === 'error' && r.error && r.error.code === SOLVER_TASK_FAILED,
      `expected error SOLVER_TASK_FAILED, status=${r.status}, code=${r.error?.code}`
    );
  }

  // TC-05: 部分成功 (partial) - 验证 allowPartial 时返回 partial 状态
  {
    const name = 'TC-05';
    const customSolver = new RequirementSolver();
    let callCount = 0;
    customSolver.toolInvoker = {
      invoke: async () => {
        callCount += 1;
        if (callCount <= 1) return { success: true, output: 'ok' };
        return { success: false, error: 'Second task fails' };
      },
    };
    const r = await customSolver.solve({
      blueprint: { tasks: TASKS_TWO },
      options: { maxRetries: 1, allowPartial: true },
    });
    ok(
      name,
      r.status === 'partial' && r.error && r.error.code === SOLVER_PARTIAL && r.deliverables.length === 1,
      `expected partial with one deliverable, status=${r.status}, code=${r.error?.code}, deliverables=${r.deliverables?.length}`
    );
  }

  // TC-06: 缺失 blueprint.path - 验证报错 SOLVER_INVALID_INPUT
  {
    const name = 'TC-06';
    const r = await solver.solve({
      blueprint: {},
    });
    ok(
      name,
      r.status === 'error' && r.error && r.error.code === SOLVER_INVALID_INPUT,
      `expected SOLVER_INVALID_INPUT, status=${r.status}, code=${r.error?.code}`
    );
  }

  // TC-07: 超时处理 - 验证 timeoutMs 超时后报错 SOLVER_TIMEOUT
  {
    const name = 'TC-07';
    const customSolver = new RequirementSolver();
    customSolver.toolInvoker = {
      invoke: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { success: true, output: 'ok' };
      },
    };
    const r = await customSolver.solve({
      blueprint: { tasks: TASKS_TWO },
      options: { timeoutMs: 5 },
    });
    ok(
      name,
      r.status === 'error' && r.error && r.error.code === SOLVER_TIMEOUT,
      `expected SOLVER_TIMEOUT, status=${r.status}, code=${r.error?.code}`
    );
  }

  // TC-08: 进度完整性 - 验证 progress 包含所有必需字段
  {
    const name = 'TC-08';
    const r = await solver.solve({
      blueprint: { tasks: TASKS_ONE },
    });
    const p = r.progress;
    const required = ['total', 'completed', 'failed', 'current', 'percentage', 'lastUpdated', 'message'];
    const allPresent = required.every((k) => Object.prototype.hasOwnProperty.call(p, k));
    ok(name, allPresent && typeof p.percentage === 'number', `missing progress fields or percentage not number`);
  }

  // TC-09: 蓝图不可实现 - 验证返回错误和建议
  {
    const name = 'TC-09';
    const customSolver = new RequirementSolver();
    customSolver.toolInvoker = {
      invoke: async () => ({ success: false, error: 'Blueprint not feasible: constraint conflict' }),
    };
    const r = await customSolver.solve({
      blueprint: { tasks: TASKS_ONE },
      options: { maxRetries: 0 },
    });
    ok(
      name,
      r.status === 'error' && r.error && (r.error.message || r.error.code),
      `expected error with message/code, status=${r.status}, error=${JSON.stringify(r.error)}`
    );
  }

  // TC-10: 非法 options - 验证无效选项报错
  {
    const name = 'TC-10';
    const r = await solver.solve({
      blueprint: { tasks: TASKS_ONE },
      options: { maxRetries: -1 },
    });
    ok(
      name,
      r.status === 'error' && r.error && r.error.code === SOLVER_INVALID_INPUT,
      `expected SOLVER_INVALID_INPUT for invalid options, status=${r.status}, code=${r.error?.code}`
    );
  }

  console.log('');
  console.log(`总计: ${passed}/${total}`);
  process.exit(passed === total ? 0 : 1);
}

run().catch((err) => {
  console.error('run error:', err);
  process.exit(1);
});
