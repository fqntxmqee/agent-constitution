# Skill-25: 系统监控智能体 - 使用文档

**版本**: 1.0 · **更新日期**: 2026-03-10

---

## 1. 技能简介（系统监控智能体）

Skill-25 **系统监控智能体**（System Monitor）为 OpenClaw 工作区提供系统级可观测能力，包括：

| 能力 | 说明 |
|------|------|
| **健康检查** | 对技能或系统组件执行存活探测、依赖可用性、错误率与响应时间检查，判定 `healthy` / `warning` / `critical` |
| **性能监控** | 采集响应时间、错误率、吞吐量、CPU/内存等资源使用指标 |
| **告警处理** | 按级别（info / warning / critical）查询、分级与上报告警，支持告警解决状态 |
| **日志聚合** | 按目标、时间范围与过滤条件收集并分析日志，支撑排障与运维 |

**设计约束**：

- 单次调用端到端 **响应时间 &lt; 1 秒**
- 从异常发生到告警可被查询 **&lt; 10 秒**
- 健康检查对约定检查项 **100% 覆盖**

---

## 2. 安装说明（目录位置）

本技能以**目录形式**安装在工作区技能目录下，无需额外 npm 安装。

**目录位置**：

```
{工作区根目录}/agents/skills/skill-25-system-monitor/
```

**依赖**：仅使用 Node.js 内置模块（`fs`、`path`、`os`），无第三方依赖。

**确认安装**：在技能目录下执行健康检查应成功返回：

```bash
cd agents/skills/skill-25-system-monitor
node -e "const { monitor } = require('./index.js'); console.log(monitor({ action: 'health', target: 'gateway' }));"
```

预期输出中包含 `success: true`、`status`、`metadata`。

---

## 3. 快速开始（使用示例）

### 3.1 在代码中调用

```javascript
const { monitor } = require('./index.js');  // 或按实际路径 require

// 健康检查
const health = monitor({
  action: 'health',
  target: 'skill-04-routing-decider',
  options: { threshold: 0.95 }
});
console.log(health.success, health.status);  // true, 'healthy' | 'warning' | 'critical'

// 性能监控
const perf = monitor({
  action: 'performance',
  target: 'gateway'
});
console.log(perf.metrics?.responseTimeMs, perf.metrics?.resourceUsage);

// 告警查询
const alerts = monitor({
  action: 'alert',
  target: 'skill-04-routing-decider',
  options: { alertLevel: 'critical' }
});
console.log(alerts.alerts);

// 日志聚合
const logs = monitor({
  action: 'log',
  target: 'skill-07-acceptance-tester',
  options: {
    timeRange: { start: '2026-03-10T00:00:00.000Z', end: '2026-03-10T23:59:59.999Z' },
    filters: { level: 'error' }
  }
});
console.log(logs.logs);
```

### 3.2 快速验证脚本

项目提供 `quick-check.js`，可一次性跑完四种 action 与非法输入校验：

```bash
node quick-check.js
```

预期输出类似：

```
health: true healthy
performance: true true
alert: true true
log: true true
invalid: true true
durations < 1000ms: true
```

---

## 4. API 参考（monitor 方法、输入输出格式）

### 4.1 入口方法：`monitor(input)`

| 项目 | 说明 |
|------|------|
| **入参** | 单一大对象 `input`，见下表 |
| **返回值** | 统一结构的监控结果对象（见 4.3） |
| **同步** | 同步调用，无 Promise |

### 4.2 输入格式

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `action` | 是 | `string` | 操作类型：`health` \| `performance` \| `alert` \| `log` |
| `target` | 是 | `string` | 监控目标：技能 ID（如 `skill-01-intent-classifier`）或系统组件（`gateway`、`db`、`cache`） |
| `options` | 否 | `object` | 可选参数，见下表 |

