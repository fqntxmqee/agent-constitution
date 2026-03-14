# Skill-06: 多模态蓝图转换器 (Blueprint Converter)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属智能体**: 需求理解智能体  
**状态**: 📋 规约中

---

## 📋 技能描述

在需求确认完成后，根据任务类型自动选择蓝图形态，生成标准化的执行蓝图文档结构。支持三种蓝图形态：**OpenSpec**（开发类）、**内容大纲**（内容类）、**执行计划**（技能/数据类），确保下游需求解决与验收有清晰、可追溯的规约依据。

---

## 🎯 触发条件

- 需求确认已完成（用户已确认澄清提案或快速流）
- 需求理解智能体需要产出「执行蓝图」供用户确认或直接进入需求解决
- 已具备：已确认的需求文档、任务类型、复杂度等输入

---

## 📥 输入

```json
{
  "confirmedRequirement": {
    "summary": "需求摘要或已确认的规约内容",
    "path": "可选：openspec/changes/{项目名}/ 或澄清文档路径",
    "raw": "可选：完整需求正文"
  },
  "taskType": "development|content|skill",
  "complexity": "high|medium|low",
  "context": {
    "intentResult": "可选：Skill-01 意图分类结果",
    "routeTo": "standard|fast",
    "clarificationAnswers": "可选：用户对澄清问题的回答"
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `confirmedRequirement` | 是 | 已确认的需求，至少含 `summary`；可带 `path` 或 `raw` 便于引用 |
| `taskType` | 是 | 任务类型，决定蓝图形态：`development` → OpenSpec，`content` → 内容大纲，`skill` → 执行计划 |
| `complexity` | 否 | 复杂度，影响蓝图粒度与里程碑划分，默认 `medium` |
| `context` | 否 | 意图结果、路由、澄清答案等，用于补充蓝图内容 |

---

## 📤 输出

根据 `taskType` 输出不同形态的蓝图结构，每种形态包含标准化文档列表及每份文档的用途说明。

### 形态一：OpenSpec（taskType = development）

```json
{
  "blueprintForm": "openspec",
  "outputPath": "openspec/changes/{项目名}/",
  "documents": [
    { "file": "proposal.md", "purpose": "项目提案与背景、目标、范围" },
    { "file": "specs/requirements.md", "purpose": "需求规格与验收条件（AC）" },
    { "file": "design.md", "purpose": "技术设计与架构要点" },
    { "file": "tasks.md", "purpose": "可执行任务列表，供需求解决按序执行" }
  ],
  "summary": "简短说明本蓝图的用途与下一步"
}
```

### 形态二：内容大纲（taskType = content）

```json
{
  "blueprintForm": "content-outline",
  "outputPath": "openspec/changes/{项目名}/ 或约定内容目录",
  "documents": [
    { "file": "outline.md", "purpose": "内容大纲与章节结构" },
    { "file": "style-guide.md", "purpose": "风格指南、语气、格式要求" },
    { "file": "milestones.md", "purpose": "内容里程碑与交付节点" }
  ],
  "summary": "简短说明本蓝图的用途与下一步"
}
```

### 形态三：执行计划（taskType = skill）

```json
{
  "blueprintForm": "execution-plan",
  "outputPath": "openspec/changes/{项目名}/ 或约定技能/数据目录",
  "documents": [
    { "file": "plan.md", "purpose": "执行计划与步骤说明" },
    { "file": "checklist.md", "purpose": "检查清单与完成标准" },
    { "file": "resources.md", "purpose": "依赖资源、API、数据源等" }
  ],
  "summary": "简短说明本蓝图的用途与下一步"
}
```

### 通用输出字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `blueprintForm` | string | 形态标识：`openspec` \| `content-outline` \| `execution-plan` |
| `outputPath` | string | 蓝图文档建议输出目录 |
| `documents` | array | 该形态下的标准化文档列表，每项含 `file`、`purpose` |
| `summary` | string | 蓝图用途与建议下一步的自然语言说明 |

---

## 📐 蓝图形态说明

### OpenSpec（开发类）

| 文档 | 说明 | 典型内容 |
|------|------|----------|
| `proposal.md` | 项目提案 | 背景、目标、范围、约束 |
| `specs/requirements.md` | 需求规格 | 功能需求、非功能需求、验收条件（AC） |
| `design.md` | 技术设计 | 架构、技术选型、接口与数据流 |
| `tasks.md` | 任务列表 | 按序可执行任务，供需求解决智能体与 Cursor CLI 使用 |

### 内容大纲（内容类）

| 文档 | 说明 | 典型内容 |
|------|------|----------|
| `outline.md` | 内容大纲 | 章节结构、标题层级、要点列表 |
| `style-guide.md` | 风格指南 | 语气、受众、格式、禁止项 |
| `milestones.md` | 里程碑 | 内容分阶段交付节点与检查点 |

### 执行计划（技能/数据类）

| 文档 | 说明 | 典型内容 |
|------|------|----------|
| `plan.md` | 执行计划 | 步骤顺序、输入输出、异常处理 |
| `checklist.md` | 检查清单 | 完成标准、自检项、验收要点 |
| `resources.md` | 资源说明 | API、数据源、依赖、环境要求 |

---

## 🔧 执行逻辑

### 步骤 1: 校验输入

校验 `confirmedRequirement`、`taskType` 必填；`taskType` 须为 `development` \| `content` \| `skill`；若缺失则报错并返回明确错误信息。

### 步骤 2: 选择蓝图形态

根据 `taskType` 映射到蓝图形态：

- `development` → `openspec`
- `content` → `content-outline`
- `skill` → `execution-plan`

### 步骤 3: 确定输出路径

根据 `confirmedRequirement.path` 或项目名/约定规则生成 `outputPath`；若无 path 则使用默认目录或基于 summary 生成项目名。

### 步骤 4: 组装文档列表

按所选形态从规范中取对应的 `documents` 列表（见上文「蓝图形态说明」），确保每项包含 `file` 与 `purpose`。

### 步骤 5: 生成蓝图内容（可选扩展）

若技能实现包含 LLM 或模板引擎：根据 `confirmedRequirement`、`complexity`、`context` 生成各文档的初始内容并写入 `outputPath`；否则仅输出结构描述（documents + outputPath），由调用方或需求理解智能体负责落盘。

### 步骤 6: 返回结果

输出符合「📤 输出」约定的 JSON，包含 `blueprintForm`、`outputPath`、`documents`、`summary`。

---

## 📁 文件结构

```
agents/skills/skill-06-blueprint-converter/
├── SKILL.md                          # 本文件
├── index.js                          # 技能实现（可选）
├── templates/                        # 各形态文档模板（可选）
│   ├── openspec/
│   │   ├── proposal.md.tpl
│   │   ├── requirements.md.tpl
│   │   ├── design.md.tpl
│   │   └── tasks.md.tpl
│   ├── content-outline/
│   │   ├── outline.md.tpl
│   │   ├── style-guide.md.tpl
│   │   └── milestones.md.tpl
│   └── execution-plan/
│       ├── plan.md.tpl
│       ├── checklist.md.tpl
│       └── resources.md.tpl
└── prompts/
    ├── blueprint-conversion.txt      # 若用 LLM 生成内容时的 Prompt 模板（可选）
    └── system.txt                    # 系统 Prompt（可选）
