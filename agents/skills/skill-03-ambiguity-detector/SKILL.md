---
name: ambiguity-detector
description: Cross-domain ambiguity detector for requirement clarification. Detects vague, ambiguous, missing, or conflicting information; classifies by type (missing/ambiguous/conflicting/incomplete); outputs clarification questions and confidence. Use when user input needs ambiguity detection before requirement clarification.
---

# Skill-03: 跨域模糊性探测器 (Ambiguity Detector)

**版本号**: 3.1 · V3.7.4  
**创建日期**: 2026-03-09  
**更新日期**: 2026-03-11 21:15  
**归属**: 需求澄清流程  
**归属智能体**: 需求澄清智能体  
**状态**: ✅ 已实现（V3.7.4 增强版）

---

## 🆕 V3.7.4 新增（2026-03-11）

### 新增检测维度
- ✅ `timeline` - 时间约束（截止日期/交付时间）
- ✅ `resources` - 资源约束（预算/人力/工具许可）

**检测维度**: 6 维度 → **8 维度**

### 多轮对话优化
- ✅ **追问优先级排序** - 按严重程度排序（high → medium → low）
- ✅ **分批追问** - 每次最多 3 个问题，避免用户压力
- ✅ **动态调整** - 根据用户回答决定是否继续追问

---

## 📋 技能描述

在需求澄清前执行，对用户输入进行**跨域模糊性探测**：从技术、业务、用户体验等多维度识别模糊、歧义、缺失与冲突信息，将问题分类并生成澄清问题列表与置信度评分，供需求澄清智能体在确认前发起追问，降低「无规约开发」与返工风险。

### 核心功能

| 功能 | 说明 |
|------|------|
| **模糊性检测** | 识别需求中的模糊、歧义、缺失信息 |
| **跨域分析** | 从技术 / 业务 / 用户体验等多维度分析 |
| **问题分类** | 将模糊性分类为 `missing` / `ambiguous` / `conflicting` / `incomplete` |
| **澄清建议** | 生成具体的澄清问题列表 |
| **置信度评分** | 输出检测结果的置信度 (0-1) |

---

## 🎯 触发条件

- **用户输入需要检测模糊性时**，在需求澄清前执行
- 需求澄清智能体在意图分类后判定需走标准构建流，且尚未产出或确认 OpenSpec
- 用户请求涉及开发/系统构建，需先识别模糊项再生成《澄清提案》或追问清单

---

## 📥 输入

```json
{
  "userInput": "用户原始输入",
  "context": "可选：当前会话上下文、意图分类结果、已有规约路径",
  "options": {
    "detectionDepth": "full|standard|quick",
    "domains": ["technical", "business", "user_experience"],
    "scope": ["tech_stack", "deployment", "data_source", "user_role", "priority", "acceptance"]
  }
}
```

### 输入字段说明

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `userInput` | 是 | string | 用户原始表述 |
| `context` | 否 | string | 上下文信息（会话、意图、规约路径等） |
| `options` | 否 | object | 检测选项 |
| `options.detectionDepth` | 否 | string | 检测深度：`full` 全量 / `standard` 标准 / `quick` 快速 |
| `options.domains` | 否 | string[] | 限定分析领域，见「检测领域」 |
| `options.scope` | 否 | string[] | 限定检测维度（与八维度兼容），见「检测维度」 |
| `options.batchSize` | 否 | number | V3.7.4 每批问题数（默认 3） |
| `options.sortByPriority` | 否 | boolean | V3.7.4 是否按优先级排序（默认 true） |

### 检测领域（跨域）

| 领域 ID | 名称 | 说明 |
|---------|------|------|
| `technical` | 技术 | 技术栈、部署、数据源/API、集成方式等 |
| `business` | 业务 | 用户角色、优先级、MVP 范围、验收标准等 |
| `user_experience` | 用户体验 | 交互、可访问性、性能预期等 |

### 检测维度（八维度，与领域可映射）

| 维度 ID | 名称 | 说明 | 常见领域 |
|---------|------|------|----------|
| `tech_stack` | 技术栈 | 前端/后端/数据库/框架/语言未明确 | technical |
| `deployment` | 部署环境 | 部署目标、运行环境、CI/CD、容器/裸机/Serverless 未明确 | technical |
| `data_source` | 数据源/API | 数据来源、第三方 API、鉴权方式、数据格式未明确 | technical |
| `user_role` | 用户角色 | 目标用户、权限划分、多角色未明确 | business |
| `priority` | 功能优先级 | MVP 范围、分期规划、必选/可选功能未明确 | business |
| `acceptance` | 验收标准 | 完成定义、成功指标、测试范围、上线条件未明确 | business |
| `timeline` | 时间约束 | 截止日期、交付时间、时间预算未明确 | business |
| `resources` | 资源约束 | 预算、人力、工具许可、基础设施未明确 | business |

