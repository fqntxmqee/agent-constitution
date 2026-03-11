---
name: tool-caller
description: Discovers available tools and their metadata, executes tool calls with retries and standardized error handling, parses and formats results. Use when calling external tools or APIs, or when tool discovery, execution, or result formatting is needed.
---

# Skill-09: 工具调用智能体 (Tool Caller)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属层级**: 支撑层 / 工具调用  
**归属智能体**: 主会话、各子智能体（需调用外部工具或 API 时）  
**状态**: 📋 规约中

---

## 📋 技能描述

提供统一的工具发现、执行、错误处理与结果处理能力。支撑主会话及子智能体在需要调用外部工具或 API 时的标准化调用流程，保证工具调用成功率、错误可追溯与响应时效。

---

## 🎯 触发条件

- 需要**调用外部工具或 API** 时
- 需要**发现可用工具列表**并读取工具元数据时
- 需要**执行工具调用**并处理执行结果时
- 需要**标准化错误信息**与重试策略时

---

## 📥 输入

```json
{
  "toolName": "工具名称或标识",
  "params": {
    "key1": "value1",
    "key2": "value2"
  },
  "options": {
    "timeout": 5000,
    "retries": 3,
    "retryDelay": 1000,
    "format": "json|raw"
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `toolName` | 是 | 工具名称或唯一标识，用于发现与执行对应工具 |
| `params` | 依工具 | 工具参数对象，键值由工具元数据定义；部分工具可为空对象 `{}` |
| `options` | 否 | 执行选项，见下表 |

### options 说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timeout` | number | 5000 | 单次调用超时时间（毫秒） |
| `retries` | number | 3 | 失败时最大重试次数（不含首次） |
| `retryDelay` | number | 1000 | 重试间隔（毫秒） |
| `format` | string | `json` | 结果格式：`json` 解析后结构化返回，`raw` 返回原始响应 |

**工具发现专用输入**（仅查询可用工具时）：

```json
{
  "action": "discover",
  "options": {
    "filter": "可选：按名称或标签过滤"
  }
}
```

当 `action === "discover"` 时，不执行具体工具，仅返回可用工具列表及元数据。

---

## 📤 输出

### 执行结果（成功）

