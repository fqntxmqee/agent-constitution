# 审计报告模板 V3.9.0

**用途**: 标准化审计报告格式，确保信息完整、可读性强  
**版本**: 3.9.0  
**遵循**: 智能体协同系统宪法规范 V3.9.0

---

## 📋 模板 1：实时告警（Critical）

```markdown
## 🚨 审计告警

**时间**: {{timestamp}}  
**等级**: 🔴 Critical  
**类型**: {{check_category}}  
**检查项**: {{check_id}}

---

### ⚠️ 问题描述

{{problem_description}}

### 🎯 影响范围

| 维度 | 详情 |
|------|------|
| 影响智能体 | {{affected_agents}} |
| 影响会话 | {{affected_sessions}} |
| 影响项目 | {{affected_projects}} |
| 风险等级 | {{risk_level}} |

### 🔧 处置建议

1. {{action_1}}
2. {{action_2}}
3. {{action_3}}

### 🛑 熔断状态

**状态**: {{fuse_status}}  
**熔断时间**: {{fuse_time}}  
**恢复条件**: {{recovery_conditions}}

---

**操作**: [查看详细报告]({{report_link}}) | [确认误报]({{overrule_link}})
```

---

## 📋 模板 2：每日审计报告

```markdown
# 🔍 每日审计报告

**日期**: {{date}}  
**审计智能体**: 规则守护者 🛡️  
**报告类型**: 每日审计

---

## 📊 审计结论

{{#if critical_count > 0}}
**❌ 不通过** - 发现 {{critical_count}} 个 Critical 问题
{{else if high_count > 0}}
**⚠️ 待整改** - 发现 {{high_count}} 个 High 问题
{{else}}
**✅ 通过**
{{/if}}

| 等级 | 数量 | 较昨日 |
|------|------|--------|
| 🔴 Critical | {{critical_count}} | {{critical_delta}} |
| 🟡 High | {{high_count}} | {{high_delta}} |
| 🟢 Medium | {{medium_count}} | {{medium_delta}} |
| 🔵 Low | {{low_count}} | {{low_delta}} |
| ✅ Pass | {{pass_count}} | - |

---

## 🛡️ OpenClaw 安全检查

### Security Audit

**状态**: {{security_status}}

| 检查项 | 结果 | 说明 |
|--------|------|------|
| SEC-001 iMessage 群组策略 | {{sec_001_status}} | {{sec_001_detail}} |
| SEC-002 iMessage DM 策略 | {{sec_002_status}} | {{sec_002_detail}} |
| SEC-003 沙箱模式 | {{sec_003_status}} | {{sec_003_detail}} |
| SEC-004 文件系统限制 | {{sec_004_status}} | {{sec_004_detail}} |
| SEC-005 控制 UI 认证 | {{sec_005_status}} | {{sec_005_detail}} |
| SEC-006 API 密钥泄露 | {{sec_006_status}} | {{sec_006_detail}} |

### Health Check

**状态**: {{health_status}}

| 通道 | 状态 |
|------|------|
| iMessage | {{imessage_status}} |
| Feishu | {{feishu_status}} |
| 智能体加载 | {{agents_status}} |

### Doctor Check

**状态**: {{doctor_status}}

| 检查项 | 结果 |
|--------|------|
| 孤立事务文件 | {{orphan_files}} |
| 会话锁状态 | {{session_locks}} |
| 记忆搜索 | {{memory_search}} |

---

## 📋 智能体活动

| 智能体 | 会话数 | 错误数 | 合规率 | 状态 |
|--------|--------|--------|--------|------|
| main | {{main_sessions}} | {{main_errors}} | {{main_compliance}}% | {{main_status}} |
| audit | {{audit_sessions}} | {{audit_errors}} | {{audit_compliance}}% | {{audit_status}} |
| progress-tracking | {{progress_sessions}} | {{progress_errors}} | {{progress_compliance}}% | {{progress_status}} |
| summary-reflection | {{summary_sessions}} | {{summary_errors}} | {{summary_compliance}}% | {{summary_status}} |
| requirement-* | {{req_sessions}} | {{req_errors}} | {{req_compliance}}% | {{req_status}} |

---

## 📈 问题跟踪

### 新增问题

| ID | 等级 | 检查项 | 描述 | 状态 |
|----|------|--------|------|------|
| {{issue_id}} | {{level}} | {{check_id}} | {{description}} | {{status}} |

### 处理中问题

| ID | 等级 | 剩余时间 | 整改进度 |
|----|------|----------|----------|
| {{issue_id}} | {{level}} | {{time_remaining}} | {{progress}}% |

### 已关闭问题

| ID | 等级 | 关闭原因 | 修复时间 |
|----|------|----------|----------|
| {{issue_id}} | {{level}} | {{close_reason}} | {{fix_time}} |

---

## 🔧 整改建议

{{#if critical_count > 0}}
### 🔴 紧急（立即执行）

1. **{{critical_action_1}}**
   ```bash
   {{command_1}}
   ```

2. **{{critical_action_2}}**
   ```bash
   {{command_2}}
   ```
{{/if}}

{{#if high_count > 0}}
### 🟡 限期（24 小时内）

1. **{{high_action_1}}**
   - 责任人：{{assignee}}
   - 截止时间：{{due_date}}

2. **{{high_action_2}}**
   - 责任人：{{assignee}}
   - 截止时间：{{due_date}}
{{/if}}

{{#if medium_count > 0}}
### 🟢 建议（7 天内）

1. **{{medium_action_1}}**
   - 优先级：P2
   - 预计工时：{{hours}}h
{{/if}}

---

## 📊 趋势分析

### 问题趋势（近 7 天）

```
日期      Critical  High  Medium  Low
{{date_1}}    {{c1}}      {{h1}}    {{m1}}     {{l1}}
{{date_2}}    {{c2}}      {{h2}}    {{m2}}     {{l2}}
...
```

### 合规率趋势

```
日期      合规率
{{date_1}}    {{rate_1}}%
{{date_2}}    {{rate_2}}%
...
```

---

## 📅 明日重点

1. {{priority_1}}
2. {{priority_2}}
3. {{priority_3}}

---

**报告路径**: `{{report_path}}`  
**下次审计**: {{next_audit_time}}  
**生成时间**: {{generation_time}}
```

