# Skill-08: 记忆管理智能体 (Memory Manager)

**版本**: 1.0 · **创建日期**: 2026-03-10 · **归属**: 支撑层 / 记忆管理

---

## 1. 技能简介

**记忆管理智能体**为 OpenClaw 工作区提供统一的**记忆存储、检索、更新与清理**能力，支撑：

- **长期记忆**：工作区根目录 `MEMORY.md`，供主会话启动时加载、Heartbeat 维护后写入
- **短期/日记忆**：`memory/YYYY-MM-DD.md`，按日一份，用于当日会话或临时记录

特性概览：

| 特性 | 说明 |
|------|------|
| 纯 Node.js 18+ | 仅使用 `fs`/`path`，无外部依赖 |
| 四种操作 | `store` 存储、`search` 检索、`update` 更新、`delete` 删除/清理 |
| 响应时间 | 单次调用（含检索）目标 &lt;500ms |
| 记忆一致性 | 读写原子、无部分写入或损坏 |

---

## 2. 安装说明

### 目录位置

技能位于工作区内固定路径：

```
agents/skills/skill-08-memory-manager/
├── README.md       # 本使用文档
├── SKILL.md        # 技能规约（输入输出、验收标准）
├── index.js        # 技能实现与 manage() 入口
├── test.js         # 验收测试（10 个用例）
└── prompts/
    └── memory-management.txt   # 可选 Prompt
```

### 使用前提

- **Node.js 18+**
- 调用方需传入**工作区根路径**（可选，默认 `process.cwd()`），记忆文件将相对于该根路径读写。

无需 `npm install`，直接 `require` 即可。

---

## 3. 快速开始

### 引入与调用

```javascript
const { manager } = require('./index.js');   // 或按实际路径 require

// 存储一条长期记忆
const out = manager.manage({
  action: 'store',
  content: '用户偏好：使用 dark 主题。',
  options: { workspaceRoot: '/path/to/workspace' }   // 可选，默认 cwd
});
console.log(out.success, out.results);   // true, [{ path: 'MEMORY.md', content: '...' }]

// 检索
const searchOut = manager.manage({
  action: 'search',
  content: '用户偏好 主题',
  options: { maxResults: 5, minScore: 0.5 }
});
console.log(searchOut.results);   // [{ path, content, score, lineStart, lineEnd }, ...]

// 更新（需用 id 或 match 定位）
manager.manage({
  action: 'update',
  content: '用户偏好：使用 light 主题。',
  options: { match: '用户偏好：使用 dark 主题。' }
});

// 删除单条 或 清理去重
manager.manage({ action: 'delete', content: '用户偏好：使用 light 主题。', options: {} });
manager.manage({ action: 'delete', content: '去重', options: { scope: 'all' } });
```

### 命令行快速验证

在技能目录下执行测试（见第 9 节）：

```bash
cd agents/skills/skill-08-memory-manager
node test.js
```

---

## 4. API 参考

### 4.1 入口方法：`manage(input)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `input` | object | 见下方输入格式 |

**返回值**：统一输出对象（见 4.3 输出格式）。

### 4.2 输入格式

