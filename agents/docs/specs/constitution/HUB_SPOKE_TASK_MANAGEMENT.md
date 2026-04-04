# Hub-Spoke 任务协同与管理模式子规范

**规范版本**: V3.17.0  
**生效日期**: 2026-04-05  
**状态**: ✅ 已生效  
**所属宪法**: 智能体协同系统宪法规范 V3.17.0

---

## 📋 概述

本规范定义了 Hub-Spoke + Master-Worker 混合模式的任务协同架构，解决以下核心问题：

1. **任务感知不到** — 大总管任务指派方式不统一，目标智能体无法可靠感知任务
2. **任务状态不透明** — 任务丢失、重复处理、状态不明
3. **任务与需求关联缺失** — 多智能体协同时上下文不连续

---

## 🏗️ 架构设计

### Hub-Spoke + Master-Worker 混合模式

```
银河导航员（Hub / Coordinator）
    ├── 并发派发 → 需求澄清智能体（Spoke）
    │               ├── Subagent 1 → REQ-001 需求澄清
    │               └── Subagent 2 → REQ-002 需求澄清
    ├── 并发派发 → 需求理解智能体（Spoke）
    │               ├── Subagent 3 → REQ-001 需求理解
    │               └── 触发 → 杠精本精 🎭（红蓝推演）→ 挑战设计方案
    ├── 并发派发 → 需求解决智能体（Spoke）
    │               ├── Subagent 4 → REQ-001 开发执行
    │               └── 触发 → Bug 猎人 🏹（调试专家）→ 可调试性审查
    ├── 并发派发 → 需求验收智能体（Spoke）
    │               └── Subagent 5 → REQ-001 验收测试
    ├── 并发派发 → 需求交付智能体（Spoke）
    │               └── Subagent 6 → REQ-001 交付发布
    └── 并发派发 → 总结反思智能体（Spoke）
                    └── Subagent 7 → 复盘报告
```

**角色分工**：
- **Hub（银河导航员）**：全局协调、**并发派发**、状态总览、流程控制
- **Spoke（各智能体）**：接收任务、**并行执行**、上报状态、产出文件
- **Master-Worker**：复杂任务中，Spoke 可 spawn 多个 Subagent（Worker）并行处理

### 并发处理能力

**大总管并发派发能力**：
- ✅ **并发派发** - 同时 `sessions_send` 给所有智能体（不等待）
- ✅ **独立会话** - 每个智能体有独立飞书会话（互不阻塞）
- ✅ **异步回报** - 各智能体完成后主动回报（异步收集）

**智能体并行执行能力**：
- ✅ **简单任务** - 直接执行（快速完成）
- ✅ **复杂任务** - spawn subagent（不阻塞主会话）
- ✅ **并行处理** - 多个智能体同时执行不同任务

**并发效果对比**：
| 模式 | 派发方式 | 执行方式 | 5 个任务总耗时 |
|------|---------|---------|---------------|
| 串行 | 等待上一个完成 | 顺序执行 | ~25 分钟 |
| 并发派发 + 串行执行 | ✅ 同时派发 | ❌ 阻塞主会话 | ~15-20 分钟 |
| 并发派发 + 并行执行 | ✅ 同时派发 | ✅ subagent 执行 | ~5-8 分钟 |

---

## ⚡ 1 分钟响应保障机制

### 响应时间分解（端到端 ≤ 60 秒）

| 阶段 | 时长 | 说明 |
|------|------|------|
| 1. 派发 | ≤10s | Hub `sessions_send` 完成，消息发出 |
| 2. 确认 | ≤10s | Spoke 收到消息，立即发送确认 ACK |
| 3. Spawn | ≤10s | Spoke 调用 `sessions_spawn` 启动 subagent |
| 4. 执行 | ≤20s | subagent 执行任务（简单任务） |
| 5. 回报 | ≤10s | Spoke 通过 `sessions_send` 回报结果 |
| **总计** | **≤60s** | 全链路目标 |

### 快速响应模式（按复杂度分级）

| 复杂度 | 目标响应时间 | 说明 |
|--------|-------------|------|
| C 级 | ≤10s | 极简单任务，直接执行 |
| B 级 | ≤30s | 轻度复杂，预估执行时间 |
| A 级 | ≤60s | 复杂任务，并发执行 |
| S 级 | ≤60s + 降级 | 超复杂任务，允许降级回报 |

### 超时熔断机制