---

## 📋 模板 3：专项审计报告

```markdown
# 📋 专项审计报告

**项目**: {{project_name}}  
**审计时间**: {{audit_time}}  
**审计类型**: {{audit_type}}  
**审计智能体**: 规则守护者 🛡️

---

## 📖 审计范围

{{scope_description}}

### 覆盖内容

- [ ] 安全检查
- [ ] 合规检查
- [ ] 运行检查
- [ ] 行为检查

### 时间范围

{{start_time}} - {{end_time}}

---

## 🔍 审计方法

### 数据收集

| 来源 | 方式 | 数据量 |
|------|------|--------|
| 会话历史 | sessions_history | {{session_count}} 条 |
| 系统日志 | openclaw health | {{log_entries}} 条 |
| 配置文件 | config files | {{config_files}} 个 |
| 代码仓库 | git log | {{commits}} 个提交 |

### 检查清单

| 类别 | 检查项数 | 通过数 | 失败数 |
|------|----------|--------|--------|
| 安全 | {{security_checks}} | {{security_pass}} | {{security_fail}} |
| 合规 | {{compliance_checks}} | {{compliance_pass}} | {{compliance_fail}} |
| 运行 | {{operational_checks}} | {{operational_pass}} | {{operational_fail}} |
| 行为 | {{behavioral_checks}} | {{behavioral_pass}} | {{behavioral_fail}} |

---

## 📊 审计发现

### 问题汇总

| 序号 | 检查项 | 等级 | 问题描述 | 证据 |
|------|--------|------|----------|------|
| 1 | {{check_id}} | {{level}} | {{description}} | {{evidence_link}} |
| 2 | {{check_id}} | {{level}} | {{description}} | {{evidence_link}} |

### 详细发现

#### 发现 1: {{title}}

**检查项**: {{check_id}}  
**等级**: {{level}}

**现象**:
{{phenomenon_description}}

**证据**:
```
{{evidence_snippet}}
```

**影响**:
{{impact_description}}

**根因**:
{{root_cause}}

---

## 📈 风险评估

| 维度 | 评级 | 说明 |
|------|------|------|
| 可能性 | {{likelihood}} | {{likelihood_description}} |
| 影响程度 | {{impact}} | {{impact_description}} |
| 风险值 | {{risk_score}} | {{risk_formula}} |

---

## 🔧 整改建议

| 序号 | 建议 | 优先级 | 预计工时 | 责任人 |
|------|------|--------|----------|--------|
| 1 | {{action_1}} | P0 | {{hours_1}}h | {{assignee_1}} |
| 2 | {{action_2}} | P1 | {{hours_2}}h | {{assignee_2}} |

### 实施步骤

#### 步骤 1: {{step_1_title}}

```bash
{{command_1}}
```

**预期结果**: {{expected_result_1}}

#### 步骤 2: {{step_2_title}}

```bash
{{command_2}}
```

**预期结果**: {{expected_result_2}}

---

## ✅ 验收标准

- [ ] {{acceptance_criteria_1}}
- [ ] {{acceptance_criteria_2}}
- [ ] {{acceptance_criteria_3}}

---

## 📚 附录

### A. 检查清单详情

{{full_checklist}}

### B. 证据文件列表

| 文件 | 类型 | 路径 |
|------|------|------|
| {{file_1}} | {{type_1}} | {{path_1}} |
| {{file_2}} | {{type_2}} | {{path_2}} |

### C. 参考文档

- {{reference_1}}
- {{reference_2}}

---

**报告生成**: 规则守护者 🛡️  
**审核人**: {{reviewer}}  
**批准人**: {{approver}}
```

