# Skill-05: 需求理解智能体 - 使用文档

**版本**: 1.0 · **更新**: 2026-03-10

---

## 1. 技能简介（需求理解智能体）

Skill-05 **需求理解（Requirement Understanding）** 是 OpenClaw 宪法 8 子 Agent 工作流中的规约生成环节。在需求澄清完成、用户已确认提案后，将**已确认提案**转化为：

- **规约增量 (Spec Delta)**：相对主规约的 added/modified/removed 及影响范围
- **执行蓝图 (Execution Blueprint)**：OpenSpec 文档规划、可执行任务列表、可验证验收标准 (AC)
- **验证报告**：规约格式校验、与主规约的一致性校验结果

下游**需求解决智能体**按蓝图中的 `tasks.md` 执行，**需求验收智能体**按蓝图中的 AC 逐项验证。

| 项目 | 说明 |
|------|------|
| 归属智能体 | 需求理解智能体 (`requirement-understanding`) |
| 触发条件 | 需求澄清已完成、用户已确认提案；路由为**标准构建流** |
| 依赖 | 需求澄清产出《已确认提案》；可选 Skill-01 意图分类、Skill-03 模糊性检测 |
| 下游 | 需求解决（消费蓝图）、需求验收（使用 AC） |

---

## 2. 安装说明（目录位置）

本技能随 OpenClaw 工作区部署，无需单独安装。目录位置：

```
agents/skills/skill-05-requirement-understanding/
├── README.md          # 本使用文档
├── SKILL.md           # 技能规约（输入输出、验收标准）
├── index.js           # 技能实现入口（understand 方法）
├── test.js            # 测试套件（8 个用例）
├── config/            # 可选：形态与校验配置
└── prompts/           # 可选：LLM 提示词
│   └── blueprint-generation.txt
```

**运行环境**：Node.js 18+，无额外 npm 依赖（仅使用 `fs`/`path`）。

在项目中引用：

```javascript
const { understanding, errors } = require('./agents/skills/skill-05-requirement-understanding/index.js');
```

---

## 3. 快速开始（使用示例）

### 最简调用（仅已确认提案）

```javascript
const { understanding } = require('./index.js');

const result = await understanding.understand({
  confirmedProposal: {
    summary: '新增用户登录模块',
    intent: 'development',
    scope: '前端登录页与后端鉴权',
  },
});

console.log(result.status);           // 'success'
console.log(result.blueprint.form);   // 'openspec'
console.log(result.blueprint.documents);
console.log(result.specDelta.added);
console.log(result.validationReport.formatValid);
```

### 带 context 与 options（指定蓝图形态与输出路径）

```javascript
const result = await understanding.understand({
  confirmedProposal: {
    summary: '撰写产品白皮书',
    intent: 'content',
  },
  context: {
    projectName: 'my-doc-project',
    mainSpecPath: '/path/to/project/other-project/changes/init/',
  },
  options: {
    blueprintForm: 'content-outline',
    outputPath: 'project/my-doc-project/changes/init/',
    strictValidation: true,
  },
});
// result.blueprint.form === 'content-outline'
```

### 从已确认提案中带 goals（用于生成 AC）

```javascript
const result = await understanding.understand({
  confirmedProposal: {
    summary: '用户登录与鉴权',
    intent: 'development',
    goals: [
      'GET /api/user 在已登录状态下返回 200 及用户信息 JSON',
      '管理后台「用户列表」页展示用户名、邮箱、创建时间',
    ],
  },
});
// result.blueprint.acList 将包含基于 goals 的 AC，且 verifiable: true
```

---

## 4. API 参考（understand 方法、输入输出格式）

### 4.1 `understand(input)` 方法

**签名**：`Promise<Result> understand(input)`

