---
name: requirement-clarification
description: Requirement clarification for the clarification agent. Generates clarification questions, eliminates ambiguity, collects context, and organizes clarification results. Use when user input needs clarification before requirement understanding or when producing a clarification proposal for user confirmation.
---

# Skill-02: 需求澄清

**技能ID**: skill-02  
**版本**: 2.0  
**创建日期**: 2026-03-11  
**归属智能体**: 需求澄清智能体  
**状态**: ✅ 已实现

---

## 📋 技能描述

需求澄清技能在需求理解或开发前执行，完成**澄清问题生成**、**模糊性消除**、**上下文收集**与**澄清结果整理**，产出《澄清提案》与澄清问题列表，供需求澄清智能体提交用户确认。

### 核心功能

| 功能 | 说明 |
|------|------|
| **需求澄清问题生成** | 根据用户输入与模糊点生成可直接面向用户的澄清问题列表 |
| **模糊性消除** | 识别并分类模糊/歧义/缺失/冲突，输出消除建议与澄清问题 |
| **上下文收集** | 按意图与查询加载项目上下文（文件、规约路径、会话上下文等） |
| **澄清结果整理** | 将澄清问答与确认项整理为结构化《澄清提案》 |

---

## 🎯 触发条件

- 需求澄清智能体接收到用户原始请求，且需走标准构建流或需先澄清再理解
- 需要对请求做澄清问题生成、上下文收集或澄清结果整理时

---

## 📥 输入

```json
{
  "userInput": "用户原始表述",
  "context": "可选：会话上下文、意图分类结果、已有规约路径",
  "options": {
    "intent": "development|content|skill|operation",
    "suggestedRoute": "standard|fast",
    "contextSources": ["filesystem", "spec_path"],
    "ambiguities": []
  }
}
```

### 输入字段说明

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `userInput` | 是 | string | 用户原始表述 |
| `context` | 否 | string \| object | 会话上下文、意图、规约路径等 |
| `options` | 否 | object | 可选配置 |
| `options.intent` | 否 | string | 意图标签（与 Skill-01 输出一致） |
| `options.suggestedRoute` | 否 | string | 建议路由：standard / fast |
| `options.contextSources` | 否 | string[] | 需收集的上下文来源 |
| `options.ambiguities` | 否 | array | 已有模糊项列表（如来自 Skill-03），用于生成澄清问题 |

---

## 📤 输出

```json
{
  "success": true,
  "proposal": {
    "intent": "development",
    "suggestedRoute": "standard",
    "complexity": "high|medium|low",
    "summary": "澄清提案摘要",
    "confirmedItems": [],
    "openQuestions": []
  },
  "clarificationQuestions": [
    "可直接面向用户的澄清问题一",
    "可直接面向用户的澄清问题二"
  ],
  "collectedContext": {
    "sources": ["filesystem", "spec_path"],
    "snippets": [],
    "specPath": null
  },
  "ambiguitySummary": {
    "isClear": false,
    "count": 2,
    "domains": ["technical", "business"]
  }
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否执行成功 |
| `proposal` | object | 《澄清提案》结构：意图、路由、复杂度、摘要、已确认项、待澄清问题 |
| `clarificationQuestions` | string[] | 可直接面向用户的澄清问题列表 |
| `collectedContext` | object | 收集到的上下文：来源、片段、规约路径等 |
| `ambiguitySummary` | object | 模糊性摘要：是否清晰、数量、涉及领域 |

---

## 🔧 执行逻辑

### 步骤 1：加载 Prompt 模板（可选）

读取 `prompts/clarification.txt` 模板，用于 LLM 增强时的提示填充。

### 步骤 2：上下文收集

根据 `options.contextSources` 与 `userInput` 收集项目上下文（文件系统、规约路径等），写入 `collectedContext`。

### 步骤 3：模糊性消除与澄清问题生成

若未传入 `options.ambiguities`，则基于 `userInput` 做轻量模糊性检测；若已传入则直接使用。生成 `clarificationQuestions` 与 `ambiguitySummary`。

### 步骤 4：澄清结果整理

将意图、路由、复杂度、已确认项与待澄清问题整理为 `proposal` 结构。

### 步骤 5：返回结果

输出符合「输出」约定的对象，供需求澄清智能体生成《澄清提案》并提交用户确认。

---

## 📁 文件结构

```
agents/skills/skill-02-requirement-clarification/
├── SKILL.md                 # 本文件
├── README.md                # 使用文档
├── index.js                 # 技能实现（纯 JavaScript，无外部依赖）
├── test.js                  # 测试脚本（10 个用例）
└── prompts/
    └── clarification.txt    # 需求澄清 Prompt 模板
```

---

## 🧪 验收标准

- [ ] **澄清问题生成**：能根据用户输入或已有 ambiguities 生成 `clarificationQuestions` 数组
- [ ] **模糊性消除**：支持内置轻量检测或接收外部 ambiguities，输出 `ambiguitySummary`
- [ ] **上下文收集**：支持 filesystem、spec_path 等来源，输出 `collectedContext`
- [ ] **澄清结果整理**：输出 `proposal` 含 intent、suggestedRoute、summary、openQuestions
- [ ] **纯 JavaScript**：无外部依赖，Node.js 18+ 可运行
- [ ] **测试**：至少 10 个测试用例，覆盖上述四类功能与边界情况

---

## 🔗 依赖技能

- **Skill-01 全域意图分类引擎**：可提供 `intent`、`suggestedRoute`，本技能可接收为 `options`
- **Skill-03 跨域模糊性探测器**：可提供 `ambiguities`，本技能可接收为 `options.ambiguities` 并生成澄清问题

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 需求澄清智能体：`agents/constitution/requirement-clarification/AGENTS.md`
- Skill-01 意图分类：`agents/skills/skill-01-intent-classifier/SKILL.md`
- Skill-03 模糊性探测：`agents/skills/skill-03-ambiguity-detector/SKILL.md`

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-11 | 初版（多源上下文检索器） |
| 2.0 | 2026-03-11 | 重定义为需求澄清技能：问题生成、模糊性消除、上下文收集、澄清结果整理；对齐 OpenClaw AgentSkills 规范 |