```json
{
  "success": true,
  "result": {},
  "metadata": {
    "duration": 120,
    "attempts": 1,
    "toolName": "tool-name",
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

### 执行结果（失败）

```json
{
  "success": false,
  "result": null,
  "error": {
    "code": "TIMEOUT",
    "message": "工具调用超时",
    "details": "可选：原始错误或堆栈摘要"
  },
  "metadata": {
    "duration": 5010,
    "attempts": 4,
    "toolName": "tool-name",
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

### 工具发现结果

```json
{
  "success": true,
  "result": {
    "tools": [
      {
        "name": "tool-name",
        "description": "工具描述",
        "paramsSchema": {},
        "metadata": {}
      }
    ]
  },
  "metadata": {
    "duration": 50,
    "total": 10
  }
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功；工具执行成功或发现成功为 true |
| `result` | any | 工具执行结果（解析后或按 format 约定）；发现时为 `{ tools: [] }` |
| `error` | object | 失败时必填：`code` 标准错误码、`message` 可读信息、`details` 可选详情 |
| `metadata` | object | 元数据：`duration` 耗时（ms）、`attempts` 尝试次数、`toolName`、`timestamp` 等 |

### 标准错误码

| code | 说明 |
|------|------|
| `TIMEOUT` | 调用超时 |
| `RETRY_EXHAUSTED` | 重试次数用尽仍失败 |
| `TOOL_NOT_FOUND` | 工具不存在或未注册 |
| `INVALID_PARAMS` | 参数校验失败 |
| `EXECUTION_ERROR` | 工具执行阶段错误（含第三方 API 错误） |
| `PARSE_ERROR` | 结果解析失败 |

---

## 🔧 执行逻辑

### 步骤 1: 解析与校验

- 若存在 `action === "discover"`，转**工具发现**流程。
- 校验 `toolName` 非空；校验 `params` 为对象（可为 `{}`）。
- 解析 `options`，填充默认值：`timeout=5000`、`retries=3`、`retryDelay=1000`、`format=json`。

### 步骤 2: 工具发现（仅当 action === "discover"）

- 从注册表或约定路径加载可用工具列表。
- 读取每个工具的元数据（name、description、paramsSchema、metadata）。
- 若存在 `options.filter`，按名称或标签过滤。
- 返回 `success: true`，`result.tools` 为工具数组，`metadata.duration` 为耗时。

### 步骤 3: 工具执行

- 根据 `toolName` 解析并定位工具实现（脚本、API 端点、插件等）。
- 若工具不存在，返回 `success: false`，`error.code = "TOOL_NOT_FOUND"`。
- 根据工具元数据校验 `params`；不通过则返回 `error.code = "INVALID_PARAMS"`。
- 在 `options.timeout` 与 `options.retries` 约束下执行调用：
  - 单次执行超时则标记为失败并进入重试。
  - 重试间隔为 `options.retryDelay`，最多重试 `options.retries` 次。
  - 若全部失败，返回 `error.code = "RETRY_EXHAUSTED"` 或 `TIMEOUT`，`metadata.attempts` 为总尝试次数。

### 步骤 4: 错误处理与标准化

- 执行过程中任何异常均映射为上述标准错误码之一。
- 错误信息标准化：`error.message` 为人可读，`error.details` 可含原始信息，不暴露敏感数据。
- 错误处理覆盖率 100%：超时、重试耗尽、工具不存在、参数错误、执行异常、解析异常均有对应 code 与 message。

### 步骤 5: 结果处理

- 成功时按 `options.format` 处理原始响应：`json` 时解析为对象/数组；`raw` 时保留原始类型。
- 解析失败时返回 `success: false`，`error.code = "PARSE_ERROR"`。
- 填充 `metadata.duration`（毫秒）、`metadata.attempts`、`metadata.toolName`、`metadata.timestamp`（ISO8601）。

### 步骤 6: 返回结果

- 输出符合「📤 输出」约定的 JSON。
- 确保响应时间 < 5 秒（含重试总耗时）。

---

## 📁 文件结构

```
agents/skills/skill-09-tool-caller/
├── SKILL.md                    # 本文件
├── index.js                    # 技能入口（discover / execute 分发）
├── lib/
│   ├── discover.js             # 工具发现，读取工具元数据
│   ├── execute.js              # 工具执行，超时与重试
│   ├── errors.js               # 错误标准化与错误码映射
│   └── result.js               # 结果解析与格式化
├── config/
│   └── tools.json              # 可选：工具注册表或元数据索引
└── test.js                     # 验收测试（至少 10 个用例）
```

---

## 🧪 验收标准

验收以测试用例形式覆盖，至少 **10 个测试用例**，**工具调用成功率 ≥99%**（在正常工具与网络条件下），**错误处理覆盖率 100%**，**响应时间 <5 秒**。

### 测试用例列表

| 用例 ID | 场景描述 | 输入要点 | 预期结果 |
|---------|----------|----------|----------|
| TC-01 | 工具发现 | action=discover | success=true，result.tools 为数组，每项含 name、description、paramsSchema 或 metadata |
| TC-02 | 工具发现带过滤 | action=discover，options.filter=某名称 | result.tools 仅包含匹配项 |
| TC-03 | 正常执行成功 | toolName=有效工具，params 合法 | success=true，result 为解析后结果，metadata.duration < 5000 |
| TC-04 | 超时 | toolName=会超时的工具，options.timeout=100 | success=false，error.code=TIMEOUT，metadata.attempts 正确 |
| TC-05 | 重试耗尽 | toolName=必然失败的工具，retries=2 | success=false，error.code=RETRY_EXHAUSTED 或 EXECUTION_ERROR，metadata.attempts=3 |
| TC-06 | 工具不存在 | toolName=不存在的标识 | success=false，error.code=TOOL_NOT_FOUND |
| TC-07 | 参数无效 | toolName=有效工具，params 缺少必填或类型错误 | success=false，error.code=INVALID_PARAMS |
| TC-08 | 执行异常 | toolName=会抛错的工具 | success=false，error.code=EXECUTION_ERROR，error.message 标准化 |
| TC-09 | 结果解析失败 | toolName=返回非 JSON 且 format=json 的工具 | success=false，error.code=PARSE_ERROR |
| TC-10 | 性能：响应 <5 秒 | 正常工具调用（含一次重试场景） | metadata.duration < 5000，端到端响应 < 5 秒 |

### 覆盖率与指标要求

- 至少 10 个测试用例，覆盖：发现、发现+过滤、成功执行、超时、重试耗尽、工具不存在、参数无效、执行异常、解析失败、性能。
- **工具调用成功率 ≥99%**：在测试环境中，对「工具可用、参数正确」的调用，成功返回的比例 ≥99%。
- **错误处理覆盖率 100%**：上述六类错误码（TIMEOUT、RETRY_EXHAUSTED、TOOL_NOT_FOUND、INVALID_PARAMS、EXECUTION_ERROR、PARSE_ERROR）均有对应用例且输出符合约定。
- **响应时间 <5 秒**：单次调用（含重试）从接收到返回完整输出的端到端时间 < 5 秒。

---

## ⚡ 性能要求

- **响应时间**：单次工具调用（含重试）从接收到返回完整输出的端到端时间 **< 5 秒**。
- 实现建议：合理设置默认 timeout/retries，避免长时间阻塞；发现接口仅做元数据读取，不做实际执行。

---

## 🔗 依赖与调用关系

- **上游**：主会话、各子智能体（在需要调用外部工具或 API 时调用本技能）。
- **下游**：具体工具实现（脚本、HTTP API、插件等），由本技能按 toolName 调度。
- **工作区约定**：工具注册表或元数据存放位置由实现约定（如 `config/tools.json` 或各技能目录下的工具描述）。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 工作区规范：`AGENTS.md`
- P0 技能实现计划：`agents/docs/specs/P0_SKILLS_IMPLEMENTATION_PLAN.md`（若已包含 Skill-09）

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：工具调用智能体规约，工具发现/执行、错误标准化、结果处理、10 条验收用例、成功率 ≥99%、错误覆盖 100%、响应 <5 秒 |
