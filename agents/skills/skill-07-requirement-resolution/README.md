# Skill-07: 需求解决智能体 - 使用文档

**版本**: 1.0 · **更新**: 2026-03-10

---

## 1. 技能简介（需求解决智能体）

Skill-07（Requirement Resolution）是**需求解决智能体**的核心执行技能。在「执行蓝图已确认」后，按蓝图中的任务/步骤顺序执行，经 **`sessions_spawn`（ACP 或 subagent）** 委托 Worker 产出业务代码，并调用其他必要工具或 API，实时上报进度与异常，失败时自动重试或调整策略，并产出代码/文档/数据等交付物。

| 特性 | 说明 |
|------|------|
| **归属智能体** | 需求解决智能体 |
| **归属流程** | 需求解决流程（宪法 V3.7 8 子 Agent 工作流） |
| **触发条件** | 执行蓝图已确认、主会话或调度器派发需求解决任务 |
| **核心约束** | 开发类代码仅通过 `sessions_spawn`（ACP 或 subagent）由子会话产出；协调会话禁止 `write` 直接写业务代码 |

---

## 2. 安装说明（目录位置）

本技能为工作区内置技能，无需额外安装。

| 项目 | 路径 |
|------|------|
| **技能根目录** | `agents/skills/skill-07-requirement-resolution/` |
| **入口文件** | `index.js` |
| **规约文档** | `SKILL.md` |
| **测试用例** | `test.js`、`quick-test.js` |

**依赖**：Node.js 18+，仅使用内置 `fs`、`path`，无外部 npm 依赖。

---

## 3. 快速开始（使用示例）

### 3.1 在代码中调用

```javascript
const { solver } = require('./agents/skills/skill-07-requirement-resolution/index.js');

async function run() {
  const result = await solver.solve({
    blueprint: {
      path: 'project/my-project/changes/init/',  // 或直接传 tasks 数组
      // tasks: [
      //   { id: 'Task-001', title: '实现登录', steps: ['添加 API', '写测试'], acceptanceCriteria: ['AC-1'] },
      // ],
    },
    context: {
      projectName: 'my-project',
      blueprintForm: 'openspec',
    },
    options: {
      dryRun: false,
      maxRetries: 3,
      timeoutMs: 300000,
      allowPartial: false,
    },
  });

  console.log('状态:', result.status);           // success | error | partial
  console.log('交付物:', result.deliverables);
  console.log('进度:', result.progress);
  console.log('自查:', result.selfReview);
}
run();
```

### 3.2 仅做「预演」不执行（dryRun）

```javascript
const result = await solver.solve({
  blueprint: { path: 'project/my-project/changes/init/' },
  options: { dryRun: true },
});
// result.status === 'success'，result.deliverables 为空，executionLog 为计划条目
```

### 3.3 通过 OpenClaw 调用需求解决智能体

```bash
openclaw agent --agent requirement-resolution --message "按 project/my-project/changes/init/tasks.md 逐项执行，业务代码经 sessions_spawn（ACP/subagent），禁止主会话 write 业务代码"
```

---

## 4. API 参考（solve 方法、输入输出格式）

### 4.1 solve 方法

```javascript
const { solver } = require('./index.js');

const result = await solver.solve(input);
// result: Promise<SolveResult>
```

### 4.2 输入格式

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `blueprint` | 是 | object | 执行蓝图 |
| `blueprint.path` | 条件 | string | 蓝图根路径（当未提供 `blueprint.tasks` 时必填） |
| `blueprint.documents` | 否 | array | 文档列表，如 `[{ file: 'tasks.md', purpose: '...' }]` |
| `blueprint.tasks` | 否 | array | 预解析的任务列表；若提供则可不传 `path` |
| `context` | 否 | object | 执行上下文 |
| `context.projectName` | 否 | string | 项目名 |
| `context.intentResult` | 否 | string | 意图分类结果 |
| `context.blueprintForm` | 否 | string | 蓝图形态：openspec \| content-outline \| execution-plan |
| `options` | 否 | object | 执行选项，见下表 |

