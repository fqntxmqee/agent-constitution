# 周期性支撑智能体配置

> 这3个智能体独立于具体任务，持续周期性运行，提供全局监控与治理

---

## 📋 智能体列表

| Agent ID | 运行周期 | 触发方式 | 职责 |
|----------|----------|----------|------|
| `progress-tracking` | 每 30 分钟 | Heartbeat / Cron | 监控所有任务进展，识别阻塞 |
| `audit` | 每 2 小时 + 任务完成 | Heartbeat / Event | 合规检查，规约先行验证 |
| `summary-reflection` | 任务完成 + 每日 23:00 | Event / Cron | 复盘分析，知识沉淀 |

---

## 🔄 进展跟进智能体 (progress-tracking)

### 运行周期
- **默认**: 每 30 分钟
- **任务密集期**: 每 10 分钟（有活跃子智能体时）
- **静默期**: 每 60 分钟（无活跃任务时）

### 职责
1. **监控子智能体状态**
   - 使用 `subagents list` 或 `sessions_list` 获取活跃会话
   - 记录每个子智能体的：
     - 启动时间
     - 当前任务
     - 运行时长
     - 状态（运行中/已完成/失败）

2. **进展汇报**
   - 向主会话发送进展摘要
   - 识别超时任务（>30 分钟无进展）
   - 识别阻塞问题

3. **周期总结触发**
   - 当任务完成时，触发 `summary-reflection`
   - 移交完整日志给总结智能体

### 输出格式
```markdown
## 📊 进展汇报 (HH:MM)

### 活跃任务
| 任务 | 智能体 | 运行时长 | 状态 |
|------|--------|----------|------|
| xxx | requirement-resolution | 15 分钟 | 🟢 进行中 |

### 阻塞问题
- 无 / 列出问题

### 下一步
- 预计 XX 分钟后完成
```

### 触发方式
**Heartbeat 配置 (HEARTBEAT.md):**
```markdown
### 进展跟进（每 30 分钟）
- 检查活跃子智能体：`subagents list --recentMinutes=60`
- 汇报进展摘要
- 识别超时/阻塞任务
```

---

## 🔍 审计智能体 (audit)

### 运行周期
- **定期审计**: 每 2 小时
- **任务审计**: 每个任务完成后
- **专项审计**: 用户请求时

### 职责
1. **合规检查**
   - ✅ 规约先行：检查是否有 proposal.md + specs/ + tasks.md
   - ✅ Cursor CLI 使用：需求解决是否仅用 cursor agent --print
   - ✅ 独立验收：是否有 requirement-acceptance 验收报告
   - ✅ 部署规范：Git 提交是否符合 Conventional Commits

2. **审计报告**
   - 通过/不通过/待整改
   - 列出违规项及证据
   - 整改建议

3. **监督改进**
   - 跟踪整改进度
   - 确认改进后标记为已解决

### 审计检查清单
```markdown
## 审计检查项

### 规约合规
- [ ] 有 proposal.md
- [ ] 有 specs/requirements.md
- [ ] 有 design.md
- [ ] 有 tasks.md
- [ ] 规约经用户确认

### 开发合规
- [ ] 需求解决仅用 cursor agent --print
- [ ] 无 write 直接写业务代码
- [ ] 任务按 tasks.md 顺序执行

### 验收合规
- [ ] 有独立验收智能体报告
- [ ] 验收逐项核对规约
- [ ] 验收通过后才交付

### 交付合规
- [ ] Git 提交规范
- [ ] 有交付报告
- [ ] 飞书文档同步
```

### 触发方式
**Heartbeat 配置 (HEARTBEAT.md):**
```markdown
### 审计检查（每 2 小时）
- 检查 openspec/changes/ 下新增项目
- 审计规约合规性
- 审计报告保存到 agents/audit/reports/
```

---

## 💭 总结反思智能体 (summary-reflection)

### 运行周期
- **任务总结**: 每个任务完成后
- **每日总结**: 23:00
- **周总结**: 周日 22:00

### 职责
1. **日志分析**
   - 收集周期内所有子智能体会话历史
   - 分析关键决策点
   - 识别成功模式和问题