| 超时阈值 | 触发动作 | 后果 |
|---------|---------|------|
| **10s 无确认** | Hub 标记任务为 `⚠️ 超时确认` | 重新派发或降级处理 |
| **30s 无进展** | Spoke 返回**二级降级**：部分结果 + 状态 | 主会话不阻塞，继续其他任务 |
| **60s 超时** | 触发**熔断**，任务标记 `🔴 熔断` | 审计记录，Hub 决策重试/取消/上报 |

### 降级策略（三级）

| 级别 | 触发条件 | 返回内容 |
|------|---------|---------|
| **一级降级** | 30s 无进展 | `{ status: "processing", progress: "50%", partial: true }` |
| **二级降级** | 60s 超时 | `{ status: "degraded", result: "partial", suggestion: "..." }` |
| **三级降级** | 主动取消 | `{ status: "cancelled", reason: "...", nextAction: "..." }` |

### 1 分钟 SLA 代码模板

```javascript
// Hub 侧：派发任务（≤10s）
async function dispatchWithSLA(sessionKey, task, timeoutMs = 60000) {
  const startTime = Date.now();
  
  // 1. 派发（≤10s）
  sessions_send(sessionKey, `执行 ${task.id}`);
  
  // 2. 等待确认或超时（≤10s）
  const ack = await waitForAck(sessionKey, 10000);
  if (!ack) markTimeout(task.id, 'no_ack');
  
  // 3. 等待结果或降级（≤60s）
  const result = await waitForResult(sessionKey, timeoutMs);
  if (result.status === 'degraded') {
    // 记录降级，启动补偿
    triggerCircuitBreaker(task.id);
  }
  return result;
}

// Spoke 侧：快速确认 + 异步执行（≤60s）
async function handleTask(task) {
  // 1. 立即确认（≤10s）
  sessions_send(hubKey, `{ status: "acknowledged", time: ${Date.now()} }`);
  
  // 2. 立即 spawn 执行（不阻塞，≤10s）
  const subagent = sessions_spawn('subagent', { task });
  
  // 3. 监听结果，超时降级（≤60s）
  subagent.on('complete', (result) => {
    sessions_send(hubKey, `{ status: "completed", result }`);
  });
  
  subagent.on('timeout', () => {
    sessions_send(hubKey, `{ status: "degraded", partial: true }`);
  });
}
```

### 1 分钟 SLA 效果对比

| 指标 | 无 SLA（串行阻塞） | 有 SLA（并发 + 降级） |
|------|------------------|---------------------|
| 5 个任务总耗时 | ~25 分钟 | ~1-2 分钟 |
| 平均响应时间 | 不确定 | ≤60s |
| 超时熔断 | 无 | ✅ 有（30s/60s） |
| 降级保障 | 无 | ✅ 三级降级 |
| 主会话阻塞 | 严重 | ✅ 几乎无 |

---

## ⏱ 双模式 SLA：快速响应（1 分钟）vs 标准响应（5 分钟）

### 双模式总览

| 维度 | 快速响应（1 分钟） | 标准响应（5 分钟） |
|------|------------------|-------------------|
| **适用场景** | 简单任务/独立任务/C-B 级需求 | 配合大总管的完整任务/A-S 级需求 |
| **目标响应** | ≤60s 端到端 | ≤5 分钟端到端 |
| **确认时限** | ≤10s | ≤30s |
| **超时熔断** | 30s 无进展 → 降级；60s → 熔断 | 2min 无进展 → 降级；5min → 熔断 |
| **降级策略** | 三级降级（处理中/降级/取消） | 三级降级（处理中/降级/取消） |
| **派发模式** | 并发派发 + 并行执行 | 串行派发 + 流水线执行 |
| **回报频率** | 一次性完整回报 | 分段进度回报（每分钟一次） |

### 快速响应模式（1 分钟）：适用场景

- **C 级任务**：极简单任务，直接执行无需拆解
- **独立任务**：不依赖其他智能体输出的任务
- **查询类任务**：文档检索、配置查询、状态确认
- **修复类任务**：小 bug 修复、配置调整
- **单智能体任务**：只需要单个智能体完成的工作

**时间分解（≤60s）**：

| 阶段 | 时长 | 说明 |
|------|------|------|
| 1. 派发 | ≤10s | Hub `sessions_send` 完成 |
| 2. 确认 | ≤10s | Spoke 立即发送确认 ACK |
| 3. Spawn | ≤10s | Spoke 启动 subagent |
| 4. 执行 | ≤20s | subagent 执行（简单任务） |
| 5. 回报 | ≤10s | Spoke 回报结果 |
| **合计** | **≤60s** | |

### 标准响应模式（5 分钟）：适用场景

