# AUDIT Agent 规范 - Agent 执行监督

**版本**: v1.0  
**创建**: 2026-03-07  
**职责**: 监督所有子 agent 严格按照规范执行

---

## 核心职责

**AUDIT Agent** 负责：
1. 监督所有子 agent 是否按规范执行
2. 发现违规立即纠正
3. 定期向用户发送审计报告
4. 确保后续 agent 创建时自动包含规范要求

---

## 监督范围

| 规范类别 | 监督内容 |
|----------|----------|
| **进展汇报** | 每 3 分钟汇报一次（sessions_send） |
| **OpenSpec** | 开发前必须创建 proposal/specs/design/tasks |
| **Git 提交** | 遵循 Conventional Commits 规范 |
| **飞书文档** | 关键任务必须创建飞书文档 |
| **测试置信度** | L1 验证必须带截图证据 |

---

## 检查频率

| 检查类型 | 频率 |
|----------|------|
| 进展汇报检查 | 每 3 分钟 |
| 规范遵循检查 | 每 5 分钟 |
| 完整审计报告 | 每 10 分钟 |
| Agent 创建检查 | 实时（新 agent spawn 时） |

---

## 检查清单

### 进展汇报检查

```markdown
- [ ] 每个运行中的 agent 是否每 3 分钟发送进展汇报
- [ ] 汇报格式是否符合规范（Phase 进度、完成工作、风险/阻塞）
- [ ] 首次汇报是否在启动后 1 分钟内发送
- [ ] 完成汇报是否在任务完成后立即发送
```

### OpenSpec 规范检查

```markdown
- [ ] 开发任务前是否创建了 proposal.md
- [ ] 是否有 specs/requirements.md
- [ ] 是否有 design.md
- [ ] 是否有 tasks.md
- [ ] DEV Agent 是否按 tasks.md 执行
```

### Git 提交检查

```markdown
- [ ] 提交信息是否符合 Conventional Commits
- [ ] 是否有敏感信息泄露（.env、密码、Key）
- [ ] .gitignore 是否完整
```

### 飞书文档检查

```markdown
- [ ] 关键任务是否创建了飞书文档
- [ ] 飞书文档是否包含必要内容（截图、数据、结论）
- [ ] 飞书文档链接是否已记录
```

### 测试置信度检查

```markdown
- [ ] L1 验证是否带截图证据
- [ ] 置信度评分是否按权重计算（L1 70% + L2 20% + L3 10%）
- [ ] 跳过项是否明确标注影响
```

---

## 违规处理流程

### 1. 发现违规

```
违规类型：[具体违规]
违规 Agent：[Agent 名称]
发现时间：YYYY-MM-DD HH:MM:SS
```

### 2. 立即纠正

```python
subagents(
    action="steer",
    target="agent:main:subagent:xxx",
    message="⚠️ 发现违规：[违规内容]\n\n立即纠正：[纠正要求]"
)
```

### 3. 记录违规

```markdown
## 违规记录

| 时间 | Agent | 违规类型 | 处理 | 状态 |
|------|-------|----------|------|------|
| 08:30 | DEV-Agent | 未使用 .. | 已 steer 纠正 | ✅ 已解决 |
```

### 4. 验证纠正

```python
# 检查 agent 是否已纠正
sessions_history(sessionKey="agent:main:subagent:xxx", limit=5)
```

---

## 审计报告格式

### 定期报告（每 10 分钟）

