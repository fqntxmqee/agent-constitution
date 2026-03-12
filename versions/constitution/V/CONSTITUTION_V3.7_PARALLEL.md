# 宪法 V3.7 补充规范 - 需求级并行架构

**版本**: V3.7.1  
**生效日期**: 2026-03-10  
**状态**: ✅ 已确认

---

## 🎯 核心原则

### 需求级并行（Requirement-Level Parallelism）

1. **并行单位**: 需求（Requirement）是并行的基本单位
2. **需求隔离**: 每个需求有独立的 5 个智能体子 agent，需求间完全隔离
3. **顺序流转**: 单个需求内部，5 个智能体按顺序流转（澄清→理解→解决→验收→交付）
4. **主会话协调**: 主会话负责需求调度、子 agent spawn、结果汇总

---

## 📊 架构设计

### 整体架构

```
主会话（需求调度器）
│
├─ 需求 A（P0 技能开发）
│   ├─ clarification-reqA-001
│   ├─ understanding-reqA-001
│   ├─ resolution-reqA-001 (+ 可能 spawn 多个并行开发子 agent)
│   ├─ acceptance-reqA-001
│   └─ delivery-reqA-001
│
├─ 需求 B（Dashboard 开发）
│   ├─ clarification-reqB-001
│   ├─ understanding-reqB-001
│   ├─ resolution-reqB-001 (+ 可能 spawn 多个并行开发子 agent)
│   ├─ acceptance-reqB-001
│   └─ delivery-reqB-001
│
└─ 需求 C...
    └─ ...
```

### 需求状态机

```
[新建] → [澄清中] → [理解中] → [解决中] → [验收中] → [交付中] → [已完成]
           ↓            ↓            ↓            ↓            ↓
      (用户确认)   (用户确认)   (持续开发)   (验收报告)   (部署完成)
```

---

## 🔄 标准工作流程（并行版）

### 完整流程（需求不够明确时）

```
1. 用户下达需求 → 主会话创建需求记录（req-A）
   ↓
2. 主会话 spawn clarification-reqA-001
   ↓
3. clarification-reqA-001 → 意图识别 + 路由决策 → 产出《澄清提案》
   ↓
4. 主会话汇总 → 用户确认提案
   ↓
5. 主会话 spawn understanding-reqA-001
   ↓
6. understanding-reqA-001 → 产出 OpenSpec（proposal/specs/design/tasks）
   ↓
7. 主会话汇总 → 用户确认蓝图
   ↓
8. 主会话 spawn resolution-reqA-001
   ↓
9. resolution-reqA-001 → 按 tasks.md 执行
   ├─ 可 spawn 多个 resolution-reqA-002/003/... 并行开发不同技能
   └─ 所有子 agent 使用 runtime="acp" + Cursor CLI
   ↓
10. resolution-reqA-xxx 完成 → 主会话 spawn acceptance-reqA-001
    ↓
11. acceptance-reqA-001 → 独立验收 → 生成验收报告
    ├─ 可 spawn 多个 acceptance-reqA-002/003/... 并行验收不同模块
    ↓
12. 验收通过 → 主会话 spawn delivery-reqA-001
    ↓
13. delivery-reqA-001 → Git 提交 + 部署 + 交付报告
    ↓
14. 主会话汇总 → 汇报给用户 → 需求 A 标记为 [已完成]
```

### 快速流程（需求已明确时）

```
用户 → 主会话 spawn clarification-taskA-001 → 用户确认快速流
     → 主会话 spawn understanding-taskA-001（休眠）
     → 主会话 spawn resolution-taskA-001 → 验收 → 交付
```

---

## 📋 智能体职责（并行架构）

### 1. 需求澄清智能体 (requirement-clarification)

| 维度 | 说明 |
|------|------|
| **子 agent 命名** | `clarification-{reqId}-001` |
| **runtime** | `subagent`（轻量分析任务） |
| **职责** | 分析当前需求的模糊性，产出澄清清单 |
| **产出** | 《澄清提案》+ 路由决策（标准流/快速流） |
| **并行策略** | 单个需求只 spawn 1 个澄清子 agent |

