# 智能体协同系统宪法规范（当前生效）

**版本号**: V3.18.0
**生效日期**: 2026-04-05
**状态**: ✅ 已生效（用户授权跳过冷静期）
**说明**: 本文件为**宪法规范索引**（唯一权威来源），采用模块化设计，各子规范为执行依据。智能体实际执行时读取 `agents/constitution/<agent>/AGENTS.md`。

---

## 📜 宪法概述

当前宪法采用**模块化设计**，由以下核心规范文档组成（均位于本目录子目录下）：

---

## 📚 核心规范文档（12 个）

### 1. 变更分类规范
**文件**: [change-classification/CONSTITUTION_CHANGE_CLASSIFICATION.md](change-classification/CONSTITUTION_CHANGE_CLASSIFICATION.md)  
**说明**: Type-A/B/C 三级变更分类机制

**核心内容**:
- Type-A: Major 变更（8 天冷静期）
- Type-B: Minor 变更（4 小时冷静期）
- Type-C: Patch 变更（无冷静期）
- 紧急通道机制

**飞书链接**: https://feishu.cn/docx/BQNbdH9Lkor4thxG9Mgcyss4nob

---

### 2. 冷静期规则
**文件**: [cooling-off/COOLING_OFF_PERIOD_RULES.md](cooling-off/COOLING_OFF_PERIOD_RULES.md)  
**说明**: 冷静期机制详细规则

**核心内容**:
- Type-A: 3 天冷静期（次日 00:00 起算）
- Type-B: 24 小时冷静期（立即起算）
- 延长机制（Type-A 最多 2 次）
- 提前结束机制
- 紧急通道

**飞书链接**: https://feishu.cn/docx/HOKPdi15DoYRCtxFC8IcuSkEn3w

---

### 3. 审计检查清单
**文件**: [audit/AUDIT_CHECKLIST.md](audit/AUDIT_CHECKLIST.md)  
**说明**: 审计监督实质化规范

**核心内容**:
- Type-A 审计清单（100% 覆盖）
- Type-B 审计清单（核心项）
- Type-C 审计（抽查）
- 一票否决权机制
- 用户 Override 机制
- 审计 SLA（Type-A:24h / Type-B:4h）

**飞书链接**: https://feishu.cn/docx/PEK8d1z6loFqY3xBiZ4cGI58nVc

---

### 3.1 实时熔断监控规范（V3.16.0 新增）
**文件**: [audit/REAL_TIME_FUSE.md](audit/REAL_TIME_FUSE.md)  
**说明**: 实时熔断监控执行规范

**核心内容**:
- 轮询频率：每 30 秒
- 违规检测规则（VIO-001 ~ VIO-007）
- 置信度分级与熔断决策
- 熔断执行流程（STOP → SAVE → ALERT → WAIT）
- 用户 Overrule 恢复机制
- 与审计智能体集成

---

### 3.2 回归测试规范（V3.16.0 新增）
**文件**: [audit/REGRESSION_TEST_SPEC.md](audit/REGRESSION_TEST_SPEC.md)  
**说明**: 宪法规范回归测试规范

**核心内容**:
- 测试用例集（T001-T010）
- 定时调度：每日 02:00
- 测试报告生成
- 失败告警机制

---

### 4. 版本备份与回滚规范
**文件**: [backup/VERSION_BACKUP_AND_ROLLBACK.md](backup/VERSION_BACKUP_AND_ROLLBACK.md)  
**说明**: 版本备份与回滚机制

**核心内容**:
- 备份触发条件
- 备份白名单机制
- 备份内容规范
- 回滚流程
- 自动化备份（Git Hook + GitHub Actions）

**飞书链接**: https://feishu.cn/docx/PsFrd0bMooLyJ6x1nEIcgKbNnFb

---

### 5. 决策记录规范
**文件**: [decision-recording/DECISION_RECORDING_RULES.md](decision-recording/DECISION_RECORDING_RULES.md)  
**说明**: 决策过程记录规范

**核心内容**:
- 决策记录原则（决策必记录、过程可追溯）
- 决策记录格式（DEC-{编号}.md）
- 决策编号规则
- 决策状态流转
- 必须记录的内容

**飞书链接**: https://feishu.cn/docx/TqxxdEfTnohMk0xXhUhcNH38nng

---

### 6. 备份白名单规范
**文件**: [backup/CONSTITUTION_BACKUP_WHITELIST.md](backup/CONSTITUTION_BACKUP_WHITELIST.md)  
**说明**: 版本备份白名单机制

