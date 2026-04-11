# 宪法规范目录下逻辑冲突与描述重复标识

**目的**：供人工审阅并更新规范，统一「决策/讨论/提案」归属与版本备份结构描述。  
**日期**：2026-03-14  
**状态**：✅ 已解决（2026-03-14 已按本清单完成全部规范更新）

---

## 一、逻辑冲突

### 1. 决策记录、讨论记录、宪法相关提案的「两处并存」未统一

**冲突点**：  
- 你已约定：**某次升级过程中的**提案、讨论记录、决策记录应放到 `agents/docs/versions` 对应版本的 constitution 目录下（即 `V{源版本}/constitution/upgrade-to-V{目标版本}/`）。  
- 当前多份规范仍把「决策、讨论、提案」**仅**写在按类型分目录的顶层路径下，且未区分「全局」与「某次升级过程」。

**涉及文件与现状**：

| 文件 | 当前描述 |
|------|----------|
| **CONSTITUTION_DIRECTORY_STANDARD.md** | §3 决策记录 → `docs/decisions/`；§4 讨论记录 → `docs/discussions/`；§5 提案 → `docs/proposals/`。未写「某次升级过程文档」归属。 |
| **CONSTITUTION_BACKUP_WHITELIST.md** | §3、§4、§5 白名单为 `agents/docs/decisions/`、`discussions/`、`proposals/`。未写 `versions/V{版本}/constitution/upgrade-to-V{目标}/` 内提案/讨论/决策的备份约定。 |
| **CONSTITUTION_DELIVERY_CHECKLIST.md** | 同步目录里列出 `agents/docs/decisions/`、`discussions/`、`proposals/`；未列出版本目录下 upgrade-to-V... 内过程文档的同步规则。 |
| **VERSION_BACKUP_AND_ROLLBACK.md** | 允许备份列表含 `agents/docs/decisions`、`discussions`、`proposals`；未提「upgrade-to-V.../ 内过程文档」是否纳入备份范围。 |

**已一致的文件**：  
- **constitution/README.md**、**CONSTITUTION_UPGRADE_AND_LAYOUT_PLAN.md** 已明确：某次升级过程文档（提案、讨论、决策、交付）放在 `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/`。

**建议统一约定（供你采纳或改写）**：  
- **全局/跨版本**：若保留全局决策库，则 `agents/docs/decisions/`（及 discussions、proposals）仅用于**跨版本、非单次升级**的决策/讨论/提案；并在各规范中明确写「仅用于全局」。  
- **某次升级过程**：单次升级的提案、讨论、决策、交付**一律**放在 `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/`（可含子目录如 `decisions/`、`discussions/`）。  
- 在 **CONSTITUTION_DIRECTORY_STANDARD**、**CONSTITUTION_BACKUP_WHITELIST**、**CONSTITUTION_DELIVERY_CHECKLIST**、**VERSION_BACKUP_AND_ROLLBACK** 中：  
  - 明确区分上述两种归属；  
  - 白名单/备份/交付中补充「`versions/V{版本}/constitution/upgrade-to-V{目标}/` 下过程文档」的列举或说明。

---

### 2. 版本备份目录结构在交付清单中仍为旧版

**冲突点**：  
- 当前实际与目录标准、README、升级方案一致为：**先版本、后类型** —— `agents/docs/versions/V{version}/constitution/`（及 `agents/`、`skills/`），`agents/docs/versions/latest` 指向当前版本。  
- **CONSTITUTION_DELIVERY_CHECKLIST.md** 中「同步目录结构」仍写为：  
  `versions/constitution/V{version}/` 与 `latest -> V{version}/`（且未带 `agents/docs/` 前缀），与现结构不符。

**涉及位置**：  
- **CONSTITUTION_DELIVERY_CHECKLIST.md** 第 52–56 行附近「同步目录结构」树状图。

**建议**：  
- 将该树状图改为与 **CONSTITUTION_DIRECTORY_STANDARD** §7 一致，即 `agents/docs/versions/V{version}/` 下为 `agents/`、`constitution/`、`skills/`，以及 `agents/docs/versions/latest`。

---

### 3. 根目录命名假设可能造成歧义

**冲突/歧义点**：  
- **CONSTITUTION_DIRECTORY_STANDARD.md** 以 `agent-constitution/` 为根目录名；**CONSTITUTION_DELIVERY_CHECKLIST.md** 同样使用 `agent-constitution/`。  
- 若本仓库根即为宪法工作区，实际根可能并非字面 `agent-constitution`，易产生「路径是否要加 agent-constitution」的歧义。

