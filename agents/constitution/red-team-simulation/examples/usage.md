# 红蓝推演智能体 - 使用示例

> **智能体**: 红蓝推演智能体 🎭  
> **用途**: 多视角分析、方案挑战、决策辅助  
> **触发**: 复杂度≥B 级自动触发，也可手动调用

---

## 🚀 快速开始

### 方式 1: 银河导航员自动触发

当任务复杂度≥B 级时，银河导航员会在需求理解和方案评审阶段自动触发红蓝推演。

```javascript
// 银河导航员内部调用
sessions_spawn({
  agentId: "red-team-simulation",
  task: "执行红蓝推演分析",
  attachments: [
    { name: "design.md", content: designDoc },
    { name: "context.json", content: taskContext }
  ]
})
```

### 方式 2: 手动触发

```bash
# 通过 OpenClaw CLI
openclaw agent --agent red-team-simulation --message "对以下设计进行红蓝推演：[设计方案内容]"
```

### 方式 3: 飞书消息触发

在飞书聊天中@红蓝推演智能体，附上设计方案即可。

---

## 📝 使用场景示例

### 场景 1: 需求理解阶段 - 挑战设计方案

**背景**: 需求理解智能体完成了初步设计方案，需要红蓝推演验证。

**输入**:
```markdown
# 设计方案：博客系统 - 用户认证模块

## 技术选型
- 前端：React + TypeScript
- 后端：Node.js + Express
- 数据库：MySQL
- 认证：JWT

## 核心流程
1. 用户注册 → 邮箱验证 → 登录
2. 登录后获取 JWT token
3. 后续请求携带 token 认证

## 数据库设计
- users 表：id, email, password_hash, created_at
```

**红队输出示例**:
```json
{
  "challenges": [
    {
      "id": 1,
      "dimension": "风险识别",
      "title": "JWT token 存储安全风险",
      "description": "设计方案未说明 JWT token 的存储方式。如果存储在 localStorage，可能存在 XSS 攻击风险。",
      "riskLevel": "high",
      "impact": "用户账号可能被盗用",
      "evidence": "设计文档：'登录后获取 JWT token'，未说明存储方式",
      "question": "JWT token 如何存储？是否考虑了 XSS 攻击风险？"
    },
    {
      "id": 2,
      "dimension": "边界条件",
      "title": "邮箱验证过期处理",
      "description": "设计方案未说明邮箱验证链接的有效期和过期处理。",
      "riskLevel": "medium",
      "impact": "用户可能无法完成注册",
      "evidence": "设计文档：'邮箱验证'，未说明有效期",
      "question": "验证链接有效期多长？过期后用户如何重新获取？"
    }
  ]
}
```

**蓝队输出示例**:
```json
{
  "responses": [
    {
      "challengeId": 1,
      "strategy": "方案设计",
      "recommendation": "JWT token 存储在 HttpOnly cookie 中，防止 XSS 攻击",
      "implementation": {
        "steps": [
          "后端设置 cookie: HttpOnly + Secure + SameSite=Strict",
          "前端通过 document.cookie 无法读取 token",
          "CSRF 防护：添加 CSRF token 验证"
        ],
        "effort": "medium",
        "priority": "P0"
      },
      "expectedOutcome": "有效防止 XSS 攻击窃取 token"
    }
  ]
}
```

---

### 场景 2: 方案评审阶段 - 识别架构风险

**背景**: 需求解决智能体完成了技术实现方案，需要红蓝推演识别风险。

**输入**:
```markdown
# 实现方案：电商系统 - 订单处理

## 架构设计
- API 网关 → 订单服务 → 数据库
- 异步通知：消息队列 (RabbitMQ)
- 缓存：Redis

## 订单流程
1. 用户下单 → 创建订单
2. 扣减库存
3. 发送支付通知
4. 支付成功后更新订单状态
```

**红队可能提出的挑战**:
- 库存扣减和订单创建的原子性问题
- 消息队列消息丢失的处理
- Redis 缓存与数据库一致性问题
- 支付回调的幂等性处理

---

### 场景 3: 验收阶段 - 模拟挑剔用户

**背景**: 需求验收智能体准备验收标准，红蓝推演模拟挑剔用户视角。

