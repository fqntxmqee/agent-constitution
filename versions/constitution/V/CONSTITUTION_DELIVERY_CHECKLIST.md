# 宪法规范 Git 交付同步清单

**版本号**: V1.0  
**生效日期**: 2026-03-12  
**状态**: ✅ 已确认

---

## 📁 同步目录结构

```
agent-constitution/
│
├── agents/
│   ├── constitution/                    # 智能体配置（8 个）
│   │   ├── audit/AGENTS.md
│   │   ├── progress-tracking/AGENTS.md
│   │   ├── requirement-acceptance/AGENTS.md
│   │   ├── requirement-clarification/AGENTS.md
│   │   ├── requirement-delivery/AGENTS.md
│   │   ├── requirement-resolution/AGENTS.md
│   │   ├── requirement-understanding/AGENTS.md
│   │   └── summary-reflection/AGENTS.md
│   │
│   └── docs/
│       ├── specs/                       # 宪法规范文档
│       │   ├── CONSTITUTION_*.md
│       │   ├── CONSTITUTION_CHANGE_CLASSIFICATION.md
│       │   ├── COOLING_OFF_PERIOD_RULES.md
│       │   ├── AUDIT_CHECKLIST.md
│       │   ├── VERSION_BACKUP_AND_ROLLBACK.md
│       │   ├── DECISION_RECORDING_RULES.md
│       │   ├── CONSTITUTION_BACKUP_WHITELIST.md
│       │   └── CHANGELOG.md
│       │
│       ├── decisions/                   # 决策记录
│       │   ├── DECISION_LOG.md
│       │   └── DEC-*.md
│       │
│       ├── discussions/                 # 讨论记录
│       │   └── DISCUSSION_*.md
│       │
│       ├── proposals/                   # 提案文档
│       │   ├── CONSTITUTION_*.md
│       │   ├── ROLLBACK_DRILL_*.md
│       │   └── FEISHU_*.md
│       │
│       └── templates/                   # 智能体模板
│           └── *-agent.md
│
├── versions/
│   └── constitution/                    # 版本备份
│       ├── V{version}/
│       │   └── backup_metadata.json
│       └── latest -> V{version}/
│
└── .github/
    └── workflows/
        └── constitution-backup.yml      # GitHub Actions 配置
```

---

## ✅ 允许同步的文件清单

### 1. 智能体配置（8 个）

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `agents/constitution/audit/AGENTS.md` | 审计智能体 |
| 2 | `agents/constitution/progress-tracking/AGENTS.md` | 进展跟进智能体 |
| 3 | `agents/constitution/requirement-acceptance/AGENTS.md` | 需求验收智能体 |
| 4 | `agents/constitution/requirement-clarification/AGENTS.md` | 需求澄清智能体 |
| 5 | `agents/constitution/requirement-delivery/AGENTS.md` | 需求交付智能体 |
| 6 | `agents/constitution/requirement-resolution/AGENTS.md` | 需求解决智能体 |
| 7 | `agents/constitution/requirement-understanding/AGENTS.md` | 需求理解智能体 |
| 8 | `agents/constitution/summary-reflection/AGENTS.md` | 总结反思智能体 |

---

### 2. 宪法规范文档（7 个）

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `agents/docs/specs/CONSTITUTION_CHANGE_CLASSIFICATION.md` | 变更分类规范 |
| 2 | `agents/docs/specs/COOLING_OFF_PERIOD_RULES.md` | 冷静期规则 |
| 3 | `agents/docs/specs/AUDIT_CHECKLIST.md` | 审计检查清单 |
| 4 | `agents/docs/specs/VERSION_BACKUP_AND_ROLLBACK.md` | 版本备份与回滚 |
| 5 | `agents/docs/specs/DECISION_RECORDING_RULES.md` | 决策记录规范 |
| 6 | `agents/docs/specs/CONSTITUTION_BACKUP_WHITELIST.md` | 备份白名单 |
| 7 | `agents/docs/specs/CHANGELOG.md` | 变更日志 |

---

### 3. 决策记录（31 个）

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `agents/docs/decisions/DECISION_LOG.md` | 决策日志索引 |
| 2-31 | `agents/docs/decisions/DEC-001.md` 至 `DEC-030.md` | 30 个决策记录 |

---

