/**
 * Skill-A02: 合规检查器 - 单元测试套件
 * 测试覆盖率目标：100%
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const complianceChecker = require('./index.js');

let testCount = 0, passCount = 0, failCount = 0;

function assert(condition, message) { testCount++; if (condition) { passCount++; console.log(`  ✅ ${message}`); } else { failCount++; console.error(`  ❌ ${message}`); } }
function assertEqual(actual, expected, message) { assert(actual === expected, `${message}: ${actual} === ${expected}`); }
function assertTrue(value, message) { assert(value === true, `${message}`); }
function assertFalse(value, message) { assert(value === false, `${message}`); }

const TEST_DIR = path.join(os.tmpdir(), 'compliance-test-' + Date.now());
const TEST_SPEC_DIR = path.join(TEST_DIR, 'spec');

function setupTestDir() {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
  if (!fs.existsSync(TEST_SPEC_DIR)) fs.mkdirSync(TEST_SPEC_DIR, { recursive: true });
}

function cleanupTestDir() { if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true, force: true }); }

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function createJsonlFile(filePath, events) {
  return createFile(filePath, events.map(e => JSON.stringify(e)).join('\n'));
}

function createValidSpec() {
  createFile(path.join(TEST_SPEC_DIR, 'proposal.md'), '# 测试项目\n\n## 用户确认\n- [x] 意图确认\n- [x] 蓝图确认\n- [x] 部署确认\n- [x] 上线确认\n');
  createFile(path.join(TEST_SPEC_DIR, 'design.md'), '# 技术设计\n\n## 确认\n用户已确认。\n');
  createFile(path.join(TEST_SPEC_DIR, 'tasks.md'), '# 任务清单\n\n## Task-001: 初始化\n\n## Task-002: 开发\n\n## Task-003: 测试\n');
}

(async () => {

console.log('\n🧪 Skill-A02 合规检查器 - 单元测试\n');

// 1. 常量导出测试
console.log('1️⃣ 常量导出测试');
assert(Array.isArray(complianceChecker.DEFAULT_RULES), 'DEFAULT_RULES 应为数组');
assertEqual(complianceChecker.DEFAULT_RULES.length, 6, '默认应有 6 条规则');
assert(Array.isArray(complianceChecker.ALLOWED_WRITE_PATTERNS), 'ALLOWED_WRITE_PATTERNS 应为数组');
assert(Array.isArray(complianceChecker.BUSINESS_CODE_PATTERNS), 'BUSINESS_CODE_PATTERNS 应为数组');

// 2. getDefaultRules 测试
console.log('\n2️⃣ getDefaultRules 测试');
const rules = complianceChecker.getDefaultRules();
assert(Array.isArray(rules), '应返回数组');
assertEqual(rules.length, 6, '应返回 6 条规则');

// 3. checkPath 测试
console.log('\n3️⃣ checkPath 测试');
assertTrue(complianceChecker.checkPath('/src/main.js').isBusinessCode, '/src/main.js 应为业务代码');
assertFalse(complianceChecker.checkPath('/README.md').isBusinessCode, '/README.md 不应为业务代码');
assertTrue(complianceChecker.checkPath('/app.py').isBusinessCode, '/app.py 应为业务代码');

// 4. checkRuntime 测试 - 无违规
console.log('\n4️⃣ checkRuntime 测试 - 无违规');
setupTestDir();
const validEvents = [{ tool: 'sessions_spawn', runtime: 'acp', task: '开发功能', timestamp: 1000 }];
const runtimeResult = complianceChecker.checkRuntime(validEvents, complianceChecker.DEFAULT_RULES);
assertTrue(runtimeResult.passed, '使用 acp 应通过');
assertEqual(runtimeResult.violations.length, 0, '应无违规');

// 5. checkRuntime 测试 - 有违规
console.log('\n5️⃣ checkRuntime 测试 - 有违规');
const invalidEvents = [{ tool: 'sessions_spawn', runtime: 'subagent', task: '开发功能', timestamp: 1000 }];
const invalidRuntimeResult = complianceChecker.checkRuntime(invalidEvents, complianceChecker.DEFAULT_RULES);
assertFalse(invalidRuntimeResult.passed, '使用 subagent 应不通过');
assertEqual(invalidRuntimeResult.violations.length, 1, '应有 1 个违规');
assertEqual(invalidRuntimeResult.violations[0].ruleId, 'R001', '违规 ID 应为 R001');

// 6. checkToolUsage 测试 - 无违规
console.log('\n6️⃣ checkToolUsage 测试 - 无违规');
const validToolEvents = [{ tool: 'write', path: '/test.md', content: 'doc', timestamp: 1000 }];
const toolResult = complianceChecker.checkToolUsage(validToolEvents, complianceChecker.DEFAULT_RULES);
assertTrue(toolResult.passed, '写文档应通过');
assertEqual(toolResult.violations.length, 0, '应无违规');

// 7. checkToolUsage 测试 - 有违规
console.log('\n7️⃣ checkToolUsage 测试 - 有违规');
const invalidToolEvents = [{ tool: 'write', path: '/src/main.js', content: 'code', timestamp: 1000 }];
const invalidToolResult = complianceChecker.checkToolUsage(invalidToolEvents, complianceChecker.DEFAULT_RULES);
assertFalse(invalidToolResult.passed, '写业务代码应不通过');
assertEqual(invalidToolResult.violations.length, 1, '应有 1 个违规');
assertEqual(invalidToolResult.violations[0].ruleId, 'R002', '违规 ID 应为 R002');

// 8. checkTaskOrder 测试 - 顺序正确
console.log('\n8️⃣ checkTaskOrder 测试 - 顺序正确');
createValidSpec();
const correctEvents = [{ task: 'Task-001', timestamp: 1000 }, { task: 'Task-002', timestamp: 2000 }, { task: 'Task-003', timestamp: 3000 }];
const taskOrderResult = complianceChecker.checkTaskOrder(TEST_SPEC_DIR, correctEvents, complianceChecker.DEFAULT_RULES);
assertTrue(taskOrderResult.passed, '顺序正确应通过');
assertEqual(taskOrderResult.expected.length, 3, '应解析 3 个预期任务');

// 9. checkTaskOrder 测试 - 顺序错误
console.log('\n9️⃣ checkTaskOrder 测试 - 顺序错误');
const wrongEvents = [{ task: 'Task-001', timestamp: 1000 }, { task: 'Task-003', timestamp: 2000 }, { task: 'Task-002', timestamp: 3000 }];
const wrongTaskOrderResult = complianceChecker.checkTaskOrder(TEST_SPEC_DIR, wrongEvents, complianceChecker.DEFAULT_RULES);
assertFalse(wrongTaskOrderResult.passed, '顺序错误应不通过');
assertEqual(wrongTaskOrderResult.violations.length, 1, '应有 1 个违规');

// 10. checkUserConfirmation 测试 - 已确认
console.log('\n🔟 checkUserConfirmation 测试 - 已确认');
const confirmResult = complianceChecker.checkUserConfirmation(TEST_SPEC_DIR, [], complianceChecker.DEFAULT_RULES);
assertTrue(confirmResult.intentConfirmed, '意图应已确认');
assertTrue(confirmResult.blueprintConfirmed, '蓝图应已确认');
assertTrue(confirmResult.deploymentConfirmed, '部署应已确认');

// 11. checkUserConfirmation 测试 - 未确认
console.log('\n1️⃣1️⃣ checkUserConfirmation 测试 - 未确认');
const emptySpecDir = path.join(TEST_DIR, 'empty-spec');
fs.mkdirSync(emptySpecDir, { recursive: true });
const noConfirmResult = complianceChecker.checkUserConfirmation(emptySpecDir, [], complianceChecker.DEFAULT_RULES);
assertFalse(noConfirmResult.intentConfirmed, '意图应未确认');
assertFalse(noConfirmResult.blueprintConfirmed, '蓝图应未确认');
assertEqual(noConfirmResult.violations.length, 3, '应有 3 个违规');

// 12. check 完整测试 - 通过
console.log('\n1️⃣2️⃣ check 完整测试 - 通过');
const validCheckLogPath = createJsonlFile(path.join(TEST_DIR, 'valid-check.jsonl'), [
  { tool: 'sessions_spawn', runtime: 'acp', task: '开发', timestamp: 1000 },
  { tool: 'write', path: '/test.md', content: 'doc', timestamp: 2000 }
]);
const validCheckResult = await complianceChecker.check({
  target: { sessionLogs: [validCheckLogPath], specPath: TEST_SPEC_DIR },
  config: { doCheckRuntime: true, doCheckToolUsage: true, doCheckTaskOrder: true, doCheckUserConfirmation: true }
});
assert(validCheckResult.result.score >= 80, `得分应 >= 80，实际：${validCheckResult.result.score}`);
assertEqual(validCheckResult.meta.rulesApplied, 6, '应应用 6 条规则');

// 13. check 完整测试 - 不通过
console.log('\n1️⃣3️⃣ check 完整测试 - 不通过');
const invalidCheckLogPath = createJsonlFile(path.join(TEST_DIR, 'invalid-check.jsonl'), [
  { tool: 'sessions_spawn', runtime: 'subagent', task: '开发', timestamp: 1000 },
  { tool: 'write', path: '/src/main.js', content: 'code', timestamp: 2000 }
]);
const invalidCheckResult = await complianceChecker.check({
  target: { sessionLogs: [invalidCheckLogPath], specPath: emptySpecDir },
  config: { checkRuntime: true, doCheckToolUsage: true, doCheckTaskOrder: false, checkUserConfirmation: true }
});
assertFalse(invalidCheckResult.result.passed, '有严重违规应不通过');
assert(invalidCheckResult.violations.length >= 3, `应有至少 3 个违规，实际：${invalidCheckResult.violations.length}`);

// 14. 结果结构测试
console.log('\n1️⃣4️⃣ 结果结构测试');
const requiredFields = ['meta', 'result', 'checks', 'violations', 'recommendations'];
for (const field of requiredFields) { assert(validCheckResult[field] !== undefined, `应包含 ${field} 字段`); }
assert(typeof validCheckResult.result.passed === 'boolean', 'result.passed 应为布尔值');
assert(typeof validCheckResult.result.score === 'number', 'result.score 应为数字');

// 15. 违规字段测试
console.log('\n1️⃣5️⃣ 违规字段测试');
if (invalidCheckResult.violations.length > 0) {
  const v = invalidCheckResult.violations[0];
  assert(v.ruleId !== undefined, '应包含 ruleId');
  assert(['严重', '一般', '轻微'].includes(v.level), '违规等级应有效');
  assert(v.suggestion !== undefined, '应包含 suggestion');
}

// 16. 整改建议测试
console.log('\n1️⃣6️⃣ 整改建议测试');
assert(Array.isArray(invalidCheckResult.recommendations), 'recommendations 应为数组');
if (invalidCheckResult.recommendations.length > 0) {
  const rec = invalidCheckResult.recommendations[0];
  assert(['high', 'medium', 'low'].includes(rec.priority), '优先级应有效');
  assert(typeof rec.deadline === 'string', '期限应为字符串');
}

// 17. 配置选项测试
console.log('\n1️⃣7️⃣ 配置选项测试');
const noRuntimeCheckResult = await complianceChecker.check({
  target: { sessionLogs: [invalidCheckLogPath], specPath: emptySpecDir },
  config: { doCheckRuntime: false, doCheckToolUsage: true, doCheckTaskOrder: false, doCheckUserConfirmation: false }
});
assert(noRuntimeCheckResult.checks.runtime === undefined, '禁用 runtime 检查应不包含 runtime 结果');

// 18. 自定义规则测试
console.log('\n1️⃣8️⃣ 自定义规则测试');
const customRules = [{ id: 'C001', name: '自定义规则', description: '测试', level: '一般', suggestion: '修复' }];
const customCheckResult = await complianceChecker.check({
  target: { sessionLogs: [validCheckLogPath], specPath: TEST_SPEC_DIR },
  config: { customRules }
});
assertEqual(customCheckResult.meta.rulesApplied, 7, '应应用 7 条规则');

// 19. 得分计算测试
console.log('\n1️⃣9️⃣ 得分计算测试');
assertEqual(validCheckResult.result.score, 100, '无违规定应得 100 分');
assert(invalidCheckResult.result.score < 100, '有违规定应扣分');

// 20. 等级计算测试
console.log('\n2️⃣0️⃣ 等级计算测试');
assert(['优秀', '良好', '待改进', '严重'].includes(validCheckResult.result.level), '等级应有效');

// 21. 空日志处理测试
console.log('\n2️⃣1️⃣ 空日志处理测试');
const emptyLogResult = await complianceChecker.check({ target: { sessionLogs: ['/nonexistent.jsonl'], specPath: TEST_SPEC_DIR } });
assert(emptyLogResult !== null, '空日志应能处理');
assertEqual(emptyLogResult.violations.length, 0, '空日志应无违规');

// 22. 时间戳格式测试
console.log('\n2️⃣2️⃣ 时间戳格式测试');
assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(validCheckResult.meta.checkedAt), '时间戳应为 ISO 格式');

// 23. 违规等级映射测试
console.log('\n2️⃣3️⃣ 违规等级映射测试');
const ruleLevels = {};
complianceChecker.DEFAULT_RULES.forEach(r => { ruleLevels[r.id] = r.level; });
assertEqual(ruleLevels['R001'], '严重', 'R001 应为严重');
assertEqual(ruleLevels['R006'], '轻微', 'R006 应为轻微');

// 24. 建议去重测试
console.log('\n2️⃣4️⃣ 建议去重测试');
const dupLogPath = createJsonlFile(path.join(TEST_DIR, 'dup.jsonl'), [
  { tool: 'sessions_spawn', runtime: 'subagent', task: '开发 1', timestamp: 1000 },
  { tool: 'sessions_spawn', runtime: 'subagent', task: '开发 2', timestamp: 2000 }
]);
const dupResult = await complianceChecker.check({ target: { sessionLogs: [dupLogPath], specPath: TEST_SPEC_DIR } });
const uniqueSuggestions = new Set(dupResult.recommendations.map(r => r.description));
assertEqual(uniqueSuggestions.size, dupResult.recommendations.length, '建议应去重');

// 25. 优先级排序测试
console.log('\n2️⃣5️⃣ 优先级排序测试');
if (dupResult.recommendations.length > 1) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  let sorted = true;
  for (let i = 1; i < dupResult.recommendations.length; i++) {
    if (priorityOrder[dupResult.recommendations[i].priority] < priorityOrder[dupResult.recommendations[i-1].priority]) { sorted = false; break; }
  }
  assertTrue(sorted, '建议应按优先级排序');
}

cleanupTestDir();

console.log('\n' + '='.repeat(60));
console.log('📊 测试总结');
console.log('='.repeat(60));
console.log(`  总测试数：${testCount}`);
console.log(`  ✅ 通过：${passCount}`);
console.log(`  ❌ 失败：${failCount}`);
console.log(`  覆盖率：${(passCount / testCount * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (failCount === 0) {
  console.log('\n🎉 所有测试通过！覆盖率 100%\n');
} else {
  console.log(`\n⚠️  有 ${failCount} 个测试失败，请修复\n`);
  process.exit(1);
}

})();
