# 宪法规范变更日志

## V3.16.0 (2026-03-26)

**状态**: ✅ 已生效（用户授权跳过冷静期，2026-03-26 立即生效）

### 移除

**进展跟进智能体（9+1 → 8+1）**
- 移除 `progress-tracking` 独立智能体
- 进度跟踪职责并入银河导航员（Hub 内置职责）
- 智能体数量：9+1 → 8+1

### 变更

**银河导航员职责增强**
- 新增进度跟踪职责（任务状态监控、周期汇报、停滞检测）
- 更新 `GALAXY_NAVIGATOR.md`
- 更新 `TEAM_ROLES.md`（移除"催更小助手"）

### 变更依据

- 提案：`agents/docs/versions/V3.15.0/constitution/upgrade-to-V3.16.0/PROPOSAL.md`
- 决策记录：DEC-038
- 用户确认：2026-03-26（选项 A：银河导航员接管）
- 升级报告：`agents/docs/versions/V3.15.0/constitution/upgrade-to-V3.16.0/UPGRADE_REPORT.md`

---

## V3.15.0 (2026-03-25)

**状态**: ✅ 已生效（用户授权跳过冷静期，2026-03-25 立即生效）

### 新增

**Hub-Spoke + Master-Worker 混合模式**
- 智能体协同架构升级：银河导航员作为 Hub，子智能体作为 Spoke
- 复杂任务支持 Master-Worker 模式（功能魔法师可分派子任务）
- 文本 + 共享文件双通道协同

**任务管理文件结构**
- 任务文件：`.tasks/{agent-id}/REQ-{ID}/task-xxx.md`
- 状态管理：在文件内容中（非文件名）
- 全局任务总览：`.tasks/index.md`
- 任务必须关联需求 ID

**与 Story File 互补设计**
- Story File（`story/state.md`）：跨智能体上下文传递
- Task File（`.tasks/`）：任务状态跟踪和分派
- 两者互补，不重叠

### 变更依据

- 提案：`agents/docs/versions/V3.14.0/constitution/upgrade-to-V3.15.0/PROPOSAL.md`
- 决策记录：DEC-037
- 用户确认：2026-03-25
- 飞书文档：待创建

---

## V3.14.0 (2026-03-25)

### 新增

**调试专家纳入正式流程（8+1 → 9+1）**
- 调试专家从"孤儿智能体"升级为正式子智能体（第 9 个）
- 定位为辅助型智能体（Auxiliary Agent），不占据主流程节点

**触发点 A：需求理解阶段 — 可调试性设计审查**
- 触发条件：跨系统集成、硬件交互、A/S 级复杂度、用户明确要求
- 审查清单：日志埋点规范、分段测试接口、连通性检查、错误码规范、可观测性指标
- 协作对象：脑洞整理师（需求理解智能体）
- 产出：`design.md` 新增「可调试性设计」章节

**触发点 B：需求解决阶段 — 问题排查辅助**
- 触发条件：同一 bug 调试 ≥3 轮、跨服务/跨进程问题、根因不明、用户要求
- 四阶段调试流程：Investigate → Analyze → Hypothesize → Implement
- 铁律：NO FIXES WITHOUT ROOT CAUSE
- 协作对象：功能魔法师（需求解决智能体）
- 产出：《调试报告》（根因 + 验证方法 + 修复方案）

**群聊规则扩展**
- 飞书大团建群新增调试专家角色
- 昵称：调试专家，别名：调试、debug、排查
- 遵循统一响应规则：被提到时响应，没被提到时沉默

### 修订

- 修订 `CONSTITUTION.md`：版本号 V3.13.0 → V3.14.0，智能体配置表从 8 个扩展为 9 个
- 修订 `TEAM_ROLES.md`：角色映射表新增调试专家，协作流程图增加触发点
- 修订 `AGENTS.md`（workspace 根目录）：版本号更新，Agent 表新增调试专家，8+1 → 9+1
- 修订 `debugger/AGENTS.md`：新增触发点 A（可调试性设计审查），明确协作关系，完善群聊规则
- 修订 `requirement-understanding/AGENTS.md`：新增与调试专家的协作章节（触发点 A 数据流）
- 修订 `requirement-resolution/AGENTS.md`：新增与调试专家的协作章节（触发点 B 数据流）
- 修订 `FEISHU_GROUP_CHAT_RULES.md`：新增调试专家角色及昵称映射

