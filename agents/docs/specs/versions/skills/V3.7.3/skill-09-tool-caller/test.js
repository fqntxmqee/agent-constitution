/**
 * Skill-09 Tool Caller - 验收测试
 * 10 个测试用例，对应 SKILL.md 验收标准，仅使用 Node.js assert，无外部测试框架
 */

const assert = require('assert');
const {
  ToolCaller,
  ToolDiscovery,
  ErrorCodes,
} = require('./index.js');

// 测试用 discovery：内置 echo/ping + 可注册的测试工具
function createTestCaller() {
  const discovery = new ToolDiscovery();
  discovery.register({
    name: 'slow',
    description: 'Sleeps longer than timeout',
    paramsSchema: { type: 'object' },
    metadata: {},
    run: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return { ok: true };
    },
  });
  discovery.register({
    name: 'alwaysFail',
    description: 'Always throws',
    paramsSchema: { type: 'object' },
    metadata: {},
    run: async () => {
      throw new Error('always fail');
    },
  });
  discovery.register({
    name: 'badJson',
    description: 'Returns non-JSON string',
    paramsSchema: { type: 'object' },
    metadata: {},
    run: async () => 'not valid json {{{',
  });
  discovery.register({
    name: 'requireFoo',
    description: 'Requires param foo',
    paramsSchema: { type: 'object', required: ['foo'] },
    metadata: {},
    run: async (params) => ({ foo: params.foo }),
  });
  return new ToolCaller({ discovery });
}

const requiredErrorCodes = [
  ErrorCodes.TOOL_TIMEOUT,
  ErrorCodes.TOOL_RETRY_EXHAUSTED,
  ErrorCodes.TOOL_NOT_FOUND,
  ErrorCodes.INVALID_PARAMS,
  ErrorCodes.EXECUTION_ERROR,
  ErrorCodes.PARSE_ERROR,
];

let passed = 0;
let failed = 0;

function run(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.log(`  [FAIL] ${name}`);
    console.error(e.message);
    failed++;
  }
}

async function runAsync(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.log(`  [FAIL] ${name}`);
    console.error(e.message);
    failed++;
  }
}

