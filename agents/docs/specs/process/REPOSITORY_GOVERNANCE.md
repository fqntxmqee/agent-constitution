# 仓库治理规范 (V1.0)

**版本号**: 1.0  
**创建日期**: 2026-03-12  
**状态**: ✅ 已生效  
**依据**: 宪法规范 V3.7.4 第七章

---

## 📋 概述

本规范定义 `agent-constitution` 仓库的内容边界、清理机制和归档流程，确保仓库专注于宪法规范本身，避免项目特定内容污染。

---

## 🎯 仓库定位

### ✅ 应该包含的内容

| 类别 | 说明 | 示例路径 |
|------|------|----------|
| **宪法规范文档** | 宪法主规范、智能体配置、架构文档 | `agents/docs/specs/`, `agents/constitution/` |
| **技能规范** | 技能模板、SKILL.md、测试脚本 | `agents/skills/`, `skills/` |
| **通用工具** | 审计脚本、任务追踪器、自动化脚本 | `scripts/` |
| **配置模板** | 智能体配置模板、OpenClaw 配置示例 | `agents/constitution/*/AGENTS.md` |
| **文档** | 架构说明、工作流程、使用指南 | `agents/docs/` |

### ❌ 不应该包含的内容

| 类别 | 说明 | 处理方式 |
|------|------|----------|
| **项目应用代码** | 具体项目的源代码、实现 | 移至独立项目仓库 |
| **项目规约** | 特定项目的 OpenSpec 规约 | 归档或移至项目仓库 |
| **大型资源文件** | 前端构建产物、node_modules | 加入 `.gitignore` |
| **临时文件** | 日志、缓存、备份 | 加入 `.gitignore` |
| **用户个人配置** | 包含敏感信息的配置文件 | 使用 `.env.example` 模板 |

---

## 🗂️ 目录结构规范

### 标准结构

```
agent-constitution/
├── agents/
│   ├── constitution/          # ✅ 8 个宪法智能体配置
│   │   ├── requirement-clarification/
│   │   ├── requirement-understanding/
│   │   ├── requirement-resolution/
│   │   ├── requirement-acceptance/
│   │   ├── requirement-delivery/
│   │   ├── progress-tracking/
│   │   ├── audit/
│   │   │   └── tools/         # ✅ 智能体工具
│   │   └── summary-reflection/
│   ├── docs/                  # ✅ 宪法文档
│   │   ├── specs/             # 规范文档
│   │   ├── architecture/      # 架构文档
│   │   └── guides/            # 使用指南
│   └── skills/                # ✅ 技能规范
│       ├── skill-01-intent-classifier/
│       └── ...
├── skills/                    # ✅ OpenClaw 技能（根目录）
│   ├── skill-01-intent-classifier/
│   └── ...
├── scripts/                   # ✅ 通用脚本
│   ├── auto-audit.js
│   └── task-tracker.js
├── docs/                      # ✅ 通用文档
├── openspec/
│   └── changes/               # ⚠️ 仅保留宪法相关规约
│       └── constitution-v3.7.4/  # 宪法版本规约
├── .archive/                  # ⚠️ 归档内容（本地保留）
│   └── projects/
├── .gitignore                 # ✅ 忽略规则
├── AGENTS.md                  # ✅ 工作区配置
├── CONSTITUTION_V3.7.md       # ✅ 宪法主规范
└── README.md                  # ✅ 项目说明
```

### 禁止的目录

```
agent-constitution/
├── agents/fitbot/             # ❌ 项目应用代码
├── openspec/changes/fitbot-pro/  # ❌ 项目规约
├── openspec/changes/xiaohongshu-*/  # ❌ 项目规约
├── openspec/changes/agent-monitor-dashboard/  # ❌ 项目规约
└── node_modules/              # ❌ 依赖
```

---

## 🔄 清理机制

### 定期审查（每版本）

**责任人**: 主会话  
**频率**: 每次宪法版本升级前  
**检查项**:

```bash
# 1. 检查 agents/ 目录下是否有非 constitution 内容
find agents/ -maxdepth 2 -type d | grep -v "constitution\|docs\|skills"

# 2. 检查 openspec/changes/ 目录下是否有非宪法相关规约
ls openspec/changes/ | grep -v "constitution"

# 3. 检查大文件（>10MB）
find . -type f -size +10M | grep -v ".git"

# 4. 检查 node_modules 或构建产物
find . -name "node_modules" -o -name "dist" -o -name "build" | grep -v ".git"
```

### 清理流程

```
1. 生成《仓库治理报告》
   ↓
2. 列出所有违规内容（路径 + 大小 + 建议处理）
   ↓
3. 用户确认清理方案
   ↓
4. 执行清理（移动/删除/归档）
   ↓
5. 更新 .gitignore（防止再次污染）
   ↓
6. Git 提交（conventional commits）
   ↓
7. 更新本规范（如有新发现）
```

---

## 📦 归档策略

### 归档位置

| 内容类型 | 归档位置 | 说明 |
|----------|----------|------|
| 项目应用代码 | 独立项目仓库 | 如 `fitbot-agent`, `xiaohongshu-platform` |
| 项目规约 | 项目仓库 `openspec/` 或本地归档 | 保留规约历史 |
| 大型资源 | Git LFS 或外部存储 | 避免仓库膨胀 |

### 归档流程

```bash
# 1. 创建归档目录（本地，不提交）
mkdir -p .archive/projects/YYYYMMDD

# 2. 移动内容
mv openspec/changes/fitbot-pro .archive/projects/
mv agents/fitbot .archive/projects/

# 3. 记录归档日志
echo "YYYY-MM-DD: Archived fitbot-pro to .archive/projects/" >> .archive/ARCHIVE_LOG.md

# 4. Git 操作
git add -A
git commit -m "chore: archive project-specific content (fitbot-pro)"
```

---

## 🛡️ 预防机制

### .gitignore 更新

```gitignore
# 项目特定内容
openspec/changes/fitbot-*/
openspec/changes/xiaohongshu-*/
openspec/changes/agent-monitor-dashboard/
openspec/changes/ai-content-generator/
openspec/changes/p0-skills-development/
openspec/changes/all-skills-delivery/

# 应用代码（非宪法智能体）
agents/fitbot/
agents/*/src/
agents/*/dist/

# 依赖和构建产物
node_modules/
dist/
build/
*.log

# 临时文件
.archive/
.backup/
*.tmp
```

---

## 📊 治理指标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| 仓库大小 | <100MB | TBD | ⏳ |
| 项目特定内容 | 0 | TBD | ⏳ |
| 大文件数量 | 0 | TBD | ⏳ |
| .gitignore 覆盖率 | 100% | TBD | ⏳ |

---

## 📝 违规处理

### 发现违规内容

1. 生成《仓库治理违规报告》
2. 建议处理方案（归档/删除/移动）
3. 用户确认后执行

### 违规等级

| 等级 | 说明 | 处理时限 |
|------|------|----------|
| 🔴 严重 | 大型项目代码（>10MB） | 立即处理 |
| 🟡 警告 | 项目规约文档 | 24 小时内 |
| ℹ️ 提示 | 临时文件、日志 | 下次提交前 |

---

## 🔗 参考文档

- 宪法规范 V3.7.4: `agents/docs/specs/constitution/CONSTITUTION.md`
- 归档日志：`.archive/ARCHIVE_LOG.md`

---

**版本历史**:
- V1.0 (2026-03-12): 初始版本，定义仓库边界和清理机制

**下次审查**: 2026-03-19
