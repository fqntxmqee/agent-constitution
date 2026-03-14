# Skill-04: 动态路由决策器 — 使用文档

## 1. 技能简介（动态路由决策器）

**Skill-04 动态路由决策器（Routing Decider）** 在 Skill-01 意图分类与 Skill-03 任务分析/模糊性检测输出之后，基于规则引擎决定路由目标（如标准构建流、快速流或具体 Agent），供编排层使用。

**核心能力：**

| 能力 | 说明 |
|------|------|
| **规则引擎决策** | 从 `config/routing-rules.json` 加载规则，按优先级匹配，多条件 AND 组合 |
| **用户显式覆盖** | `userOverride.enabled === true` 且 `targetAgent` 有效时，直接采用用户指定目标，优先级最高 |
| **结构化输出** | 返回 `decision`（routeTo、confidence、isOverride）、`reasoning`、`factors`、`matchedRules`、`timestamp`，便于下游与审计 |

**技术栈：** 纯 JavaScript（Node.js 18+），仅使用 `fs`/`path`，无外部依赖；单次决策响应时间 <1 秒。

**归属：** 编排层 / 路由决策，归属智能体为需求澄清智能体。

---

## 2. 安装说明（目录位置）

本技能为工作区内置技能，无需单独安装。目录位置：

```
agents/skills/skill-04-routing-decider/
├── README.md              # 本使用文档
├── SKILL.md               # 技能规约（输入输出、验收标准）
├── index.js               # 技能实现（导出 decider、RoutingDecider 等）
├── test.js                # 测试套件（≥10 用例）
├── config/
│   └── routing-rules.json # 路由规则配置
└── prompts/
    ├── routing-decision.txt
    └── system.txt
```

**依赖技能：**

- **Skill-01 全域意图分类引擎**：提供 `skill01`（intent、confidence、entities）
- **Skill-03 跨域模糊性探测器**（可选）：提供 `skill03`（taskType、complexity、requiresTools、estimatedSteps）

在 OpenClaw 或需求澄清智能体中引用本技能时，确保将 `skill-04-routing-decider` 置于 `agents/skills/` 下，并传入与 Skill-01/Skill-03 输出兼容的输入结构。

---

## 3. 快速开始（使用示例）

### 3.1 最小输入（仅 skill01）

```javascript
const { decider } = require('./agents/skills/skill-04-routing-decider/index.js');

const input = {
  skill01: {
    intent: 'development',
    confidence: 0.95,
    entities: [],
  },
};

// 异步
const result = await decider.decide(input);
console.log(result.decision.routeTo);   // 如 "requirement-understanding" 或 "standard"
console.log(result.reasoning);          // 决策理由
console.log(result.matchedRules);       // 如 ["R-001"]

// 同步（测试或无 async 环境）
const resultSync = decider.decideSync(input);
```

### 3.2 带 Skill-03 的完整输入

```javascript
const input = {
  skill01: {
    intent: 'development',
    confidence: 0.9,
    entities: [],
  },
  skill03: {
    taskType: 'feature',
    complexity: 'high',
    requiresTools: true,
    estimatedSteps: 8,
  },
};

const result = await decider.decide(input);
// 高复杂度开发任务 → 通常匹配 requirement-understanding（标准构建流）
```

### 3.3 用户覆盖（强制走指定 Agent）

```javascript
const input = {
  skill01: { intent: 'development', confidence: 0.9 },
  userOverride: {
    enabled: true,
    targetAgent: 'requirement-resolution',
  },
};

const result = await decider.decide(input);
// result.decision.routeTo === 'requirement-resolution'
// result.decision.isOverride === true
// result.reasoning 包含「采纳用户指定路由」
```

---

## 4. API 参考（decide 方法、输入输出格式）

### 4.1 导出对象

