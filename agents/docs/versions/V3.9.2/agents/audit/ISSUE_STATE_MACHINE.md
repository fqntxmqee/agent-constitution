# 问题跟踪状态机 V3.9.0

**用途**: 定义审计问题的状态流转、升级规则、处置流程  
**版本**: 3.9.0  
**遵循**: 智能体协同系统宪法规范 V3.9.0

---

## 📊 状态图

```
                                    ┌─────────────┐
                                    │   新建      │
                                    │   NEW       │
                                    └──────┬──────┘
                                           │ 自动/手动创建
                                           ▼
                                    ┌─────────────┐
                              ┌─────│   待确认    │─────┐
                              │     │  PENDING    │     │ 拒绝
                              │     └──────┬──────┘     │
                              │            │ 确认        │
                              │            ▼             │
                              │     ┌─────────────┐     │
                              │     │   处理中    │     │
                              │     │ IN_PROGRESS │     │
                              │     └──────┬──────┘     │
                              │            │ 修复完成    │
                              │            ▼             │
                              │     ┌─────────────┐     │
                              │     │   待验证    │     │
                              │     │  VERIFICATION │   │
                              │     └──────┬──────┘     │
                              │            │ 验证通过    │
                              │            ▼             │
                              │     ┌─────────────┐     │
                              └────►│   已关闭    │◄────┘
                                    │   CLOSED    │
                                    └──────┬──────┘
                                           │ 验证失败
                                           ▼
                                    ┌─────────────┐
                                    │  重新打开   │
                                    │  REOPENED   │
                                    └──────┬──────┘
                                           │
                                           └──────────────┐
                                                          │
                                                          ▼
                                                   (返回 处理中)
```

---

## 📋 状态定义

### NEW（新建）

| 属性 | 值 |
|------|-----|
| 触发条件 | 审计检测到问题 |
| 自动操作 | 分配等级、创建记录 |
| 通知 | 根据等级发送告警 |
| 超时 | 无 |

**数据结构**:
```json
{
  "id": "ISSUE-20260316-001",
  "status": "NEW",
  "created_at": "2026-03-16T00:15:00+08:00",
  "level": "critical",
  "check_id": "SEC-001",
  "title": "iMessage groupPolicy=open",
  "description": "...",
  "affected_agents": ["main", "audit"],
  "evidence": ["config snapshot", "log excerpt"]
}
```

---

### PENDING（待确认）

| 属性 | 值 |
|------|-----|
| 触发条件 | 问题需要人工确认（存疑违规） |
| 自动操作 | 发送确认请求 |
| 通知 | 发送用户确认请求 |
| 超时 | 24 小时 → 自动关闭（误报） |

**处置选项**:
- ✅ 确认违规 → IN_PROGRESS
- ❌ 误报 → CLOSED（记录 overrule）

---

### IN_PROGRESS（处理中）

| 属性 | 值 |
|------|-----|
| 触发条件 | 问题已确认，开始整改 |
| 自动操作 | 记录整改计划 |
| 通知 | 通知相关智能体暂停（如熔断） |
| 超时 | 根据等级（Critical:1h, High:48h, Medium:7d） |

**整改记录**:
```json
{
  "action_plan": [
    { "step": 1, "action": "修改配置", "status": "pending" },
    { "step": 2, "action": "重启网关", "status": "pending" },
    { "step": 3, "action": "验证修复", "status": "pending" }
  ],
  "assigned_to": "user",
  "due_at": "2026-03-16T01:15:00+08:00"
}
```

---

### VERIFICATION（待验证）

| 属性 | 值 |
|------|-----|
| 触发条件 | 整改完成，等待验证 |
| 自动操作 | 运行验证检查 |
| 通知 | 通知审计智能体验证 |
| 超时 | 24 小时 → 提醒 |

**验证检查**:
```json
{
  "verification_checks": [
    { "check_id": "SEC-001", "expected": "allowlist", "actual": "allowlist", "pass": true }
  ],
  "verified_by": "audit",
  "verified_at": "2026-03-16T01:10:00+08:00"
}
```

---

### CLOSED（已关闭）

| 属性 | 值 |
|------|-----|
| 触发条件 | 验证通过 或 确认为误报 |
| 自动操作 | 归档记录、更新统计 |
| 通知 | 发送关闭通知 |
| 超时 | 无 |