**建议**：  
- 在目录标准（及交付清单）中注明：根目录指「本宪法规范仓库根」或「当前工作区根」，并统一使用 `agents/docs/...` 等相对根的路径，避免依赖根目录字面名称。

---

## 二、描述相似/重复

### 4. 白名单 vs 版本备份与回滚规范

- **CONSTITUTION_BACKUP_WHITELIST.md**：详细列出允许/禁止备份、git add 示例、验证清单。  
- **VERSION_BACKUP_AND_ROLLBACK.md**：再次列出「允许备份的文件」「禁止备份的文件」，内容与白名单重叠且可能不同步。

**建议**：  
- 以 **CONSTITUTION_BACKUP_WHITELIST** 为**唯一权威**；在 **VERSION_BACKUP_AND_ROLLBACK** 中改为「允许/禁止备份范围见 CONSTITUTION_BACKUP_WHITELIST」，仅保留触发条件、回滚流程、自动化等与「流程」相关的描述，避免两处维护不一致。

---

### 5. 目录结构树状图/列表多处存在

- **CONSTITUTION_DIRECTORY_STANDARD**：完整「标准目录结构」与各节允许/禁止目录。  
- **CONSTITUTION_DELIVERY_CHECKLIST**：「同步目录结构」树状图。  
- **CONSTITUTION_BACKUP_WHITELIST**：白名单中的路径列表（非完整树，但仍是结构描述）。

**建议**：  
- 约定 **CONSTITUTION_DIRECTORY_STANDARD** 为**唯一**「目录结构定义」来源。  
- 交付清单、白名单中只保留「与本流程相关的路径清单」或简短说明，并注明「完整结构见 CONSTITUTION_DIRECTORY_STANDARD」，减少重复与不一致。

---

### 6. 决策记录「存放位置」未集中定义

- **CONSTITUTION.md**：写「决策记录（30 项）位置：agents/docs/decisions/DECISION_LOG.md」。  
- **CONSTITUTION_DIRECTORY_STANDARD**：§3 写 `docs/decisions/`（在 agent-constitution 根下）。  
- **CONSTITUTION_BACKUP_WHITELIST**：§3 写 `agents/docs/decisions/`。  
- **CONSTITUTION_DELIVERY_CHECKLIST**：决策记录表写 `agents/docs/decisions/`。  
- **DECISION_RECORDING_RULES.md**：只规定格式与编号，**未写存放路径**。

**建议**：  
- 在 **DECISION_RECORDING_RULES.md** 中增加一节「存放位置」：  
  - 全局决策记录 → `agents/docs/decisions/`；  
  - 某次升级相关决策 → `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/decisions/`（或你最终约定的子目录）。  
- 其余文档引用该规范，避免多处写路径。

---

## 三、小结表（已解决）

| # | 类型     | 问题摘要 | 处理结果 |
|---|----------|----------|----------|
| 1 | 逻辑冲突 | 决策/讨论/提案的「全局 vs 某次升级」归属不统一 | 已在 DIRECTORY_STANDARD §3–5、§7 与 BACKUP_WHITELIST、DELIVERY_CHECKLIST 中区分全局 vs upgrade-to-V{目标}，并统一约定 |
| 2 | 逻辑冲突 | 交付清单中版本备份结构仍为旧版 | DELIVERY_CHECKLIST 已改为先版本后类型（agents/docs/versions/V{version}/constitution/、latest），并引用目录标准 |
| 3 | 歧义     | 根目录 agent-constitution 与实际仓库根不一致 | DIRECTORY_STANDARD、DELIVERY_CHECKLIST 已注明「仓库根（本宪法规范仓库根/当前工作区根）」并统一路径 |
| 4 | 重复     | 白名单与回滚规范重复列允许/禁止备份 | VERSION_BACKUP_AND_ROLLBACK 第二节已改为引用 CONSTITUTION_BACKUP_WHITELIST 为唯一权威 |
| 5 | 重复     | 目录结构在多个文档中重复描述 | DELIVERY_CHECKLIST、BACKUP_WHITELIST 已增加「完整结构见 CONSTITUTION_DIRECTORY_STANDARD」说明 |
| 6 | 缺失一致 | 决策记录存放位置未在 DECISION_RECORDING_RULES 中定义 | DECISION_RECORDING_RULES 已新增第六节「存放位置」；CONSTITUTION、DELIVERY_CHECKLIST、BACKUP_WHITELIST 已引用该规范 |

---

**说明**：过程文档（某次升级的提案、讨论、决策、交付）已统一约定放入 `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/`；顶层 agents/docs/decisions、discussions、proposals 仅用于全局/跨版本内容。
