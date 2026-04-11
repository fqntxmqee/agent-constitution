# HEARTBEAT.md

# 支撑智能体定时任务配置

> 配置 2 个独立周期性支撑智能体：审计、总结反思
> **V3.17.2 变更**: 新增银河导航员定时进展同步（每 2 小时，飞书投递）
> **V3.17.1 变更**: 移除 progress-tracking 智能体
> **V3.16.0 新增**: 实时熔断监控、回归测试

---

## 📚 支撑智能体配置

| 智能体 | 周期 | 职责 | 配置文档 | 飞书推送 |
|--------|------|------|----------|---------|
| `audit` | 每 2 小时（整点） | 合规检查，规约先行验证 | `agents/constitution/audit/AGENTS.md` | ✅ 消息 + 文档 |
| `summary-reflection` | 每日 23:00 + 任务完成 | 复盘分析，知识沉淀 | `agents/constitution/summary-reflection/AGENTS.md` | ✅ 消息 + 文档 |
| `main`（银河导航员） | 每 2 小时（奇数小时 :30） | 任务进展同步汇报 | `agents/constitution/GALAXY_NAVIGATOR.md` | ✅ 飞书私聊 |

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

# 银河导航员定时进展同步（V3.17.2 新增）
# 奇数小时 :30 执行（1:30, 3:30, ..., 19:30, 21:30），与 audit 偶数整点错开
30 1-23/2 * * * openclaw agent --agent main --message "【定时同步】请汇报多智能体系统开发进展" --deliver --channel feishu --reply-to "user:ou_bb71789cc6f5dfec51e6603c6dace502"

# 宪法规范执行保障任务（V3.16.0 新增）
# 每日协同测试 - 每日 00:00
0 0 * * * bash scripts/daily-collab-test.sh
# 每周完整验证 - 每周日 03:00
0 3 * * 0 bash scripts/weekly-full-validation.sh
# 实时熔断监控 - 开机自启
@reboot nohup bash scripts/real-time-fuse-monitor.sh > /dev/null 2>&1 &
```

**实时熔断监控**:
- 不由 cron 调度，由审计智能体持续运行
- 轮询频率：每 30 秒
- 监听 `.tasks/index.md` 和各任务文件状态变化
- **熔断恢复机制**：当 fuse-poll 日志超过 2 分钟未更新时，自动触发审计智能体恢复监控

### 实时熔断监控恢复逻辑

```bash
# 检查 fuse-poll 是否超过 2 分钟未更新
FUSE_LOG="agents/constitution/audit/logs/fuse-poll-$(date +%Y-%m-%d).jsonl"
if [ -f "$FUSE_LOG" ]; then
  LAST_UPDATE=$(stat -f "%Sm" -t "%s" "$FUSE_LOG" 2>/dev/null || echo "0")
  NOW=$(date +%s)
  DIFF=$((NOW - LAST_UPDATE))
  if [ "$DIFF" -gt 120 ]; then
    # 超过 2 分钟，触发审计智能体恢复监控
    openclaw agent --agent audit --message "恢复实时熔断监控"
  fi
fi
```

### 支撑智能体 Heartbeat 检查

各支撑智能体的 HEARTBEAT.md 为空（跳过），支撑智能体由 workspace HEARTBEAT.md 的 cron 统一调度。

---

## 📬 报告路径

| 智能体/任务 | 报告路径 |
|--------|---------|
| audit | `agents/constitution/audit/reports/YYYY-MM-DD-HHMM.md` |
| summary-reflection | `agents/constitution/summary-reflection/reports/YYYY-MM-DD-daily.md` |
| **实时熔断** | `agents/constitution/audit/logs/fuse-poll-YYYY-MM-DD.jsonl` |
| **每日协同测试** | `agents/constitution/audit/logs/cron-daily-collab-test.log` |
| **每周完整验证** | `agents/constitution/audit/logs/cron-weekly-full-validation.log` |
| main（进展同步） | `~/.openclaw/logs/main-progress-sync.log` |

**已移除**:
- progress-tracking（V3.17.1，职责由银河导航员定时同步接管）

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

**规范版本**: V3.17.2  
**创建日期**: 2026-03-09  
**最后更新**: 2026-04-11  
**V3.17.2 变更**: 新增银河导航员定时进展同步，同步实际 cron 配置  
**V3.17.1 变更**: 移除 progress-tracking 智能体
