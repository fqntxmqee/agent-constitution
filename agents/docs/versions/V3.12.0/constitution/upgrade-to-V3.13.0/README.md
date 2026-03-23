# V3.12.0 → V3.13.0 宪法规范升级包

**升级版本**: V3.12.0 → V3.13.0  
**升级日期**: 2026-03-23  
**变更类型**: Type-B (Minor 变更)  
**冷静期**: 24 小时  
**状态**: 🕐 待用户确认  

---

## 📋 升级摘要

**核心变更**: 移除 `runtime="acp"` 强制要求，允许智能体自主选择执行方式。

**保留铁律**: 继续禁止主会话直接 `write` 业务代码。

---

## 📁 文件清单

### 升级提案文件（本地）

| 文件 | 路径 | 说明 |
|------|------|------|
| 升级提案 | `agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/proposal.md` | 完整提案文档 |
| 决策记录 | `agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/DECISION_LOG.md` | 决策过程记录 |
| 备份清单 | `agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/BACKUP_CHECKLIST.md` | V3.12.0 备份验证 |
| 文件变更 | `agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/FILE_CHANGES.md` | 具体文件修改内容 |
| 本说明 | `agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/README.md` | 升级包说明 |

### 飞书文档链接

| 文档 | 链接 |
|------|------|
| 升级提案 | https://feishu.cn/docx/HB00d6o47oud7rxnJRfcl4gbnBh |

---

## ✅ 用户确认项

⚠️ 请确认以下变更后方可执行：

- [ ] 移除 `runtime="acp"` 强制要求
- [ ] 允许智能体自主选择执行方式（ACP / Subagent / 直接工具调用）
- [ ] 保留铁律：禁止主会话直接 `write` 业务代码
- [ ] 更新 AGENTS.md 执行方式选择规范
- [ ] 更新 CONSTITUTION.md 版本号 V3.12.0 → V3.13.0

---

## 🔄 执行流程

```
1. 用户确认（本阶段）
   ↓
2. audit 审计验证
   ↓
3. 执行文件修改
   ↓
4. Git 提交变更
   ↓
5. 24 小时冷静期
   ↓
6. 正式生效（V3.13.0）
```

---

## 📊 变更影响

### 影响范围

- **影响智能体**: 8 个核心智能体中的 5 个（requirement-* 系列）
- **影响文件**: 3 个（AGENTS.md, CONSTITUTION.md, CHANGELOG.md）
- **风险等级**: 低（保留铁律，仅移除执行方式约束）

### 执行方式选择指南

| 任务类型 | 推荐执行方式 | 理由 |
|---------|-------------|------|
| 多文件代码修改 | ACP | 需要完整上下文、代码审查 |
| 单文件配置修改 | Subagent | 简单、快速、无需审查 |
| 文档更新 | Subagent | 无需代码能力 |
| 测试运行 | ACP | 需要完整环境 |
| Git 操作 | Subagent 或 ACP | 复杂度决定 |
| 需求理解（生成规约） | ACP | 需要读取项目结构 |
| 需求验收（测试 + 审查） | ACP | 需要完整验证能力 |

---

## 📖 参考文档

- 宪法规范迭代流程：`agents/docs/specs/constitution/upgrade/ITERATION_PROCESS.md`
- 审计检查清单：`agents/docs/specs/constitution/audit/AUDIT_CHECKLIST.md`
- 决策记录规范：`agents/docs/specs/constitution/decision-recording/DECISION_RECORDING_RULES.md`

---

## 📞 联系方式

如有疑问，请联系银河导航员 🧭（主会话）

---

**升级包版本**: 1.0  
**创建时间**: 2026-03-23  
**状态**: 待用户确认