```json
{
  "action": "store | search | update | delete",
  "content": "记忆内容（store/update）或搜索查询（search）或待删内容/清理语义（delete）",
  "options": {
    "workspaceRoot": "/path/to/workspace",
    "maxResults": 10,
    "minScore": 0.5,
    "scope": "long-term | session | all",
    "targetPath": "MEMORY.md | memory/YYYY-MM-DD.md | 相对路径",
    "id": "可选：单条记忆标识，用于 update/delete",
    "match": "可选：用于 update 的文本匹配片段"
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | `store` / `search` / `update` / `delete` |
| `content` | 依 action | store/update：记忆正文；search：查询文本；delete：待删内容或「去重」「清理」等语义 |
| `options` | 否 | 见下表 |

**options 说明**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `workspaceRoot` | string | `process.cwd()` | 工作区根目录绝对路径 |
| `maxResults` | number | 10 | 检索时返回的最大结果数（上限 100） |
| `minScore` | number | 0.5 | 检索最低相关性分数 0–1，低于此值的结果不返回 |
| `scope` | string | `all` | `long-term` 仅 MEMORY.md；`session` 仅当日 memory/YYYY-MM-DD.md；`all` 全部 |
| `targetPath` | string | 见存储说明 | 存储/更新时的目标文件（相对 workspaceRoot 或绝对路径） |
| `id` | string | — | 单条记忆标识，用于 update/delete 精确定位 |
| `match` | string | — | 用于 update 的文本片段，定位到包含该片段的段落并替换 |

### 4.3 输出格式

```json
{
  "success": true,
  "results": [
    {
      "path": "MEMORY.md",
      "content": "匹配的记忆内容片段",
      "score": 0.92,
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

失败时：

```json
{
  "success": false,
  "error": "MEMORY_VALIDATION_FAILED",
  "message": "content is required for store, search, update",
  "metadata": { "total": 0, "duration": 2, "action": "store", "scope": "all" }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 操作是否成功 |
| `results` | array | search：命中列表；store/update/delete：写入/更新/删除的条目摘要 |
| `metadata.total` | number | 命中或影响条数 |
| `metadata.duration` | number | 本次调用耗时（ms） |
| `metadata.action` | string | 本次 action |
| `metadata.scope` | string | 本次 scope |
| `error` | string | 失败时的错误码 |
| `message` | string | 失败时的错误信息 |

### 4.4 各 action 的 results 约定

| action | results 含义 |
|--------|----------------|
| `store` | 写入后的条目摘要：`path`、`content`（前 200 字） |
| `search` | 按 score 降序的命中列表，每项含 `path`、`content`、`score`、`lineStart`、`lineEnd` |
| `update` | 被更新条目的 `path` 与 `content` 摘要 |
| `delete` | 被删除条目的 `path`（及可选 `id`）列表；清理时为被处理文件的 `path` 列表 |

---

## 5. 记忆存储说明

### 5.1 MEMORY.md（长期记忆）

- **路径**：工作区根目录下的 `MEMORY.md`
- **用途**：主会话启动时读取、Heartbeat 维护后写入、需长期保留的决策与偏好
- **格式**：Markdown，按段落（`\n\n` 分隔）组织；新内容**追加**到文件末尾，不破坏现有结构
- **默认**：`action=store` 且未指定 `targetPath`、且 `scope` 非 `session` 时，写入 `MEMORY.md`

### 5.2 memory/*.md（短期/日记忆）

- **路径**：`memory/YYYY-MM-DD.md`，按当前日期生成
- **用途**：当日会话记录、临时笔记
- **格式**：同上，Markdown 段落追加
- **默认**：`action=store` 且 `options.scope === 'session'` 或 `targetPath` 指定为当日文件时，写入 `memory/YYYY-MM-DD.md`
- 若 `memory/` 不存在会自动创建

### 5.3 存储规则小结

| scope / targetPath | 实际写入目标 |
|--------------------|--------------|
| 未指定 / long-term / all，且无 targetPath | `MEMORY.md` |
| session，且无 targetPath | `memory/YYYY-MM-DD.md` |
| 指定 targetPath | 相对 workspaceRoot 或绝对路径对应文件 |

---

## 6. 记忆检索规则

### 6.1 语义搜索与分块

- **分块**：按**段落**（连续空行分隔）将文件切分为块，每块参与检索
- **匹配方式**：基于**词袋 + F1** 的轻量相关性打分（无外部 NLP 库）：
  - 查询与块内容均做小写 + 按空白分词
  - 计算 recall、precision，再算 F1 作为 `score`（0–1）
- **过滤**：`score < options.minScore` 的结果不返回
- **排序**：按 `score` **降序**
- **数量**：取前 `options.maxResults` 条（上限 100）

### 6.2 scope 与文件集合

| scope | 参与检索的文件 |
|-------|----------------|
| `long-term` | 仅 `MEMORY.md`（若存在） |
| `session` | 仅当日 `memory/YYYY-MM-DD.md`（若存在） |
| `all` | `MEMORY.md` + `memory/*.md` 下所有 `.md` 文件 |

### 6.3 返回结构

每条结果包含：

- `path`：相对工作区根路径
- `content`：该段落全文
- `score`：相关性分数（保留两位小数）
- `lineStart` / `lineEnd`：该段落在文件中的起止行号（从 1 开始）

---

## 7. 记忆更新规则

### 7.1 定位方式

更新前必须**唯一定位**到一段内容，两种方式二选一：

| 方式 | 说明 |
|------|------|
| `options.id` | 目标段落内包含该字符串即视为匹配 |
| `options.match` | 目标段落内包含该字符串即视为匹配（常用：原文片段） |

若同时提供 `id` 与 `match`，优先按 `id` 定位。

### 7.2 更新行为

- 在**保持文档结构**的前提下，将**整段**替换为 `content` 的 trim 结果
- 写回同一文件，其余段落不变
- 若未找到匹配段落，返回 `success: false`，错误码 `MEMORY_UPDATE_FAILED`

### 7.3 追加与修改

- **追加**：使用 `action: 'store'`，不指定 `id`/`match`，即可在目标文件末尾追加新段落
- **修改**：使用 `action: 'update'`，配合 `match` 或 `id` 定位到既有段落，再传入新内容

---

## 8. 记忆清理规则

### 8.1 单条删除

- 使用 `action: 'delete'`，并传入 `options.id` 或 `content`（与某段落内容匹配）
- 会删除**所有**包含该 id 或 content 的段落（可能多条）
- 删除后文件重写，多余空行合并为至多一个空行

### 8.2 批量清理（去重）

- `content` 为**清理语义**时触发去重逻辑，例如：
  - 中文：`去重`、`清理`
  - 英文：`cleanup`、`dedup`
- **去重规则**：按**行**（trim 后）去重，同一行只保留第一次出现；然后合并多余空行
- **作用范围**：由 `scope` 决定（long-term 只处理 MEMORY.md，session 只处理当日文件，all 处理 MEMORY.md + memory/*.md）

### 8.3 过期清理

- 当前实现**不包含**按日期自动删除「过期」记忆的逻辑
- 若需按时间清理，可由调用方先 `search` 再对结果逐条 `delete`，或自行维护 `memory/` 下文件生命周期

---

## 9. 测试运行说明

### 运行方式

在技能目录下执行：

```bash
node test.js
```

### 测试环境

- 测试使用**临时目录** `test-workspace/`（与 `index.js` 同目录），运行结束后自动删除
- 通过 `options.workspaceRoot` 指向该目录，不影响工作区真实 `MEMORY.md` 与 `memory/`

### 预期输出

全部通过时示例：

```
TC-01: 存储长期记忆 [PASS]
TC-02: 存储短期记忆 [PASS]
TC-03: 搜索有结果 [PASS]
TC-04: 搜索无结果 [PASS]
TC-05: minScore 过滤 [PASS]
TC-06: 更新记忆 [PASS]
TC-07: 删除单条记忆 [PASS]
TC-08: 批量清理 [PASS]
TC-09: 记忆一致性 [PASS]
TC-10: 性能测试 [PASS]

总计 (10/10)
```

- 退出码：`0` 表示全部通过，非 `0` 表示有失败用例

---

## 10. 常见问题 FAQ

| 问题 | 说明 |
|------|------|
| **记忆写到了哪里？** | 未指定 `targetPath` 时：默认长期写 `MEMORY.md`，`scope: 'session'` 写 `memory/YYYY-MM-DD.md`。指定 `targetPath` 则写该路径。 |
| **search 为什么没有结果？** | 检查：1）`scope` 是否包含目标文件；2）`minScore` 是否过高；3）查询词是否与段落有词重叠（当前为词袋匹配，无语义向量）。 |
| **update 报错 no matching block found** | 需要 `options.id` 或 `options.match` 能在某一**整段**内匹配到；且该段落在当前 `scope` 对应文件中存在。 |
| **delete 说要 content 或 id** | 单条删除必须传 `content`（匹配段落内容）或 `options.id`。若要做去重，传 `content: '去重'` 或 `'清理'` 等。 |
| **检索超过 500ms 怎么办？** | 规约要求单次 search &lt;500ms。若文件过大或文件数过多，可考虑缩小 `scope`、减少 `memory/*.md` 数量，或对 MEMORY.md 做分段/归档。 |
| **能否自定义 MEMORY.md 路径？** | 可以，在 `store`/`update`/`delete` 时通过 `options.targetPath` 指定目标文件（相对 workspaceRoot 或绝对路径）。 |

---

## 11. 验收标准验证说明

验收以 **test.js 中 10 个测试用例** 为准，对应 SKILL.md 中的验收标准。

### 用例与验收点对照

| 用例 ID | 场景 | 验收要点 |
|---------|------|----------|
| TC-01 | 存储长期记忆 | store 无 targetPath → 写入 MEMORY.md，success=true，文件含 content |
| TC-02 | 存储短期记忆 | store + scope=session → 写入 memory/YYYY-MM-DD.md，success=true |
| TC-03 | 搜索有结果 | search 返回 path/content/score，按 score 降序，metadata.duration &lt;500ms |
| TC-04 | 搜索无结果 | 生僻词检索 → results=[]，metadata.total=0，success=true |
| TC-05 | minScore 过滤 | 所有 results[].score ≥ minScore（0.8） |
| TC-06 | 更新记忆 | update 后文件含新内容、不含原内容，其余部分不变 |
| TC-07 | 删除单条 | delete 后对应段落从文件中移除，success=true |
| TC-08 | 批量清理 | content=「去重」→ 重复行仅保留一条，success=true |
| TC-09 | 记忆一致性 | store → search → update → search，每次读写内容与预期一致 |
| TC-10 | 性能 | search 的 metadata.duration &lt; 500ms |

### 指标要求

- **用例数量**：至少 10 个，覆盖 store（长期/短期）、search（有结果/无结果/minScore）、update、delete（单条/清理）、一致性、性能
- **检索响应时间**：单次 search 的 `metadata.duration` &lt; 500ms
- **记忆一致性**：任意 store/update/delete 后，再次读取对应 path 与段落，内容与预期一致，无部分写入或损坏

验证方式：在技能目录执行 `node test.js`，得到「总计 (10/10)」且退出码 0 即视为验收通过。

---

## 相关文档

- 技能规约（输入输出、执行逻辑、文件结构）：`SKILL.md`
- 工作区记忆规范：工作区根目录 `AGENTS.md`（MEMORY.md、memory/YYYY-MM-DD.md）
- 宪法与 P0 技能：`agents/docs/specs/CONSTITUTION_V3.7.md`、`agents/docs/specs/P0_SKILLS_IMPLEMENTATION_PLAN.md`
