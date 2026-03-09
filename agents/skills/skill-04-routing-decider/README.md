# Skill-04: 动态路由决策器 — 使用文档

## 1. 技能简介（动态路由决策器）

**Skill-04 动态路由决策器** 基于规则引擎对用户请求进行路由决策，综合 Skill-01 意图识别与 Skill-03 任务分析/模糊性检测结果，输出目标流程（**标准构建流** / **快速流**）及决策依据。

**核心能力：**

- **规则引擎决策**：按 `routing-rules.json` 配置，基于意图类型、复杂度、`isClear`、模糊点等维度匹配路由
- **用户显式覆盖**：当用户指定路由时优先采纳用户选择，并保留审计信息
- **结构化输出**：返回 `routeTo`、`reasoning`、`factors`、`userOverrideApplied`、`suggestedNextStep`，便于下游与审计

**技术栈：** 纯 JavaScript（Node.js 18+），无外部依赖，响应时间 &lt;1 秒。

---

## 2. 安装说明（目录位置）

本技能为工作区内置技能，无需单独安装。目录位置：

```
agents/skills/skill-04-routing-decider/
├── README.md           # 本使用文档
├── SKILL.md            # 技能规约（输入输出、验收标准）
├── index.js            # 技能实现
├── test.js             # 测试套件
└── config/
    └── routing-rules.json   # 路由规则配置
```

**依赖：**

- **Skill-01 全域意图分类引擎**：提供 `intentResult`
- **Skill-03 跨域模糊性探测器**（可选）：提供 `taskOrAmbiguityResult`

在 OpenClaw 或需求澄清智能体中引用本技能时，确保上述技能已就绪，并将 `skill-04-routing-decider` 置于 `agents/skills/` 下。

---

## 3. 快速开始（使用示例）

### 3.1 在 Node.js 中调用

```javascript
const { decider } = require('./agents/skills/skill-04-routing-decider/index.js');

// 最小输入：user_input + intentResult（必填）
const input = {
  user_input: '帮我开发一个登录模块',
  intentResult: {
    primaryIntent: 'development',
    confidence: 0.9,
    complexity: 'high',
  },
};

// 异步
const result = await decider.decide(input);
console.log(result.routeTo);           // "standard"
console.log(result.reasoning);         // "基于规则引擎：..."
console.log(result.userOverrideApplied); // false

// 同步（测试或无 async 环境）
const resultSync = decider.decideSync(input);
```

### 3.2 带用户覆盖的示例

```javascript
const input = {
  user_input: '开发一个功能',
  intentResult: { primaryIntent: 'development', complexity: 'high' },
  userOverride: { route: 'fast', reason: '我想走快速流' },
};

const result = await decider.decide(input);
// result.routeTo === 'fast'
// result.userOverrideApplied === true
// result.reasoning 包含「采纳用户指定路由」及用户原因
```

### 3.3 带模糊性检测的示例

```javascript
const input = {
  user_input: '做一个复杂需求',
  intentResult: { primaryIntent: 'development', complexity: 'high' },
  taskOrAmbiguityResult: { isClear: false },
};

const result = await decider.decide(input);
// 未澄清时倾向 standard，result.factors 含「模糊性」因子
```

---

## 4. API 参考（decide 方法、输入输出格式）

### 4.1 导出对象

| 导出 | 说明 |
|------|------|
| `decider` | 单例 `RoutingDecider` 实例，直接调用 `decide` / `decideSync` |
| `RoutingDecider` | 决策类，可 `new RoutingDecider({ skillRootDir })` 自定义技能根目录 |
| `InputValidator` | 输入验证器 |
| `RuleEngine` | 规则引擎 |
| `OutputGenerator` | 输出生成器 |
| `loadRoutingRules(skillRootDir)` | 加载 `config/routing-rules.json` |
| `SUPPORTED_ROUTES` | `['standard', 'fast']` |
| `VALID_OPERATORS` | 条件运算符列表 |

### 4.2 decide(input) — 异步

- **参数：** `input`（见下方输入格式）
- **返回：** `Promise<object>`（见下方输出格式）
- **异常：** `INPUT_VALIDATION_FAILED`（必填缺失或格式错误）、`ROUTING_CONFIG_LOAD_FAILED`、`ROUTING_DECIDE_FAILED`

### 4.3 decideSync(input) — 同步

- **参数：** 同 `decide(input)`
- **返回：** `object`（同输出格式）
- **异常：** 同 `decide`

### 4.4 reloadConfig()

- **说明：** 重新加载 `config/routing-rules.json`（热更新或用户覆盖配置后调用）
- **用法：** `decider.reloadConfig()`

---

