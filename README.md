# OpenClaw Workspace

智能体协同工作区：根目录 **AGENTS.md** 约定银河导航员（总协调）与 **9 大智能体** 的分工、业务代码边界（`/project/`、`/src/` 须经子智能体 / `sessions_spawn`）。现行宪法 **V3.17.0**，权威索引见 `agents/docs/specs/constitution/CONSTITUTION.md`。

---

## 宪法 V3.17.0 要点

| 特性 | 说明 |
|------|------|
| **变更分类** | Type-A/B/C 三级（3 天 / 24 小时 / 无冷静期）+ 紧急通道 |
| **冷静期** | Type-A 自次日 00:00 起算；Type-B 立即起算；可延长与提前结束 |
| **审计** | 分级清单、一票否决、用户 Override、审计 SLA |
| **版本备份** | 白名单、自动备份、回滚流程（Git Hook / CI 等） |
| **决策记录** | 决策过程与编号文档，索引见 `agents/docs/decisions/DECISION_LOG.md` |
| **交付校验** | 交付前同步、白名单与验收对比（交付清单） |
| **红蓝推演（V3.17）** | 第 9 大智能体：多视角挑战与应对建议，复杂度 ≥ B 可触发；方法见 `agents/docs/specs/constitution/red-team-simulation/` |

完整变更历史：`agents/docs/specs/constitution/CHANGELOG.md`。

---

## 根目录结构

| 路径 | 说明 |
|------|------|
| **AGENTS.md** | 工作区铁律与快速参考（必读） |
| **SOUL.md** / **USER.md** | 智能体原则与用户上下文 |
| **MEMORY.md** | 长期记忆（主会话加载） |
| **HEARTBEAT.md** | 周期性任务与支撑调度 |
| **IDENTITY.md** / **TOOLS.md** | 身份说明、工具与本地配置 |
| **.tasks/** | Hub-Spoke 任务：`index.md` 与各 REQ 子目录 |
| **agents/** | 子智能体配置、银河导航员规范、脚本与文档 |
| **agents/docs/specs/** | 宪法与流程规约（分领域子目录） |
| **agents/docs/decisions/** | 决策日志与 DEC-xxx 条文 |
| **agents/docs/versions/** | 宪法与智能体配置的历史版本备份 |
| **docs/** | 项目文档（OpenClaw 集成、验收、可视化等） |
| **openspec/** | OpenSpec 变更与规约 |
| **scripts/** | 可执行脚本（cron、监控等） |
| **memory/** | 每日记忆与状态 |
| **self-improving/** | 自省、纠偏与归档辅助材料 |
| **reports/** | 报告输出 |
| **archive/** | 归档 |
| **logs/** | 运行日志（通常被 .gitignore） |

---

## 文档入口

### 宪法与流程（优先读索引）

| 文档 | 路径 |
|------|------|
| **宪法唯一入口（V3.17.0）** | `agents/docs/specs/constitution/CONSTITUTION.md` |
| **规范目录总索引** | `agents/docs/specs/README.md` |
| **变更日志** | `agents/docs/specs/constitution/CHANGELOG.md` |
| **银河导航员** | `agents/constitution/GALAXY_NAVIGATOR.md` |
| **团队角色** | `agents/constitution/TEAM_ROLES.md` |
| **Hub-Spoke 任务管理** | `agents/docs/specs/constitution/HUB_SPOKE_TASK_MANAGEMENT.md` |
| **升级与迭代流程** | `agents/docs/specs/constitution/upgrade/ITERATION_PROCESS.md` |

### 模块化子规范（均在 `constitution/` 下）

| 主题 | 路径 |
|------|------|
| 变更分类 | `change-classification/CONSTITUTION_CHANGE_CLASSIFICATION.md` |
| 冷静期 | `cooling-off/COOLING_OFF_PERIOD_RULES.md` |
| 审计清单 | `audit/AUDIT_CHECKLIST.md` |
| 版本备份与回滚 | `backup/VERSION_BACKUP_AND_ROLLBACK.md` |
| 备份白名单 | `backup/CONSTITUTION_BACKUP_WHITELIST.md` |
| 决策记录规则 | `decision-recording/DECISION_RECORDING_RULES.md` |
| 交付校验清单 | `delivery/CONSTITUTION_DELIVERY_CHECKLIST.md` |
| OpenSpec 同步规约 | `SPEC_OpenSpec_Sync.md` |
| 硬门禁规约 | `HARD_GATE_SPEC.md` |

（上表路径均相对于 `agents/docs/specs/constitution/`。）

### 九大智能体配置

各角色 `AGENTS.md` 位于：`agents/constitution/requirement-clarification/`、`requirement-understanding/`、`requirement-resolution/`、`requirement-acceptance/`、`requirement-delivery/`、`audit/`、`summary-reflection/`、`debugger/`、`red-team-simulation/`。

### 决策与 OpenClaw

- **决策索引**：`agents/docs/decisions/DECISION_LOG.md`
- **集成、验收、运维等**：`docs/`

---

## Git 仓库

| 项 | 说明 |
|----|------|
| **宪法版本** | V3.17.0（与 `CONSTITUTION.md` 文首一致） |
| **标签与提交** | 在仓库根目录执行 `git describe --tags --always`、`git rev-parse --short HEAD` |


---

**规范版本**: V3.17.0 · 生效日期见 `agents/docs/specs/constitution/CONSTITUTION.md` 文首
