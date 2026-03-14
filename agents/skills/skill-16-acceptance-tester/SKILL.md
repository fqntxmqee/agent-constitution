# Skill-16: 验收测试智能体 (Acceptance Tester)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属智能体**: 需求验收智能体  
**归属流程**: 需求解决流程（需求解决完成后触发验收）  
**状态**: 📋 规约中

---

## 📋 技能描述

在需求解决智能体完成执行后，依据执行蓝图中的验收标准（AC）对交付物进行逐项验证，汇总验证结果并生成完整测试报告。作为质量门禁：仅当所有 AC 通过时才允许进入交付阶段；未通过时产出失败诊断与改进建议，支持返工或用户 override。

---

## 🎯 触发条件

- 需求解决智能体已完成执行并提交验收请求
- 已具备：执行蓝图（含 AC 列表）、交付物、执行结果
- 需求验收智能体需要独立验证交付物与规约的一致性

---

## 📥 输入

```json
{
  "blueprint": {
    "path": "openspec/changes/{项目名}/",
    "documents": [
      { "file": "specs/requirements.md", "purpose": "需求规格与验收条件（AC）" },
      { "file": "tasks.md", "purpose": "任务列表" }
    ],
    "acList": [
      {
        "id": "AC-1",
        "description": "AC 描述",
        "verification": "可验证条件或检查方式"
      }
    ]
  },
  "deliverables": {
    "codePaths": ["path/to/file.js", "path/to/component.tsx"],
    "docPaths": ["openspec/changes/{项目名}/design.md"],
    "artifacts": ["构建产物、数据文件等路径或摘要"]
  },
  "executionResults": {
    "summary": "执行摘要",
    "tasksCompleted": ["Task-001", "Task-002"],
    "selfReviewPassed": true,
    "logsOrErrors": "可选：关键日志或错误片段"
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `blueprint` | 是 | 执行蓝图，至少含 `path`；若未提供 `acList` 则从 `blueprint.documents` 指定文件（如 specs/requirements.md）中提取 AC |
| `blueprint.acList` | 否 | 预解析的 AC 列表；若缺失则由本技能从蓝图中提取 |
| `deliverables` | 是 | 交付物：代码路径、文档路径、其他产物，用于逐项对照 AC 验证 |
| `executionResults` | 否 | 需求解决智能体的执行结果与自查结论，用于交叉验证与报告上下文 |

---

## 📤 输出

```json
{
  "overallStatus": "pass|fail",
  "acResults": [
    {
      "acId": "AC-1",
      "description": "AC 描述",
      "status": "pass|fail",
      "evidence": "验证依据（如文件存在、内容片段、测试通过等）",
      "comment": "可选：备注或失败原因"
    }
  ],
  "report": "完整测试报告文本（Markdown 或纯文本），含摘要、逐项 AC 结果、结论与建议",
  "recommendations": [
    "改进建议一：如补充单元测试、文档缺失项等",
    "改进建议二"
  ],
  "metadata": {
    "verifiedAt": "ISO8601 时间",
    "blueprintPath": "openspec/changes/{项目名}/",
    "acTotal": 6,
    "acPassed": 6,
    "acFailed": 0
  }
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `overallStatus` | string | 总体结论：`pass` 仅当全部 AC 通过；否则为 `fail` |
| `acResults` | array | 每个 AC 的验证结果，每项含 `acId`、`description`、`status`、`evidence`、`comment` |
| `report` | string | 完整测试报告，可供飞书/文档同步或人工查阅 |
| `recommendations` | array | 改进建议列表，无论通过与否均可给出（如代码质量、文档、测试覆盖等） |
| `metadata` | object | 元数据：验证时间、蓝图路径、AC 总数/通过数/失败数 |

### 质量门禁规则

- **通过（pass）**：`acResults` 中每一项 `status === "pass"`，且无遗漏 AC。
- **不通过（fail）**：任一 AC 的 `status === "fail"`，或存在蓝图中的 AC 未被验证（遗漏）。
- 仅当 `overallStatus === "pass"` 时，需求验收智能体方可允许进入需求交付阶段；否则应产出《失败诊断报告》并支持返工或用户 override。

---

## 🔧 执行逻辑

### 步骤 1: AC 提取

- 若输入已提供 `blueprint.acList`，则直接使用。
- 否则从 `blueprint.path` 下读取蓝图文档（优先 `specs/requirements.md`、`tasks.md` 或 `checklist.md`），解析出结构化 AC 列表（id、description、verification）。

### 步骤 2: 逐项验证

- 对 `acResults` 中每个 AC，根据 `verification` 或 `description` 确定验证方式（如：文件存在性、内容包含某关键字、运行测试脚本、人工可检查的结论等）。
- 结合 `deliverables` 与 `executionResults` 执行验证，记录 `status`（pass/fail）、`evidence`、必要时 `comment`。

### 步骤 3: 结果汇总

- 统计 `acPassed`、`acFailed`、`acTotal`。
- 判定 `overallStatus`：全部通过为 `pass`，否则为 `fail`。

### 步骤 4: 测试报告生成

- 生成 `report` 文本：包含总体结论、逐项 AC 结果表、证据摘要、结论与建议。
- 格式建议：Markdown，含标题、表格、列表，便于飞书或本地文档同步。

### 步骤 5: 改进建议

- 根据验证过程与交付物质量，生成 `recommendations` 数组（可包含：缺失文档、测试覆盖、代码规范、性能等），无论通过与否均可输出。

### 步骤 6: 返回结果

- 输出符合「📤 输出」约定的 JSON，并确保 `metadata.verifiedAt` 为当前时间（ISO8601）。

---

## 📁 文件结构

```
agents/skills/skill-07-acceptance-tester/
├── SKILL.md                          # 本文件
├── index.js                          # 技能实现（可选）
├── lib/
│   ├── ac-extractor.js               # AC 从蓝图文档提取（可选）
│   ├── ac-validator.js               # 单条 AC 验证逻辑（可选）
│   └── report-builder.js              # 报告文本生成（可选）
├── prompts/
│   ├── acceptance-testing.txt        # 验收测试 Prompt 模板（角色、任务、输入变量、AC 验证指南、报告格式、门禁规则、改进建议）
│   ├── acceptance-verification.txt   # 若用 LLM 辅助验证时的 Prompt 模板（可选）
│   └── system.txt                    # 系统 Prompt（可选）
└── test.js                           # 验收测试用例（至少 8 个）
```

---

## 🧪 验收标准

验收标准以测试用例形式覆盖，至少 **8 个测试用例**，**AC 验证准确率 100%**（即对已知 AC 的通过/失败判定与预期一致）。

### 测试用例列表

| 用例 ID | 场景描述 | 输入要点 | 预期结果 |
|---------|----------|----------|----------|
| TC-01 | 全部 AC 通过 → overallStatus pass | 3 条 AC 均满足，deliverables 完整 | `overallStatus === "pass"`，`acResults` 全为 pass，`acFailed === 0` |
| TC-02 | 单条 AC 失败 → overallStatus fail | 共 3 条 AC，第 2 条不满足 | `overallStatus === "fail"`，对应项 `status === "fail"`，`acFailed >= 1` |
| TC-03 | 无 acList，从蓝图提取 AC | 仅提供 blueprint.path + requirements.md 内容含 AC | 正确解析出 acList，并完成逐项验证，输出 acResults 与 report |
| TC-04 | 缺少 blueprint | blueprint 缺失或 path 无效 | 返回明确错误信息，不产出 overallStatus；错误可读 |
| TC-05 | 缺少 deliverables | deliverables 为空或缺失 | 可报错或按「无可验证交付物」处理，acResults 中相应 AC 可为 fail，并注明原因 |
| TC-06 | report 与 acResults 一致 | 任意合法输入 | report 文本中包含与 acResults 一致的通过/失败结论，且 AC 数量一致 |
| TC-07 | recommendations 非空 | 至少一次输入为部分失败或可改进 | recommendations 数组长度 >= 1，内容与验证结果相关 |
| TC-08 | 性能：响应时间 <5 秒 | 典型输入（如 5 条 AC、若干交付物路径） | 从调用到返回结果的耗时 < 5 秒 |

### 覆盖率与准确率要求

- 至少 8 个测试用例，覆盖：全通过、部分失败、AC 提取、缺输入、report 一致性、recommendations、性能。
- **AC 验证准确率 100%**：在测试中构造的「应通过」「应失败」的 AC，技能输出的 `status` 必须与预期完全一致。

---

## ⚡ 性能要求

- **响应时间**：< 5 秒（在典型输入下，从接收输入到返回完整输出的端到端时间）。
- 若使用 LLM 辅助验证，建议对单次调用设置超时，或采用缓存/规则优先策略以满足时限。

---

## 🔗 依赖技能

- **Skill-06 多模态蓝图转换器**：可选；蓝图形态与文档结构可与 Skill-06 产出对齐，便于从 `specs/requirements.md` 等稳定解析 AC。
- 上游调用方为 **需求验收智能体**：在需求解决智能体提交「交付物 + 自查报告」后调用本技能，依据输出决定是否通过验收或返回《失败诊断报告》。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/constitution/CONSTITUTION.md`
- 需求验收智能体：`agents/constitution/requirement-acceptance/AGENTS.md`
- 需求解决 → 需求验收契约：`agents/constitution/README.md`（智能体间输入输出契约）
- OpenSpec 规范存放位置：`AGENTS.md` 中「📁 OpenSpec 规范存放位置」
- Skill-06：`agents/skills/skill-06-blueprint-converter/SKILL.md`
- P0 技能实现计划：`agents/docs/specs/README.md`（规范索引）

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：验收测试智能体规约，AC 提取、逐项验证、报告生成、质量门禁、8 条验收测试用例、AC 验证准确率 100%、响应时间 <5 秒 |