```

---

## 🧪 验收标准

验收标准以测试用例形式覆盖，至少 **9 个测试用例**，覆盖率 **100%**（所有分支与形态均被覆盖）。

### 测试用例列表

| 用例 ID | 场景描述 | 输入要点 | 预期结果 |
|---------|----------|----------|----------|
| TC-01 | 开发类任务 → OpenSpec | `taskType: "development"`，有效 `confirmedRequirement` | `blueprintForm === "openspec"`，`documents` 含 proposal.md、requirements.md、design.md、tasks.md |
| TC-02 | 内容类任务 → 内容大纲 | `taskType: "content"`，有效 `confirmedRequirement` | `blueprintForm === "content-outline"`，`documents` 含 outline.md、style-guide.md、milestones.md |
| TC-03 | 技能类任务 → 执行计划 | `taskType: "skill"`，有效 `confirmedRequirement` | `blueprintForm === "execution-plan"`，`documents` 含 plan.md、checklist.md、resources.md |
| TC-04 | 缺少 taskType | `taskType` 缺失或为空 | 返回错误信息，不产出蓝图；错误码/字段明确 |
| TC-05 | 缺少 confirmedRequirement | `confirmedRequirement` 缺失或无 summary | 返回错误信息，不产出蓝图 |
| TC-06 | 非法 taskType | `taskType: "unknown"` 或非规定枚举 | 返回错误信息或回退到默认形态（若规约允许）；行为在规约中明确 |
| TC-07 | 含 context 的 OpenSpec | `taskType: "development"`，带 `context.intentResult`、`context.clarificationAnswers` | 产出 OpenSpec 结构，且 summary 或生成内容能体现 context 的利用（若实现生成逻辑） |
| TC-08 | 不同 complexity | `complexity: "high"` 与 `complexity: "low"` 各一次（同一 taskType） | 输出结构一致；若实现包含粒度/里程碑逻辑，则 high 时任务或里程碑更细 |
| TC-09 | outputPath 生成 | `confirmedRequirement.path` 存在 vs 不存在 | 有 path 时 `outputPath` 基于 path；无 path 时使用默认或从 summary 推导的项目名，且格式符合 `openspec/changes/{项目名}/` 或约定 |

### 覆盖率要求

- 三种蓝图形态（OpenSpec、内容大纲、执行计划）均至少被 1 个用例覆盖。
- 输入校验分支（缺失必填、非法枚举）均被覆盖。
- `outputPath` 的两种来源（显式 path、推导）均被覆盖。

---

## 🔗 依赖技能

- **Skill-01 全域意图分类引擎**：可选；`context.intentResult` 可来自 Skill-01，用于辅助 taskType 或蓝图内容生成。
- **Skill-03 跨域模糊性探测器** / **Skill-04 动态路由决策器**：可选；需求确认与路由结果可作为 context 传入，以保持蓝图与澄清/路由一致。

上游调用方通常为 **需求理解智能体**，在需求确认完成后调用本技能生成蓝图，再交用户确认或进入需求解决。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/constitution/CONSTITUTION.md`
- 需求理解智能体：`agents/constitution/requirement-understanding/AGENTS.md`
- OpenSpec 规范存放位置：`AGENTS.md` 中「📁 OpenSpec 规范存放位置」
- P0 实现计划：`agents/docs/specs/README.md`
- Skill-01：`agents/skills/skill-01-intent-classifier/SKILL.md`

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：多模态蓝图转换器规约，三种形态（OpenSpec / 内容大纲 / 执行计划）、输入输出、9 条验收测试用例、100% 覆盖率要求 |
