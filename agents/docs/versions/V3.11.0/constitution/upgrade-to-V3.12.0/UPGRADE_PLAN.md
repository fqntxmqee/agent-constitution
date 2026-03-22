# V3.12.0 升级计划

> **版本**：V3.12.0 草案
> **状态**：🟡 草案，待用户确认后执行
> **参考项目**：gstack（https://github.com/garrytan/gstack）
> **制定日期**：2026-03-22

---

## 一、升级背景

### 1.1 动机

借鉴 [gstack](https://github.com/garrytan/gstack) 项目（YC CEO Garry Tan 开源的 AI 软件工厂），审视线代智能体协同系统的设计盲点，提取可落地的改进。

**gstack 核心亮点：**
- SKILL.md Template 系统（代码即真相，文档自动同步）
- 18 个扁平化技能专家（无主从架构）
- `/ship` 全自动发布（只停决策点）
- Persistent Headless Browser（E2E QA 基础）
- ETHOS 哲学层（两条原则驱动一切）

### 1.2 与我们系统的差异

| 维度 | gstack | 我们的系统 |
|------|---------|-----------|
| 架构 | 单人 AI 编程工具 | **多智能体协同宪法** |
| 合规 | 无（单人无合规需求） | **合规是基础设施** |
| 发布 | `/ship` 全自动 | 需求交付智能体（半自动） |
| 审查 | `/review` 强制 gate | 验收智能体独立 |
| QA | 真实浏览器 E2E | 代码审查 + 测试 |

---

## 二、gstack vs 我们：同质化智能体详细对比

### 2.1 总览：gstack 碾压我们的地方

| 优先级 | 能力 | 差距 |
|--------|------|------|
| 🔴 最高 | `/qa` 真实浏览器 E2E | 我们完全缺失 |
| 🔴 最高 | `/office-hours` 结构化提问 | 我们无 HARD GATE |
| 🔴 最高 | `/review` Fix-First + Scope Drift | 我们无此方法论 |
| 🟡 高 | `/investigate` 四阶段调试 | 我们无独立调试角色 |
| 🟡 高 | `/retro` 量化回顾 | 我们偏定性 |
| 🟡 高 | `/plan-eng-review` 认知框架 | 我们只有方案整理 |
| 🟡 高 | `/ship` 全自动化 | 自动化程度差距大 |

---

### 2.2 `/review` vs 需求验收（挑刺小能手）

| 维度 | gstack `/review` | 我们的需求验收 |
|------|-----------------|--------------|
| **Scope Drift 检测** | ✅ 有（变更是否对齐需求） | ❌ 无 |
| **两遍 review** | Pass 1 关键项 / Pass 2 信息项 | 一遍过 |
| **Fix-First** | ✅ AUTO-FIX 可自动修，ASK 才停 | ❌ 无 |
| **枚举完整性** | ✅ diff 新增枚举值时检查所有引用点 | ❌ 无 |
| **Greptile 集成** | ✅ 外部 LLM review 反馈 | ❌ 无 |
| **Rationalization Prevention** | ✅ "看起来没问题"不算，必须有证据 | ❌ 较弱 |
| **合规架构** | 无 | ✅ runtime 检查 |

**我们能借鉴的**：
- Fix-First 机制（AUTO-FIX + ASK 分离）
- Scope Drift 检测（变更是否对齐需求）
- 两遍 review（关键项先过，信息项后过）

---

### 2.3 `/office-hours` vs 需求澄清（需求澄清智能体）

| 维度 | gstack `/office-hours` | 我们的需求澄清 |
|------|----------------------|--------------|
| **结构化提问** | ✅ 6 步强制提问（Q1-Q6） | ❌ 依赖对话 |
| **产品阶段路由** | Pre-product / Has users / Has paying customers | ❌ 无 |
| **Anti-sycophancy rules** | ✅ 强制规定禁止说的话 | ❌ 无 |
| **HARD GATE** | ✅ 不写代码，只输出设计文档 | ❌ 无明确边界 |
| **Push 模式** | 推送一次不满足 → 再推一次 | 缺乏强制追问 |

**我们能借鉴的**：
- HARD GATE（不达到澄清标准不进入下一阶段）
- Anti-sycophancy rules（禁止说"这是个好主意"等空洞话）
- 产品阶段路由（不同阶段问不同问题）

---

### 2.4 `/qa` vs 需求验收（挑刺小能手）— **最大缺口**

| 维度 | gstack `/qa` | 我们的验收 |
|------|-----------|----------|
| **真实浏览器** | ✅ persistent headless Chromium | ❌ 纯代码审查 |
| **登录态** | ✅ cookie 持久化，跨命令保持 | ❌ 无 |
| **Snapshot diff** | ✅ 交互前后 diff 对比 | ❌ 无 |
| **Responsive 测试** | ✅ mobile/tablet/desktop 截图 | ❌ 无 |
| **Dialog 处理** | ✅ auto-accept alert/confirm/prompt | ❌ 无 |
| **Console/Network** | ✅ 检查 JS 错误/失败请求 | ❌ 无 |
| **证据存档** | ✅ 截图存档，标注 interactive elements | ❌ 无 |

**我们能借鉴的**：
- OpenClaw 内置 `browser` 工具（无需另起 daemon）
- 前端项目自动触发浏览器验证
- 截图存档作为验收证据

---

### 2.5 `/investigate` vs 功能魔法师 — **我们缺乏独立调试角色**

| 维度 | gstack `/investigate` | 我们的功能魔法师 |
|------|---------------------|----------------|
| **铁律** | ✅ NO FIXES WITHOUT ROOT CAUSE | ❌ 无明确强制 |
| **四阶段流程** | Investigate → Analyze → Hypothesize → Implement | ❌ 无结构 |
| **Scope Freeze** | ✅ 调试时冻结影响范围 | ❌ 无 |
| **模式匹配** | Race condition / nil propagation / state corruption | ❌ 无 |

**我们能借鉴的**：
- 四阶段调试流程（独立 debugger 智能体）
- 铁律：根因未明之前不动手

---

### 2.6 `/retro` vs 总结反思 — **量化 vs 定性**

| 维度 | gstack `/retro` | 我们的总结反思 |
|------|---------------|--------------|
| **量化指标** | ✅ 完整（commits/LOC/test ratio） | 较弱 |
| **Per-author 排行** | ✅ Leaderboard + 贡献面积 | ❌ 无 |
| **趋势对比** | ✅ compare vs prior period | ❌ 无 |
| **Backlog Health** | ✅ TODOS.md 健康度 | ❌ 无 |
| **Skill 使用分析** | ✅ 使用频率统计 | ❌ 无 |

**我们能借鉴的**：
- 量化指标收集（需求周期、成功率等）
- 趋势对比（本期 vs 上期）
- 结构化 Retro 模板

---

### 2.7 `/plan-eng-review` vs 需求理解（脑洞整理师）

| 维度 | gstack `/plan-eng-review` | 我们的需求理解 |
|------|------------------------|--------------|
| **认知模式** | ✅ 15 条工程管理原则 | ❌ 无 |
| **ASCII Diagram** | ✅ 强制要求数据流/状态机图 | 建议但无强制 |
| **Minimal Diff** | ✅ 偏好最小化变更 | ❌ 无明确偏好 |
| **创新令牌** | ✅ "每个公司只有约 3 个创新令牌" | ❌ 无 |

**我们能借鉴的**：
- 工程管理认知模式（boring by default / error budgets 等）
- 最小化变更原则

---

### 2.8 `/ship` vs 需求交付 — **自动化差距**

| 维度 | gstack `/ship` | 我们的需求交付 |
|------|--------------|--------------|
| **自动化程度** | ✅ 完全自动化，只在 ASK 才停 | 半自动 |
| **版本选择** | 自动 MICRO/PATCH/MINOR/MAJOR | 人工判断 |
| **CHANGELOG** | 自动从 diff 生成 | 手工撰写 |
| **Commit 策略** | 自动 split bisectable commits | 无规范 |
| **Review Gate** | `/review` 强制通过 | 依赖验收智能体 |

**我们能借鉴的**：
- CHANGELOG 自动生成（基于 git diff）
- Commit message 自动规范化

---

## 三、升级内容总览（修订版）

基于上述对比分析，V3.12.0 优先级调整如下：

| # | 类型 | 内容 | 优先级 | 来源 | 工作量 |
|---|------|------|--------|------|--------|
| 1 | 新增 | ETHOS.md 哲学层 | 🟢 已完成 | gstack + 自创 | - |
| 2 | **增强** | 需求验收 + Fix-First + Scope Drift | 🔴 高 | `/review` | 小 |
| 3 | **增强** | 需求验收 + 浏览器 E2E 验证 | 🔴 高 | `/qa` | 小 |
| 4 | **增强** | 需求澄清 + HARD GATE + 结构化提问 | 🔴 高 | `/office-hours` | 小 |
| 5 | **新增** | debugger/ 四阶段调试智能体 | 🟡 中 | `/investigate` | 小 |
| 6 | **增强** | 总结反思 + 量化 Retro | 🟡 中 | `/retro` | 小 |
| 7 | 增强 | 脑洞整理师 + 工程认知模式 | 🟢 低 | `/plan-eng-review` | 小 |
| 8 | 增强 | 需求交付 + CHANGELOG 自动生成 | 🟢 低 | `/ship` | 小 |
| 9 | 工程化 | Template 规约生成系统 | ✅ 已实现 | gstack | ✅ 已实现 |

---

## 四、ETHOS.md 哲学层（四条原则）

| 原则 | 来源 | 核心含义 |
|------|------|---------|
| **Boil the Lake** | gstack | AI 时代完整性成本接近零，能做完整就别做残缺 |
| **Search Before Building** | gstack | 先搜索再建造，避免重复造轮子 |
| **Automate Through** | 自创 | 自动化穿透执行，关键决策点才停下问 |
| **Compliance is Infrastructure** | 自创 | 合规是多智能体系统的基础设施，不是附件 |

详见：`ETHOS.md`

---

## 五、核心增强一：需求验收智能体（双重增强）

### 5.1 整合理由

- 验收核心职责是「验证交付物符合规约」
- Fix-First + Scope Drift + 浏览器验证都是验收手段
- 避免职责重复（不新增独立智能体）
- OpenClaw 已有内置 `browser` 工具

### 5.2 增强一：Fix-First + Scope Drift（借鉴 `/review`）

**新增方法论：**
- **Scope Drift 检测**：每次验收前，检查变更是否对齐需求（防止_scope creep）
- **Fix-First**：AUTO-FIX 类问题自动修复，只对 ASK 类问题停下来问
- **两遍 review**：Pass 1 关键项（SQL安全/并发/LLM边界），Pass 2 信息项

**Scope Drift 检查项：**
```
- 变更的文件是否都在需求范围内？
- 是否有"顺便..."的变更？
- 需求文档中提到的功能是否都已实现？
```

**Fix-First 分类：**
| 类型 | 处理方式 |
|------|---------|
| AUTO-FIX | 直接修复（如死代码、拼写错误） | 
| ASK | 停下来问用户（如架构决策、性能权衡） |

### 5.3 增强二：浏览器 E2E 验证（借鉴 `/qa`）

**触发条件：**
```
前端项目（有 UI）→ 自动触发浏览器验证
后端项目 → 跳过，保持现有流程
```

**验收手段：**
| 手段 | 说明 |
|------|------|
| 浏览器 E2E | 真实浏览器跑关键路径 |
| 视觉截图对比 | 部署后截图存档 |
| Console/Network 检查 | JS 错误、网络失败 |

**实现方式：** 使用 OpenClaw 内置 `browser` 工具

---

## 六、核心增强二：需求澄清智能体 + HARD GATE（借鉴 `/office-hours`）

### 6.1 新增 HARD GATE

**铁律**：不达到澄清标准，不进入下一阶段。

```
澄清未完成
    ↓
需求理解（脑洞整理师）→ 不触发
需求解决（功能魔法师）→ 不触发
```

### 6.2 结构化提问（借鉴 6 步强制提问）

**产品阶段路由：**
```
Pre-product（无用户） → Q1 需求真实性、Q2 竞品对比、Q3 最小 wedges
Has users（有用户） → Q2 当前方案、Q4 用户反馈
Has paying（付费用户） → Q4 付费动机、Q5 扩展计划
```

**必问项（所有阶段）：**
1. **需求真实性**：谁会用？解决了什么具体问题？证据是什么？
2. **当前方案**：用户现在怎么解决的？哪怕很烂也有替代
3. **泛化检查**：这个需求是否泛化过度？"所有人的需求"往往不是真实需求

### 6.3 Anti-sycophancy Rules

**禁止说的话：**
```
❌ "这是个很好的想法"
❌ "有很多方法可以解决这个问题"
❌ "您可能需要考虑..."
✅ "这个方案的问题在于..." + 必须有证据
```

---

## 七、新增：debugger/ 调试专家智能体（借鉴 `/investigate`）

### 7.1 职责定位

- 功能魔法师的**辅助**，不是替代
- 专注根因分析，不写功能代码
- debugger 找到根因 → 功能魔法师负责修复

### 7.2 四阶段调试流程

**铁律：NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

| 阶段 | 行动 |
|------|------|
| **Investigate** | 收集症状、读代码、查 git log、重现 |
| **Analyze** | 模式匹配（race condition / nil propagation / state corruption） |
| **Hypothesize** | 形成可测试的根因假设 |
| **Implement** | 验证假设成立 → 修复 |

### 7.3 触发条件

```
功能魔法师遇到以下情况时自动触发：
- 同一 bug 调试超过 3 轮
- 涉及跨服务/跨进程问题
- 根因不明的间歇性问题
```

---

## 八、增强：总结反思 + 量化 Retro（借鉴 `/retro`）

### 8.1 量化指标收集

每次需求完成后，自动收集：

| 指标 | 说明 |
|------|------|
| 需求周期 | 从提案到交付的总天数 |
| 各智能体耗时 | 澄清/理解/解决/验收/交付各阶段 |
| 验收成功率 | 通过率 vs 失败次数 |
| 决策停顿次数 | 用户被要求做决策的次数 |
| 变更范围 | 最终交付 vs 原始需求的偏差 |

### 8.2 结构化 Retro 模板

```markdown
## Retro [项目名] - [日期]

### 量化指标
| 指标 | 值 |
|------|---|
| 需求周期 | X 天 |
| 验收成功率 | XX% |
| 决策停顿 | X 次 |
| Scope Drift | X% |

### 亮点
- ...

### 改进点
- ...

### 下次改进行动
1. ...
```

---

## 九、增强：脑洞整理师 + 工程认知模式（借鉴 `/plan-eng-review`）

### 9.1 新增认知模式

在需求理解阶段，强制内嵌以下工程管理原则检查：

- **Boring by Default**：这个方案是否用了过于新奇的技术？"每个公司只有 3 个创新令牌"
- **Minimal Diff**：能否用更少的变更完成？
- **Essential vs Accidental**：这是在解决真实问题还是我们制造的复杂度？
- **Reversibility**：如果决策错误，能否轻易回滚？

### 9.2 ASCII Diagram 要求

技术设计方案必须包含：
- 数据流图（ASCII）
- 状态机（若适用）
- 关键依赖关系

---

## 十、增强：需求交付 + CHANGELOG 自动生成（借鉴 `/ship`）

### 10.1 自动生成 CHANGELOG

```
基于 git diff 自动生成 CHANGELOG 条目：
- 新增功能列表
- 变更文件列表
- 提交消息摘要
```

### 10.2 Commit 规范化

```
格式：<type>(<scope>): <subject>

type: feat | fix | docs | style | refactor | test | chore
scope: 涉及的智能体或模块
subject: 简短描述
```

---

## 十一、工程化：Template 规约生成系统（借鉴 gstack）

### 11.1 核心思路

```
design.md.tmpl → 自动生成 → design.md
tasks.md.tmpl  → 自动生成 → tasks.md
proposal.md.tmpl → 自动生成 → proposal.md
```

### 11.2 收益

- 文档永远和代码/流程同步
- 消除「规约过期」问题
- 新增智能体时自动生成对应 SKILL.md

### 11.3 试点计划

**第一步**：`project/openclaw-portfolio-dashboard/changes/init/` 试点
**第二步**：验证可用后推广到所有项目

---

## 十二、实施计划

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| **阶段一** | ETHOS.md + 需求验收双重增强（Fix-First + 浏览器验证） | 🔴 高 |
| **阶段二** | 需求澄清 HARD GATE + debugger 智能体 | 🟡 中 |
| **阶段三** | 总结反思量化 + 脑洞整理师认知 + 需求交付增强 | 🟢 低 |

---

## 十三、文件变更清单

| 文件 | 变更类型 |
|------|---------|
| `ETHOS.md` | 🆕 新增（哲学层） |
| `SOUL.md` | 修改（与 ETHOS 协同说明） |
| `AGENTS.md` | 修改（引用 ETHOS.md + 宪法执行规范） |
| `audit/AGENTS.md` | 修改（新增宪法文件变更检查） |
| `requirement-acceptance/AGENTS.md` | 增强（Fix-First + Scope Drift + 浏览器验证） |
| `requirement-clarification/AGENTS.md` | 增强（HARD GATE + 结构化提问 + Anti-sycophancy） |
| `requirement-understanding/AGENTS.md` | 增强（工程认知模式 + ASCII Diagram） |
| `requirement-delivery/AGENTS.md` | 增强（CHANGELOG 自动生成 + Commit 规范化） |
| `summary-reflection/AGENTS.md` | 增强（量化 Retro + 指标收集） |
| `debugger/AGENTS.md` | 🆕 新增（调试专家） |

---

## 十四、待确认项

1. **ETHOS.md 哲学层**是否确认？
2. **需求验收增强**（Fix-First + Scope Drift + 浏览器验证）是否确认？
3. **需求澄清增强**（HARD GATE + 结构化提问）是否确认？
4. **debugger 智能体**是否确认新增？
5. **量化 Retro** 是否确认？
6. **Template 系统**是否纳入？

---

**下一步**：用户确认后，按阶段一执行落地。