**核心内容**:
- 允许备份的文件（白名单）
- 禁止备份的文件（黑名单）
- Git 提交规范
- 备份验证清单


---

### 7. Story File 规范（V3.11.0 新增）
**文件**: [story/STORY_FILE_SPEC.md](story/STORY_FILE_SPEC.md)  
**说明**: Story File 上下文工程化规范

**核心内容**:
- story/state.md：当前故事状态（必选）
- story/context/：各阶段上下文
- story/decisions/：决策索引
- story/feedback/：用户反馈记录

---

### 8. Hub-Spoke 任务协同与管理模式（V3.15.0 新增）
**文件**: [HUB_SPOKE_TASK_MANAGEMENT.md](HUB_SPOKE_TASK_MANAGEMENT.md)  
**说明**: Hub-Spoke + Master-Worker 混合模式任务协同架构

**核心内容**:
- Hub-Spoke 架构：银河导航员为 Hub，各智能体为 Spoke
- 任务文件结构：`.tasks/{agent-id}/REQ-{ID}/task-xxx.md`
- 全局任务总览：`.tasks/index.md`
- 任务状态管理：pending | running | completed | failed | blocked | cancelled
- 任务 ID 由银河导航员预分配
- 智能体实时更新 index.md
- 任务失败/超时/取消处理机制
- 与 Story File 互补设计

---

### 9. 目录结构标准
**文件**: [directory-standard/CONSTITUTION_DIRECTORY_STANDARD.md](directory-standard/CONSTITUTION_DIRECTORY_STANDARD.md)  
**说明**: 仓库目录结构标准

**核心内容**:
- 允许的目录和文件
- 禁止的目录和文件
- 命名规范（文件 + 目录）
- 宪法规范升级流程
- 校验清单

---

### 10. 架构规范（L1-L5 框架）
**文件**: [architecture/L1_L5_FRAMEWORK.md](architecture/L1_L5_FRAMEWORK.md)  
**说明**: AI 时代的软件需求与资产标准化框架（V2.0）

**核心内容**:
- L1 领域层：业务边界（Bounded Context）
- L2 场景层：业务价值流（用户完整目标）
- L3 活动/页面层：L3-BE 业务活动 + L3-FE 页面/组件（前后端拆分）
- L4 功能点/模块层：最小可复用技术单元（后端功能点 + 前端 UI 模块）
- L5 测试点层：确定性验证锚点（双绑定：L4 功能契约 + L3 验收标准）
- L5 测试点套件：按 L3 聚合的结构化验收依据（替代扁平 AC 文档）
- 稳定性模型：L1 (极高) > L2 (高) > L5 (中高) > L3 (中) > L4 (低)
- 动态编排与双向映射机制（含 L5 测试生成与覆盖缺口检测）
- 与 OpenSpec 的映射关系（含 acceptance 阶段映射 L5）
- 功能点与测试点向量库（RAG 检索复用）

**使用场景**:
- 需求澄清阶段：识别 L1 领域 + L2 场景 + L3-BE/L3-FE 分类
- 需求理解阶段：拆解 L3 活动/页面 + 编排 L4 功能点 + 生成 L5 验收标准
- 需求解决阶段：复用/扩展/新增 L4 功能点 + 生成 L5 契约测试
- 需求验收阶段：基于 L5 测试点套件执行双源验证
- 需求交付阶段：反向治理（代码 → 功能点注册 → 测试覆盖缺口检测）

---

### 11. 文档引用规范（V3.18.0 新增）
**文件**: [audit/DOCUMENT_REFERENCE_RULES.md](audit/DOCUMENT_REFERENCE_RULES.md)  
**说明**: 智能体文档生成后必须被正确引用的铁律

**核心内容**:
- 铁律：禁止生成未被引用的智能体文档
- 有效引用定义（宪法索引/智能体配置/任务规约/代码引用/交叉引用）
- 验证机制（生成时验证 + 审计验证 + Git Hook）
- 违规处理（VIO-008 分级：A/B/C）
- 例外情况（临时报告/日志文件/任务文件/会议纪要）
- 审计检查清单（每 2 小时检查新增文档引用）

**违规代码**: VIO-008（未引用文档违规）

---

