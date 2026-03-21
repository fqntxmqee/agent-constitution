---
name: requirement-solver
description: Executes confirmed execution blueprints step-by-step, calls tools/APIs, reports progress, self-corrects on failure, and produces deliverables. Use when the blueprint is confirmed and tasks need to be executed (requirement resolution phase).
---

# Skill-07: 需求解决智能体 (Requirement Solver)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属智能体**: 需求解决智能体  
**归属流程**: 需求解决流程  
**状态**: 📋 规约中

---

## 📋 技能描述

在「执行蓝图已确认」后，按蓝图中的任务/步骤顺序执行，调用必要的外部工具或 API，实时上报进度与异常，失败时自动重试或调整策略，并产出代码/文档/数据等交付物。作为需求解决流程的核心执行技能，确保蓝图执行可追溯、可复现，且仅通过 Cursor CLI（或 ACP 模式）进行开发类代码产出。

---

## 🎯 触发条件

- 执行蓝图已确认（用户已确认 OpenSpec / 内容大纲 / 执行计划）
- 需要执行任务时（主会话或调度器派发需求解决任务）
- 已具备：蓝图路径或蓝图内容、执行上下文、可选执行选项

---

## 📥 输入

```json
{
  "blueprint": {
    "path": "project/{项目名}/changes/init/",
    "documents": [
      { "file": "tasks.md", "purpose": "可执行任务列表" },
      { "file": "specs/requirements.md", "purpose": "需求规格与 AC" },
      { "file": "design.md", "purpose": "技术设计" }
    ],
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
    "projectName": "项目名",
    "intentResult": "可选：意图分类结果",
    "blueprintForm": "openspec|content-outline|execution-plan",
    "previousOutputs": {}
  },
  "options": {
    "dryRun": false,
    "maxRetries": 3,
    "timeoutMs": 300000,
    "reportProgressIntervalMs": 60000,
    "allowPartial": false
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `blueprint` | 是 | 执行蓝图：至少含 `path`；可含 `documents` 或已解析的 `tasks` 列表 |
| `blueprint.path` | 是 | 蓝图根路径，用于读取 tasks.md、specs/requirements.md、design.md 等 |
| `blueprint.tasks` | 否 | 预解析的任务列表；若缺失则从 `path` 下 tasks.md 等解析 |
| `context` | 否 | 执行上下文：项目名、意图、蓝图形态、上游产出等 |
| `options` | 否 | 执行选项：见下表 |

### options 字段说明

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `dryRun` | boolean | false | 为 true 时仅解析蓝图并输出执行计划，不实际执行 |
| `maxRetries` | number | 3 | 单步失败时的最大重试次数 |
| `timeoutMs` | number | 300000 | 整体执行超时（毫秒） |
| `reportProgressIntervalMs` | number | 60000 | 进度上报间隔（毫秒） |
| `allowPartial` | boolean | false | 为 true 时部分任务失败仍可返回 partial 状态并交付已完成部分 |

---

## 📤 输出

```json
{
  "status": "success|error|partial",
  "deliverables": [
    {
      "type": "code|document|data|artifact",
      "path": "相对或绝对路径",
      "description": "简短说明"
    }
  ],
  "executionLog": [
    {
      "taskId": "Task-001",
      "stepIndex": 0,
      "action": "执行描述",
      "result": "success|fail|skipped",
      "timestamp": "ISO8601",
      "detail": "可选：详情或错误信息"
    }
  ],
  "progress": {
    "totalTasks": 5,
    "completedTasks": 5,
    "failedTasks": 0,
    "currentTaskId": "Task-005",
    "percentage": 100,
    "lastUpdated": "ISO8601",
    "message": "全部任务已完成"
  },
  "selfReview": {
    "passed": true,
    "acChecked": ["AC-1", "AC-2"],
    "summary": "自查结论摘要"
  },
  "error": null
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | `success` 全部成功；`partial` 部分成功（需 options.allowPartial）；`error` 执行失败或超时 |
| `deliverables` | array | 交付物列表：代码/文档/数据等，每项含 type、path、description |
| `executionLog` | array | 执行日志：按时间序记录每步的 taskId、stepIndex、action、result、timestamp、detail |
| `progress` | object | 进度报告：总任务数、已完成数、失败数、当前任务、百分比、最后更新时间、消息 |
| `selfReview` | object | 自查结果：是否通过、已核对 AC、摘要；提交验收前必须执行 |
| `error` | object \| null | 当 status 为 error 或 partial 时，可含 code、message、taskId、recoverable 等 |

### 状态判定规则

- **success**：所有任务执行成功，且 selfReview.passed === true。
- **partial**：部分任务成功、部分失败，且 options.allowPartial === true；deliverables 仅含已完成任务的产出。
- **error**：整体失败、超时、或不可恢复异常；executionLog 记录至失败点，error 对象描述原因。

---

## 🔧 核心功能与执行逻辑

### 1. 蓝图执行

- 读取并解析执行蓝图：若未提供 `blueprint.tasks`，则从 `blueprint.path` 下读取 tasks.md（及 design.md、specs/requirements.md 等），解析为结构化任务与步骤。
- 按步骤顺序执行：严格按 tasks 顺序执行，每步完成后写入 executionLog，并更新 progress。
- 开发类任务必须通过 **Cursor CLI**（`cursor agent --print`）或 **ACP 模式** 执行，禁止使用 `write` 直接写业务代码（配置文件、文档、脚本等非业务代码允许 write）。

### 2. 工具调用

- 调用必要的外部工具/API：根据任务类型调用构建、测试、部署或数据接口等，处理返回结果并写入 executionLog。
- 所有外部调用需带超时与错误处理，失败时进入自我修正流程。

### 3. 进度报告

- 实时报告执行进度：按 options.reportProgressIntervalMs 或每步完成后更新 progress（totalTasks、completedTasks、percentage、lastUpdated、message）。
- 异常情况及时上报：任一步失败或超时，在 executionLog 中记录 result: "fail" 与 detail，并视情况设置 status 为 error/partial 或触发重试。

### 4. 自我修正

- 执行失败时自动重试：单步失败时按 options.maxRetries 重试，可调整策略（如降级、跳过非关键步）后重试。
- 若蓝图不可实现（技术不可行、约束矛盾），禁止自行修改蓝图；须将 status 置为 error，在 error 中注明原因，并可选产出《蓝图修订建议》供上游处理。
- 提交验收前必须做 Self-Review：依据蓝图 AC 自检交付物，填写 selfReview（passed、acChecked、summary）。

### 5. 交付物生成

- 产出代码/文档/数据等交付物：按任务要求生成文件或产物，填入 deliverables 数组（type、path、description）。
- 保证交付物与 executionLog 可追溯、与蓝图任务一一对应。

### 执行步骤摘要

1. **校验输入**：校验 blueprint.path 存在、options 合法；缺失必填则返回 status: "error"。
2. **解析蓝图**：解析 tasks 与 steps，若 dryRun 则只返回执行计划不执行。
3. **按序执行**：循环执行每个 task/step，调用 Cursor CLI 或工具/API，记录 executionLog，更新 progress。
4. **失败处理**：失败则重试（≤ maxRetries）或标记失败；不可恢复则设 status: "error" 并返回。
5. **自查**：依据 AC 做 Self-Review，填写 selfReview。
6. **返回结果**：输出符合「📤 输出」约定的 JSON。

---

## 📁 文件结构

```
agents/skills/skill-06-requirement-resolution/
├── SKILL.md                          # 本文件
├── index.js                          # 技能实现（可选）
├── lib/
│   ├── blueprint-parser.js           # 蓝图解析（tasks.md 等）
│   ├── executor.js                   # 步骤执行与 Cursor CLI 调用
│   ├── progress-reporter.js          # 进度上报
│   └── self-review.js                # 自查与 AC 核对
├── prompts/
│   ├── blueprint-execution.txt       # 蓝图执行 Prompt 模板（角色、任务、输入变量、工具规则、进度、自我修正、输出 JSON）
│   ├── execution.txt                 # 执行阶段 Prompt 模板（可选，兼容旧名）
│   └── system.txt                    # 系统 Prompt（可选）
└── test.js                           # 验收测试用例（至少 10 个）
```

---

## 🧪 验收标准

验收标准以测试用例形式覆盖，至少 **10 个测试用例**，**蓝图执行完成率 100%**（在正常输入下全部任务执行完成），**异常处理覆盖率 100%**（所有异常分支均有用例覆盖）。

### 测试用例列表

| 用例 ID | 场景描述 | 输入要点 | 预期结果 |
|---------|----------|----------|----------|
| TC-01 | 正常执行全部任务 → success | 有效 blueprint.path、3 个任务、无 options 异常 | status === "success"，deliverables 与任务对应，progress.percentage === 100，selfReview.passed === true |
| TC-02 | dryRun 不执行 → 仅计划 | options.dryRun === true | 不写入交付物，executionLog 可为空或仅含解析结果，status 可为 success（仅表示解析成功） |
| TC-03 | 单步失败后重试成功 | 某步首次失败、maxRetries >= 1、重试后成功 | executionLog 含失败与重试记录，最终 status === "success" |
| TC-04 | 单步失败达 maxRetries → error | 某步持续失败、重试次数用尽 | status === "error"，error 对象存在，progress 反映失败点 |
| TC-05 | 部分失败 + allowPartial → partial | 5 个任务中 2 个失败、options.allowPartial === true | status === "partial"，deliverables 仅含已完成任务的产出，progress 正确 |
| TC-06 | 缺少 blueprint.path → error | blueprint.path 缺失或无效 | status === "error"，error 含明确 message，不产出 deliverables |
| TC-07 | 超时 → error | 执行时间超过 options.timeoutMs | status === "error"，error 提及超时，executionLog 记录至超时点 |
| TC-08 | 进度报告完整性 | 多任务执行 | progress 在每步或按间隔更新，totalTasks/completedTasks/percentage/lastUpdated 一致，executionLog 与 progress 对应 |
| TC-09 | 蓝图不可实现 → error 不篡改蓝图 | 模拟蓝图约束矛盾或技术不可行 | status === "error"，不修改蓝图文件，error 可含修订建议描述 |
| TC-10 | 异常处理覆盖：非法 options | options.maxRetries 为负数或非数字 | 返回 error 或使用默认值，不崩溃；行为在规约中明确 |

### 覆盖率要求

- **蓝图执行完成率 100%**：在 TC-01 等正常场景下，所有解析出的任务均被完整执行并记录。
- **异常处理覆盖率 100%**：缺输入、失败重试、重试用尽、部分成功、超时、蓝图不可实现、非法 options 等分支均被至少 1 个用例覆盖。

---

## ⚡ 性能要求

- **响应时间**：< 10 秒（从接收输入到返回完整输出的端到端时间，不含长时间运行任务的整段执行时间；若为「启动执行并返回首条进度」的异步模式，则首响 < 10 秒）。
- 若技能为「同步执行全部任务后返回」，则 10 秒内应能完成小规模蓝图（如 ≤5 个简单任务）或至少返回首份 progress 与 executionLog 片段；大规模任务可依赖 progress 流式上报与最终异步结果。

---

## 🔗 依赖技能

- **Skill-06 多模态蓝图转换器**（Blueprint Converter）：上游产出执行蓝图形态与文档结构（OpenSpec / 内容大纲 / 执行计划），本技能消费其 outputPath 与 documents 结构。
- **需求理解智能体**：产出并确认蓝图；本技能在其后执行。
- **需求验收智能体 / Skill-07 验收测试智能体**：下游消费本技能产出的 deliverables 与 selfReview，进行 AC 逐项验证。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/constitution/CONSTITUTION.md`
- 需求解决智能体工作规范：`agents/constitution/requirement-resolution/AGENTS.md`
- ACP 与 Cursor CLI：`docs/OpenClaw-ACP-Cursor-集成方案（官方版）.md`（若存在）
- OpenSpec 规范存放位置：`AGENTS.md` 中「📁 OpenSpec 规范存放位置」
- Skill-06 蓝图转换器：`agents/skills/skill-06-blueprint-converter/SKILL.md`
- Skill-07 验收测试智能体：`agents/skills/skill-07-acceptance-tester/SKILL.md`

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：需求解决智能体规约，蓝图执行、工具调用、进度报告、自我修正、交付物生成；输入/输出格式；至少 10 条验收测试用例，蓝图执行完成率 100%，异常处理覆盖率 100%，响应时间 <10 秒 |