### 2. 需求理解智能体 (requirement-understanding)

| 维度 | 说明 |
|------|------|
| **子 agent 命名** | `understanding-{reqId}-001` |
| **runtime** | `subagent` 或 `acp`（复杂设计用 acp） |
| **职责** | 将需求转化为 OpenSpec 规约 |
| **产出** | proposal.md, specs/requirements.md, design.md, tasks.md |
| **并行策略** | 单个需求只 spawn 1 个理解子 agent |

### 3. 需求解决智能体 (requirement-resolution) ⭐

| 维度 | 说明 |
|------|------|
| **子 agent 命名** | `resolution-{reqId}-001/002/...` |
| **runtime** | **`acp`（强制）** + Cursor CLI |
| **职责** | 按 tasks.md 执行开发任务 |
| **产出** | 代码 + 执行记录 + 自测报告 |
| **并行策略** | **可 spawn 多个子 agent 并行开发**（如 9 个技能同时开发） |
| **并发限制** | 每个需求最多 5 个并行开发子 agent |

### 4. 需求验收智能体 (requirement-acceptance)

| 维度 | 说明 |
|------|------|
| **子 agent 命名** | `acceptance-{reqId}-001/002/...` |
| **runtime** | `acp`（可能需要浏览器自动化） |
| **职责** | 独立验收交付物，与规约逐项核对 |
| **产出** | 验收报告（通过/不通过 + 证据） |
| **并行策略** | 可 spawn 多个子 agent 并行验收不同模块 |

### 5. 需求交付智能体 (requirement-delivery)

| 维度 | 说明 |
|------|------|
| **子 agent 命名** | `delivery-{reqId}-001` |
| **runtime** | `subagent`（Git/部署操作） |
| **职责** | Git 提交 + 部署 + 交付报告 |
| **产出** | 交付报告 + Git 提交记录 + 部署链接 |
| **并行策略** | 单个需求只 spawn 1 个交付子 agent |

---

## 🎮 主会话职责

### 需求管理

1. **需求创建**: 接收用户需求，创建需求记录（唯一 requirementId）
2. **需求追踪**: 维护需求状态机（新建→澄清→理解→解决→验收→交付→完成）
3. **需求汇总**: 汇总各子 agent 产出，呈现给用户

### 子 Agent 管理

1. **Spawn 执行**: 根据需求当前阶段，spawn 对应智能体的子 agent
2. **状态监控**: 通过 `subagents list` 监控子 agent 状态
3. **结果收集**: 通过 `sessions_history` 获取子 agent 产出

### 用户交互

1. **关键节点确认**: 意图确认、蓝图确认、部署确认
2. **进展汇报**: 定期汇报多需求进展
3. **异常通知**: 需求阻塞/失败时通知用户

---

## 📊 需求状态管理

### 需求记录结构

```json
{
  "requirementId": "req-A",
  "name": "P0 核心技能开发",
  "status": "in_progress",
  "currentStage": "requirement-resolution",
  "createdAt": "2026-03-10T06:30:00+08:00",
  "updatedAt": "2026-03-10T06:45:00+08:00",
  "subagents": [
    {
      "name": "clarification-reqA-001",
      "status": "completed",
      "output": "clarification-confirmed.md"
    },
    {
      "name": "understanding-reqA-001",
      "status": "completed",
      "output": "openspec/changes/p0-skills-development/"
    },
    {
      "name": "resolution-reqA-001",
      "status": "in_progress",
      "output": null
    }
  ],
  "artifacts": {
    "proposal": "openspec/changes/p0-skills-development/proposal.md",
    "specs": "openspec/changes/p0-skills-development/specs/requirements.md",
    "design": "openspec/changes/p0-skills-development/design.md",
    "tasks": "openspec/changes/p0-skills-development/tasks.md"
  }
}
```

### 需求状态枚举