---

## 📤 输出

```json
{
  "isClear": false,
  "ambiguities": [
    {
      "type": "missing",
      "description": "未说明前端技术栈与后端语言",
      "severity": "high",
      "suggestion": "明确前端框架（如 React/Vue）与后端语言（如 Node/Go）",
      "domain": "technical",
      "field": "tech_stack"
    },
    {
      "type": "missing",
      "description": "未说明时间约束或交付日期",
      "severity": "medium",
      "suggestion": "明确项目截止日期或期望交付时间",
      "domain": "business",
      "field": "timeline"
    },
    {
      "type": "missing",
      "description": "未说明资源约束（预算/人力/工具）",
      "severity": "low",
      "suggestion": "明确项目预算、可用人员及工具许可情况",
      "domain": "business",
      "field": "resources"
    },
    {
      "type": "ambiguous",
      "description": "「先做核心功能」存在歧义，未定义核心范围",
      "severity": "medium",
      "suggestion": "列出首期 MVP 功能清单",
      "domain": "business",
      "field": "priority"
    }
  ],
  "clarificationQuestions": [
    "前端希望用 React 还是 Vue？后端语言有偏好吗？",
    "首期 MVP 需要包含哪些功能？哪些可以后续迭代？",
    "这个项目期望什么时候完成？有截止日期或交付时间吗？",
    "项目预算是多少？有现成的开发团队或工具许可吗？"
  ],
  "clarificationQuestionsBatches": [
    [
      "前端希望用 React 还是 Vue？后端语言有偏好吗？",
      "首期 MVP 需要包含哪些功能？哪些可以后续迭代？"
    ],
    [
      "这个项目期望什么时候完成？有截止日期或交付时间吗？",
      "项目预算是多少？有现成的开发团队或工具许可吗？"
    ]
  ],
  "firstBatch": [
    "前端希望用 React 还是 Vue？后端语言有偏好吗？",
    "首期 MVP 需要包含哪些功能？哪些可以后续迭代？"
  ],
  "hasMoreQuestions": true,
  "confidence": 0.92,
  "domains": ["technical", "business"],
  "reasoning": "可选：简短检测理由"
}
```

### 输出字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `isClear` | boolean | 是 | 是否清晰无模糊：无关键模糊项时为 `true` |
| `ambiguities` | array | 是 | 模糊性列表，见下表 |
| `clarificationQuestions` | string[] | 是 | 可直接面向用户的澄清问题列表（扁平，向后兼容） |
| `clarificationQuestionsBatches` | string[][] | V3.7.4 | 分批问题列表，每批最多 3 个问题 |
| `firstBatch` | string[] | V3.7.4 | 第一批问题（优先级最高，建议先问） |
| `hasMoreQuestions` | boolean | V3.7.4 | 是否还有后续问题（用于决定是否继续追问） |
| `confidence` | number | 是 | 检测结果置信度，区间 [0, 1] |
| `domains` | string[] | 是 | 本次检测涉及的领域列表 |
| `reasoning` | string | 否 | 检测结论的简短理由 |

### ambiguities[] 项结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 模糊类型：`missing` \| `ambiguous` \| `conflicting` \| `incomplete` |
| `description` | string | 模糊性描述 |
| `severity` | string | 严重程度：`high` \| `medium` \| `low` |
| `suggestion` | string | 澄清或补充建议 |
| `domain` | string | 所属领域（technical / business / user_experience） |
| `field` | string | 可选，对应六维度之一，便于与下游一致 |

### 模糊类型定义

| type | 名称 | 说明 | 示例 |
|------|------|------|------|
| `missing` | 缺失 | 关键信息未提供 | 未说明技术栈、未说明目标用户 |
| `ambiguous` | 歧义 | 表述可多种理解 | 「先做核心功能」未定义核心 |
| `conflicting` | 冲突 | 前后或与上下文矛盾 | 既说「纯前端」又提到「写后端接口」 |
| `incomplete` | 不完整 | 部分信息有但不充分 | 只说了「用 React」，未说后端与部署 |

### isClear 判定

- `isClear: true`：无模糊项，或仅存在 `low` 且可后续补充的项；`ambiguities` 为空或全部为 low。
- `isClear: false`：存在至少一项 `high` 或 `medium` 模糊项，需生成澄清问题并供需求澄清使用。

### 置信度说明

- `confidence` 表示本次检测结果的可信程度。
- 越高表示模型对「是否存在模糊、分类与严重程度」越有把握；越低表示输入过短、跨域复杂或存在边界情况。

---

## 🔧 执行逻辑

### 步骤 1：加载配置与 Prompt

读取 `prompts/ambiguity-detection.txt` 模板，注入检测领域、问题类型（missing/ambiguous/conflicting/incomplete）、输出格式说明；若提供 `options.scope` 或 `options.domains`，则限定检测范围。