**options 字段**

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `dryRun` | boolean | false | 为 true 时仅解析并输出执行计划，不实际执行 |
| `maxRetries` | number | 3 | 单步失败时的最大重试次数（非负整数） |
| `timeoutMs` | number | 300000 | 整体执行超时（毫秒） |
| `reportProgressIntervalMs` | number | 60000 | 进度上报间隔（毫秒） |
| `allowPartial` | boolean | false | 为 true 时部分任务失败仍可返回 partial 并交付已完成部分 |

**输入示例**

```json
{
  "blueprint": {
    "path": "project/my-project/changes/init/",
    "tasks": [
      {
        "id": "Task-001",
        "title": "任务标题",
        "steps": ["步骤 1", "步骤 2"],
        "acceptanceCriteria": ["AC-1", "AC-2"]
      }
    ]
  },
  "context": {
    "projectName": "my-project",
    "blueprintForm": "openspec"
  },
  "options": {
    "dryRun": false,
    "maxRetries": 3,
    "timeoutMs": 300000,
    "allowPartial": false
  }
}
```

### 4.3 输出格式

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | `success` 全部成功；`partial` 部分成功；`error` 失败或超时 |
| `deliverables` | array | 交付物列表，每项含 `type`、`path`、`description` |
| `executionLog` | array | 执行日志，每项含 `timestamp`、`step`、`action`、`status`、可选 `error` |
| `progress` | object | 进度报告，见下表 |
| `selfReview` | object | 自查结果：`passed`、`issues`（及规约中的 `acChecked`、`summary`） |
| `error` | object \| undefined | 失败时存在：`code`、`message`、`details` |

**progress 字段（实现与 SKILL 对应关系）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `total` | number | 总任务数 |
| `completed` | number | 已完成任务数 |
| `failed` | number | 失败任务数 |
| `current` | string \| null | 当前任务 ID |
| `percentage` | number | 完成百分比 0–100 |
| `lastUpdated` | string | ISO8601 时间 |
| `message` | string | 进度描述信息 |

**输出示例（成功）**

```json
{
  "status": "success",
  "deliverables": [
    {
      "type": "artifact",
      "path": "project/my-project/changes/init/Task-001-output",
      "description": "任务标题"
    }
  ],
  "executionLog": [
    {
      "timestamp": "2026-03-10T12:00:00.000Z",
      "step": "Task-001-step-1",
      "action": "步骤 1",
      "status": "success"
    }
  ],
  "progress": {
    "total": 1,
    "completed": 1,
    "failed": 0,
    "current": "Task-001",
    "percentage": 100,
    "lastUpdated": "2026-03-10T12:00:01.000Z",
    "message": "1/1 tasks"
  },
  "selfReview": {
    "passed": true,
    "issues": []
  }
}
```

---

## 5. 蓝图执行说明

- **解析来源**：若未提供 `blueprint.tasks`，则从 `blueprint.path` 下读取 `tasks.md`（及可选的 `design.md`、`specs/requirements.md`），解析为结构化任务与步骤。
- **tasks.md 约定**：
  - 任务标题：`# Task-1 : 任务名` 或 `## Task-1 : 任务名`
  - 步骤区块：以「步骤」或「steps」开头，下列表项 `- 步骤描述`
  - 验收标准：以「AC」「验收标准」等开头，下列表项
- **执行顺序**：严格按 `tasks` 数组顺序执行，每步完成后写入 `executionLog` 并更新 `progress`。
- **开发类任务**：必须通过 **`sessions_spawn`（`runtime="acp"` 或 `runtime="subagent"`）** 在 Worker 会话中执行；协调会话禁止使用 `write` 直接写业务代码（配置文件、文档、脚本等非业务代码允许按规约 write）。

---

## 6. 工具调用规则