| 状态 | 说明 | 触发条件 |
|------|------|----------|
| `pending` | 等待启动 | 需求创建后 |
| `clarifying` | 澄清中 | spawn 澄清子 agent 后 |
| `understanding` | 理解中 | 用户确认澄清后 |
| `resolving` | 解决中 | 用户确认蓝图后 |
| `accepting` | 验收中 | 解决完成后 |
| `delivering` | 交付中 | 验收通过后 |
| `completed` | 已完成 | 交付完成后 |
| `blocked` | 阻塞 | 等待用户确认/外部依赖 |
| `failed` | 失败 | 子 agent 执行失败 |

---

## 🔍 进展追踪（progress-tracking）

### 多需求监控

| 检查项 | 频率 | 说明 |
|--------|------|------|
| 活跃需求列表 | 每 30 分钟 | 列出所有 status != completed/failed 的需求 |
| 子 agent 状态 | 每 30 分钟 | 检查各需求的子 agent 运行状态 |
| 超时检测 | 每 30 分钟 | 单个子 agent 运行>60 分钟标记为超时 |
| 阻塞检测 | 每 30 分钟 | 需求在 blocked 状态>24 小时通知用户 |

### 汇报格式

```markdown
## 📊 进展汇报 (HH:MM)

### 活跃需求
| 需求 ID | 名称 | 当前阶段 | 运行时长 | 状态 |
|---------|------|----------|----------|------|
| req-A | P0 核心技能开发 | resolving | 2h30m | 🟢 进行中 |
| req-B | Agent Monitor Dashboard | resolving | 45m | 🟢 进行中 |

### 子 agent 状态
| 需求 | 子 agent | 类型 | 运行时长 | 状态 |
|------|----------|------|----------|------|
| req-A | resolution-reqA-003 | acp | 1h | 🟢 开发中 |
| req-A | resolution-reqA-004 | acp | 50m | 🟢 开发中 |

### 阻塞/超时
- 无 / 列出问题
```

---

## 🔍 审计规范（audit）

### 多需求审计

| 审计项 | 检查点 | 违规等级 |
|--------|--------|----------|
| 规约先行 | 需求是否有 proposal+specs+design+tasks | 🔴 严重 |
| runtime 合规 | resolution 子 agent 是否使用 `acp` | 🔴 严重 |
| Cursor CLI | resolution 是否仅用 `cursor agent --print` | 🟡 一般 |
| 独立验收 | acceptance 是否独立验证（非自查） | 🔴 严重 |
| 用户确认 | 意图/蓝图/部署是否经用户确认 | 🔴 严重 |

### 审计报告

- **频率**: 每 2 小时
- **范围**: 所有活跃需求
- **输出**: `agents/constitution/audit/reports/YYYY-MM-DD-HHMM.md`

---

## 💭 总结反思（summary-reflection）

### 触发条件

1. **需求完成**: 任意需求 status → completed
2. **每日总结**: 每日 23:00
3. **周期性**: 每 8 小时（可选）

### 反思内容

1. **需求级反思**: 单个需求的亮点/问题/改进
2. **多需求对比**: 并行需求间的效率对比
3. **知识沉淀**: 可复用的经验/模板/脚本

---

## ⚠️ 并发控制

### 全局限制

| 资源 | 限制 | 说明 |
|------|------|------|
| 活跃需求总数 | ≤10 个 | 避免资源耗尽 |
| 每个需求的 resolution 子 agent | ≤5 个 | 避免 Cursor 过载 |
| 全局 acp 子 agent 总数 | ≤15 个 | 系统资源限制 |

### 会话锁问题与解决方案（V3.7.2 · 2026-03-10）

#### 问题描述

**现象**: 多个子 agent 并发访问同一会话文件导致锁竞争（timeout 10000ms）

**根因**: OpenClaw 默认会话文件结构为：
```
~/.openclaw/agents/{agent-id}/sessions/
└── {session-id}.jsonl.lock  ← 所有子 agent 共享同一锁文件
```

当多个子 agent 同时访问同一 agent 的会话文件时，会发生锁竞争。

**影响**:
- 子 agent 执行失败
- 需要手动清理锁文件并重启
- 延长执行时间约 30-60 分钟