- **A 级任务**：复杂任务，需拆解为多个步骤
- **S 级任务**：超复杂任务，多智能体协同
- **流水线任务**：需按顺序经过多个智能体
- **大总管配合任务**：需大总管协调多智能体并行/串行
- **深度分析任务**：需要多轮思考和验证
- **多智能体协同**：需 2+ 智能体配合完成

**时间分解（≤5 分钟）**：

| 阶段 | 时长 | 说明 |
|------|------|------|
| 1. 派发 | ≤30s | Hub `sessions_send` 完成 |
| 2. 确认 | ≤30s | Spoke 确认任务开始 |
| 3. 计划 | ≤60s | Spoke 分析并制定执行计划 |
| 4. 执行 | ≤3min | subagent 执行（含子步骤） |
| 5. 回报 | ≤60s | Spoke 汇报完整结果 |
| **合计** | **≤5 分钟** | |

### 智能体选择策略（按任务类型推荐模式）

| 任务类型 | 推荐模式 | 理由 |
|---------|---------|------|
| 简单查询/确认 | 快速响应（1 分钟） | 任务单一，执行快 |
| 小修复/配置调整 | 快速响应（1 分钟） | 改动小，复杂度低 |
| 文档撰写/整理 | 快速/标准均可 | 按复杂度选择 |
| 需求澄清 | 标准响应（5 分钟） | 需交互确认 |
| 需求理解/分析 | 标准响应（5 分钟） | 需深度分析 |
| 需求解决/开发 | 标准响应（5 分钟） | 需拆解和执行 |
| 需求验收/测试 | 标准响应（5 分钟） | 需验证和反馈 |
| 需求交付/部署 | 标准响应（5 分钟） | 需完整性检查 |
| 审计/合规检查 | 标准响应（5 分钟） | 需全面检查 |
| 总结反思/复盘 | 快速响应（1 分钟） | 相对独立 |
| 调试专家 | 标准响应（5 分钟） | 需追踪和分析 |
| 红蓝推演 | 标准响应（5 分钟） | 需多轮对抗模拟 |

### 超时熔断机制（两级超时 + 三级降级）

#### 两级超时

| 超时级别 | 触发条件 | 触发动作 | 后果 |
|---------|---------|---------|------|
| **一级超时** | 确认超时（快速 10s / 标准 30s） | Hub 标记 `⚠️ 超时确认` | 重新派发或降级 |
| **二级超时** | 执行超时（快速 60s / 标准 5min） | 触发熔断 `🔴` | 任务标记熔断，审计记录 |

#### 三级降级

| 级别 | 触发条件 | 返回内容 |
|------|---------|---------|
| **一级降级** | 30% 时间无进展 | `{ status: "processing", progress: "30%", partial: true }` |
| **二级降级** | 60% 时间无进展 | `{ status: "degraded", result: "partial", suggestion: "..." }` |
| **三级降级** | 主动取消或超时熔断 | `{ status: "cancelled", reason: "...", nextAction: "..." }` |

---

### 协同方式：文本 + 共享文件

```
1. 银河导航员接收需求（文本）
      ↓
2. 创建任务文件，发送给目标智能体
      ↓
3. 目标智能体执行任务（渠道相关，见下方「渠道实现差异」）
      ↓
4. 智能体产出文件到 .tasks/ 目录
      ↓
5. 智能体回报银河导航员：
   「✅ 完成了 xxx，📄 产出 .tasks/xxx/proposal.md」
      ↓
6. 银河导航员把「文件路径」发给下一步的智能体
      ↓
7. 继续流转...
```

---

## 📡 渠道实现差异

### 飞书渠道（支持持久会话）

**实现方式**: `sessions_send(sessionKey: "agent:{agent-id}:feishu:...", message: "...")`

```
银河导航员 🧭 (Hub) - 飞书主会话
    │
    │ 1️⃣ 派发任务给智能体
    │ sessions_send(
    │   sessionKey: "agent:requirement-clarification:feishu:...",
    │   message: "执行 REQ-DAILY-TEST-20260328 task-001；任务所在路径为：.tasks/requirement-clarification/REQ-{ID}/task-{序号}.md"
    │ )
    │
    ▼
需求澄清 🎯 (Spoke) - 飞书持久会话
    │
    │ 2️⃣ 读取任务文件
    │ read → .tasks/requirement-clarification/REQ-{ID}/task-{序号}.md
    │
    │ 3️⃣ 执行任务
    │ 生成 proposal.md
    │
    │ 4️⃣ 更新任务状态
    │ edit → task-{序号}.md (pending → running → completed)
    │
    │ 5️⃣ 回报结果
    │ sessions_send(sessionKey: "agent:main:feishu:...", message: "✅ task-001 完成...")
    │
    ▼
银河导航员 🧭 → sessions_send 触发下一个智能体
```

