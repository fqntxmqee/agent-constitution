# 版本备份与回滚规范

**版本号**: V1.0  
**生效日期**: 2026-03-12  
**关联决策**: DEC-021 至 DEC-026

---

## 一、备份触发条件

| 事件 | 备份类型 | 触发时机 |
|------|---------|---------|
| **Type-A 变更生效** | 完整备份 | 冷静期结束后 |
| **Type-B 变更生效** | 完整备份 | 冷静期结束后 |
| **每月 1 日 00:00** | 定期备份 | 自动触发 |
| **回滚操作前** | 强制备份 | 回滚前必须先备份 |

---

## 二、备份白名单

### 允许备份的文件

```
✅ agents/constitution/*/AGENTS.md     # 8 个智能体配置
✅ agents/docs/specs/CONSTITUTION_*.md # 宪法规范
✅ agents/docs/decisions/DECISION_*.md # 决策记录
✅ agents/docs/discussions/*.md        # 讨论记录
✅ agents/docs/proposals/CONSTITUTION_*.md
✅ agents/docs/templates/*-agent.md
✅ versions/constitution/V{version}/   # 版本备份
✅ .github/workflows/constitution-backup.yml
```

### 禁止备份的文件

```
❌ us_stock_system/                     # 项目代码
❌ memory/                              # 个人文件
❌ .openclaw/                           # 状态文件
❌ skills.backup.*/                     # 临时备份
❌ docs/                                # 非宪法文档
❌ scripts/                             # 非宪法脚本
```

---

## 三、备份内容

```
versions/constitution/V{version}/
├── CONSTITUTION_*.md
├── AGENTS.md
├── backup_metadata.json
└── feishu_doc_url.txt
```

---

## 四、回滚流程

```
发现回滚需求 → 提交申请 → 用户批准 → 备份当前状态
→ 确认目标版本 → 更新符号链接 → 恢复文档
→ Git 提交 → 通知相关方 → 更新回滚记录
```

---

## 五、自动化备份

### Git Hook
触发条件：宪法规范文档变更时自动备份

### GitHub Actions
触发条件：Git push 时自动备份 + 打 Tag

---

**规范版本**: V1.0  
**创建日期**: 2026-03-12