| 导出 | 说明 |
|------|------|
| `decider` | 单例 `RoutingDecider` 实例，直接调用 `decide` / `decideSync` |
| `RoutingDecider` | 决策类，可 `new RoutingDecider({ skillRootDir })` 自定义技能根目录 |
| `ConfigLoader` | 配置加载器（从 config/routing-rules.json 加载） |
| `InputValidator` | 输入验证器 |
| `RuleEngine` | 规则引擎 |
| `OutputGenerator` | 输出生成器 |
| `ERROR_CODES` | 错误码：`ROUTING_INVALID_INPUT`、`ROUTING_NO_MATCH`、`ROUTING_CONFIG_ERROR`、`ROUTING_DECIDE_FAILED` |
| `VALID_OPERATORS` | 支持的运算符列表 |
| `VALID_TARGET_AGENTS` | 用户覆盖允许的目标 Agent 列表 |

### 4.2 decide(input) — 异步

| 项目 | 说明 |
|------|------|
| **参数** | `input`（见下方输入格式） |
| **返回** | `Promise<object>`（见下方输出格式） |
| **异常** | `ROUTING_INVALID_INPUT`（必填缺失或格式错误）、`ROUTING_CONFIG_ERROR`、`ROUTING_DECIDE_FAILED` |

### 4.3 decideSync(input) — 同步

- **参数**：同 `decide(input)`
- **返回**：`object`（同输出格式）
- **异常**：同 `decide`

### 4.4 reloadConfig()

- **说明**：重新加载 `config/routing-rules.json`（热更新规则后调用）
- **用法**：`decider.reloadConfig()`

---

### 输入格式

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `skill01` | 是 | object | Skill-01 输出 |
| `skill01.intent` | 是 | string | 意图：如 `development`、`content`、`skill`、`operation`，非空 |
| `skill01.confidence` | 否 | number | 置信度 [0, 1] |
| `skill01.entities` | 否 | array | 实体列表 |
| `skill03` | 否 | object | Skill-03 输出 |
| `skill03.taskType` | 否 | string | 任务类型 |
| `skill03.complexity` | 否 | string | `high` \| `medium` \| `low` |
| `skill03.requiresTools` | 否 | boolean | 是否需要工具 |
| `skill03.estimatedSteps` | 否 | number | 预估步骤数（≥0） |
| `userOverride` | 否 | object | 用户指定路由 |
| `userOverride.enabled` | 否 | boolean | 是否启用覆盖 |
| `userOverride.targetAgent` | 否 | string | 目标 Agent（须在 `VALID_TARGET_AGENTS` 内） |

**输入示例：**

```json
{
  "skill01": {
    "intent": "development",
    "confidence": 0.95,
    "entities": []
  },
  "skill03": {
    "taskType": "feature",
    "complexity": "high",
    "requiresTools": true,
    "estimatedSteps": 8
  },
  "userOverride": null
}
```

---

### 输出格式

| 字段 | 类型 | 说明 |
|------|------|------|
| `decision` | object | 决策结果 |
| `decision.routeTo` | string | 最终路由目标（Agent ID 或流程标识） |
| `decision.confidence` | number | 决策置信度 [0, 1] |
| `decision.isOverride` | boolean | 是否采纳用户覆盖 |
| `reasoning` | string | 决策理由（自然语言） |
| `factors` | array | 决策因子，每项含 `name`、`value`、`weight`、`matchedRule` |
| `matchedRules` | string[] | 命中的规则 ID 列表 |
| `timestamp` | string | ISO 8601 时间戳 |

**输出示例：**

