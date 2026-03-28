# 红蓝推演智能体 🎭

> **决策辅助专家** - 多视角分析、方案挑战、风险识别

---

## 📋 快速导航

| 文档 | 说明 |
|------|------|
| [AGENTS.md](AGENTS.md) | 智能体职责定义（核心文档） |
| [config.json](config.json) | 配置文件 |
| [prompts/red-team.md](prompts/red-team.md) | 红队提示词 |
| [prompts/blue-team.md](prompts/blue-team.md) | 蓝队提示词 |
| [examples/usage.md](examples/usage.md) | 使用示例 |

---

## 🎯 智能体定位

红蓝推演智能体是 OpenClaw 银河导航员团队的**第 9 大智能体**，担任"魔鬼代言人"和"多视角分析器"的角色。

**核心价值**:
- 🔴 **红队挑战**: 质疑假设、识别风险、提出替代方案
- 🔵 **蓝队完善**: 应对建议、方案加固、验收完善
- 📊 **决策辅助**: 为银河导航员提供多维度分析

---

## 🚀 快速开始

### 自动触发

当任务复杂度≥B 级时，在需求理解和方案评审阶段自动触发。

### 手动触发

```bash
openclaw agent --agent red-team-simulation --message "对以下设计进行红蓝推演：[设计方案]"
```

---

## 📁 目录结构

```
red-team-simulation/
├── AGENTS.md                 # 智能体职责定义
├── config.json              # 配置文件
├── prompts/
│   ├── red-team.md          # 红队提示词
│   └── blue-team.md         # 蓝队提示词
├── reports/
│   └── template.md          # 报告模板
├── examples/
│   └── usage.md             # 使用示例
└── README.md                # 本文档
```

---

## 📊 推演报告

推演报告生成路径：`agents/constitution/red-team-simulation/reports/YYYY-MM-DD-HHMM.md`

报告同步到飞书文档，链接回写到本地。

---

## 🔗 相关规范

| 规范 | 路径 |
|------|------|
| 宪法规范索引 | `agents/docs/specs/constitution/CONSTITUTION.md` |
| 团队角色图谱 | `agents/constitution/TEAM_ROLES.md` |
| 银河导航员职责 | `agents/constitution/GALAXY_NAVIGATOR.md` |

---

## 📝 需求文档

| 文档 | 路径 |
|------|------|
| 需求提案 | `project/red-team-simulation/changes/init/proposal.md` |
| 需求规格 | `project/red-team-simulation/changes/init/specs/requirements.md` |
| 技术设计 | `project/red-team-simulation/changes/init/specs/design.md` |
| 任务清单 | `project/red-team-simulation/changes/init/specs/tasks.md` |
| 验收标准 | `project/red-team-simulation/changes/init/specs/acceptance-criteria.md` |

---

**智能体版本**: 1.0  
**创建日期**: 2026-03-28  
**维护者**: 银河导航员团队