**优势**:
- ✅ 智能体有独立持久会话（飞书渠道）
- ✅ 会话可复用，上下文连续
- ✅ 通过 `sessions_send` 实现 Hub-Spoke 双向通信
- ✅ 任务派发和回报都通过统一的会话消息机制

**代码示例**:
```javascript
// 银河导航员派发任务给需求澄清智能体
sessions_send(
  sessionKey: "agent:requirement-clarification:feishu:requirement-clarification:direct:ou_xxx",
  message: "执行 REQ-DAILY-TEST-20260328 task-001；任务所在路径为：.tasks/requirement-clarification/REQ-{ID}/task-{序号}.md"
)

// 银河导航员派发任务给需求理解智能体
sessions_send(
  sessionKey: "agent:requirement-understanding:feishu:requirement-understanding:direct:ou_xxx",
  message: "执行 REQ-DAILY-TEST-20260328 task-002；任务所在路径为：.tasks/requirement-clarification/REQ-{ID}/task-{序号}.md"
)

// 智能体回报结果给银河导航员
sessions_send(
  sessionKey: "agent:main:feishu:main:direct:ou_bb71789cc6f5dfec51e6603c6dace502",
  message: "✅ task-001 完成\n📄 产出：.tasks/requirement-clarification/REQ-DAILY-TEST-20260328/proposal.md"
)
```

**会话 Key 格式**:
```
agent:{agent-id}:feishu:{account-id}:direct:{user-open-id}
```

**会话 Key 示例**:
| 智能体 | 会话 Key |
|--------|---------|
| 银河导航员 | `agent:main:feishu:main:direct:ou_bb71789cc6f5dfec51e6603c6dace502` |
| 需求澄清 | `agent:requirement-clarification:feishu:requirement-clarification:direct:ou_xxx` |
| 需求理解 | `agent:requirement-understanding:feishu:requirement-understanding:direct:ou_xxx` |
| 需求解决 | `agent:requirement-resolution:feishu:requirement-resolution:direct:ou_xxx` |
| 需求验收 | `agent:requirement-acceptance:feishu:requirement-acceptance:direct:ou_xxx` |
| 需求交付 | `agent:requirement-delivery:feishu:requirement-delivery:direct:ou_xxx` |

---

### 并发派发模式（推荐）

**大总管并发派发代码模板**：
```javascript
// 1️⃣ 准备任务列表
const tasks = [
  { agent: 'requirement-clarification', task: 'task-001', sessionKey: 'agent:requirement-clarification:feishu:...' },
  { agent: 'requirement-understanding', task: 'task-002', sessionKey: 'agent:requirement-understanding:feishu:...' },
  { agent: 'requirement-resolution', task: 'task-003', sessionKey: 'agent:requirement-resolution:feishu:...' },
  { agent: 'requirement-acceptance', task: 'task-004', sessionKey: 'agent:requirement-acceptance:feishu:...' },
  { agent: 'requirement-delivery', task: 'task-005', sessionKey: 'agent:requirement-delivery:feishu:...' },
];

// 2️⃣ 并发派发（不等待）
const pendingTasks = new Set();
tasks.forEach(({ agent, task, sessionKey }) => {
  sessions_send(sessionKey: sessionKey, message: `执行 REQ-001 ${task}`);
  pendingTasks.add(agent);
  console.log(`📨 已派发 ${agent} - ${task}`);
  // ⚠️ 不等待！继续派发下一个
});

// 3️⃣ 异步收集回报
// 每个智能体完成后会通过 sessions_send 主动回报
// 当收到回报时，从 pendingTasks 移除
// 当 pendingTasks 为空时，所有任务完成

// 4️⃣ 汇总状态
console.log(`📊 待完成任务：${Array.from(pendingTasks).join(', ')}`);
```

**并发效果对比**：
| 模式 | 派发方式 | 执行方式 | 5 个任务总耗时 |
|------|---------|---------|---------------|
| 串行 | 等待上一个完成 | 顺序执行 | ~25 分钟 |
| 并发派发 + 串行执行 | ✅ 同时派发 | ❌ 阻塞主会话 | ~15-20 分钟 |
| 并发派发 + 并行执行 | ✅ 同时派发 | ✅ subagent 执行 | ~5-8 分钟 |

---

### webchat 渠道（不支持持久会话）

**实现方式**: `openclaw agent --agent red-team-simulation --message "执行 REQ-DAILY-TEST-20260328 task-002"`

