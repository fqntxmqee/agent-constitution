# 智能体协同系统宪法 - 8 个子 Agent (V3.7)

本目录为 **智能体协同系统宪法规范 V3.7** 下定义的 8 个专项智能体工作区，与 OpenClaw `agents.list` 一一对应。

---

## 📜 规范版本

- **版本号**: V3.7
- **生效日期**: 2026-03-09
- **状态**: ✅ 已生效
- **主规范文件**: `agents/docs/specs/CONSTITUTION_V3.7.md`

---

## 🤖 子 Agent 列表与职责

| Agent ID | 名称 | 定位 | 核心职责摘要 |
|----------|------|------|--------------|
| requirement-clarification | 需求澄清智能体 | 万能前台、意图路由器 | 全域意图分类、模糊性消除、路由决策（标准构建流/快速执行流）、产出《已确认提案》 |
| requirement-understanding | 需求理解智能体 | 执行蓝图设计师 | 将已确认需求转化为标准化执行蓝图（OpenSpec/内容大纲/执行计划），定义 AC |
| requirement-resolution | 需求解决智能体 | 全能执行者 | 严格依据蓝图执行，开发类任务必须使用 `runtime="acp"` + Cursor CLI，产出交付物雏形 |
| requirement-acceptance | 需求验收智能体 | 多维质量守门员 | 依据 AC 独立验证，拥有一票否决权，支持用户 override 流程 |
| requirement-delivery | 需求交付智能体 | 最终交付专家 | 验收通过后做形态适配与安全终检，生产部署必须用户二次确认 |
| progress-tracking | 进展跟进智能体 | 中央调度与通讯官 | 仅观察与广播，监控状态、计算进度、异常报警，严禁发送执行指令 |
| audit | 审计智能体 | 合规监察官 | 旁路监控、高置信度违规熔断、用户可 overrule 误报、事后审计报告 |
| summary-reflection | 总结反思智能体 | 系统进化引擎 | 离线分析、技能萃取、改进方案须经用户确认后在下一任务应用 |

---

## 🔄 智能体间输入输出契约

| 上游智能体 | 下游智能体 | 上游产出（下游输入） | 触发下游的条件 |
|------------|------------|----------------------|----------------|
| 用户 | 需求澄清 | 用户原始请求 | 新请求到达 |
| 需求澄清 | 需求理解 | 《已确认提案》（且路由=标准构建流） | 用户确认提案且选择标准构建流 |
| 需求澄清 | 需求解决 | 《轻量执行计划》（且路由=快速执行流） | 用户确认提案且选择快速执行流 |
| 需求理解 | 需求解决 | 《执行蓝图》 | 用户确认蓝图（若配置要求） |
| 需求解决 | 需求验收 | 交付物雏形 + 《自查报告》 | 解决智能体提交验收请求 |
| 需求验收 | 需求交付 | 《验收通过报告》或《用户 override 记录》+ 待交付物 | 验收通过或用户 override 允许交付 |
| 需求验收 | 需求解决 | 《失败诊断报告》+ 原交付物 | 验收不通过且未达 N 次上限 |
| 进展跟进 | 用户、审计 | 状态视图、进度、异常告警 | 持续；异常时主动推送告警 |
| 审计 | 用户、系统 | 熔断事件、恢复记录、审计报告 | 违规时熔断；事后审计完成时报告 |

**说明：** 总结反思智能体不在此主流程链中；其输入为历史日志与知识库，产出经用户确认后注入知识库

---

## ⚖️ 关键决策权分级

| 决策事项 | 主导智能体 | 最终裁定权 | 备注 |
|----------|------------|------------|------|
| 意图分类 | 需求澄清 | 用户 | AI 建议，用户确认为准 |
| 任务复杂度与路由 | 需求澄清 | 用户 | 澄清建议，用户确认后路由 |
| 蓝图/Spec 内容 | 需求理解 | 用户 | 业务/内容方向变更时 |
| 验收通过与否 | 需求验收 | 需求验收 | 一票否决权；用户可 override 进入交付 |
| 违规熔断 | 审计 | 审计 | 高置信度自动熔断，存疑先告警 |
| 熔断恢复 | 用户 | 用户 | 仅用户可发起恢复 |
| 生产环境部署 | 需求交付 | 用户 | 必须人工二次确认 |

---

## 📁 工作区结构

```
agents/constitution/
├── README.md                          # 本文件（总览入口）
├── PERIODIC_AGENTS_CONFIG.md          # 周期性支撑智能体配置
├── requirement-clarification/         # 需求澄清智能体
│   ├── SOUL.md
│   ├── AGENTS.md                      # ✅ V3.7 已更新
│   └── ...
├── requirement-understanding/         # 需求理解智能体
│   ├── SOUL.md
│   ├── AGENTS.md                      # ✅ V3.7 已更新
│   └── ...
├── requirement-resolution/            # 需求解决智能体
│   ├── SOUL.md
│   ├── AGENTS.md                      # ✅ V3.7 已更新
│   └── ...
├── requirement-acceptance/            # 需求验收智能体
│   ├── SOUL.md
│   ├── AGENTS.md                      # ✅ V3.7 已更新
│   └── ...
├── requirement-delivery/              # 需求交付智能体
│   ├── SOUL.md
│   ├── AGENTS.md                      # ✅ V3.7 已更新
│   └── ...
├── progress-tracking/                 # 进展跟进智能体
│   ├── SOUL.md
│   ├── AGENTS.md                      # ✅ V3.7 已更新
│   └── ...
├── audit/                             # 审计智能体
│   ├── SOUL.md
│   ├── AGENTS.md                      # ✅ V3.7 已更新
│   └── ...
└── summary-reflection/                # 总结反思智能体
    ├── SOUL.md
    ├── AGENTS.md                      # ✅ V3.7 已更新
    └── ...
```

