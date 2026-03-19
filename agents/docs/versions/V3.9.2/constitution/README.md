# 宪法规范目录说明

本目录为宪法规范及配套规则、升级流程的存放位置。采用**方案 A**：根目录仅保留当前宪法唯一入口与变更日志，其余按主题分子目录。

---

## 📌 入口

| 文档 | 说明 |
|------|------|
| [CONSTITUTION.md](CONSTITUTION.md) | **当前宪法唯一入口**（模块化索引，V3.9.0） |
| [CHANGELOG.md](CHANGELOG.md) | 变更历史 |
| [upgrade/ITERATION_PROCESS.md](upgrade/ITERATION_PROCESS.md) | 宪法规范升级流程（迭代流程） |

---

## 📁 子目录

| 子目录 | 内容 |
|--------|------|
| **upgrade/** | 升级流程与模板（ITERATION_PROCESS 等） |
| **change-classification/** | 变更分类规范 |
| **cooling-off/** | 冷静期规则 |
| **audit/** | 审计检查清单 |
| **backup/** | 备份白名单、版本备份与回滚 |
| **delivery/** | 交付校验清单 |
| **directory-standard/** | 目录结构标准 |
| **decision-recording/** | 决策记录规范 |
| **architecture/** | 架构/扩展规范（如需求级并行） |

---

## 📂 版本备份与过程文档

- **版本快照**: `agents/docs/versions/V{x.y.z}/constitution/`（先版本目录，再 constitution；同版本下另有 agents/、skills/）
- **某次升级过程文档**（提案、讨论、决策、交付）: `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/`

例如：从 V3.7.3 升级到 V3.7.4 的 proposal、design、delivery-report 等位于  
`agents/docs/versions/V3.7.3/constitution/upgrade-to-V3.7.4/`。

---

**目录方案**: 方案 A（2026-03-14）
