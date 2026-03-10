# Skill-03: 跨域模糊性探测器 - 使用文档

**版本**: 2.0  
**更新日期**: 2026-03-10  
**归属智能体**: 需求澄清智能体  
**状态**: ✅ 已完成

---

## 1. 技能简介

**跨域模糊性探测器（Ambiguity Detector）** 在需求澄清前执行，对用户输入进行**跨域模糊性探测**：从技术、业务、用户体验等多维度识别模糊、歧义、缺失与冲突信息，将问题分类并生成澄清问题列表与置信度评分，供需求澄清智能体在确认前发起追问，降低「无规约开发」与返工风险。

| 功能         | 说明                                       |
|--------------|--------------------------------------------|
| **模糊性检测** | 识别需求中的模糊、歧义、缺失、冲突信息     |
| **跨域分析**   | 从技术 / 业务 / 用户体验等多维度分析       |
| **问题分类**   | 将模糊性分类为 missing / ambiguous / conflicting / incomplete |
| **澄清建议**   | 生成可直接面向用户的澄清问题列表           |
| **置信度评分** | 输出检测结果的置信度 (0–1)                |

- **实现**: 纯 JavaScript (Node.js 18+)，无外部依赖，响应时间 <500ms。
- **依赖**: 可与 Skill-01 全域意图分类引擎配合使用（标准流下通常先做意图分类再执行本技能）。

---

## 2. 安装说明

### 目录位置

技能位于工作区以下路径：

```
agents/skills/skill-03-ambiguity-detector/
├── README.md                       # 本使用文档
├── SKILL.md                        # 技能规约文档
├── index.js                        # 技能实现（主入口）
├── test.js                         # 测试脚本
└── prompts/
    └── ambiguity-detection.txt     # 模糊性检测 Prompt 模板
```

### 环境要求

- **Node.js**: 18 或更高版本
- **依赖**: 无（无 `package.json` 外部依赖）

在项目根目录或技能目录下，直接通过 `require('./agents/skills/skill-03-ambiguity-detector')` 或 `require('./index.js')` 引用即可。

---

## 3. 快速开始

### 命令行

```bash
# 进入技能目录
cd agents/skills/skill-03-ambiguity-detector

# 检测单条用户输入（参数为整句）
node index.js "做一个内容运营平台"

# 输出示例（节选）
# {
#   "isClear": false,
#   "ambiguities": [ ... ],
#   "clarificationQuestions": [ "前端希望用 React 还是 Vue？..." ],
#   "confidence": 0.75,
#   "domains": [ "technical", "business" ]
# }
```

### 代码调用

```javascript
const { detector } = require('./index.js');

// 最简调用
const result = detector.detect({
  userInput: '做一个内容运营平台',
});
console.log(result.isClear);        // false
console.log(result.clarificationQuestions);

// 带上下文与选项
const result2 = detector.detect({
  userInput: '先做核心功能，技术栈你定',
  context: '意图分类为 development，走标准构建流',
  options: {
    detectionDepth: 'standard',
    domains: ['technical', 'business'],
    scope: ['tech_stack', 'priority'],
  },
});
```

---

## 4. API 参考

### detect 方法

**签名**: `detector.detect(input) => result`

| 参数   | 类型   | 必填 | 说明 |
|--------|--------|------|------|
| `input` | object | 是  | 见下方输入格式 |

**输入格式**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userInput` | string | 是 | 用户原始表述 |
| `context`   | any    | 否 | 当前会话上下文、意图分类结果、规约路径等（当前实现中用于扩展，扫描逻辑主要看 userInput） |
| `options`   | object | 否 | 检测选项 |
| `options.detectionDepth` | string | 否 | 检测深度：`full` \| `standard` \| `quick`（当前实现统一按 standard 行为） |
| `options.domains`       | string[] | 否 | 限定分析领域：`technical` \| `business` \| `user_experience`，默认全部 |
| `options.scope`         | string[] | 否 | 限定检测维度（六维度 ID 列表），默认全部六维度 |

**输出格式**

| 字段 | 类型 | 说明 |
|------|------|------|
| `isClear` | boolean | 是否清晰无关键模糊：无 high/medium 时为 `true` |
| `ambiguities` | array | 模糊项列表，每项结构见下表 |
| `clarificationQuestions` | string[] | 可直接面向用户的澄清问题列表 |
| `confidence` | number | 检测结果置信度，区间 [0, 1] |
| `domains` | string[] | 本次检测涉及的领域列表 |

**ambiguities[] 单项结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 模糊类型：`missing` \| `ambiguous` \| `conflicting` \| `incomplete` |
| `description` | string | 模糊性描述 |
| `severity` | string | 严重程度：`high` \| `medium` \| `low` |
| `suggestion` | string | 澄清或补充建议 |
| `domain` | string | 所属领域 |
| `field` | string | 对应六维度之一 |

**示例：输入 → 输出**

```javascript
// 输入
detector.detect({
  userInput: '用 React 做一个管理后台',
});

