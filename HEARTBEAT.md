# HEARTBEAT.md

# 支撑智能体定时任务配置

> 配置 3 个独立周期性支撑智能体：进展跟进、审计、总结反思
> **V3.16.0 新增**: 实时熔断监控、回归测试

---

## 📚 支撑智能体配置

| 智能体 | 周期 | 职责 | 配置文档 | 飞书推送 |
|--------|------|------|----------|---------|
| `audit` | 每 2 小时 | 合规检查，规约先行验证 | `agents/constitution/audit/AGENTS.md` | ✅ 消息 + 文档 |
| `summary-reflection` | 每日 23:00 + 任务完成 | 复盘分析，知识沉淀 | `agents/constitution/summary-reflection/AGENTS.md` | ✅ 消息 + 文档 |

---

## 🛡️ 宪法规范执行保障任务（V3.16.0 新增）

| 任务 | 周期 | 职责 | 配置文档 | 飞书推送 |
|------|------|------|----------|---------|
| **实时熔断监控** | 每 30 秒 | 违规检测、熔断触发、告警通知 | `agents/docs/specs/constitution/audit/REAL_TIME_FUSE.md` | ✅ 熔断告警 |
| **回归测试** | 每日 02:00 | 自动化测试验证、报告生成 | `agents/docs/specs/constitution/audit/REGRESSION_TEST_SPEC.md` | ✅ 失败告警 |

---

## ⚙️ Cron 配置

**配置位置**: `crontab -l`

**配置内容**:
```bash
# 支撑智能体定时任务
0 */2 * * * openclaw agent --agent audit --message "执行合规审计"
0 23 * * * openclaw agent --agent summary-reflection --message "执行每日总结"

# 宪法规范执行保障任务（V3.16.0 新增）
# 回归测试 - 每日 02:00 执行 (低峰期)
0 2 * * * cd /Users/fukai/project/openclaw-workspace && bash scripts/run-regression-test.sh >> agents/constitution/audit/logs/cron-regression-test.log 2>&1
```

**实时熔断监控**:
- 不由 cron 调度，由审计智能体持续运行
- 轮询频率：每 30 秒
- 监听 `.tasks/index.md` 和各任务文件状态变化

---

## 📬 报告路径

| 智能体/任务 | 报告路径 |
|--------|---------|
| audit | `agents/constitution/audit/reports/YYYY-MM-DD-HHMM.md` |
| summary-reflection | `agents/constitution/summary-reflection/reports/YYYY-MM-DD-daily.md` |
| **实时熔断** | `agents/constitution/audit/logs/fuse-poll-YYYY-MM-DD.jsonl` |
| **回归测试** | `agents/constitution/audit/reports/regression-test-YYYYMMDD-HHMMSS.md` |

---

## ⚠️ 宪法规范

**严格遵守**:
- 各智能体按 AGENTS.md 执行各自职责
- 审计工作由 audit 智能体负责
- 总结反思由 summary-reflection 智能体负责

**参考文档**:
- 主规范：`agents/docs/specs/constitution/CONSTITUTION.md`
- 智能体配置：`agents/constitution/*/AGENTS.md`
- 实时熔断规范：`agents/docs/specs/constitution/audit/REAL_TIME_FUSE.md`
- Hard Gate 规范：`agents/docs/specs/constitution/HARD_GATE_SPEC.md`
- 回归测试规范：`agents/docs/specs/constitution/audit/REGRESSION_TEST_SPEC.md`

---

**规范版本**: V3.17.0  
**创建日期**: 2026-03-09  
**最后更新**: 2026-04-05
