# 技术方案设计 - 宪法 V3.7.4 升级

**文档版本**: v1.0  
**创建日期**: 2026-03-12  
**关联需求**: specs/requirements.md  
**状态**: 已批准

---

## 1. 架构设计

### 1.1 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    宪法 V3.7.4 升级架构                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   需求理解阶段    │────▶│   需求解决阶段    │────▶│   需求验收阶段    │
│  (生成 OpenSpec)  │     │  (执行升级)       │     │  (独立验证)      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ - proposal.md    │     │ - 宪法升级       │     │ - AC 逐项验收    │
│ - requirements.md│     │ - 内容归档       │     │ - Git 审查       │
│ - design.md      │     │ - 技能清理       │     │ - 文档验证       │
│ - tasks.md       │     │ - 留档生成       │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │   需求交付阶段    │
                                               │  (Git 推送)       │
                                               └──────────────────┘
```

### 1.2 目录结构

```
openclaw-workspace/
├── agents/
│   ├── constitution/
│   │   ├── audit/
│   │   │   └── tools/              # 审计工具（保留）
│   │   └── ...                     # 其他智能体
│   ├── docs/
│   │   └── specs/
│   │       ├── CONSTITUTION_V3.7.md         # 升级为 V3.7.4
│   │       └── REPOSITORY_GOVERNANCE.md     # 新增
│   └── skills/
├── skills/                         # 技能目录（清理冲突）
├── openspec/
│   └── changes/
│       ├── constitution-v3.7.3/    # 保留
│       └── constitution-v3.7.4/    # 新增留档目录
│           ├── proposal.md
│           ├── user-confirmations.md
│           ├── specs/requirements.md
│           ├── design.md
│           ├── tasks.md
│           ├── acceptance-report.md
│           └── delivery-report.md
├── .archive/
│   └── projects/
│       └── 20260312/               # 归档内容
│           ├── fitbot/
│           ├── fitbot-pro/
│           └── ...
└── TOOLS.md                        # 更新
```

---

## 2. 技术方案

### 2.1 宪法规范升级

#### 2.1.1 第七章结构

```markdown
## 第七章 仓库治理规范

### 1. 仓库内容边界
- 应该包含的内容
- 禁止内容

### 2. 归档机制
- 触发条件
- 归档流程
- 归档位置

### 3. 定期审查机制
- 审查频率
- 审查内容
- 审查产出

### 4. Git 提交规范
- 提交格式
- 禁止提交
```

#### 2.1.2 版本更新

| 位置 | 原值 | 新值 |
|------|------|------|
| 版本号 | V3.7 | V3.7.4 |
| 生效日期 | 2026-03-09 | 2026-03-12 |
| 升级记录 | - | 新增 V3.7.4 升级记录 |

### 2.2 仓库内容归档

#### 2.2.1 归档清单

| 项目 | 原路径 | 归档路径 | 大小 |
|------|--------|----------|------|
| fitbot | agents/fitbot/ | .archive/projects/20260312/fitbot/ | 168K |
| fitbot-pro | openspec/changes/fitbot-pro/ | .archive/projects/20260312/fitbot-pro/ | 92K |
| agent-monitor-dashboard | openspec/changes/agent-monitor-dashboard/ | .archive/projects/20260312/ | 4.1M |
| ai-content-generator | openspec/changes/ai-content-generator/ | .archive/projects/20260312/ | 108K |
| all-skills-delivery | openspec/changes/all-skills-delivery/ | .archive/projects/20260312/ | 212K |
| p0-skills-development | openspec/changes/p0-skills-development/ | .archive/projects/20260312/ | 100K |
| xiaohongshu-backend | openspec/changes/xiaohongshu-content-platform-backend-spring/ | .archive/projects/20260312/ | 3.3M |
| xiaohongshu-frontend | openspec/changes/xiaohongshu-content-platform-frontend/ | .archive/projects/20260312/ | 356M |

**总计**: ~364MB

#### 2.2.2 归档流程

```bash
# 1. 创建归档目录
mkdir -p .archive/projects/20260312/

# 2. 移动内容
mv agents/fitbot/ .archive/projects/20260312/
mv openspec/changes/fitbot-pro/ .archive/projects/20260312/
# ... 其他项目