// 输出（结构示例）
{
  "isClear": false,
  "ambiguities": [
    {
      "type": "incomplete",
      "description": "只提到前端技术，未说明后端与数据层",
      "severity": "high",
      "suggestion": "补充后端语言与数据库选型",
      "domain": "technical",
      "field": "tech_stack"
    }
  ],
  "clarificationQuestions": [
    "后端与数据库计划用哪些技术？"
  ],
  "confidence": 0.8,
  "domains": ["technical"]
}
```

**错误码**

- `AMBIGUITY_INVALID_INPUT`: `input` 非对象或 `userInput` 非字符串时抛出。

---

## 5. 检测维度说明（六维度）

技能在六个维度上检测模糊性，可与领域（见第 7 节）映射。

| 维度 ID | 名称 | 说明 | 常见领域 |
|---------|------|------|----------|
| `tech_stack` | 技术栈 | 前端/后端/数据库/框架/语言未明确 | technical |
| `deployment` | 部署环境 | 部署目标、运行环境、CI/CD、容器/裸机/Serverless 未明确 | technical |
| `data_source` | 数据源/API | 数据来源、第三方 API、鉴权方式、数据格式未明确 | technical |
| `user_role` | 用户角色 | 目标用户、权限划分、多角色未明确 | business |
| `priority` | 功能优先级 | MVP 范围、分期规划、必选/可选功能未明确 | business |
| `acceptance` | 验收标准 | 完成定义、成功指标、测试范围、上线条件未明确 | business |

通过 `options.scope` 可只检测部分维度，例如 `scope: ['tech_stack', 'priority']`。

---

## 6. 模糊性分类（type）

每条模糊项都有且仅有一个 `type`，取以下四类之一。

| type | 名称 | 说明 | 示例 |
|------|------|------|------|
| `missing` | 缺失 | 关键信息未提供 | 未说明技术栈、未说明目标用户 |
| `ambiguous` | 歧义 | 表述可多种理解 | 「先做核心功能」未定义核心范围 |
| `conflicting` | 冲突 | 前后或与上下文矛盾 | 既说「纯前端」又提到「写后端接口」 |
| `incomplete` | 不完整 | 部分信息有但不充分 | 只说了「用 React」，未说后端与部署 |

- **isClear 与 type 无关**，只与 `severity` 有关：存在任一项 `high` 或 `medium` 则 `isClear === false`。

---

## 7. 领域分析（domain）

跨域分析将每条模糊项归入以下领域之一，并汇总到输出 `domains`。

| 领域 ID | 名称 | 说明 |
|---------|------|------|
| `technical` | 技术 | 技术栈、部署、数据源/API、集成方式等 |
| `business` | 业务 | 用户角色、优先级、MVP 范围、验收标准等 |
| `user_experience` | 用户体验 | 交互、可访问性、性能预期等 |

- 维度与领域映射：`tech_stack` / `deployment` / `data_source` → technical；`user_role` / `priority` / `acceptance` → business。
- 通过 `options.domains` 可限定只分析部分领域，例如 `domains: ['technical']`。

---

## 8. 置信度计算说明

`confidence` 表示本次检测结果的可信程度，区间 [0, 1]，数值越高表示对「是否存在模糊、分类与严重程度」越有把握。

当前实现（`ConfidenceCalculator`）规则如下：

| 条件 | 调整 |
|------|------|
| 基础分 | 0.9 |
| 输入长度 < 10 字符 | -0.3 |
| 输入长度 < 30 字符（且 ≥10） | -0.15 |
| 模糊项数量 > 6 | -0.2 |
| 模糊项数量 > 3（且 ≤6） | -0.1 |
| 涉及领域数 ≥ 3 | -0.05 |
| 最终 | 限制在 [0, 1]，保留两位小数 |

输入过短、模糊项过多或跨域过多时，置信度会降低，便于下游判断是否再辅以人工或二次澄清。

---

## 9. 测试运行说明

### 运行全部用例

```bash
cd agents/skills/skill-03-ambiguity-detector
node test.js
```

测试套件共 10 个用例，覆盖：

- T01: 清晰输入 → `isClear === true`
- T02: 模糊输入 → `isClear === false`，ambiguities 非空
- T03: `missing` 类型
- T04: `ambiguous` 类型
- T05: `conflicting` 类型
- T06: `incomplete` 类型
- T07: 跨域分析（domains / ambiguity.domain 合法枚举）
- T08: 澄清问题生成（有模糊项时 clarificationQuestions 非空）
- T09: 置信度在 [0, 1]
- T10: 性能（50 次调用平均 <500ms）

通过时输出 `总计: 10/10` 且进程退出码 0；否则为 1。

### 单用例调试

可临时在 `test.js` 中只执行某一 `t0x_*` 函数，或单独构造输入调用 `detector.detect()` 查看返回。

---

## 10. 常见问题 FAQ

**Q: 非开发类请求（如「查一下北京天气」）也会报很多模糊项吗？**  
A: 不会。实现中会判断是否为开发/构建类请求（如含「做、开发、建、搭建」等且排除「查、天气、翻译」等），非开发类不制造无关模糊，通常 `isClear === true`、ambiguities 为空或极少。

**Q: 如何只检测技术相关模糊？**  
A: 使用 `options.domains: ['technical']`，或 `options.scope: ['tech_stack', 'deployment', 'data_source']`。

**Q: clarificationQuestions 与 ambiguities 是否一一对应？**  
A: 不一定。澄清问题按「维度 + 类型」去重生成，可能一条问题对应多条相似模糊项，或合并为更简洁的一句。

**Q: 能否不用 Node 而在浏览器里用？**  
A: 当前实现为 Node 模块（无 DOM/Node 专有 API），若要在浏览器使用，需通过打包工具（如 esbuild）打包为浏览器可用的 bundle。

**Q: 如何扩展为基于 LLM 的检测？**  
A: 规约与 Prompt 见 `prompts/ambiguity-detection.txt`，输出格式与本文档一致。可在保留当前 `detect(input)` 接口的前提下，内部改为调用 LLM 并解析 JSON，再做与现有实现相同的校验与 `isClear`/confidence 计算（或沿用 LLM 返回的 confidence）。

**Q: 报错 AMBIGUITY_INVALID_INPUT 怎么办？**  
A: 确保传入的 `input` 为对象且 `input.userInput` 为字符串，不能为 `null`/`undefined` 或数字等。

---

## 11. 验收标准验证说明

以下验收项可通过 `node test.js` 及人工抽查验证。

| 验收项 | 要求 | 验证方式 |
|--------|------|----------|
| 问题分类 | `ambiguities[].type` 仅取 `missing` \| `ambiguous` \| `conflicting` \| `incomplete` | T03–T06 + 输出校验 |
| 跨域分析 | 支持 technical / business / user_experience，输出 `domains` 与每项 `domain` | T07 |
| 输出结构 | 必含 `isClear`、`ambiguities`、`clarificationQuestions`、`confidence`、`domains`；每项 ambiguity 含 `type`、`description`、`severity`、`suggestion`、`domain`、`field` | 全用例检查返回结构 |
| 澄清问题 | `clarificationQuestions` 为字符串数组，文案可直接面向用户 | T08 |
| isClear 逻辑 | 存在任一项 severity 为 high 或 medium 时 `isClear === false` | T01、T02 及多组输入抽查 |
| 置信度 | `confidence` 为 [0, 1] 内数值 | T09 |
| 测试用例 | 至少 10 个用例，覆盖多类型与多领域 | test.js 共 10 个用例 |
| 性能 | 响应时间 <500ms（如 50 次调用平均） | T10 |

验收通过标准：`node test.js` 全部通过（10/10），且上述表格各项在测试或抽查中均满足。

---

## 相关文档

- **技能规约**: `SKILL.md`
- **V3.7 主规范**: `agents/docs/specs/CONSTITUTION_V3.7.md`
- **需求澄清智能体**: `agents/constitution/requirement-clarification/AGENTS.md`
- **Prompt 模板**: `prompts/ambiguity-detection.txt`