### 输入格式

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `user_input` | 是 | string | 用户原始表述，非空 |
| `intentResult` | 是 | object | Skill-01 意图结果 |
| `intentResult.primaryIntent` | 建议 | string | 如 `development`、`content`、`skill`、`operation` |
| `intentResult.complexity` | 可选 | string | `high` \| `medium` \| `low` |
| `intentResult.suggestedRoute` | 可选 | string | `standard` \| `fast` |
| `taskOrAmbiguityResult` | 否 | object | Skill-03 结果 |
| `taskOrAmbiguityResult.isClear` | 可选 | boolean | 是否已澄清 |
| `userOverride` | 否 | object | 用户指定路由 |
| `userOverride.route` | 可选 | string | `standard` \| `fast` |
| `userOverride.reason` | 可选 | string | 用户指定原因 |
| `context` | 否 | any | 会话上下文（当前实现未参与规则计算） |

**示例：**

```json
{
  "user_input": "帮我开发一个登录模块",
  "intentResult": {
    "primaryIntent": "development",
    "confidence": 0.95,
    "complexity": "high",
    "suggestedRoute": "standard"
  },
  "taskOrAmbiguityResult": { "isClear": false },
  "userOverride": null
}
```

---

### 输出格式

| 字段 | 类型 | 说明 |
|------|------|------|
| `routeTo` | string | 最终路由：`standard` \| `fast` |
| `reasoning` | string | 决策理由（自然语言） |
| `factors` | array | 决策因子列表，每项含 `name`、`value`、`weight`、`effect` |
| `userOverrideApplied` | boolean | 是否采纳了用户覆盖 |
| `suggestedNextStep` | string | 建议下一步（如「调用需求澄清生成《澄清提案》」） |

**示例：**

```json
{
  "routeTo": "standard",
  "reasoning": "基于规则引擎：意图与复杂度等因素匹配到路由「standard」",
  "factors": [
    { "name": "意图类型", "value": "development", "weight": "high", "effect": "倾向标准构建流" },
    { "name": "复杂度", "value": "high", "weight": "high", "effect": "倾向标准构建流" }
  ],
  "userOverrideApplied": false,
  "suggestedNextStep": "调用需求澄清生成《澄清提案》"
}
```

---

## 5. 配置说明（routing-rules.json 结构）

配置文件路径：**技能根目录下的 `config/routing-rules.json`**（即 `agents/skills/skill-04-routing-decider/config/routing-rules.json`）。

### 5.1 顶层结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 配置版本（可选） |
| `routes` | string[] | 支持的路由 ID 列表（可选，当前为 `["standard", "fast"]`） |
| `defaultRoute` | string | 无规则匹配时的默认路由，通常 `"standard"` |
| `rules` | array | 规则列表，按 `priority` 升序匹配，先匹配先生效 |

### 5.2 单条规则结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 规则 ID（可选，便于维护） |
| `priority` | number | 优先级，数值越小越先匹配（可选默认 999） |
| `condition` | object | 单条件，见下表 |
| `then` | object | 命中时的动作，需包含 `routeTo` |

**condition 结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `field` | string | 输入对象的点分路径，如 `intentResult.primaryIntent`、`taskOrAmbiguityResult.isClear` |
| `operator` | string | 运算符：`equals`、`notEquals`、`contains`、`greaterThan`、`lessThan`、`in` |
| `value` | any | 比较值；`in` 时为数组 |

### 5.3 运算符说明

| 运算符 | 说明 | value 类型 |
|--------|------|------------|
| `equals` | 严格相等 | any |
| `notEquals` | 不相等 | any |
| `contains` | 字符串包含（actual 会转 string） | string |
| `greaterThan` | 数值大于 | number |
| `lessThan` | 数值小于 | number |
| `in` | 实际值在数组中 | array |

### 5.4 示例配置

```json
{
  "version": "1.0",
  "routes": ["standard", "fast"],
  "defaultRoute": "standard",
  "rules": [
    {
      "id": "dev-high-complex",
      "priority": 1,
      "condition": {
        "field": "intentResult.primaryIntent",
        "operator": "equals",
        "value": "development"
      },
      "then": { "routeTo": "standard" }
    },
    {
      "id": "content-clear",
      "priority": 4,
      "condition": {
        "field": "intentResult.primaryIntent",
        "operator": "in",
        "value": ["content", "skill", "operation"]
      },
      "then": { "routeTo": "fast" }
    }
  ]
}
```

---

## 6. 用户覆盖指南

- **何时生效**：输入中提供 `userOverride.route` 且取值为 `standard` 或 `fast` 时，视为用户显式指定路由。
- **优先级**：用户覆盖 **高于** 规则引擎。若 `userOverride` 有效，则：
  - `routeTo` = `userOverride.route`
  - `userOverrideApplied` = `true`
  - `reasoning` 中会注明「采纳用户指定路由」，并可附带 `userOverride.reason`
