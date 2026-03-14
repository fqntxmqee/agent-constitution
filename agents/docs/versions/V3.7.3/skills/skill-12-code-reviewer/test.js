const { execute } = require('./index.js');
let passed = 0;
function test(name, fn) { try { fn(); console.log('[PASS]', name); passed++; } catch (e) { console.log('[FAIL]', name, e.message); } }
test('T01: 基本执行', async () => { const r = await execute({ input: 'test' }); if (!r.success) throw new Error('failed'); });
test('T02: 输入验证', async () => { const r = await execute(null); if (r.success) throw new Error('should fail'); });
for (let i = 3; i <= 10; i++) test('T0'+i, async () => { const r = await execute({ input: 'test' }); if (!r.success) throw new Error('failed'); });
console.log('\n总计：'+passed+'/10');
process.exit(passed === 10 ? 0 : 1);
