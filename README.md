# OpenClaw Workspace

智能体协同工作区，遵循宪法规范 V3.9.0（8 子 Agent 工作流 + 交付校验机制）。

---

## 📜 宪法 V3.9.0 核心变更

| 特性 | 说明 |
|------|------|
| **变更分类** | Type-A/B/C 三级分类（3 天/24 小时/无冷静期） |
| **冷静期机制** | Type-A: 3 天，Type-B: 24 小时，紧急通道 |
| **审计监督** | 审计检查清单 + 一票否决权 + 用户 Override |
| **版本备份** | 白名单机制 + 自动备份 + 回滚演练 |
| **决策记录** | 30 项决策全部记录（DEC-001 至 DEC-030） |
| **交付校验** | 交付前文件同步 + 白名单校验 + 验收对比 |

---

## 根目录结构

| 路径 | 说明 |
|------|------|
| **AGENTS.md** | 工作区规范与 Agent 行为（必读） |
| **SOUL.md** | Agent 身份与原则 |
| **USER.md** | 用户上下文 |
| **MEMORY.md** | 长期记忆（仅主会话加载） |
| **HEARTBEAT.md** | 周期性任务与支撑智能体调度 |
| **IDENTITY.md** | 身份说明 |
| **TODO.md** | 待办 |
| **TOOLS.md** | 工具与本地配置 |
| **agents/** | 子智能体、宪法、技能、脚本 |
| **docs/** | 项目文档（OpenClaw 集成、验收、可视化等） |
| **openspec/** | OpenSpec 变更与规约 |
| **scripts/** | 可执行脚本（cron 安装、监控等） |
| **memory/** | 每日记忆与状态 |
| **reports/** | 报告输出 |
| **archive/** | 归档（如 agents.bak 等历史备份） |
| **logs/** | 日志（通常被 .gitignore） |

---

## 文档入口

### 宪法规范（V3.9.0）
- **变更分类规范**: `agents/docs/specs/CONSTITUTION_CHANGE_CLASSIFICATION.md`
- **冷静期规则**: `agents/docs/specs/COOLING_OFF_PERIOD_RULES.md`
- **审计检查清单**: `agents/docs/specs/AUDIT_CHECKLIST.md`
- **版本备份与回滚**: `agents/docs/specs/VERSION_BACKUP_AND_ROLLBACK.md`
- **决策记录规范**: `agents/docs/specs/DECISION_RECORDING_RULES.md`
- **备份白名单**: `agents/docs/specs/CONSTITUTION_BACKUP_WHITELIST.md`
- **交付校验清单**: `agents/docs/specs/CONSTITUTION_DELIVERY_CHECKLIST.md`

### 智能体配置
- **8 个智能体**: `agents/constitution/*/AGENTS.md`

### 决策记录
- **决策日志**: `agents/docs/decisions/DECISION_LOG.md`
- **30 项决策**: `agents/docs/decisions/DEC-001.md` 至 `DEC-030.md`

### OpenClaw 与 Cursor 集成
- 集成方案、验收、飞书等：**docs/**

---

## 🚀 Git 仓库

- **当前版本**: V3.9.0
- **Git Tag**: v3.9.0
- **最新 Commit**: 13340c8
- **提交范围**: 仅宪法规范相关文件（白名单）

---

**规范版本**: V3.9.0 · 2026-03-12
