---
name: context-manager
description: Collects session and tool-execution context, compresses long context while preserving key information, injects context into LLM requests with length control, and clears context on session end. Use when collecting, compressing, injecting, or clearing context for LLM or agent workflows.
---

# Skill-10: 上下文管理智能体 (Context Manager)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属层级**: 支撑层 / 上下文管理  
**归属智能体**: 主会话、各子智能体（需收集、压缩或注入上下文时）  
**状态**: 📋 规约中

---

## 📋 技能描述

提供统一的上下文收集、压缩、注入与清理能力。支撑会话上下文与工具执行上下文的汇聚，长上下文的压缩与关键信息保留，以及将处理后的上下文注入 LLM 请求并控制长度；在会话结束时执行上下文清理，保证上下文完整性、信息保留率与响应时效。

---

## 🎯 触发条件

- 需要**收集**上下文时（会话上下文、工具执行上下文汇聚）
- 需要**压缩**长上下文时（保留关键信息、控制长度）
- 需要**注入**上下文时（将上下文注入 LLM 请求、控制上下文长度）
- 需要**清理**上下文时（会话结束、释放资源）

---

## 📥 输入

```json
{
  "action": "collect | compress | inject | clear",
  "context": "上下文数据（collect/compress/inject 时）或可选（clear 时可为空）",
  "options": {
    "maxLength": 8192,
    "compressionRatio": 0.5,
    "strategy": "summary | truncate | semantic",
    "sources": ["session", "tools"],
    "sessionId": "可选：会话标识，用于 clear 时定位"
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | 操作类型：`collect` 收集、`compress` 压缩、`inject` 注入、`clear` 清理 |
| `context` | 依 action | `collect` 时为待汇聚的原始上下文或来源描述；`compress`/`inject` 时为待处理上下文；`clear` 时可为空 |
| `options` | 否 | 可选参数，见下表 |

### options 说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxLength` | number | 8192 | 目标最大长度（字符或 token 数，由实现约定）；compress/inject 时生效 |
| `compressionRatio` | number | 0.5 | 压缩目标比例（0–1），压缩后长度 ≈ 原长 × compressionRatio；compress 时生效 |
| `strategy` | string | `summary` | 压缩策略：`summary` 摘要保留、`truncate` 截断、`semantic` 语义抽取 |
| `sources` | array | `["session", "tools"]` | 收集时指定来源：`session` 会话、`tools` 工具执行；collect 时生效 |
| `sessionId` | string | — | 会话标识，clear 时用于定位待清理的上下文 |

---

## 📤 输出