2. **亮点沉淀**
   - 提炼可复用的技能/模式
   - 更新 AGENTS.md 或 TOOLS.md
   - 创建 SKILLS 文档

3. **改进建议**
   - 问题根因分析
   - 流程改进建议
   - **必须用户确认后才能生效**

### 输出格式
```markdown
## 📝 总结反思报告

### 周期
2026-03-09 00:00 - 23:59

### 亮点
1. ✅ 规约先行执行良好
2. ✅ Cursor CLI 使用规范

### 问题
1. ❌ 需求验收智能体未及时启动
2. ❌ 进展跟进未配置周期性运行

### 改进建议
1. 配置 progress-tracking 为周期性 Agent
2. 更新 HEARTBEAT.md 添加自动触发

### 知识沉淀
- 新技能：`periodic-agents-config.md`
- 更新文档：`WORKFLOW.md`
```

### 触发方式
**Heartbeat 配置 (HEARTBEAT.md):**
```markdown
### 每日总结（23:00）
- 触发 summary-reflection 智能体
- 分析当日所有任务
- 产出日报
```

---

## 🔧 配置方式

### 方式 1: Heartbeat 触发（推荐）

更新 `HEARTBEAT.md`：

```markdown
# HEARTBEAT.md

## 周期性任务配置

### 进展跟进（每 30 分钟）
- 运行：`subagents list --recentMinutes=60`
- 汇报活跃任务状态
- 识别超时/阻塞

### 审计检查（每 2 小时）
- 检查 openspec/changes/ 新增项目
- 审计规约合规性
- 记录审计报告

### 每日总结（23:00）
- 触发 summary-reflection
- 分析当日任务
- 产出日报
```

### 方式 2: Cron 触发

创建 cron 配置（如使用系统 cron 或 OpenClaw 内置调度）。**详细说明与 launchd 方案**见 → `agents/constitution/SCHEDULING_SUPPORT_AGENTS.md`；工作区提供一键脚本 `scripts/install-support-agents-cron.sh`。

```bash
# 进展跟进 - 每 30 分钟
*/30 * * * * openclaw agent --agent progress-tracking --message "执行进展汇报"

# 审计检查 - 每 2 小时
0 */2 * * * openclaw agent --agent audit --message "执行周期性审计"

# 每日总结 - 每天 23:00
0 23 * * * openclaw agent --agent summary-reflection --message "执行每日总结"
```

### 方式 3: 事件触发

在主会话中，任务完成后自动触发：

```python
# 任务完成后
sessions_spawn(
    agentId="audit",
    task=f"审计项目 {project_name} 的合规性"
)

sessions_spawn(
    agentId="summary-reflection",
    task=f"总结项目 {project_name} 的经验教训"
)
```

---

## 📊 监控面板

### 活跃任务监控
```bash
# 查看最近 1 小时活跃的子智能体
subagents list --recentMinutes=60
```

### 审计报告查看
```bash
# 查看最新审计报告
ls -lt agents/audit/reports/ | head -5
```

### 总结报告查看
```bash
# 查看每日总结
ls -lt agents/summary-reflection/reports/ | head -5
```

---

## 🚨 异常处理

### 进展跟进发现超时
```
如果任务运行 >60 分钟：
1. 标记为"可能阻塞"
2. 通知主会话
3. 建议用户介入或重启
```

### 审计发现违规
```
如果发现违规（如无规约开发）：
1. 记录违规项
2. 标记项目为"待整改"
3. 通知主会话和用户
4. 暂停后续流程直到整改
```

### 总结发现系统性问题
```
如果发现系统性问题：
1. 记录问题根因
2. 提出改进方案
3. 提交用户确认
4. 用户确认后更新规范
```

---

## 📁 文件结构

```
agents/constitution/
├── PERIODIC_AGENTS_CONFIG.md    # 本配置文件
├── progress-tracking/
│   ├── SOUL.md
│   ├── AGENTS.md
│   └── reports/                 # 进展报告
├── audit/
│   ├── SOUL.md
│   ├── AGENTS.md
│   └── reports/                 # 审计报告
└── summary-reflection/
    ├── SOUL.md
    ├── AGENTS.md
    └── reports/                 # 总结报告
```

---

**配置版本**: 1.0  
**创建日期**: 2026-03-09  
**状态**: 待启用
