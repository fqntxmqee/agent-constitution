---
name: system-monitor
description: Performs health checks, performance monitoring, alert handling, and log aggregation for skills and system components. Use when checking system health, monitoring response time and resource usage, processing alerts with severity levels, or collecting and analyzing logs.
---

# Skill-25: 系统监控智能体 (System Monitor)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属**: 监控层 / 系统监控  
**归属智能体**: 系统监控智能体、主会话（需健康/性能/告警/日志时）  
**状态**: 📋 规约中

---

## 📋 技能描述

提供系统级健康检查、性能监控、告警通知与日志聚合能力。定期检查技能与系统组件健康状态、检测异常行为；监控响应时间与资源使用；对异常进行分级告警（告警延迟 &lt;10 秒）；收集并分析日志，支撑运维与排障。

---

## 🎯 触发条件

- 需要**检查系统健康状态**时（技能或组件健康检查、异常行为检测）
- 需要**监控性能**时（响应时间、资源使用、错误率等）
- 需要**处理告警**时（异常告警、告警分级与通知）
- 需要**收集或分析日志**时（日志聚合、检索、分析）

---

## 📥 输入

```json
{
  "action": "health | performance | alert | log",
  "target": "技能 ID 或系统组件标识（如 skill-01-intent-classifier、gateway、db）",
  "options": {
    "threshold": 0.95,
    "interval": 60,
    "alertLevel": "info | warning | critical",
    "timeRange": { "start": "ISO8601", "end": "ISO8601" },
    "filters": { "level": "error", "component": "skill-04" }
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | 操作类型：`health` 健康检查、`performance` 性能监控、`alert` 告警处理、`log` 日志聚合 |
| `target` | 是 | 监控目标：技能 ID（如 skill-01-intent-classifier）或系统组件（gateway、db、cache 等） |
| `options` | 否 | 可选参数，见下表 |

### options 说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `threshold` | number | 0.95 | 健康/性能阈值（0–1），低于此值可判定为 warning 或 critical；health/performance 时生效 |
| `interval` | number | 60 | 检查或采样间隔（秒）；health/performance 时生效 |
| `alertLevel` | string | — | 告警级别：`info`、`warning`、`critical`；alert 时用于过滤或上报 |
| `timeRange` | object | — | 时间范围：`start`、`end`（ISO8601）；log/performance 时用于查询 |
| `filters` | object | — | 过滤条件：如 `level`（error/warn/info）、`component`；log 时生效 |

---

## 📤 输出

```json
{
  "success": true,
  "status": "healthy | warning | critical",
  "metrics": {
    "responseTimeMs": 120,
    "errorRate": 0.01,
    "throughput": 100,
    "resourceUsage": { "cpu": 0.3, "memory": 0.5 }
  },
  "alerts": [
    {
      "id": "ALT-001",
      "level": "warning",
      "message": "技能 skill-04 响应时间超过阈值",
      "target": "skill-04-routing-decider",
      "timestamp": "2026-03-10T12:00:00.000Z",
      "resolved": false
    }
  ],
  "logs": [],
  "metadata": {
    "action": "health",
    "target": "skill-01-intent-classifier",
    "checkedAt": "2026-03-10T12:00:00.000Z",
    "durationMs": 80
  }
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 本次操作是否成功；失败时仍可返回部分数据并附带错误信息 |
| `status` | string | 健康状态：`healthy` 正常、`warning` 预警、`critical` 严重异常 |
| `metrics` | object | 性能指标，见下表 |
| `alerts` | array | 告警列表，每项含 `id`、`level`、`message`、`target`、`timestamp`、`resolved` |
| `logs` | array | 日志聚合结果（action=log 时填充）；可为摘要或条目列表 |
| `metadata` | object | 元数据：`action`、`target`、`checkedAt`、`durationMs` |

### metrics 说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `responseTimeMs` | number | 响应时间（毫秒） |
| `errorRate` | number | 错误率（0–1） |
| `throughput` | number | 吞吐量（如 QPS） |
| `resourceUsage` | object | 资源使用：`cpu`、`memory` 等（0–1 比例） |

各 action 的输出约定：

| action | 必含/建议字段 |
|--------|----------------|
| `health` | success, status, metadata；可选 metrics、alerts（若检测到异常） |
| `performance` | success, status, metrics, metadata |
| `alert` | success, alerts, metadata；status 可反映当前告警最高级别 |
| `log` | success, logs, metadata；可选 status（若从日志推断健康状态） |

---

## 🔧 执行逻辑

### 步骤 1: 解析与校验

- 校验 `action` 为 `health` | `performance` | `alert` | `log` 之一。
- 校验 `target` 非空，且为已注册技能 ID 或系统组件标识。
- 解析 `options`，填充默认值：`threshold=0.95`、`interval=60`。

### 步骤 2: 按 action 分发

**health（健康检查）**

- 对 `target` 执行健康探测（如心跳、依赖可用性、最近错误率）。
- 根据 `options.threshold` 与探测结果判定 `status`：healthy / warning / critical。
- 若检测到异常，生成或追加 `alerts`，并保证**告警延迟 &lt;10 秒**（从异常发生到告警出现在输出内）。
- 健康检查覆盖率：对目标所有约定检查项 100% 覆盖（见验收标准）。

**performance（性能监控）**

- 采集 `target` 在 `options.timeRange`（或默认最近 interval）内的性能数据。
- 填充 `metrics`：responseTimeMs、errorRate、throughput、resourceUsage（按实现能力）。
- 根据 `options.threshold` 与 metrics 判定 `status`，必要时写入 `alerts`。

**alert（告警处理）**

- 查询或接收与 `target`、`options.alertLevel` 相关的告警。
- 填充 `alerts` 列表，支持分级（info/warning/critical）与未解决/已解决状态。
- 告警产生后应在 **&lt;10 秒** 内可被本 action 查询到并返回。

**log（日志聚合）**

- 根据 `target`、`options.timeRange`、`options.filters` 收集并聚合日志。
- 返回 `logs`（摘要或条目列表），便于分析与排障。

### 步骤 3: 返回结果

- 输出符合「📤 输出」约定的 JSON。
- `metadata.durationMs` 为本次调用耗时（毫秒），用于满足**响应时间 &lt;1 秒**的验收。

---

## 📁 文件结构

```
agents/skills/skill-25-system-monitor/
├── SKILL.md                 # 本文件
├── index.js                 # 技能入口（action 分发）
├── lib/
│   ├── health.js            # 健康检查逻辑
│   ├── performance.js       # 性能采集与指标计算
│   ├── alert.js             # 告警查询与分级
│   └── log.js               # 日志聚合与过滤
├── config/
│   └── defaults.json        # threshold、interval、告警级别等默认配置
├── prompts/                 # 可选：若用 LLM 做日志分析
│   └── system.txt
└── test.js                  # 验收测试（至少 10 个用例）
```

---

## 🧪 验收标准

- **测试用例**：至少 **10 个**，覆盖 health/performance/alert/log 四种 action、多 target、阈值与告警级别、边界与异常输入。
- **健康检查覆盖率**：对约定检查项 **100%** 覆盖（所有必检项均被执行并反映在 status/metrics/alerts 中）。
- **告警延迟**：从异常发生到告警可被查询/返回 **&lt;10 秒**。
- **响应时间**：单次调用端到端 **&lt;1 秒**。

---

## 🧪 测试用例清单（至少 10 个）

| # | 场景 | 输入要点 | 预期结果 |
|---|------|----------|----------|
| TC-01 | health 正常 | action=health, target=skill-01, 目标健康 | success=true, status=healthy, durationMs&lt;1000 |
| TC-02 | health 异常 | action=health, target=某技能，模拟不可用 | success=true, status=warning 或 critical，alerts 含对应告警 |
| TC-03 | health 覆盖率 | action=health, target=含多检查项组件 | 所有约定检查项均执行，结果体现在 status/metrics/alerts |
| TC-04 | performance 采集 | action=performance, target=skill-04, options.timeRange 有数据 | success=true, metrics 含 responseTimeMs/errorRate 等，durationMs&lt;1000 |
| TC-05 | performance 无数据 | action=performance, target=新组件无历史数据 | success=true, metrics 为默认或空，不报错 |
| TC-06 | alert 分级 | action=alert, options.alertLevel=critical | alerts 仅含 critical 或更高级别（依实现约定） |
| TC-07 | 告警延迟 | 模拟异常后立即调用 action=alert 或 health | 10 秒内返回的 results 中包含该告警 |
| TC-08 | log 聚合 | action=log, target=skill-07, options.filters.level=error | success=true, logs 含符合过滤条件的条目或摘要 |
| TC-09 | 非法 action | action=invalid | success=false 或明确错误信息，不崩溃 |
| TC-10 | 性能：响应 &lt;1 秒 | 任选 health/performance/alert/log 各一次 | 每次 metadata.durationMs&lt;1000 |

### 覆盖率与指标要求

- **健康检查覆盖率 100%**：对技能或组件的所有约定健康检查项（如存活、依赖、错误率）均被执行，结果反映在 `status`、`metrics` 或 `alerts` 中。
- **告警延迟 &lt;10 秒**：异常发生到告警被写入存储并可被 `action=alert` 或 `action=health` 返回的时间不超过 10 秒。
- **响应时间 &lt;1 秒**：单次调用从接收到返回完整输出的端到端时间 **&lt;1 秒**。

---

## ⚡ 性能要求

- **响应时间**：单次调用（任一 action）从接收到返回完整输出的端到端时间 **&lt;1 秒**。
- **告警延迟**：从异常发生到告警可被查询/返回 **&lt;10 秒**。
- 实现建议：健康检查与性能采集采用轻量探测与缓存；告警通道异步写入、同步查询；日志聚合支持时间窗口与索引，避免全量扫描。

---

## 🔗 依赖与调用关系

- **上游**：主会话、进展跟进智能体、运维或监控面板（在需要健康/性能/告警/日志时调用本技能）。
- **下游**：依赖各技能或组件的可观测接口（心跳、指标、日志输出），具体由实现与平台约定。
- **工作区约定**：告警与日志的存储与查询方式由实现或平台约定（如内存队列、Redis、日志文件、APM）。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 工作区规范：`AGENTS.md`
- 进展跟进智能体：`agents/constitution/progress-tracking/`（若存在）
- P0 技能实现计划：`agents/docs/specs/P0_SKILLS_IMPLEMENTATION_PLAN.md`（若已包含 Skill-25）

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：系统监控智能体规约，health/performance/alert/log、输入输出格式、10 条验收用例、健康检查覆盖率 100%、告警延迟 &lt;10 秒、响应 &lt;1 秒 |