- **审计**：`factors` 中会增加一条 `name: "用户指定"`、`value: userOverride.route` 的因子，便于追溯。
- **无效覆盖**：若 `userOverride.route` 不是 `standard`/`fast`，则忽略覆盖，按规则引擎正常决策，`userOverrideApplied` 为 `false`。

**示例：用户坚持走快速流**

```javascript
const input = {
  user_input: '开发一个功能',
  intentResult: { primaryIntent: 'development', complexity: 'high' },
  userOverride: { route: 'fast', reason: '需求已明确，走快速流' },
};
const result = await decider.decide(input);
// result.routeTo === 'fast', result.userOverrideApplied === true
```

---

## 7. 测试运行说明

在技能根目录下执行：

```bash
cd agents/skills/skill-04-routing-decider
node test.js
```

测试套件包含约 10 个用例，覆盖：

- T01：开发任务 → standard
- T02：content/simple 类 → fast
- T03：用户覆盖优先
- T04：多条件（意图 + 复杂度 + isClear）
- T05：规则优先级
- T06：默认路由
- T07：无效输入（缺失必填）报错
- T08：配置加载与规则解析
- T09：reasoning 与 factors 完整性
- T10：性能（100 次 decideSync &lt;1 秒）

全部通过时退出码为 0，否则为 1。

---

## 8. 常见问题 FAQ

**Q1：必填字段缺失会怎样？**  
会抛出 `Error`，`code === 'INPUT_VALIDATION_FAILED'`，`details` 为错误列表。请保证 `user_input`（非空字符串）和 `intentResult`（非 null 对象）存在。

**Q2：规则文件找不到或 JSON 错误？**  
若 `config/routing-rules.json` 不存在，会使用内置默认（`rules: []`，`defaultRoute: 'standard'`）。若文件存在但 JSON 解析失败，会抛出 `ROUTING_CONFIG_LOAD_FAILED`。

**Q3：如何增加新路由（如 `express`）？**  
当前实现仅支持 `standard` 和 `fast`（`SUPPORTED_ROUTES`）。扩展新路由需修改 `index.js` 中的 `SUPPORTED_ROUTES` 及校验逻辑，并在 `routing-rules.json` 的 `then.routeTo` 中使用新值。

**Q4：用户覆盖和规则引擎谁优先？**  
用户覆盖优先。只要 `userOverride.route` 为 `standard` 或 `fast`，就直接采用，不再执行规则引擎。

**Q5：如何热更新规则？**  
调用 `decider.reloadConfig()` 后，下次 `decide`/`decideSync` 会重新读取 `config/routing-rules.json`。

**Q6：factors 里有哪些因子？**  
当前会从输入中提取：意图类型、复杂度、模糊性（isClear）、意图建议路由；若发生用户覆盖，会追加「用户指定」因子。

---

## 9. 验收标准验证说明（AC1–AC6）

| AC | 验收项 | 验证方式 |
|----|--------|----------|
| **AC1** | 输入兼容 Skill-01 与 Skill-03 的输出结构 | 输入格式与 SKILL.md / 本文档一致；`intentResult`、`taskOrAmbiguityResult` 字段与 Skill-01/Skill-03 输出兼容；测试 T01–T06、T09 使用该结构 |
| **AC2** | 输出必含 `routeTo`、`reasoning`、`factors`、`userOverrideApplied` | 测试 T09 断言 `reasoning` 非空、`factors` 为数组；所有用例均检查 `routeTo` 与 `userOverrideApplied` 存在且类型正确 |
| **AC3** | 用户覆盖有效时，`routeTo` 与用户指定一致且 `userOverrideApplied === true` | 测试 T03：传入 `userOverride: { route: 'fast' }`，断言 `result.routeTo === 'fast'` 且 `result.userOverrideApplied === true` |
| **AC4** | 用户覆盖无效或未提供时，完全由规则引擎决定，且 `userOverrideApplied === false` | 测试 T01、T02、T04–T06 均未传 `userOverride` 或传无效值，断言 `userOverrideApplied === false`；T07 验证无效输入不误判为覆盖 |
| **AC5** | `factors` 中每项包含 `name`、`value`、`weight`、`effect` | 测试 T09：遍历 `result.factors`，断言每项存在 `name`、`value`、`weight`、`effect` |
| **AC6** | 规则引擎覆盖意图类型、复杂度、isClear、模糊点优先级等维度；响应时间与 Skill-01/Skill-03 同级（如 &lt;3 秒） | 规则配置含 `primaryIntent`、`complexity`、`taskOrAmbiguityResult.isClear`、`suggestedRoute` 等（见 T05、T08）；T10 断言 100 次 `decideSync` &lt;1 秒，满足 &lt;3 秒要求 |

运行 `node test.js` 全部通过即表示 AC1–AC6 通过验证。

---

**文档版本：** 1.0  
**最后更新：** 2026-03-10  
**规约参考：** `SKILL.md`、`agents/docs/specs/CONSTITUTION_V3.7.md`