- **ToolInvoker**：对外部工具/API 的调用统一经过 `ToolInvoker.invoke(toolName, params)`，内置超时与错误处理。
- **支持工具名**：如 `sessions_spawn`、`exec` 等；当前实现中部分工具为桩实现，实际集成时应对接 OpenClaw 真实 `sessions_spawn` 与运行时。
- **规则**：
  - 所有外部调用需带超时，失败时进入重试或自我修正流程。
  - 开发类步骤应由上层通过 `sessions_spawn` 派发，传入 `task`、`step`、`context`，在 ACP 或 subagent Worker 中执行。

---

## 7. 进度报告机制

- **ProgressReporter** 在每步开始/完成/失败时更新进度。
- **进度内容**：`total`、`completed`、`failed`、`current`、`percentage`、`lastUpdated`、`message`。
- **可选**：通过 `progressReporter.onUpdate(fn)` 注册监听器，在每次更新时收到 `getSnapshot()` 的摘要，用于按 `reportProgressIntervalMs` 或实时上报。
- **异常**：任一步失败或超时会在 `executionLog` 中记录 `status: 'error'` 与 `error`，并视情况将整体 `status` 设为 `error` 或 `partial`（需 `allowPartial`）。

---

## 8. 自我修正说明

- **重试**：单步失败时按 `options.maxRetries` 重试，可结合策略（如降级、跳过非关键步）后重试。
- **蓝图不可实现**：若技术不可行或约束矛盾，**禁止自行修改蓝图**；须将 `status` 置为 `error`，在 `error` 中注明原因，并可产出《蓝图修订建议》供上游处理。
- **Self-Review**：提交验收前必须做自查。`SelfReviewChecker.check()` 会：
  - 检查 `executionLog` 中是否有 `status === 'error'` 或 `'fail'`；
  - 若有 AC 但无交付物且非全部成功，则记为未通过。
- 输出中 `selfReview.passed === true` 表示自查通过，可作为验收前置条件。

---

## 9. 错误处理指南

### 9.1 错误码

| 错误码 | 含义 |
|--------|------|
| `SOLVER_INVALID_INPUT` | 输入无效（缺 blueprint、缺 path 且无 tasks、非法 options） |
| `SOLVER_BLUEPRINT_PARSE_FAILED` | 蓝图解析失败（路径不存在、tasks.md 缺失或读取出错） |
| `SOLVER_EXECUTION_FAILED` | 执行过程抛错 |
| `SOLVER_TIMEOUT` | 执行超过 `options.timeoutMs` |
| `SOLVER_TASK_FAILED` | 某任务在 maxRetries 内始终失败且未开启 allowPartial |
| `SOLVER_PARTIAL` | 部分任务失败且 `allowPartial === true` |

### 9.2 返回错误时的结构

```json
{
  "status": "error",
  "deliverables": [],
  "executionLog": [ /* 至失败点 */ ],
  "progress": { /* 当前进度 */ },
  "error": {
    "code": "SOLVER_TASK_FAILED",
    "message": "Task failed after max retries",
    "details": { "taskId": "Task-002", "retries": 3 }
  }
}
```

### 9.3 建议处理方式

- **SOLVER_INVALID_INPUT**：校验传入的 `blueprint`、`options`（如 maxRetries 非负整数、timeoutMs 正数）。
- **SOLVER_BLUEPRINT_PARSE_FAILED**：确认 `blueprint.path` 存在且包含 `tasks.md`。
- **SOLVER_TIMEOUT**：增大 `timeoutMs` 或拆分任务。
- **SOLVER_TASK_FAILED**：查看 `executionLog` 与 `error.details`，修复环境或步骤后重试；或开启 `allowPartial` 获取部分结果。

---

## 10. 测试运行说明

### 10.1 运行完整测试套件（10 用例）

```bash
cd agents/skills/skill-07-requirement-resolution
node test.js
```

预期输出示例：

```
TC-01: [PASS]
TC-02: [PASS]
...
TC-10: [PASS]

总计: 10/10
```

退出码：全部通过为 0，否则为 1。

### 10.2 快速自测

若存在 `quick-test.js`：

```bash
node quick-test.js
```

### 10.3 测试用例与场景对照