---

## 📋 模板 4：周报汇总

```markdown
# 📈 审计周报

**周期**: {{week_start}} - {{week_end}}  
**生成时间**: {{generation_time}}  
**审计智能体**: 规则守护者 🛡️

---

## 📊 本周概览

| 指标 | 数值 | 较上周 |
|------|------|--------|
| 审计执行次数 | {{audit_count}} | {{audit_delta}} |
| 发现问题总数 | {{issue_count}} | {{issue_delta}} |
| 熔断次数 | {{fuse_count}} | {{fuse_delta}} |
| 平均修复时间 | {{mttr}} | {{mttr_delta}} |
| 合规率 | {{compliance_rate}}% | {{compliance_delta}}% |

---

## 🔴 重点问题

### Critical 问题

| ID | 描述 | 发现时间 | 状态 |
|----|------|----------|------|
| {{issue_id}} | {{description}} | {{created_at}} | {{status}} |

### High 问题（未关闭）

| ID | 描述 | 剩余时间 | 进度 |
|----|------|----------|------|
| {{issue_id}} | {{description}} | {{time_remaining}} | {{progress}}% |

---

## 📈 趋势分析

### 问题趋势

```
        Critical  High  Medium  Low
Week N-2    {{c2}}     {{h2}}    {{m2}}    {{l2}}
Week N-1    {{c1}}     {{h1}}    {{m1}}    {{l1}}
Week N      {{c0}}     {{h0}}    {{m0}}    {{l0}}
```

### 合规率趋势

```
Week N-2: {{rate_2}}%
Week N-1: {{rate_1}}%
Week N:   {{rate_0}}%
```

---

## ✅ 已关闭问题

| ID | 等级 | 描述 | 修复时间 |
|----|------|------|----------|
| {{issue_id}} | {{level}} | {{description}} | {{fix_time}} |

---

## 📋 下周重点

1. {{priority_1}}
2. {{priority_2}}
3. {{priority_3}}

---

**报告路径**: `{{report_path}}`
```

---

## 🎯 使用说明

### 变量替换

所有 `{{variable_name}}` 格式的占位符需要在生成报告时替换为实际值。

### 条件渲染

```
{{#if condition}}
内容
{{/if}}
```

### 列表渲染

```
{{#each items}}
- {{this}}
{{/each}}
```

---

**版本**: 3.9.0  
**最后更新**: 2026-03-16  
**维护者**: 规则守护者 🛡️  
**对齐**: 宪法规范 V3.9.0