**输入 `input`**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `confirmedProposal` | object | 是 | 已确认提案；至少含 `summary` 或 `title` |
| `confirmedProposal.summary` | string | 条件 | 与 `title` 二选一，需求摘要 |
| `confirmedProposal.title` | string | 条件 | 与 `summary` 二选一 |
| `confirmedProposal.intent` | string | 否 | `development` \| `content` \| `skill` \| `operation`，用于推断蓝图形态 |
| `confirmedProposal.scope` | string | 否 | 变更范围描述 |
| `confirmedProposal.constraints` | string[] | 否 | 约束列表 |
| `confirmedProposal.goals` | string[] | 否 | 目标/验收要点，用于生成 AC |
| `confirmedProposal.path` | string | 否 | 澄清产出路径或 `project/{项目名}/changes/init/` |
| `context` | object | 否 | 上下文 |
| `context.projectName` | string | 否 | 项目名，用于默认 outputPath |
| `context.mainSpecPath` | string | 否 | 主规约路径，用于一致性校验与 specDelta 的 modified |
| `context.intentResult` | string | 否 | 意图分类结果 |
| `options` | object | 否 | 选项 |
| `options.blueprintForm` | string | 否 | `openspec` \| `content-outline` \| `execution-plan`，未传时按 intent 推断 |
| `options.outputPath` | string | 否 | 蓝图输出目录，默认 `project/{项目名}/changes/init/` |
| `options.strictValidation` | boolean | 否 | 是否严格校验（格式/一致性不通过时抛错），默认 `true` |

**输出（成功时）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | `'success'` |
| `blueprint` | object | 执行蓝图 |
| `blueprint.form` | string | `openspec` \| `content-outline` \| `execution-plan` |
| `blueprint.outputPath` | string | 输出目录 |
| `blueprint.documents` | array | `{ file, purpose }[]` 文档列表 |
| `blueprint.tasks` | array | `{ id, title, dependsOn, acRefs }[]` 可执行任务 |
| `blueprint.acList` | array | `{ id, description, verifiable }[]` 验收标准（同 `AC`） |
| `blueprint.summary` | string | 蓝图用途与下一步说明 |
| `specDelta` | object | 规约增量 |
| `specDelta.added` | string[] | 新增规约项/文件 |
| `specDelta.modified` | string[] | 修改的规约项/文件 |
| `specDelta.removed` | string[] | 移除的规约项 |
| `specDelta.impactScope` | string | 影响范围简述 |
| `specDelta.impactAnalysis` | string | 变更影响分析文本 |
| `validationReport` | object | 验证报告 |
| `validationReport.formatValid` | boolean | 规约格式是否通过 |
| `validationReport.consistencyValid` | boolean | 与主规约是否一致 |
| `validationReport.errors` | string[] | 错误信息列表 |
| `validationReport.warnings` | string[] | 警告信息 |
| `validationReport.checks` | array | `{ name, passed, message }[]` 逐项检查 |
| `timestamp` | string | ISO 8601 时间戳 |

**输出（失败时）**：`status === 'error'`，并包含 `error: { code, message }`。错误码见下表。

| 错误码 | 含义 |
|--------|------|
| `UNDERSTANDING_INVALID_INPUT` | 缺少或非法输入（如无 confirmedProposal、无 summary/title） |
| `UNDERSTANDING_FORMAT_ERROR` | 格式验证未通过（strict 时抛出） |
| `UNDERSTANDING_CONSISTENCY_ERROR` | 与主规约一致性校验未通过（strict 时抛出） |
| `UNDERSTANDING_VALIDATION_FAILED` | 通用验证失败 |
| `UNDERSTANDING_UNKNOWN_ERROR` | 未分类异常 |

---

## 5. 蓝图形态说明（openspec / content-outline / execution-plan）

蓝图形态由 `options.blueprintForm` 显式指定，或根据 `confirmedProposal.intent` 推断：