---

## 📚 相关文档

- **主规范**: `agents/docs/specs/CONSTITUTION_V3.7.md`
- **架构文档**: `agents/docs/architecture/SIX_AGENT_ARCHITECTURE.md`
- **工作流程**: `agents/docs/architecture/WORKFLOW.md`
- **审计规范**: `agents/docs/specs/AUDIT_SPEC.md`
- **OpenSpec 指南**: `agents/docs/specs/OPENSPEC_GUIDE.md`

---

## 🚀 使用方式

### 方式一：OpenClaw 命令行（显式指定子 Agent）

```bash
# 需求理解
openclaw agent --agent requirement-understanding --message "分析以下需求并产出 OpenSpec：{需求描述}"

# 需求澄清
openclaw agent --agent requirement-clarification --message "对 openspec/changes/{项目名}/ 做澄清分析，产出澄清清单"

# 需求解决（⚠️ 必须用 runtime="acp"）
openclaw agent --agent requirement-resolution --message "按 openspec/changes/{项目名}/tasks.md 逐项执行，仅用 cursor agent --print"

# 需求验收
openclaw agent --agent requirement-acceptance --message "验收 openspec/changes/{项目名}/ 的交付物与规约，产出验收报告"

# 需求交付
openclaw agent --agent requirement-delivery --message "对 openspec/changes/{项目名}/ 做 Git 提交与部署，产出交付报告"
```

### 方式二：主会话内发起需求解决（ACP + Cursor，OpenClaw 3.8 推荐）

在 OpenClaw 3.8 下，`sessions_spawn(runtime="acp", ...)` 可能报错 `spawnedBy is only supported for subagent:* sessions`，故**推荐**在支持 `/acp` 的渠道用命令发起需求解决，由 Cursor CLI 执行：

在对话中发送（或由主 Agent 引导用户/编排发送）：

```text
/acp spawn cursor --mode oneshot -t "你现为需求解决智能体。规约路径：openspec/changes/{项目名}/。请按 tasks.md 顺序执行，仅使用 cursor agent --print（或 exec cursor ...），禁止用 write 创建业务代码。完成后汇报执行记录与验证结果。"
```

将 `{项目名}` 替换为实际项目目录名。详见 `docs/OpenClaw-ACP-Cursor-集成方案（官方版）.md` 第四节「需求解决智能体使用 ACP 调用 Cursor CLI」。

若环境已修复 `sessions_spawn(runtime="acp")`，也可恢复使用：

```python
sessions_spawn(
    runtime="acp",
    agentId="requirement-resolution",  # 或 agentId="cursor"
    label="requirement-resolution-xxx",
    task="""你现为需求解决智能体。规约路径：openspec/changes/{项目名}/。
    请按 tasks.md 顺序执行，仅使用 cursor agent --print（或 exec cursor ...），禁止用 write 创建代码。
    完成后汇报执行记录与验证结果。""",
    mode="run"
)
```

---

## ⚠️ V3.7 强制规范

### 需求解决智能体
- ✅ **必须使用** `runtime="acp"`（不是 `subagent`）
- ❌ **禁止使用** `write` 工具直接创建业务代码

### 审计检查点
- [ ] 检查 `sessions_spawn` 调用是否使用 `runtime="acp"`
- [ ] 发现使用 `subagent` 执行开发任务 → 标记为严重违规，必须重做

### 用户确认节点
- 意图确认（澄清智能体输出后）
- 蓝图/执行计划确认（理解智能体或澄清智能体产出后）
- 生产环境部署（交付智能体发起前）
- 规范/宪法变更
- 高风险内容发布

---

## 📊 可配置参数

| 参数标识 | 含义 | 默认值 | 说明 |
|----------|------|--------|------|
| N_rounds | 短期记忆保留的最近交互轮数 | 20 | 第一章「最近 N 轮交互」 |
| N_acceptance_cycles | 解决 - 验收循环最大次数 | 3 | 超过后进展报警，用户/审计仲裁 |
| N_reflection_hours | 连续运行多少小时后触发总结反思 | 8 | 第二章总结反思智能体 |
| 人工确认超时时间 | 关键节点等待用户确认的最长时间 | 24（小时） | 超时后的行为见第一章第 6 条 |

---

**规范版本**: V3.7  
**生效日期**: 2026-03-09  
**创建者**: 伏开 (Fukai)
