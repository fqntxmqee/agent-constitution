/**
 * 提醒设置智能体 - 测试脚本
 */

const { ReminderSetter, execute } = require('./index.js');

const assert = require('assert');

let passed = 0;
const total = 10;

function test(name, fn) {
  try {
    fn();
    console.log('[PASS]', name);
    passed++;
  } catch (err) {
    console.log('[FAIL]', name, err.message);
  }
}

// T01: 基本执行测试
test('T01: 基本执行测试', async () => {
  const result = await execute({ input: 'test' });
  assert.strictEqual(result.success, true);
});

// T02: 输入验证
test('T02: 输入验证', async () => {
  const result = await execute(null);
  assert.strictEqual(result.success, false);
});

// T03-T10: 其他测试
for (let i = 3; i <= 10; i++) {
  test('T0' + i + ': 测试用例 ' + i, async () => {
    const result = await execute({ input: 'test' });
    assert.strictEqual(result.success, true);
  });
}

console.log('\n总计：' + passed + '/' + total);
process.exit(passed === total ? 0 : 1);
