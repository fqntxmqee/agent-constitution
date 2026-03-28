# 实时熔断规范 (Real-Time Fuse Specification)

**文档类型**: 宪法规范执行保障体系 - 实时熔断规范  
**版本号**: V1.0  
**创建日期**: 2026-03-27  
**状态**: 已生效  
**关联规范**: `agents/docs/specs/constitution/CONSTITUTION.md`

---

## 一、概述

### 1.1 目的

建立实时熔断机制，在智能体执行过程中即时检测并阻止违规行为，确保宪法规范 V3.16.0 严格执行。

### 1.2 适用范围

- 所有 8 大智能体会话
- 所有任务执行流程
- 所有阶段流转过程

### 1.3 核心原则

- **实时检测**: 每 30 秒轮询一次任务状态
- **高置信度熔断**: 置信度>90% 立即熔断
- **用户 overrule**: 用户可强制继续，但须记录理由
- **审计追溯**: 所有熔断事件写入审计报告

---

## 二、违规检测规则

### 2.1 高危违规规则清单（5+ 条）

| 规则 ID | 规则名称 | 检测条件 | 违规等级 | 置信度 |
|---------|----------|----------|----------|--------|
| VIO-001 | 跳过澄清阶段 | 未生成 clarification 报告直接进入 understanding | 高危 | 95% |
| VIO-002 | 无蓝图执行 | 未生成 execution blueprint 直接进入 resolution | 高危 | 95% |
| VIO-003 | 绕过验收交付 | 未通过 acceptance 检查直接进入 delivery | 高危 | 95% |
| VIO-004 | 冷静期违规 | Type-A/B 变更未满足冷静期要求即执行 | 高危 | 90% |
| VIO-005 | 审计检查缺失 | 应审计场景未触发审计检查 | 高危 | 90% |
| VIO-006 | Hard Gate 绕过 | 未通过 Hard Gate 检查进入下一阶段 | 高危 | 95% |
| VIO-007 | Story File 未更新 | 阶段完成后未更新 story/context 文件 | 中危 | 80% |

### 2.2 违规检测规则详细说明

#### VIO-001: 跳过澄清阶段

**检测逻辑**:
```
IF 任务状态从 pending 直接进入 understanding
AND 不存在 clarification 报告文件
THEN 触发 VIO-001 违规
```

**检查文件**:
- `.tasks/{task-id}/clarification-report.md` (应存在)

**处理**: 立即熔断，退回 clarification 阶段

---

#### VIO-002: 无蓝图执行

**检测逻辑**:
```
IF 任务状态从 understanding 进入 resolution
AND 不存在 execution blueprint 文件
THEN 触发 VIO-002 违规
```

**检查文件**:
- `.tasks/{task-id}/specs/requirements.md` (应存在)
- `.tasks/{task-id}/specs/design.md` (应存在)
- `.tasks/{task-id}/specs/tasks.md` (应存在)
- `.tasks/{task-id}/specs/acceptance-criteria.md` (应存在)

**处理**: 立即熔断，退回 understanding 阶段

---

#### VIO-003: 绕过验收交付

**检测逻辑**:
```
IF 任务状态从 resolution 进入 delivery
AND 不存在 acceptance 报告
THEN 触发 VIO-003 违规
```

**检查文件**:
- `.tasks/{task-id}/acceptance-report.md` (应存在)

**处理**: 立即熔断，退回 acceptance 阶段

---

#### VIO-004: 冷静期违规

**检测逻辑**:
```
IF 变更类型为 Type-A AND 当前时间 < DEC 创建时间 + 3 天
OR 变更类型为 Type-B AND 当前时间 < DEC 创建时间 + 24 小时
THEN 触发 VIO-004 违规
```

**检查文件**:
- `agents/docs/decisions/DEC-XXXX.md` (获取创建时间)
- `.tasks/{task-id}/change-type.md` (获取变更类型)

**处理**: 立即熔断，等待冷静期结束

---

#### VIO-005: 审计检查缺失

**检测逻辑**:
```
IF 任务复杂度为 A 级 OR S 级
AND 不存在审计报告
THEN 触发 VIO-005 违规
```

**检查文件**:
- `.tasks/{task-id}/complexity.md` (获取复杂度)
- `.tasks/{task-id}/audit-report.md` (应存在)

**处理**: 立即熔断，触发审计检查

---

#### VIO-006: Hard Gate 绕过

**检测逻辑**:
```
IF 阶段流转发生
AND 不存在对应的 Hard Gate 检查记录
THEN 触发 VIO-006 违规
```

**检查文件**:
- `.tasks/{task-id}/gate-records.md` (应存在对应 Gate 记录)