```
银河导航员 🧭 (Hub) - webchat 会话
    │
    │ 1️⃣ 派发任务
    │ openclaw agent --agent red-team-simulation --message ""
    │
    ▼
需求澄清 🎯 (Spoke) - 临时子会话
    │
    │ 2️⃣ 读取任务文件
    │ read → .tasks/requirement-clarification/REQ-{ID}/task-{序号}.md
    │
    │ 3️⃣ 执行任务
    │ 生成 proposal.md
    │
    │ 4️⃣ 更新任务状态
    │ edit → task-{序号}.md
    │
    │ 5️⃣ 回报结果
    │ 通过 subagent_announce 工具回报
    │
    │ 6️⃣ 会话结束
    │ 临时子会话自动清理
    │
    ▼
银河导航员 🧭 → 触发下一个智能体（新的 sessions_spawn）
```

**优势**:
- ✅ 简单直接，无需管理持久会话
- ✅ 任务完成后自动清理
- ✅ 适合一次性任务

**限制**:
- ❌ 无法复用会话
- ❌ 不支持 `sessions_send`（无持久会话）
- ❌ 上下文不连续

---

### 渠道选择建议

| 场景 | 推荐渠道 | 实现方式 |
|------|----------|----------|
| 生产环境/日常任务 | 飞书 | `openclaw agent --agent` |
| 测试/临时任务 | webchat | `sessions_spawn(mode: "run")` |
| 需要上下文连续 | 飞书 | `openclaw agent --agent` |
| 简单一次性任务 | webchat | `sessions_spawn(mode: "run")` |

---

## 📁 文件结构规范

### 任务文件目录结构

```
workspace/
  └── .tasks/
        ├── index.md                              # 全局任务总览
        └── {agent-id}/                           # 按智能体分目录
              └── REQ-{需求ID}/                    # 按需求分目录
                    ├── meta.md                    # 需求元数据（可选）
                    ├── task-{序号}.md              # 任务文件（状态在内容里）
                    └── task-{序号}.md              # 同需求可有多个任务
```

**示例**：
```
.tasks/
├── index.md
├── requirement-clarification/
│   └── REQ-001/
│       └── task-001.md
├── requirement-understanding/
│   └── REQ-001/
│       └── task-002.md
└── requirement-resolution/
    └── REQ-001/
        ├── task-003.md
        └── task-004.md
```

### 任务文件格式

每个任务文件（`task-{序号}.md`）遵循以下格式：

```markdown
# 任务

- **需求ID**: REQ-001
- **任务ID**: task-001
- **智能体**: requirement-clarification
- **创建时间**: 2026-03-25 09:30
- **状态**: pending
- **任务描述**: 对用户需求进行澄清分析
- **规约路径**: project/{项目}/changes/{需求}/  ← 必填（开发任务）
- **上游产出**: story/REQ-001-blueprint.md  ← 必填（如有上游）
- **建议执行方式**: acp  ← 可选（acp|subagent|tools）
- **产出文件**: —
- **完成时间**: —
- **备注**: —
```

**字段说明**：

| 字段 | 必填 | 说明 |
|------|------|------|
| 需求ID | ✅ | `REQ-{全局自增序号}`，如 `REQ-001` |
| 任务ID | ✅ | `task-{全局自增序号}`，如 `task-001` |
| 智能体 | ✅ | 目标智能体 ID（如 `requirement-clarification`） |
| 创建时间 | ✅ | ISO 格式或 `YYYY-MM-DD HH:mm` |
| 状态 | ✅ | 见「状态可选值」 |
| 任务描述 | ✅ | 简要描述任务内容 |
| **规约路径** | ⚠️ | **开发任务必填**，指定规约所在目录 |
| **上游产出** | ⚠️ | **有上游时必填**，引用上游产出文件路径 |
| **建议执行方式** | ⬜ | 可选，最终执行方式由智能体自主选择 |
| 产出文件 | ⬜ | 任务完成后填写产出文件路径 |
| 完成时间 | ⬜ | 任务完成或失败后填写 |
| 备注 | ⬜ | 失败原因、取消理由等 |

**⚠️ 规约路径说明**：
- 开发任务（requirement-resolution）**必须填写**规约路径
- 规约路径用于智能体读取 specs/requirements.md、design.md、tasks.md 等
- 格式：`project/{项目名}/changes/{需求名}/`

### 状态可选值

| 状态 | 图标 | 说明 |
|------|------|------|
| `pending` | ⏳ | 任务已创建，等待智能体处理 |
| `running` | 🔄 | 智能体正在处理中 |
| `completed` | ✅ | 任务已完成，产出文件已就绪 |
| `failed` | ❌ | 任务失败，备注中附失败原因 |
| `blocked` | 🚫 | 任务被阻塞（等待外部依赖/用户输入） |
| `cancelled` | 🚫 | 任务已取消（由银河导航员或用户决定） |

