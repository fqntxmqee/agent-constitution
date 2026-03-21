---
name: requirement-understanding
description: Transforms confirmed proposals into Spec Delta and Execution Blueprint (OpenSpec). Validates spec format, generates AC, and checks consistency with main spec. Use when clarification is done and an execution blueprint must be produced (standard build flow).
---

# Skill-05: 需求理解智能体 (Requirement Understanding)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属**: 需求理解流程  
**归属智能体**: 需求理解智能体  
**状态**: 📋 规约中

---

## 📋 技能描述

在需求澄清完成后，将已确认提案转化为**规约增量 (Spec Delta)** 与**执行蓝图 (Execution Blueprint)**。负责增量规约生成、OpenSpec 格式验证、蓝图与验收标准 (AC) 生成，以及与主规约的一致性校验，确保下游需求解决与验收有清晰、可追溯的规约依据。

---

## 🎯 触发条件

- 需求澄清已完成，用户已确认提案
- 路由为**标准构建流**，需要生成执行蓝图时
- 不得由需求解决或其它智能体直接触发本技能

---

## 📥 输入

```json
{
  "confirmedProposal": {
    "summary": "已确认的需求摘要",
    "intent": "development|content|skill|operation",
    "taskType": "string",
    "scope": "变更范围描述",
    "constraints": ["约束1", "约束2"],
    "path": "可选：澄清产出路径或 project/{项目名}/changes/init/"
  },
  "context": {
    "intentResult": "可选：Skill-01 意图分类结果",
    "routeTo": "standard|fast",
    "clarificationAnswers": "可选：用户对澄清问题的回答",
    "mainSpecPath": "可选：主规约路径，用于一致性校验"
  },
  "options": {
    "blueprintForm": "openspec|content-outline|execution-plan",
    "outputPath": "可选：project/{项目名}/changes/init/",
    "strictValidation": true
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `confirmedProposal` | 是 | 已确认的提案，至少含 `summary`、`intent`；可带 `path`、`scope`、`constraints` |
| `context` | 否 | 意图结果、路由、澄清答案、主规约路径等，用于补充与一致性校验 |
| `options.blueprintForm` | 否 | 蓝图形态：`openspec`（开发）、`content-outline`（内容）、`execution-plan`（技能/数据），未传时按 `intent` 推断 |
| `options.outputPath` | 否 | 蓝图输出目录，默认 `project/{项目名}/changes/init/` |
| `options.strictValidation` | 否 | 是否严格校验格式与一致性，默认 `true` |

---

## 📤 输出

```json
{
  "blueprint": {
    "form": "openspec|content-outline|execution-plan",
    "outputPath": "project/{项目名}/changes/init/",
    "documents": [
      { "file": "proposal.md", "purpose": "项目提案与背景、目标、范围" },
      { "file": "specs/requirements.md", "purpose": "需求规格与验收条件（AC）" },
      { "file": "design.md", "purpose": "技术设计与架构要点" },
      { "file": "tasks.md", "purpose": "可执行任务列表" }
    ],
    "tasks": [
      { "id": "T001", "title": "任务标题", "dependsOn": [], "acRefs": ["AC1"] }
    ],
    "AC": [
      { "id": "AC1", "description": "可验证的验收条件", "verifiable": true }
    ],
    "summary": "蓝图用途与下一步说明"
  },
  "specDelta": {
    "added": ["新增规约项或文件列表"],
    "modified": ["修改的规约项或文件"],
    "removed": ["移除的规约项"],
    "impactScope": "变更影响范围简述"
  },
  "validationReport": {
    "formatValid": true,
    "consistencyValid": true,
    "errors": [],
    "warnings": [],
    "checks": [
      { "name": "openspec-structure", "passed": true, "message": "proposal, specs, design, tasks 齐全" },
      { "name": "ac-verifiable", "passed": true, "message": "AC 均具备可验证描述" }
    ]
  },
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `blueprint` | object | 执行蓝图：`form`、`outputPath`、`documents`、`tasks`、`AC`、`summary` |
| `blueprint.documents` | array | 标准化文档列表，每项含 `file`、`purpose` |
| `blueprint.tasks` | array | 可执行任务，含 `id`、`title`、`dependsOn`、`acRefs`（关联的 AC id） |
| `blueprint.AC` | array | 验收标准，每项含 `id`、`description`、`verifiable` |
| `specDelta` | object | 规约增量：`added`、`modified`、`removed`、`impactScope` |
| `validationReport` | object | 验证报告：`formatValid`、`consistencyValid`、`errors`、`warnings`、`checks` |
| `timestamp` | string | ISO 8601 时间戳 |

---

## 🔧 核心功能与执行逻辑

### 1. 增量规约生成 (Spec Delta)

- 基于 `confirmedProposal` 与可选 `context.mainSpecPath` 生成规约增量
- 明确 `added` / `modified` / `removed` 及 `impactScope`
- 若为主规约下的增量，需对比主规约得出 delta；若为全新项目，`added` 为完整规约项列表

### 2. 规约格式验证

- 确保产出符合 **OpenSpec** 格式：开发类需含 `proposal.md`、`specs/requirements.md`、`design.md`、`tasks.md`
- 内容类/技能类按 `blueprintForm` 对应形态校验文档结构
- 校验结果写入 `validationReport.checks`，`formatValid` 汇总

### 3. 执行蓝图生成 (Execution Blueprint)

- 根据 `options.blueprintForm` 或 `confirmedProposal.intent` 选择形态
- 生成 `blueprint.documents`、`blueprint.tasks`、`blueprint.AC`
- **AC 必须可验证**：每条 AC 具备明确、可检查的完成条件（如「接口返回 200」「字数 ≥ 500」），`verifiable: true`

### 4. 一致性校验

- 若提供 `context.mainSpecPath`，检查本次 delta 与主规约无逻辑冲突（如接口签名、状态机、依赖关系）
- 结果写入 `validationReport.consistencyValid` 与 `checks`
- `strictValidation === true` 且校验不通过时，应在 `validationReport.errors` 中列出并可不产出可交付蓝图，或产出带错误的蓝图供修正

### 执行顺序

1. 解析输入 → 确定 `blueprintForm`、`outputPath`
2. 增量规约生成 → 产出 `specDelta`
3. 起草蓝图 → 生成 `blueprint.documents`、`tasks`、`AC`
4. 规约格式验证 → 填充 `validationReport.checks`、`formatValid`
5. 一致性校验（若有主规约）→ 填充 `consistencyValid`、`errors`/`warnings`
6. 汇总输出 → 设置 `timestamp`

---

## 📐 OpenSpec 最小结构（开发类）

| 文档 | 说明 |
|------|------|
| `proposal.md` | 项目提案、背景、目标、范围 |
| `specs/requirements.md` | 需求规格与验收条件（AC） |
| `design.md` | 技术设计与架构要点 |
| `tasks.md` | 可执行任务列表，供需求解决按序执行 |

AC 须在 `specs/requirements.md` 或蓝图的 `blueprint.AC` 中显式列出，且每条可被验收智能体验证。

---

## 🧪 验收标准

- [ ] **测试用例**：至少 8 个用例，覆盖：仅 confirmedProposal、带 context/options、三种 blueprintForm、格式验证通过/不通过、一致性通过/冲突、AC 可验证性、specDelta 正确性、边界（缺 mainSpecPath、空 constraints）。
- [ ] **规约格式正确率**：在合规输入下，产出格式符合 OpenSpec 或对应形态，正确率 **100%**。
- [ ] **蓝图 AC 可验证**：每条 AC 具备可验证描述，验收智能体可根据 AC 执行验证。
- [ ] **响应时间**：单次调用 **< 2 秒**（不含外部 LLM 或 IO 时按纯逻辑计；含 LLM 时以实际实现为准，建议 < 2s 为目标）。
- [ ] 输出必含 `blueprint`、`specDelta`、`validationReport`、`timestamp`；`blueprint` 必含 `documents`、`tasks`、`AC`。

---

## 🧪 测试用例清单（至少 8 个）

| # | 场景 | 输入要点 | 预期 |
|---|------|----------|------|
| 1 | 仅 confirmedProposal，开发类 | confirmedProposal.intent=development, 无 context/options | blueprint.form=openspec，documents 含 proposal/specs/design/tasks，AC 非空且 verifiable |
| 2 | 带 context 与 options.blueprintForm | options.blueprintForm=content-outline | blueprint.form=content-outline，documents 为内容大纲形态 |
| 3 | 带 mainSpecPath 一致性校验 | context.mainSpecPath 有效，delta 与主规约一致 | validationReport.consistencyValid=true，无 errors |
| 4 | 一致性冲突 | delta 与主规约冲突（如接口签名矛盾） | consistencyValid=false，errors 列出冲突项 |
| 5 | 格式验证通过 | 产出符合 OpenSpec 结构 | validationReport.formatValid=true，checks 对应通过 |
| 6 | 格式验证不通过 | 缺少必需文档（如无 tasks.md） | formatValid=false，errors 或 checks 指出缺失 |
| 7 | AC 可验证性 | 每条 AC 有明确可检查条件 | blueprint.AC[].verifiable=true，description 可操作 |
| 8 | specDelta 正确性 | 新增/修改/移除项与提案一致 | specDelta.added/modified/removed、impactScope 与输入一致 |

---

## 📁 文件结构

```
agents/skills/skill-05-requirement-understanding/
├── SKILL.md
├── index.js          # 可选：技能实现入口
├── config/           # 可选：形态与校验配置
└── prompts/          # 可选：LLM 提示词
```

---

## 🔗 依赖与上下游

- **上游**：需求澄清智能体（产出《已确认提案》）；Skill-01 意图分类、Skill-03 模糊性检测（可选，经澄清后已收敛）。
- **下游**：需求解决智能体（消费执行蓝图）；需求验收智能体（使用蓝图中的 AC）。
- **可选技能**：Skill-06 多模态蓝图转换器（可复用文档形态与 outputPath 约定）。

---

## 📚 相关文档

- 宪法规范 V3.7：`agents/docs/specs/constitution/CONSTITUTION.md`
- 需求理解智能体：`agents/constitution/requirement-understanding/AGENTS.md`
- 执行蓝图最小模板：`agents/constitution/requirement-understanding/AGENTS.md` § 执行蓝图最小模板
- Skill-06 蓝图转换器：`agents/skills/skill-06-blueprint-converter/SKILL.md`
- OpenSpec 存放规范：AGENTS.md § OpenSpec 规范存放位置

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始规约：增量规约、格式验证、执行蓝图（含 AC）、一致性校验；输入 confirmedProposal/context/options；输出 blueprint/specDelta/validationReport；验收 ≥8 用例、格式正确率 100%、AC 可验证、响应 <2s |
