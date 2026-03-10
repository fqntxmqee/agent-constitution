# 支撑智能体定时同步监控机制

**版本**: 1.0  
**创建日期**: 2026-03-10  
**状态**: ✅ 已生效

---

## 📋 概述

本文档定义了三个支撑智能体（进展跟进、审计、总结反思）的定时同步监控机制，确保它们正常工作。

---

## 🎯 监控目标

1. **定时触发**: 确保每个智能体按配置频率触发
2. **报告生成**: 确保每次触发都生成报告
3. **飞书同步**: 确保报告同步到飞书知识库
4. **异常告警**: 发现异常时及时告警

---

## 📊 智能体配置

| 智能体 | 触发频率 | 上次运行 | 下次运行 | 状态 |
|--------|---------|---------|---------|------|
| **progress-tracking** | 每 30 分钟 | 13:23 | 13:53 | ✅ 正常 |
| **audit** | 每 2 小时 | 12:53 | 14:53 | ✅ 正常 |
| **summary-reflection** | 每日 23:00 | 13:20 | 23:00 | ✅ 正常 |

---

## 🔍 监控检查清单

### 每日检查（由 progress-tracking 执行）

**检查时间**: 每次 heartbeat（每 30 分钟）

**检查内容**:
- [ ] 检查活跃子 agent
- [ ] 检查任务进度
- [ ] 检查报告生成
- [ ] 检查飞书同步

**检查命令**:
```bash
# 检查活跃子 agent
subagents list --recentMinutes=60

# 检查最新报告
ls -lt agents/constitution/progress-tracking/reports/ | head -3
ls -lt agents/constitution/audit/reports/ | head -3
ls -lt agents/constitution/summary-reflection/reports/ | head -3

# 检查 heartbeat 状态
cat memory/heartbeat-state.json | python3 -m json.tool
```

---

### 每小时检查（由 audit 执行）

**检查时间**: 每 2 小时

**检查内容**:
- [ ] 审计最近 2 小时的操作日志
- [ ] 检查合规性
- [ ] 生成审计报告
- [ ] 同步到飞书

**检查命令**:
```bash
# 检查会话日志
ls -lt ~/.openclaw/agents/*/sessions/*.jsonl | head -10

# 检查锁文件
ls -la ~/.openclaw/agents/*/sessions/*.lock 2>/dev/null || echo "无锁文件"

# 生成审计报告
openclaw agent --agent audit --message "执行周期性审计"
```

---

### 每日检查（由 summary-reflection 执行）

**检查时间**: 每日 23:00

**检查内容**:
- [ ] 分析当日所有日志
- [ ] 生成总结报告
- [ ] 提出改进建议
- [ ] 提交用户确认

**检查命令**:
```bash
# 分析当日日志
find ~/.openclaw/agents/*/sessions/ -name "*.jsonl" -mtime -1 -exec wc -l {} \;

# 生成总结报告
openclaw agent --agent summary-reflection --message "执行每日总结"
```

---

## 📁 报告路径

### 进展报告

**路径**: `agents/constitution/progress-tracking/reports/`

**命名格式**: `YYYY-MM-DD-HHMM.md`

**最新报告**: `2026-03-09-2100.md`（21:00）

**飞书位置**: 待同步

---

### 审计报告

**路径**: `agents/constitution/audit/reports/`

**命名格式**: `YYYY-MM-DD-HHMM.md`

**最新报告**: `2026-03-10-1253.md`（12:53）

**飞书位置**: https://feishu.cn/docx/RNO7dCJLJo3S4wxlcRpcl5u5nNg

---

### 总结报告

**路径**: `agents/constitution/summary-reflection/reports/`

**命名格式**: `YYYY-MM-DD-daily.md`

**最新报告**: `2026-03-10-daily.md`（12:46）

**飞书位置**: 待同步

---

## ⚠️ 异常检测

### 进展跟进智能体异常

**异常条件**:
- 超过 30 分钟无新报告
- 报告内容为空
- 飞书同步失败

**告警方式**:
- 主会话消息通知
- 飞书文档评论

**处理流程**:
```
发现异常
    ↓
记录异常日志
    ↓
通知主会话
    ↓
手动触发或等待下次 heartbeat
```

---

### 审计智能体异常

**异常条件**:
- 超过 2 小时无新报告
- 审计报告未包含关键检查项
- 飞书同步失败

**告警方式**:
- 主会话消息通知
- 飞书文档评论

**处理流程**:
```
发现异常
    ↓
记录异常日志
    ↓
通知主会话
    ↓
手动触发审计
```

---

### 总结反思智能体异常

**异常条件**:
- 23:00 后无总结报告
- 总结报告内容不完整
- 未提出改进建议

**告警方式**:
- 主会话消息通知
- 飞书文档评论

**处理流程**:
```
发现异常
    ↓
记录异常日志
    ↓
通知主会话
    ↓
手动触发总结反思
```

---

## 🔧 手动触发命令

### 手动触发进展跟进

```bash
openclaw agent --agent progress-tracking --message "执行进展汇报"
```

### 手动触发审计

```bash
openclaw agent --agent audit --message "执行周期性审计"
```

### 手动触发总结反思

```bash
openclaw agent --agent summary-reflection --message "执行每日总结"
```

---

## 📊 监控指标

| 指标 | 目标值 | 告警阈值 | 当前值 |
|------|--------|---------|--------|
| progress-tracking 运行间隔 | 30 分钟 | >45 分钟 | 正常 |
| audit 运行间隔 | 2 小时 | >3 小时 | 正常 |
| summary-reflection 运行时间 | 23:00 | 未运行 | 正常 |
| 报告生成率 | 100% | <90% | 100% |
| 飞书同步率 | 100% | <90% | 待同步 |

---

## 📝 验证流程

### 每日验证（由主会话执行）

**验证时间**: 每日 09:00

**验证内容**:
```bash
# 1. 检查进展报告数量（应≥48 个/天）
ls agents/constitution/progress-tracking/reports/ | wc -l

# 2. 检查审计报告数量（应≥12 个/天）
ls agents/constitution/audit/reports/ | wc -l

# 3. 检查总结报告（应≥1 个/天）
ls agents/constitution/summary-reflection/reports/ | wc -l

# 4. 检查飞书同步
# 手动访问飞书链接验证
```

---

## 🔗 相关文档

| 文档 | 路径 |
|------|------|
| HEARTBEAT.md | `HEARTBEAT.md` |
| 版本控制流程 | `agents/docs/specs/VERSION_CONTROL_AND_BACKUP_PROCESS.md` |
| 宪法规范迭代流程 | `agents/docs/specs/CONSTITUTION_ITERATION_PROCESS.md` |
| 并行架构规范 | `agents/docs/specs/CONSTITUTION_V3.7_PARALLEL.md` |

---

## 📝 更新日志

| 日期 | 变更 | 负责人 |
|------|------|--------|
| 2026-03-10 | 初始版本 | summary-reflection |

---

**文档版本**: 1.0  
**创建日期**: 2026-03-10  
**下次审查**: 2026-03-17