### 变更依据

- 触发事件：Rokid Glasses 项目联调暴露调试流程空白
- 提案：`agents/docs/versions/V3.13.0/constitution/upgrade-to-V3.14.0/PROPOSAL.md`
- 决策记录：DEC-036（将调试专家纳入宪法正式流程）
- 用户确认：2026-03-25 09:09 GMT+8
- 飞书文档：https://feishu.cn/docx/An1Dday6poCNNHxtkK8cmfy4nJd

### 影响范围

- 现有 8 个智能体的基本工作流**不受影响**
- 已有的需求文档格式**不受影响**
- `design.md` 模板新增「可调试性设计」可选章节

---

## V3.13.0 (2026-03-23)

### 变更

**移除强制 ACP 模式**
- 移除 `runtime="acp"` 强制要求
- 允许智能体根据任务复杂度自主选择执行方式（ACP / Subagent / 直接工具调用）
- 保留铁律：禁止主会话直接 `write` 业务代码

**执行方式选择规范（新增）**
- 新增执行方式对比表：ACP vs Subagent vs 直接工具调用
- 新增推荐用法指南：复杂任务推荐 ACP，简单任务可用 Subagent
- 更新子 Agent 职责表：添加"推荐执行方式"列

**影响范围**
- AGENTS.md：移除 ACP Harness 强制规范章节，新增执行方式选择规范
- CONSTITUTION.md：版本号 V3.12.0 → V3.13.0
- 各智能体 AGENTS.md：保持原有推荐，移除强制要求

**变更原因**
- 强制 ACP 在简单场景下增加不必要开销
- 智能体需要根据任务复杂度灵活选择执行方式
- Subagent 在简单任务中更高效

---

## V3.12.0 (2026-03-22)

### 新增

**哲学层（借鉴 gstack ETHOS.md）**
- 新增 `ETHOS.md` 四条核心原则：Boil the Lake、Search Before Building、Automate Through、Compliance is Infrastructure
- SOUL.md 引用 ETHOS.md，AGENTS.md 引用 ETHOS.md

**需求验收智能体增强**
- 新增 Fix-First 机制：AUTO-FIX 类问题自动修复，ASK 类问题才停下问
- 新增 Scope Drift 检测：检查变更是否对齐需求，防止 scope creep
- 新增两遍 Review：Pass 1 关键项（SQL安全/并发/LLM边界），Pass 2 信息项
- 新增浏览器 E2E 验证：前端项目自动触发，使用 OpenClaw browser 工具
- 新增截图存档作为验收证据

**需求澄清智能体增强**
- 新增 HARD GATE：澄清未完成 = 下游智能体不触发
- 新增 Anti-Sycophancy Rules：禁止空洞话术
- 新增结构化提问：Pre-product/Has users/Has paying 三阶段路由
- 新增必问清单：Q1 需求真实性、Q2 当前替代方案、Q3 MVP 范围

**debugger 调试专家智能体（新增）**
- 新增 `debugger/` 智能体：专注根因分析，不写功能代码
- 新增四阶段调试流程：Investigate → Analyze → Hypothesize → Implement
- 铁律：NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

**总结反思智能体增强**
- 新增量化 Retro 指标收集：需求周期、验收成功率、Scope Drift、决策停顿次数
- 新增趋势对比：本期 vs 上期，对比趋势
- 新增数据收集来源定义

**脑洞整理师智能体增强**
- 新增 15 条工程管理认知原则（借鉴 /plan-eng-review）
- 新增 Minimal Diff 原则：偏好最小化变更
- 新增 ASCII Diagram 强制要求：数据流图、状态机图、依赖关系图

**需求交付智能体增强**
- 新增 CHANGELOG 自动生成：基于 git diff 自动生成
- 新增 Commit 规范化：`<type>(<scope>): <subject>` 格式

**宪法规范执行（新增强制流程）**
- AGENTS.md 新增「宪法规范执行」章节：涉及宪法文件修改必须走 ITERATION_PROCESS
- audit 智能体新增宪法文件变更检查：24h 内检测 + PROCESS_VIOLATION_REPORT
- ITERATION_PROCESS.md 新增轻量升级入口：用户一句话 → spawn summary-reflection