### 步骤 2：调用检测引擎（如 LLM）

基于 `userInput` 与可选 `context`，按选定领域/维度执行跨域模糊性检测，输出结构化结果（含 `ambiguities`、`clarificationQuestions`、`confidence`、`domains`）。

### 步骤 3：解析与校验

- 校验 JSON 格式。
- 校验 `ambiguities[].type` ∈ { missing, ambiguous, conflicting, incomplete }。
- 校验 `ambiguities[].severity` ∈ { high, medium, low }。
- 校验 `confidence` ∈ [0, 1]。
- 若实现保留六维度，校验 `field` 属于既定维度枚举（若存在）。

### 步骤 4：计算 isClear

若存在任一项 `severity === "high"` 或 `severity === "medium"`，则 `isClear = false`；否则 `isClear = true`。

### 步骤 5：返回结果

返回符合「输出」约定的对象，供需求澄清智能体生成《澄清提案》或直接发起追问。

---

## 📁 文件结构

```
agents/skills/skill-03-ambiguity-detector/
├── SKILL.md                        # 本文件
├── README.md                       # 使用说明与测试结果
├── index.js                        # 技能实现
├── test.js                         # 测试脚本
└── prompts/
    └── ambiguity-detection.txt     # 模糊性检测 Prompt 模板（含类型、领域、输出格式）
```

---

## 🧪 验收标准

- [ ] **问题分类**：ambiguities 的 `type` 仅取 `missing` | `ambiguous` | `conflicting` | `incomplete`。
- [ ] **跨域分析**：支持 technical / business / user_experience 至少三个领域，输出 `domains` 与每项 `domain`。
- [ ] **输出结构**：必含 `isClear`、`ambiguities`、`clarificationQuestions`、`confidence`、`domains`；每项 ambiguity 含 `type`、`description`、`severity`、`suggestion`。
- [ ] **澄清问题**：`clarificationQuestions` 为字符串数组，文案清晰、可直接面向用户使用。
- [ ] **isClear 逻辑**：与是否存在 high/medium 模糊项一致。
- [ ] **置信度**：`confidence` 为 [0, 1] 内数值。
- [ ] **测试用例**：至少 10 个测试用例，覆盖多种模糊类型与领域；**模糊性检测准确率 ≥ 90%**。
- [ ] **性能要求**：响应时间 **< 500ms**（若使用 LLM，可通过缓存、快速模型或异步预检满足；非 LLM 实现须满足 500ms 内返回）。

---

## 🧪 测试用例清单（至少 10 个）

| # | 场景 | 输入要点 | 预期 isClear | 预期类型/领域 |
|---|------|----------|--------------|----------------|
| 1 | 高度模糊 | 「做一个内容运营平台」 | false | missing（technical/business），多条 ambiguity |
| 2 | 技术栈明确 | 「用 React + Node 做后台，部署到 K8s」 | false | 不检出 tech_stack/deployment，可检出 data_source/priority 等 |
| 3 | 部署环境明确 | 需求中明确写部署到 Serverless | false | 不检出 deployment |
| 4 | 需求清晰 | 技术栈、部署、数据源、角色、优先级、验收均给出 | true | ambiguities 为空或仅 low |
| 5 | 非开发类 | 「查一下北京天气」 | true | 不制造无关模糊 |
| 6 | 仅缺失 (missing) | 只提「做个后台」，无技术栈 | false | type=missing, field=tech_stack |
| 7 | 仅歧义 (ambiguous) | 「先做核心功能」无定义 | false | type=ambiguous, field=priority |
| 8 | 冲突 (conflicting) | 既说纯前端又说要写后端 API | false | type=conflicting |
| 9 | 不完整 (incomplete) | 只说了前端 React，无后端与部署 | false | type=incomplete |
| 10 | 多维度多类型 | 混合缺失+歧义+不完整 | false | 多条，domains 含 technical、business |

---

## 🔗 依赖技能

- **Skill-01 全域意图分类引擎**：在标准流场景下，通常先做意图分类再执行本技能；本技能可在「需要检测模糊性」时在需求澄清前独立调用。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 需求澄清智能体：`agents/constitution/requirement-clarification/AGENTS.md`
- P0 实现计划：`agents/docs/specs/P0_SKILLS_IMPLEMENTATION_PLAN.md`
- 技能差距分析：`agents/docs/specs/V37_SKILLS_GAP_ANALYSIS.md`

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-09 | 初始版本：六维度检测、ambiguities(isClear, field, question, priority) |
| 2.0 | 2026-03-10 | 规约升级：跨域模糊性探测器；输入 userInput/context/options；输出 isClear、ambiguities(type, description, severity, suggestion)、clarificationQuestions、confidence、domains；问题分类 missing/ambiguous/conflicting/incomplete；验收 ≥10 用例、准确率 ≥90%、响应 <500ms；补充 YAML 头与测试用例表 |
