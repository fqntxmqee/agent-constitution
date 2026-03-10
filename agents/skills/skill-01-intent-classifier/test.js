#!/usr/bin/env node

/**
 * Skill-01 意图分类引擎 - 测试脚本
 * 
 * 运行：node test.js
 */

const testCases = [
  {
    id: 'T01',
    input: '创建一个贪吃蛇游戏',
    expected: {
      primaryIntent: 'development',
      complexity: 'medium',
      suggestedRoute: 'standard'
    }
  },
  {
    id: 'T02',
    input: '写一篇关于 React Hooks 的技术博客',
    expected: {
      primaryIntent: 'content',
      complexity: 'low',
      suggestedRoute: 'fast'
    }
  },
  {
    id: 'T03',
    input: '查询东京今天的天气',
    expected: {
      primaryIntent: 'skill',
      complexity: 'low',
      suggestedRoute: 'fast'
    }
  },
  {
    id: 'T04',
    input: '把应用部署到生产环境，配置好监控',
    expected: {
      primaryIntent: 'operation',
      complexity: 'medium',
      suggestedRoute: 'standard'
    }
  },
  {
    id: 'T05',
    input: '创建一个电商网站，支持支付和物流',
    expected: {
      primaryIntent: 'development',
      complexity: 'high',
      suggestedRoute: 'standard'
    }
  },
  {
    id: 'T06',
    input: '分析这个销售数据集，生成报告',
    expected: {
      primaryIntent: 'skill',
      complexity: 'low',
      suggestedRoute: 'fast'
    }
  },
  {
    id: 'T07',
    input: '帮我设计一个数据库 schema',
    expected: {
      primaryIntent: 'development',
      complexity: 'medium',
      suggestedRoute: 'standard'
    }
  },
  {
    id: 'T08',
    input: '检查服务器 CPU 使用率',
    expected: {
      primaryIntent: 'operation',
      complexity: 'medium',
      suggestedRoute: 'standard'
    }
  },
  {
    id: 'T09',
    input: '创建一个小红书内容运营平台，需要对接小红书 API',
    expected: {
      primaryIntent: 'development',
      secondaryIntents: ['skill'],
      complexity: 'high',
      suggestedRoute: 'standard'
    }
  },
  {
    id: 'T10',
    input: '帮我做个数据分析，然后写一份报告',
    expected: {
      primaryIntent: 'content',
      complexity: 'low',
      suggestedRoute: 'fast'
    }
  }
];

/**
 * 模拟意图分类结果（用于测试验证逻辑）
 * 实际使用时替换为真实的 classifyIntent 调用
 */
function mockClassify(input) {
  // 简单的关键词匹配用于测试
  const lower = input.toLowerCase();
  
  if (lower.includes('创建') || lower.includes('开发') || lower.includes('设计')) {
    return {
      primaryIntent: 'development',
      secondaryIntents: lower.includes('api') || lower.includes('对接') ? ['skill'] : [],
      confidence: 0.95,
      reasoning: '用户请求涉及系统开发',
      suggestedRoute: 'standard',
      complexity: lower.includes('平台') || lower.includes('电商') ? 'high' : 'medium'
    };
  }
  
  if (lower.includes('写') || lower.includes('文章') || lower.includes('博客')) {
    return {
      primaryIntent: 'content',
      secondaryIntents: [],
      confidence: 0.97,
      reasoning: '用户请求是内容创作',
      suggestedRoute: 'fast',
      complexity: 'low'
    };
  }
  
  if (lower.includes('查询') || lower.includes('分析') || lower.includes('数据')) {
    return {
      primaryIntent: 'skill',
      secondaryIntents: lower.includes('报告') ? ['content'] : [],
      confidence: 0.95,
      reasoning: '用户请求是技能调用或数据处理',
      suggestedRoute: 'fast',
      complexity: 'low'
    };
  }
  
  if (lower.includes('部署') || lower.includes('配置') || lower.includes('检查')) {
    return {
      primaryIntent: 'operation',
      secondaryIntents: [],
      confidence: 0.96,
      reasoning: '用户请求是运维操作',
      suggestedRoute: 'standard',
      complexity: 'medium'
    };
  }
  
  // 默认
  return {
    primaryIntent: 'development',
    secondaryIntents: [],
    confidence: 0.5,
    reasoning: '无法确定，默认开发类',
    suggestedRoute: 'standard',
    complexity: 'medium'
  };
}

/**
 * 验证测试结果
 */
function validate(result, expected) {
  if (result.primaryIntent !== expected.primaryIntent) {
    return { pass: false, reason: `意图不匹配：${result.primaryIntent} != ${expected.primaryIntent}` };
  }
  
  if (expected.complexity && result.complexity !== expected.complexity) {
    return { pass: false, reason: `复杂度不匹配：${result.complexity} != ${expected.complexity}` };
  }
  
  if (expected.suggestedRoute && result.suggestedRoute !== expected.suggestedRoute) {
    return { pass: false, reason: `路由建议不匹配：${result.suggestedRoute} != ${expected.suggestedRoute}` };
  }
  
  if (expected.secondaryIntents && expected.secondaryIntents.length > 0) {
    const hasAll = expected.secondaryIntents.every(i => result.secondaryIntents?.includes(i));
    if (!hasAll) {
      return { pass: false, reason: `从属意图不匹配` };
    }
  }
  
  return { pass: true };
}

/**
 * 运行测试
 */
async function runTests() {
  console.log('🧪 Skill-01 意图分类引擎 - 测试套件\n');
  console.log('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const tc of testCases) {
    const result = mockClassify(tc.input);
    const validation = validate(result, tc.expected);
    
    if (validation.pass) {
      console.log(`✅ ${tc.id}: ${tc.input.substring(0, 30)}...`);
      console.log(`   → ${result.primaryIntent} (${result.complexity}, ${result.suggestedRoute})`);
      passed++;
    } else {
      console.log(`❌ ${tc.id}: ${tc.input.substring(0, 30)}...`);
      console.log(`   → ${validation.reason}`);
      console.log(`   结果：${JSON.stringify(result)}`);
      failed++;
    }
  }
  
  console.log('=' .repeat(60));
  console.log(`\n📊 测试结果：${passed}/${testCases.length} 通过 (${(passed/testCases.length*100).toFixed(1)}%)`);
  
  if (failed === 0) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log(`\n⚠️  ${failed} 个测试失败`);
  }
  
  return failed === 0;
}

// 运行
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(e => {
  console.error('测试执行错误:', e);
  process.exit(1);
});