### 全局索引文件（`.tasks/index.md`）

全局索引按需求分组，展示所有任务的当前状态：

```markdown
# 任务总览

## REQ-001（用户双人对战功能）
| 任务ID | 智能体 | 状态 | 产出 |
|--------|--------|------|------|
| task-001 | requirement-clarification | ✅ 完成 | story/REQ-001-blueprint.md |
| task-002 | requirement-understanding | 🔄 进行中 | — |
| task-003 | requirement-resolution | ⏳ 待处理 | — |

## REQ-002（xxx功能）
| 任务ID | 智能体 | 状态 | 产出 |
|--------|--------|------|------|
| task-004 | requirement-clarification | ⏳ 待处理 | — |
```

---

## 🔄 任务生命周期

### 任务 ID 分配

- **任务 ID 由银河导航员预分配**：在创建任务文件和 index.md 条目时即生成
- **需求 ID 由银河导航员分配**：首次收到用户需求时分配 `REQ-{全局自增序号}`
- **序号全局自增**：task-001, task-002, task-003...（跨需求递增）

### 标准任务流程

```
1. 银河导航员接收需求
   → 分配需求 ID（REQ-xxx）
   → 创建任务目录：.tasks/{agent-id}/REQ-{ID}/
   → 创建任务文件：task-{序号}.md（状态：pending）
   → 更新 index.md（新增条目，状态：⏳ 待处理）
   → 发送任务给目标智能体（via sessions_send）

2. 目标智能体接收任务
   → 更新任务文件（状态：pending → running）
   → 更新 index.md（状态：🔄 进行中）
   → Spawn subagent 执行任务

3. 任务完成
   → 更新任务文件：
     - 状态：running → completed
     - 产出文件：{文件路径}
     - 完成时间：{时间}
   → 更新 index.md（状态：✅ 完成）
   → 回报银河导航员：
     「✅ task-{ID} 完成
      📄 产出：{文件路径}
      📝 说明：{简要描述}」

4. 银河导航员流转到下一智能体
   → 创建新任务文件（引用上游产出）
   → 继续流转...
```

### 任务失败处理

```
智能体执行失败
   → 更新任务文件：
     - 状态：running → failed
     - 完成时间：{时间}
     - 备注：{失败原因}
   → 更新 index.md（状态：❌ 失败）
   → 回报银河导航员：
     「❌ task-{ID} 失败
      📝 原因：{失败原因}
      💡 建议：{可选的改进建议}」

银河导航员收到失败报告后：
   → 决策：重试（创建新任务）/ 取消 / 上报用户
```

### 任务超时处理

- **默认超时**：30 分钟（可按任务类型调整）
- **超时检测**：银河导航员或催更小助手定期检查
- **超时处理**：
  1. 银河导航员发送确认消息给目标智能体
  2. 智能体回复当前状态
  3. 如无响应，标记任务为 `failed`（备注：超时无响应）

### 任务取消机制

```
银河导航员发送取消指令
   → 更新任务文件（状态：→ cancelled，备注：取消原因）
   → 更新 index.md（状态：🚫 已取消）
   → 通知目标智能体停止工作
```

### 并行子任务上限

- 规范上限：每个智能体最多 **5 个并行子任务**
- 当前运行建议：每需求默认 **≤2 个并行子任务**（降低会话锁竞争风险）
- 超过上限时，新任务排队等待（状态：pending）

---

## 🔗 与 Story File 的互补关系

Hub-Spoke Task Management 与 Story File 是**互补关系**，解决不同维度的问题：

| 维度 | Story File (`story/state.md`) | Hub-Spoke Task Management (`.tasks/`) |
|------|-------------------------------|---------------------------------------|
| **定位** | 需求开发过程的上下文容器 | 任务分配与状态跟踪 |
| **视角** | **需求视角**（一个需求的完整生命周期） | **任务视角**（谁在做什么任务） |
| **核心关注** | 需求进展到哪个阶段、上下文如何传递 | 任务状态、有没有阻塞、谁在做 |
| **粒度** | 按需求（一个需求一份 state.md） | 按任务（一个任务一个文件） |
| **使用场景** | 智能体交接时读取上下文 | 银河导航员分配任务、智能体回报状态 |

### 关联方式

两者通过**需求 ID**（`REQ-xxx`）关联：
- Story File 记录需求的完整生命周期和上下文
- Task Management 记录需求下每个任务的分配和状态
- 两者的 ID 一致（`REQ-xxx`），方便交叉引用

