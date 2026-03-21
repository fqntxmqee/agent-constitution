# Skill-07: 验收测试智能体 - 使用文档

**版本**: 1.0 · **归属**: 需求验收智能体 · **运行环境**: Node.js 18+

---

## 1. 技能简介（验收测试智能体）

Skill-07 是**验收测试智能体**（Acceptance Tester）的核心实现，在需求解决智能体完成执行后，依据执行蓝图中的**验收标准（AC）**对交付物进行逐项验证，汇总结果并生成完整测试报告。

| 能力 | 说明 |
|------|------|
| **AC 提取** | 从蓝图 `acList` 或 `blueprint.path` 下文档（如 `specs/requirements.md`）解析 AC 列表 |
| **逐项验证** | 按「文件存在」「内容关键字」「交付物 + 自查」等方式判定每条 AC 的 pass/fail |
| **报告生成** | 输出 Markdown 格式测试报告，含总体结论、逐项 AC 结果表、改进建议 |
| **质量门禁** | 仅当全部 AC 通过时 `overallStatus === "pass"`，方可进入需求交付阶段 |

**典型调用方**：需求验收智能体（在需求解决提交交付物与自查报告后调用本技能，依据输出决定是否通过验收）。

---

## 2. 安装说明（目录位置）

本技能为工作区内置技能，无需额外安装。目录位置：

```
agents/skills/skill-07-acceptance-tester/
├── README.md           # 本使用文档
├── SKILL.md            # 技能规约（输入输出、执行逻辑、验收标准）
├── index.js            # 技能实现（AC 提取、验证、报告、质量门禁）
├── test.js             # 验收测试用例（TC-01 ~ TC-08）
├── run-quick-test.js   # 快速试跑脚本
└── prompts/
    └── acceptance-testing.txt   # 验收测试 Prompt 模板（LLM 辅助时可引用）
```

**依赖**：仅 Node.js 内置模块 `fs`、`path`，无第三方依赖。

---

## 3. 快速开始（使用示例）

### 3.1 在代码中调用

```javascript
const { tester } = require('./agents/skills/skill-07-acceptance-tester/index.js');

const result = await tester.test({
  blueprint: {
    path: 'project/my-project/changes/init/',
    acList: [
      { id: 'AC-1', description: '首页可访问', verification: 'file: src/pages/Home.tsx' },
      { id: 'AC-2', description: 'API 文档包含 GET /api/users', verification: '包含: GET /api/users' },
    ],
  },
  deliverables: {
    codePaths: ['src/pages/Home.tsx'],
    docPaths: ['docs/api.md'],
  },
  executionResults: { selfReviewPassed: true },
});

console.log(result.overallStatus);  // "pass" | "fail"
console.log(result.report);         // Markdown 报告全文
```

### 3.2 快速试跑（无蓝图路径时）

```bash
cd agents/skills/skill-07-acceptance-tester
node run-quick-test.js
```

`run-quick-test.js` 使用内联 `acList`，不依赖 `blueprint.path`，适合在任意工作目录下验证技能是否可用。

### 3.3 从蓝图文档自动提取 AC

当不提供 `acList` 时，技能会从 `blueprint.path` 下文档解析 AC（优先 `specs/requirements.md`、`tasks.md`）：

```javascript
const result = await tester.test({
  blueprint: {
    path: 'project/my-project/changes/init/',
    documents: [
      { file: 'specs/requirements.md', purpose: '需求规格与 AC' },
    ],
  },
  deliverables: { codePaths: ['src/index.js'], docPaths: [] },
  executionResults: { selfReviewPassed: true },
});
```

---

## 4. API 参考（test 方法、输入输出格式）

### 4.1 主入口：`tester.test(input)`

| 项目 | 说明 |
|------|------|
| **方法** | `test(input): Promise<Result>` |
| **输入** | 单参数对象 `input`，见下表 |
| **输出** | Promise 解析为验收结果对象，见 4.3 |
| **异常** | 非法输入或提取失败时抛出 `AcceptanceError`（含 `code`、`message`、`details`） |

### 4.2 输入格式

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `blueprint` | 是 | object | 执行蓝图；须包含 `acList` 或 `path`（二选一或同时提供） |
| `blueprint.path` | 条件 | string | 蓝图目录（相对 cwd 或绝对路径）；未提供 `acList` 时必填 |
| `blueprint.documents` | 否 | array | 用于解析 AC 的文档列表，默认 `[{ file: 'specs/requirements.md' }, { file: 'tasks.md' }]` |
| `blueprint.acList` | 条件 | array | 预解析的 AC 列表；未提供时从 `path` 下文档提取 |
| `blueprint.acList[].id` | 是 | string | AC 标识，如 `AC-1` |
| `blueprint.acList[].description` | 是 | string | AC 描述 |
| `blueprint.acList[].verification` | 否 | string | 验证方式提示（见第 5 节） |
| `deliverables` | 是 | object | 交付物路径集合 |
| `deliverables.codePaths` / `code` | 否 | string[] | 代码文件路径列表 |
| `deliverables.docPaths` / `docs` | 否 | string[] | 文档路径列表 |
| `deliverables.artifacts` | 否 | string[] | 其他产物路径 |
| `executionResults` | 否 | object | 需求解决执行结果，用于交叉验证 |
| `executionResults.selfReviewPassed` / `selfCheck` | 否 | boolean | 自查是否通过（影响无明确验证方式时的 AC 判定） |