**Template 规约生成系统（新增）**
- 新增 `templates/specs/proposal.md.tmpl`
- 新增 `templates/specs/design.md.tmpl`
- 新增 `templates/specs/tasks.md.tmpl`
- 新增 `scripts/gen-spec.py` 生成器

### 修订

- 修订 AGENTS.md：版本 → V3.12.0，新增宪法规范执行章节，引用 ETHOS.md
- 修订 SOUL.md：引用 ETHOS.md（建造原则）
- 修订 requirement-acceptance/AGENTS.md：Fix-First + Scope Drift + 浏览器 E2E
- 修订 requirement-clarification/AGENTS.md：HARD GATE + 结构化提问
- 修订 requirement-understanding/AGENTS.md：工程认知模式 + ASCII Diagram
- 修订 requirement-delivery/AGENTS.md：CHANGELOG 自动生成 + Commit 规范化
- 修订 summary-reflection/AGENTS.md：量化 Retro + 趋势对比
- 修订 audit/AGENTS.md：宪法文件变更检查
- 修订 ITERATION_PROCESS.md：轻量升级入口

### 备份

- 宪法规范备份：`agents/docs/versions/V3.12.0/constitution/`
- 智能体配置备份：`agents/docs/versions/V3.12.0/agents/`

### 变更依据

- 借鉴项目：gstack（https://github.com/garrytan/gstack）
- 用户指令：2026-03-22 GMT+8
- 决策记录：DEC-035 ~ DEC-040
- 流程违规报告：VIP-001
- 优化方案：OPT-001

### 参考

- gstack ETHOS.md
- gstack /review（Fix-First, Scope Drift）
- gstack /qa（浏览器 E2E）
- gstack /office-hours（HARD GATE, 结构化提问）
- gstack /investigate（四阶段调试）
- gstack /retro（量化 Retro）
- gstack /plan-eng-review（工程认知模式）
- gstack /ship（CHANGELOG 自动生成）


---

## V3.11.0 (2026-03-22)

### 新增
- 新增 Story File 上下文工程化（DEC-031）：`story/` 目录 + `state.md` 作为上下文传递容器
- 新增需求复杂度评级机制（DEC-032）：C/B/A/S 四级，按复杂度选择差异化开发路径
- 新增 Analysis 子阶段（DEC-033）：Clarification 拆分为 Analysis（可选）和 Clarification（必选）
- 新增智能体 SOP 清单化（DEC-034）：8 个智能体各增 SOP 章节，含步骤/时长/检查点
- 新增 `story/STORY_FILE_SPEC.md`（Story File 规范，约 100 行）

### 修订
- 修订 `CONSTITUTION.md`：新增 story/ 目录引用（宪法索引更新）
- 修订 `SPEC_OpenSpec_Sync.md`：story/ 目录纳入同步范围
- 修订 `requirement-clarification/AGENTS.md`（V3.10.0 → V3.11.0）：复杂度评级 + Analysis 阶段
- 修订其余 7 个智能体 AGENTS.md：各增加 SOP 章节

### 流程更新
- C级需求 → 快速流（clarification → resolution → delivery，跳过 understanding）
- B级需求 → 标准流（clarification → understanding → resolution → delivery）
- A级需求 → 完整流 + 24h 冷静期
- S级需求 → 完整流 + 3天冷静期 + 外部评审

### 备份
- 宪法规范备份：`agents/docs/versions/V3.11.0/constitution/`
- 智能体配置备份：`agents/docs/versions/V3.11.0/agents/`

### 变更依据
- 宪法规范迭代提案：V3.10.0 → V3.11.0
- 确认时间：2026-03-21 15:17 GMT+8
- 决策记录：DEC-031, DEC-032, DEC-033, DEC-034

### 问题解决
- 解决多智能体协作中上下文丢失的问题（Story File）
- 解决简单需求过度工程的问题（复杂度评级 + 快速流）
- 解决探索性需求无法先分析再澄清的问题（Analysis 阶段）
- 解决智能体执行不一致的问题（SOP 清单化）

### 参考
- BMAD Method（Breakthrough Method for Agile AI-Driven Development）

---

## V3.9.2 (2026-03-15)

### 新增
- 新增 L1-L2 识别（业务领域 + 业务场景）到需求澄清智能体
- 新增技术选型确认（后端框架、数据库、认证方式）到需求澄清智能体
- 新增技术选型继承到需求理解智能体
- 新增 L2→L3、L3→L4 映射表强制产出要求

