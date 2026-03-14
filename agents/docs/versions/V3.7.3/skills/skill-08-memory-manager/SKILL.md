# Skill-08: 记忆管理智能体 (Memory Manager)

**版本号**: 1.0  
**创建日期**: 2026-03-10  
**归属层级**: 支撑层 / 记忆管理  
**归属智能体**: 主会话、Heartbeat、各子智能体（需读写记忆时）  
**状态**: 📋 规约中

---

## 📋 技能描述

提供统一的记忆存储、检索、更新与清理能力，支撑长期记忆（MEMORY.md）与短期记忆（会话级）的读写与维护。保证记忆一致性、检索相关性排序与响应时效，满足主会话与 Heartbeat 等场景下的记忆读写需求。

---

## 🎯 触发条件

- 需要**存储**记忆时（如用户说「记住这个」、Heartbeat 维护后写入 MEMORY.md）
- 需要**检索**记忆时（如主会话启动读取 MEMORY.md、语义搜索历史记忆）
- 需要**更新**记忆时（如追加条目、修改或合并某条记忆）
- 需要**删除/清理**记忆时（如过期记忆清理、去重）

---

## 📥 输入

```json
{
  "action": "store | search | update | delete",
  "content": "记忆内容（store/update）或搜索查询（search）或待删标识（delete）",
  "options": {
    "maxResults": 10,
    "minScore": 0.5,
    "scope": "long-term | session | all",
    "targetPath": "MEMORY.md | memory/YYYY-MM-DD.md | 相对路径",
    "id": "可选：单条记忆标识，用于 update/delete"
  }
}
```

### 输入字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | 操作类型：`store` 存储、`search` 检索、`update` 更新、`delete` 删除/清理 |
| `content` | 依 action | `store`/`update` 时为记忆正文；`search` 时为查询文本；`delete` 时为待删内容或 id/条件 |
| `options` | 否 | 可选参数，见下表 |

### options 说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxResults` | number | 10 | 检索时返回的最大结果数 |
| `minScore` | number | 0.5 | 检索时最低相关性分数（0–1），低于此值的结果不返回 |
| `scope` | string | `all` | 检索/清理范围：`long-term`（仅 MEMORY.md）、`session`（仅会话级）、`all`（全部） |
| `targetPath` | string | 见下 | 存储/更新时的目标文件；不传时 store 默认写入 MEMORY.md 或按 scope 推断 |
| `id` | string | — | 单条记忆标识，用于 `update`/`delete` 精确定位 |

**存储约定**：

- **长期记忆**：`MEMORY.md`（工作区根目录），格式为 Markdown，按日期/主题分段。
- **短期/日记忆**：`memory/YYYY-MM-DD.md`，按日一份；无则创建 `memory/` 目录。

---

## 📤 输出

```json
{
  "success": true,
  "results": [
    {
      "path": "MEMORY.md",
      "content": "匹配的记忆内容片段",
      "score": 0.92,
      "id": "可选：条目标识",
      "lineStart": 12,
      "lineEnd": 15
    }
  ],
  "metadata": {
    "total": 3,
    "duration": 120,
    "action": "search",
    "scope": "all"
  }
}
```

### 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 操作是否成功；失败时 `results` 可为空并附带错误信息 |
| `results` | array | 检索时为命中列表，每项含 `path`、`content`、`score`；store/update/delete 时可返回被写/改/删的条目摘要 |
| `metadata` | object | 元数据：`total` 命中或影响条数、`duration` 耗时（ms）、`action`、`scope` 等 |

### 各 action 的 results 约定

| action | results 含义 |
|--------|----------------|
| `store` | 可选：写入后的条目摘要（如 path + 片段），便于调用方确认 |
| `search` | 按相关性排序的命中列表，每项含 `path`, `content`, `score`，可选 `lineStart`/`lineEnd` |
| `update` | 被更新条目的摘要或更新后片段 |
| `delete` | 被删除条目的 path 或 id 列表 |

---

## 🔧 执行逻辑

### 步骤 1: 解析与校验

- 校验 `action` 为 `store` | `search` | `update` | `delete` 之一。
- 根据 action 校验 `content` 必填性（store/update/search 必填；delete 可为 content 或 options.id）。
- 解析 `options`，填充默认值（如 `maxResults=10`, `minScore=0.5`, `scope=all`）。

### 步骤 2: 按 action 分发

**store**

- 确定目标路径：若 `options.targetPath` 存在则使用；否则长期记忆写 `MEMORY.md`，会话/日记忆写 `memory/YYYY-MM-DD.md`（按当前日期）。
- 若目标文件或 `memory/` 不存在则创建。
- 以追加或按格式插入的方式写入 `content`，保证不破坏现有 Markdown 结构。
- 返回 `success: true`，可选 `results` 含写入位置摘要。

**search**