| 用例 ID | 场景 | 验证要点 |
|---------|------|----------|
| TC-01 | 正常执行全部任务 | status === 'success'，deliverables 与任务对应 |
| TC-02 | dryRun | 不写入交付物，executionLog 为 dryRun 计划 |
| TC-03 | 单步失败后重试成功 | 最终 status === 'success' |
| TC-04 | 重试用尽 | status === 'error'，error.code === SOLVER_TASK_FAILED |
| TC-05 | 部分失败 + allowPartial | status === 'partial'，deliverables 仅含已完成 |
| TC-06 | 缺少 blueprint.path | status === 'error'，SOLVER_INVALID_INPUT |
| TC-07 | 超时 | status === 'error'，SOLVER_TIMEOUT |
| TC-08 | 进度完整性 | progress 含 total/completed/failed/current/percentage/lastUpdated/message |
| TC-09 | 蓝图不可实现 | status === 'error'，不篡改蓝图 |
| TC-10 | 非法 options | maxRetries 为负数时 SOLVER_INVALID_INPUT |

---

## 11. 常见问题 FAQ

**Q: 必须传 `blueprint.path` 还是可以只传 `blueprint.tasks`？**  
A: 二选一。有 `blueprint.tasks` 时可不传 `path`；没有 `tasks` 时必须传有效的 `path`，且该路径下存在 `tasks.md`。

**Q: 如何只做「预演」不写任何文件？**  
A: 设置 `options.dryRun: true`。会解析蓝图并生成执行计划，不调用实际工具、不产出 deliverables。

**Q: 部分任务失败时如何仍拿到已完成的交付物？**  
A: 设置 `options.allowPartial: true`。此时返回 `status: 'partial'`，`deliverables` 仅包含已完成任务的产出，`error.code` 为 `SOLVER_PARTIAL`。

**Q: 进度如何实时上报？**  
A: 通过 `solver.progressReporter.onUpdate(fn)` 注册回调，在每步更新时收到 `progress` 快照；或轮询返回的 `result.progress`（若为同步一次返回则无实时流）。

**Q: 开发类代码为什么不能让协调会话直接 write？**  
A: 工作区 `AGENTS.md` 与宪法要求业务代码经 `sessions_spawn` 由 Worker 产出，以保证可追溯与合规；配置文件、文档等非业务代码允许按规约 write。

**Q: 如何接入真实执行 harness？**  
A: 替换或扩展 `ToolInvoker` 的 `invoke('sessions_spawn', ...)`（或等价 OpenClaw API），在 ACP / subagent 运行时中执行步骤并解析结果，返回 `{ success, output, error }`。

---

## 12. 验收标准验证说明

验收以测试用例为主，满足以下即视为符合规约：

| 项目 | 要求 | 验证方式 |
|------|------|----------|
| 测试用例数量 | 至少 10 个 | 运行 `node test.js`，总计 10/10 |
| 蓝图执行完成率 | 100%（正常输入下） | TC-01 等正常场景下所有任务执行并记录 |
| 异常处理覆盖 | 缺输入、重试、重试用尽、部分成功、超时、蓝图不可实现、非法 options | TC-02～TC-10 覆盖上述分支 |
| 输出结构 | 含 status、deliverables、executionLog、progress、selfReview、error（失败时） | 各用例断言对应字段 |
| 自查 | 提交验收前执行 Self-Review，输出 selfReview | TC-01 等成功场景下 selfReview.passed 为 true |

验收通过后，可将本技能作为需求解决智能体的默认执行实现，并与需求验收智能体（Skill-07）对接交付物与 AC 逐项验证。

---

## 相关文档

- 规约详情：本目录下 `SKILL.md`
- 宪法 V3.7：`agents/docs/specs/constitution/CONSTITUTION.md`
- 需求解决智能体工作区：`agents/constitution/requirement-resolution/`
- Hub-Spoke 与任务协议：`agents/docs/specs/constitution/HUB_SPOKE_TASK_MANAGEMENT.md`
