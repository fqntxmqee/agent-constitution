/**
 * Skill-06 Blueprint Converter - 测试套件
 * 使用 Node.js 内置 assert，无外部测试框架。
 * 运行: node test.js
 */

const assert = require('assert');
const { converter, errors } = require('./index.js');

const BLUEPRINT_INVALID_INPUT = errors.BLUEPRINT_INVALID_INPUT;
const BLUEPRINT_UNKNOWN_FORM = errors.BLUEPRINT_UNKNOWN_FORM;

const validRequirement = {
  summary: '实现用户登录与权限校验',
  path: 'openspec/changes/auth-module',
};

let passed = 0;
let failed = 0;

function run(id, description, fn) {
  const p = Promise.resolve().then(() => fn());
  return p
    .then(() => {
      console.log(`  [PASS] ${id}: ${description}`);
      passed++;
    })
    .catch((e) => {
      console.log(`  [FAIL] ${id}: ${description}`);
      console.log(`         ${e.message}`);
      failed++;
    });
}

async function main() {
  console.log('Skill-06 Blueprint Converter - 测试运行\n');

    // TC-01: OpenSpec 形态 - development 任务生成 OpenSpec 蓝图
  await run('TC-01', 'OpenSpec 形态 - 验证 development 任务生成 OpenSpec 蓝图', () => {
  const result = converter.convertSync({
    confirmedRequirement: validRequirement,
    taskType: 'development',
  });
  assert.strictEqual(result.success, true, '应成功');
  assert.strictEqual(result.blueprintForm, 'openspec', 'blueprintForm 应为 openspec');
  const files = result.documents.map((d) => d.file);
  assert.ok(files.includes('proposal.md'), '应含 proposal.md');
  assert.ok(files.includes('specs/requirements.md'), '应含 specs/requirements.md');
  assert.ok(files.includes('design.md'), '应含 design.md');
  assert.ok(files.includes('tasks.md'), '应含 tasks.md');
  assert.strictEqual(result.documents.length, 4, 'OpenSpec 应有 4 份文档');
});

  // TC-02: ContentOutline 形态 - content 任务生成内容大纲
  await run('TC-02', 'ContentOutline 形态 - 验证 content 任务生成内容大纲', () => {
  const result = converter.convertSync({
    confirmedRequirement: validRequirement,
    taskType: 'content',
  });
  assert.strictEqual(result.success, true, '应成功');
  assert.strictEqual(result.blueprintForm, 'content-outline', 'blueprintForm 应为 content-outline');
  const files = result.documents.map((d) => d.file);
  assert.ok(files.includes('outline.md'), '应含 outline.md');
  assert.ok(files.includes('style-guide.md'), '应含 style-guide.md');
  assert.ok(files.includes('milestones.md'), '应含 milestones.md');
  assert.strictEqual(result.documents.length, 3, '内容大纲应有 3 份文档');
});

  // TC-03: ExecutionPlan 形态 - skill 任务生成执行计划
  await run('TC-03', 'ExecutionPlan 形态 - 验证 skill 任务生成执行计划', () => {
  const result = converter.convertSync({
    confirmedRequirement: validRequirement,
    taskType: 'skill',
  });
  assert.strictEqual(result.success, true, '应成功');
  assert.strictEqual(result.blueprintForm, 'execution-plan', 'blueprintForm 应为 execution-plan');
  const files = result.documents.map((d) => d.file);
  assert.ok(files.includes('plan.md'), '应含 plan.md');
  assert.ok(files.includes('checklist.md'), '应含 checklist.md');
  assert.ok(files.includes('resources.md'), '应含 resources.md');
  assert.strictEqual(result.documents.length, 3, '执行计划应有 3 份文档');
});

  // TC-04: 缺失 taskType - 验证报错 BLUEPRINT_INVALID_INPUT
  await run('TC-04', '缺失 taskType - 验证报错 BLUEPRINT_INVALID_INPUT', () => {
  const result = converter.convertSync({
    confirmedRequirement: validRequirement,
    // taskType 缺失
  });
  assert.strictEqual(result.success, false, '应失败');
  assert.strictEqual(result.error.code, BLUEPRINT_INVALID_INPUT, '错误码应为 BLUEPRINT_INVALID_INPUT');
});

  // TC-05: 缺失 confirmedRequirement - 验证报错 BLUEPRINT_INVALID_INPUT
  await run('TC-05', '缺失 confirmedRequirement - 验证报错 BLUEPRINT_INVALID_INPUT', () => {
  const result = converter.convertSync({
    confirmedRequirement: undefined,
    taskType: 'development',
  });
  assert.strictEqual(result.success, false, '应失败');
  assert.strictEqual(result.error.code, BLUEPRINT_INVALID_INPUT, '错误码应为 BLUEPRINT_INVALID_INPUT');
});

  // TC-06: 非法 taskType - 验证报错 BLUEPRINT_UNKNOWN_FORM
  await run('TC-06', '非法 taskType - 验证报错 BLUEPRINT_UNKNOWN_FORM', () => {
  const result = converter.convertSync({
    confirmedRequirement: validRequirement,
    taskType: 'unknown',
  });
  assert.strictEqual(result.success, false, '应失败');
  assert.strictEqual(result.error.code, BLUEPRINT_UNKNOWN_FORM, '错误码应为 BLUEPRINT_UNKNOWN_FORM');
});

  // TC-07: 带 context 的 OpenSpec - 验证 context 传递正确
  await run('TC-07', '带 context 的 OpenSpec - 验证 context 传递正确', async () => {
  const result = await converter.convert({
    confirmedRequirement: validRequirement,
    taskType: 'development',
    context: {
      intentResult: 'development',
      routeTo: 'standard',
      clarificationAnswers: { scope: 'full' },
    },
  });
  assert.strictEqual(result.success, true, '应成功');
  assert.strictEqual(result.blueprintForm, 'openspec', '应为 OpenSpec');
  assert.ok(result._meta != null && result._meta.hasContext === true, '应包含 context 元信息');
});

  // TC-08: 不同复杂度 - 验证 low/medium/high 都通过
  await run('TC-08', '不同复杂度 - 验证 low/medium/high 都通过', () => {
  for (const complexity of ['low', 'medium', 'high']) {
    const result = converter.convertSync({
      confirmedRequirement: validRequirement,
      taskType: 'development',
      complexity,
    });
    assert.strictEqual(result.success, true, `complexity=${complexity} 应成功`);
    assert.strictEqual(result.blueprintForm, 'openspec', '应产出 OpenSpec');
  }
});

  // TC-09: outputPath 生成 - 验证路径格式正确
  await run('TC-09', 'outputPath 生成 - 验证路径格式正确', () => {
  // 有 path 时：基于 path，末尾带 /
  const withPath = converter.convertSync({
    confirmedRequirement: { summary: 'x', path: 'openspec/changes/my-project' },
    taskType: 'development',
  });
  assert.strictEqual(withPath.success, true, '有 path 时应成功');
  assert.ok(withPath.outputPath.endsWith('/'), 'outputPath 应以 / 结尾');
  assert.ok(withPath.outputPath.includes('my-project'), '应包含项目名');

  // 无 path 时：从 summary 推导，格式 openspec/changes/{项目名}/
  const noPath = converter.convertSync({
    confirmedRequirement: { summary: '用户登录功能' },
    taskType: 'development',
  });
  assert.strictEqual(noPath.success, true, '无 path 时应成功');
  assert.ok(noPath.outputPath.startsWith('openspec/changes/'), '应以 openspec/changes/ 开头');
  assert.ok(noPath.outputPath.endsWith('/'), '应以 / 结尾');
  assert.ok(noPath.outputPath.length > 'openspec/changes/'.length + 1, '应包含推导的项目名');
});

  // TC-10: 性能测试 - 验证响应时间 <1 秒（连续 100 次调用）
  await run('TC-10', '性能测试 - 验证响应时间 <1 秒（连续 100 次调用）', () => {
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    const result = converter.convertSync({
      confirmedRequirement: validRequirement,
      taskType: 'development',
    });
    assert.strictEqual(result.success, true, `第 ${i + 1} 次调用应成功`);
  }
  const elapsed = Date.now() - start;
  assert.ok(elapsed < 1000, `100 次调用应在 1 秒内完成，实际 ${elapsed}ms`);
});

  // 汇总
  console.log('\n---');
  console.log(`总计: ${passed}/10 通过`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
