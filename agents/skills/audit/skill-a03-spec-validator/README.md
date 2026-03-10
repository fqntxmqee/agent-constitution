# Skill-A03: 规约验证器 (Specification Validator)

审计智能体核心技能，用于验证 OpenSpec 规约文档的完整性、格式合规性。

---

## 🚀 快速开始

### 安装

无需安装，纯 Node.js 实现，无外部依赖。

```bash
cd agents/skills/audit/skill-a03-spec-validator
```

### 基本用法

```javascript
const specValidator = require('./index.js');

// 验证规约
const result = await specValidator.validate({
  specPath: 'openspec/changes/skill-04-routing-decider/'
});

console.log('验证结果:', result.result.passed ? '通过' : '不通过');
console.log('得分:', result.result.score);
```

---

## 📋 API 参考

### `validate(params)`

完整验证规约文档。

**参数:**
```javascript
{
  specPath: string,        // 必填：规约目录路径
  config: {
    strict: boolean,           // 严格模式，默认 true
    checkUserConfirmation: boolean,  // 是否检查用户确认，默认 true
    checkAcceptanceCriteria: boolean // 是否检查 AC，默认 true
  }
}
```

**返回:**
```javascript
{
  meta: { validatedAt, specPath, projectName },
  result: { passed, score, level, criticalIssues, warnings },
  completeness: { required, optional, missing },
  formatValidation: { proposal, requirements, design, tasks },
  userConfirmation: { intentConfirmed, blueprintConfirmed, deploymentConfirmed, evidence },
  acceptanceCriteria: { count, valid, invalid, criteria },
  issues: [...],
  recommendations: [...]
}
```

### `checkCompleteness(params)`

仅检查文档完整性。

**参数:** 同 `validate`

**返回:**
```javascript
{
  required: [{ name, exists, path }],
  optional: [{ name, exists, path }],
  missing: [...]
}
```

### `validateFormat(specPath)`

验证文档格式。

**返回:** 各文档的格式验证结果

### `validateAcceptanceCriteria(specPath)`

验证 AC（验收标准）定义。

**返回:**
```javascript
{
  count: number,
  valid: number,
  invalid: number,
  criteria: [{ id, description, valid, verifiable }]
}
```

### `getRequiredDocs()`

获取必需文档列表。

**返回:** `string[]`

### `getOptionalDocs()`

获取可选文档列表。

**返回:** `string[]`

---

## 🔧 CLI 工具

使用 `tools/spec-validator.js` 进行命令行验证：

```bash
# 完整验证
node tools/spec-validator.js validate --path openspec/changes/skill-04/

# 仅检查完整性
node tools/spec-validator.js check --path openspec/changes/skill-04/

# 查看文档要求
node tools/spec-validator.js docs

# 输出 JSON
node tools/spec-validator.js validate --path ... --json
```

---

## 📊 验证规则

### 必需文档

| 文档 | 说明 |
|------|------|
| proposal.md | 项目提案 |
| specs/requirements.md | 需求规格 |
| design.md | 技术设计 |
| tasks.md | 任务清单 |

### 格式检查项

#### proposal.md
- 项目名称
- 背景描述
- 目标定义
- 验收标准 (AC)
- 交付物清单
- 用户确认

#### specs/requirements.md
- 功能需求 (FR)
- 非功能需求 (NFR)
- 接口定义
- 数据字典

#### design.md
- 系统架构
- 组件设计
- 流程设计
- 数据结构

#### tasks.md
- 任务清单
- 任务依赖
- 验收标准映射
- 工时估算

---

## 🚨 问题等级

| 等级 | 说明 | 扣分 |
|------|------|------|
| 🔴 critical | 严重问题（缺失必需文档、关键内容缺失） | -15 |
| 🟡 warning | 警告（格式不完整、缺少可选内容） | -5 |
| ℹ️ info | 提示（改进建议） | -1 |

---

## 📈 评分标准

| 得分 | 等级 | 说明 |
|------|------|------|
| 90-100 | 优秀 | 规约完整，格式规范 |
| 75-89 | 良好 | 规约基本完整，少量问题 |
| 60-74 | 待改进 | 规约缺失较多，需整改 |
| 0-59 | 严重 | 规约严重缺失，必须整改 |

---

## ✅ 测试

运行测试套件：

```bash
node test.js
```

**测试覆盖率:** 100%

---

## 📁 文件结构

```
skill-a03-spec-validator/
├── SKILL.md           # 技能规约
├── README.md          # 使用文档
├── index.js           # 核心实现
├── test.js            # 单元测试 (100% 覆盖)
└── tools/
    └── spec-validator.js  # CLI 工具
```

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块
- **Markdown 解析**: 使用正则表达式解析
- **错误容忍**: 单个文档验证失败不影响其他文档
- **性能要求**: 单个规约验证 <2 秒

---

## 📚 相关文档

- [SKILL.md](./SKILL.md) - 技能规约
- [宪法规范 V3.7](../../../../docs/specs/CONSTITUTION_V3.7.md)
- [审计智能体 AGENTS.md](../../../constitution/audit/AGENTS.md)
- [Skill-A01 日志分析器](../skill-a01-log-analyzer/)

---

*版本*: 1.0  
*创建日期*: 2026-03-10  
*维护者*: 审计智能体