### 12. 文档引用规范实施报告（V3.18.0 新增）
**文件**: [audit/DOCUMENT_REFERENCE_RULES_IMPLEMENTATION.md](audit/DOCUMENT_REFERENCE_RULES_IMPLEMENTATION.md)  
**说明**: 文档引用规范的落地实施记录与验证结果

---

## 📋 配套文档

### 智能体配置（9 个）

| 智能体 | 文件路径 | 状态 |
|--------|---------|------|
| 需求澄清 | `agents/constitution/requirement-clarification/AGENTS.md` | ✅ V3.18.0 |
| 需求理解 | `agents/constitution/requirement-understanding/AGENTS.md` | ✅ V3.18.0 |
| 需求解决 | `agents/constitution/requirement-resolution/AGENTS.md` | ✅ V3.18.0 |
| 需求验收 | `agents/constitution/requirement-acceptance/AGENTS.md` | ✅ V3.18.0 |
| 需求交付 | `agents/constitution/requirement-delivery/AGENTS.md` | ✅ V3.18.0 |
| 审计 | `agents/constitution/audit/AGENTS.md` | ✅ V3.18.0 |
| 总结反思 | `agents/constitution/summary-reflection/AGENTS.md` | ✅ V3.18.0 |
| 调试专家 | `agents/constitution/debugger/AGENTS.md` | ✅ V3.18.0 |
| 红蓝推演 | `agents/constitution/red-team-simulation/AGENTS.md` | ✅ V3.18.0 |

### 调试专家配套规范

**文件**: [debugger/DEBUGGABILITY_CHECKLIST.md](debugger/DEBUGGABILITY_CHECKLIST.md)  
**说明**: 可调试性审查清单

**核心内容**:
- 代码可调试性检查项
- 日志记录规范
- 断点调试支持
- 错误追踪机制

### 红蓝推演配套规范

| 规范 | 文件 | 说明 |
|------|------|------|
| 红队方法 | [red-team-simulation/RED_TEAM_METHOD.md](red-team-simulation/RED_TEAM_METHOD.md) | 红队挑战方法论 |
| 蓝队方法 | [red-team-simulation/BLUE_TEAM_METHOD.md](red-team-simulation/BLUE_TEAM_METHOD.md) | 蓝队防御与加固方法 |
| 报告模板 | [red-team-simulation/REPORT_TEMPLATE.md](red-team-simulation/REPORT_TEMPLATE.md) | 推演报告标准模板 |

**注**: V3.16.0 移除进展跟进智能体，职责由银河导航员接管

### 多主 Agent 配置（V3.16.1 新增，部分计划中）

**混合模式**: Hub-Spoke + 多主 Agent

| 主 Agent | Label | 专长 | 运行时 | 状态 |
|----------|-------|------|--------|------|
| 银河导航员 🧭 | `navigator` | 复杂任务协调 | subagent | ✅ 已配置 |
| 代码专家 💻 | `code-expert` | 专业开发 | acp (Cursor) | 📋 计划中 |
| 数据分析师 📊 | `data-analyst` | 数据分析 | subagent | 📋 计划中 |
| 写作助手 ✍️ | `writing-assistant` | 内容创作 | subagent | 📋 计划中 |

**路由策略**: 显式 > LLM 语义 > 关键词 > 默认

**详见**: [agents/docs/multi-agent/HYBRID_MODE_CONFIG.md](../../../docs/multi-agent/HYBRID_MODE_CONFIG.md)

### 决策记录（30 项）

**存放位置**：见 [decision-recording/DECISION_RECORDING_RULES.md](decision-recording/DECISION_RECORDING_RULES.md) 第六节。全局决策索引：`agents/docs/decisions/DECISION_LOG.md`（DEC-001 至 DEC-030）

**主要决策**:
- DEC-001: 采用严格 SemVer
- DEC-007: Type-A/B/C 三级分类
- DEC-008: Type-A 冷静期 3 天
- DEC-016: 审计检查清单
- DEC-021: 补全历史备份
- DEC-027: 建立决策记录机制

### 交付校验清单

**文件**: [delivery/CONSTITUTION_DELIVERY_CHECKLIST.md](delivery/CONSTITUTION_DELIVERY_CHECKLIST.md)  
**说明**: 交付前校验规范

**核心内容**:
- 交付前文件同步
- 白名单校验
- 验收报告对比
- 校验报告生成

---

## 🔗 升级流程与本地结构

- **宪法规范升级流程**: [upgrade/ITERATION_PROCESS.md](upgrade/ITERATION_PROCESS.md)