**options 说明**：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `threshold` | `number` | `0.95` | 健康/性能阈值（0–1），低于此值可判定为 warning 或 critical |
| `interval` | `number` | `60` | 检查或采样间隔（秒） |
| `alertLevel` | `string` | — | 告警级别过滤：`info` \| `warning` \| `critical` |
| `timeRange` | `object` | — | `{ start: "ISO8601", end: "ISO8601" }`，log/performance 时用于查询 |
| `filters` | `object` | — | 日志过滤：如 `{ level: "error", component: "skill-04" }` |

**输入示例**：

```json
{
  "action": "health",
  "target": "skill-01-intent-classifier",
  "options": {
    "threshold": 0.95,
    "interval": 60,
    "alertLevel": "warning",
    "timeRange": { "start": "2026-03-10T00:00:00.000Z", "end": "2026-03-10T12:00:00.000Z" },
    "filters": { "level": "error", "component": "skill-04" }
  }
}
```

### 4.3 输出格式

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | `boolean` | 本次操作是否成功；失败时仍可带部分数据与 `error`/`message` |
| `status` | `string` | 健康状态：`healthy` \| `warning` \| `critical` |
| `metrics` | `object` | 性能指标（见 4.4） |
| `alerts` | `array` | 告警列表，每项含 `id`、`level`、`message`、`target`、`timestamp`、`resolved` |
| `logs` | `array` | 日志聚合结果（action=log 时填充） |
| `error` | `string` | 错误码（失败时） |
| `message` | `string` | 错误描述（失败时） |
| `metadata` | `object` | 必含：`action`、`target`、`checkedAt`（ISO8601）、`durationMs` |

**各 action 输出约定**：

| action | 必含/建议字段 |
|--------|----------------|
| `health` | success, status, metadata；可选 metrics、alerts |
| `performance` | success, status, metrics, metadata |
| `alert` | success, alerts, metadata；status 反映当前告警最高级别 |
| `log` | success, logs, metadata |

### 4.4 metrics 说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `responseTimeMs` | `number` | 响应时间（毫秒） |
| `errorRate` | `number` | 错误率（0–1） |
| `throughput` | `number` | 吞吐量（如 QPS） |
| `resourceUsage` | `object` | `cpu`、`memory`（0–1 比例） |

### 4.5 错误码

| 错误码 | 说明 |
|--------|------|
| `MONITOR_INVALID_ACTION` | action 非法或缺失 |
| `MONITOR_INVALID_TARGET` | target 缺失或未注册/未找到 |
| `MONITOR_HEALTH_CHECK_FAILED` | 健康检查执行异常 |
| `MONITOR_PERFORMANCE_FAILED` | 性能采集异常 |
| `MONITOR_ALERT_FAILED` | 告警查询异常 |
| `MONITOR_LOG_AGGREGATION_FAILED` | 日志聚合异常 |

---

## 5. 健康检查说明（检查项列表）

当 `action: 'health'` 时，对 `target` 执行以下检查项（实现上 100% 覆盖），并根据 `options.threshold` 与结果判定 `status`。

| 检查项 | 说明 | 判定规则 |
|--------|------|----------|
| **exists** | 目标是否存在（目录存在或为已注册 target） | 不存在 → critical |
| **index** | 技能目录下是否存在 `index.js` | 不存在 → critical |
| **errorRate** | 最近错误率（来自缓存或默认） | ≥ 0.5 → critical；≥ (1 - threshold) → warning |
| **responseTime** | 响应时间是否正常（如 &lt; 2000ms） | 超时 → warning |

所有检查项均会执行，结果体现在 `status`、`metrics` 或 `alerts` 中。任一项为 critical → `status: 'critical'`；任一项为 warning 且无 critical → `status: 'warning'`；否则 `status: 'healthy'`。检测到异常时会生成告警并写入告警存储，保证 **&lt; 10 秒**内可被 `action: 'alert'` 查询到。

---

## 6. 性能监控规则（指标说明）