### 4.3 输出格式

| 字段 | 类型 | 说明 |
|------|------|------|
| `overallStatus` | `"pass"` \| `"fail"` | 总体结论；仅当全部 AC 通过且无遗漏时为 `pass` |
| `acResults` | array | 每条 AC 的验证结果 |
| `acResults[].acId` | string | AC 标识 |
| `acResults[].description` | string | AC 描述 |
| `acResults[].status` | `"pass"` \| `"fail"` | 该条 AC 状态 |
| `acResults[].evidence` | string | 验证依据（如文件存在、关键字命中） |
| `acResults[].comment` | string? | 可选备注或失败原因 |
| `report` | string | 完整测试报告（Markdown），含摘要、AC 表、改进建议 |
| `recommendations` | string[] | 改进建议列表 |
| `metadata` | object | 元数据 |
| `metadata.verifiedAt` | string | 验证时间（ISO8601） |
| `metadata.acTotal` | number | AC 总数 |
| `metadata.acPassed` | number | 通过数 |
| `metadata.acFailed` | number | 失败数 |

### 4.4 导出与错误码

```javascript
const {
  tester,           // 单例 AcceptanceTester
  AcceptanceTester,
  ACExtractor,
  ACValidator,
  ReportGenerator,
  QualityGate,
  AcceptanceError,
  ERRORS,
} = require('./index.js');

// 错误码
// ERRORS.ACCEPTANCE_INVALID_INPUT
// ERRORS.ACCEPTANCE_EXTRACTION_FAILED
// ERRORS.ACCEPTANCE_VALIDATION_ERROR
// ERRORS.ACCEPTANCE_REPORT_FAILED
// ERRORS.ACCEPTANCE_QUALITY_GATE_ERROR
```

---

## 5. AC 验证指南（文件检查 / 关键字匹配 / 功能验证）

技能对每条 AC 的 `verification`（或 `description`）进行解析，并按以下优先级执行验证。

### 5.1 文件存在性检查

| 适用 | 验证字段包含「文件 path」「file:」「存在」+ 路径、或匹配 `*.md|*.tsx?|*.jsx?|*.json|*.yaml` 等 |
|------|--------------------------------------------------------------------------------------------------|
| 逻辑 | 从 `verification`/`description` 中解析出文件引用，在 `deliverables` 路径下解析并检查 `fs.existsSync` |
| 通过 | 解析出的路径存在 |
| 证据示例 | `File exists: path/to/Component.tsx` / `File not found: docs/missing.md` |

**书写示例**（在 requirements.md 或 acList 中）：

- `verification: "file: src/pages/Home.tsx"`
- `verification: "文件: design.md"`

### 5.2 内容关键字匹配

| 适用 | 验证字段包含「包含」「contain」「content」+ 关键字 |
|------|-----------------------------------------------------|
| 逻辑 | 解析关键字，在 `deliverables` 的 codePaths/docPaths 对应文件中搜索 `content.includes(keyword)` |
| 通过 | 任一交付文件内容包含该关键字 |
| 证据示例 | `Keyword "GET /api/users" found in docs/api.md` |

**书写示例**：

- `verification: "包含: GET /api/users"`
- `verification: "content: export function useAuth"`

### 5.3 交付物存在性 + 执行自查（兜底）

| 适用 | 未匹配到「文件」或「包含」类验证时 |
|------|------------------------------------|
| 逻辑 | 若 `deliverables` 为空或所列路径均不存在 → fail；否则若 `executionResults.selfReviewPassed`/`selfCheck === true` → pass，否则 fail |
| 通过 | 至少一条交付路径存在且执行自查通过 |
| 证据示例 | `Deliverables present; execution self-check passed` |

**建议**：重要 AC 尽量写清 `verification`（file:/包含:），以便可自动、可复现验证。

---

## 6. 测试报告格式说明

`report` 字段为 Markdown 字符串，结构如下：

```markdown
# 验收测试报告

**总体结论**: ✅ 通过 | ❌ 不通过
**验证时间**: 2026-03-10T12:00:00.000Z
**AC 统计**: 共 N 条，通过 M 条，失败 K 条

## 逐项 AC 结果

| AC ID | 描述 | 状态 | 证据 | 备注 |
|-------|------|------|------|------|
| AC-1  | ...  | ✅ pass | ... |  |
| AC-2  | ...  | ❌ fail | ... | 原因摘要 |

## 改进建议

- 建议一
- 建议二

---
```