# 3. Git 操作
git add .archive/
git rm -r agents/fitbot/
git rm -r openspec/changes/fitbot-pro/
# ... 其他删除
```

### 2.3 技能 ID 冲突清理

#### 2.3.1 冲突目录清单

| 短名称目录 | 对应长名称目录 | 状态 |
|-----------|---------------|------|
| skill-2 | - | 删除 |
| skill-11 | skill-11-content-generator | 删除 |
| skill-12 | skill-12-code-reviewer | 删除 |
| skill-14 | skill-14-test-generator | 删除 |
| skill-15 | skill-15-doc-generator | 删除 |
| skill-17 | - | 删除 |
| skill-19 | - | 删除 |
| skill-20 | - | 删除 |
| skill-21 | - | 删除 |
| skill-22 | - | 删除 |
| skill-23 | - | 删除 |
| skill-24 | - | 删除 |
| skill-26 | - | 删除 |
| skill-27 | - | 删除 |
| skill-28 | - | 删除 |
| skill-29 | - | 删除 |
| skill-30 | - | 删除 |

#### 2.3.2 清理流程

```bash
# 删除短名称目录
rm -rf skills/skill-2/
rm -rf skills/skill-11/
# ... 其他目录

# Git 操作
git rm -r skills/skill-2/
git rm -r skills/skill-11/
# ... 其他删除

# 更新注册表
# 编辑 skills/skills_manifest.json
# version: "1.0" → "1.1"
# totalSkills: 16 → 24
```

### 2.4 留档文件生成

#### 2.4.1 文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| proposal.md | 升级提案 | ✅ 已生成 |
| user-confirmations.md | 用户确认记录 | ✅ 已生成 |
| specs/requirements.md | 需求规格 | ✅ 已生成 |
| design.md | 技术方案（本文件） | 🟡 生成中 |
| tasks.md | 任务清单 | ⏳ 待生成 |
| acceptance-report.md | 验收报告 | ⏳ 待生成 |
| delivery-report.md | 交付报告 | ⏳ 待生成 |

---

## 3. Git 提交策略

### 3.1 Commit 1: 宪法规范升级

```bash
git add agents/docs/specs/constitution/CONSTITUTION_V3.7.md
git add agents/docs/specs/process/REPOSITORY_GOVERNANCE.md
git add openspec/changes/constitution-v3.7.4/
git commit -m "feat: 宪法规范升级至 V3.7.4（新增第七章仓库治理规范）"
```

### 3.2 Commit 2: 仓库内容归档

```bash
git add .archive/
git add .gitignore
git rm -r agents/fitbot/
git rm -r openspec/changes/fitbot-pro/
git rm -r openspec/changes/xiaohongshu-content-platform-backend-spring/
git rm -r openspec/changes/xiaohongshu-content-platform-frontend/
git rm -r openspec/changes/agent-monitor-dashboard/
git rm -r openspec/changes/ai-content-generator/
git rm -r openspec/changes/p0-skills-development/
git rm -r openspec/changes/all-skills-delivery/
git commit -m "chore: 归档项目特定内容（~364MB）"
```

### 3.3 Commit 3: 技能 ID 冲突清理

```bash
git rm -r skills/skill-2/
git rm -r skills/skill-11/
git rm -r skills/skill-12/
git rm -r skills/skill-14/
git rm -r skills/skill-15/
git rm -r skills/skill-17/
git rm -r skills/skill-19/
git rm -r skills/skill-20/
git rm -r skills/skill-21/
git rm -r skills/skill-22/
git rm -r skills/skill-23/
git rm -r skills/skill-24/
git rm -r skills/skill-26/
git rm -r skills/skill-27/
git rm -r skills/skill-28/
git rm -r skills/skill-29/
git rm -r skills/skill-30/
git add skills/skills_manifest.json
git commit -m "fix: 清理技能 ID 冲突目录（17 个短名称重复目录）"
```

---

## 4. 风险缓解

### 4.1 归档内容不完整

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 文件遗漏 | 项目文件丢失 | 归档前生成完整清单并确认 |

### 4.2 Git 提交混乱

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 提交顺序错误 | 历史难以追溯 | 严格按照 1→2→3 顺序提交 |

### 4.3 归档后无法恢复

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 需要时找不到 | 无法恢复项目 | 归档日志详细记录路径 |

---

## 5. 验收检查点

### 5.1 阶段验收

| 阶段 | 检查点 | 验收方式 |
|------|--------|----------|
| 宪法升级 | 第七章完整 | 文档审查 |
| 内容归档 | 8 个项目已归档 | 目录检查 |
| 技能清理 | 17 个目录已删除 | 目录检查 |
| 留档生成 | 8 个文件完整 | 文件清单 |
| Git 提交 | 3 个 commit | git log |

---

**文档状态**: ✅ 已批准  
**批准日期**: 2026-03-12 08:42 GMT+8  
**批准人**: 伏开 (Fukai)