- 根据 `options.scope` 确定文件集合：`long-term` 仅 `MEMORY.md`；`session` 仅当前会话或当日 `memory/YYYY-MM-DD.md`；`all` 为 MEMORY.md + memory/*.md。
- 对集合内文本做语义搜索（或关键词+相关性计算），得到候选片段。
- 为每个片段计算相关性 `score`（0–1），过滤 `score < minScore`，按 score 降序排序，取前 `maxResults` 条。
- 填充 `results`：`path`, `content`, `score`，可选 `lineStart`/`lineEnd`；`metadata.total` 为命中数，`metadata.duration` 为耗时（ms）。

**update**

- 根据 `options.id` 或 `content` 的匹配定位目标条目（如在 MEMORY.md 或 memory/*.md 的某段）。
- 在保持文档结构的前提下替换/合并为更新内容。
- 写回文件，返回 `success: true` 及被更新条目摘要。

**delete**

- 根据 `options.scope` 与 `content` 或 `options.id` 定位待删条目或过期/重复项。
- 删除或清理：单条删除时移除对应段落；清理时可合并去重、移除过期段落。
- 写回文件，返回 `success: true` 及被删/清理的 path 或 id 列表。

### 步骤 3: 一致性保证

- 所有写操作（store/update/delete）单次调用内原子完成（单文件写入要么完整成功要么回退/不破坏原文件）。
- 若实现多文件写入，尽量保证要么全部成功要么全部不提交，避免部分更新导致记忆不一致。

### 步骤 4: 返回结果

- 输出符合「📤 输出」约定的 JSON。
- `metadata.duration` 为本次调用耗时（毫秒），用于满足响应时间 &lt;500ms 的验收。

---

## 📁 文件结构

```
agents/skills/skill-08-memory-manager/
├── SKILL.md                    # 本文件
├── index.js                    # 技能实现（store/search/update/delete 入口）
├── lib/
│   ├── store.js                # 存储逻辑（长期/短期路径、追加格式）
│   ├── search.js               # 检索逻辑（语义或关键词、打分、排序）
│   ├── update.js               # 更新逻辑（定位、替换、写回）
│   └── delete.js               # 删除与清理逻辑（去重、过期清理）
├── prompts/
│   └── system.txt              # 可选：若用 LLM 做语义打分时的系统 Prompt
└── test.js                     # 验收测试（至少 10 个用例）
```

---

## 🧪 验收标准

验收以测试用例形式覆盖，至少 **10 个测试用例**，**检索响应时间 &lt;500ms**，**记忆一致性 100%**（读写后内容与预期一致、无部分写入或损坏）。

### 测试用例列表

| 用例 ID | 场景描述 | 输入要点 | 预期结果 |
|---------|----------|----------|----------|
| TC-01 | store 长期记忆 | action=store, content=一段文本，无 targetPath | 写入 MEMORY.md，success=true，文件可读且包含 content |
| TC-02 | store 日记忆 | action=store, content=一段文本，scope=session 或 targetPath=memory/YYYY-MM-DD.md | 写入 memory/YYYY-MM-DD.md，success=true |
| TC-03 | search 语义检索 | action=search, content=查询词，options.maxResults=5 | results 按 score 降序，每条含 path/content/score，duration&lt;500ms |
| TC-04 | search 空结果 | action=search, content=不存在的生僻词 | results=[] 或少量低分结果，success=true，metadata.total 正确 |
| TC-05 | search minScore 过滤 | action=search, content=某查询，minScore=0.8 | 所有 results[].score ≥ 0.8 |
| TC-06 | update 单条记忆 | action=update, content=新内容，options.id 或可定位的 content | 目标条目被替换为新内容，success=true，文件其余部分不变 |
| TC-07 | delete 单条记忆 | action=delete, options.id 或 content 匹配唯一一条 | 该条从文件中移除，success=true，记忆一致性 100% |
| TC-08 | delete 清理/去重 | action=delete, content=“清理过期”或“去重”等语义 | 过期或重复项被清理，success=true，不删未过期、非重复内容 |
| TC-09 | 记忆一致性 | 连续 store → search → update → search | 每次读写后内容与预期一致，无截断或乱码，一致性 100% |
| TC-10 | 性能：检索 &lt;500ms | action=search，中等长度 MEMORY.md + 若干 memory/*.md | metadata.duration &lt; 500 |

### 覆盖率与指标要求

- 至少 10 个测试用例，覆盖：store（长期/短期）、search（有结果/无结果/minScore）、update、delete（单条/清理）、一致性、性能。
- **检索响应时间**：在约定工作区规模下（如 MEMORY.md &lt;500KB，memory 下 &lt;20 个日文件），单次 search 的 `metadata.duration` &lt; 500ms。
- **记忆一致性 100%**：任意 store/update/delete 后，再次读取对应 path 与段落，内容与预期完全一致，无部分写入或损坏。

---

## ⚡ 性能要求

- **响应时间**：单次调用（store/search/update/delete）从接收到返回完整输出的端到端时间 **&lt; 500ms**。
- 实现建议：检索时使用轻量级语义或关键词索引、避免大文件全量扫描；写操作单文件单次写入，避免多余 I/O。

---

## 🔗 依赖与调用关系

- **上游**：主会话（启动时读 MEMORY.md、日常读写记忆）、Heartbeat（维护后写 MEMORY.md）、其他需要记忆读写的智能体。
- **下游**：无（本技能为支撑层，不依赖其他技能）。
- **工作区约定**：与 `AGENTS.md` 中记忆体系一致——长期记忆 `MEMORY.md`，日记忆 `memory/YYYY-MM-DD.md`，可选 `memory/heartbeat-state.json` 等由调用方约定路径。

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/constitution/CONSTITUTION.md`
- 工作区记忆规范：`AGENTS.md`（MEMORY.md、memory/YYYY-MM-DD.md）
- 长期记忆文件：工作区根目录 `MEMORY.md`
- P0 技能实现计划：`agents/docs/specs/README.md`（若已包含 Skill-08）

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-10 | 初始版本：记忆管理智能体规约，store/search/update/delete、输入输出格式、10 条验收用例、响应时间 &lt;500ms、记忆一致性 100% |
