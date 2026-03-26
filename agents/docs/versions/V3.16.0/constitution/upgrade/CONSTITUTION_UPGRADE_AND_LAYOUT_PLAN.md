# 宪法规范目录与升级流程方案（完整版）

**状态**: 待确认后实施  
**日期**: 2026-03-14

---

## 一、目标与原则

1. **constitution 根目录**：只放**一个**当前生效的宪法规范文档 + 变更日志。
2. **配套规范**：按主题分子目录，便于查找和演进。
3. **升级流程**：通用「如何升级」的流程文档统一放在 constitution 下固定位置。
4. **过程文档归属**：某次升级（如 V3.7.0→V3.7.1）的**提案、讨论、决策、交付**全部放入**源版本**目录下（即 3.7.0 相关目录），便于按版本追溯。

---

## 二、constitution 目录目标结构

```
agents/docs/specs/constitution/
│
├── CONSTITUTION.md              # 【唯一】当前最新宪法入口（见 2.1）
├── CHANGELOG.md                 # 变更日志（保留在根，与「当前」强绑定）
├── README.md                    # 本目录说明 + 升级流程入口（见 2.2）
│
├── upgrade/                     # 【升级流程】通用流程与模板
│   ├── ITERATION_PROCESS.md     # 宪法规范迭代流程（从 CONSTITUTION_ITERATION_PROCESS 重命名）
│   ├── PROPOSAL_TEMPLATE.md     # 可选：升级提案模板
│   └── CHECKLIST.md             # 可选：升级前检查清单
│
├── change-classification/      # 变更分类
│   └── CONSTITUTION_CHANGE_CLASSIFICATION.md
│
├── cooling-off/                 # 冷静期
│   └── COOLING_OFF_PERIOD_RULES.md
│
├── audit/                       # 审计
│   └── AUDIT_CHECKLIST.md
│
├── backup/                      # 备份与回滚
│   ├── CONSTITUTION_BACKUP_WHITELIST.md
│   └── VERSION_BACKUP_AND_ROLLBACK.md
│
├── delivery/                    # 交付校验
│   └── CONSTITUTION_DELIVERY_CHECKLIST.md
│
├── directory-standard/          # 目录结构标准
│   └── CONSTITUTION_DIRECTORY_STANDARD.md
│
├── decision-recording/          # 决策记录规范
│   └── DECISION_RECORDING_RULES.md
│
└── architecture/                # 架构/扩展规范（非主条文）
    └── CONSTITUTION_V3.7_PARALLEL.md   # 需求级并行架构
```

### 2.1 根目录「唯一当前宪法」的两种实现方式

- **方案 A（推荐）**：根目录只保留 `CONSTITUTION.md`，内容为当前生效版本的**模块化索引**（即现有 CONSTITUTION_V3.9.0 的内容），文内链接指向上述子目录下的规范文件；不再在根目录保留 CONSTITUTION_V3.7.md / CONSTITUTION_V3.9.0.md 等多份主文档。
- **方案 B**：根目录保留 `CONSTITUTION.md` 为当前主文档，内容为「单文件全文」（如现行 V3.7 风格），另在 `architecture/` 或 `upgrade/` 下保留「模块化索引」作为可选入口。

建议采用 **方案 A**，与当前 V3.9.0 模块化设计一致，且根目录仅一个入口。

### 2.2 README.md 内容要点

- 本目录用途：宪法规范及配套规则、升级流程。
- 当前宪法入口：`CONSTITUTION.md`；变更历史：`CHANGELOG.md`。
- 升级流程入口：`upgrade/ITERATION_PROCESS.md`。
- 版本备份与过程文档位置：`agents/docs/versions/` 下先版本目录（如 V3.7.3），再 `constitution/`、`agents/`、`skills/`；过程文档在 `V{源版本}/constitution/upgrade-to-V{目标版本}/`（见第三节）。

---

## 三、版本备份与「某次升级」过程文档的摆放

约定：**从 V{A} 升级到 V{B} 的过程文档**，放在 **V{A} 的版本目录**下，便于「从该版本出发」的升级可追溯。

### 3.1 版本目录结构（先版本、后类型：agents/docs/versions/）

```
agents/docs/versions/
├── V3.7.0/
│   ├── agents/                      # 该版本智能体配置备份
│   ├── constitution/                # 该版本宪法快照与升级过程
│   │   ├── CONSTITUTION_V3.7.0.md
│   │   ├── backup_timestamp.txt
│   │   └── upgrade-to-V3.7.2/       # 3.7.0→3.7.2 过程文档
│   │       └── proposal.md
│   └── skills/                      # 该版本技能备份
├── V3.7.2/
│   └── constitution/
│       └── upgrade-to-V3.7.3/
│           └── proposal.md
├── V3.7.3/
│   ├── agents/
│   ├── constitution/
│   │   └── upgrade-to-V3.7.4/
│   │       ├── proposal.md
│   │       ├── design.md
│   │       └── ...
│   └── skills/
├── latest -> V3.7.3/
└── ...
```

