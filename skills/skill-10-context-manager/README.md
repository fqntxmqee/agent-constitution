# Skill-10: 上下文管理智能体 (Context Manager)

**版本**: 1.0 · **创建日期**: 2026-03-10 · **归属**: 支撑层 / 上下文管理

---

## 1. 技能简介

**上下文管理智能体** 提供统一的上下文 **收集、压缩、注入与清理** 能力，用于：

- **收集**：汇聚会话上下文与工具执行上下文为统一格式
- **压缩**：对长上下文进行压缩，在控制长度的同时保留关键信息（目标信息保留率 ≥90%、上下文完整性 ≥95%）
- **注入**：产出可供 LLM 请求使用的上下文内容，并控制最大长度
- **清理**：在会话结束时按 `sessionId` 清理缓存，释放资源

本技能为 **纯 JavaScript** 实现，**Node.js 18+**，**无外部依赖**，单次调用响应时间目标 **<200ms**。适用于主会话及各子智能体在需要收集、压缩、注入或清理上下文时调用。

---

## 2. 安装说明

### 目录位置

将本技能放置在 OpenClaw 工作区的技能目录下：

```
agents/skills/skill-10-context-manager/
├── README.md          # 本使用文档
├── SKILL.md           # 技能规约（输入输出、验收标准）
├── index.js           # 技能入口，导出 manager 与 manage()
├── test.js            # 验收测试（10 个用例）
├── quick-check.js     # 快速检查脚本
└── prompts/           # 可选：提示词等
```

### 使用前确认

- 已安装 **Node.js 18+**
- 在工作区或调用方项目中通过 `require('./agents/skills/skill-10-context-manager')` 或配置的路径引用本技能

无需 `npm install`，无第三方依赖。

---

## 3. 快速开始

### 3.1 引入并调用 manage

```javascript
const { manager } = require('./agents/skills/skill-10-context-manager');

// 收集上下文
const collected = manager.manage({
  action: 'collect',
  context: '当前用户问题：今天天气如何？',
  options: { sources: ['session', 'tools'] },
});
console.log(collected.success, collected.context);

// 压缩长文本
const compressed = manager.manage({
  action: 'compress',
  context: '很长的一段对话或工具输出...',
  options: { strategy: 'summary', maxLength: 2000, compressionRatio: 0.5 },
});
console.log(compressed.context, compressed.metadata.retentionRate);

// 注入前长度控制
const injectable = manager.manage({
  action: 'inject',
  context: compressed.context,
  options: { maxLength: 8192 },
});

// 会话结束清理
manager.manage({
  action: 'clear',
  options: { sessionId: 'user-123' },
});
```

### 3.2 预置会话/工具数据再收集

若需从“存储”中收集会话与工具执行记录，需先通过 `getCollector()` 写入，再 `collect`：

```javascript
const { manager } = require('./agents/skills/skill-10-context-manager');
const coll = manager.getCollector();

coll.setSessionContext('default', 'User: 查询北京天气\nAssistant: 正在查询...');
coll.appendToolExecution('default', 'get_weather(city=Beijing) -> 25°C');

const out = manager.manage({
  action: 'collect',
  context: '',
  options: { sources: ['session', 'tools'] },
});
// out.context 包含 [session] 与 [tools] 段落
```

---

## 4. API 参考

### 4.1 manage(input)

统一入口，根据 `input.action` 分发到收集、压缩、注入或清理。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 是 | 见下方输入格式 |

**返回值**：`{ success, context?, metadata?, error?, message? }`，见下方输出格式。

---

### 4.2 输入格式

```json
{
  "action": "collect | compress | inject | clear",
  "context": "上下文数据（collect/compress/inject 时）或可选（clear 时可为空）",
  "options": {
    "maxLength": 8192,
    "compressionRatio": 0.5,
    "strategy": "summary | truncate | semantic",
    "sources": ["session", "tools"],
    "sessionId": "可选：会话标识，clear 时定位"
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | `collect` 收集 / `compress` 压缩 / `inject` 注入 / `clear` 清理 |
| `context` | 依 action | collect：可为空或待汇聚的原始内容；compress/inject：待处理上下文；clear：可为空 |
| `options` | 否 | 可选，未传则使用默认值 |

**options 默认值**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxLength` | number | 8192 | 目标最大长度（字符），compress/inject 时生效 |
| `compressionRatio` | number | 0.5 | 压缩目标比例 (0–1)，compress 时生效 |
| `strategy` | string | `summary` | 压缩策略：`summary` / `truncate` / `semantic` |
| `sources` | array | `["session", "tools"]` | 收集来源，collect 时生效 |
| `sessionId` | string | `"default"` | 会话标识，clear 时定位，collect 时也可用于取对应会话 |

