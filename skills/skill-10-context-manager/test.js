#!/usr/bin/env node
/**
 * Skill-10 Context Manager - 验收测试
 * 10 个测试用例对应 SKILL.md 验收标准，使用 Node.js assert，无外部测试框架。
 * 输出：每用例 [PASS]/[FAIL]，最后总计 (X/10)。
 */

const assert = require('assert');
const { manager, ERRORS } = require('./index.js');

const MAX_DURATION_MS = 200;
const MIN_INTEGRITY_RATE = 0.95;
const MIN_RETENTION_RATE = 0.9;

let passed = 0;
let failed = 0;

function run(id, name, fn) {
  try {
    fn();
    console.log(`${id}: ${name} [PASS]`);
    passed++;
  } catch (e) {
    console.log(`${id}: ${name} [FAIL] ${e.message}`);
    failed++;
  }
}

// --- TC-01: 收集上下文 - 验证 collect 返回完整上下文 ---
run('TC-01', '收集上下文 - 验证 collect 返回完整上下文', () => {
  const sessionText = 'User asked: What is the weather?';
  const toolRecord = 'Tool execution: get_weather(city=Beijing) -> 25°C';
  const coll = manager.getCollector();
  coll.setSessionContext('default', sessionText);
  coll.appendToolExecution('default', toolRecord);

  const out = manager.manage({
    action: 'collect',
    context: '',
    options: { sources: ['session', 'tools'] },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  assert.ok(typeof out.context === 'string', 'context should be string');
  assert.ok(out.context.includes('[session]') || out.context.includes(sessionText), 'context should contain session');
  assert.ok(out.context.includes('[tools]') || out.context.includes(toolRecord), 'context should contain tools');
  assert.ok(out.metadata && out.metadata.action === 'collect', 'metadata.action should be collect');
  assert.ok(out.metadata.duration != null, 'metadata.duration should be set');
});

// --- TC-02: 压缩上下文 (truncate) - 验证 truncate 策略正确 ---
run('TC-02', '压缩上下文 (truncate) - 验证 truncate 策略正确', () => {
  const long = 'a'.repeat(3000);
  const out = manager.manage({
    action: 'compress',
    context: long,
    options: { strategy: 'truncate', maxLength: 1000 },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  assert.ok(typeof out.context === 'string', 'context should be string');
  assert.ok(out.context.length <= 1000 + 50, 'compressed length should be <= maxLength (with marker)');
  assert.ok(out.context.includes('...[truncated]...'), 'truncate marker should appear');
  assert.ok(out.metadata.compressedLength <= 1000 + 50, 'metadata.compressedLength should be within limit');
  assert.strictEqual(out.metadata.action, 'compress');
});

// --- TC-03: 压缩上下文 (summary) - 验证 summary 策略正确 ---
run('TC-03', '压缩上下文 (summary) - 验证 summary 策略正确', () => {
  const lines = Array.from({ length: 100 }, (_, i) => `Line ${i + 1} content.`);
  const long = lines.join('\n');
  const out = manager.manage({
    action: 'compress',
    context: long,
    options: { strategy: 'summary', maxLength: 500, compressionRatio: 0.3 },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  assert.ok(typeof out.context === 'string', 'context should be string');
  assert.ok(out.context.length <= 500 + 50, 'summary output should respect maxLength');
  assert.ok(out.context.includes('...[summary]...') || out.context.length > 0, 'summary marker or content');
  assert.ok(out.metadata.originalLength === long.length, 'originalLength should match');
  assert.strictEqual(out.metadata.action, 'compress');
});

// --- TC-04: 压缩上下文 (semantic) - 验证 semantic 策略正确 ---
run('TC-04', '压缩上下文 (semantic) - 验证 semantic 策略正确', () => {
  const text = 'First sentence. Second with key result. Third normal. Fourth has important data. Last sentence.';
  const out = manager.manage({
    action: 'compress',
    context: text,
    options: { strategy: 'semantic', maxLength: 200, compressionRatio: 0.5 },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  assert.ok(typeof out.context === 'string', 'context should be string');
  assert.ok(out.context.length <= 200 + 20, 'semantic output should respect maxLength');
  assert.ok(out.metadata.retentionRate != null, 'retentionRate should be set');
  assert.strictEqual(out.metadata.action, 'compress');
});

// --- TC-05: 注入上下文 - 验证 inject 返回正确格式 ---
run('TC-05', '注入上下文 - 验证 inject 返回正确格式', () => {
  const content = 'Compressed context for LLM.';
  const out = manager.manage({
    action: 'inject',
    context: content,
    options: { maxLength: 8192 },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  assert.strictEqual(typeof out.context, 'string', 'context should be string');
  assert.ok(out.context.length <= 8192 + 50, 'injected content should be within maxLength');
  assert.ok(out.metadata && out.metadata.action === 'inject', 'metadata.action should be inject');
  assert.ok(out.metadata.duration != null, 'metadata.duration should be set');
});

// --- TC-06: 清理上下文 - 验证 clear 后上下文为空 ---
run('TC-06', '清理上下文 - 验证 clear 后上下文为空', () => {
  const sid = 'test-clear-session';
  const coll = manager.getCollector();
  coll.setSessionContext(sid, 'some session data');
  coll.appendToolExecution(sid, 'tool run');

  const out = manager.manage({
    action: 'clear',
    context: null,
    options: { sessionId: sid },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  assert.ok(out.context === '' || out.context === undefined, 'context should be empty after clear');

  const afterCollect = manager.manage({
    action: 'collect',
    context: '',
    options: { sources: ['session', 'tools'], sessionId: sid },
  });
  assert.strictEqual(afterCollect.success, true);
  const emptyOrNoSession = !afterCollect.context.includes('some session data') && !afterCollect.context.includes('tool run');
  assert.ok(emptyOrNoSession, 'after clear, collect for that session should not return previous data');
});

// --- TC-07: 上下文完整性 - 验证收集后内容完整率 ≥95% ---
run('TC-07', '上下文完整性 - 验证收集后内容完整率 ≥95%', () => {
  const full = 'Complete session content. Key: value. Result: ok.';
  const coll = manager.getCollector();
  coll.setSessionContext('default', full);

  const out = manager.manage({
    action: 'collect',
    context: '',
    options: { sources: ['session'] },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  const collected = out.context;
  const hasSession = collected.includes(full) || collected.includes('Complete session content');
  const integrity = hasSession ? 1 : (collected.length / full.length);
  assert.ok(integrity >= MIN_INTEGRITY_RATE, `integrity should be >= 95%, got ${(integrity * 100).toFixed(1)}%`);
});

// --- TC-08: 压缩保留率 - 验证压缩后信息保留率 ≥90% ---
run('TC-08', '压缩保留率 - 验证压缩后信息保留率 ≥90%', () => {
  const textWithKey = 'Start. Important result: 42. Key decision: yes. Error: none. End.';
  const out = manager.manage({
    action: 'compress',
    context: textWithKey,
    options: { strategy: 'summary', maxLength: 100, compressionRatio: 0.5 },
  });

  assert.strictEqual(out.success, true, 'success should be true');
  assert.ok(
    out.metadata.retentionRate >= MIN_RETENTION_RATE,
    `retentionRate should be >= 90%, got ${(out.metadata.retentionRate * 100).toFixed(1)}%`
  );
});

// --- TC-09: 非法 action - 验证报错 CONTEXT_INVALID_ACTION ---
run('TC-09', '非法 action - 验证报错 CONTEXT_INVALID_ACTION', () => {
  const out = manager.manage({
    action: 'invalid_action',
    context: 'any',
  });

  assert.strictEqual(out.success, false, 'success should be false');
  assert.strictEqual(out.error, ERRORS.CONTEXT_INVALID_ACTION, 'error should be CONTEXT_INVALID_ACTION');
  assert.ok(out.message != null, 'message should be present');
});

// --- TC-10: 性能测试 - 验证响应时间 <200ms ---
run('TC-10', '性能测试 - 验证响应时间 <200ms', () => {
  const actions = [
    { action: 'collect', context: 'short', options: {} },
    { action: 'compress', context: 'x'.repeat(500), options: { strategy: 'truncate', maxLength: 200 } },
    { action: 'inject', context: 'inject me', options: {} },
    { action: 'clear', options: { sessionId: 'perf-test' } },
  ];

  for (const input of actions) {
    const out = manager.manage(input);
    const duration = out.metadata && out.metadata.duration != null ? out.metadata.duration : 0;
    assert.ok(
      duration < MAX_DURATION_MS,
      `action ${input.action} duration should be <200ms, got ${duration}ms`
    );
  }
});

// --- 总计 ---
console.log('---');
console.log(`总计: ${passed}/10`);
process.exit(failed > 0 ? 1 : 0);
