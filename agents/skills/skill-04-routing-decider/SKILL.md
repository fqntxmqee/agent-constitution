# Skill-04: 动态路由决策器

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属智能体**: 需求澄清智能体  
**状态**: 📋 规约中

---

## 📋 技能描述

基于规则引擎对用户请求进行路由决策，综合 Skill-01 意图识别与 Skill-03 任务分析/模糊性检测结果，输出目标流程（标准构建流/快速流等）及决策依据；支持用户显式覆盖机制，在用户指定路由时优先采纳用户选择。

---

## 🎯 触发条件

- 用户请求需要路由决策时
- 需求澄清智能体已完成或已获得意图分类（Skill-01）结果
- 可选：已获得模糊性检测/任务分析（Skill-03）结果
- 需在进入需求理解或需求解决前确定走哪条流程

---

## 📥 输入

```json
{
  "user_input": "用户原始表述",
  "intentResult": {
    "primaryIntent": "development|content|skill|operation",
    "secondaryIntents": ["skill", "operation"],
    "confidence": 0.95,
    "reasoning": "意图分类理由",
    "suggestedRoute": "standard|fast",
    "complexity": "high|medium|low"
  },
  "taskOrAmbiguityResult": {
    "ambiguities": [
      {
        "field": "tech_stack|deployment|data_source|user_role|priority|acceptance",
        "question": "追问文案",
        "priority": "high|medium|low"
      }
    ],
    "isClear": false
  },
  "userOverride": {
    "route": "standard|fast",
    "reason": "用户指定原因（可选）"
  },
  "context": "可选：当前会话上下文、历史路由记录"
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `user_input` | 是 | 用户原始表述 |
| `intentResult` | 是 | Skill-01 意图识别结果，用于路由规则匹配 |
| `taskOrAmbiguityResult` | 否 | Skill-03 模糊性检测/任务分析结果，用于标准流/快速流判断 |
| `userOverride` | 否 | 用户显式指定的路由与原因，若存在则优先采用（见下方「用户覆盖机制」） |
| `context` | 否 | 会话上下文、历史路由等 |

---

## 📤 输出

```json
{
  "routeTo": "standard|fast",
  "reasoning": "基于规则引擎的决策理由说明",
  "factors": [
    {
      "name": "意图类型",
      "value": "development",
      "weight": "high",
      "effect": "倾向标准构建流"
    },
    {
      "name": "模糊性",
      "value": "isClear: false",
      "weight": "high",
      "effect": "需澄清后再进入需求理解"
    }
  ],
  "userOverrideApplied": false,
  "suggestedNextStep": "调用需求澄清生成《澄清提案》"
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `routeTo` | string | 最终决策的目标流程：`standard`（标准构建流）、`fast`（快速流），可扩展 |
| `reasoning` | string | 决策理由的自然语言描述，便于审计与调试 |
| `factors` | array | 参与决策的因子列表，每项含 `name`、`value`、`weight`、`effect` |
| `userOverrideApplied` | boolean | 本次决策是否采纳了用户覆盖；为 `true` 时 `routeTo` 以用户指定为准 |
| `suggestedNextStep` | string | 可选，建议的下一步动作（如发起澄清、进入需求理解等） |

### 路由枚举

| 路由 ID | 名称 | 说明 | 典型触发条件 |
|---------|------|------|--------------|
| `standard` | 标准构建流 | 需求澄清 → 需求理解 → 用户确认蓝图 → 需求解决 → 验收 → 交付 | 开发类、高复杂度、存在 high 模糊点 |
| `fast` | 快速流 | 用户确认快速流 → 需求解决 → 验收 → 交付 | 内容/技能/运维类、需求已明确、isClear 为 true |

---

## 👤 用户覆盖机制

- **触发条件**：输入中提供 `userOverride.route` 且值为合法路由（如 `standard`、`fast`）时，视为用户显式指定路由。
- **优先级**：用户覆盖 **高于** 规则引擎结果。即：若 `userOverride` 存在且有效，则 `routeTo` = `userOverride.route`，`userOverrideApplied` = `true`，`reasoning` 中应注明「采纳用户指定路由」并保留用户提供的 `reason`（若有）。
- **审计**：`factors` 中可保留一条 `name: "用户指定"`、`value: userOverride.route` 的因子，便于审计追溯。
- **无效覆盖**：若 `userOverride.route` 不在支持枚举内，则忽略覆盖，按规则引擎正常决策，并可在 `reasoning` 中说明未识别到有效用户指定。

---

## 🔧 执行逻辑

### 步骤 1: 检查用户覆盖

若存在 `userOverride.route` 且属于支持的路由枚举，则直接采用该路由，设置 `userOverrideApplied = true`，跳转步骤 5。

### 步骤 2: 加载规则引擎配置

读取路由规则配置（如 `rules/routing-rules.json` 或内嵌规则），规则可基于：意图类型、复杂度、`isClear`、模糊点优先级等。

### 步骤 3: 计算决策因子（factors）

根据 `intentResult` 与 `taskOrAmbiguityResult` 提取因子，例如：主意图、复杂度、是否清晰、是否存在 high 模糊点等，并为每项赋予 `weight`（high/medium/low）与 `effect`（对路由的影响描述）。

### 步骤 4: 应用规则得到 routeTo

按规则引擎逻辑（如：开发类 + 高复杂度 + 非 isClear → standard；内容类 + isClear → fast）计算 `routeTo`，并生成 `reasoning` 自然语言说明。

### 步骤 5: 生成建议下一步

根据 `routeTo` 给出 `suggestedNextStep`（如标准流下「生成《澄清提案》或进入需求理解」、快速流下「用户确认后进入需求解决」）。

### 步骤 6: 返回结果

输出包含 `routeTo`、`reasoning`、`factors`、`userOverrideApplied`、`suggestedNextStep` 的结构化结果。

---

## 📁 文件结构

```
agents/skills/skill-04-routing-decider/
├── SKILL.md                      # 本文件
├── index.js                      # 技能实现（可选）
├── rules/
│   └── routing-rules.json        # 路由规则配置（可选）
└── prompts/
    ├── routing-decision.txt      # 若用 LLM 辅助决策时的 Prompt 模板（可选）
    └── system.txt                # 系统 Prompt（可选）
```

---

## 🧪 验收标准

- [ ] 输入兼容 Skill-01 与 Skill-03 的输出结构
- [ ] 输出必含 `routeTo`、`reasoning`、`factors`、`userOverrideApplied`
- [ ] 用户覆盖有效时，`routeTo` 与用户指定一致且 `userOverrideApplied === true`
- [ ] 用户覆盖无效或未提供时，完全由规则引擎决定，且 `userOverrideApplied === false`
- [ ] `factors` 中每项包含 `name`、`value`、`weight`、`effect`
- [ ] 规则引擎覆盖：意图类型、复杂度、isClear、模糊点优先级等维度
- [ ] 响应时间与 Skill-01/Skill-03 同级（如 <3 秒）

---

## 🔗 依赖技能

- **Skill-01 全域意图分类引擎**：提供 `intentResult`，为路由规则的主要输入
- **Skill-03 跨域模糊性探测器**：提供 `taskOrAmbiguityResult`（模糊性/任务分析），用于标准流/快速流判断

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 需求澄清智能体：`agents/constitution/requirement-clarification/AGENTS.md`
- P0 实现计划：`agents/docs/specs/P0_SKILLS_IMPLEMENTATION_PLAN.md`
- Skill-01：`agents/skills/skill-01-intent-classifier/SKILL.md`
- Skill-03：`agents/skills/skill-03-ambiguity-detector/SKILL.md`

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：动态路由决策器规约，含规则引擎、输入输出、用户覆盖机制 |
