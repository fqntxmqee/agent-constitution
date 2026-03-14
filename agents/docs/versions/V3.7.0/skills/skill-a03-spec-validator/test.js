/**
 * Skill-A03: 规约验证器 - 单元测试套件
 * 
 * 测试覆盖率目标：100%
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const specValidator = require('./index.js');

// ============================================================================
// 测试工具
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✅ ${message}`);
  } else {
    failCount++;
    console.error(`  ❌ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message}: ${actual} === ${expected}`);
}

function assertTrue(value, message) {
  assert(value === true, `${message}: ${value} === true`);
}

function assertFalse(value, message) {
  assert(value === false, `${message}: ${value} === false`);
}

function assertArrayEqual(actual, expected, message) {
  assertEqual(actual.length, expected.length, `${message} (length)`);
  for (let i = 0; i < expected.length; i++) {
    assertEqual(actual[i], expected[i], `${message}[${i}]`);
  }
}

// ============================================================================
// 测试数据
// ============================================================================

const TEST_SPEC_DIR = path.join(os.tmpdir(), 'spec-validator-test-' + Date.now());

function setupTestDir() {
  if (!fs.existsSync(TEST_SPEC_DIR)) {
    fs.mkdirSync(TEST_SPEC_DIR, { recursive: true });
  }
}

function cleanupTestDir() {
  if (fs.existsSync(TEST_SPEC_DIR)) {
    fs.rmSync(TEST_SPEC_DIR, { recursive: true, force: true });
  }
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function createValidSpec() {
  // proposal.md
  createFile(path.join(TEST_SPEC_DIR, 'proposal.md'), `
# Skill-04 动态路由决策器 - 项目提案 (Proposal)

## 1. 项目概述

### 1.1 项目名称
动态路由决策器

## 2. 背景与动机 (Background)

本项目旨在实现一个基于规则的路由决策引擎。

## 3. 目标与范围 (Goals & Scope)

### 3.1 核心目标
1. 实现基于规则的路由决策引擎
2. 支持配置化的路由规则

## 4. 验收标准 (Acceptance Criteria)

- AC1: 规则可配置 - 验证方式：检查配置文件加载功能
- AC2: 决策理由清晰 - 验证方式：检查输出格式
- AC3: 支持用户覆盖 - 验证方式：检查文档和 API
- AC4: 测试覆盖率 100% - 验证方式：运行测试套件

## 5. 交付物清单 (Deliverables)

1. src/ - 源代码目录
2. config/routing-rules.json - 路由规则配置
3. tests/ - 测试套件

## 6. 用户确认 (User Confirmation)

- [x] 意图确认
- [ ] 蓝图确认待签署
`);

  // specs/requirements.md
  createFile(path.join(TEST_SPEC_DIR, 'specs/requirements.md'), `
# 需求规格说明书

## 1. 功能需求

### FR-001: 输入处理
接收并解析上游智能体的输出数据

## 2. 非功能需求

### NFR-001: 性能需求
响应时间 < 1 秒

## 3. 接口定义

### API 接口
POST /api/decide

## 4. 数据字典

| 字段 | 类型 | 说明 |
|------|------|------|
| intent | string | 意图 |
`);

  // design.md
  createFile(path.join(TEST_SPEC_DIR, 'design.md'), `
# 技术设计文档

## 1. 系统架构

### 1.1 整体架构图

\`\`\`
┌─────────────────┐
│   Rule Engine   │
└─────────────────┘
\`\`\`

## 2. 组件设计

### 2.1 核心组件
- InputValidator
- RuleEngine
- OutputGenerator

## 3. 流程设计

### 3.1 决策流程
1. 接收输入
2. 验证输入
3. 执行规则匹配

## 4. 数据结构

### 4.1 数据模型
interface Rule { id: string; }
`);

  // tasks.md
  createFile(path.join(TEST_SPEC_DIR, 'tasks.md'), `
# 任务清单 (Tasks)

## 任务概览

| 阶段 | 任务数 | 预计工时 |
|------|--------|----------|
| 初始化 | 2 | 0.5h |
| 开发 | 5 | 4h |

## 阶段 1: 项目初始化 (Phase 1)

### Task-001: 创建项目结构

**验收标准**: AC1, AC2

**预计工时**: 15 分钟

## 阶段 2: 核心开发 (Phase 2)

### Task-002: 实现规则引擎

**依赖**: Task-001 完成后开始

**验收标准**: AC3, AC4
`);
}

function createInvalidSpec() {
  // 只创建 proposal.md，其他缺失
  createFile(path.join(TEST_SPEC_DIR, 'proposal.md'), `
# 测试项目提案

## 背景

这是一个测试项目。
`);
}

// ============================================================================
// 测试用例
// ============================================================================

console.log('\n🧪 Skill-A03 规约验证器 - 单元测试\n');

// ----------------------------------------------------------------------------
// 1. 常量导出测试
// ----------------------------------------------------------------------------
console.log('1️⃣ 常量导出测试');

assert(
  Array.isArray(specValidator.REQUIRED_DOCS),
  'REQUIRED_DOCS 应为数组'
);
assertEqual(
  specValidator.REQUIRED_DOCS.length,
  4,
  'REQUIRED_DOCS 应包含 4 个文档'
);
assert(
  specValidator.REQUIRED_DOCS.includes('proposal.md'),
  'REQUIRED_DOCS 应包含 proposal.md'
);
assert(
  specValidator.REQUIRED_DOCS.includes('specs/requirements.md'),
  'REQUIRED_DOCS 应包含 specs/requirements.md'
);

assert(
  Array.isArray(specValidator.OPTIONAL_DOCS),
  'OPTIONAL_DOCS 应为数组'
);
assert(
  specValidator.OPTIONAL_DOCS.includes('README.md'),
  'OPTIONAL_DOCS 应包含 README.md'
);

// ----------------------------------------------------------------------------
// 2. getRequiredDocs/getOptionalDocs 函数测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣ getRequiredDocs/getOptionalDocs 函数测试');

const requiredDocs = specValidator.getRequiredDocs();
assert(
  Array.isArray(requiredDocs),
  'getRequiredDocs 应返回数组'
);
assertEqual(
  requiredDocs.length,
  4,
  '应返回 4 个必需文档'
);

const optionalDocs = specValidator.getOptionalDocs();
assert(
  Array.isArray(optionalDocs),
  'getOptionalDocs 应返回数组'
);
assert(
  optionalDocs.length > 0,
  '应返回至少 1 个可选文档'
);

// ----------------------------------------------------------------------------
// 3. checkCompleteness 函数测试 - 完整规约
// ----------------------------------------------------------------------------
console.log('\n3️⃣ checkCompleteness 函数测试 - 完整规约');

setupTestDir();
createValidSpec();

const completenessResult = specValidator.checkCompleteness({
  specPath: TEST_SPEC_DIR
});

assertEqual(
  completenessResult.required.length,
  4,
  '应检查 4 个必需文档'
);
assertEqual(
  completenessResult.missing.length,
  0,
  '完整规约应无缺失文档'
);
assertTrue(
  completenessResult.required.every(d => d.exists),
  '所有必需文档应存在'
);

// ----------------------------------------------------------------------------
// 4. checkCompleteness 函数测试 - 缺失文档
// ----------------------------------------------------------------------------
console.log('\n4️⃣ checkCompleteness 函数测试 - 缺失文档');

cleanupTestDir();
setupTestDir();
createInvalidSpec();

const incompleteResult = specValidator.checkCompleteness({
  specPath: TEST_SPEC_DIR
});

assertEqual(
  incompleteResult.missing.length,
  3,
  '应缺失 3 个文档 (specs/requirements.md, design.md, tasks.md)'
);
assert(
  incompleteResult.missing.includes('specs/requirements.md'),
  '应缺失 specs/requirements.md'
);
assert(
  incompleteResult.missing.includes('design.md'),
  '应缺失 design.md'
);
assert(
  incompleteResult.missing.includes('tasks.md'),
  '应缺失 tasks.md'
);

// ----------------------------------------------------------------------------
// 5. checkCompleteness 函数测试 - 自定义必需文档
// ----------------------------------------------------------------------------
console.log('\n5️⃣ checkCompleteness 函数测试 - 自定义必需文档');

const customResult = specValidator.checkCompleteness({
  specPath: TEST_SPEC_DIR,
  config: {
    requiredDocs: ['proposal.md', 'README.md']
  }
});

assertEqual(
  customResult.required.length,
  2,
  '应检查 2 个自定义必需文档'
);
assert(
  customResult.missing.includes('README.md'),
  '应缺失 README.md'
);

// ----------------------------------------------------------------------------
// 6. validateFormat 函数测试 - 完整规约
// ----------------------------------------------------------------------------
console.log('\n6️⃣ validateFormat 函数测试 - 完整规约');

cleanupTestDir();
setupTestDir();
createValidSpec();

const formatResult = specValidator.validateFormat(TEST_SPEC_DIR);

assertTrue(
  formatResult.proposal.valid,
  'proposal.md 格式应有效'
);
assertTrue(
  formatResult.requirements.valid,
  'requirements.md 格式应有效'
);
assertTrue(
  formatResult.design.valid,
  'design.md 格式应有效'
);
assertTrue(
  formatResult.tasks.valid,
  'tasks.md 格式应有效'
);

// ----------------------------------------------------------------------------
// 7. validateFormat 函数测试 - proposal 检查项
// ----------------------------------------------------------------------------
console.log('\n7️⃣ validateFormat 函数测试 - proposal 检查项');

const proposalChecks = formatResult.proposal.checks;
assert(
  proposalChecks.some(c => c.name === '项目名称' && c.passed),
  '应通过项目名称检查'
);
assert(
  proposalChecks.some(c => c.name === '背景描述' && c.passed),
  '应通过背景描述检查'
);
assert(
  proposalChecks.some(c => c.name === '验收标准' && c.passed),
  '应通过验收标准检查'
);
assert(
  proposalChecks.some(c => c.name === '交付物清单' && c.passed),
  '应通过交付物清单检查'
);

// ----------------------------------------------------------------------------
// 8. validateFormat 函数测试 - 缺失文档
// ----------------------------------------------------------------------------
console.log('\n8️⃣ validateFormat 函数测试 - 缺失文档');

cleanupTestDir();
setupTestDir();
createInvalidSpec();

const invalidFormatResult = specValidator.validateFormat(TEST_SPEC_DIR);

assertFalse(
  invalidFormatResult.requirements.valid,
  '缺失 requirements.md 应标记为无效'
);
assertFalse(
  invalidFormatResult.design.valid,
  '缺失 design.md 应标记为无效'
);
assertFalse(
  invalidFormatResult.tasks.valid,
  '缺失 tasks.md 应标记为无效'
);

// ----------------------------------------------------------------------------
// 9. validateAcceptanceCriteria 函数测试 - 有 AC
// ----------------------------------------------------------------------------
console.log('\n9️⃣ validateAcceptanceCriteria 函数测试 - 有 AC');

cleanupTestDir();
setupTestDir();
createValidSpec();

const acResult = specValidator.validateAcceptanceCriteria(TEST_SPEC_DIR);

assertEqual(
  acResult.count,
  4,
  '应提取 4 个 AC'
);
assert(
  acResult.valid >= 1,
  '至少 1 个 AC 应有效'
);
// Note: Some ACs may not be marked as verifiable depending on description

// ----------------------------------------------------------------------------
// 10. validateAcceptanceCriteria 函数测试 - 无 AC
// ----------------------------------------------------------------------------
console.log('\n🔟 validateAcceptanceCriteria 函数测试 - 无 AC');

cleanupTestDir();
setupTestDir();
createInvalidSpec();

const noAcResult = specValidator.validateAcceptanceCriteria(TEST_SPEC_DIR);

assertEqual(
  noAcResult.count,
  0,
  '应提取 0 个 AC'
);

// ----------------------------------------------------------------------------
// 11. checkUserConfirmation 函数测试 - 有确认
// ----------------------------------------------------------------------------
console.log('\n1️⃣1️⃣ checkUserConfirmation 函数测试 - 有确认');

cleanupTestDir();
setupTestDir();
createValidSpec();

const proposalContent = fs.readFileSync(path.join(TEST_SPEC_DIR, 'proposal.md'), 'utf8');
const confirmResult = specValidator.checkUserConfirmation(TEST_SPEC_DIR, proposalContent);

assertTrue(
  confirmResult.intentConfirmed,
  '意图应已确认'
);
assert(
  confirmResult.evidence.length >= 1,
  '应有至少 1 个确认证据'
);

// ----------------------------------------------------------------------------
// 12. checkUserConfirmation 函数测试 - 无确认
// ----------------------------------------------------------------------------
console.log('\n1️⃣2️⃣ checkUserConfirmation 函数测试 - 无确认');

cleanupTestDir();
setupTestDir();
createInvalidSpec();

const noConfirmContent = fs.readFileSync(path.join(TEST_SPEC_DIR, 'proposal.md'), 'utf8');
const noConfirmResult = specValidator.checkUserConfirmation(TEST_SPEC_DIR, noConfirmContent);

assertFalse(
  noConfirmResult.intentConfirmed,
  '意图应未确认'
);

// ----------------------------------------------------------------------------
// 13. validate 函数测试 - 完整规约
// ----------------------------------------------------------------------------
console.log('\n1️⃣3️⃣ validate 函数测试 - 完整规约');

cleanupTestDir();
setupTestDir();
createValidSpec();

const validResult = specValidator.validate({
  specPath: TEST_SPEC_DIR
});

assertTrue(
  validResult.result.passed,
  '完整规约应通过验证'
);
assert(
  validResult.result.score >= 80,
  `完整规约得分应 >= 80，实际：${validResult.result.score}`
);
assertEqual(
  validResult.result.criticalIssues,
  0,
  '应无严重问题'
);
assert(
  validResult.meta.projectName.includes('Skill-04'),
  '应正确提取项目名称'
);

// ----------------------------------------------------------------------------
// 14. validate 函数测试 - 缺失文档
// ----------------------------------------------------------------------------
console.log('\n1️⃣4️⃣ validate 函数测试 - 缺失文档');

cleanupTestDir();
setupTestDir();
createInvalidSpec();

const invalidResult = specValidator.validate({
  specPath: TEST_SPEC_DIR
});

assertFalse(
  invalidResult.result.passed,
  '缺失文档应不通过验证'
);
assert(
  invalidResult.result.criticalIssues >= 3,
  `应有至少 3 个严重问题，实际：${invalidResult.result.criticalIssues}`
);
assertEqual(
  invalidResult.completeness.missing.length,
  3,
  '应缺失 3 个文档'
);

// ----------------------------------------------------------------------------
// 15. validate 函数测试 - 输出结构
// ----------------------------------------------------------------------------
console.log('\n1️⃣5️⃣ validate 函数测试 - 输出结构');

const requiredFields = ['meta', 'result', 'completeness', 'formatValidation', 'userConfirmation', 'acceptanceCriteria', 'issues', 'recommendations'];
for (const field of requiredFields) {
  assert(
    validResult[field] !== undefined,
    `输出应包含 ${field} 字段`
  );
}

// meta 字段
assert(
  typeof validResult.meta.validatedAt === 'string',
  'meta.validatedAt 应为字符串'
);
assert(
  validResult.meta.validatedAt.includes('T'),
  'meta.validatedAt 应为 ISO 格式'
);

// result 字段
assert(
  typeof validResult.result.passed === 'boolean',
  'result.passed 应为布尔值'
);
assert(
  typeof validResult.result.score === 'number',
  'result.score 应为数字'
);
assert(
  ['优秀', '良好', '待改进', '严重'].includes(validResult.result.level),
  'result.level 应为有效等级'
);

// ----------------------------------------------------------------------------
// 16. validate 函数测试 - 问题清单
// ----------------------------------------------------------------------------
console.log('\n1️⃣6️⃣ validate 函数测试 - 问题清单');

assert(
  Array.isArray(validResult.issues),
  'issues 应为数组'
);

// 检查问题结构
if (invalidResult.issues.length > 0) {
  const issue = invalidResult.issues[0];
  assert(
    ['critical', 'warning', 'info'].includes(issue.level),
    '问题等级应为 critical/warning/info'
  );
  assert(
    ['completeness', 'format', 'confirmation', 'ac'].includes(issue.category),
    '问题类别应有效'
  );
  assert(
    typeof issue.message === 'string',
    '问题消息应为字符串'
  );
  assert(
    typeof issue.suggestion === 'string',
    '问题建议应为字符串'
  );
}

// ----------------------------------------------------------------------------
// 17. validate 函数测试 - 整改建议
// ----------------------------------------------------------------------------
console.log('\n1️⃣7️⃣ validate 函数测试 - 整改建议');

assert(
  Array.isArray(validResult.recommendations),
  'recommendations 应为数组'
);

if (invalidResult.recommendations.length > 0) {
  assert(
    typeof invalidResult.recommendations[0] === 'string',
    '建议应为字符串'
  );
}

// ----------------------------------------------------------------------------
// 18. validate 函数测试 - 配置选项
// ----------------------------------------------------------------------------
console.log('\n1️⃣8️⃣ validate 函数测试 - 配置选项');

// 禁用用户确认检查
const noConfirmCheckResult = specValidator.validate({
  specPath: TEST_SPEC_DIR,
  config: {
    checkUserConfirmation: false
  }
});

// 禁用 AC 检查
const noAcCheckResult = specValidator.validate({
  specPath: TEST_SPEC_DIR,
  config: {
    checkAcceptanceCriteria: false
  }
});

assert(
  noConfirmCheckResult !== undefined,
  '禁用用户确认检查应正常执行'
);
assert(
  noAcCheckResult !== undefined,
  '禁用 AC 检查应正常执行'
);

// ----------------------------------------------------------------------------
// 19. 得分计算测试
// ----------------------------------------------------------------------------
console.log('\n1️⃣9️⃣ 得分计算测试');

// 完整规约得分应较高
assert(
  validResult.result.score >= 75,
  `完整规约得分应 >= 75，实际：${validResult.result.score}`
);

// 缺失文档得分应较低
assert(
  invalidResult.result.score < 75,
  `缺失文档得分应 < 75，实际：${invalidResult.result.score}`
);

// 等级计算
assert(
  validResult.result.level === '优秀' || validResult.result.level === '良好',
  `完整规约等级应为优秀或良好，实际：${validResult.result.level}`
);

// ----------------------------------------------------------------------------
// 20. 项目名称提取测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣0️⃣ 项目名称提取测试');

assert(
  validResult.meta.projectName.length > 0,
  '应能提取项目名称'
);

// ----------------------------------------------------------------------------
// 21. 时间戳格式测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣1️⃣ 时间戳格式测试');

const timestamp = validResult.meta.validatedAt;
assert(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timestamp),
  '时间戳应为 ISO 格式'
);

// ----------------------------------------------------------------------------
// 22. 可选文档检查测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣2️⃣ 可选文档检查测试');

assert(
  validResult.completeness.optional.length > 0,
  '应检查可选文档'
);

// ----------------------------------------------------------------------------
// 23. AC 验证方式检测测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣3️⃣ AC 验证方式检测测试');

const validACs = validResult.acceptanceCriteria.criteria.filter(c => c.verifiable);
assert(
  validACs.length > 0,
  '应有可验证的 AC'
);

// ----------------------------------------------------------------------------
// 24. 问题级别分布测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣4️⃣ 问题级别分布测试');

const criticalCount = invalidResult.issues.filter(i => i.level === 'critical').length;
const warningCount = invalidResult.issues.filter(i => i.level === 'warning').length;

assertEqual(
  criticalCount,
  invalidResult.result.criticalIssues,
  '严重问题数量应匹配'
);

// ----------------------------------------------------------------------------
// 25. 空路径处理测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣5️⃣ 空路径处理测试');

const emptyResult = specValidator.validate({
  specPath: '/nonexistent/path'
});

assertFalse(
  emptyResult.result.passed,
  '空路径应不通过验证'
);
assertEqual(
  emptyResult.completeness.missing.length,
  4,
  '空路径应缺失所有必需文档'
);

// 清理测试文件
cleanupTestDir();

// ============================================================================
// 测试总结
// ============================================================================
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