**关闭原因**:
- `resolved` - 已修复
- `overruled` - 用户确认误报
- `expired` - 超时自动关闭
- `duplicate` - 重复问题

---

### REOPENED（重新打开）

| 属性 | 值 |
|------|-----|
| 触发条件 | 验证失败 或 问题复发 |
| 自动操作 | 恢复熔断、重新通知 |
| 通知 | 发送重新打开通知 |
| 超时 | 同 IN_PROGRESS |

---

## ⏱️ 升级规则

### 等级与响应时限

| 等级 | 响应时限 | 升级时限 | 告警频率 |
|------|----------|----------|----------|
| Critical | 立即 | 1 小时 | 每 15 分钟 |
| High | 24 小时 | 48 小时 | 每 24 小时 |
| Medium | 7 天 | 14 天 | 每 7 天 |
| Low | 30 天 | 60 天 | 每月汇总 |

### 升级流程

```
问题创建
   │
   ▼
┌─────────────┐
│ 未超响应时限 │───── 正常处理
└──────┬──────┘
       │ 超时
       ▼
┌─────────────┐
│ 发送升级告警 │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 未超升级时限 │───── 等待响应
└──────┬──────┘
       │ 超时
       ▼
┌─────────────┐
│ 升级至上级   │
│ (用户/导航员)│
└─────────────┘
```

---

## 📝 问题记录模板

```json
{
  "issue": {
    "id": "ISSUE-YYYYMMDD-NNN",
    "status": "NEW|PENDING|IN_PROGRESS|VERIFICATION|CLOSED|REOPENED",
    "level": "critical|high|medium|low",
    "check_id": "SEC-001",
    "title": "问题标题",
    "description": "详细描述",
    "created_at": "2026-03-16T00:15:00+08:00",
    "updated_at": "2026-03-16T00:15:00+08:00",
    "due_at": "2026-03-16T01:15:00+08:00",
    "closed_at": null,
    "closed_reason": null
  },
  "affected": {
    "agents": ["main", "audit"],
    "sessions": ["session_id_1", "session_id_2"],
    "projects": ["project_name"]
  },
  "evidence": [
    {
      "type": "log|config|screenshot",
      "path": "/path/to/evidence",
      "snapshot": "..."
    }
  ],
  "timeline": [
    {
      "timestamp": "2026-03-16T00:15:00+08:00",
      "event": "created",
      "actor": "audit",
      "details": "问题创建"
    },
    {
      "timestamp": "2026-03-16T00:16:00+08:00",
      "event": "notified",
      "actor": "system",
      "details": "发送告警通知"
    }
  ],
  "resolution": {
    "action_plan": [],
    "completed_at": null,
    "verified_at": null,
    "verified_by": null,
    "verification_result": null
  }
}
```

---

## 🔄 状态流转 API

### 创建问题

```bash
POST /api/issues
{
  "check_id": "SEC-001",
  "level": "critical",
  "title": "...",
  "description": "...",
  "evidence": [...]
}
```

### 更新状态

```bash
PATCH /api/issues/{id}/status
{
  "status": "IN_PROGRESS",
  "reason": "用户确认违规",
  "action_plan": [...]
}
```

### 添加评论

```bash
POST /api/issues/{id}/comments
{
  "comment": "正在修复配置...",
  "attachments": [...]
}
```

### 验证关闭

```bash
POST /api/issues/{id}/verify
{
  "checks": [
    { "check_id": "SEC-001", "pass": true }
  ],
  "verified_by": "audit"
}
```

---

## 📊 统计指标

### 问题趋势

```json
{
  "period": "2026-03-16",
  "new_count": 5,
  "closed_count": 3,
  "open_count": 7,
  "overdue_count": 1,
  "by_level": {
    "critical": 1,
    "high": 2,
    "medium": 3,
    "low": 1
  }
}
```

### 平均修复时间 (MTTR)

```json
{
  "critical": { "avg_hours": 0.5, "count": 3 },
  "high": { "avg_hours": 12, "count": 10 },
  "medium": { "avg_days": 2, "count": 20 },
  "low": { "avg_days": 15, "count": 50 }
}
```

---

**版本**: 3.9.0  
**最后更新**: 2026-03-16  
**维护者**: 规则守护者 🛡️  
**对齐**: 宪法规范 V3.9.0