当 `action: 'performance'` 时，在 `options.timeRange` 或默认最近窗口内采集目标性能数据。

| 指标 | 字段名 | 说明 | 单位/范围 |
|------|--------|------|-----------|
| 响应时间 | `responseTimeMs` | 请求从发起到收到响应的耗时 | 毫秒 |
| 错误率 | `errorRate` | 失败请求数 / 总请求数 | 0–1 |
| 吞吐量 | `throughput` | 单位时间内成功请求数（如 QPS） | 请求/秒 |
| 资源使用 | `resourceUsage` | cpu、memory 使用率 | 0–1 比例 |

**status 判定**（与 threshold 相关）：

- `errorRate >= (1 - threshold)` 或 `responseTimeMs > 3000` → **critical**
- `errorRate >= 0.05` 或 `responseTimeMs > 1000` → **warning**
- 否则 → **healthy**

---

## 7. 告警处理指南（告警级别、分级处理）

### 7.1 告警级别

| 级别 | 含义 | 处理建议 |
|------|------|----------|
| **info** | 提示信息，无需立即处理 | 记录并可选通知 |
| **warning** | 预警，需关注 | 纳入告警列表，建议 10 秒内可见 |
| **critical** | 严重异常，需立即处理 | 优先展示与通知，确保 &lt; 10 秒可见 |

### 7.2 分级处理规则

- 使用 `action: 'alert'` 并传入 `options.alertLevel` 时，仅返回**该级别**的告警（例如 `alertLevel: 'critical'` 只返回 level 为 `critical` 的告警）。
- 每条告警包含：`id`、`level`、`message`、`target`、`timestamp`（ISO8601）、`resolved`。
- 返回的 `status` 反映当前未解决告警的最高级别：存在未解决 critical → `status: 'critical'`；否则存在 warning → `status: 'warning'`；否则 `status: 'healthy'`。

### 7.3 告警解决

通过模块导出的 `AlertManager` 可对告警进行解决标记（测试或集成时使用）：

```javascript
const { monitor, AlertManager } = require('./index.js');
const alertMgr = new AlertManager();
alertMgr.add({ level: 'warning', message: '...', target: 'gateway' });
// 查询到告警后
alertMgr.resolve(alertId);  // 将对应 id 的告警标记为 resolved
```

---

## 8. 日志聚合规则

当 `action: 'log'` 时，根据 `target`、`options.timeRange`、`options.filters` 收集并聚合日志。

| 维度 | 说明 |
|------|------|
| **target** | 按日志来源（source）过滤，与 target 或空 source 匹配 |
| **timeRange** | `start`/`end`（ISO8601），仅保留时间范围内的条目 |
| **filters.level** | 按日志级别过滤：如 `error`、`warn`、`info` |
| **filters.component** | 按组件/技能 ID 过滤 |

返回的 `logs` 为数组，每项包含 `timestamp`、`level`、`message`、`source`，最多返回 100 条（按时间倒序）。若需写入日志供聚合查询，可使用模块导出的 `LogAggregator.append(entry)`（实现内通过 logStore 存储）。

---

## 9. 测试运行说明

### 9.1 运行验收测试

技能提供至少 10 个验收用例，覆盖四种 action、多 target、阈值与告警级别、边界与性能要求。

```bash
cd agents/skills/skill-25-system-monitor
node test.js
```

预期输出示例：

```
TC-01: 健康检查 - 验证 health action 返回正确状态 [PASS]
TC-02: 性能监控 - 验证 performance action 返回 metrics [PASS]
...
总计: 10/10
```

### 9.2 测试用例清单（与 SKILL 规约对应）

