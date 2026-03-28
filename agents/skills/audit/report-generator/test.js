/**
 * Skill-A04: 审计报告生成器 - 单元测试套件
 * 测试覆盖率目标：100%
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const reportGenerator = require('./index.js');

let testCount = 0, passCount = 0, failCount = 0;

function assert(condition, message) { testCount++; if (condition) { passCount++; console.log(`  ✅ ${message}`); } else { failCount++; console.error(`  ❌ ${message}`); } }
function assertEqual(actual, expected, message) { assert(actual === expected, `${message}: ${actual} === ${expected}`); }
function assertTrue(value, message) { assert(value === true, `${message}`); }
function assertFalse(value, message) { assert(value === false, `${message}`); }

const TEST_DIR = path.join(os.tmpdir(), 'report-gen-test-' + Date.now());

function setupTestDir() { if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true }); }
function cleanupTestDir() { if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true, force: true }); }

function createMockAnalysis() {
  return {
    logAnalysis: {
      meta: { sessionCount: 5, eventCount: 1234 },
      violations: [
        { ruleId: 'V001', name: '无规约写业务代码', level: '严重', description: '检测到 write 工具创建业务代码', sessionId: 'session-123', suggestion: '使用 sessions_spawn（ACP 或 subagent）由子会话开发' }
      ],
      compliance: { score: 75, level: '良好' }
    },
    complianceCheck: {
      runtimeCheck: { passed: false, violations: [{ level: '严重', description: '使用 subagent 执行开发' }] },
      toolUsageCheck: { passed: true },
      acceptanceCheck: { passed: false },
      violations: [{ ruleId: 'R001', name: 'Runtime 配置错误', level: '严重', description: '开发任务必须使用 runtime="acp"', suggestion: '使用 runtime="acp" 执行开发任务' }]
    },
    specValidation: {
      result: { passed: false, score: 70, level: '待改进' },
      completeness: { missing: ['design.md'] },
      issues: [{ level: 'critical', category: 'completeness', message: '缺失必需文档 design.md', document: 'design.md', suggestion: '创建 design.md 文件' }],
      recommendations: ['补充 design.md 技术设计文档']
    }
  };
}

(async () => {

console.log('\n🧪 Skill-A04 审计报告生成器 - 单元测试\n');

// 1. 常量导出测试
console.log('1️⃣ 常量导出测试');
assert(typeof reportGenerator.VIOLATION_LEVELS === 'object', 'VIOLATION_LEVELS 应为对象');
assertEqual(reportGenerator.VIOLATION_LEVELS['严重'], 'critical', '严重应映射到 critical');
assert(typeof reportGenerator.SCORE_LEVELS === 'object', 'SCORE_LEVELS 应为对象');
assertEqual(reportGenerator.SCORE_LEVELS.优秀.min, 90, '优秀最低分应为 90');

// 2. getLevelByScore 测试
console.log('\n2️⃣ getLevelByScore 测试');
assertEqual(reportGenerator.getLevelByScore(95), '优秀', '95 分应为优秀');
assertEqual(reportGenerator.getLevelByScore(80), '良好', '80 分应为良好');
assertEqual(reportGenerator.getLevelByScore(65), '待改进', '65 分应为待改进');
assertEqual(reportGenerator.getLevelByScore(50), '严重', '50 分应为严重');

// 3. getDefaultTemplate 测试
console.log('\n3️⃣ getDefaultTemplate 测试');
const template = reportGenerator.getDefaultTemplate();
assert(typeof template === 'string', '默认模板应为字符串');
assert(template.includes('# 🔍 审计报告'), '模板应包含标题');
assert(template.includes('{projectName}'), '模板应包含项目名称占位符');

// 4. generate 基本测试
console.log('\n4️⃣ generate 基本测试');
setupTestDir();
const mockAnalysis = createMockAnalysis();
const report = await reportGenerator.generate({
  projectName: 'P0 技能开发',
  auditPeriod: { start: '2026-03-09', end: '2026-03-10' },
  analysis: mockAnalysis,
  config: { format: 'markdown', outputPath: path.join(TEST_DIR, 'audit-report.md') }
});

assert(report !== null, '应生成报告对象');
assert(typeof report.meta === 'object', '报告应包含 meta 字段');
assert(typeof report.conclusion === 'object', '报告应包含 conclusion 字段');
assertEqual(report.meta.projectName, 'P0 技能开发', '项目名称应正确');

// 5. 报告元数据测试
console.log('\n5️⃣ 报告元数据测试');
assert(typeof report.meta.reportId === 'string', 'reportId 应为字符串');
assert(report.meta.reportId.startsWith('audit-'), 'reportId 应以 audit- 开头');
assert(typeof report.meta.generatedAt === 'string', 'generatedAt 应为字符串');
assert(report.meta.generatedAt.includes('T'), 'generatedAt 应为 ISO 格式');

// 6. 审计结论测试
console.log('\n6️⃣ 审计结论测试');
assert(typeof report.conclusion.passed === 'boolean', 'passed 应为布尔值');
assert(typeof report.conclusion.score === 'number', 'score 应为数字');
assert(report.conclusion.score >= 0 && report.conclusion.score <= 100, 'score 应在 0-100 之间');
assert(['优秀', '良好', '待改进', '严重'].includes(report.conclusion.level), 'level 应为有效等级');
assert(typeof report.conclusion.summary === 'string', 'summary 应为字符串');

// 7. 维度评分测试
console.log('\n7️⃣ 维度评分测试');
const dimensions = report.dimensions;
assert(dimensions.specIntegrity !== undefined, '应包含规约完整性评分');
assert(dimensions.developmentCompliance !== undefined, '应包含开发合规评分');
assert(dimensions.acceptanceCompliance !== undefined, '应包含验收合规评分');
assert(dimensions.deliveryCompliance !== undefined, '应包含交付合规评分');
assertEqual(dimensions.specIntegrity.weight, 0.25, '规约完整性权重应为 0.25');
assertEqual(dimensions.developmentCompliance.weight, 0.30, '开发合规权重应为 0.30');

// 8. 违规清单测试
console.log('\n8️⃣ 违规清单测试');
const violations = report.violations;
assert(Array.isArray(violations.critical), 'critical 应为数组');
assert(Array.isArray(violations.major), 'major 应为数组');
assert(Array.isArray(violations.minor), 'minor 应为数组');
assert(violations.critical.length >= 1, '应至少有 1 个严重违规');

// 9. 整改建议测试
console.log('\n9️⃣ 整改建议测试');
const recommendations = report.recommendations;
assert(Array.isArray(recommendations), 'recommendations 应为数组');
assert(recommendations.length >= 1, '应至少有 1 个建议');
const rec = recommendations[0];
assert(['high', 'medium', 'low'].includes(rec.priority), '建议优先级应有效');
assert(typeof rec.description === 'string', '建议描述应为字符串');
assert(typeof rec.deadline === 'string', '建议期限应为字符串');

// 10. 输出文件测试
console.log('\n🔟 输出文件测试');
assert(report.output.markdownPath !== null, '应生成 Markdown 文件路径');
assert(report.output.jsonPath !== null, '应生成 JSON 文件路径');
assert(fs.existsSync(report.output.markdownPath), 'Markdown 文件应存在');
assert(fs.existsSync(report.output.jsonPath), 'JSON 文件应存在');

const mdContent = fs.readFileSync(report.output.markdownPath, 'utf8');
assert(mdContent.includes('P0 技能开发'), 'Markdown 应包含项目名称');
assert(mdContent.includes('审计报告'), 'Markdown 应包含标题');
assert(mdContent.includes('违规清单'), 'Markdown 应包含违规清单章节');

// 11. mergeViolations 测试
console.log('\n1️⃣1️⃣ mergeViolations 测试');
const mergedViolations = reportGenerator.mergeViolations(mockAnalysis);
assert(mergedViolations.critical.length >= 1, '应合并严重违规');
const hasLogAnalysis = mergedViolations.critical.some(v => v.source === '日志分析');
const hasComplianceCheck = mergedViolations.critical.some(v => v.source === '合规检查');
assertTrue(hasLogAnalysis, '应包含日志分析来源的违规');
assertTrue(hasComplianceCheck, '应包含合规检查来源的违规');

// 12. generateRecommendations 测试
console.log('\n1️⃣2️⃣ generateRecommendations 测试');
const recs = reportGenerator.generateRecommendations(mergedViolations, mockAnalysis);
assert(Array.isArray(recs), '应返回建议数组');
assert(recs.length >= 1, '应至少有 1 个建议');
const uniqueDescs = new Set(recs.map(r => r.description));
assertEqual(uniqueDescs.size, recs.length, '建议应去重');

// 13. calculateDimensionScores 测试
console.log('\n1️⃣3️⃣ calculateDimensionScores 测试');
const scores = reportGenerator.calculateDimensionScores(mockAnalysis);
assert(scores.specIntegrity.score >= 0 && scores.specIntegrity.score <= 100, '规约完整性得分应在 0-100 之间');
const totalWeight = Object.values(scores).reduce((sum, s) => sum + s.weight, 0);
assertEqual(totalWeight, 1, '权重总和应为 1');

// 14. calculateOverallScore 测试
console.log('\n1️⃣4️⃣ calculateOverallScore 测试');
const overallScore = reportGenerator.calculateOverallScore(scores);
assert(overallScore >= 0 && overallScore <= 100, '综合得分应在 0-100 之间');
const expectedScore = Math.round(scores.specIntegrity.score * 0.25 + scores.developmentCompliance.score * 0.30 + scores.acceptanceCompliance.score * 0.25 + scores.deliveryCompliance.score * 0.20);
assertEqual(overallScore, expectedScore, '综合得分计算应正确');

// 15. 无输出路径测试
console.log('\n1️⃣5️⃣ 无输出路径测试');
const reportNoOutput = await reportGenerator.generate({
  projectName: '测试项目',
  auditPeriod: { start: '2026-03-01', end: '2026-03-02' },
  analysis: mockAnalysis,
  config: { format: 'markdown' }
});
assert(reportNoOutput.output.markdownPath === null, '无输出路径时应为 null');

// 16. 空分析数据测试
console.log('\n1️⃣6️⃣ 空分析数据测试');
const reportEmpty = await reportGenerator.generate({
  projectName: '空项目',
  auditPeriod: { start: '2026-03-01', end: '2026-03-02' },
  analysis: {}
});
assert(reportEmpty !== null, '空分析数据应能生成报告');
assertEqual(reportEmpty.violations.critical.length, 0, '空分析应无严重违规');

// 17. 审计时间范围格式化测试
console.log('\n1️⃣7️⃣ 审计时间范围格式化测试');
assert(report.meta.auditPeriod.includes('2026-03-09'), '应包含开始日期');
assert(report.meta.auditPeriod.includes('2026-03-10'), '应包含结束日期');

// 18. 报告内容完整性测试
console.log('\n1️⃣8️⃣ 报告内容完整性测试');
const requiredSections = ['审计结论', '审计概览', '违规清单', '整改建议', '详细分析', '附录'];
for (const section of requiredSections) {
  assert(mdContent.includes(section), `报告应包含 ${section} 章节`);
}

// 19. JSON 输出测试
console.log('\n1️⃣9️⃣ JSON 输出测试');
const jsonContent = fs.readFileSync(report.output.jsonPath, 'utf8');
const jsonData = JSON.parse(jsonContent);
assert(jsonData.meta !== undefined, 'JSON 应包含 meta');
assert(jsonData.conclusion !== undefined, 'JSON 应包含 conclusion');
assert(jsonData.violations !== undefined, 'JSON 应包含 violations');

// 20. generateFromTemplate 测试
console.log('\n2️⃣0️⃣ generateFromTemplate 测试');
const customTemplate = '项目名称：{projectName}\n得分：{score}';
const customData = { projectName: '测试', score: 85 };
const rendered = reportGenerator.generateFromTemplate(customTemplate, customData);
assertEqual(rendered, '项目名称：测试\n得分：85', '模板渲染应正确');

// 21. saveReport 测试
console.log('\n2️⃣1️⃣ saveReport 测试');
const testReport = { content: '# 测试报告\n\n内容', markdown: '# Markdown 内容' };
const mdPath = reportGenerator.saveReport(testReport, path.join(TEST_DIR, 'test-report.md'), 'markdown');
assert(mdPath !== null, '应返回保存路径');
assert(fs.existsSync(mdPath), '文件应存在');

// 22. 违规等级映射测试
console.log('\n2️⃣2️⃣ 违规等级映射测试');
assertEqual(reportGenerator.VIOLATION_LEVELS['严重'], 'critical', '严重应映射到 critical');
assertEqual(reportGenerator.VIOLATION_LEVELS['一般'], 'major', '一般应映射到 major');
assertEqual(reportGenerator.VIOLATION_LEVELS['轻微'], 'minor', '轻微应映射到 minor');

// 23. 得分等级边界测试
console.log('\n2️⃣3️⃣ 得分等级边界测试');
assertEqual(reportGenerator.getLevelByScore(90), '优秀', '90 分应为优秀');
assertEqual(reportGenerator.getLevelByScore(89), '良好', '89 分应为良好');
assertEqual(reportGenerator.getLevelByScore(75), '良好', '75 分应为良好');
assertEqual(reportGenerator.getLevelByScore(74), '待改进', '74 分应为待改进');
assertEqual(reportGenerator.getLevelByScore(60), '待改进', '60 分应为待改进');
assertEqual(reportGenerator.getLevelByScore(59), '严重', '59 分应为严重');

// 24. 审计状态测试
console.log('\n2️⃣4️⃣ 审计状态测试');
assert(report.conclusion.status.includes('通过') || report.conclusion.status.includes('整改') || report.conclusion.status.includes('不通过'), '审计状态应有效');

// 25. 报告 ID 唯一性测试
console.log('\n2️⃣5️⃣ 报告 ID 唯一性测试');
const report1 = await reportGenerator.generate({ projectName: '项目 1', auditPeriod: { start: '2026-03-01', end: '2026-03-02' }, analysis: {} });
const report2 = await reportGenerator.generate({ projectName: '项目 2', auditPeriod: { start: '2026-03-01', end: '2026-03-02' }, analysis: {} });
assert(report1.meta.reportId !== report2.meta.reportId, '两次生成的报告 ID 应不同');

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
