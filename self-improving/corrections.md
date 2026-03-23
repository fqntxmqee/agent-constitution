# Corrections - 待 Promote 的 Lessons

---

## 2026-03-23: 宪法升级遗漏智能体版本号

### 问题描述

V3.13.0 宪法规范升级时，只更新了 3 个核心文件（AGENTS.md, CONSTITUTION.md, CHANGELOG.md）和 1 个智能体（requirement-resolution），遗漏了其他 8 个智能体的版本号更新。

### 根因分析

| 环节 | 应该做什么 | 实际做了什么 |
|------|-----------|-------------|
| 提案生成 | 全局 grep 列出所有受影响文件 | 只列了 3 个核心文件 |
| 审计验证 | 检查所有智能体版本号 | 只抽查了 CONSTITUTION.md 和 AGENTS.md |
| 执行修改 | 全局 grep 确认无遗漏 | 改了几个就提交了 |

### 改进措施（已落实）

1. **ITERATION_PROCESS.md** — 新增「影响文件清单」强制步骤
   - 生成提案前必须执行 `grep -r "旧版本号" agents/constitution/*/AGENTS.md`
   - 输出完整清单到 FILE_CHANGES.md

2. **AUDIT_CHECKLIST.md** — 新增「版本号统一性检查」
   - 所有智能体 AGENTS.md 版本号一致
   - 执行 grep 确认无遗漏
   - 智能体数量 = 9 个（当前总数）

3. **.githooks/pre-commit-version-check** — 新增 pre-commit hook
   - 自动检查所有智能体版本号
   - 不统一时阻止提交

### 待确认的持久规则

| 规则 | 说明 | 来源 |
|------|------|------|
| 宪法升级必须全局 grep 检查所有智能体版本号 | 不能只改核心文件 | corrections |
| 审计检查必须验证智能体版本号统一性 | 抽查改为全量检查 | corrections |
| Git 提交前必须通过 pre-commit version hook | 自动化拦截 | corrections |

### 确认项

- [ ] 确认以上规则 promote 到 self-improving/memory.md
- [ ] 确认分类为 "constitution" domain

---

**创建日期**: 2026-03-23  
**状态**: 待用户确认
