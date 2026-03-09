/**
 * Skill-04 动态路由决策器 - 测试套件
 * 使用 Node.js assert，无外部测试框架
 * 运行: node test.js
 */

const assert = require('assert');
const path = require('path');
const {
  decider,
  RoutingDecider,
  loadRoutingRules,
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

  // T01: 开发任务路由 - development 意图 → standard
  passed += runTest('T01', '开发任务路由 - 验证 development 意图路由到 standard', () => {
    const input = {
      user_input: '帮我开发一个登录模块',
      intentResult: {
        primaryIntent: 'development',
        confidence: 0.9,
        complexity: 'high',
      },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.routeTo, 'standard', 'development 应路由到 standard');
    assert.strictEqual(result.userOverrideApplied, false);
  });

  // T02: 简单查询路由 - simple/content 类意图 → fast
  passed += runTest('T02', '简单查询路由 - 验证 simple 意图路由到 fast', () => {
    const input = {
      user_input: '查一下文档',
      intentResult: {
        primaryIntent: 'content',
        suggestedRoute: 'fast',
        complexity: 'low',
      },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.routeTo, 'fast', 'content/simple 类意图应路由到 fast');
    assert.strictEqual(result.userOverrideApplied, false);
  });

  // T03: 用户覆盖功能 - 用户指定路由优先
  passed += runTest('T03', '用户覆盖功能 - 验证用户指定路由优先', () => {
    const input = {
      user_input: '开发一个功能',
      intentResult: { primaryIntent: 'development', complexity: 'high' },
      userOverride: { route: 'fast', reason: '我想走快速流' },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.routeTo, 'fast', '应采纳用户指定的 fast');
    assert.strictEqual(result.userOverrideApplied, true, 'userOverrideApplied 应为 true');
    assert.ok(
      result.reasoning && result.reasoning.includes('采纳用户指定'),
      'reasoning 应包含采纳用户指定'
    );
  });

  // T04: 多条件匹配 - AND 逻辑（意图 + 复杂度均指向 standard）
  passed += runTest('T04', '多条件匹配 - 验证 AND 逻辑正确', () => {
    const input = {
      user_input: '做一个复杂需求',
      intentResult: { primaryIntent: 'development', complexity: 'high' },
      taskOrAmbiguityResult: { isClear: false },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.routeTo, 'standard');
    assert.ok(Array.isArray(result.factors) && result.factors.length >= 2,
      'factors 应包含多个决策因子');
  });

  // T05: 优先级处理 - 高优先级规则优先匹配
  passed += runTest('T05', '优先级处理 - 验证高优先级规则优先匹配', () => {
    const input = {
      user_input: '开发需求',
      intentResult: {
        primaryIntent: 'development',
        complexity: 'low',
        suggestedRoute: 'fast',
      },
    };
    const result = decider.decideSync(input);
    assert.strictEqual(result.routeTo, 'standard',
      'development(priority 1) 应优先于 suggestedRoute fast(priority 5)');
  });

  // T06: 默认路由 - 无匹配时返回 defaultRoute
  passed += runTest('T06', '默认路由 - 验证无匹配时返回 defaultRoute', () => {
    const input = {
      user_input: '随便说一句',
      intentResult: {
        primaryIntent: 'other_unknown',
        complexity: 'low',
        suggestedRoute: null,
      },
    };
    const result = decider.decideSync(input);
    assert.ok(['standard', 'fast'].includes(result.routeTo), 'routeTo 应为合法路由');
    assert.strictEqual(result.routeTo, 'standard',
      '无规则匹配时应使用 defaultRoute standard');
  });

  // T07: 无效输入检测 - 缺失必填字段时报错
  passed += runTest('T07', '无效输入检测 - 验证缺失必填字段时报错', () => {
    const missingUserInput = { intentResult: {} };
    const missingIntent = { user_input: 'hello' };
    try {
      decider.decideSync(missingUserInput);
      assert.fail('应抛出缺失 user_input 的验证错误');
    } catch (err) {
      assert.strictEqual(err.code, 'INPUT_VALIDATION_FAILED');
      assert.ok(err.details && err.details.some(d => d.includes('user_input') || d.includes('USER_INPUT')));
    }
    try {
      decider.decideSync(missingIntent);
      assert.fail('应抛出缺失 intentResult 的验证错误');
    } catch (err) {
      assert.strictEqual(err.code, 'INPUT_VALIDATION_FAILED');
      assert.ok(err.details && err.details.some(d => d.includes('intentResult') || d.includes('INTENT')));
    }
  });

  // T08: 配置加载验证 - JSON 配置正确解析
  passed += runTest('T08', '配置加载验证 - 验证 JSON 配置正确解析', () => {
    const config = loadRoutingRules(skillRoot);
    assert.ok(config && typeof config === 'object');
    assert.ok(Array.isArray(config.rules), 'config.rules 应为数组');
    assert.ok(['standard', 'fast'].includes(config.defaultRoute),
      'defaultRoute 应为 standard 或 fast');
    const withIntent = config.rules.find(r =>
      r.condition && r.condition.field === 'intentResult.primaryIntent' && r.then && r.then.routeTo
    );
    assert.ok(withIntent, '应存在基于 primaryIntent 的规则');
  });

  // T09: 决策理由生成 - reasoning 和 factors 完整
  passed += runTest('T09', '决策理由生成 - 验证 reasoning 和 factors 完整', () => {
    const input = {
      user_input: '开发登录',
      intentResult: { primaryIntent: 'development', complexity: 'high' },
    };
    const result = decider.decideSync(input);
    assert.ok(typeof result.reasoning === 'string' && result.reasoning.length > 0,
      'reasoning 应为非空字符串');
    assert.ok(Array.isArray(result.factors), 'factors 应为数组');
    for (const f of result.factors) {
      assert.ok(f.name != null, 'factor 应有 name');
      assert.ok(f.value !== undefined, 'factor 应有 value');
      assert.ok(f.weight != null, 'factor 应有 weight');
      assert.ok(f.effect != null, 'factor 应有 effect');
    }
  });

  // T10: 性能测试 - 响应时间 <1 秒
  passed += runTest('T10', '性能测试 - 验证响应时间 <1 秒', () => {
    const input = {
      user_input: '测试性能',
      intentResult: { primaryIntent: 'development', complexity: 'medium' },
    };
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      decider.decideSync(input);
    }
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 1000, `100 次 decideSync 应在 1 秒内完成，实际 ${elapsed}ms`);
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