```json
{
  "success": true,
  "context": "处理后的上下文（collect/compress/inject 时）；clear 时可为空字符串或省略",
  "metadata": {
    "originalLength": 16000,
    "compressedLength": 8000,
    "retentionRate": 0.92,
    "duration": 150,
    "action": "compress"
  }
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 操作是否成功；失败时 `context` 可为空并附带错误信息 |
| `context` | string | 处理后的上下文；collect 为汇聚结果，compress 为压缩结果，inject 为可注入的最终内容，clear 时可为空 |
| `metadata` | object | 元数据，见下表 |

### metadata 说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `originalLength` | number | 原始长度（字符或 token，依实现） |
| `compressedLength` | number | 压缩后长度（compress 时） |
| `retentionRate` | number | 信息保留率（0–1），compress 时建议 ≥0.9 |
| `duration` | number | 本次调用耗时（毫秒） |
| `action` | string | 本次执行的 action |

各 action 的 metadata 约定：

| action | metadata 必含/建议 |
|--------|---------------------|
| `collect` | duration, action；可选 originalLength（汇聚后长度） |
| `compress` | originalLength, compressedLength, retentionRate, duration, action |
| `inject` | duration, action；可选 originalLength、最终注入长度 |
| `clear` | duration, action；可选 clearedKeys 或 clearedSize |

---

## 🔧 执行逻辑

### 步骤 1: 解析与校验

- 校验 `action` 为 `collect` | `compress` | `inject` | `clear` 之一。
- 根据 action 校验 `context`：collect/compress/inject 时 context 必填（inject 可为已处理好的上下文）；clear 时 context 可为空。
- 解析 `options`，填充默认值：`maxLength=8192`、`compressionRatio=0.5`、`strategy=summary`、`sources=["session","tools"]`。

### 步骤 2: 按 action 分发

**collect**

- 根据 `options.sources` 从会话存储与工具执行记录中收集上下文。
- 汇聚为统一格式的 `context` 字符串（或约定结构），保证顺序与来源可追溯（可选在 metadata 中标注）。
- 返回 `success: true`，`context` 为汇聚结果，`metadata.duration` 为耗时（ms）。

**compress**

- 根据 `options.strategy` 与 `options.maxLength` 或 `options.compressionRatio` 对 `context` 进行压缩。
- 计算压缩后长度与信息保留率（retentionRate）：通过关键信息抽样或与原文对比得出，目标 ≥90%。
- 返回 `success: true`，`context` 为压缩后内容，`metadata` 含 originalLength、compressedLength、retentionRate、duration、action。

**inject**

- 将 `context`（可能已压缩）按 LLM 请求格式组装，并确保总长度不超过 `options.maxLength`（若需二次截断则执行）。
- 返回可用于注入的 `context` 及 metadata（duration、action、可选长度信息）。
- 实际写入 LLM 请求由调用方完成；本技能只产出「可注入内容」与长度控制结果。

**clear**

- 根据 `options.sessionId` 或当前会话标识，清理该会话关联的上下文缓存与临时数据。
- 释放资源，不保留可恢复状态；无 sessionId 时清理默认或当前会话。
- 返回 `success: true`，`context` 可为空，`metadata` 含 duration、action。

### 步骤 3: 一致性保证

- 压缩时保证**上下文完整性 ≥95%**（结构完整、无非法截断导致 JSON/文本损坏）。
- 压缩时保证**信息保留率 ≥90%**（关键实体、决策点、工具结果摘要等保留），由 metadata.retentionRate 体现并可验收。

### 步骤 4: 返回结果

- 输出符合「📤 输出」约定的 JSON。
- `metadata.duration` 为本次调用耗时（毫秒），用于满足**响应时间 <200ms** 的验收。

---

## 📁 文件结构

```
agents/skills/skill-10-context-manager/
├── SKILL.md                    # 本文件
├── index.js                    # 技能入口（collect/compress/inject/clear 分发）
├── lib/
│   ├── collect.js              # 上下文收集（会话 + 工具执行）
│   ├── compress.js             # 上下文压缩（strategy、长度与保留率）
│   ├── inject.js               # 上下文注入准备与长度控制
│   └── clear.js                # 上下文清理（按 sessionId 或当前会话）
├── config/
│   └── defaults.json           # 可选：maxLength、compressionRatio 等默认配置
└── test.js                     # 验收测试（至少 10 个用例）
```

---

## 🧪 验收标准

验收以测试用例形式覆盖，至少 **10 个测试用例**，**上下文完整性 ≥95%**，**压缩后信息保留率 ≥90%**，**响应时间 <200ms**。

### 测试用例列表

| 用例 ID | 场景描述 | 输入要点 | 预期结果 |
|---------|----------|----------|----------|
| TC-01 | collect 会话+工具 | action=collect，options.sources=["session","tools"] | success=true，context 含会话与工具执行内容，duration<200ms |
| TC-02 | collect 仅会话 | action=collect，options.sources=["session"] | success=true，context 仅含会话来源 |
| TC-03 | compress 摘要策略 | action=compress，context=长文本，strategy=summary | success=true，compressedLength≤原长，retentionRate≥0.9，duration<200ms |
| TC-04 | compress 截断策略 | action=compress，context=长文本，strategy=truncate，maxLength=1000 | success=true，compressedLength≤1000，上下文完整性≥95% |
| TC-05 | compress 保留率 | action=compress，context=含关键信息的文本 | metadata.retentionRate≥0.9，关键信息仍可识别 |
| TC-06 | inject 长度控制 | action=inject，context=已压缩内容，maxLength=8192 | success=true，产出可注入内容且长度≤maxLength，duration<200ms |
| TC-07 | clear 按 sessionId | action=clear，options.sessionId=某标识 | success=true，该会话上下文被清理，metadata.duration<200ms |
| TC-08 | clear 无 sessionId | action=clear，无 options.sessionId | success=true，默认/当前会话上下文被清理 |
| TC-09 | 上下文完整性 | compress 后 context 无非法截断、JSON 或关键结构完整 | 结构完整、可被下游正确解析，完整性≥95% |
| TC-10 | 性能：响应 <200ms | 任选 collect/compress/inject/clear 各一次 | 每次 metadata.duration<200 |

### 覆盖率与指标要求

- 至少 10 个测试用例，覆盖：collect（多来源/单来源）、compress（摘要/截断、保留率）、inject（长度控制）、clear（按 sessionId/默认）、完整性、性能。
- **上下文完整性 ≥95%**：压缩或截断后的 context 在结构上完整（无半截 JSON、断句等），可被下游安全解析或展示的比例 ≥95%。
- **压缩后信息保留率 ≥90%**：通过关键信息抽样或对比评估，metadata.retentionRate ≥ 0.9。
- **响应时间 <200ms**：单次调用（collect/compress/inject/clear）从接收到返回完整输出的端到端时间 **<200ms**。

---

## ⚡ 性能要求

- **响应时间**：单次调用（collect/compress/inject/clear）从接收到返回完整输出的端到端时间 **<200ms**。
- 实现建议：收集时仅做轻量汇聚、避免大块 I/O；压缩时采用快速摘要或截断，语义策略若耗时需异步或降级；清理时仅删除引用与缓存，不做重计算。

---

## 🔗 依赖与调用关系

- **上游**：主会话、各子智能体（在需要收集、压缩、注入或清理上下文时调用本技能）。
- **下游**：无（本技能为支撑层，产出 context 供调用方注入 LLM 或存储）。
- **工作区约定**：会话与工具执行上下文的存储位置由实现或平台约定（如内存缓存、Redis、会话 store）。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/constitution/CONSTITUTION.md`
- 工作区规范：`AGENTS.md`
- P0 技能实现计划：`agents/docs/specs/README.md`（规范索引）（若已包含 Skill-10）

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：上下文管理智能体规约，collect/compress/inject/clear、输入输出格式、10 条验收用例、完整性≥95%、保留率≥90%、响应<200ms |