- 表格中「描述」「证据」「备注」会做长度截断，完整信息以 `acResults[].evidence` / `comment` 为准。
- 报告与 `acResults`、`metadata` 一致，可直接用于飞书/文档同步或人工查阅。

---

## 7. 质量门禁规则

| 结论 | 条件 |
|------|------|
| **pass** | `acResults` 中**每一条** `status === "pass"`，且验证的 AC 数量与蓝图一致（无遗漏） |
| **fail** | 任一条 AC `status === "fail"`，或存在蓝图中的 AC 未被验证（数量不一致） |

- 仅当 `overallStatus === "pass"` 时，需求验收智能体方可允许进入**需求交付阶段**。
- 为 `fail` 时应产出《失败诊断报告》，并支持返工或用户 override。

---

## 8. 测试运行说明

技能自带 8 个验收用例（TC-01 ~ TC-08），用于自检与回归。

### 8.1 运行全部用例

```bash
cd agents/skills/skill-07-acceptance-tester
node test.js
```

**要求**：当前工作目录需为 `skill-07-acceptance-tester`（或能解析到 `index.js`、`SKILL.md` 等路径）。成功时输出 8 个 `[PASS]` 且退出码 0。

### 8.2 用例覆盖摘要

| 用例 | 场景 | 预期 |
|------|------|------|
| TC-01 | 全部 AC 通过 | `overallStatus === "pass"`，`acFailed === 0` |
| TC-02 | 单条 AC 失败（如文件不存在） | `overallStatus === "fail"`，对应项 fail |
| TC-03 | 使用 acList，无 path 文档 | 正确输出 acResults 与 report |
| TC-04 | 缺少 blueprint | 抛出 `AcceptanceError`，code = ACCEPTANCE_INVALID_INPUT |
| TC-05 | 缺少 deliverables | 抛出 ACCEPTANCE_INVALID_INPUT |
| TC-06 | report 与 acResults 一致 | report 含 acTotal/acPassed/acFailed 及每条 acId |
| TC-07 | 有失败 AC | recommendations 长度 ≥ 1 |
| TC-08 | 性能 | 单次调用 < 5 秒（典型 5 条 AC、若干路径） |

---

## 9. 常见问题 FAQ

| 问题 | 说明 |
|------|------|
| **报错：blueprint is required** | 未传 `blueprint` 或非对象。必须提供 `blueprint`，且其中至少包含 `acList` 或 `path`。 |
| **报错：deliverables is required** | 未传 `deliverables`（可为空对象 `{}`，但不能为 `undefined`/`null`）。 |
| **报错：No AC found in blueprint documents** | 未提供 `acList` 且从 `blueprint.path` 下文档未解析到任何 AC。检查 path 是否正确、文档内是否含 `AC-1:` / `- [ ] AC-1:` 等格式。 |
| **AC 一直 fail，但文件明明存在** | 路径相对于 `process.cwd()` 解析。请在正确的工作目录下调用，或使用绝对路径；且该路径需出现在 `deliverables.codePaths`/`docPaths`/`artifacts` 中。 |
| **如何支持「包含某正则」？** | 当前实现仅支持「包含: 某关键字」的简单字符串匹配。复杂规则可扩展 `ACValidator._extractContentKeyword` 或在外层做预处理后传入 acList。 |
| **report 想同步到飞书** | 使用输出的 `report` 字符串创建飞书文档，并将链接写入 `project/{项目名}/changes/init/test-report-feishu-url.txt`（参见 AGENTS.md 验收报告与飞书同步）。 |

---

## 10. 验收标准验证说明

本技能自身的验收标准以 **test.js 中 8 个用例** 为载体，要求：

- **用例数量**：至少 8 个（TC-01 ~ TC-08），覆盖：全通过、单条失败、AC 提取、缺 blueprint、缺 deliverables、report 一致性、recommendations、性能。
- **AC 验证准确率**：在测试中构造的「应通过」「应失败」的 AC，技能输出的 `status` 与预期一致（100%）。
- **性能**：典型输入下，从调用 `tester.test()` 到返回结果的耗时 < 5 秒。

运行 `node test.js` 通过即视为当前实现满足上述验收标准。若新增 AC 解析规则或验证方式，应同步补充或调整 test.js 中的用例。

---

## 相关文档

- 技能规约：本目录下 `SKILL.md`
- 需求验收智能体：`agents/constitution/requirement-acceptance/AGENTS.md`
- 宪法 V3.7：`agents/docs/specs/constitution/CONSTITUTION.md`
- OpenSpec 规范位置：工作区 `AGENTS.md` 中「📁 OpenSpec 规范存放位置」
