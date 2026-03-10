---
name: routing-decider
description: Loads and executes routing rules from routing-rules.json; combines Skill-01 intent and Skill-03 task analysis with AND logic and priority; outputs routeTo, reasoning, factors; supports user override as highest priority. Use when Skill-01/03 output is available and a routing target must be decided (orchestration layer).
---

# Skill-04: 动态路由决策器 (Routing Decider)

**版本号**: 2.0  
**创建日期**: 2026-03-10  
**归属**: 编排层 / 路由决策  
**归属智能体**: 需求澄清智能体  
**状态**: 📋 规约中

---

## 📋 技能描述

在 Skill-01 意图分类与 Skill-03 任务分析/模糊性检测输出后，基于规则引擎决定路由目标。支持从 `routing-rules.json` 加载规则、多条件 AND 组合、按优先级匹配，并输出 `routeTo`、`reasoning`、`factors`；用户手动指定路由时优先级最高。

---

## 🎯 触发条件

- Skill-01 和/或 Skill-03 已有输出，需要决定路由目标时
- 在进入需求理解或需求解决前，必须确定目标 Agent/流程（标准构建流、快速流等）

---

## 📥 输入

```json
{
  "skill01": {
    "intent": "development|content|skill|operation",
    "confidence": 0.95,
    "entities": []
  },
  "skill03": {
    "taskType": "string",
    "complexity": "high|medium|low",
    "requiresTools": true,
    "estimatedSteps": 5
  },
  "userOverride": {
    "enabled": true,
    "targetAgent": "requirement-understanding|requirement-resolution|..."
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `skill01` | 是 | Skill-01 输出：`intent`、`confidence`、`entities` |
| `skill03` | 否 | Skill-03 输出：`taskType`、`complexity`、`requiresTools`、`estimatedSteps` |
| `userOverride` | 否 | 用户覆盖：`enabled` 为 true 且 `targetAgent` 有效时，直接采用该目标，优先级最高 |

---

## 📤 输出

```json
{
  "decision": {
    "routeTo": "requirement-understanding|requirement-resolution|...",
    "confidence": 0.92,
    "isOverride": false
  },
  "reasoning": "开发类意图且复杂度高、需工具，匹配规则 R-001，走标准构建流。",
  "factors": [
    {
      "name": "intent",
      "value": "development",
      "weight": 0.4,
      "matchedRule": "R-001"
    },
    {
      "name": "complexity",
      "value": "high",
      "weight": 0.3,
      "matchedRule": "R-001"
    }
  ],
  "matchedRules": ["R-001"],
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `decision.routeTo` | string | 最终路由目标（Agent ID 或流程标识） |
| `decision.confidence` | number | 决策置信度 [0,1] |
| `decision.isOverride` | boolean | 是否采纳用户覆盖 |
| `reasoning` | string | 决策理由的自然语言描述 |
| `factors` | array | 参与决策的因子：`name`、`value`、`weight`、`matchedRule` |
| `matchedRules` | string[] | 命中的规则 ID 列表 |
| `timestamp` | string | ISO 8601 时间戳 |

---

## 🔧 规则引擎

### 规则文件

- **路径**：`rules/routing-rules.json` 或 `config/routing-rules.json`（由实现约定）
- **加载**：技能执行时加载并解析，解析失败时使用内置默认或报错

### 规则结构示例

```json
{
  "defaultRoute": "standard",
  "rules": [
    {
      "id": "R-001",
      "priority": 100,
      "conditions": [
        { "field": "skill01.intent", "operator": "equals", "value": "development" },
        { "field": "skill03.complexity", "operator": "in", "value": ["high", "medium"] }
      ],
      "then": { "routeTo": "requirement-understanding" }
    },
    {
      "id": "R-002",
      "priority": 90,
      "conditions": [
        { "field": "skill01.intent", "operator": "equals", "value": "content" },
        { "field": "skill03.estimatedSteps", "operator": "lessThan", "value": 3 }
      ],
      "then": { "routeTo": "requirement-resolution" }
    }
  ]
}
```

- **priority**：数值越大优先级越高；按优先级从高到低尝试匹配，**第一个**全部条件满足的规则生效。
- **conditions**：同一规则内为 **AND** 关系，全部满足才命中。

### 支持的运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `equals` | 相等 | `"intent" equals "development"` |
| `notEquals` | 不等 | `"intent" notEquals "operation"` |
| `contains` | 包含（字符串或数组） | `"entities" contains "api"` |
| `greaterThan` | 大于（数值） | `"estimatedSteps" greaterThan 5` |
| `lessThan` | 小于（数值） | `"estimatedSteps" lessThan 3` |
| `in` | 在给定列表中 | `"complexity" in ["high","medium"]` |

---

## 👤 用户覆盖机制

- **触发**：`userOverride.enabled === true` 且 `userOverride.targetAgent` 为支持的目标时，视为用户显式指定路由。
- **优先级**：用户覆盖 **高于** 规则引擎。此时 `decision.routeTo` = `userOverride.targetAgent`，`decision.isOverride` = `true`，`reasoning` 中注明采纳用户指定。
- **无效覆盖**：`targetAgent` 不在支持枚举内或 `enabled` 为 false 时，忽略覆盖，按规则引擎决策，`decision.isOverride` = `false`。

---

## 🔧 执行逻辑

1. **检查用户覆盖**：若 `userOverride.enabled` 且 `userOverride.targetAgent` 有效，直接返回该目标，`isOverride: true`，跳转步骤 5。
2. **加载规则**：读取 `routing-rules.json`，得到 `rules` 与 `defaultRoute`。
3. **按优先级匹配**：将 `rules` 按 `priority` 降序排列，依次检查每条规则的 `conditions`（AND）；第一条全部满足的规则命中，取其 `then.routeTo`。
4. **计算 factors**：从输入与命中规则中提取因子，填充 `name`、`value`、`weight`、`matchedRule`；若无命中则使用 `defaultRoute`。
5. **生成输出**：组装 `decision`、`reasoning`、`factors`、`matchedRules`，并设置 `timestamp` 为当前 ISO 8601。

---

## 📁 文件结构

```
agents/skills/skill-04-routing-decider/
├── SKILL.md
├── index.js
├── config/
│   └── routing-rules.json
└── prompts/
    ├── routing-decision.txt
    └── system.txt
```

---

## 🧪 验收标准

- [ ] **测试用例**：至少 10 个用例，覆盖：仅 skill01、skill01+skill03、用户覆盖、无效覆盖、多规则优先级、AND 条件、各运算符（equals/notEquals/contains/greaterThan/lessThan/in）、无命中走 defaultRoute、边界值。
- [ ] **响应时间**：单次决策 <1 秒。
- [ ] **规则匹配准确率**：在给定规则集与输入下，匹配结果与预期一致，准确率 100%。
- [ ] 输入兼容 Skill-01 / Skill-03 输出结构；输出必含 `decision`、`reasoning`、`factors`、`matchedRules`、`timestamp`。
- [ ] 用户覆盖有效时，`decision.routeTo` 与 `userOverride.targetAgent` 一致，`decision.isOverride === true`。
- [ ] `factors` 中每项包含 `name`、`value`、`weight`、`matchedRule`。

---

## 🧪 测试用例清单（至少 10 个）

| # | 场景 | 输入要点 | 预期 routeTo / isOverride |
|---|------|----------|---------------------------|
| 1 | 仅 skill01，意图 development | skill01.intent=development, skill03 缺失 | 由规则或 defaultRoute 决定 |
| 2 | skill01+skill03，开发+高复杂度 | intent=development, complexity=high | 匹配高优先级规则，如 requirement-understanding |
| 3 | 用户覆盖有效 | userOverride.enabled=true, targetAgent=X | routeTo=X, isOverride=true |
| 4 | 用户覆盖无效（targetAgent 非法） | userOverride.targetAgent=invalid | 忽略覆盖，按规则，isOverride=false |
| 5 | 用户覆盖未启用 | userOverride.enabled=false | 按规则引擎 |
| 6 | 多规则按优先级命中第一条 | 两条规则均可匹配，priority 不同 | 命中 priority 更高的一条 |
| 7 | AND 条件部分不满足 | 规则需 intent=A 且 complexity=high，仅 intent=A | 不命中，尝试下一条或 defaultRoute |
| 8 | 运算符 in | complexity in [high, medium] | 符合则命中 |
| 9 | 运算符 lessThan / greaterThan | estimatedSteps lessThan 3 | 符合则命中 |
| 10 | 无任何规则命中 | 输入与所有规则条件都不符 | routeTo=defaultRoute, matchedRules=[] |

---

## 🔗 依赖技能

- **Skill-01 全域意图分类引擎**：提供 `skill01`（intent, confidence, entities）
- **Skill-03 跨域模糊性探测器**：提供 `skill03`（taskType, complexity, requiresTools, estimatedSteps）

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 需求澄清智能体：`agents/constitution/requirement-clarification/AGENTS.md`
- Skill-01：`agents/skills/skill-01-intent-classifier/SKILL.md`
- Skill-03：`agents/skills/skill-03-ambiguity-detector/SKILL.md`

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始规约：规则引擎、用户覆盖、输入输出 |
| 2.0 | 2026-03-10 | 统一输入为 skill01/skill03/userOverride；输出为 decision/reasoning/factors/matchedRules/timestamp；明确运算符与验收（≥10 用例、<1s、100% 准确率） |
