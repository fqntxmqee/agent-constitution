# Skill-A03: 规约验证器 (Specification Validator)

**版本**: 1.0  
**创建日期**: 2026-03-10  
**归属**: 审计智能体专用技能

---

## 🎯 定位

审计智能体的规约完整性验证引擎，负责检查 OpenSpec 文档集的完整性、格式合规性、用户确认记录。

---

## 📥 输入

### 输入参数

```javascript
{
  // 必填：规约目录路径
  specPath: string,
  
  // 可选：验证配置
  config: {
    checkUserConfirmation: boolean,  // 是否检查用户确认
    checkAcceptanceCriteria: boolean // 是否检查 AC 定义
  }
}
```

### OpenSpec 文档结构

```
project/<project-name>/changes/init/
├── proposal.md          # 项目提案（必需）
├── specs/
│   └── requirements.md  # 需求规格（必需）
├── design.md            # 技术设计（必需）
├── tasks.md             # 任务清单（必需）
└── confirmation/        # 用户确认（可选）
```

---

## 🔧 处理逻辑

### 1. 文档完整性检查

检查必需文档是否存在：
- proposal.md
- specs/requirements.md
- design.md
- tasks.md

### 2. 文档格式验证

#### proposal.md 检查项
- 项目名称
- 背景描述
- 目标定义
- 验收标准 (AC)
- 交付物清单
- 用户确认

#### specs/requirements.md 检查项
- 功能需求 (FR)
- 非功能需求 (NFR)

#### design.md 检查项
- 系统架构
- 组件设计
- 流程设计

#### tasks.md 检查项
- 任务清单
- 任务依赖
- 验收标准映射

### 3. 用户确认记录检查

| 确认节点 | 检查内容 | 违规等级 |
|----------|----------|----------|
| 意图确认 | proposal.md 或 confirmation/intent.md | 🟡 一般 |
| 蓝图确认 | design.md 签署或 confirmation/blueprint.md | 🟡 一般 |
| 部署确认 | 部署章节或 confirmation/deployment.md | 🟢 轻微 |

### 4. AC（验收标准）验证

- AC 编号唯一性
- AC 描述清晰度
- AC 验证方式说明
- AC 数量（建议至少 3 个）

---

## 📤 输出

```javascript
{
  meta: { validatedAt, specPath, projectName },
  result: { passed, score, level, criticalIssues, warnings },
  completeness: { required, optional, missing },
  formatValidation: { proposal, requirements, design, tasks },
  userConfirmation: { intentConfirmed, blueprintConfirmed, deploymentConfirmed },
  acceptanceCriteria: { count, valid, invalid, criteria },
  issues: [{ level, category, document, message, suggestion }],
  recommendations: [...]
}
```

---

## ✅ 验收标准

| AC | 标准 | 验证方式 |
|----|------|----------|
| AC1 | 支持验证规约文档完整性 | 单元测试 |
| AC2 | 正确检测缺失文档 | 单元测试 |
| AC3 | 正确验证文档格式 | 单元测试 |
| AC4 | 正确检测用户确认记录 | 单元测试 |
| AC5 | 正确验证 AC 定义 | 单元测试 |
| AC6 | 输出符合定义的 JSON 结构 | 单元测试 |
| AC7 | 100% 测试覆盖率 | 运行测试 |
| AC8 | 无外部依赖 | 检查实现 |

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块
- **Markdown 解析**: 使用正则表达式解析
- **错误容忍**: 单个文档验证失败不影响其他文档
- **性能要求**: 单个规约验证 <2 秒

---

## 📚 使用示例

```javascript
const specValidator = require('./spec-validator');

const result = await specValidator.validate({
  specPath: 'project/skill-04-routing-decider/changes/init/'
});

console.log('验证结果:', result.result.passed ? '通过' : '不通过');
console.log('得分:', result.result.score);
```

---

## 🔗 相关文档

- 宪法规范 V3.7 第二章 §7（审计智能体）
- OpenSpec 规范模板
- Skill-A04 审计报告生成器

---

*最后更新*: 2026-03-10  
*维护者*: 审计智能体
