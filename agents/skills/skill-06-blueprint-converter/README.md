# Skill-06: 多模态蓝图转换器 - 使用文档

**版本**: 1.0 · **归属智能体**: 需求理解智能体

---

## 1. 技能简介

**多模态蓝图转换器（Blueprint Converter）** 在需求确认完成后，根据任务类型自动选择蓝图形态，生成标准化的执行蓝图文档结构。确保下游需求解决、内容创作或技能执行有清晰、可追溯的规约依据。

| 特性 | 说明 |
|------|------|
| 多形态支持 | 支持三种蓝图形态：OpenSpec（开发类）、内容大纲（内容类）、执行计划（技能/数据类） |
| 零外部依赖 | 纯 JavaScript，Node.js 18+，仅使用 `fs`/`path` |
| 同步/异步 | 提供 `convertSync()` 与 `convert()`，便于不同调用场景 |

---

## 2. 安装说明

### 目录位置

本技能位于工作区内的固定路径：

```
agents/skills/skill-06-blueprint-converter/
├── README.md           # 本使用文档
├── SKILL.md            # 技能规约（输入输出、验收标准）
├── index.js            # 技能实现入口
├── test.js             # 测试套件
├── templates/          # 各形态文档模板（供落盘或 LLM 填充）
│   ├── proposal.md
│   ├── design.md
│   ├── tasks.md
│   └── specs/requirements.md
└── prompts/            # LLM 生成内容时的 Prompt 模板（可选）
    └── blueprint-conversion.txt
```

### 环境要求

- **Node.js**: 18 或更高版本
- **运行方式**: 通过 `require('./index.js')` 引入，或由需求理解智能体/OpenClaw 按规约调用

无需 `npm install`，无第三方依赖。

---

## 3. 快速开始

### 使用示例

```javascript
const { converter } = require('./index.js');

// 同步调用（常用）
const result = converter.convertSync({
  confirmedRequirement: {
    summary: '实现用户登录与权限校验',
    path: 'project/auth-module/changes/init',  // 可选
  },
  taskType: 'development',  // development | content | skill
  complexity: 'medium',     // 可选：high | medium | low
});

if (result.success) {
  console.log(result.blueprintForm);   // 'openspec'
  console.log(result.outputPath);      // 'project/auth-module/changes/init/'
  console.log(result.documents);       // [{ file, purpose }, ...]
  console.log(result.summary);         // 用途与下一步说明
} else {
  console.error(result.error.code, result.error.message);
}
```

### 异步调用

```javascript
const { converter } = require('./index.js');

const result = await converter.convert({
  confirmedRequirement: { summary: '撰写产品发布博客' },
  taskType: 'content',
  context: { routeTo: 'standard', clarificationAnswers: {} },
});
// result.success === true 时含 blueprintForm, outputPath, documents, summary, _meta
```

### 三种任务类型对应形态

| 传入 `taskType` | 产出 `blueprintForm` | 文档数量 |
|-----------------|----------------------|----------|
| `development`   | `openspec`           | 4 份     |
| `content`       | `content-outline`    | 3 份     |
| `skill`         | `execution-plan`     | 3 份     |

---

## 4. API 参考

### convert(input)

将输入转换为蓝图输出（异步）。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 是 | 见下方「输入格式」 |

**返回值**（Promise\<object\>）：

- **成功**: `{ success: true, blueprintForm, outputPath, documents, summary, _meta? }`
- **失败**: `{ success: false, error: { code, message } }`

### convertSync(input)

同步版 `convert`，参数与语义相同，返回普通对象（非 Promise）。

### 输入格式