---

### 4.3 输出格式

**成功时：**

```json
{
  "success": true,
  "context": "处理后的上下文（collect/compress/inject 时有值；clear 时为空字符串或省略）",
  "metadata": {
    "originalLength": 16000,
    "compressedLength": 8000,
    "retentionRate": 0.92,
    "duration": 150,
    "action": "compress"
  }
}
```

**失败时：**

```json
{
  "success": false,
  "error": "CONTEXT_COMPRESS_FAILED",
  "message": "错误详情",
  "metadata": { "duration": 10, "action": "compress" }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `context` | string | 处理后的上下文；clear 时多为空 |
| `metadata` | object | 见下表 |
| `error` | string | 失败时的错误码 |
| `message` | string | 失败时的说明 |

**metadata 常见字段**

| 字段 | 类型 | 说明 |
|------|------|------|
| `originalLength` | number | 原始长度（字符） |
| `compressedLength` | number | 压缩后长度（compress） |
| `retentionRate` | number | 信息保留率 0–1（compress） |
| `injectedLength` | number | 注入内容长度（inject） |
| `duration` | number | 本次调用耗时（毫秒） |
| `action` | string | 本次执行的 action |
| `clearedSessionId` | string | 清理的会话 ID（clear） |

---

## 5. 上下文收集说明

- **作用**：根据 `options.sources` 从会话存储与工具执行记录中汇聚上下文，输出统一格式字符串。
- **来源**：
  - `session`：来自当前传入的 `context` 或通过 `getCollector().setSessionContext(sessionId, data)` 写入的会话内容。
  - `tools`：来自 `getCollector().appendToolExecution(sessionId, record)` 追加的工具执行记录。
- **输出格式**：按 `[session]`、`[tools]`、`[input]` 等段落拼接，顺序与来源可追溯；若传入的 `context` 有内容且未被 session/tools 覆盖，会以 `[input]` 形式放在前面。
- **会话定位**：`options.sessionId` 决定从哪个会话取 session/tools 数据，默认 `"default"`。

---

## 6. 上下文压缩策略（truncate / summary / semantic）

在 `action: 'compress'` 时，通过 `options.strategy` 选择策略，并结合 `maxLength` 或 `compressionRatio` 控制长度。

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **truncate** | 保留首尾各约一半长度，中间用 `...[truncated]...` 替代 | 快速截断，保证首尾可见 |
| **summary** | 保留前约 40% 行、后约 30% 行，中间用 `...[summary]...` 连接；若仍超长则再 truncate | 兼顾开头、结尾与结构，适合对话/日志 |
| **semantic** | 按句切分，对首句/末句及含关键词（如 error、result、key、重要、结论等）的句子打分，按分数保留句子直到达到目标长度 | 保留“关键句”，适合结果、错误、结论类文本 |

**默认与长度**：未指定时 `strategy=summary`；实际最大长度取 `min(maxLength, 原长 × compressionRatio)`。

**质量指标**：实现目标为 **上下文完整性 ≥95%**、**信息保留率 ≥90%**（由 `metadata.retentionRate` 体现）。

---

## 7. 上下文注入规则

- **作用**：将已有上下文（通常为压缩后）整理成可放入 LLM 请求的内容，并严格限制长度。
- **行为**：若 `context` 长度 ≤ `options.maxLength`，原样返回；否则在 `maxLength - 20` 处截断并追加 `...[trimmed for injection]`。
- **职责边界**：本技能只产出「可注入内容」及 `metadata.injectedLength`；实际写入 LLM 请求由调用方完成。

---

## 8. 上下文清理规则

- **作用**：按会话释放上下文缓存，避免内存或存储占用。
- **定位**：`options.sessionId` 指定要清理的会话，缺省为 `"default"`。
- **效果**：清除该会话的 session 与 tools 存储，清理后对该 sessionId 再执行 `collect` 将不再包含之前的数据；返回的 `context` 为空，`metadata.clearedSessionId` 为被清理的会话 ID。
- **无 sessionId**：未传 `sessionId` 时清理默认会话。

---

## 9. 测试运行说明

### 运行验收测试（10 个用例）

```bash
cd agents/skills/skill-10-context-manager
node test.js
```

期望输出类似：

```
TC-01: 收集上下文 - 验证 collect 返回完整上下文 [PASS]
TC-02: 压缩上下文 (truncate) - 验证 truncate 策略正确 [PASS]
...
---
总计: 10/10
```

退出码：全部通过为 0，否则为 1，便于 CI 使用。

### 快速检查

若存在 `quick-check.js`，可执行：

```bash
node quick-check.js
```

---

## 10. 常见问题 FAQ

| 问题 | 说明 |
|------|------|
| **collect 拿不到 session/tools 内容** | 需先用 `manager.getCollector().setSessionContext(sessionId, data)` 和 `appendToolExecution(sessionId, record)` 写入；且 `options.sources` 需包含 `session` 或 `tools`。 |
| **compress 后 retentionRate 偏低** | 目标实现为 ≥90%；若需更高保留率，可适当增大 `maxLength` 或减小 `compressionRatio`，或选用 `truncate` 保留首尾。 |
| **inject 返回的内容要写到哪里？** | 本技能只返回 `context` 字符串与长度信息；由调用方将 `context` 填入 LLM 的 system/context 字段或等价位置。 |
| **clear 后还能恢复吗？** | 不能；clear 会删除该 sessionId 的 session 与 tools 缓存，不保留可恢复状态。 |
| **响应超过 200ms 怎么办？** | 实现已按轻量设计；若仍超时，可检查是否传入过大 context、或外部 I/O，必要时先本地截断再调用 compress。 |
| **action 报 CONTEXT_INVALID_ACTION** | 确保 `action` 仅为 `collect`、`compress`、`inject`、`clear` 之一，且为小写字符串。 |
| **compress/inject 报 context required** | `compress` 与 `inject` 需要传入 `context`（可为空字符串）；`collect` 与 `clear` 可无 context。 |

---

## 11. 验收标准验证说明

验收以 `test.js` 中 **10 个测试用例** 为准，并满足以下指标：

| 指标 | 要求 | 验证方式 |
|------|------|----------|
| **用例数量** | ≥10 | 运行 `node test.js`，总计 10/10 通过 |
| **上下文完整性** | ≥95% | TC-07：收集后内容完整、可解析 |
| **压缩信息保留率** | ≥90% | TC-08：`metadata.retentionRate >= 0.9` |
| **响应时间** | <200ms | TC-10：collect/compress/inject/clear 各一次，每次 `metadata.duration < 200` |

**用例与场景对照**

| 用例 ID | 场景 | 验收要点 |
|---------|------|----------|
| TC-01 | collect 会话+工具 | success=true，context 含 session/tools，duration 存在 |
| TC-02 | compress truncate | 长度≤maxLength+余量，含 `...[truncated]...` |
| TC-03 | compress summary | 长度受控，含 `...[summary]...` 或有效内容 |
| TC-04 | compress semantic | 长度受控，retentionRate 存在 |
| TC-05 | inject | 返回字符串，长度≤maxLength+余量 |
| TC-06 | clear 按 sessionId | success=true，清理后该 session 的 collect 不再含旧数据 |
| TC-07 | 上下文完整性 | 收集后内容完整率 ≥95% |
| TC-08 | 压缩保留率 | retentionRate ≥0.9 |
| TC-09 | 非法 action | success=false，error=CONTEXT_INVALID_ACTION |
| TC-10 | 性能 | 四种 action 各一次，duration <200ms |

**本地验收步骤**

1. 在技能目录执行：`node test.js`
2. 确认输出为 `总计: 10/10` 且退出码为 0
3. 若有 CI，将 `node test.js` 加入流水线即可

---

## 相关文档

- 技能规约与输入输出细节：`SKILL.md`
- 工作区规范：工作区根目录 `AGENTS.md`
- 宪法与 P0 技能计划：`agents/docs/specs/constitution/CONSTITUTION_V3.7.md`、`agents/docs/specs/README.md`（规范索引）