#### 解决方案对比

| 方案 | 描述 | 优点 | 缺点 | 状态 |
|------|------|------|------|------|
| **方案 A** | 限制并发数（每需求≤2 个） | 简单，无需修改代码 | 并行度降低 | ✅ 当前采用 |
| **方案 B** | 增加锁超时时间（10s→30s） | 临时缓解 | 不解决根本问题 | ⚠️ 临时方案 |
| **方案 C** | 独立会话目录 | 彻底解决锁竞争 | 需要修改 OpenClaw 配置 | 📋 待实现 |

#### 方案 C：独立会话目录（推荐）

**实现方式**:
```
~/.openclaw/agents/{agent-id}/sessions/
├── {requirement-id}-{subagent-id}-001/
│   └── session.jsonl
├── {requirement-id}-{subagent-id}-002/
│   └── session.jsonl
└── ...
```

**配置更新**:
```json
{
  "sessionIsolation": true,
  "sessionPattern": "{requirement-id}-{subagent-id}-{sequence}",
  "sessionLockTimeout": 30000
}
```

**实施步骤**:
1. 修改 OpenClaw 配置（`~/.openclaw/openclaw.json`）
2. 更新 `sessions_spawn` 工具支持独立会话
3. 测试验证无锁竞争
4. 更新文档和培训材料

#### 当前最佳实践

**并发策略**:
- 每需求最多 2 个并发子 agent（避免锁竞争）
- 串行执行关键任务（如验收、交付）
- 监控锁竞争日志，及时清理

**配置示例**:
```json
{
  "parallelism": {
    "maxConcurrentRequirements": 10,
    "maxSubagentsPerRequirement": 2,
    "sessionLockTimeout": 30000
  }
}
```

**监控指标**:
- 锁竞争次数（目标：0）
- 会话超时次数（目标：0）
- 子 agent 失败率（目标：<1%）

### 需求优先级

当达到并发限制时，按优先级调度：

1. **P0**: 阻塞其他需求的关键需求
2. **P1**: 用户明确高优先级的需求
3. **P2**: 普通需求（默认）
4. **P3**: 低优先级/探索性需求

---

## 📝 经验教训（2026-03-10）

### 文件锁问题回顾

**时间**: 2026-03-10 08:22-12:00  
**影响**: 10+ 次锁竞争超时，延长执行时间约 1 小时  
**临时解决**: 清理锁文件 + 限制并发数

**长期解决方案**:
1. ✅ 文档更新（本章节）
2. ⏳ 配置更新（独立会话目录）
3. ⏳ 工具更新（sessions_spawn 支持独立会话）
4. ⏳ 监控告警（锁竞争检测）

**参考文档**:
- 版本控制流程：`VERSION_CONTROL_AND_BACKUP_PROCESS.md`
- 宪法规范迭代流程：`CONSTITUTION_ITERATION_PROCESS.md`

---

## 📁 文件存放规范

### 需求产物

```
openspec/changes/{projectId}/
├── proposal.md
├── specs/requirements.md
├── design.md
├── tasks.md
├── (开发产出：代码等)
├── ACCEPTANCE_REPORT.md
└── DELIVERY_REPORT.md
```

### 子 agent 日志

```
agents/constitution/{agent-id}/logs/
└── {requirementId}/
    ├── {subagent-name}.log
    └── output.md
```

### 审计报告

```
agents/constitution/audit/reports/
├── YYYY-MM-DD-HHMM.md
└── ...
```

### 总结报告

```
agents/constitution/summary-reflection/reports/
├── req-{requirementId}-summary.md
└── YYYY-MM-DD-daily.md
```

---

## 🔗 参考文档

- 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 智能体列表：`agents/constitution/README.md`
- 架构文档：`agents/docs/architecture/SIX_AGENT_ARCHITECTURE.md`
- 工作流程：`agents/docs/architecture/WORKFLOW.md`

---

**规范版本**: V3.7.1  
**创建日期**: 2026-03-10  
**确认人**: 伏开