```json
{
  "confirmedRequirement": {
    "summary": "需求摘要或已确认的规约内容",
    "path": "可选：project/{项目名}/changes/init/ 或澄清文档路径",
    "raw": "可选：完整需求正文"
  },
  "taskType": "development | content | skill",
  "complexity": "high | medium | low",
  "context": {
    "intentResult": "可选：Skill-01 意图分类结果",
    "routeTo": "standard | fast",
    "clarificationAnswers": "可选：用户对澄清问题的回答"
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `confirmedRequirement` | 是 | 至少含 `summary`（非空字符串）；可带 `path`、`raw` |
| `taskType` | 是 | 决定蓝图形态：`development` → OpenSpec，`content` → 内容大纲，`skill` → 执行计划 |
| `complexity` | 否 | 默认 `medium`，影响蓝图粒度（当前实现仅校验枚举，不改变文档列表） |
| `context` | 否 | 供下游或扩展使用；`convert()` 成功时在 `_meta.hasContext` 中体现 |

### 输出格式（成功时）

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 固定为 `true` |
| `blueprintForm` | string | `openspec` \| `content-outline` \| `execution-plan` |
| `outputPath` | string | 蓝图文档建议输出目录，末尾带 `/` |
| `documents` | array | `{ file: string, purpose: string }[]`，该形态下的标准文档列表 |
| `summary` | string | 蓝图用途与建议下一步的自然语言说明 |
| `_meta` | object | 仅 `convert()` 有：`taskType`、`complexity`、`hasContext` |

### 错误码

| 错误码 | 说明 |
|--------|------|
| `BLUEPRINT_INVALID_INPUT` | 输入非法：缺少/空 `confirmedRequirement`、`summary`、`taskType`，或 `complexity` 非规定枚举 |
| `BLUEPRINT_UNKNOWN_FORM` | `taskType` 非 `development`/`content`/`skill` |

从模块获取错误码常量：

```javascript
const { errors } = require('./index.js');
// errors.BLUEPRINT_INVALID_INPUT, errors.BLUEPRINT_UNKNOWN_FORM, errors.BLUEPRINT_PATH_ERROR
```

---

## 5. 蓝图形态说明

### OpenSpec（开发类 · taskType = development）

适用于软件开发、功能实现、技术改造等。

| 文档 | 说明 | 典型内容 |
|------|------|----------|
| `proposal.md` | 项目提案 | 背景、目标、范围、约束 |
| `specs/requirements.md` | 需求规格 | 功能需求、非功能需求、验收条件（AC） |
| `design.md` | 技术设计 | 架构、技术选型、接口与数据流 |
| `tasks.md` | 任务列表 | 按序可执行任务，供需求解决与 Cursor CLI 使用 |

### ContentOutline（内容类 · taskType = content）

适用于文章、报告、课程、营销材料等内容创作。

| 文档 | 说明 | 典型内容 |
|------|------|----------|
| `outline.md` | 内容大纲 | 章节结构、标题层级、要点列表 |
| `style-guide.md` | 风格指南 | 语气、受众、格式要求、禁止项 |
| `milestones.md` | 里程碑 | 内容分阶段交付节点与检查点 |

### ExecutionPlan（技能/数据类 · taskType = skill）

适用于技能调用、数据处理、自动化、集成与运维等。

| 文档 | 说明 | 典型内容 |
|------|------|----------|
| `plan.md` | 执行计划 | 步骤顺序、输入输出、异常处理 |
| `checklist.md` | 检查清单 | 完成标准、自检项、验收要点 |
| `resources.md` | 资源说明 | API、数据源、依赖、环境要求 |

---

## 6. 模板使用说明

`templates/` 目录下提供各形态的 Markdown 模板，用于：

- **人工或脚本落盘**：根据 `convert` 返回的 `outputPath` 与 `documents`，将模板复制到目标目录后替换占位符。
- **LLM 填充**：结合 `prompts/blueprint-conversion.txt` 与模板中的占位符，由需求理解智能体或下游生成各文档内容。

### OpenSpec 模板占位符示例

| 文件 | 占位符示例 | 说明 |
|------|------------|------|
| `proposal.md` | `{{project_name}}`, `{{created_date}}`, `{{status}}`, `{{background}}`, `{{goals}}`, `{{in_scope_*}}`, `{{out_of_scope_*}}` | 项目名、日期、状态、背景、目标、范围 |
| `specs/requirements.md` | `{{project_name}}`, `{{functional_requirements}}`, `{{acceptance_criteria}}` | 需求与 AC |
| `design.md` | `{{project_name}}`, `{{design_overview}}`, `{{architecture_diagram}}`, `{{architecture_description}}` | 概述、架构图与说明 |
| `tasks.md` | `{{project_name}}`, `{{tasks}}` | 任务列表 |

当前 **index.js 不自动写文件**，仅返回结构（`documents` + `outputPath`）。落盘与占位符替换由调用方或需求理解智能体完成。

---

## 7. 测试运行说明

### 运行方式

在技能目录下执行：

```bash
cd agents/skills/skill-06-blueprint-converter
node test.js
```

### 测试用例覆盖

| 用例 ID | 场景 | 验证点 |
|---------|------|--------|
| TC-01 | 开发类 → OpenSpec | `blueprintForm === 'openspec'`，4 份文档齐全 |
| TC-02 | 内容类 → 内容大纲 | `blueprintForm === 'content-outline'`，3 份文档齐全 |
| TC-03 | 技能类 → 执行计划 | `blueprintForm === 'execution-plan'`，3 份文档齐全 |
| TC-04 | 缺失 taskType | 返回 `BLUEPRINT_INVALID_INPUT` |
| TC-05 | 缺失 confirmedRequirement | 返回 `BLUEPRINT_INVALID_INPUT` |
| TC-06 | 非法 taskType | 返回 `BLUEPRINT_UNKNOWN_FORM` |
| TC-07 | 带 context 的 OpenSpec | 异步 `convert` 成功且 `_meta.hasContext === true` |
| TC-08 | 不同 complexity | low/medium/high 均成功 |
| TC-09 | outputPath 生成 | 有 path 用 path；无 path 从 summary 推导，格式 `project/{项目名}/changes/init/` |
| TC-10 | 性能 | 连续 100 次 `convertSync` 在 1 秒内完成 |

### 预期输出

```
Skill-06 Blueprint Converter - 测试运行

  [PASS] TC-01: ...
  [PASS] TC-02: ...
  ...
