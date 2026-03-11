# Skill-09: 工具调用智能体 (Tool Caller) — 使用文档

## 1. 技能简介

**工具调用智能体（Tool Caller）** 是 OpenClaw 工作区支撑层技能，提供统一的：

- **工具发现**：获取可用工具列表及元数据（name、description、paramsSchema 等）
- **工具执行**：按 `toolName` 与 `params` 调用工具，支持超时与重试
- **错误标准化**：六种标准错误码，便于上游统一处理
- **结果解析**：支持 `json` / `raw` 两种格式

适用于主会话及各子智能体在需要调用外部工具或 API 时的标准化调用流程。纯 JavaScript（Node.js 18+），无外部依赖（仅 `fs` / `path` / `child_process`），单次调用（含重试）响应时间 &lt; 5 秒。

---

## 2. 安装说明

### 目录位置

技能位于工作区相对路径：

```
agents/skills/skill-09-tool-caller/
├── README.md       # 本使用文档
├── SKILL.md        # 技能规约（触发条件、输入输出、验收标准）
├── index.js        # 技能入口与实现（单文件）
├── test.js         # 验收测试（10 个用例）
├── config/         # 可选：工具注册表
│   └── tools.json  # 工具元数据列表
└── prompts/        # 可选：提示词
```

### 使用前准备

- **Node.js**：18 及以上
- **依赖**：无额外 npm 包，仅使用 Node 内置模块

无需执行 `npm install`，将上述目录置于工作区内即可通过 `require` 或 OpenClaw 技能机制调用。

---

## 3. 快速开始

### 3.1 引入与单例调用

```javascript
const { caller } = require('./agents/skills/skill-09-tool-caller/index.js');

// 工具发现
const discoverResult = await caller.call({ action: 'discover' });
console.log(discoverResult.result.tools);

// 执行内置 echo 工具
const execResult = await caller.call({
  toolName: 'echo',
  params: { text: 'hello' },
});
console.log(execResult.success, execResult.result.echoed); // true 'hello'
```

### 3.2 带选项的执行

```javascript
const result = await caller.call({
  toolName: 'ping',
  params: {},
  options: {
    timeout: 3000,
    retries: 2,
    retryDelay: 500,
    format: 'json',
  },
});
```

### 3.3 工具发现 + 过滤

```javascript
const filtered = await caller.call({
  action: 'discover',
  options: { filter: 'echo' },
});
// result.tools 仅包含名称或描述中包含 "echo" 的工具
```

---

## 4. API 参考

### 4.1 `call(input)` 方法

**签名：**

```javascript
call(input) => Promise<CallResult>
```

**输入 `input`：**

| 场景       | 字段        | 类型   | 必填 | 说明 |
|------------|-------------|--------|------|------|
| 工具发现   | `action`    | string | 是   | 固定为 `"discover"` |
| 工具发现   | `options`   | object | 否   | 可选 `filter`（按名称/描述过滤） |
| 工具执行   | `toolName`  | string | 是   | 工具名称或唯一标识 |
| 工具执行   | `params`    | object | 依工具 | 工具参数，可为 `{}` |
| 工具执行   | `options`   | object | 否   | 见下表 |

**执行用 `options`：**

| 选项         | 类型   | 默认值 | 范围/说明 |
|--------------|--------|--------|-----------|
| `timeout`    | number | 5000   | 100–5000 ms，单次调用超时 |
| `retries`    | number | 3      | 0–5，失败后最大重试次数（不含首次） |
| `retryDelay` | number | 1000   | 0–2000 ms，重试间隔 |
| `format`     | string | `"json"` | `"json"` \| `"raw"`，结果解析方式 |

### 4.2 输出格式

**成功（执行）：**

