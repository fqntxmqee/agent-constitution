/**
 * Skill-04 动态路由决策器 - 测试套件
 * 输入: skill01 / skill03 / userOverride
 * 输出: decision / reasoning / factors / matchedRules / timestamp
 * 运行: node test.js
 */

const assert = require('assert');
const {
  decider,
  RoutingDecider,
  ConfigLoader,
  ERROR_CODES,
} = require('./index.js');

const skillRoot = __dirname;

function runTest(id, name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${id}: ${name}`);
    return true;
  } catch (err) {
    console.log(`  [FAIL] ${id}: ${name}`);
    console.log(`         ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('Skill-04 Routing Decider — 测试开始\n');

  let passed = 0;
  const total = 10;

  // 1. 仅 skill01，意图 development
  passed += runTest('T01', '仅 skill01 意图 development', () => {
    const input = {
      skill01: { intent: 'development', confidence: 0.95 },
    };
    const result = decider.decideSync(input);
    assert.ok(result.decision, '应有 decision');
    assert.ok(['requirement-understanding', 'standard', 'fast'].includes(result.decision.routeTo));
    assert.strictEqual(result.decision.isOverride, false);
    assert.ok(Array.isArray(result.matchedRules));
    assert.ok(typeof result.timestamp === 'string');
    assert.ok(result.factors.every(f => f.name && f.value !== undefined && f.weight != null && 'matchedRule' in f));
  });

  // 2. skill01 + skill03，开发 + 高复杂度
  passed += runTest('T02', 'skill01+skill03 开发+高复杂度', () => {
    const input = {
      skill01: { intent: 'development', confidence: 0.9 },
      skill03: { taskType: 'feature', complexity: 'high', estimatedSteps: 8 },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.decision.routeTo, 'requirement-understanding');
    assert.strictEqual(result.decision.isOverride, false);
    assert.ok(result.matchedRules.length >= 1);
  });

  // 3. 用户覆盖有效
  passed += runTest('T03', '用户覆盖有效', () => {
    const input = {
      skill01: { intent: 'development', confidence: 0.9 },
      userOverride: { enabled: true, targetAgent: 'requirement-resolution' },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.decision.routeTo, 'requirement-resolution');
    assert.strictEqual(result.decision.isOverride, true);
    assert.ok(result.reasoning.includes('采纳用户指定'));
  });

  // 4. 用户覆盖无效（targetAgent 非法）
  passed += runTest('T04', '用户覆盖无效 targetAgent 非法', () => {
    const input = {
      skill01: { intent: 'development', confidence: 0.9 },
      userOverride: { enabled: true, targetAgent: 'invalid-agent' },
    };
    const result = decider.decideSync(input);
    assert.notStrictEqual(result.decision.routeTo, 'invalid-agent');
    assert.strictEqual(result.decision.isOverride, false);
  });

  // 5. 用户覆盖未启用
  passed += runTest('T05', '用户覆盖未启用', () => {
    const input = {
      skill01: { intent: 'content', confidence: 0.85 },
      userOverride: { enabled: false, targetAgent: 'requirement-resolution' },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.decision.isOverride, false);
  });

  // 6. 多规则按优先级命中第一条
  passed += runTest('T06', '多规则按优先级命中高优先级', () => {
    const input = {
      skill01: { intent: 'development', confidence: 0.9 },
      skill03: { complexity: 'high' },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.decision.routeTo, 'requirement-understanding');
    assert.ok(result.matchedRules.some(r => r === 'R-001' || r === 'R-002'));
  });

  // 7. AND 条件部分不满足
  passed += runTest('T07', 'AND 条件部分不满足', () => {
    const input = {
      skill01: { intent: 'development', confidence: 0.9 },
      skill03: { complexity: 'low' },
    };
    const result = decider.decideSync(input);
    assert.ok(result.decision.routeTo === 'requirement-understanding' || result.decision.routeTo === 'standard' || result.decision.routeTo === 'fast');
  });

  // 8. 运算符 in
  passed += runTest('T08', '运算符 in', () => {
    const input = {
      skill01: { intent: 'development', confidence: 0.9 },
      skill03: { complexity: 'medium' },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.decision.routeTo, 'requirement-understanding');
  });

  // 9. 运算符 lessThan
  passed += runTest('T09', '运算符 lessThan', () => {
    const input = {
      skill01: { intent: 'content', confidence: 0.9 },
      skill03: { estimatedSteps: 2 },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.decision.routeTo, 'requirement-resolution');
  });

  // 10. 无效输入 → ROUTING_INVALID_INPUT
  passed += runTest('T10', '无效输入抛出 ROUTING_INVALID_INPUT', () => {
    try {
      decider.decideSync({});
      assert.fail('应抛出验证错误');
    } catch (err) {
      assert.strictEqual(err.code, ERROR_CODES.ROUTING_INVALID_INPUT);
    }
    try {
      decider.decideSync({ skill01: {} });
      assert.fail('应抛出 skill01.intent 缺失');
    } catch (err) {
      assert.strictEqual(err.code, ERROR_CODES.ROUTING_INVALID_INPUT);
    }
  });

  console.log('\n----------------------------------------');
  console.log(`总计: ${passed}/${total}`);
  console.log(passed === total ? '全部通过.' : `失败: ${total - passed} 个用例`);
  process.exit(passed === total ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