### 示例

**Story File 记录**（`story/state.md`）：
```markdown
# REQ-001 状态
- 当前阶段: requirement-resolution
- 上下文: 用户想要双人对战功能
- 关键决策: 使用 WebSocket 而非 HTTP（DEC-xxx）
```

**Task Management 记录**（`.tasks/requirement-resolution/REQ-001/task-003.md`）：
```markdown
# 任务
- **需求ID**: REQ-001
- **任务ID**: task-003
- **智能体**: requirement-resolution
- **状态**: running
- **产出文件**: —
```

---

## 📋 协同格式约定

| 规范项 | 内容 |
|--------|------|
| **需求 ID 命名** | `REQ-{全局自增序号}`，如 `REQ-001` |
| **任务 ID 命名** | `task-{全局自增序号}`，如 `task-001` |
| **文件命名** | `story/{需求ID}-{阶段}.md`，如 `story/REQ-001-blueprint.md` |
| **阶段标记** | 每份文件头部注明 `阶段: requirement-resolution` 等 |
| **完成报告格式** | `✅ 完成: {任务}\n📄 产出: {文件路径}\n📝 说明: {简要描述}` |
| **共享目录** | 统一放在 `workspace/project/*/story/` 下 |
| **文件保留** | 中间产物至少保留到任务交付后 7 天 |

---

## 📐 任务层级结构

```
需求（REQ-001）
  ├── 任务 1 → 需求澄清智能体（进行中）
  ├── 任务 2 → 需求理解智能体（待处理）
  ├── 任务 3 → 需求解决智能体（待处理）
  ├── 任务 4 → 需求验收智能体（待处理）
  └── 任务 5 → 需求交付智能体（待处理）
```

**关键设计**：
- 一个需求，多个智能体协同
- 一个智能体，对同一个需求可能有多个任务
- 每个任务必须关联需求 ID

---

## ⚠️ 银河导航员职责（Hub 角色）

### 任务分发协议

1. **预分配任务 ID**：创建任务文件时即分配唯一 task-{序号}
2. **创建任务文件**：在 `.tasks/{agent-id}/REQ-{ID}/` 目录下创建 `task-{序号}.md`
3. **更新全局索引**：在 `.tasks/index.md` 中添加新任务条目
4. **发送任务指令**：通过 `sessions_send` 将任务信息发送给目标智能体
5. **监控任务状态**：定期检查 index.md 和各任务文件状态
6. **处理异常**：任务失败时决策重试、取消或上报用户

### 任务流转决策

银河导航员根据当前任务完成状态，决定下一步流转：
- 上游任务 `completed` → 创建下游任务并分派
- 上游任务 `failed` → 决策重试或取消
- 多个并行任务 → 等待全部完成后再流转

---

## ⚠️ 智能体职责（Spoke 角色）

### 任务接收与上报协议

每个智能体（Spoke）必须遵循：

1. **接收任务**：通过 `sessions_send` 接收银河导航员分派的任务
2. **Spawn subagent 执行**（⚠️ 铁律）：
   - **业务代码必须由 subagent 产出**
   - **禁止智能体本身直接 write 业务代码**
   - 通过 `sessions_spawn(runtime="acp"| "subagent")` 分派给 Worker
3. **更新状态**：
   - 开始处理时：`pending` → `running`
   - 完成时：`running` → `completed`
   - 失败时：`running` → `failed`（附原因）
4. **实时更新 index.md**：每次状态变化时同步更新全局索引
5. **回报结果**：完成或失败时向银河导航员发送格式化报告（含执行确认）

### 完成报告格式

```
✅ task-{ID} 完成
📄 产出：{文件路径}
📝 说明：{简要描述}

【执行确认】
- 执行方式：{acp|subagent|tools}
- spawn subagent 数量：{N}
- 是否直接 write 业务代码：否
```

### 失败报告格式

```
❌ task-{ID} 失败
📝 原因：{失败原因}
💡 建议：{可选的改进建议}
```

---

## 🆕 附录 A：并发派发与并行执行增强

### A.1 大总管并发派发能力（核心能力）

**大总管并发派发能力**：
- ✅ **并发派发** - 同时 `sessions_send` 给所有智能体（不等待回应）
- ✅ **独立会话** - 每个智能体有独立飞书会话（互不阻塞）
- ✅ **异步回报** - 各智能体完成后主动回报（异步收集汇总）