### 4. 讨论记录（按需）

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `agents/docs/discussions/DISCUSSION_001_VERSIONING.md` | 议题一讨论 |
| ... | `DISCUSSION_*.md` | 其他议题讨论 |

---

### 5. 提案文档（按需）

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `agents/docs/proposals/CONSTITUTION_V3.9.0_FINAL_REPORT.md` | 总结报告 |
| 2 | `agents/docs/proposals/ROLLBACK_DRILL_001.md` | 回滚演练 |
| 3 | `agents/docs/proposals/FEISHU_SYNC_CONFIG.md` | 飞书配置 |

---

### 6. 智能体模板（8 个）

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `agents/docs/templates/audit-agent.md` | 审计智能体模板 |
| 2 | `agents/docs/templates/progress-tracking-agent.md` | 进展跟进模板 |
| 3 | `agents/docs/templates/requirement-acceptance-agent.md` | 需求验收模板 |
| 4 | `agents/docs/templates/requirement-clarification-agent.md` | 需求澄清模板 |
| 5 | `agents/docs/templates/requirement-solving-agent.md` | 需求解决模板 |
| 6 | `agents/docs/templates/requirement-understanding-agent.md` | 需求理解模板 |
| 7 | `agents/docs/templates/summary-reflection-agent.md` | 总结反思模板 |

---

### 7. 版本备份

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `versions/constitution/V{version}/backup_metadata.json` | 备份元数据 |
| 2 | `versions/constitution/latest` | 符号链接 |

---

### 8. GitHub Actions 配置

| 序号 | 文件路径 | 说明 |
|------|---------|------|
| 1 | `.github/workflows/constitution-backup.yml` | 宪法备份工作流 |

---

## ❌ 禁止同步的文件清单

| 类别 | 路径 | 说明 |
|------|------|------|
| **项目代码** | `us_stock_system/` | 股票项目代码 |
| **个人文件** | `memory/` | 个人记忆文件 |
| **状态文件** | `.openclaw/` | OpenClaw 状态 |
| **状态文件** | `*.json` | task-state.json, audit-state.json 等 |
| **临时备份** | `skills.backup.*/` | 技能临时备份 |
| **项目文档** | `docs/` | 非宪法相关文档 |
| **脚本文件** | `scripts/` | 非宪法相关脚本 |
| **模板文件** | `templates/` | 非智能体模板 |
| **配置文件** | `IDENTITY.md`, `SOUL.md`, `USER.md` | 个人配置 |
| **配置文件** | `HEARTBEAT.md`, `AGENTS.md` (根目录) | 工作区配置 |

---

## 🔧 交付前校验流程

### 步骤 1: 生成待提交文件列表

```bash
# 生成文件列表
git add -A
git diff --cached --name-only > /tmp/staged_files.txt
```

### 步骤 2: 对比白名单

```bash
# 检查是否有黑名单文件
for file in $(cat /tmp/staged_files.txt); do
  if [[ $file == us_stock_system/* ]] || \
     [[ $file == memory/* ]] || \
     [[ $file == .openclaw/* ]]; then
    echo "❌ 发现黑名单文件：$file"
    exit 1
  fi
done
```

### 步骤 3: 对比验收报告

```bash
# 读取验收报告中的交付物清单
# 对比实际提交文件是否一致
```

### 步骤 4: 生成校验报告

```markdown
## 交付校验报告

### 提交文件数量
- 总计：XX 个文件
- 智能体配置：8 个
- 宪法规范：7 个
- 决策记录：31 个
- ...

### 白名单校验
- ✅ 无黑名单文件
- ✅ 所有文件在白名单内

### 验收报告对比
- ✅ 交付物一致性：100%
- ✅ 无遗漏文件
- ✅ 无多余文件
```

---

## 📊 校验清单

### 交付前检查

- [ ] 已生成待提交文件列表
- [ ] 已对比白名单（无黑名单文件）
- [ ] 已对比验收报告（交付物一致）
- [ ] 已生成校验报告
- [ ] 用户确认校验报告

### 交付后验证

- [ ] Git 提交成功
- [ ] Git push 成功
- [ ] Git Tag 创建成功
- [ ] 飞书链接已更新

---

**规范版本**: V1.0  
**创建日期**: 2026-03-12  
**关联决策**: DEC-021, DEC-022, DEC-026
