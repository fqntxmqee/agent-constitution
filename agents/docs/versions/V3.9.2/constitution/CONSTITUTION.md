# 智能体协同系统宪法规范（当前生效）

**版本号**: V3.9.0  
**生效日期**: 2026-03-12  
**状态**: ✅ 已生效  
**说明**: 本文件为宪法唯一入口，采用模块化设计，具体规范见各子目录。

---

## 📜 宪法概述

当前宪法采用**模块化设计**，由以下核心规范文档组成（均位于本目录子目录下）：

---

## 📚 核心规范文档（7 个）

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

**飞书链接**: （待创建）

---

### 7. 目录结构标准
**文件**: [directory-standard/CONSTITUTION_DIRECTORY_STANDARD.md](directory-standard/CONSTITUTION_DIRECTORY_STANDARD.md)  
**说明**: 仓库目录结构标准

**核心内容**:
- 允许的目录和文件
- 禁止的目录和文件
- 命名规范（文件 + 目录）
- 宪法规范升级流程
- 校验清单

**飞书链接**: （待创建）

---

## 📋 配套文档

### 智能体配置（8 个）

| 智能体 | 文件路径 | 状态 |
|--------|---------|------|
| 需求澄清 | `agents/constitution/requirement-clarification/AGENTS.md` | ✅ V3.9.0 |
| 需求理解 | `agents/constitution/requirement-understanding/AGENTS.md` | ✅ V3.9.0 |
| 需求解决 | `agents/constitution/requirement-resolution/AGENTS.md` | ✅ V3.9.0 |
| 需求验收 | `agents/constitution/requirement-acceptance/AGENTS.md` | ✅ V3.9.0 |
| 需求交付 | `agents/constitution/requirement-delivery/AGENTS.md` | ✅ V3.9.0 |
| 进展跟进 | `agents/constitution/progress-tracking/AGENTS.md` | ✅ V3.9.0 |
| 审计 | `agents/constitution/audit/AGENTS.md` | ✅ V3.9.0 |
| 总结反思 | `agents/constitution/summary-reflection/AGENTS.md` | ✅ V3.9.0 |

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
- **需求级并行架构**: [architecture/CONSTITUTION_V3.7_PARALLEL.md](architecture/CONSTITUTION_V3.7_PARALLEL.md)
- **本目录结构说明**: [README.md](README.md)
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

**最新版本**: V3.9.0 (2026-03-12)

---

**规范版本**: V3.9.0  
**创建日期**: 2026-03-12  
**下次审查**: 2026-04-12