**红队挑战示例**:
- "这个错误提示太技术化了，用户看不懂"
- "加载时间超过 3 秒，没有 loading 提示"
- "移动端适配有问题，按钮太小点不到"

---

## 📊 推演报告示例

```markdown
# 红蓝推演报告

**任务 ID**: REQ-003-task-002
**推演时间**: 2026-03-28 11:30
**推演深度**: standard

---

## 📊 执行摘要

- 挑战点总数：8 个
- 高风险：2 个 | 中风险：4 个 | 低风险：2 个
- 应对建议：8 个
- 推演耗时：3 分钟

**核心关注点**:
1. JWT token 存储安全风险
2. 邮箱验证过期处理缺失

---

## 🔴 红队挑战

### 挑战点 1: JWT token 存储安全风险

| 属性 | 内容 |
|------|------|
| **维度** | 风险识别 |
| **风险等级** | high |
| **影响范围** | 所有登录用户 |

**问题描述**:
设计方案未说明 JWT token 的存储方式。如果存储在 localStorage，可能存在 XSS 攻击风险。

**核心质疑**:
JWT token 如何存储？是否考虑了 XSS 攻击风险？

---

## 🔵 蓝队应对

### 应对挑战点 1

| 属性 | 内容 |
|------|------|
| **策略** | 方案设计 |
| **优先级** | P0 |
| **实施工作量** | medium |

**具体建议**:
JWT token 存储在 HttpOnly cookie 中，防止 XSS 攻击

**实施步骤**:
1. 后端设置 cookie: HttpOnly + Secure + SameSite=Strict
2. 前端通过 document.cookie 无法读取 token
3. CSRF 防护：添加 CSRF token 验证

**预期效果**:
有效防止 XSS 攻击窃取 token

---

## 📋 行动建议

| 优先级 | 建议内容 | 负责方 | 预计耗时 |
|--------|---------|--------|---------|
| P0 | JWT token 改为 HttpOnly cookie 存储 | 后端开发 | 4 小时 |
| P1 | 增加邮箱验证过期重新发送功能 | 全栈开发 | 2 小时 |

---

## 📌 结论

**整体评估**: 设计方案整体合理，但需要补充安全存储和边界处理

**是否通过**: ⚠️ 有条件通过（需完成 P0 项）

**后续行动**:
1. 完成 JWT token 存储方案修改
2. 补充邮箱验证过期处理设计
```

---

## ⚙️ 配置说明

### 推演深度配置

在 `config.json` 中配置：

```json
{
  "depth": {
    "default": "standard",
    "override": {
      "S": "deep",
      "A": "standard",
      "B": "standard",
      "C": "light"
    }
  }
}
```

### 触发条件配置

```json
{
  "trigger": {
    "complexityThreshold": "B",
    "enablePeerRequest": true,
    "autoTriggerPhases": ["requirement-understanding", "requirement-resolution"]
  }
}
```

---

## 🎯 最佳实践

### 1. 何时使用红蓝推演

✅ **推荐使用**:
- 复杂系统设计（A 级/S 级）
- 关键业务逻辑
- 新技术选型
- 高风险变更

❌ **不推荐**:
- 简单配置修改（C 级）
- 紧急修复（时间不允许）
- 已有成熟方案的场景

### 2. 如何响应红蓝推演结果

1. **优先处理 P0 项**: 高风险问题必须解决
2. **评估 P1/P2 项**: 根据资源情况决定
3. **记录决策**: 如不采纳某建议，记录原因
4. **跟踪验证**: 确保建议已实施且有效

### 3. 与智能体协作

- **需求理解**: 接收推演结果 → 完善设计方案
- **需求解决**: 接收推演结果 → 加固实现方案
- **需求验收**: 接收推演结果 → 补充验收标准

---

## 📚 相关文档

| 文档 | 路径 |
|------|------|
| 智能体职责 | `AGENTS.md` |
| 红队提示词 | `prompts/red-team.md` |
| 蓝队提示词 | `prompts/blue-team.md` |
| 配置文件 | `config.json` |

---

**文档版本**: 1.0  
**最后更新**: 2026-03-28
