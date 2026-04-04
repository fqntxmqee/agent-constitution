# 文档引用规范 (Document Reference Rules)

**规范版本**: V3.17.0  
**创建日期**: 2026-04-04  
**生效日期**: 立即生效  
**状态**: ✅ 已生效  
**类型**: Type-C 变更（Patch 变更，无冷静期）

---

## 一、铁律（必须遵守）

### 📌 铁律：禁止生成未被引用的智能体文档

**规则**: 所有智能体相关文档、规范和配置生成后，**必须被正确引用**，否则禁止生成。

**触发场景**:
- 生成智能体 AGENTS.md 配置文件
- 生成宪法规范文档（CONSTITUTION.md 子规范）
- 生成技能规范（SKILL.md）
- 生成任务规约（OpenSpec 规约）
- 生成验收标准、交付清单等

**违规处理**: 审计智能体发现后标记为 `VIO-008` 违规，要求立即清理或补充引用。

---

## 二、引用定义

### 2.1 有效引用

| 引用类型 | 说明 | 示例 |
|---------|------|------|
| **宪法索引引用** | CONSTITUTION.md 收录新规范 | `### 9. 文档引用规范` + 文件链接 |
| **智能体配置引用** | 智能体 AGENTS.md 引用新规范 | `参考文档：xxx.md` |
| **任务规约引用** | 任务文件引用规约路径 | `规约路径：project/xxx/changes/yyy/` |
| **代码引用** | 代码中引用配置文件路径 | `import config from 'xxx.json'` |
| **文档交叉引用** | 其他文档链接到本文档 | `[文档引用规范](xxx.md)` |

### 2.2 无效引用（不算引用）

| 类型 | 说明 | 示例 |
|------|------|------|
| 临时提及 | 对话中提到但未正式收录 | "我打算创建 xxx 文档" |
| 草稿引用 | 草稿文件中的引用 | `draft/xxx.md` |
| 已删除引用 | 引用方已被删除 | 引用的文档已删除 |
| 循环引用 | A 引用 B，B 引用 A，无实际使用 | 自引用闭环 |

---

## 三、验证机制

### 3.1 生成时验证（预防）

**智能体生成文档前必须确认**:

```markdown
## 生成前检查清单

- [ ] 确认文档有明确的使用场景
- [ ] 确认有下游智能体/任务会引用
- [ ] 确认已规划引用位置（CONSTITUTION.md/AGENTS.md/任务文件）
- [ ] 确认不是重复文档（检查现有规范）
```

### 3.2 审计验证（事后检查）

**审计智能体每 2 小时检查**:

```bash
# 1. 扫描新增文档（过去 24 小时）
find agents/constitution -name "*.md" -mtime -1

# 2. 检查是否被 CONSTITUTION.md 引用
grep -r "新增文档名" agents/docs/specs/constitution/CONSTITUTION.md

# 3. 检查是否被智能体 AGENTS.md 引用
grep -r "新增文档名" agents/constitution/*/AGENTS.md

# 4. 检查是否被任务文件引用
grep -r "新增文档路径" .tasks/

# 5. 无引用 → 标记违规 VIO-008
```

### 3.3 Git Hook 验证（可选，增强）

**pre-commit hook 检查**:
```bash
#!/bin/bash
# .git/hooks/pre-commit

# 检查新增的 .md 文件
NEW_FILES=$(git diff --cached --name-only --diff-filter=A | grep "\.md$")

for file in $NEW_FILES; do
    if [[ $file == agents/constitution/* ]] || [[ $file == agents/*/AGENTS.md ]]; then
        # 检查是否被引用
        if ! grep -r "$(basename $file)" agents/docs/specs/constitution/CONSTITUTION.md 2>/dev/null; then
            if ! grep -r "$(basename $file)" agents/constitution/*/AGENTS.md 2>/dev/null; then
                echo "❌ 错误：$file 未被任何文档引用"
                echo "请确认：1) 添加到 CONSTITUTION.md 索引 或 2) 被智能体配置引用"
                exit 1
            fi
        fi
    fi
done
```

---

## 四、违规处理流程

### 4.1 违规分级