---
总计: 10/10 通过
```

全部通过时进程退出码为 0；有失败时打印失败用例并退出码 1。

---

## 8. 常见问题 FAQ

**Q: 必须传 `path` 吗？**  
A: 否。不传时从 `confirmedRequirement.summary` 首行推导项目名，生成 `project/{项目名}/changes/init/`。

**Q: 转换器会直接创建文件吗？**  
A: 不会。当前实现只返回 `blueprintForm`、`outputPath`、`documents`、`summary`，不写入磁盘。落盘需由调用方根据 `documents` 与 `templates/` 自行完成。

**Q: `taskType` 大小写敏感吗？**  
A: 否。内部会 `trim().toLowerCase()`，`Development`、`development` 等价。

**Q: 如何区分成功与失败？**  
A: 看返回对象的 `success` 字段：`true` 为成功，`false` 时查看 `error.code` 与 `error.message`。

**Q: 与 Skill-01 / Skill-03 / Skill-04 的关系？**  
A: 本技能可选接收 `context.intentResult`（来自 Skill-01）及路由、澄清答案等，用于补充蓝图或后续扩展；不依赖其它技能即可完成形态选择与结构输出。

---

## 9. 验收标准验证说明

本技能验收以 **SKILL.md** 中定义的 9 条测试用例（TC-01～TC-09）及实现内 10 条测试（含 TC-10 性能）为准：

| 验收项 | 验证方式 |
|--------|----------|
| 三种形态正确映射 | TC-01、TC-02、TC-03 断言对应 `blueprintForm` 与 `documents` 列表 |
| 必填校验 | TC-04（缺 taskType）、TC-05（缺 confirmedRequirement）断言 `success === false` 及错误码 |
| 非法 taskType | TC-06 断言 `BLUEPRINT_UNKNOWN_FORM` |
| context 传递 | TC-07 使用 `convert()` 并断言 `_meta.hasContext === true` |
| complexity 合法值 | TC-08 对 low/medium/high 各调用一次并断言成功 |
| outputPath 规则 | TC-09 分别测「有 path」与「无 path」时的路径格式与结尾 `/` |
| 性能 | TC-10 连续 100 次同步调用 &lt; 1 秒 |

运行 `node test.js` 全部通过即视为满足验收标准；覆盖率覆盖所有形态、所有必填/非法分支及路径两种来源。

---

## 相关文档

- 技能规约（输入输出、执行逻辑、文件结构）：`SKILL.md`
- 宪法主规范与 OpenSpec 存放：工作区根目录 `AGENTS.md`
- 需求理解智能体：`agents/constitution/requirement-understanding/AGENTS.md`