```json
{
  "decision": {
    "routeTo": "requirement-understanding",
    "confidence": 0.92,
    "isOverride": false
  },
  "reasoning": "意图 development、复杂度 high，匹配规则 R-001，路由至「requirement-understanding」。",
  "factors": [
    { "name": "intent", "value": "development", "weight": 0.4, "matchedRule": "R-001" },
    { "name": "complexity", "value": "high", "weight": 0.3, "matchedRule": "R-001" }
  ],
  "matchedRules": ["R-001"],
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

---

## 5. 规则配置说明（routing-rules.json 结构）

配置文件路径：**`config/routing-rules.json`**（相对于技能根目录）。

### 5.1 顶层结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 配置版本（可选） |
| `defaultRoute` | string | 无规则匹配时的默认路由，通常 `"standard"` |
| `rules` | array | 规则列表；按 `priority` **降序**匹配，**第一条**全部条件满足的规则生效 |

### 5.2 单条规则结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 规则 ID（便于维护与 matchedRules 输出） |
| `priority` | number | 优先级，**数值越大越先匹配** |
| `conditions` | array | 条件数组，**同一规则内为 AND 关系**，全部满足才命中 |
| `then` | object | 命中时的动作，需包含 `routeTo` |

**条件项（condition）结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `field` | string | 输入对象的点分路径，如 `skill01.intent`、`skill03.complexity`、`skill03.estimatedSteps` |
| `operator` | string | 运算符（见第 6 节） |
| `value` | any | 比较值；`in` 时为数组 |

**兼容写法：** 规则可写为 `condition`（单条对象）而非 `conditions`（数组），实现会自动转为单元素数组。

### 5.3 示例配置

```json
{
  "version": "1.0",
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
      "id": "R-003",
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

---

## 6. 支持的运算符（equals / notEquals / contains / greaterThan / lessThan / in）

规则条件中 `operator` 与 `value` 的用法如下。

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `equals` | 严格相等 | `skill01.intent` equals `"development"` |
| `notEquals` | 不相等 | `skill01.intent` notEquals `"operation"` |
| `contains` | 包含：字符串则子串包含，数组则包含元素 | `skill01.entities` contains `"api"` |
| `greaterThan` | 数值大于（会转为 Number 比较） | `skill03.estimatedSteps` greaterThan `5` |
| `lessThan` | 数值小于 | `skill03.estimatedSteps` lessThan `3` |
| `in` | 实际值在给定列表中（value 为数组） | `skill03.complexity` in `["high", "medium"]` |

**注意：**

- `contains`：若字段为数组，判断 `value` 是否在数组中；否则将实际值转为字符串做子串判断。
- `greaterThan` / `lessThan`：若无法转为有效数字，条件为 false。
- `in`：若 `value` 不是数组，条件为 false。

---

## 7. 用户覆盖指南

- **何时生效**：`userOverride.enabled === true` 且 `userOverride.targetAgent` 为**有效目标**时，视为用户显式指定路由。
- **有效目标**：必须在 `VALID_TARGET_AGENTS` 内，当前包括：  
  `requirement-understanding`、`requirement-clarification`、`requirement-resolution`、`requirement-acceptance`、`requirement-delivery`、`standard`、`fast`。
- **优先级**：用户覆盖 **高于** 规则引擎。生效时：
  - `decision.routeTo` = `userOverride.targetAgent`
  - `decision.isOverride` = `true`
  - `reasoning` 中注明「采纳用户指定路由」
  - `factors` 中会增加 `name: "userOverride"`、`value: targetAgent`、`weight: 1` 的因子
- **无效覆盖**：`enabled === false` 或 `targetAgent` 不在上述列表内时，忽略覆盖，按规则引擎决策，`decision.isOverride` = `false`。

**示例：用户坚持走需求解决**

```javascript
const input = {
  skill01: { intent: 'development', confidence: 0.9 },
  userOverride: { enabled: true, targetAgent: 'requirement-resolution' },
};
const result = await decider.decide(input);
// result.decision.routeTo === 'requirement-resolution'
// result.decision.isOverride === true
```

---

## 8. 测试运行说明

在技能根目录下执行：

```bash
cd agents/skills/skill-04-routing-decider
node test.js
```

测试套件包含 10 个用例，覆盖：

| # | 场景 | 要点 |
|---|------|------|
| T01 | 仅 skill01，意图 development | 由规则或 defaultRoute 决定 |
| T02 | skill01+skill03，开发+高复杂度 | 匹配 requirement-understanding |
| T03 | 用户覆盖有效 | routeTo=targetAgent，isOverride=true |
| T04 | 用户覆盖无效（targetAgent 非法） | 忽略覆盖，按规则 |
| T05 | 用户覆盖未启用 | 按规则引擎 |
| T06 | 多规则按优先级命中高优先级 | 命中 R-001 或 R-002 |
| T07 | AND 条件部分不满足 | 不命中该规则，尝试下一条或 defaultRoute |
| T08 | 运算符 in | complexity in [high, medium] |
| T09 | 运算符 lessThan | content + estimatedSteps < 3 → requirement-resolution |
| T10 | 无效输入 | 抛出 ROUTING_INVALID_INPUT |

**结果：** 全部通过时退出码为 0，否则为 1。

---

## 9. 常见问题 FAQ

**Q1：必填字段缺失会怎样？**  
会抛出 `Error`，`code === 'ROUTING_INVALID_INPUT'`，`details` 为错误列表。必须提供 `skill01` 且 `skill01.intent` 为非空字符串。

**Q2：规则文件找不到或 JSON 错误？**  
若 `config/routing-rules.json` 不存在或读取/解析失败，会抛出 `ROUTING_CONFIG_ERROR`。请确保文件存在且为合法 JSON。

**Q3：如何增加新路由或新 targetAgent？**  
在 `routing-rules.json` 的 `then.routeTo` 中可直接使用新字符串；若需支持用户覆盖到该目标，需在 `index.js` 的 `VALID_TARGET_AGENTS` 中加入新值。

**Q4：用户覆盖和规则引擎谁优先？**  
用户覆盖优先。只要 `userOverride.enabled === true` 且 `targetAgent` 在有效列表中，就直接采用，不再执行规则引擎。

**Q5：如何热更新规则？**  
调用 `decider.reloadConfig()` 后，下次 `decide`/`decideSync` 会重新读取 `config/routing-rules.json`。

**Q6：factors 里有哪些因子？**  
从输入中提取：intent、confidence（若有）、complexity、estimatedSteps、requiresTools（若有）；若发生用户覆盖，会追加 `userOverride` 因子。每项均含 `name`、`value`、`weight`、`matchedRule`。

**Q7：优先级是升序还是降序？**  
**降序**。priority 数值越大越先匹配；第一条**全部条件**满足的规则生效，后续规则不再尝试。

---

## 10. 验收标准验证说明

以下验收项与 `SKILL.md` 一致，可通过 `node test.js` 及人工检查验证。

| 验收项 | 验证方式 |
|--------|----------|
| **输入兼容 Skill-01 / Skill-03 输出结构** | 输入格式为 skill01（intent、confidence、entities）、skill03（taskType、complexity、requiresTools、estimatedSteps）；测试 T01–T09 使用该结构 |
| **输出必含 decision、reasoning、factors、matchedRules、timestamp** | 所有用例断言 `result.decision`、`result.reasoning`、`result.factors`、`result.matchedRules`、`result.timestamp` 存在且类型正确 |
| **用户覆盖有效时 routeTo 与 targetAgent 一致且 isOverride === true** | 测试 T03：传入 `userOverride: { enabled: true, targetAgent: 'requirement-resolution' }`，断言 `result.decision.routeTo === 'requirement-resolution'` 且 `result.decision.isOverride === true` |
| **用户覆盖无效或未启用时由规则引擎决定，isOverride === false** | 测试 T04、T05：无效或未启用覆盖时断言 `isOverride === false`；T01、T02、T06–T09 无覆盖或按规则 |
| **factors 每项含 name、value、weight、matchedRule** | 测试 T01 等：`result.factors.every(f => f.name && f.value !== undefined && f.weight != null && 'matchedRule' in f)` |
| **规则匹配准确率与优先级、AND、各运算符正确** | T02、T06–T09 覆盖优先级、AND、equals/in/lessThan 等；在给定规则集下匹配结果与预期一致 |
| **单次决策响应时间 <1 秒** | 实现内若超过 1 秒会打 console.warn；可另行压测 100 次 decideSync 验证 |

运行 `node test.js` 全部通过即表示上述验收项通过验证。

---

**文档版本：** 2.0  
**最后更新：** 2026-03-10  
**规约参考：** `SKILL.md`、`agents/docs/specs/constitution/CONSTITUTION.md`