| 级别 | 违规代码 | 说明 | 处理 |
|------|---------|------|------|
| 🔴 高危 | VIO-008-A | 生成规范文档但无引用 | 立即清理或补充引用 |
| 🟡 中危 | VIO-008-B | 引用位置不当（如草稿目录） | 修正引用位置 |
| 🟢 低危 | VIO-008-C | 引用格式不规范 | 修正引用格式 |

### 4.2 处理流程

```
审计发现 VIO-008
    ↓
标记违规，记录到 violation-log.jsonl
    ↓
通知银河导航员 + 责任智能体
    ↓
责任智能体 24 小时内处理：
  - 选项 A: 补充引用（添加到 CONSTITUTION.md 或 AGENTS.md）
  - 选项 B: 删除文档（如无使用价值）
    ↓
审计验证处理结果
    ↓
✅ 已处理 → 关闭违规
❌ 未处理 → 升级（@用户）
```

### 4.3 违规记录格式

```jsonl
{"timestamp":"2026-04-04T12:00:00Z","violation_id":"VIO-008-A-001","type":"document_reference","severity":"high","description":"生成 agents/constitution/xxx/AGENTS.md 但未被 CONSTITUTION.md 索引","file":"agents/constitution/xxx/AGENTS.md","expected_action":"添加到 CONSTITUTION.md 索引或删除文档","deadline":"2026-04-05T12:00:00Z","status":"open"}
```

---

## 五、例外情况

### 5.1 无需引用的文档

| 文档类型 | 说明 | 示例 |
|---------|------|------|
| 临时报告 | 一次性审计报告 | `agents/constitution/audit/reports/2026-04-04.md` |
| 日志文件 | 运行日志 | `logs/fuse-poll-2026-04-04.jsonl` |
| 任务文件 | 临时任务记录 | `.tasks/xxx/task-001.md` |
| 会议纪要 | 临时会议记录 | `meeting-notes/2026-04-04.md` |

### 5.2 延迟引用（允许）

| 场景 | 说明 | 要求 |
|------|------|------|
| 文档正在编写 | 文档未完成，稍后补充引用 | 需在 24 小时内完成 |
| 等待用户确认 | 等待用户确认后再正式收录 | 需记录等待原因 |
| 实验性规范 | 试验性规范，验证后正式收录 | 需标记 `experimental` |

---

## 六、审计检查清单

### 6.1 定时审计检查项（每 2 小时）

| 检查项 | 方法 | 通过标准 |
|--------|------|----------|
| 新增规范文档 | `find agents/constitution -name "*.md" -mtime -1` | 所有文档被引用 |
| CONSTITUTION.md 索引完整性 | 检查 8 大核心规范链接 | 链接有效 |
| 智能体 AGENTS.md 引用 | 检查参考文档章节 | 引用有效 |
| 违规记录处理 | 检查 violation-log.jsonl | 无超期未处理 |

### 6.2 Type-B 变更审计（宪法规范变更）

| 检查项 | 方法 | 通过标准 |
|--------|------|----------|
| 新增规范收录 | 检查 CONSTITUTION.md | 新增规范已添加到索引 |
| 引用完整性 | 检查所有智能体 AGENTS.md | 相关智能体已更新参考文档 |
| 版本号一致性 | 检查所有文档 header | 版本号统一为 V3.17.0 |

---

## 七、实施步骤

### 7.1 立即执行（本次变更）

- [x] 创建 `DOCUMENT_REFERENCE_RULES.md` 规范
- [ ] 更新 `CONSTITUTION.md` 添加第 9 项规范索引
- [ ] 更新 `audit/AGENTS.md` 添加 VIO-008 违规检查
- [ ] 更新 `AUDIT_CHECKLIST.md` 添加文档引用检查项

### 7.2 后续执行（24 小时内）

- [ ] 扫描现有文档，清理无引用文档
- [ ] 配置 Git Hook（可选）
- [ ] 生成审计报告验证

---

## 八、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| V3.17.0 | 2026-04-04 | 初始版本，新增文档引用规范 | 用户提议 + 银河导航员执行 |

---

## 九、参考文档

- `agents/docs/specs/constitution/CONSTITUTION.md` - 宪法规范索引
- `agents/docs/specs/constitution/audit/AUDIT_CHECKLIST.md` - 审计检查清单
- `agents/docs/specs/constitution/audit/REAL_TIME_FUSE.md` - 实时熔断规范

---

**规范状态**: ✅ 已生效  
**下次审查**: 2026-05-04