**处理**: 立即熔断，执行 Hard Gate 检查

---

#### VIO-007: Story File 未更新

**检测逻辑**:
```
IF 阶段完成
AND story/state.md 最后修改时间 < 阶段完成时间
THEN 触发 VIO-007 违规 (中危)
```

**检查文件**:
- `story/state.md` (检查最后修改时间)
- `story/context/` (检查上下文文件)

**处理**: 告警，要求补更新

---

## 三、监听机制

### 3.1 轮询配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **轮询频率** | 30 秒 | 审计智能体每 30 秒轮询一次 |
| **轮询时间** | 全天 24 小时 | 持续监控 |
| **轮询目标** | `.tasks/index.md` + 各任务文件 | 获取最新状态 |

### 3.2 会话过滤

| 过滤规则 | 说明 |
|----------|------|
| **仅监控活跃会话** | 状态为 `running` 或 `pending` 的任务 |
| **过滤已完成会话** | 状态为 `completed`/`failed`/`delivered` 的任务不监控 |
| **过滤超时会话** | 超过 7 天无更新的任务标记为超时，停止监控 |

### 3.3 检测范围

| 智能体 | 监控内容 |
|--------|----------|
| 银河导航员 | 任务分发、阶段流转 |
| 需求澄清 | clarification 报告生成 |
| 需求理解 | OpenSpec 文档生成 |
| 需求解决 | 代码/文件 write 操作 |
| 需求验收 | 验收报告生成 |
| 需求交付 | 交付物完整性 |
| 审计智能体 | 自身轮询记录 |
| 总结反思 | 复盘报告生成 |

### 3.4 日志记录

**日志格式**:
```json
{
  "timestamp": "2026-03-27T10:30:00Z",
  "session_id": "REQ-001-task-001",
  "action": "poll",
  "current_stage": "resolution",
  "detected_violations": [],
  "confidence": 0
}
```

**日志位置**: `agents/constitution/audit/logs/fuse-poll-YYYY-MM-DD.jsonl`

---

## 四、熔断决策逻辑

### 4.1 置信度分级

| 置信度范围 | 判定类型 | 处理方式 |
|------------|----------|----------|
| **> 90%** | 高置信度违规 | 立即熔断，停止执行 |
| **60% - 90%** | 存疑违规 | 标记警告，继续执行但记录 |
| **< 60%** | 低风险 | 仅记录，不干预 |

### 4.2 置信度计算因子

| 因子 | 权重 | 说明 |
|------|------|------|
| 规则匹配度 | 50% | 违规条件匹配程度 |
| 证据完整性 | 30% |  supporting 证据是否充分 |
| 历史准确率 | 20% | 该规则历史误报率 |

**计算公式**:
```
confidence = (rule_match * 0.5) + (evidence_complete * 0.3) + (history_accuracy * 0.2)
```

### 4.3 决策流程

```
检测到潜在违规
    ↓
计算置信度
    ↓
置信度 > 90%? ──是──→ 立即熔断
    ↓否
置信度 >= 60%? ──是──→ 标记警告，记录日志
    ↓否
仅记录，不干预
```

---

## 五、熔断执行流程

### 5.1 标准熔断流程

```
┌─────────────────────────────────────────────────────────┐
│                    熔断执行流程                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 停止 (STOP)                                         │
│     • 立即暂停当前智能体执行                            │
│     • 阻止进一步的工具调用                              │
│                                                         │
│  2. 保存 (SAVE)                                         │
│     • 保存当前会话状态到 fuse-state.json                │
│     • 记录违规详情、置信度、触发规则                    │
│                                                         │
│  3. 告警 (ALERT)                                        │
│     • 向用户发送飞书告警消息                            │
│     • 包含违规详情和操作链接                            │
│                                                         │
│  4. 等待 (WAIT)                                         │
│     • 等待用户指示 (overrule 或整改)                    │
│     • 超时 (24h) 后自动终止任务                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 熔断状态文件

**文件位置**: `.tasks/{session-id}/fuse-state.json`

**文件内容**:
```json
{
  "session_id": "REQ-001-task-001",
  "fuse_status": "fused",
  "trigger_rule": "VIO-002",
  "confidence": 95,
  "trigger_time": "2026-03-27T10:30:00Z",
  "current_stage": "resolution",
  "violation_details": "未生成 execution blueprint 直接进入 resolution",
  "missing_files": [
    "specs/requirements.md",
    "specs/design.md",
    "specs/tasks.md",
    "specs/acceptance-criteria.md"
  ],
  "user_overrule": null,
  "recovery_time": null
}
```

### 5.3 飞书告警消息格式

```markdown
🚨 宪法规范熔断告警