### 修订
- 修订 requirement-clarification AGENTS.md（版本 V3.9.0 → V3.9.2）
- 修订 requirement-understanding AGENTS.md（版本 V3.9.0 → V3.9.2）
- 修订需求澄清流程：增加 L1-L2 识别和技术选型确认步骤
- 修订需求理解流程：增加技术选型继承和 L3/L4 映射产出

### 流程更新
- 更新需求澄清流程：增加业务领域识别环节
- 更新需求理解流程：增加技术选型继承环节

### 备份
- 宪法规范备份：`agents/docs/versions/V3.9.2/constitution/`
- 智能体配置备份：`agents/docs/versions/V3.9.2/agents/`

### 变更依据
- 宪法规范迭代提案：V3.9.0 → V3.9.2
- 确认时间：2026-03-15 ________ GMT+8

### 问题解决
- 解决需求澄清时业务领域不清晰的问题（L1-L2 识别）
- 解决技术选型遗漏导致返工的问题（技术选型确认）
- 解决 L3/L4 映射产出不稳定的问题（强化产出要求）

---

## V3.7.3 (2026-03-12)

### 新增
- 新增验收前置完整性检查（需求验收智能体阶段 0）
- 新增技能命名规范（SKILLS_NAMING_CONVENTION.md）
- 新增技能注册表（skills_manifest.json）
- 新增 Git 推送强制要求（需求交付智能体）
- 新增支撑智能体三周期体系文档化

### 修订
- 修订第二章 §4 需求验收智能体（增加前置完整性检查）
- 修订第二章 §5 需求交付智能体（增加 Git 推送强制要求）
- 修订第六章 4.5 节（新增技能命名规范）

### 新增技能
- `skills_manifest.json`（技能注册表，16 个活跃技能）

### 流程更新
- 更新验收流程：增加交付物完整性预检环节
- 更新交付流程：Git 推送成为强制步骤
- 更新技能管理：建立技能 ID 注册表机制

### 备份
- 宪法规范备份：`agents/docs/versions/V3.7.3/constitution/`
- 智能体配置备份：`agents/docs/versions/V3.7.3/agents/`
- 技能目录备份：`agents/docs/versions/V3.7.3/skills/`（全量 44 个技能）

### 变更依据
- 宪法规范迭代提案（V3.7.2→V3.7.3）：`agents/docs/versions/V3.7.2/constitution/upgrade-to-V3.7.3/proposal.md`
- 确认时间：2026-03-12 00:31 GMT+8

### 问题解决
- 解决 req-B 验收时代码缺失仍进入验收的问题（前置检查）
- 解决 Skill-06 ID 重复问题（技能注册表）
- 解决 Git 提交后推送遗漏的问题（Git 推送强制）

---

## V3.7.2 (2026-03-11)

### 新增
- 新增审计智能体周期性审计职责（每 2 小时）
- 新增审计智能体规范缺陷报告职责
- 新增总结反思智能体宪法规范迭代提案职责
- 新增宪法规范迭代流程（第四章 4.5）

### 修订
- 修订第二章 §7 审计智能体（增加周期性审计职责）
- 修订第二章 §8 总结反思智能体（增加规范迭代职责）
- 修订第五章可配置参数（新增 N_reflection_hours）

### 新增技能
- `audit-log-analyzer`（审计日志分析器）
- `constitution-iterator`（宪法规范迭代提案生成器）

### 流程更新
- 更新审计流程：增加周期性审计环节
- 更新总结反思流程：增加规范迭代提案环节
- 新增规范更新流程：宪法规范迭代流程

### 变更依据
- 宪法规范迭代提案 001（已确认）
- 确认时间：2026-03-11 00:15 GMT+8

---

## V3.7.1 (2026-03-10)

### 新增
- 新增需求级并行架构（architecture/CONSTITUTION_V3.7_PARALLEL.md）
- 新增支撑智能体定时配置（HEARTBEAT.md）
- 新增 cron 定时任务配置

### 修订
- 修订支撑智能体配置（增加飞书推送）

---

## V3.7.0 (2026-03-09)

### 新增
- 初始版本
- 8 个核心智能体配置
- 3 个支撑智能体配置
- 审计规范（AUDIT_SPEC.md）
- 进展规范（PROGRESS_SPEC.md）
