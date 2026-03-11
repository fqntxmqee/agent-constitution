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
  specPath: string,  // e.g. "openspec/changes/skill-04-routing-decider/"
  
  // 可选：验证配置
  config: {
    // 严格模式（默认 true）
    strict: boolean,
    
    // 需要检查的文档列表
    requiredDocs: string[],  // 默认 ['proposal.md', 'specs/requirements.md', 'design.md', 'tasks.md']
    
    // 是否检查用户确认
    checkUserConfirmation: boolean,  // 默认 true
    
    // 是否检查 AC 定义
    checkAcceptanceCriteria: boolean  // 默认 true
  }
}
```

### OpenSpec 文档结构

```
openspec/changes/<project-name>/
├── proposal.md          # 项目提案（必需）
├── specs/
│   └── requirements.md  # 需求规格（必需）
├── design.md            # 技术设计（必需）
├── tasks.md             # 任务清单（必需）
├── acceptance/          # 验收相关（可选）
│   └── criteria.md
└── confirmation/        # 用户确认（可选）
    └── intent.md
```

---

## 🔧 处理逻辑

### 1. 文档完整性检查

```
┌─────────────────────────────────────────┐
│         检查必需文档是否存在             │
├─────────────────────────────────────────┤
│  proposal.md → specs/requirements.md    │
│  design.md → tasks.md                   │
├─────────────────────────────────────────┤
│  生成缺失文档清单                        │
└─────────────────────────────────────────┘
```

### 2. 文档格式验证

#### proposal.md 检查项

| 检查项 | 说明 | 必需 |
|--------|------|------|
| 项目名称 | 包含明确的项目名称 | ✅ |
| 背景描述 | 有背景与动机章节 | ✅ |
| 目标定义 | 有明确的目标与范围 | ✅ |
| 验收标准 | 定义 AC（验收标准） | ✅ |
| 交付物清单 | 列出交付物 | ✅ |
| 用户确认 | 有用户确认章节或记录 | ✅ |

#### specs/requirements.md 检查项

| 检查项 | 说明 | 必需 |
|--------|------|------|
| 功能需求 | FR 编号与描述 | ✅ |
| 非功能需求 | NFR 编号与描述 | ✅ |
| 接口定义 | API/接口说明 | ⚠️ 可选 |
| 数据字典 | 数据结构定义 | ⚠️ 可选 |

#### design.md 检查项

| 检查项 | 说明 | 必需 |
|--------|------|------|
| 系统架构 | 架构图或描述 | ✅ |
| 组件设计 | 组件职责说明 | ✅ |
| 流程设计 | 关键流程说明 | ✅ |
| 数据结构 | 数据模型定义 | ⚠️ 可选 |

#### tasks.md 检查项

| 检查项 | 说明 | 必需 |
|--------|------|------|
| 任务清单 | 有明确的任务列表 | ✅ |
| 任务依赖 | 任务执行顺序 | ✅ |
| 验收标准映射 | 任务与 AC 关联 | ✅ |
| 工时估算 | 任务工时估算 | ⚠️ 可选 |

### 3. 用户确认记录检查

检查以下确认节点：

| 确认节点 | 说明 | 检查方式 |
|----------|------|----------|
| 意图确认 | 用户确认需求意图 | proposal.md 或单独文件 |
| 蓝图确认 | 用户确认技术方案 | design.md 签署或确认记录 |
| 部署确认 | 用户确认部署方案 | 部署章节或确认记录 |

### 4. AC（验收标准）验证

检查 AC 定义质量：

| 检查项 | 说明 |
|--------|------|
| AC 编号 | 有唯一编号（AC1, AC2...） |
| AC 描述 | 清晰可验证的描述 |
| 验证方式 | 说明如何验证 |
| AC 覆盖 | 覆盖核心功能 |
| AC 数量 | 至少 3 个 AC |

---

## 📤 输出

### 验证报告结构

```javascript
{
  // 验证元数据
  meta: {
    validatedAt: "2026-03-10T09:42:00.000Z",
    specPath: "openspec/changes/skill-04/",
    projectName: "Skill-04 动态路由决策器"
  },
  
  // 整体结果
  result: {
    passed: boolean,      // 是否通过
    score: number,        // 得分 0-100
    level: string,        // 优秀/良好/待改进/严重
    criticalIssues: number,
    warnings: number
  },
  
  // 文档完整性
  completeness: {
    required: [
      { name: "proposal.md", exists: true, path: "..." },
      { name: "specs/requirements.md", exists: true, path: "..." },
      { name: "design.md", exists: false, path: "..." },
      { name: "tasks.md", exists: true, path: "..." }
    ],
    optional: [...],
    missing: ["design.md"]
  },
  
  // 格式验证
  formatValidation: {
    proposal: {
      valid: true,
      checks: [
        { name: "项目名称", passed: true },
        { name: "背景描述", passed: true },
        { name: "验收标准", passed: false, reason: "未找到 AC 定义" }
      ]
    },
    requirements: {...},
    design: {...},
    tasks: {...}
  },
  
  // 用户确认
  userConfirmation: {
    intentConfirmed: boolean,
    blueprintConfirmed: boolean,
    deploymentConfirmed: boolean,
    evidence: [...]
  },
  
  // AC 验证
  acceptanceCriteria: {
    count: number,
    valid: number,
    invalid: number,
    criteria: [
      {
        id: "AC1",
        description: "...",
        valid: true,
        verifiable: true
      }
    ]
  },
  
  // 问题清单
  issues: [
    {
      level: "critical" | "warning" | "info",
      category: "completeness" | "format" | "confirmation" | "ac",
      document: "proposal.md",
      message: "缺少验收标准定义",
      suggestion: "在 proposal.md 中添加验收标准章节"
    }
  ],
  
  // 整改建议
  recommendations: [
    "补充 design.md 技术设计文档",
    "在 proposal.md 中添加用户确认章节",
    "完善 AC 验证方式说明"
  ]
}
```

---

## ✅ 验收标准

| AC | 标准 | 验证方式 |
|----|------|----------|
| AC1 | 支持验证单个或多个规约文档 | 单元测试 |
| AC2 | 正确检测缺失文档 | 单元测试 |
| AC3 | 正确验证文档格式 | 单元测试 |
| AC4 | 正确检测用户确认记录 | 单元测试 |
| AC5 | 正确验证 AC 定义 | 单元测试 |
| AC6 | 输出符合定义的 JSON 结构 | 单元测试 |
| AC7 | 100% 测试覆盖率 | 运行测试 |
| AC8 | 无外部依赖（纯 Node.js） | 检查实现 |

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块 (fs, path)
- **Markdown 解析**: 使用正则表达式解析 Markdown 结构
- **错误容忍**: 单个文档验证失败不影响其他文档
- **性能要求**: 单个规约验证 <2 秒

---

## 📚 使用示例

### 基本用法

```javascript
const specValidator = require('./skill-a03-spec-validator');

// 验证规约
const result = await specValidator.validate({
  specPath: 'openspec/changes/skill-04-routing-decider/'
});

console.log('验证结果:', result.result.passed ? '通过' : '不通过');
console.log('得分:', result.result.score);
```

### 严格模式

```javascript
const result = await specValidator.validate({
  specPath: 'openspec/changes/skill-04-routing-decider/',
  config: {
    strict: true,
    checkUserConfirmation: true
  }
});
```

### 仅检查完整性

```javascript
const result = await specValidator.checkCompleteness({
  specPath: 'openspec/changes/skill-04-routing-decider/'
});
```

---

## 🔗 相关文档

- 宪法规范 V3.7 第二章 §7（审计智能体）
- OpenSpec 规范模板
- 规约先行检查清单 (`agents/constitution/audit/AGENTS.md`)

---

*最后更新*: 2026-03-10  
*维护者*: 审计智能体
