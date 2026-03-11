# Skill-02: 需求澄清 - 使用文档

**版本**: 2.0  
**更新日期**: 2026-03-11  
**归属智能体**: 需求澄清智能体  
**状态**: ✅ 已实现

---

## 1. 技能简介

**需求澄清（Requirement Clarification）** 在需求理解或开发前执行，完成四类能力：**需求澄清问题生成**、**模糊性消除**、**上下文收集**、**澄清结果整理**，产出《澄清提案》与澄清问题列表，供需求澄清智能体提交用户确认。

| 功能 | 说明 |
|------|------|
| **需求澄清问题生成** | 根据用户输入与模糊点生成可直接面向用户的澄清问题列表 |
| **模糊性消除** | 识别并分类模糊/歧义/缺失/冲突，输出消除建议与澄清问题 |
| **上下文收集** | 按意图与查询加载项目上下文（文件、规约路径等） |
| **澄清结果整理** | 将澄清问答与确认项整理为结构化《澄清提案》 |

- **实现**: 纯 JavaScript (Node.js 18+)，无外部依赖。
- **依赖**: 可与 Skill-01 意图分类、Skill-03 模糊性探测器配合使用。

---

## 2. 安装与目录

### 目录结构

```
agents/skills/skill-02-requirement-clarification/
├── README.md                 # 本使用文档
├── SKILL.md                  # 技能规约（OpenClaw AgentSkills）
├── index.js                  # 技能实现（主入口）
├── test.js                   # 测试脚本（10 个用例）
└── prompts/
    └── clarification.txt     # 需求澄清 Prompt 模板（供 LLM 使用）
```

### 环境要求

- **Node.js**: 18+
- **依赖**: 无（仅使用 Node 内置 `fs`、`path`）

---

## 3. 快速开始

### 命令行

```bash
cd agents/skills/skill-02-requirement-clarification

# 单条用户请求
node index.js "做一个内容运营平台"

# 输出为 JSON：success, proposal, clarificationQuestions, collectedContext, ambiguitySummary
```

### 代码调用

```javascript
const { clarify, generateClarificationQuestions, collectContext, organizeClarificationResult } = require('./index.js');

// 主入口：一次完成 问题生成 + 模糊性消除 + 上下文收集 + 澄清结果整理
const result = clarify({
  userInput: '做一个内容运营平台',
});
console.log(result.success);              // true
console.log(result.clarificationQuestions);
console.log(result.proposal.summary);

// 带意图与模糊项（如来自 Skill-01 / Skill-03）
const result2 = clarify({
  userInput: '先做核心功能，技术栈你定',
  options: {
    intent: 'development',
    suggestedRoute: 'standard',
    contextSources: ['filesystem'],
    ambiguities: [
      { type: 'ambiguous', severity: 'medium', domain: 'business', suggestion: '首期 MVP 需要包含哪些功能？' },
    ],
  },
});
```

---

## 4. API 参考

### clarify(input, env?)

**主入口**。执行：上下文收集 → 模糊性消除 → 澄清问题生成 → 澄清结果整理。

| 参数 | 类型 | 说明 |
|------|------|------|
| `input` | object | 见下方输入格式 |
| `env` | object | 可选，如 `{ baseDir }` 用于解析规约路径 |

**输入格式**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userInput` | string | 是 | 用户原始表述 |
| `context` | any | 否 | 会话上下文（当前实现中可做扩展） |
| `options` | object | 否 | 可选配置 |
| `options.intent` | string | 否 | 意图：development \| content \| skill \| operation |
| `options.suggestedRoute` | string | 否 | 建议路由：standard \| fast |
| `options.contextSources` | string[] | 否 | 上下文来源：filesystem、spec_path 等 |
| `options.specPath` | string | 否 | 规约目录相对路径，用于 spec_path 收集 |
| `options.ambiguities` | array | 否 | 已有模糊项（如来自 Skill-03），用于生成澄清问题 |

**返回值**

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `proposal` | object | 《澄清提案》：intent、suggestedRoute、complexity、summary、confirmedItems、openQuestions |
| `clarificationQuestions` | string[] | 可直接面向用户的澄清问题列表 |
| `collectedContext` | object | 收集到的上下文：sources、snippets、specPath |
| `ambiguitySummary` | object | 模糊性摘要：isClear、count、domains |

---

### generateClarificationQuestions(input)

根据 `userInput` 与可选的 `options.ambiguities` 生成澄清问题列表。若传入 ambiguities 则优先使用其 `suggestion`/`description`；否则使用内置规则生成。

---

### eliminateAmbiguity(userInput, externalAmbiguities?)

轻量模糊性消除。若传入 `externalAmbiguities`（如 Skill-03 输出），则直接使用并计算 `isClear`、`domains`；否则基于 `userInput` 做规则检测，返回 `{ isClear, ambiguities, domains }`。

---

### collectContext(input, baseDir?)

根据 `options.contextSources` 与 `options.specPath` 收集上下文。支持 `filesystem`（如当前目录 README）、`spec_path`（规约目录下 proposal.md 等）。`baseDir` 用于解析相对路径。

---

### organizeClarificationResult(input)

将 `userInput`、`options`、`clarificationQuestions`、`ambiguitySummary` 整理为《澄清提案》结构：intent、suggestedRoute、complexity、summary、confirmedItems、openQuestions。

---

## 5. Prompt 模板

`prompts/clarification.txt` 供 LLM 使用，变量包括：

- `{{userInput}}`：用户原始表述
- `{{context}}`：会话上下文
- `{{ambiguities}}`：已有模糊项列表
- `{{collectedContext}}`：已收集的上下文

输出格式为 JSON：`proposal`、`clarificationQuestions`、`ambiguitySummary`。与 `index.js` 的产出结构对齐，便于混合使用（规则引擎 + LLM 增强）。

---

## 6. 测试

```bash
node test.js
```

共 10 个用例：

| # | 场景 |
|---|------|
| T01 | clarify 返回成功结构及必填字段 |
| T02 | 澄清问题生成（来自 ambiguities） |
| T03 | 澄清问题生成（内置规则） |
| T04 | 模糊性消除（外部 ambiguities） |
| T05 | 模糊性消除（轻量检测） |
| T06 | 上下文收集结构 |
| T07 | 澄清结果整理（proposal 结构） |
| T08 | 非法输入抛错（CLARIFICATION_INVALID_INPUT） |
| T09 | 非开发类输入 |
| T10 | 带 options 的完整调用 |

通过时输出 `总计：10/10`，退出码 0。

---

## 7. 错误码

| 错误码 | 说明 |
|--------|------|
| `CLARIFICATION_INVALID_INPUT` | `input` 非对象或 `userInput` 非字符串 |

---

## 8. 与 Skill-01 / Skill-03 的配合

- **Skill-01 意图分类**：将 `primaryIntent`、`suggestedRoute` 传入 `options`，本技能写入 `proposal.intent`、`proposal.suggestedRoute`。
- **Skill-03 模糊性探测**：将 Skill-03 的 `ambiguities` 传入 `options.ambiguities`，本技能据此生成 `clarificationQuestions` 并填充 `ambiguitySummary`，无需重复检测。

---

## 相关文档

- **技能规约**: `SKILL.md`
- **V3.7 主规范**: `agents/docs/specs/CONSTITUTION_V3.7.md`
- **需求澄清智能体**: `agents/constitution/requirement-clarification/AGENTS.md`
- **Prompt 模板**: `prompts/clarification.txt`
