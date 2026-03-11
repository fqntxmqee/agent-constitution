/**
 * Skill-05 需求理解 - 测试套件
 * 8 个测试用例对应 SKILL.md 验收标准，使用 Node.js assert，无外部测试框架。
 */

const assert = require('assert');
const { understanding, errors } = require('./index.js');

const UNDERSTANDING_INVALID_INPUT = errors.UNDERSTANDING_INVALID_INPUT;

async function runTests() {
  let passed = 0;
  const total = 8;

  // --- TC-01: 正常执行成功 - 验证 status 为 success ---
  try {
    const out = await understanding.understand({
      confirmedProposal: {
        summary: '新增用户登录模块',
        intent: 'development',
        scope: '前端登录页与后端鉴权',
      },
    });
    assert.strictEqual(out.status, 'success', 'TC-01: status 应为 success');
    assert.ok(out.blueprint, 'TC-01: 应有 blueprint');
    assert.ok(out.specDelta, 'TC-01: 应有 specDelta');
    assert.ok(out.validationReport, 'TC-01: 应有 validationReport');
    assert.ok(out.timestamp, 'TC-01: 应有 timestamp');
    console.log('[PASS] TC-01: 正常执行成功');
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-01: 正常执行成功 -', e.message);
  }

  // --- TC-02: 带 context 和 options - 验证 context/options 传递正确 ---
  try {
    const out = await understanding.understand({
      confirmedProposal: { summary: '内容大纲需求', intent: 'content' },
      context: {
        projectName: 'my-content-project',
        intentResult: 'content',
        mainSpecPath: __dirname,
      },
      options: {
        blueprintForm: 'content-outline',
        outputPath: 'openspec/changes/my-content-project/',
        strictValidation: true,
      },
    });
    assert.strictEqual(out.status, 'success', 'TC-02: status 应为 success');
    assert.strictEqual(out.blueprint.form, 'content-outline', 'TC-02: blueprintForm 应为 content-outline');
    assert.ok(
      out.blueprint.outputPath.includes('my-content-project') || out.blueprint.outputPath.includes('changes'),
      'TC-02: outputPath 应体现 options'
    );
    console.log('[PASS] TC-02: 带 context 和 options');
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-02: 带 context 和 options -', e.message);
  }

  // --- TC-03: 不同 blueprintForm - 验证 openspec/content/skill 形态正确 ---
  try {
    const openspecOut = await understanding.understand({
      confirmedProposal: { summary: '开发需求', intent: 'development' },
      options: { blueprintForm: 'openspec' },
    });
    const contentOut = await understanding.understand({
      confirmedProposal: { summary: '内容需求', intent: 'content' },
      options: { blueprintForm: 'content-outline' },
    });
    const skillOut = await understanding.understand({
      confirmedProposal: { summary: '技能需求', intent: 'skill' },
      options: { blueprintForm: 'execution-plan' },
    });
    assert.strictEqual(openspecOut.blueprint.form, 'openspec', 'TC-03: openspec 形态');
    assert.ok(
      (openspecOut.blueprint.documents || []).some((d) => d.file && d.file.includes('proposal')),
      'TC-03: openspec 应有 proposal'
    );
    assert.strictEqual(contentOut.blueprint.form, 'content-outline', 'TC-03: content-outline 形态');
    assert.strictEqual(skillOut.blueprint.form, 'execution-plan', 'TC-03: execution-plan 形态');
    console.log('[PASS] TC-03: 不同 blueprintForm');
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-03: 不同 blueprintForm -', e.message);
  }

  // --- TC-04: 缺失 confirmedProposal - 验证报错 UNDERSTANDING_INVALID_INPUT ---
  try {
    const out = await understanding.understand({ context: {}, options: {} });
    assert.strictEqual(out.status, 'error', 'TC-04: 应返回 status=error');
    assert.strictEqual(out.error && out.error.code, UNDERSTANDING_INVALID_INPUT, 'TC-04: 应为 UNDERSTANDING_INVALID_INPUT');
    console.log('[PASS] TC-04: 缺失 confirmedProposal');
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-04: 缺失 confirmedProposal -', e.message);
  }

  // --- TC-05: 格式验证通过 - 验证 validationReport.formatValid 为 true ---
  try {
    const out = await understanding.understand({
      confirmedProposal: {
        summary: '完整开发需求',
        intent: 'development',
        scope: '测试',
      },
    });
    assert.strictEqual(out.status, 'success', 'TC-05: 应成功');
    assert.strictEqual(out.validationReport.formatValid, true, 'TC-05: formatValid 应为 true');
    assert.ok(Array.isArray(out.validationReport.checks), 'TC-05: checks 应为数组');
    console.log('[PASS] TC-05: 格式验证通过');
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-05: 格式验证通过 -', e.message);
  }

  // --- TC-06: specDelta 生成 - 验证 specDelta 包含 added/modified/impactAnalysis ---
  try {
    const out = await understanding.understand({
      confirmedProposal: { summary: 'Delta 测试', intent: 'development', scope: '范围' },
    });
    assert.strictEqual(out.status, 'success', 'TC-06: 应成功');
    assert.ok(Array.isArray(out.specDelta.added), 'TC-06: specDelta.added 应为数组');
    assert.ok(Array.isArray(out.specDelta.modified), 'TC-06: specDelta.modified 应为数组');
    assert.ok(
      typeof out.specDelta.impactAnalysis === 'string' || out.specDelta.impactScope !== undefined,
      'TC-06: 应有 impactAnalysis 或 impactScope'
    );
    assert.ok(out.specDelta.added.length >= 1, 'TC-06: added 至少一项');
    console.log('[PASS] TC-06: specDelta 生成');
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-06: specDelta 生成 -', e.message);
  }

  // --- TC-07: AC 可验证 - 验证 blueprint.acList 非空且可验证 ---
  try {
    const out = await understanding.understand({
      confirmedProposal: {
        summary: 'AC 测试',
        intent: 'development',
        goals: ['接口返回 200', '字数 ≥ 500'],
      },
    });
    assert.strictEqual(out.status, 'success', 'TC-07: 应成功');
    const acList = out.blueprint.acList || out.blueprint.AC || [];
    assert.ok(acList.length > 0, 'TC-07: acList 非空');
    const allVerifiable = acList.every((ac) => ac.verifiable === true);
    assert.ok(allVerifiable, 'TC-07: 每条 AC 应 verifiable 为 true');
    const hasDescription = acList.every((ac) => ac.description && ac.description.length > 0);
    assert.ok(hasDescription, 'TC-07: 每条 AC 应有 description');
    console.log('[PASS] TC-07: AC 可验证');
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-07: AC 可验证 -', e.message);
  }

  // --- TC-08: 性能测试 - 验证响应时间 <2 秒（连续 20 次调用）---
  try {
    const rounds = 20;
    const maxAllowedMs = 2000;
    let maxElapsed = 0;
    const startTotal = Date.now();
    for (let i = 0; i < rounds; i++) {
      const t0 = Date.now();
      await understanding.understand({
        confirmedProposal: { summary: `Perf test ${i}`, intent: 'development' },
      });
      const elapsed = Date.now() - t0;
      if (elapsed > maxElapsed) maxElapsed = elapsed;
    }
    const totalMs = Date.now() - startTotal;
    assert.ok(maxElapsed < maxAllowedMs, `TC-08: 单次响应应 <2s，实际最大 ${maxElapsed}ms`);
    console.log(`[PASS] TC-08: 性能测试 (20 次, 总 ${totalMs}ms, 单次最大 ${maxElapsed}ms)`);
    passed++;
  } catch (e) {
    console.log('[FAIL] TC-08: 性能测试 -', e.message);
  }

  console.log('');
  console.log(`总计 (${passed}/${total})`);
  process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