```json
{
  "success": true,
  "result": { "echoed": "hello" },
  "metadata": {
    "duration": 12,
    "attempts": 1,
    "toolName": "echo",
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

**成功（发现）：**

```json
{
  "success": true,
  "result": {
    "tools": [
      {
        "name": "echo",
        "description": "Echo back input text",
        "paramsSchema": { "type": "object", "properties": { "text": { "type": "string" } } },
        "metadata": {}
      }
    ]
  },
  "metadata": {
    "duration": 2,
    "total": 2,
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

**失败：**

```json
{
  "success": false,
  "result": null,
  "error": {
    "code": "TOOL_NOT_FOUND",
    "message": "Tool not found: xxx",
    "details": { "toolName": "xxx" }
  },
  "metadata": {
    "duration": 1,
    "attempts": 1,
    "toolName": "xxx",
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

---

## 5. 工具发现说明

- **触发**：`input.action === 'discover'` 时只做发现，不执行任何工具。
- **数据来源**：
  - 若存在 `config/tools.json`，从中加载工具列表（`tools` 数组，每项需含 `name`）。
  - 内置默认注册 `echo`、`ping` 两个示例工具，无 config 时也可发现与执行。
- **过滤**：`options.filter` 为字符串时，按工具 `name` 或 `description` 包含该字符串（不区分大小写）过滤。
- **返回**：`result.tools` 为数组，每项包含 `name`、`description`、`paramsSchema`、`metadata`。

---

## 6. 参数验证规则

| 校验项           | 规则 |
|------------------|------|
| `input`          | 必须为对象，否则 `INVALID_PARAMS` |
| `toolName`       | 必填，非空字符串，否则 `INVALID_PARAMS` |
| `params`         | 必须为对象（可为 `{}`），缺失时按 `{}` 处理 |
| `options`        | 必须为对象（可为 `{}`），缺失时使用默认值 |
| `paramsSchema.required` | 若工具定义 `paramsSchema.required` 数组，则 `params` 必须包含其中所有键，否则 `INVALID_PARAMS` |

`timeout` / `retries` / `retryDelay` 会被限制在文档约定范围内（见 API 参考）。

---

## 7. 错误处理指南（6 种错误码）

所有失败响应均包含 `success: false`、`result: null`、`error`、`metadata`。`error` 结构：`{ code, message, details? }`。

| 错误码                  | 说明 |
|-------------------------|------|
| `TOOL_TIMEOUT`          | 单次调用在 `options.timeout` 内未完成 |
| `TOOL_RETRY_EXHAUSTED`  | 重试次数用尽仍失败（最后一次可为执行异常或超时） |
| `TOOL_NOT_FOUND`        | 工具不存在或未注册 |
| `INVALID_PARAMS`        | 输入不合法或缺少 `paramsSchema.required` 中的必填参数 |
| `EXECUTION_ERROR`       | 工具执行阶段抛出异常（如工具内部错误、第三方 API 错误） |
| `PARSE_ERROR`           | 工具返回内容在 `format: 'json'` 下无法解析为 JSON |

**注意：** `TOOL_NOT_FOUND` 与 `INVALID_PARAMS` 不会触发重试；其余错误在重试次数内会按 `retryDelay` 重试。

**示例：按错误码分支**

```javascript
const out = await caller.call({ toolName: 'echo', params: { text: 'hi' } });
if (!out.success) {
  switch (out.error.code) {
    case 'TOOL_TIMEOUT':
      // 考虑增大 timeout 或检查工具性能
      break;
    case 'TOOL_RETRY_EXHAUSTED':
      // 重试已用尽，记录 out.error.details
      break;
    case 'TOOL_NOT_FOUND':
      // 检查 toolName 或注册工具
      break;
    case 'INVALID_PARAMS':
      // 检查 params 与工具 paramsSchema.required
      break;
    case 'EXECUTION_ERROR':
      // 工具或下游异常，查看 out.error.message / details
      break;
    case 'PARSE_ERROR':
      // 使用 format: 'raw' 或修复工具返回格式
      break;
  }
}
```

---

## 8. 结果解析规则

- **`format: 'json'`（默认）**
  - 工具返回为**对象**（且非 `Buffer`）：直接作为 `result`。
  - 工具返回为**字符串**：尝试 `JSON.parse`，失败则 `PARSE_ERROR`。
  - 工具返回为 **Buffer**：按 UTF-8 转字符串再 `JSON.parse`，失败则 `PARSE_ERROR`。
  - 其他类型（如 number）：原样作为 `result`。
- **`format: 'raw'`**
  - 不做 JSON 解析，原样返回工具返回值作为 `result`。

---

## 9. 测试运行说明

验收测试共 **10 个用例**，使用 Node.js 内置 `assert`，无需安装测试框架。

**运行方式：**

```bash
# 在技能目录下
cd agents/skills/skill-09-tool-caller
node test.js
```

**从工作区根目录：**

```bash
node agents/skills/skill-09-tool-caller/test.js
```

**预期输出示例：**

```
Skill-09 Tool Caller 验收测试

  [PASS] TC-01: 工具发现 - 验证 discover 返回工具列表
  [PASS] TC-02: 工具执行成功 - 验证 call 返回 success=true
  ...
---
总计: 10/10
```

退出码：全部通过为 `0`，否则为 `1`。

---

## 10. 常见问题 FAQ

| 问题 | 说明 |
|------|------|
| 如何添加自定义工具？ | 在 `config/tools.json` 的 `tools` 数组中增加 `name`、`description`、`paramsSchema`、`metadata`，并确保有可调用的实现（当前实现中工具需在代码内注册 `run` 或通过扩展机制注入）。内置 `echo`、`ping` 为示例，无 config 时也可用。 |
| 超时时间能大于 5 秒吗？ | 不能。`timeout` 会被限制在 100–5000 ms，保证端到端 &lt; 5 秒。 |
| 发现列表为空？ | 检查 `config/tools.json` 是否存在且格式正确（含 `tools` 数组）；无 config 时应有内置 `echo`、`ping`。 |
| 返回 PARSE_ERROR？ | 工具返回了非 JSON 字符串或非法 JSON，而 `format` 为 `json`。可改为 `format: 'raw'` 或让工具返回合法 JSON。 |
| 如何做集成测试？ | 使用导出的 `ToolCaller`、`ToolDiscovery`，在测试中 `new ToolCaller({ discovery })` 并 `discovery.register(...)` 注册模拟工具，再调用 `caller.call(...)`。参见 `test.js` 中的 `createTestCaller`。 |

---

## 11. 验收标准验证说明

本技能验收以 `test.js` 中的 10 个用例为准，与 SKILL.md 中验收标准对应关系如下：

| 用例 | 场景           | 验证要点 |
|------|----------------|----------|
| TC-01 | 工具发现       | `action: 'discover'` → `success: true`，`result.tools` 为数组，项含 `name`、`description`，`metadata.duration` 存在 |
| TC-02 | 执行成功       | `toolName: 'echo'`、合法 `params` → `success: true`，`result.echoed` 正确，`metadata.duration` 合理 |
| TC-03 | 超时           | 会超时的工具 + 小 `timeout`、`retries: 0` → `success: false`，`error.code === 'TOOL_TIMEOUT'`，`metadata.attempts` 正确 |
| TC-04 | 重试耗尽       | 必然失败的工具 + `retries: 2` → `success: false`，`error.code === 'TOOL_RETRY_EXHAUSTED'`，`metadata.attempts === 3` |
| TC-05 | 工具不存在     | 不存在的 `toolName` → `success: false`，`error.code === 'TOOL_NOT_FOUND'` |
| TC-06 | 参数无效       | 缺少 `paramsSchema.required` 的键 → `success: false`，`error.code === 'INVALID_PARAMS'` |
| TC-07 | 执行异常       | 会抛错的工具 + `retries: 0` → `success: false`，`error.code` 为 `EXECUTION_ERROR` 或 `TOOL_RETRY_EXHAUSTED`，`error.message` 存在 |
| TC-08 | 解析失败       | 返回非 JSON 字符串 + `format: 'json'` → `success: false`，`error.code === 'PARSE_ERROR'` |
| TC-09 | 错误码覆盖     | 6 种错误码均在上述用例中覆盖 |
| TC-10 | 性能           | 正常调用 `ping`，`metadata.duration < 5000` 且端到端响应 &lt; 5 秒 |

**指标要求：**

- 工具调用成功率 ≥99%（在工具可用、参数正确的前提下）
- 错误处理覆盖率 100%（上述 6 种错误码均有对应用例）
- 响应时间 &lt; 5 秒（单次调用含重试）

验收通过条件：在技能目录下执行 `node test.js` 得到 `总计: 10/10` 且退出码为 0。