- **本目录结构说明**: [TEAM_ROLES.md](../../../constitution/TEAM_ROLES.md)（智能体团队角色与目录结构）
- **版本备份与某次升级过程文档**: `agents/docs/versions/V{x.y.z}/constitution/upgrade-to-V{a.b.c}/`

---

## 📜 宪法核心原则

1. **规约驱动** - 所有变更先创建规范
2. **变更分类** - Type-A/B/C 三级分类
3. **冷静期机制** - 重大变更需冷静期
4. **审计监督** - 审计检查清单 + 一票否决
5. **版本备份** - 白名单机制 + 自动备份
6. **决策记录** - 所有决策必须记录
7. **交付校验** - 交付前文件同步 + 校验
8. **记忆沉淀** - 每个智能体必须有记忆文件，记录案例和经验

---

## 📈 变更日志

详见 [CHANGELOG.md](CHANGELOG.md)

**最新版本**: V3.18.0 (2026-04-05)

---

## 🎭 智能体团队（7 核心 + 2 辅助 = 9 个）

**银河导航员** 🧭 - 总协调员（Hub）

**核心智能体（7 个）**:
| 昵称 | 智能体目录 | 职责 |
|------|-----------|------|
| **迷糊粉碎机** 🎯 | `requirement-clarification/` | 意图识别 |
| **脑洞整理师** 💡 | `requirement-understanding/` | 产品设计、蓝图设计 |
| **功能魔法师** 🪄 | `requirement-resolution/` | 架构师、方案执行 |
| **挑刺小能手** 🔍 | `requirement-acceptance/` | QA、验收测试 |
| **最后一公里** 📦 | `requirement-delivery/` | 交付专家 |
| **规则守护者** 🛡️ | `audit/` | 合规监察、熔断仲裁 |
| **事后诸葛亮** 📝 | `summary-reflection/` | 复盘分析 |

**辅助智能体（2 个）**:
| 昵称 | 智能体目录 | 职责 | 触发方式 |
|------|-----------|------|---------|
| **Bug 猎人** 🔬 | `debugger/` | 可调试性审查 + 根因分析 | 需求理解/解决阶段触发 |
| **红蓝推演师** 🎭 | `red-team-simulation/` | 多视角分析 + 方案挑战 | 复杂度≥B 级自动触发 |

**详见**: [agents/constitution/TEAM_ROLES.md](../../../constitution/TEAM_ROLES.md)

---

## 🧠 智能体记忆规范（V3.18.0 新增）

### 强制要求

**每个智能体必须有记忆文件**:
- 每个智能体必须有 `memory/` 目录
- 记忆文件记录：典型案例、经验教训、方法总结
- 每次执行新类型任务后必须更新记忆
- 每月最后一个工作日审查记忆文件质量

### 记忆维护流程

**任务完成后智能体自问**:
1. 这个任务有新类型吗？ → 是 → 更新记忆
2. 遇到了新问题吗？ → 是 → 记录解决方案
3. 有新经验教训吗？ → 是 → 添加到记忆

**每月审查**（每月最后一个工作日）:
- 记忆文件是否最新？
- 案例是否有代表性？
- 经验是否可复用？

### 记忆文件清单

| 智能体 | 记忆文件 | 核心内容 |
|--------|----------|----------|
| 需求澄清 🎯 | clarification-cases.md | 典型澄清案例 + 澄清技巧 |
| 需求理解 💡 | openspec-cases.md | OpenSpec 制定案例 + L2-L4 映射 |
| 需求解决 🪄 | 2026-03-28.md | 任务执行记录 |
| 需求验收 🔍 | acceptance-cases.md | 验收案例 + 验收方法 |
| 需求交付 📦 | delivery-cases.md | 交付归档案例 + L1-L5 复用指南 |
| 智能审计 🛡️ | audit-cases.md | 审计案例 + 熔断事件记录 |
| 总结反思 📝 | HUB-SPOKE-PATTERN.md | Hub-Spoke 协同模式讨论 |
| 调试专家 🔬 | debugging-cases.md | 5Why 根因分析案例 |
| 红蓝推演 🎭 | red-team-cases.md | 红蓝推演案例 + 框架 |

---

**规范版本**: V3.18.0  
**生效日期**: 2026-04-05  
**下次审查**: 2026-05-05  
**变更类型**: Type-B（新增第 9 大智能体：红蓝推演 + 智能体记忆规范）
