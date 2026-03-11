/**
 * Skill-07 验收测试用例 (TC-01 ~ TC-08)
 * 使用 Node.js assert 模块，无外部测试框架
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { tester, AcceptanceError, ERRORS } = require('./index.js');

const SKILL_DIR = __dirname;

function runTest(name, fn) {
  return fn().then(() => ({ name, pass: true }), (err) => ({ name, pass: false, error: err }));
}

async function main() {
  const results = [];

  // TC-01: 全部 AC 通过 - 验证 overallStatus 为 pass
  results.push(await runTest('TC-01', async () => {
    const out = await tester.test({
      blueprint: {
        path: SKILL_DIR,
        acList: [
          { id: 'AC-1', description: 'AC one', verification: 'file: index.js' },
          { id: 'AC-2', description: 'AC two', verification: 'file: SKILL.md' },
          { id: 'AC-3', description: 'AC three', verification: 'deliverables present' },
        ],
      },
      deliverables: { codePaths: ['index.js'], docPaths: ['SKILL.md'] },
      executionResults: { selfReviewPassed: true },
    });
    assert.strictEqual(out.overallStatus, 'pass', 'overallStatus should be pass');
    assert.strictEqual(out.acResults.length, 3);
    assert.strictEqual(out.metadata.acFailed, 0);
    out.acResults.forEach((r) => assert.strictEqual(r.status, 'pass', `${r.acId} should be pass`));
  }));

  // TC-02: 单条 AC 失败 - 验证 overallStatus 为 fail
  results.push(await runTest('TC-02', async () => {
    const out = await tester.test({
      blueprint: {
        acList: [
          { id: 'AC-1', description: 'Pass', verification: 'file: index.js' },
          { id: 'AC-2', description: 'Fail', verification: 'file: non-existent-file-xyz.md' },
          { id: 'AC-3', description: 'Pass', verification: 'file: SKILL.md' },
        ],
      },
      deliverables: { codePaths: ['index.js'], docPaths: ['SKILL.md'] },
      executionResults: {},
    });
    assert.strictEqual(out.overallStatus, 'fail', 'overallStatus should be fail');
    const failed = out.acResults.filter((r) => r.status === 'fail');
    assert.ok(failed.length >= 1, 'at least one AC should fail');
    assert.strictEqual(out.metadata.acFailed, failed.length);
  }));

  // TC-03: AC 提取功能 - 验证从 blueprint.acList 正确提取
  results.push(await runTest('TC-03', async () => {
    const acList = [
      { id: 'AC-1', description: 'First', verification: 'check first' },
      { id: 'AC-2', description: 'Second', verification: 'check second' },
    ];
    const out = await tester.test({
      blueprint: { path: SKILL_DIR, acList },
      deliverables: { codePaths: ['index.js'], docPaths: [] },
      executionResults: { selfReviewPassed: true },
    });
    assert.strictEqual(out.acResults.length, 2);
    assert.strictEqual(out.acResults[0].acId, 'AC-1');
    assert.strictEqual(out.acResults[0].description, 'First');
    assert.strictEqual(out.acResults[1].acId, 'AC-2');
    assert.strictEqual(out.acResults[1].description, 'Second');
    assert.ok(out.report.includes('AC-1') && out.report.includes('AC-2'));
  }));

  // TC-04: 缺失 blueprint - 验证报错 ACCEPTANCE_INVALID_INPUT
  results.push(await runTest('TC-04', async () => {
    await assert.rejects(
      async () => {
        await tester.test({ deliverables: { codePaths: [] }, executionResults: {} });
      },
      (err) => {
        assert.ok(err instanceof AcceptanceError);
        assert.strictEqual(err.code, ERRORS.ACCEPTANCE_INVALID_INPUT);
        return true;
      }
    );
  }));

  // TC-05: 缺失 deliverables - 验证报错 ACCEPTANCE_INVALID_INPUT
  results.push(await runTest('TC-05', async () => {
    await assert.rejects(
      async () => {
        await tester.test({
          blueprint: { acList: [{ id: 'AC-1', description: 'D' }] },
          executionResults: {},
        });
      },
      (err) => {
        if (err instanceof AcceptanceError && err.code === ERRORS.ACCEPTANCE_INVALID_INPUT) return true;
        throw err;
      }
    );
  }));

  // TC-06: report 一致性 - 验证 report 包含 AC 统计信息
  results.push(await runTest('TC-06', async () => {
    const out = await tester.test({
      blueprint: {
        acList: [
          { id: 'AC-1', description: 'One' },
          { id: 'AC-2', description: 'Two' },
        ],
      },
      deliverables: { codePaths: ['index.js'], docPaths: [] },
      executionResults: { selfReviewPassed: true },
    });
    assert.strictEqual(out.acResults.length, 2);
    const report = out.report;
    assert.ok(report.includes(String(out.metadata.acTotal)), 'report should contain acTotal');
    assert.ok(report.includes(String(out.metadata.acPassed)), 'report should contain acPassed');
    assert.ok(report.includes(String(out.metadata.acFailed)), 'report should contain acFailed');
    out.acResults.forEach((r) => {
      assert.ok(report.includes(r.acId), `report should contain ${r.acId}`);
    });
  }));

  // TC-07: recommendations 生成 - 验证有失败 AC 时生成建议
  results.push(await runTest('TC-07', async () => {
    const out = await tester.test({
      blueprint: {
        acList: [
          { id: 'AC-1', description: 'Fail', verification: 'file: does-not-exist.xyz' },
        ],
      },
      deliverables: { codePaths: [], docPaths: [] },
      executionResults: {},
    });
    assert.strictEqual(out.overallStatus, 'fail');
    assert.ok(Array.isArray(out.recommendations), 'recommendations should be array');
    assert.ok(out.recommendations.length >= 1, 'should have at least one recommendation when AC fails');
  }));

  // TC-08: 性能测试 - 验证响应时间 <5 秒（连续 20 次调用）
  results.push(await runTest('TC-08', async () => {
    const limitMs = 5000;
    const iterations = 20;
    const input = {
      blueprint: {
        acList: [
          { id: 'AC-1', description: 'A' },
          { id: 'AC-2', description: 'B' },
          { id: 'AC-3', description: 'C' },
          { id: 'AC-4', description: 'D' },
          { id: 'AC-5', description: 'E' },
        ],
      },
      deliverables: { codePaths: ['index.js'], docPaths: ['SKILL.md'] },
      executionResults: { selfReviewPassed: true },
    };
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await tester.test(input);
      const elapsed = Date.now() - start;
      assert.ok(elapsed < limitMs, `iteration ${i + 1}: ${elapsed}ms should be < ${limitMs}ms`);
    }
  }));

  // 输出
  results.forEach((r) => {
    const tag = r.pass ? '[PASS]' : '[FAIL]';
    console.log(`${tag} ${r.name}${r.error ? ' - ' + r.error.message : ''}`);
  });
  const passed = results.filter((r) => r.pass).length;
  console.log('');
  console.log(`总计 (${passed}/8)`);
  process.exit(passed === 8 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