### 3.2 需要迁移的现有内容

| 当前位置 | 迁移目标 | 说明 |
|----------|----------|------|
| constitution/CONSTITUTION_ITERATION_PROPOSAL_001.md | agents/docs/versions/V3.7.0/constitution/upgrade-to-V3.7.2/proposal.md | 提案为 V3.7→V3.7.2，源版本按 V3.7.0 处理 |
| constitution/CONSTITUTION_V3.7.3_PROPOSAL.md | agents/docs/versions/V3.7.2/constitution/upgrade-to-V3.7.3/proposal.md | 需先建 V3.7.2 目录（若无快照可只建该升级子目录） |
| openspec/changes/constitution-v3.7.4/* | agents/docs/versions/V3.7.3/constitution/upgrade-to-V3.7.4/ | 整目录迁移，保持 proposal、design、tasks、acceptance、delivery、user-confirmations、specs 等 |

说明：

- **决策/讨论**：若当前无全局 `agents/docs/decisions` 或 `discussions`，则本次升级产生的决策、讨论直接放在对应 `upgrade-to-Vx.y.z/decisions/`、`upgrade-to-Vx.y.z/discussions/`；若今后有全局决策库，可在该目录下只放「本次升级相关」的副本或索引。
- **交付清单/白名单**等文档中，凡写到「提案、讨论、决策、交付」路径的，一律改为指向上述 `agents/docs/versions/V{x.y.z}/constitution/upgrade-to-V{a.b.c}/` 的约定。

---

## 四、宪法规范升级流程（抽象为一套通用流程）

将总结反思智能体中的「宪法规范迭代」与现有 `CONSTITUTION_ITERATION_PROCESS.md` 合并为**一套**可复用的升级流程，放在 `constitution/upgrade/` 下。

### 4.1 流程文档内容要点（upgrade/ITERATION_PROCESS.md）

1. **触发条件**：每日总结、里程碑达成、审计发现、用户请求（与总结反思 AGENTS.md 一致）。
2. **步骤**：数据收集 → 问题识别 → 迭代提案生成 → 用户确认 → 审计监督 → 版本备份 → 正式生效 → 更新 CHANGELOG。
3. **提案格式**：变更概览、变更对比、影响分析、用户确认项、参考文档（审计/验收报告等）。
4. **版本与备份**：
   - 版本号规则：V{主}.{次}.{修订}，与 CHANGELOG 一致。
   - 备份位置：`agents/docs/versions/V{x.y.z}/constitution/`（先版本目录，再 constitution）。
   - **过程文档位置**：`agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/`，包含 proposal、discussions、decisions、delivery-report 等。
5. **相关文档**：总结反思 AGENTS.md、审计 AGENTS.md、CONSTITUTION.md、CHANGELOG.md；所有路径按新结构更新。

### 4.2 总结反思智能体 AGENTS.md 的更新

- 「宪法规范迭代」小节中，所有 `agents/docs/specs/constitution/CONSTITUTION_*.md` 改为：
  - 当前宪法：`agents/docs/specs/constitution/CONSTITUTION.md`
  - 升级流程：`agents/docs/specs/constitution/upgrade/ITERATION_PROCESS.md`
   - 版本备份与过程文档的路径改为：`agents/docs/versions/V{version}/constitution/` 及 `…/constitution/upgrade-to-V{x.y.z}/`。

---

## 五、CONSTITUTION.md 与历史主文档的处理

- **根目录**：只保留 `CONSTITUTION.md`（方案 A：内容为当前模块化索引，即原 V3.9.0 内容），文内链接指向子目录中的规范文件（如 `change-classification/...`、`cooling-off/...` 等）。
- **CONSTITUTION_V3.7.md**：迁出根目录。建议放入 `agents/docs/versions/V{version}/constitution/` 下作为历史快照，或放入 `constitution/architecture/` 并改名为 `CONSTITUTION_V3.7_ARCHIVE.md`，仅在 README 或 CHANGELOG 中说明「历史全文见某路径」。
- **CONSTITUTION_V3.9.0.md**：内容合并进根目录 `CONSTITUTION.md` 后即可删除该文件；或保留为 `CONSTITUTION_V3.9.0.md` 在根目录，并改名为 `CONSTITUTION.md`（即二选一作为唯一入口）。

---

## 六、引用与路径更新清单（实施时必做）

以下引用需随新结构一次性更新，避免断链。

1. **constitution 内部**
   - `CONSTITUTION.md`（或当前主入口）内所有指向配套规范的链接 → 改为 `change-classification/...`、`cooling-off/...` 等相对路径。
   - `CHANGELOG.md` 中提到的「宪法规范迭代提案 001」「CONSTITUTION_V3.7.3_PROPOSAL」等 → 改为指向 `agents/docs/versions/V{版本}/constitution/upgrade-to-Vx.y.z/...`。
   - `upgrade/ITERATION_PROCESS.md` 中示例提案链接、备份路径、过程文档路径 → 全部按第三节、第四节约定更新。
   - `backup/`、`delivery/`、`directory-standard/`、`decision-recording/` 等子目录内文档中，凡出现 `agents/docs/specs/constitution/` 或 `docs/proposals/`、`docs/decisions/` 等 → 改为新路径（含 `agents/docs/versions/V.../constitution/upgrade-to-V.../`）。

2. **工作区根与智能体**
   - `AGENTS.md`、`HEARTBEAT.md`、`MEMORY.md`：主规范链接 → `agents/docs/specs/constitution/CONSTITUTION.md`；若有「迭代流程」链接 → `constitution/upgrade/ITERATION_PROCESS.md`。
   - `agents/constitution/summary-reflection/AGENTS.md`：宪法规范迭代路径、版本备份路径、过程文档路径 → 按第四节、第三节更新。

3. **技能与其它文档**
   - 各技能 SKILL.md/README 中 `agents/docs/specs/constitution/CONSTITUTION_V3.7.md` 等 → 统一为 `agents/docs/specs/constitution/CONSTITUTION.md`（或保留一条「历史 V3.7 见 versions/...」的说明，按需）。
   - `agents/docs/specs/README.md`：constitution 说明与入口 → 更新为「当前宪法：constitution/CONSTITUTION.md；升级流程：constitution/upgrade/ITERATION_PROCESS.md」。

4. **交付清单与白名单**
   - `CONSTITUTION_DELIVERY_CHECKLIST`、`CONSTITUTION_BACKUP_WHITELIST` 等中列举的「宪法规范文档」路径、提案/讨论/决策/交付路径 → 按新目录与 `agents/docs/versions/V.../constitution/upgrade-to-V.../` 约定更新。

---

## 七、可能遗漏与建议

1. **决策记录全局 vs 版本内**  
   当前仓库无 `agents/docs/decisions`。若今后建立全局决策库（DEC-001～DEC-030 等），建议约定：  
   - 全局库为权威来源；  
   - 某次升级用到的 DEC 在 `agents/docs/versions/V{x}/constitution/upgrade-to-V{y}/decisions/` 下以副本或索引形式保留，便于单次升级自洽可读。

2. **CONSTITUTION_V3.7_PARALLEL.md**  
   仍具规范效力，建议保留在 `constitution/architecture/`，并在 `CONSTITUTION.md` 中保留一条指向该扩展规范的链接。

3. **openspec/changes/constitution-v3.7.4**  
   迁移到 `agents/docs/versions/V3.7.3/constitution/upgrade-to-V3.7.4/` 后，可在 `openspec/changes/` 下留一 README 说明「宪法升级类 OpenSpec 已迁至 agents/docs/versions/V{版本}/constitution/upgrade-to-V...」，避免后续再在 openspec 下新建宪法升级变更目录。

4. **版本目录的创建时机**  
   若某版本（如 V3.7.2）从未做过宪法快照备份，可仅创建 `V3.7.2/upgrade-to-V3.7.3/` 用于存放 3.7.2→3.7.3 的过程文档；必要时再补该版本的宪法快照。

5. **README 与索引**  
   - `constitution/README.md`：必做，说明根目录唯一入口、子目录分类、升级流程入口、版本与过程文档位置。  
   - 可在 `CONSTITUTION.md` 开头增加一句「本目录结构说明见 README.md」。

---

## 八、实施顺序建议

1. 在 constitution 下创建子目录：`upgrade/`、`change-classification/`、`cooling-off/`、`audit/`、`backup/`、`delivery/`、`directory-standard/`、`decision-recording/`、`architecture/`。
2. 按第二节移动现有 md 到对应子目录；根目录只保留 `CONSTITUTION.md`（由 V3.9.0 内容重命名/合并）、`CHANGELOG.md`。
3. 将 `CONSTITUTION_ITERATION_PROCESS.md` 移入 `upgrade/` 并改名为 `ITERATION_PROCESS.md`；必要时合并总结反思中的流程描述。
4. 在 `agents/docs/versions/` 下采用「先版本、后类型」结构（V3.7.x/constitution/、V3.7.x/agents/、V3.7.x/skills/），创建/补全各版本的 `constitution/upgrade-to-Vx.y.z` 目录，并迁移两份提案与 openspec/constitution-v3.7.4 内容。
5. 编写/更新 `constitution/README.md`。
6. 按第六节做全库引用与路径更新。
7. 更新交付清单、备份白名单、目录标准等文档中的路径描述与示例。

---

请确认：  
- 根目录唯一入口采用方案 A（CONSTITUTION.md = 模块化索引）是否同意；  
- 过程文档严格按「源版本目录 + upgrade-to-目标版本」摆放是否满足你的预期；  
- 是否有需要单独保留在根目录或不同子目录的文件。  
确认后即可按本方案实施。