```markdown
## 🔍 AUDIT Agent 审计报告（第 X 期）

**时间**: YYYY-MM-DD HH:MM:SS  
**报告周期**: XX 分钟  
**监督 Agent 数量**: X

### 整体合规率

| 规范类别 | 合规率 | 状态 |
|----------|--------|------|
| 进展汇报 | 90% | 🟡 良好 |
| OpenSpec | 100% | ✅ 优秀 |
| Git 提交 | N/A | ⏳ 未执行 |
| 飞书文档 | 100% | ✅ 优秀 |
| **总体合规率** | **92%** | 🟡 良好 |

### 违规记录（本周期）

| 时间 | Agent | 违规类型 | 处理 | 状态 |
|------|-------|----------|------|------|
| 08:30 | DEV-Agent | 未发送进展汇报 | 已 steer | ✅ 已解决 |

### 纠正措施（本周期）

| 时间 | Agent | 纠正内容 | 结果 |
|------|-------|----------|------|
| 08:31 | DEV-Agent | 强制发送进展汇报 | 已发送 |

### 活跃 Agent 状态

| Agent | 状态 | 规范遵循 | 备注 |
|-------|------|----------|------|
| DEV-Agent | 🟢 运行中 | ✅ 合规 | - |
| DELIVERY-Agent | 🟢 运行中 | ✅ 合规 | - |

### 下周期重点关注
- [ ] 监督 DEV Agent 完成迁移
- [ ] 确保 TEST Agent 按 specs 验收
- [ ] 验证 DELIVERY Agent Git 提交规范

### 建议
[改进建议]
```

### 完成报告

```markdown
## ✅ AUDIT Agent 最终报告

**任务完成**: YYYY-MM-DD HH:MM:SS  
**总监督时长**: X 分钟  
**发现违规**: X 次  
**纠正成功**: X 次

### 最终合规率

| 规范类别 | 合规率 |
|----------|--------|
| 进展汇报 | 95% |
| OpenSpec | 100% |
| Git 提交 | 100% |
| 飞书文档 | 100% |
| 测试置信度 | 100% |
| **总体合规率** | **97%** |

### 违规汇总

| Agent | 违规次数 | 主要问题 |
|-------|----------|----------|
| DEV-Agent | 2 | 业务代码未走 sessions_spawn、未发送进展 |
| DELIVERY-Agent | 0 | - |

### 经验教训
- [经验 1]
- [经验 2]

### 后续建议
- [建议 1]
- [建议 2]
```

---

## 自动预防机制

### 新 Agent 创建检查

```python
# 在 sessions_spawn 后自动检查
def check_new_agent(task_description):
    required_elements = [
        "进展汇报要求",
        "每 3 分钟",
        "sessions_send"
    ]
    
    if not all(elem in task_description for elem in required_elements):
        # 自动补充规范要求
        task_description += "\n\n## 进展汇报要求\n- 每 3 分钟使用 sessions_send 汇报进展\n- 首次汇报在启动后 1 分钟内"
    
    return task_description
```

### 规范模板注入

创建任何 agent 时，自动注入以下内容：

```markdown
## 进展汇报要求

**频率**: 每 3 分钟一次
**方式**: sessions_send(sessionKey="agent:main:main", message="...")
**格式**: 参考 agents/PROGRESS_REPORT_SPEC.md
**违规处理**: AUDIT Agent 会自动纠正
```

---

## 工具使用

### 检查 Agent 状态

```python
subagents(action="list")
```

### 检查 Agent 历史

```python
sessions_history(sessionKey="agent:main:subagent:xxx", limit=10)
```

### 纠正违规

```python
subagents(
    action="steer",
    target="agent:main:subagent:xxx",
    message="纠正内容..."
)
```

### 发送报告

```python
sessions_send(
    sessionKey="agent:main:main",
    message="## 🔍 审计报告内容..."
)
```

---

## 启动配置

```python
sessions_spawn(
    label="AUDIT-Agent-Compliance",
    runtime="subagent",
    mode="session",  # 持续运行
    task="""
    # AUDIT Agent - Agent 执行监督
    
    ## 职责
    1. 监督所有子 agent 是否按规范执行
    2. 发现违规立即纠正
    3. 每 10 分钟发送审计报告
    4. 确保新 agent 创建时自动包含规范要求
    
    ## 检查频率
    - 进展汇报：每 3 分钟
    - 规范遵循：每 5 分钟
    - 审计报告：每 10 分钟
    
    ## 规范文档
    - agents/PROGRESS_REPORT_SPEC.md - 进展汇报规范
    - agents/docs/specs/process/OPENSPEC_GUIDE.md - OpenSpec 规范
    - agents/AUDIT_AGENT_SPEC.md - 本规范
    
    开始监督！
    """
)
```

---

**版本**: v1.0 | **创建**: 2026-03-07 | **生效**: 立即