| # | 场景 | 输入要点 | 预期结果 |
|---|------|----------|----------|
| TC-01 | health 正常 | action=health, target=gateway | success=true, status 为 healthy/warning/critical, durationMs 存在 |
| TC-02 | performance 返回 metrics | action=performance, target=skill-04 | success=true, metrics 含 responseTimeMs/errorRate/throughput/resourceUsage |
| TC-03 | alert 返回告警列表 | action=alert, target=gateway | success=true, alerts 为数组，每项含 id/level/resolved |
| TC-04 | log 返回日志列表 | action=log, target=skill-07 | success=true, logs 为数组 |
| TC-05 | 多 target | health 对多个 target | 每个 target 均 success，metadata.target 正确 |
| TC-06 | 告警级别过滤 | alert, options.alertLevel=critical | 返回的 alerts 均为 critical |
| TC-07 | 告警解决 | add → resolve → alert 查询 | 对应告警 resolved=true |
| TC-08 | 健康检查覆盖率 | health 对含多检查项目标 | status 与检查结果一致，metadata 含 durationMs、checkedAt |
| TC-09 | 告警延迟 &lt;10 秒 | 添加告警后立即 alert 查询 | 新告警在 10 秒内可被查询到 |
| TC-10 | 响应 &lt;1 秒 | health/performance/alert/log 各一次 | 每次 metadata.durationMs &lt; 1000 |

---

## 10. 常见问题 FAQ

| 问题 | 说明 |
|------|------|
| **target 报 MONITOR_INVALID_TARGET** | `target` 必须在预置列表（如 skill-01～skill-10、gateway、db、cache）中，或为技能目录下实际存在的目录名（如 `skill-25-system-monitor`）。 |
| **action 报 MONITOR_INVALID_ACTION** | `action` 必须为 `health`、`performance`、`alert`、`log` 之一，且为字符串。 |
| **健康检查总是 critical** | 若 target 为技能目录，请确认该目录存在且内含 `index.js`；同时检查是否有高错误率或响应时间超限（见健康检查项）。 |
| **告警查不到** | 告警为进程内内存存储，重启后清空；且需先有健康检查异常或手动 `AlertManager.add()` 产生告警后，再通过 `action: 'alert'` 查询。 |
| **日志为空** | 默认实现从内存 logStore 聚合，需先通过 `LogAggregator.append()` 或其它方式写入日志后，`action: 'log'` 才有数据。 |
| **durationMs 超过 1000** | 规约要求单次调用 &lt; 1 秒；若超时，检查目标数量、IO 或外部依赖，或联系实现方做轻量探测与缓存优化。 |

---

## 11. 验收标准验证说明

以下验收标准可在本地通过测试与人工核对进行验证：

| 验收项 | 验证方式 |
|--------|----------|
| **测试用例 ≥ 10** | 运行 `node test.js`，确认输出为 `总计: 10/10`（或更多）。 |
| **健康检查覆盖率 100%** | 对约定检查项（exists、index、errorRate、responseTime）均在代码中执行，且结果反映在 `status`、`metrics` 或 `alerts` 中；可阅读 `index.js` 中 `HealthChecker._runChecks` 与测试 TC-08。 |
| **告警延迟 &lt; 10 秒** | 测试 TC-09：添加告警后立即调用 `action: 'alert'`，确认返回结果中包含该告警，且从添加到查询的耗时 &lt; 10 秒。 |
| **响应时间 &lt; 1 秒** | 测试 TC-10：对 health/performance/alert/log 各执行一次，检查每次返回的 `metadata.durationMs` 均 &lt; 1000。 |
| **非法输入不崩溃** | 传入非法 `action` 或无效 `target`，返回 `success: false` 及对应 `error`/`message`，无未捕获异常。 |

**一键验证建议**：

```bash
cd agents/skills/skill-25-system-monitor
node test.js && node quick-check.js
```

两项均通过即可认为当前实现满足上述验收标准。

---

## 相关文档

- 技能规约：`SKILL.md`
- 宪法与 P0 技能计划：`agents/docs/specs/constitution/CONSTITUTION.md`、`agents/docs/specs/README.md`（规范索引）
- 工作区规范：`AGENTS.md`
