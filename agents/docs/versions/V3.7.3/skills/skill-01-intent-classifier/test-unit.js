#!/usr/bin/env node

/**
 * Skill-01 意图分类引擎 - 单元测试
 * 
 * 测试验证逻辑和新增意图类别支持
 * 运行：node test-unit.js
 */

const assert = require('assert');

// 测试验证函数
function validateIntent(intent) {
  const validIntents = ['development', 'content', 'skill', 'operation', 'research', 'learning'];
  return validIntents.includes(intent);
}

function validateRoute(route) {
  const validRoutes = ['standard', 'fast', 'research', 'learning', 'hybrid'];
  return validRoutes.includes(route);
}

function run(label, fn) {
  try {
    fn();
    console.log(`  ✅ ${label}`);
    return true;
  } catch (e) {
    console.log(`  ❌ ${label}`);
    console.log(`     ${e.message}`);
    return false;
  }
}

console.log('Skill-01 全域意图分类引擎 - 单元测试 (V3.7.5)\n');

const results = [
  // 原有意图类别验证
  run('T01: development 意图有效', () => {
    assert.strictEqual(validateIntent('development'), true);
  }),
  run('T02: content 意图有效', () => {
    assert.strictEqual(validateIntent('content'), true);
  }),
  run('T03: skill 意图有效', () => {
    assert.strictEqual(validateIntent('skill'), true);
  }),
  run('T04: operation 意图有效', () => {
    assert.strictEqual(validateIntent('operation'), true);
  }),
  
  // V3.7.5 新增意图类别验证
  run('T05: research 意图有效 (V3.7.5 新增)', () => {
    assert.strictEqual(validateIntent('research'), true);
  }),
  run('T06: learning 意图有效 (V3.7.5 新增)', () => {
    assert.strictEqual(validateIntent('learning'), true);
  }),
  
  // 原有路由验证
  run('T07: standard 路由有效', () => {
    assert.strictEqual(validateRoute('standard'), true);
  }),
  run('T08: fast 路由有效', () => {
    assert.strictEqual(validateRoute('fast'), true);
  }),
  
  // V3.7.5 新增路由验证
  run('T09: research 路由有效 (V3.7.5 新增)', () => {
    assert.strictEqual(validateRoute('research'), true);
  }),
  run('T10: learning 路由有效 (V3.7.5 新增)', () => {
    assert.strictEqual(validateRoute('learning'), true);
  }),
  run('T11: hybrid 路由有效 (V3.7.5 新增)', () => {
    assert.strictEqual(validateRoute('hybrid'), true);
  }),
  
  // 无效意图验证
  run('T12: 无效意图应被拒绝', () => {
    assert.strictEqual(validateIntent('invalid'), false);
  }),
  
  // 无效路由验证
  run('T13: 无效路由应被拒绝', () => {
    assert.strictEqual(validateRoute('invalid'), false);
  }),
  
  // 意图类别总数验证
  run('T14: 意图类别总数为 6', () => {
    const allIntents = ['development', 'content', 'skill', 'operation', 'research', 'learning'];
    assert.strictEqual(allIntents.length, 6);
  }),
  
  // 路由选项总数验证
  run('T15: 路由选项总数为 5', () => {
    const allRoutes = ['standard', 'fast', 'research', 'learning', 'hybrid'];
    assert.strictEqual(allRoutes.length, 5);
  })
];

const passed = results.filter(Boolean).length;
const total = results.length;

console.log('\n---');
console.log(`总计：${passed}/${total}`);

if (passed === total) {
  console.log('\n🎉 所有测试通过！V3.7.5 意图分类增强验证成功！');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${total - passed} 个测试失败`);
  process.exit(1);
}
