/**
 * Skill-03 跨域模糊性探测器 - 测试脚本
 * 10 个测试用例对应 SKILL.md 验收标准，使用 Node.js assert 模块，无外部测试框架。
 */

const assert = require('assert');
const { detector } = require('./index.js');

const ALLOWED_DOMAINS = ['technical', 'business', 'user_experience'];
const AMBIGUITY_TYPES = ['missing', 'ambiguous', 'conflicting', 'incomplete'];

function run(label, fn) {
  try {
    fn();
    console.log(`  [PASS] ${label}`);
    return true;
  } catch (e) {
    console.log(`  [FAIL] ${label}`);
    console.log(`         ${e.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// T01: 清晰输入检测 - 验证 isClear 为 true
// ---------------------------------------------------------------------------
function t01_clear_input() {
  const input = {
    userInput: '用 React + Node 做后台，部署到 K8s，数据用 MySQL 和自建 API，面向管理员和普通用户，首期 MVP 包含登录和仪表盘，验收标准是单元测试通过',
  };
  const out = detector.detect(input);
  assert.strictEqual(out.isClear, true, '清晰输入应返回 isClear === true');
  assert.ok(Array.isArray(out.ambiguities), 'ambiguities 应为数组');
  const hasBlocking = (out.ambiguities || []).some(
    (a) => a.severity === 'high' || a.severity === 'medium'
  );
  assert.strictEqual(hasBlocking, false, '清晰输入不应含 high/medium 模糊项');
}

// ---------------------------------------------------------------------------
// T02: 模糊输入检测 - 验证 isClear 为 false，ambiguities 非空
// ---------------------------------------------------------------------------
function t02_ambiguous_input() {
  const input = { userInput: '做一个内容运营平台' };
  const out = detector.detect(input);
  assert.strictEqual(out.isClear, false, '模糊输入应返回 isClear === false');
  assert.ok(Array.isArray(out.ambiguities) && out.ambiguities.length > 0, 'ambiguities 应非空');
}

// ---------------------------------------------------------------------------
// T03: missing 类型检测 - 验证缺失信息被正确识别
// ---------------------------------------------------------------------------
function t03_missing_type() {
  const input = { userInput: '做个后台，别的没说' };
  const out = detector.detect(input);
  const missingItems = (out.ambiguities || []).filter((a) => a.type === 'missing');
  assert.ok(missingItems.length >= 1, '应至少识别出一条 type=missing 的模糊项');
  missingItems.forEach((a) => {
    assert.ok(AMBIGUITY_TYPES.includes(a.type), `ambiguity.type 应为 missing/ambiguous/conflicting/incomplete，得到 ${a.type}`);
    assert.ok(['high', 'medium', 'low'].includes(a.severity), `ambiguity.severity 应为 high/medium/low，得到 ${a.severity}`);
    assert.strictEqual(typeof a.description, 'string', 'ambiguity.description 应为字符串');
    assert.strictEqual(typeof a.suggestion, 'string', 'ambiguity.suggestion 应为字符串');
  });
}

// ---------------------------------------------------------------------------
// T04: ambiguous 类型检测 - 验证歧义表述被正确识别
// ---------------------------------------------------------------------------
function t04_ambiguous_type() {
  const input = { userInput: '先做核心功能，别的你看着办' };
  const out = detector.detect(input);
  const ambiguousItems = (out.ambiguities || []).filter((a) => a.type === 'ambiguous');
  assert.ok(ambiguousItems.length >= 1, '应至少识别出一条 type=ambiguous 的模糊项');
  ambiguousItems.forEach((a) => {
    assert.strictEqual(a.type, 'ambiguous', 'type 应为 ambiguous');
    assert.ok(a.description && a.suggestion, '应有 description 与 suggestion');
  });
}

// ---------------------------------------------------------------------------
// T05: conflicting 类型检测 - 验证冲突信息被正确识别
// ---------------------------------------------------------------------------
function t05_conflicting_type() {
  const input = { userInput: '做一个纯前端页面，但要写后端 API 和接口' };
  const out = detector.detect(input);
  const conflictingItems = (out.ambiguities || []).filter((a) => a.type === 'conflicting');
  assert.ok(conflictingItems.length >= 1, '应至少识别出一条 type=conflicting 的模糊项');
  conflictingItems.forEach((a) => {
    assert.strictEqual(a.type, 'conflicting', 'type 应为 conflicting');
  });
}

// ---------------------------------------------------------------------------
// T06: incomplete 类型检测 - 验证不完整信息被正确识别
// ---------------------------------------------------------------------------
function t06_incomplete_type() {
  const input = { userInput: '用 React 做一个管理后台' };
  const out = detector.detect(input);
  const incompleteItems = (out.ambiguities || []).filter((a) => a.type === 'incomplete');
  assert.ok(incompleteItems.length >= 1, '应至少识别出一条 type=incomplete 的模糊项');
  incompleteItems.forEach((a) => {
    assert.strictEqual(a.type, 'incomplete', 'type 应为 incomplete');
  });
}

// ---------------------------------------------------------------------------
// T07: 跨域分析 - 验证 domains 包含 technical/business/user_experience（或为其子集）
// ---------------------------------------------------------------------------
function t07_domains() {
  const input = {
    userInput: '做一个内容运营平台，先做核心功能，技术栈你定',
  };
  const out = detector.detect(input);
  assert.ok(Array.isArray(out.domains), 'domains 应为数组');
  out.domains.forEach((d) => {
    assert.ok(
      ALLOWED_DOMAINS.includes(d),
      `domains 仅允许 technical/business/user_experience，得到 ${d}`
    );
  });
  (out.ambiguities || []).forEach((a) => {
    assert.ok(
      ALLOWED_DOMAINS.includes(a.domain),
      `ambiguity.domain 仅允许 technical/business/user_experience，得到 ${a.domain}`
    );
  });
  assert.ok(
    out.domains.length >= 1,
    '模糊输入应至少涉及一个领域'
  );
}

// ---------------------------------------------------------------------------
// T08: 澄清问题生成 - 验证 clarificationQuestions 非空（在存在模糊项时）
// ---------------------------------------------------------------------------
function t08_clarification_questions() {
  const input = { userInput: '做一个内容运营平台' };
  const out = detector.detect(input);
  assert.ok(Array.isArray(out.clarificationQuestions), 'clarificationQuestions 应为数组');
  assert.ok(
    out.ambiguities.length === 0 || out.clarificationQuestions.length >= 0,
    '有模糊项时允许有澄清问题（实现可能合并或去重）'
  );
  out.clarificationQuestions.forEach((q) => {
    assert.strictEqual(typeof q, 'string', '每个澄清问题应为字符串');
    assert.ok(q.length > 0, '澄清问题不应为空字符串');
  });
  if (out.ambiguities.length > 0) {
    assert.ok(
      out.clarificationQuestions.length >= 1,
      '存在模糊项时 clarificationQuestions 应非空'
    );
  }
}

// ---------------------------------------------------------------------------
// T09: 置信度评分 - 验证 confidence 在 0-1 范围内
// ---------------------------------------------------------------------------
function t09_confidence() {
  const cases = [
    '做一个内容运营平台',
    '用 React + Node 做后台，部署到 K8s，数据用 MySQL，首期 MVP 登录和仪表盘，验收单元测试通过',
    '查一下北京天气',
  ];
  cases.forEach((userInput) => {
    const out = detector.detect({ userInput });
    assert.strictEqual(typeof out.confidence, 'number', 'confidence 应为数字');
    assert.ok(out.confidence >= 0 && out.confidence <= 1, `confidence 应在 [0,1]，得到 ${out.confidence}`);
  });
}

// ---------------------------------------------------------------------------
// T10: 性能测试 - 验证响应时间 <500ms（连续 50 次调用）
// ---------------------------------------------------------------------------
function t10_performance() {
  const input = { userInput: '做一个内容运营平台，先做核心功能' };
  const iterations = 50;
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    detector.detect(input);
  }
  const end = process.hrtime.bigint();
  const totalMs = Number(end - start) / 1e6;
  const avgMs = totalMs / iterations;
  assert.ok(avgMs < 500, `50 次调用平均响应时间应 <500ms，实际平均 ${avgMs.toFixed(2)}ms`);
}

// ---------------------------------------------------------------------------
// 运行全部用例
// ---------------------------------------------------------------------------
function main() {
  console.log('Skill-03 跨域模糊性探测器 - 测试\n');

  const results = [
    run('T01: 清晰输入检测 - isClear 为 true', t01_clear_input),
    run('T02: 模糊输入检测 - isClear 为 false，ambiguities 非空', t02_ambiguous_input),
    run('T03: missing 类型检测', t03_missing_type),
    run('T04: ambiguous 类型检测', t04_ambiguous_type),
    run('T05: conflicting 类型检测', t05_conflicting_type),
    run('T06: incomplete 类型检测', t06_incomplete_type),
    run('T07: 跨域分析 - domains 含 technical/business/user_experience', t07_domains),
    run('T08: 澄清问题生成 - clarificationQuestions 非空', t08_clarification_questions),
    run('T09: 置信度评分 - confidence 在 0-1', t09_confidence),
    run('T10: 性能测试 - 50 次调用平均 <500ms', t10_performance),
  ];

  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log('\n---');
  console.log(`总计: ${passed}/${total}`);
  process.exit(passed === total ? 0 : 1);
}

main();