| 形态 | 适用场景 / intent | 文档与产出侧重 |
|------|-------------------|----------------|
| **openspec** | 开发类 (`development`) | `proposal.md`、`specs/requirements.md`、`design.md`、`tasks.md`；完整 OpenSpec 四件套 |
| **content-outline** | 内容类 (`content`) | 内容大纲、章节结构、字数/格式要求、交付物形态（如 `outline.md`、`tasks.md`） |
| **execution-plan** | 技能/运维类 (`skill` / `operation`) | 执行步骤、输入输出、依赖与调用顺序、验收检查点（如 `outline.md`、`tasks.md`） |

- **openspec**：产出 4 个标准文档，格式校验要求最严。
- **content-outline** / **execution-plan**：产出 `outline.md` + `tasks.md` 等，结构较简，仍须包含 `tasks` 与 `AC`。

---

## 6. 规约格式验证说明

技能内部对产出蓝图做**规约格式验证**，结果写入 `validationReport`：

| 检查项 | 说明 |
|--------|------|
| `openspec-structure` | 形态为 openspec 时，必须包含 `proposal.md`、`specs/requirements.md`、`design.md`、`tasks.md` |
| `ac-present` | 蓝图至少包含一条 AC |
| `ac-verifiable` | 每条 AC 须具备可验证描述（`verifiable !== false`） |
| `tasks-present` | 蓝图至少包含一条可执行任务 |

- `validationReport.formatValid === true` 表示上述检查均通过。
- `validationReport.checks` 为逐项结果（`name`、`passed`、`message`）。
- 当 `options.strictValidation === true` 且格式不通过时，`understand` 会返回 `status: 'error'` 并带 `UNDERSTANDING_FORMAT_ERROR`。

---

## 7. AC 定义指南

验收标准 (AC) 必须**可验证**，供需求验收智能体执行检查。

- **可验证**：能通过接口调用、页面断言、文件存在、数值比较等得出通过/不通过。
- **明确无歧义**：使用「当…时」「应返回…」「页面需显示…」「文件需包含…」等可操作描述；避免「尽量」「较好」。
- **可关联任务**：在 `blueprint.tasks` 中通过 `acRefs` 引用 AC 的 `id`。

**合格示例**：

- `GET /api/user 在已登录状态下返回 200 及用户信息 JSON`
- `管理后台「用户列表」页展示至少：用户名、邮箱、创建时间`
- `导出 Excel 文件包含表头与至少一行数据，且文件名含时间戳`

**不合格示例**：

- `用户体验良好`（不可客观验证）
- `性能尽量快`（无明确阈值）

输出中每条 AC 包含：`id`、`description`、`verifiable: true`。可从 `confirmedProposal.goals` 生成，或由实现从 summary 推导一条默认 AC。

---

## 8. 一致性校验规则

当传入 `context.mainSpecPath` 且路径有效时，会进行**与主规约的一致性校验**：

- 若主规约目录已存在 OpenSpec 文件（如 `proposal.md`、`specs/requirements.md` 等），本次变更中对应文件会进入 `specDelta.modified` 而非 `added`。
- 对 `specDelta.modified` 中涉及 `requirements` / `proposal` 的项，会生成「可能与主规约重叠，请人工确认无冲突」类提示，并视情况将 `validationReport.consistencyValid` 设为 `false`。
- 主规约路径不存在时，会记录错误并设 `consistencyValid: false`。

**strict 行为**：`options.strictValidation === true` 且一致性不通过时，返回 `status: 'error'`，错误码 `UNDERSTANDING_CONSISTENCY_ERROR`。

无 `mainSpecPath` 时，不执行一致性校验，`consistencyValid` 为 `true`。

---

## 9. 测试运行说明

技能自带 8 个测试用例（对应 SKILL.md 验收标准），使用 Node.js 内置 `assert`，无需额外测试框架。

**运行方式**：

```bash
cd agents/skills/skill-05-requirement-understanding
node test.js
```

**用例概览**：

