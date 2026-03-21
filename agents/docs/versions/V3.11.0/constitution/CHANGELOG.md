# 宪法规范变更日志

## V3.12.0 (2026-03-22)

### 新增
- 新增"飞书链接发送强制化"（DEC-035）：所有需要用户确认的文档必须本地有 + 飞书有 + 链接发送给用户
- 新增主会话行为约束：未发送飞书链接给用户，禁止进入下一阶段
- 新增用户确认消息模板：每个节点列出所有文档及飞书链接
- 新增 acceptance_criteria.md 到强制同步文档列表

### 修订
- 修订 SPEC_OpenSpec_Sync.md（V3.10.0 → V3.12.0）
- 修订审计检查清单：增加"飞书链接已发送给用户"检查项

### 变更依据
- 用户指令：2026-03-21 17:17
- 决策记录：DEC-035

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