**会话 ID**: REQ-001-task-001
**违规规则**: VIO-002 (无蓝图执行)
**置信度**: 95%
**触发时间**: 2026-03-27 10:30:00
**当前阶段**: resolution

**违规详情**:
未生成 execution blueprint 直接进入 resolution 阶段

**缺失文件**:
- specs/requirements.md
- specs/design.md
- specs/tasks.md
- specs/acceptance-criteria.md

**处理建议**:
1. 查看会话详情：[链接]
2. 选择：强制继续 / 整改后继续 / 终止任务

**操作链接**:
- [强制继续] {overrule-url}
- [整改后继续] {fix-url}
- [终止任务] {abort-url}
```

---

## 六、恢复机制

### 6.1 用户 Overrule 流程

```
用户收到告警
    ↓
点击操作链接
    ↓
选择处理方式
    ├─ 强制继续 → 填写理由 → 记录 overrule → 恢复执行
    ├─ 整改后继续 → 整改完成 → 重新检查 → 恢复执行
    └─ 终止任务 → 记录原因 → 任务标记 failed
```

### 6.2 Overrule 记录

**记录位置**: `.tasks/{session-id}/fuse-state.json` 的 `user_overrule` 字段

**记录内容**:
```json
{
  "user_overrule": {
    "user_id": "ou_xxx",
    "decision": "force_continue",
    "reason": "业务紧急，先执行后补文档",
    "timestamp": "2026-03-27T11:00:00Z"
  }
}
```

### 6.3 恢复执行标记

恢复执行后，任务文件添加标记:
```markdown
## 熔断恢复记录

- **熔断时间**: 2026-03-27 10:30:00
- **恢复时间**: 2026-03-27 11:00:00
- **恢复方式**: 用户 overrule (强制继续)
- **overrule 理由**: 业务紧急，先执行后补文档
- **标记**: ⚠️ 用户豁免
```

### 6.4 超时处理

| 超时时间 | 处理方式 |
|----------|----------|
| 24 小时无响应 | 自动终止任务，标记为 `failed (fuse timeout)` |
| 告警发送失败 | 重试 3 次，仍失败则记录日志并继续监控 |

---

## 七、与审计智能体集成

### 7.1 职责更新

审计智能体 (`agents/constitution/audit/AGENTS.md`) 增加以下职责:

1. **实时熔断执行**: 每 30 秒轮询任务状态，检测违规
2. **熔断决策**: 根据置信度决定是否熔断
3. **告警通知**: 发送飞书告警消息
4. **恢复管理**: 处理用户 overrule，记录恢复理由
5. **审计报告**: 将熔断事件写入审计报告

### 7.2 审计报告格式

审计报告增加熔断事件章节:

```markdown
## 🚨 熔断事件

| 时间 | 会话 ID | 违规规则 | 置信度 | 处理方式 | 恢复时间 |
|------|---------|----------|--------|----------|----------|
| 2026-03-27 10:30 | REQ-001-task-001 | VIO-002 | 95% | 用户 overrule | 11:00 |

### 熔断详情 (REQ-001-task-001)
- **违规描述**: 无蓝图执行
- **处理过程**: 用户选择强制继续
- **overrule 理由**: 业务紧急，先执行后补文档
```

### 7.3 熔断统计

审计周报/月报增加熔断统计:

| 指标 | 本周 | 本月 | 累计 |
|------|------|------|------|
| 熔断次数 | X | Y | Z |
| 用户 overrule 次数 | X | Y | Z |
| 平均响应时间 | X 秒 | Y 秒 | Z 秒 |
| 误报率 | X% | Y% | Z% |

---

## 八、性能要求

| 指标 | 要求 | 验证方法 |
|------|------|----------|
| 熔断响应时间 | < 30 秒 | 从违规发生到熔断执行的时间 |
| 轮询准确率 | > 99% | 轮询成功次数/总轮询次数 |
| 误报率 | < 5% | 误报次数/总熔断次数 |
| 告警送达率 | > 99% | 告警成功发送次数/总告警次数 |

---

## 九、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| V1.0 | 2026-03-27 | 初始版本 | 需求解决智能体 |

---

## 十、参考文档

- `agents/docs/specs/constitution/CONSTITUTION.md` - 宪法规范总览
- `agents/docs/specs/constitution/HARD_GATE_SPEC.md` - Hard Gate 规范
- `agents/docs/specs/constitution/audit/REGRESSION_TEST_SPEC.md` - 回归测试规范
- `agents/constitution/audit/AGENTS.md` - 审计智能体工作规范

---

**规范状态**: 已生效  
**生效日期**: 2026-03-27  
**下次审查**: 2026-04-27
