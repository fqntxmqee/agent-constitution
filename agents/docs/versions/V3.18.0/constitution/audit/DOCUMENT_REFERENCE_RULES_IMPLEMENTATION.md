# 文档引用规范 - 实施报告

**实施日期**: 2026-04-04  
**宪法版本**: V3.17.0  
**变更类型**: Type-C（Patch 变更，立即生效）

---

## 📋 实施摘要

根据用户要求，新增宪法铁律：
> **生成智能体相关文档、规范和配置后，必须被正确引用，否则禁止生成。**

---

## ✅ 已完成的工作

### 1. 创建规范文档

**文件**: `agents/docs/specs/constitution/audit/DOCUMENT_REFERENCE_RULES.md`

**核心内容**:
- 铁律定义和触发场景
- 有效引用 vs 无效引用定义
- 验证机制（生成时 + 审计 + Git Hook）
- 违规处理流程（VIO-008 A/B/C 分级）
- 例外情况清单
- 审计检查清单

---

### 2. 更新宪法索引

**文件**: `agents/docs/specs/constitution/CONSTITUTION.md`

**变更**:
- 新增第 11 项核心规范索引
- 违规代码：VIO-008
- 飞书链接：待创建

---

### 3. 更新审计智能体配置

**文件**: `agents/constitution/audit/AGENTS.md`

**变更**:
- 铁律从 3 条扩展到 4 条
- 新增：`必须检查新增文档引用（VIO-008）`

---

### 4. 更新审计检查清单

**文件**: `agents/docs/specs/constitution/audit/AUDIT_CHECKLIST.md`

**新增章节**:
- 第四节：文档引用检查
  - A. 新增文档扫描
  - B. 引用验证（CONSTITUTION.md / AGENTS.md / 任务文件）
  - C. 违规处理流程
  - D. 例外情况确认
- 更新一票否决权（增加 VIO-008 高危违规）
- 章节编号调整（五→六→七）

---

### 5. 创建 Git Hook 脚本

**文件**: `.git/hooks/pre-commit.d/01-document-reference-check`

**功能**:
- 提交时自动检查新增/修改的规范文档
- 验证是否被 CONSTITUTION.md / AGENTS.md / 任务文件引用
- 未引用时阻止提交并给出修复建议
- 跳过例外情况（临时报告/日志/任务文件/会议纪要）

**使用方法**:
```bash
# 确保脚本可执行
chmod +x .git/hooks/pre-commit.d/01-document-reference-check

# 提交时自动执行
git commit -m "feat: 新增 xxx 规范"
```

---

## 📊 验证机制总览

```
┌─────────────────────────────────────────────────────────────┐
│                    文档引用验证流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 生成时验证（预防）                                       │
│     • 智能体生成文档前确认使用场景                           │
│     • 确认有下游智能体/任务会引用                            │
│     • 确认已规划引用位置                                     │
│                                                             │
│  2. Git Hook 验证（提交时）                                  │
│     • pre-commit 检查新增文档                                │
│     • 验证 CONSTITUTION.md / AGENTS.md / 任务文件引用        │
│     • 未引用 → 阻止提交                                      │
│                                                             │
│  3. 审计验证（事后检查）                                     │
│     • 每 2 小时扫描新增文档                                  │
│     • 发现 VIO-008 违规 → 记录并通知                         │
│     • 24 小时后验证处理结果                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 VIO-008 违规代码定义

| 级别 | 代码 | 说明 | 处理 |
|------|------|------|------|
| 🔴 高危 | VIO-008-A | 生成规范文档但无引用 | 立即清理或补充引用（24 小时） |
| 🟡 中危 | VIO-008-B | 引用位置不当（如草稿目录） | 修正引用位置（48 小时） |
| 🟢 低危 | VIO-008-C | 引用格式不规范 | 修正引用格式（72 小时） |

---

## 📁 例外情况（无需引用）

以下文档类型不需要引用：

| 类型 | 路径模式 | 说明 |
|------|---------|------|
| 临时报告 | `*/reports/*.md` | 审计报告、验收报告等 |
| 日志文件 | `*/logs/*.{log,jsonl}` | 运行日志、熔断日志 |
| 任务文件 | `.tasks/**/*.md` | 临时任务记录 |
| 会议纪要 | `*meeting*/*.md` | 会议记录 |

---

## 🧪 测试验证

### 测试场景 1：生成规范文档但未引用

```bash
# 创建测试文档
echo "# 测试规范" > agents/constitution/test/TEST.md

# 尝试提交
git add agents/constitution/test/TEST.md
git commit -m "test: 新增测试规范"

# 预期结果：
# ❌ 发现 1 个未引用文档:
#   - agents/constitution/test/TEST.md
# ⚠️ 提交被阻止
```

### 测试场景 2：生成规范文档并正确引用

```bash
# 创建测试文档
echo "# 测试规范" > agents/constitution/test/TEST.md

# 更新 CONSTITUTION.md 添加引用
# ### 12. 测试规范
# **文件**: [test/TEST.md](test/TEST.md)

git add agents/constitution/test/TEST.md agents/docs/specs/constitution/CONSTITUTION.md
git commit -m "feat: 新增测试规范"

# 预期结果：
# ✅ 所有文档引用检查通过
```

---

## 📋 审计检查命令

```bash
# 手动扫描过去 24 小时新增文档
find agents/constitution -name "*.md" -mtime -1

# 检查是否被 CONSTITUTION.md 引用
grep -r "新增文档名" agents/docs/specs/constitution/CONSTITUTION.md

# 检查是否被智能体 AGENTS.md 引用
grep -r "新增文档名" agents/constitution/*/AGENTS.md

# 检查是否被任务文件引用
grep -r "新增文档路径" .tasks/
```

---

## 📈 后续工作

### 立即执行
- [x] 创建规范文档
- [x] 更新宪法索引
- [x] 更新审计配置
- [x] 创建 Git Hook
- [ ] 启用 Git Hook（chmod +x）
- [ ] 测试验证

### 24 小时内
- [ ] 扫描现有文档，清理无引用文档
- [ ] 生成首次审计报告

### 长期维护
- [ ] 每 2 小时自动审计
- [ ] 定期审查例外情况清单
- [ ] 根据实际使用优化规则

---

## 📚 参考文档

- `DOCUMENT_REFERENCE_RULES.md` - 完整规范文档
- `CONSTITUTION.md` - 宪法规范索引（第 11 项）
- `AUDIT_CHECKLIST.md` - 审计检查清单（第四节）
- `audit/AGENTS.md` - 审计智能体配置（铁律第 4 条）

---

**实施状态**: ✅ 已完成  
**生效时间**: 立即生效  
**下次审查**: 2026-05-04
