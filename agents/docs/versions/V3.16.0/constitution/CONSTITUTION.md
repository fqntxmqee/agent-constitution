# 智能体协同系统宪法规范（当前生效）

**版本号**: V3.16.0
**生效日期**: 2026-03-26
**状态**: ✅ 已生效（用户授权跳过冷静期）
**说明**: 本文件为**宪法规范索引**（唯一权威来源），采用模块化设计，各子规范为执行依据。智能体实际执行时读取 `agents/constitution/<agent>/AGENTS.md`。

---

## 📜 宪法概述

当前宪法采用**模块化设计**，由以下核心规范文档组成（均位于本目录子目录下）：

---

## 📚 核心规范文档（8 个）

### 1. 变更分类规范
**文件**: [change-classification/CONSTITUTION_CHANGE_CLASSIFICATION.md](change-classification/CONSTITUTION_CHANGE_CLASSIFICATION.md)  
**说明**: Type-A/B/C 三级变更分类机制

**核心内容**:
- Type-A: Major 变更（3 天冷静期）
- Type-B: Minor 变更（24 小时冷静期）
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

### 10. 架构规范（L1-L4 框架）
**文件**: [architecture/L1_L4_FRAMEWORK.md](architecture/L1_L4_FRAMEWORK.md)  
**说明**: AI 时代的软件需求与资产标准化框架

**核心内容**:
- L1 领域层：业务边界（Bounded Context）
- L2 场景层：业务价值流（用户完整目标）
- L3 业务活动层：行为原子（输入输出状态变更）
- L4 功能点层：服务能力（跨领域复用的最小技术单元）
- 动态编排与双向映射机制
- 与 OpenSpec 的映射关系
- 功能点向量库（RAG 检索复用）

**使用场景**:
- 需求澄清阶段：识别 L1 领域 + L2 场景
- 需求理解阶段：拆解 L3 业务活动 + 编排 L4 功能点
- 需求解决阶段：复用/扩展/新增 L4 功能点
- 需求交付阶段：反向治理（代码 → 功能点注册）

**飞书链接**: 待创建

---

## 📋 配套文档

### 智能体配置（8 个）

| 智能体 | 文件路径 | 状态 |
|--------|---------|------|
| 需求澄清 | `agents/constitution/requirement-clarification/AGENTS.md` | ✅ V3.16.0 |
| 需求理解 | `agents/constitution/requirement-understanding/AGENTS.md` | ✅ V3.16.0 |
| 需求解决 | `agents/constitution/requirement-resolution/AGENTS.md` | ✅ V3.16.0 |
| 需求验收 | `agents/constitution/requirement-acceptance/AGENTS.md` | ✅ V3.16.0 |
| 需求交付 | `agents/constitution/requirement-delivery/AGENTS.md` | ✅ V3.16.0 |
| 审计 | `agents/constitution/audit/AGENTS.md` | ✅ V3.16.0 |
| 总结反思 | `agents/constitution/summary-reflection/AGENTS.md` | ✅ V3.16.0 |
| 调试专家 | `agents/constitution/debugger/AGENTS.md` | ✅ V3.16.0 |

**注**: V3.16.0 移除进展跟进智能体，职责由银河导航员接管

### 多主 Agent 配置（V3.16.1 新增）

**混合模式**: Hub-Spoke + 多主 Agent

| 主 Agent | Label | 专长 | 运行时 |
|----------|-------|------|--------|
| 银河导航员 🧭 | `navigator` | 复杂任务协调 | subagent |
| 代码专家 💻 | `code-expert` | 专业开发 | acp (Cursor) |
| 数据分析师 📊 | `data-analyst` | 数据分析 | subagent |
| 写作助手 ✍️ | `writing-assistant` | 内容创作 | subagent |

**路由策略**: 显式 > LLM 语义 > 关键词 > 默认

**详见**: [agents/docs/multi-agent/HYBRID_MODE_CONFIG.md](../../../docs/multi-agent/HYBRID_MODE_CONFIG.md)

### L1-L4 框架使用指南

**需求澄清阶段**：
- 识别 L1 领域 + L2 场景
- 产出：《已确认提案》（含 L1/L2 定位）

**需求理解阶段**：
- 拆解 L3 业务活动
- 编排 L4 功能点
- 产出：L2→L3 映射表 + L3→L4 映射表

**需求解决阶段**：
- 复用/扩展/新增 L4 功能点
- 按编排 DSL 生成代码

**需求交付阶段**：
- 反向治理（代码扫描 → 功能点注册）
- 更新功能点向量库

**详见**: [architecture/L1_L4_FRAMEWORK.md](architecture/L1_L4_FRAMEWORK.md)

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

---

## 📈 变更日志

详见 [CHANGELOG.md](CHANGELOG.md)

**最新版本**: V3.16.0 (2026-03-26)

---

**规范版本**: V3.16.0  
**生效日期**: 2026-03-26  
**下次审查**: 2026-04-26