| # | 场景 | 验证要点 |
|---|------|----------|
| TC-01 | 仅 confirmedProposal，开发类 | status=success，blueprint/specDelta/validationReport/timestamp 存在 |
| TC-02 | 带 context 与 options | blueprintForm=content-outline，outputPath 体现 options |
| TC-03 | 三种 blueprintForm | openspec/content-outline/execution-plan 形态正确，openspec 含 proposal |
| TC-04 | 缺失 confirmedProposal | status=error，code=UNDERSTANDING_INVALID_INPUT |
| TC-05 | 格式验证通过 | formatValid=true，checks 为数组 |
| TC-06 | specDelta 生成 | added/modified 为数组，存在 impactAnalysis 或 impactScope |
| TC-07 | AC 可验证 | acList 非空，每条 verifiable=true 且有 description |
| TC-08 | 性能 | 连续 20 次调用，单次响应 < 2 秒 |

全部通过时进程退出码为 0，否则为 1。

---

## 10. 常见问题 FAQ

**Q: 必须传 `intent` 吗？**  
A: 非必填。未传时按 `development` 处理，蓝图形态为 `openspec`。可通过 `options.blueprintForm` 覆盖。

**Q: 输出里是 `acList` 还是 `AC`？**  
A: 当前实现返回 `blueprint.acList`；与 SKILL.md 中的 `AC` 同义，验收标准以 `acList` 为准。

**Q: 如何关闭严格校验以便拿到“带错误的蓝图”？**  
A: 设置 `options.strictValidation: false`。格式或一致性不通过时仍会返回蓝图，但 `validationReport` 中会有相应 errors/checks。

**Q: 主规约路径传文件还是目录？**  
A: 可传目录或该目录下任意已存在文件路径；实现会解析为目录后检查 `proposal.md`、`specs/requirements.md` 等。

**Q: 响应时间超过 2 秒会怎样？**  
A: 不会抛错，但会在 `validationReport.warnings` 中追加「响应时间超过 2 秒，请优化」类提示。验收要求单次 < 2 秒（见 TC-08）。

**Q: 与需求澄清、需求解决的关系？**  
A: 需求澄清 → 用户确认提案 → **需求理解**（本技能）→ 产出蓝图 → 需求解决按 tasks 执行 → 需求验收按 AC 验证。

---

## 11. 验收标准验证说明

本技能验收标准（与 SKILL.md 一致）及在文档/测试中的对应关系如下：

| 验收项 | 说明 | 验证方式 |
|--------|------|----------|
| 测试用例 ≥ 8 | 覆盖仅 proposal、带 context/options、三种形态、格式通过/不通过、一致性、AC 可验证、specDelta、边界 | `test.js` 中 TC-01～TC-08 |
| 规约格式正确率 100% | 合规输入下产出符合 OpenSpec 或对应形态 | TC-01、TC-03、TC-05 |
| 蓝图 AC 可验证 | 每条 AC 有可验证描述，verifiable 为 true | TC-07；AC 定义见第 7 节 |
| 响应时间 < 2 秒 | 单次调用（纯逻辑/无外部 LLM） | TC-08 |
| 输出结构完整 | 必含 blueprint、specDelta、validationReport、timestamp；blueprint 必含 documents、tasks、AC | TC-01、第 4 节 API 说明 |

验收执行时：运行 `node test.js`，确认 8/8 通过；并可抽测不同 `blueprintForm` 与 `mainSpecPath` 组合，核对 `validationReport` 与 `specDelta` 符合第 6、8 节规则。

---

## 相关文档

- 技能规约：`SKILL.md`
- 宪法规范 V3.7：`agents/docs/specs/constitution/CONSTITUTION.md`
- 需求理解智能体：`agents/constitution/requirement-understanding/AGENTS.md`
- OpenSpec 存放规范：工作区 `AGENTS.md` § OpenSpec 规范存放位置