**并发派发实现要点**：
```javascript
// 1. 准备任务列表
const tasks = [
  { agent: 'requirement-clarification', task: 'task-001', sessionKey: '...' },
  { agent: 'requirement-understanding', task: 'task-002', sessionKey: '...' },
  { agent: 'requirement-resolution', task: 'task-003', sessionKey: '...' },
];

// 2. 并发派发（核心：不等待！逐个发送后立即继续）
const pendingTasks = new Set();
tasks.forEach(({ agent, task, sessionKey }) => {
  sessions_send(sessionKey: sessionKey, message: `执行 REQ-001 ${task}`);
  pendingTasks.add(agent);
  console.log(`📨 已派发 ${agent} - ${task}`);
  // ⚠️ 关键：这里不 await！立即派发下一个
});

// 3. 异步收集回报
// 每个智能体完成后通过 sessions_send 主动回报
// pendingTasks 为空时，所有任务完成
```

### A.2 并发效果对比

| 模式 | 派发方式 | 执行方式 | 5个任务总耗时 | 效率提升 |
|------|---------|---------|--------------|----------|
| 串行 | 等待上一个完成 | 顺序执行 | ~25 分钟 | 基准 |
| 并发派发 + 串行执行 | ✅ 同时派发 | ❌ 阻塞主会话 | ~15-20 分钟 | ~33% |
| 并发派发 + 并行执行 | ✅ 同时派发 | ✅ subagent 执行 | ~5-8 分钟 | ~70-75% |

**并行执行收益分析**：
- 串行：5 任务 × 5 分钟/任务 = 25 分钟
- 并发派发 + 并行执行：派发 1 分钟 + 并行执行 5 分钟 + 汇总 2 分钟 = ~8 分钟
- **关键瓶颈**：子任务间无依赖时，优先并行；强依赖时串行执行

---

## 🆕 附录 B：1 分钟响应保障（核心 SLA）

### B.1 响应时间分解

**1 分钟 = 60 秒 = 5 个阶段之和**：

| 阶段 | 最大耗时 | 说明 |
|------|---------|------|
| 派发 | ≤ 10 秒 | 银河导航员解析需求 → sessions_send 全部派发完毕 |
| 确认 | ≤ 10 秒 | 目标智能体接收并确认任务（回复"已收到，正在执行"） |
| spawn | ≤ 10 秒 | 智能体 spawn subagent，开始执行 |
| 执行 | ≤ 20 秒 | subagent 执行任务（复杂任务可延长，需提前回报进度） |
| 回报 | ≤ 10 秒 | 执行结果回报银河导航员（sessions_send） |
| **合计** | **≤ 60 秒** | **1 分钟响应 SLA** |

### B.2 快速响应模式（按复杂度分级）

| 复杂度 | 响应目标 | 执行策略 |
|--------|---------|---------|
| **C/B 级** | ≤ 10 秒 | 直接执行，无需 spawn subagent |
| **A 级** | ≤ 30 秒 | spawn 1 个 subagent，并行执行 |
| **S 级** | ≤ 60 秒 | spawn 多个 subagent，并行处理；分段回报进度 |

### B.3 超时熔断机制（三级熔断）

| 熔断级别 | 超时阈值 | 触发条件 | 处理方式 |
|---------|---------|---------|---------|
| **L1 熔断** | 10 秒 | 派发后 10 秒无确认 | 发送确认催单，仍可继续 |
| **L2 熔断** | 30 秒 | 30 秒无进度回报 | 降级处理：简化流程或更换执行路径 |
| **L3 熔断** | 60 秒 | 60 秒未完成 | 立即熔断：停止执行，上报用户决策 |

**超时熔断流程**：
```
任务派发（计时开始）
    ↓
10s 内确认？──否──→ L1：发送催单
    ↓是
30s 内进度回报？──否──→ L2：降级处理
    ↓是
60s 内完成回报？──否──→ L3：熔断停止，上报用户
    ↓是
任务完成 ✅
```

### B.4 大总管 SLA 执行规范

**银河导航员必须保证**：
1. **派发不阻塞**：sessions_send 发出后立即继续，不等待确认
2. **异步收集**：通过 pendingTasks Set 跟踪所有已派发任务
3. **超时追踪**：每个任务独立计时，超时立即触发熔断
4. **降级策略**：L2 熔断时自动切换到简化执行路径

---

## 📚 参考文档

- **宪法主规范**: `agents/docs/specs/constitution/CONSTITUTION.md`
- **Story File 规范**: `agents/docs/specs/constitution/story/STORY_FILE_SPEC.md`
- **团队角色图谱**: `agents/constitution/TEAM_ROLES.md`
- **银河导航员规范**: `agents/constitution/GALAXY_NAVIGATOR.md`

---

_最后更新：2026-04-05 — V3.17.0 Hub-Spoke 任务协同与管理模式（9 大智能体）_
