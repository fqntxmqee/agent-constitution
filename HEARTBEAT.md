# HEARTBEAT.md

# 支撑智能体定时任务配置

> 配置 3 个独立周期性支撑智能体：进展跟进、审计、总结反思

---

## 📚 支撑智能体配置

| 智能体 | 周期 | 职责 | 配置文档 | 飞书推送 |
|--------|------|------|----------|---------|
| `progress-tracking` | 每 30 分钟 | 监控任务进展，识别阻塞 | `agents/constitution/progress-tracking/AGENTS.md` | ✅ 消息 + 文档 |
| `audit` | 每 2 小时 | 合规检查，规约先行验证 | `agents/constitution/audit/AGENTS.md` | ✅ 消息 + 文档 |
| `summary-reflection` | 每日 23:00 + 任务完成 | 复盘分析，知识沉淀 | `agents/constitution/summary-reflection/AGENTS.md` | ✅ 消息 + 文档 |

---

## ⚙️ Cron 配置

**配置位置**: `crontab -l`

**配置内容**:
```bash
# 支撑智能体定时任务
*/30 * * * * openclaw agent --agent progress-tracking --message "执行进展汇报"
0 */2 * * * openclaw agent --agent audit --message "执行合规审计"
0 23 * * * openclaw agent --agent summary-reflection --message "执行每日总结"
```

---

## 📬 报告路径

| 智能体 | 报告路径 |
|--------|---------|
| progress-tracking | `agents/constitution/progress-tracking/reports/YYYY-MM-DD-HHMM.md` |
| audit | `agents/constitution/audit/reports/YYYY-MM-DD-HHMM.md` |
| summary-reflection | `agents/constitution/summary-reflection/reports/YYYY-MM-DD-daily.md` |

---

## ⚠️ 宪法规范

**严格遵守**:
- 各智能体按 AGENTS.md 执行各自职责
- 进展汇报由 progress-tracking 智能体负责
- 审计工作由 audit 智能体负责
- 总结反思由 summary-reflection 智能体负责

**参考文档**:
- 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 智能体配置：`agents/constitution/*/AGENTS.md`

---

**规范版本**: V3.7  
**创建日期**: 2026-03-09  
**最后更新**: 2026-03-10
