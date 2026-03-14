# 宪法规范版本备份白名单

**版本号**: V1.0  
**生效日期**: 2026-03-12  
**状态**: ✅ 已确认  
**关联决策**: DEC-021, DEC-022

---

## 🎯 目的

明确宪法规范版本备份的范围，**仅备份宪法相关文件**，避免备份无关项目代码和个人文件。

---

## ✅ 白名单内容（允许备份）

**说明**：完整目录结构定义见 [CONSTITUTION_DIRECTORY_STANDARD.md](../directory-standard/CONSTITUTION_DIRECTORY_STANDARD.md)。以下为备份范围路径清单。

### 1. 智能体配置（8 个）

```
agents/constitution/*/AGENTS.md
├── requirement-clarification/AGENTS.md
├── requirement-understanding/AGENTS.md
├── requirement-resolution/AGENTS.md
├── requirement-acceptance/AGENTS.md
├── requirement-delivery/AGENTS.md
├── progress-tracking/AGENTS.md
├── audit/AGENTS.md
└── summary-reflection/AGENTS.md
```

### 2. 宪法规范文档

```
agents/docs/specs/constitution/
├── CONSTITUTION.md                      # 宪法唯一入口
├── CHANGELOG.md                         # 变更日志
├── change-classification/               # 变更分类
├── cooling-off/                         # 冷静期
├── audit/                               # 审计清单
├── backup/                              # 备份白名单与回滚
├── delivery/                            # 交付校验
├── directory-standard/                 # 目录结构标准
├── decision-recording/                  # 决策记录规范
└── upgrade/                             # 升级流程
```

### 3. 决策记录（全局）

存放位置规范见 [DECISION_RECORDING_RULES.md](../decision-recording/DECISION_RECORDING_RULES.md) 第六节。

```
agents/docs/decisions/
├── DECISION_LOG.md                      # 决策日志索引
├── DEC-001.md 至 DEC-XXX.md             # 全局决策记录
```

### 4. 讨论记录（全局）

```
agents/docs/discussions/
└── DISCUSSION_*.md                      # 全局议题讨论记录
```

### 5. 宪法相关提案（全局）

```
agents/docs/proposals/
├── CONSTITUTION_*.md                    # 宪法相关总结/报告（非单次升级）
├── ROLLBACK_DRILL_*.md                  # 回滚演练记录
└── FEISHU_*.md                          # 飞书相关配置
```

**某次升级过程**的提案、讨论、决策、交付在 `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/`，已包含在「7. 版本备份目录」中，随版本目录一并备份。

### 6. 智能体模板

```
agents/docs/templates/
├── audit-agent.md
├── progress-tracking-agent.md
├── requirement-acceptance-agent.md
├── requirement-clarification-agent.md
├── requirement-solving-agent.md
├── requirement-understanding-agent.md
└── summary-reflection-agent.md
```

### 7. 版本备份目录（先版本后类型）

```
agents/docs/versions/
├── V{version}/
│   ├── agents/                          # 该版本智能体配置备份
│   ├── constitution/                    # 该版本宪法快照与升级过程文档
│   │   ├── CONSTITUTION_*.md
│   │   ├── backup_timestamp.txt
│   │   └── upgrade-to-V{目标版本}/      # 某次升级过程（提案、讨论、决策、交付）
│   └── skills/                          # 该版本技能备份
└── latest -> V{version}/                # 符号链接指向当前最新版本
```

### 8. GitHub Actions 配置

```
.github/workflows/
└── constitution-backup.yml              # 宪法备份工作流
```

---

## ❌ 黑名单内容（禁止备份）

### 1. 项目代码

```
❌ us_stock_system/                      # 股票项目
❌ fitbot/                               # FitBot 项目
❌ fitbot-pro/                           # FitBot Pro 项目
❌ 其他项目代码目录
```

### 2. 个人文件

```
❌ memory/                               # 个人记忆文件
❌ .openclaw/                            # OpenClaw 状态文件
❌ *.json (状态文件)                      # task-state.json, audit-state.json 等
```

### 3. 临时备份

```
❌ skills.backup.*/                      # 技能临时备份
❌ *.backup.*/                           # 其他临时备份
```

### 4. 文档（非宪法相关）

```
❌ docs/                                 # 项目文档（非宪法规范）
❌ scripts/                              # 脚本文件（非宪法相关）
❌ templates/                            # 模板文件（非智能体模板）
```

### 5. 其他

```
❌ USER.md                               # 用户信息文件
❌ TOOLS.md                              # 工具配置
❌ TODO.md                               # 待办事项
❌ HEARTBEAT.md                          # 心跳配置
```

---

## 🔧 Git 提交规范

### 允许提交的文件

```bash
# 智能体配置
git add agents/constitution/*/AGENTS.md
git add agents/constitution/*/SOUL.md
git add agents/constitution/*/TOOLS.md
git add agents/constitution/*/IDENTITY.md


# 宪法规范
git add agents/docs/specs/constitution/
git add agents/docs/specs/skills/





# 模板
git add agents/docs/templates/*-agent.md

# 版本备份（含某次升级过程文档 upgrade-to-V*/）
git add agents/docs/versions/V*/constitution/
git add agents/docs/versions/latest

# GitHub Actions
git add .github/workflows/constitution-backup.yml
```

### 禁止提交的文件

```bash
# 项目代码
git add us_stock_system/     # ❌ 禁止
git add fitbot/              # ❌ 禁止

# 个人文件
git add memory/              # ❌ 禁止
git add .openclaw/           # ❌ 禁止
git add *.json               # ❌ 禁止（状态文件）

# 临时备份
git add skills.backup.*/     # ❌ 禁止

# 其他
git add docs/                # ❌ 禁止（非宪法相关）
git add scripts/             # ❌ 禁止（非宪法相关）
```

---

## 📊 备份验证清单

### 每次备份前检查

- [ ] 仅包含白名单文件
- [ ] 不包含黑名单文件
- [ ] backup_metadata.json 已更新
- [ ] 飞书链接已回写
- [ ] Git 提交信息符合 Conventional Commits

### 备份后验证

- [ ] 版本备份目录结构正确
- [ ] latest 符号链接指向正确版本
- [ ] Git Tag 已创建
- [ ] Git push 成功

---

## 🚨 违规处理

### 违规等级

| 等级 | 说明 | 处理 |
|------|------|------|
| 🔴 严重 | 提交项目代码或个人文件 | 立即回滚 + 审计记录 |
| 🟡 一般 | 提交非宪法相关文档 | 限期清理 |
| 🟢 轻微 | 提交多余的状态文件 | 建议改进 |

### 处理流程

```
发现违规 → 审计记录 → 回滚提交 → 清理文件 → 重新提交
```

---

## 📚 参考文档

- `VERSION_BACKUP_AND_ROLLBACK.md` - 版本备份与回滚规范
- `DECISION_RECORDING_RULES.md` - 决策记录规范
- `AUDIT_CHECKLIST.md` - 审计检查清单

---

**规范版本**: V1.0  
**创建日期**: 2026-03-12  
**关联决策**: DEC-021, DEC-022