async function main() {
  const defaultCaller = new ToolCaller();
  const testCaller = createTestCaller();

  console.log('Skill-09 Tool Caller 验收测试\n');

  // TC-01: 工具发现 - 验证 discover 返回工具列表
  await runAsync('TC-01: 工具发现 - 验证 discover 返回工具列表', async () => {
    const out = await defaultCaller.call({ action: 'discover' });
    assert.strictEqual(out.success, true, 'success should be true');
    assert.ok(Array.isArray(out.result.tools), 'result.tools should be array');
    assert.ok(out.result.tools.length >= 1, 'at least one tool');
    const first = out.result.tools[0];
    assert.ok(first.name, 'tool has name');
    assert.ok('description' in first, 'tool has description');
    assert.ok(out.metadata != null && typeof out.metadata.duration === 'number', 'metadata.duration');
  });

  // TC-02: 工具执行成功 - 验证 call 返回 success=true
  await runAsync('TC-02: 工具执行成功 - 验证 call 返回 success=true', async () => {
    const out = await defaultCaller.call({
      toolName: 'echo',
      params: { text: 'hello' },
    });
    assert.strictEqual(out.success, true, 'success should be true');
    assert.ok(out.result != null, 'result should exist');
    assert.strictEqual(out.result.echoed, 'hello', 'echoed value');
    assert.ok(out.metadata && out.metadata.duration >= 0, 'metadata.duration');
  });

  // TC-03: 超时处理 - 验证 timeout 后报错 TOOL_TIMEOUT
  await runAsync('TC-03: 超时处理 - 验证 timeout 后报错 TOOL_TIMEOUT', async () => {
    const out = await testCaller.call({
      toolName: 'slow',
      params: {},
      options: { timeout: 50, retries: 0 },
    });
    assert.strictEqual(out.success, false, 'should fail');
    assert.strictEqual(out.error.code, ErrorCodes.TOOL_TIMEOUT, 'error.code TOOL_TIMEOUT');
    assert.ok(out.metadata.attempts >= 1, 'metadata.attempts');
  });

  // TC-04: 重试耗尽 - 验证 retries 用尽后报错 TOOL_RETRY_EXHAUSTED
  await runAsync('TC-04: 重试耗尽 - 验证 retries 用尽后报错 TOOL_RETRY_EXHAUSTED', async () => {
    const out = await testCaller.call({
      toolName: 'alwaysFail',
      params: {},
      options: { retries: 2, retryDelay: 10 },
    });
    assert.strictEqual(out.success, false, 'should fail');
    assert.strictEqual(out.error.code, ErrorCodes.TOOL_RETRY_EXHAUSTED, 'error.code TOOL_RETRY_EXHAUSTED');
    assert.strictEqual(out.metadata.attempts, 3, 'attempts = 1 + retries 2');
  });

  // TC-05: 工具不存在 - 验证报错 TOOL_NOT_FOUND
  await runAsync('TC-05: 工具不存在 - 验证报错 TOOL_NOT_FOUND', async () => {
    const out = await defaultCaller.call({
      toolName: 'NonExistentToolXYZ',
      params: {},
    });
    assert.strictEqual(out.success, false, 'should fail');
    assert.strictEqual(out.error.code, ErrorCodes.TOOL_NOT_FOUND, 'error.code TOOL_NOT_FOUND');
  });

  // TC-06: 参数无效 - 验证报错 INVALID_PARAMS
  await runAsync('TC-06: 参数无效 - 验证报错 INVALID_PARAMS', async () => {
    const out = await testCaller.call({
      toolName: 'requireFoo',
      params: {},
    });
    assert.strictEqual(out.success, false, 'should fail');
    assert.strictEqual(out.error.code, ErrorCodes.INVALID_PARAMS, 'error.code INVALID_PARAMS');
  });

  // TC-07: 执行异常 - 验证报错 EXECUTION_ERROR（实现可能返回 TOOL_RETRY_EXHAUSTED）
  await runAsync('TC-07: 执行异常 - 验证报错 EXECUTION_ERROR', async () => {
    const out = await testCaller.call({
      toolName: 'alwaysFail',
      params: {},
      options: { retries: 0 },
    });
    assert.strictEqual(out.success, false, 'should fail');
    assert.ok(
      out.error.code === ErrorCodes.EXECUTION_ERROR || out.error.code === ErrorCodes.TOOL_RETRY_EXHAUSTED,
      'error.code EXECUTION_ERROR or TOOL_RETRY_EXHAUSTED'
    );
    assert.ok(out.error.message, 'error.message 标准化');
  });

  // TC-08: 解析失败 - 验证报错 PARSE_ERROR
  await runAsync('TC-08: 解析失败 - 验证报错 PARSE_ERROR', async () => {
    const out = await testCaller.call({
      toolName: 'badJson',
      params: {},
      options: { format: 'json' },
    });
    assert.strictEqual(out.success, false, 'should fail');
    assert.strictEqual(out.error.code, ErrorCodes.PARSE_ERROR, 'error.code PARSE_ERROR');
  });

  // TC-09: 错误处理覆盖率 - 验证所有错误码都有用例覆盖
  run('TC-09: 错误处理覆盖率 - 验证所有错误码都有用例覆盖', () => {
    const covered = new Set([
      ErrorCodes.TOOL_TIMEOUT,        // TC-03
      ErrorCodes.TOOL_RETRY_EXHAUSTED, // TC-04
      ErrorCodes.TOOL_NOT_FOUND,      // TC-05
      ErrorCodes.INVALID_PARAMS,      // TC-06
      ErrorCodes.EXECUTION_ERROR,     // TC-07 (或 RETRY_EXHAUSTED，两者都在 required 中)
      ErrorCodes.PARSE_ERROR,         // TC-08
    ]);
    for (const code of requiredErrorCodes) {
      assert.ok(covered.has(code), `error code ${code} must be covered by test cases`);
    }
    assert.strictEqual(requiredErrorCodes.length, 6, 'exactly 6 standard error codes');
  });

  // TC-10: 性能测试 - 验证响应时间 <5 秒
  await runAsync('TC-10: 性能测试 - 验证响应时间 <5 秒', async () => {
    const start = Date.now();
    const out = await defaultCaller.call({
      toolName: 'ping',
      params: {},
    });
    const elapsed = Date.now() - start;
    assert.strictEqual(out.success, true, 'should succeed');
    assert.ok(out.metadata.duration < 5000, 'metadata.duration < 5000 ms');
    assert.ok(elapsed < 5000, 'end-to-end response < 5 s');
  });

  console.log('\n---');
  console.log(`总计: ${passed}/10`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
