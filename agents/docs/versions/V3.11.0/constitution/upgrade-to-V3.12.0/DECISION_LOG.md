# V3.11.0 → V3.12.0 决策记录

> **版本**：V3.12.0 草案
> **状态**：🟡 草案，待正式实施
> **制定日期**：2026-03-22

---

## 决策清单

| 决策编号 | 决策内容 | 结论 | 日期 |
|----------|---------|------|------|
| DEC-035 | ETHOS.md 哲学层（四条原则） | ✅ 采纳 | 2026-03-22 |
| DEC-036 | 需求验收智能体整合浏览器验证能力 | ✅ 采纳（不新增独立智能体） | 2026-03-22 |
| DEC-037 | 脑洞整理师增强 + CEO Review 能力 | ✅ 采纳 | 2026-03-22 |
| DEC-038 | debugger/ 调试专家智能体新增 | ✅ 采纳 | 2026-03-22 |
| DEC-039 | Template 规约生成系统试点 | ✅ 采纳 | 2026-03-22 |
| DEC-040 | 草案目录位置修正 | ✅ 采纳 | 2026-03-22 |

---

## DEC-035：ETHOS.md 哲学层

### 决策

新增 `ETHOS.md` 哲学层，纳入 V3.12.0 宪法体系。

### 四条原则

| 原则 | 核心含义 |
|------|---------|
| **Boil the Lake** | AI 时代完整性成本接近零，能做完整就别做残缺 |
| **Search Before Building** | 先搜索再建造，避免重复造轮子 |
| **Automate Through** | 自动化穿透，决策点才停下问 |
| **Compliance is Infrastructure** | 合规是基础设施，不是附件 |

### 参考

gstack ETHOS.md（https://github.com/garrytan/gstack）

---

## DEC-036：需求验收智能体 + 浏览器验证

### 决策

增强 `requirement-acceptance/` 智能体，整合浏览器 E2E 验证能力，**不新增独立智能体**。

### 理由

- 验收核心职责是「验证交付物符合规约」
- 浏览器验证是手段之一，不是独立角色
- 避免职责重复
- OpenClaw 已有内置 `browser` 工具

### 增强内容

| 手段 | 说明 |
|------|------|
| 代码级审查 | 读代码、查逻辑（现有） |
| 测试套件运行 | 现有 |
| AC 逐项核对 | 现有 |
| **浏览器 E2E** | 真实浏览器跑关键路径 |
| **视觉截图对比** | 部署后截图存档 |
| **Console/Network 检查** | JS 错误、网络失败 |

### 触发条件

```
前端项目（有 UI）→ 自动触发浏览器验证
后端项目 → 跳过，保持现有流程
```

---

## DEC-037：脑洞整理师 + CEO Review 能力

### 决策

增强 `requirement-understanding/AGENTS.md`，内嵌 CEO Review 产品价值审查步骤。

### CEO Review 检查项

1. **价值验证**：谁会用？解决了他什么具体问题？
2. **竞品对比**：用户当前的替代方案是什么？
3. **MVP 验证**：最小可用版本是什么？能否更快验证？
4. **风险识别**：最坏情况是什么？能否承受？

### 参考

gstack `/plan-ceo-review`

---

## DEC-038：debugger/ 调试专家智能体

### 决策

新增 `debugger/AGENTS.md` 调试专家智能体。

### 职责定位

- 功能魔法师的辅助，不替代
- 专注根因分析，不写功能代码
- 触发条件：同一 bug 调试超过 3 轮 / 跨服务问题 / 间歇性问题

### 四阶段调试流程

1. **Investigate**：收集症状、读代码、查 git log、重现
2. **Analyze**：模式匹配
3. **Hypothesize**：形成根因假设
4. **Implement**：验证后修复

### 铁律

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

### 参考

gstack `/investigate`

---

## DEC-039：Template 规约生成系统

### 决策

开发 Template 规约生成系统，在 `project/openclaw-portfolio-dashboard/` 试点后再推广。

### 目标

```
design.md.tmpl → 自动生成 → design.md
tasks.md.tmpl  → 自动生成 → tasks.md
proposal.md.tmpl → 自动生成 → proposal.md
```

### 收益

- 文档永远和代码/流程同步
- 消除「规约过期」问题
- 新增智能体时自动生成对应 SKILL.md

### 参考

gstack SKILL.md.tmpl → gen-skill-docs → SKILL.md

---

## DEC-040：草案目录位置修正

### 决策

将 V3.12.0 升级草案统一放入正确目录：`agents/docs/versions/V3.11.0/constitution/upgrade-to-V3.12.0/`

### 依据

根据 `CONSTITUTION_UPGRADE_AND_LAYOUT_PLAN.md`：
- 某次升级（V3.11.0 → V3.12.0）的提案、讨论、决议全部放在**源版本**目录下
- 即 `V3.11.0/constitution/upgrade-to-V3.12.0/`

### 修正后的文件清单

```
agents/docs/versions/V3.11.0/constitution/upgrade-to-V3.12.0/
├── ETHOS.md         # 哲学层（四条原则）
├── UPGRADE_PLAN.md  # 升级计划总览
├── DECISION_LOG.md  # 决策记录（本文件）
└── IMPLEMENTATION.md # （后续落地后补充）
```

---

## 实施计划

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| 阶段一 | ETHOS.md + 需求验收增强 | 🔴 高 |
| 阶段二 | 脑洞整理师增强 + debugger 智能体 | 🟡 中 |
| 阶段三 | Retro 增强 + Template 系统试点 | 🟢 低 |

---

**下一步**：用户正式确认后，按阶段一执行落地。
