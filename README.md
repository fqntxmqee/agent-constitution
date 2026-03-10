# OpenClaw Workspace

智能体协同工作区，遵循宪法规范 V3.7（8 子 Agent 工作流）。

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

- OpenClaw 与 Cursor 集成、验收、飞书等：**docs/**
- 宪法与子 Agent 规范：**agents/docs/specs/**、**agents/constitution/**

---

**规范版本**: V3.7 · 2026-03-09
