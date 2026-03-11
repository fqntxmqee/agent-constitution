# MEMORY.md - 长期记忆

> 本文件记录重要决策、经验教训、规范变更等需要长期保留的信息

---

## 2026-03-09: V3.7 宪法规范升级

### 📜 规范版本
- **从 V3.0 升级到 V3.7**
- **生效日期**: 2026-03-09
- **状态**: ✅ 已完成并生效

---

## 2026-03-09: P0 技能开发启动

### ✅ Skill-01: 全域意图分类引擎（已完成）

**状态**: ✅ 100% 完成  
**测试通过率**: 100% (10/10)  
**位置**: `agents/skills/skill-01-intent-classifier/`

**创建的文件**:
- `SKILL.md` - 技能规范文档
- `index.js` - 技能实现
- `test.js` - 测试脚本（10 个测试用例）
- `prompts/intent-classification.txt` - Prompt 模板
- `README.md` - 使用说明

**验收结果**:
- ✅ 准确率 >90%（实际 100%）
- ✅ 支持复合意图识别
- ✅ JSON 格式验证
- ✅ 路由建议合理

---

### ✅ Skill-03: 跨域模糊性探测器（已完成）

**状态**: ✅ 100% 完成  
**测试通过率**: 100% (10/10)  
**位置**: `agents/skills/skill-03-ambiguity-detector/`  
**开发方式**: Cursor CLI（`cursor agent --print`）✅ V3.7 合规

**创建的文件**:
- `SKILL.md` - 技能规范文档
- `index.js` - 技能实现（六维度检测）
- `test.js` - 测试脚本（10 个测试用例）
- `prompts/ambiguity-detection.txt` - Prompt 模板（6 示例 +10 测试用例）
- `README.md` - 使用说明

**验收结果**:
- ✅ 六维度覆盖（技术栈/部署/数据源/用户角色/优先级/验收标准）
- ✅ JSON 格式验证
- ✅ 优先级判定准确（high/medium/low）
- ✅ isClear 逻辑正确
- ✅ 响应时间 <3 秒

**测试结果**:
```
✅ T01: 高度模糊 → 5 个维度
✅ T02: 技术栈明确 → 不检出 tech_stack
✅ T03: 部署环境明确 → 不检出 deployment
✅ T04: 需求清晰 → isClear=true
✅ T05: 非开发类 → isClear=true
✅ T06-T09: 单维度模糊 → 准确检出
✅ T10: 多维度中度模糊 → 5 个维度

📊 10/10 通过（100.0%）
```

**下一步**: Skill-04 动态路由决策器

### 🔄 主要变更

| 类别 | 变更摘要 |
|------|----------|
| **术语表** | 新增：意图、执行蓝图、OpenSpec、AC、熔断、一票否决等 10 个术语 |
| **智能体内部逻辑** | 每个智能体明确：触发条件、输入、内部执行逻辑、产出、出口条件 |
| **智能体间契约** | 新增智能体间输入输出契约表、主流程触发链 |
| **执行与仲裁** | 新增验收用户 override 流程、审计熔断恢复、总结反思未确认策略 |
| **可配置参数** | 补全：N_rounds、N_acceptance_cycles、N_reflection_hours 等 |
| **决策权表** | 明确 12 个关键决策事项的主导智能体、协助方、最终裁定权 |

### ⚠️ 强制规范（必须遵守）

#### ACP Harness 规范
- ✅ 需求解决智能体**必须**使用 `runtime="acp"`（不是 `subagent`）
- ✅ 需求解决智能体**必须**使用 Cursor CLI（`cursor agent --print`）+ PTY 模式
- ❌ 禁止使用 `write` 工具直接创建业务代码

#### 用户确认节点
- 意图确认（澄清智能体输出后）
- 蓝图/执行计划确认（理解智能体或澄清智能体产出后）
- 生产环境部署（交付智能体发起前）
- 规范/宪法变更
- 高风险内容发布

#### 审计检查点（开发类任务）
- [ ] 规约先行（proposal + specs + design + tasks）
- [ ] **runtime="acp"**（严重违规：使用 `subagent`）
- [ ] 需求解决仅用 Cursor CLI
- [ ] 需求验收独立验证（严禁采信解决智能体自查报告）
- [ ] Git 提交规范

### 📁 更新的文件

#### 主规范文件
- ✅ `agents/docs/specs/CONSTITUTION_V3.7.md` - V3.7 主规范（新增）

#### 智能体配置（8 个）
- ✅ `agents/constitution/requirement-clarification/AGENTS.md`
- ✅ `agents/constitution/requirement-understanding/AGENTS.md`
- ✅ `agents/constitution/requirement-resolution/AGENTS.md`
- ✅ `agents/constitution/requirement-acceptance/AGENTS.md`
- ✅ `agents/constitution/requirement-delivery/AGENTS.md`
- ✅ `agents/constitution/progress-tracking/AGENTS.md`
- ✅ `agents/constitution/audit/AGENTS.md`
- ✅ `agents/constitution/summary-reflection/AGENTS.md`

#### 架构与流程
- ✅ `agents/constitution/README.md` - 子 Agent 总览（V3.7）
- ✅ `agents/docs/architecture/SIX_AGENT_ARCHITECTURE.md` - 架构文档（V3.7）
- ✅ `agents/docs/architecture/WORKFLOW.md` - 工作流程（V3.7）

#### 工作区配置
- ✅ `AGENTS.md` - 主工作区配置（V3.7）
- ✅ `HEARTBEAT.md` - 周期性支撑智能体配置（V3.7）

### 🎯 V3.7 关键流程

#### 标准构建流（复杂任务）
```
用户 → 需求澄清 → 用户确认 → 需求理解 → 用户确认 → 需求解决 → 需求验收 → 需求交付
```

#### 快速执行流（简单任务）
```
用户 → 需求澄清 → 用户确认 → 需求解决 → 需求验收 → 需求交付
                    ↓
            (理解智能体休眠)
```

### 📊 可配置参数

| 参数标识 | 含义 | 默认值 |
|----------|------|--------|
| N_rounds | 短期记忆保留轮数 | 20 |
| N_acceptance_cycles | 解决-验收循环最大次数 | 3 |
| N_reflection_hours | 触发总结反思的小时数 | 8 |
| 人工确认超时时间 | 关键节点等待时间 | 24 小时 |
| Crash Dump 保留天数 | 现场快照保留期限 | 7-90 天 |

### 🔗 参考文档

- **主规范**: `agents/docs/specs/CONSTITUTION_V3.7.md`
- **子 Agent 列表**: `agents/constitution/README.md`
- **架构文档**: `agents/docs/architecture/SIX_AGENT_ARCHITECTURE.md`
- **工作流程**: `agents/docs/architecture/WORKFLOW.md`

### 💡 重要经验

#### 为什么必须用 ACP (runtime="acp")
1. ACP 在 Cursor IDE 中执行，有完整项目上下文
2. 支持 `cursor agent --print` 原生用法
3. 符合宪法规范要求（需求解决必须用 Cursor CLI）
4. Subagent 没有 Cursor 环境，无法正确执行开发任务

#### 审计严重违规
- 使用 `runtime="subagent"` 执行开发任务 → 标记为严重违规，必须重做
- 这会触发审计智能体的熔断机制

### ⚠️ 违规处理
- 🔴 严重违规（无规约开发、使用 subagent、跳过验收）→ 立即熔断，必须整改重做
- 🟡 一般违规（未用 Cursor CLI、文档不全）→ 限期整改
- 🟢 轻微违规（格式问题、命名不规范）→ 建议改进

---

## ACP Harness 规范教训（2026-03-09）

### 问题发现
主会话在启动需求解决智能体时，错误使用了 `runtime="subagent"` 而不是 `runtime="acp"`，导致：
- 需求解决智能体没有 Cursor IDE 上下文
- 无法正确使用 `cursor agent --print`
- 违反宪法规范要求

### 解决方案
1. ✅ 更新 `AGENTS.md` 添加 ACP Harness 强制规范
2. ✅ 更新 `agents/constitution/audit/AGENTS.md` 添加 runtime 检查
3. ✅ 更新 `HEARTBEAT.md` 添加审计检查点
4. ✅ 重新使用 `runtime="acp"` 执行需求解决

### 规范（必须遵守）
```python
# ✅ 正确
sessions_spawn(
    runtime="acp",           # ← 必须用 acp，不是 subagent
    agentId="requirement-resolution",
    task="..."
)

# ❌ 禁止
sessions_spawn(
    runtime="subagent",      # ← 错误！subagent 没有 Cursor 上下文
    label="requirement-resolution-xxx",
    task="..."
)
```

### 审计检查
审计智能体必须检查：
- `sessions_spawn` 调用是否使用 `runtime="acp"`
- 发现使用 `subagent` 执行开发任务 → 标记为严重违规，必须重做

---

## 项目状态（2026-03-09）

| 项目 | 状态 | 备注 |
|------|------|------|
| xiaohongshu-frontend | ✅ 验收通过 | 等待 ACP 重新执行 |
| xiaohongshu-backend | ✅ 验收通过 | - |
| 周期性智能体 | ✅ 配置完成 | progress-tracking, audit, summary-reflection |
| V3.7 规范升级 | ✅ 完成 | 所有文档已更新 |

---

## 待办事项

- [ ] 小红书前端项目：使用 `runtime="acp"` 重新执行需求解决
- [ ] 完成前端验收后，执行需求交付
- [ ] 更新总结报告，记录 V3.7 升级经验

---

## 2026-03-10: V3.7.1 需求级并行架构升级

### 📜 架构升级

- **从 V3.7 升级到 V3.7.1**
- **生效日期**: 2026-03-10
- **状态**: ✅ 已完成并生效

### 🎯 核心变更

| 类别 | V3.7 | V3.7.1 |
|------|------|--------|
| **并行单位** | 智能体内部并行 | **需求级并行** |
| **需求隔离** | 无明确定义 | 每个需求有独立 5 智能体子 agent |
| **主会话角色** | 协调者 | **需求调度器 + 子 agent spawn 执行者** |
| **子 agent 管理** | 智能体自行 spawn | **主会话统一 spawn** |

### 📊 架构设计

```
主会话（需求调度器）
│
├─ 需求 A → clarification-reqA → understanding-reqA → resolution-reqA → acceptance-reqA → delivery-reqA
├─ 需求 B → clarification-reqB → understanding-reqB → resolution-reqB → acceptance-reqB → delivery-reqB
└─ 需求 C → ...
```

### ✅ 已更新文件

- `agents/docs/specs/CONSTITUTION_V3.7_PARALLEL.md` - V3.7.1 需求级并行架构规范（新增）
- `AGENTS.md` - 添加 V3.7.1 需求级并行说明
- `opsx/requirements-state.json` - 需求状态管理文件

### 🚀 立即执行

1. **req-A（P0 核心技能开发）**: 9 个技能并行开发中
2. **req-B（Agent Monitor Dashboard）**: 前后端并行开发中

---

**最后更新**: 2026-03-10 06:45  
**下次审查**: 2026-03-17

---

## 2026-03-12: ACP Harness 扩展至需求理解/验收/交付智能体

### 📜 规范版本
- **从 V3.7 升级到 V3.7.2**
- **生效日期**: 2026-03-12
- **状态**: 🟡 测试中（需求理解智能体已更新，待验证）

### 🎯 核心变更

**扩展 ACP Harness 适用范围**：
- V3.7: 仅 `requirement-resolution`（需求解决）必须用 `runtime="acp"`
- V3.7.2: 扩展至 4 个智能体
  - ✅ `requirement-understanding`（需求理解）
  - ✅ `requirement-resolution`（需求解决）
  - ✅ `requirement-acceptance`（需求验收）
  - ✅ `requirement-delivery`（需求交付）

### 📝 已更新文件

| 文件 | 改动 |
|------|------|
| `AGENTS.md` | 更新 ACP Harness 规范（V3.7.2），添加 4 智能体适用列表 |
| `agents/constitution/requirement-understanding/AGENTS.md` | 新增"强制工作模式"章节 |
| `agents/constitution/requirement-acceptance/AGENTS.md` | 待更新 |
| `agents/constitution/requirement-delivery/AGENTS.md` | 待更新 |

### 💡 变更理由

| 智能体 | 为什么需要 Cursor CLI |
|--------|----------------------|
| 需求理解 | 读取项目代码结构、技术栈、依赖关系，生成贴合实际的规约 |
| 需求解决 | 编写代码、运行自测、修复循环 |
| 需求验收 | 运行测试套件、代码审查、安全扫描、一致性比对 |
| 需求交付 | Git 操作、环境检查、敏感信息扫描 |

### 🚀 执行计划

- [x] 更新 `AGENTS.md` 主规范
- [x] 更新 `requirement-understanding/AGENTS.md`
- [ ] 测试需求理解智能体（使用 `runtime="acp"` 执行一次完整任务）
- [ ] 验证效果后更新 `requirement-acceptance/AGENTS.md`
- [ ] 验证效果后更新 `requirement-delivery/AGENTS.md`
- [ ] 更新 `CONSTITUTION_V3.7.md` 宪法主规范

### ⚠️ 注意事项

- 新任务立即生效，旧任务继续完成
- 仅开发类任务强制，内容/咨询类可选
- 主会话 spawn 时必须用 `runtime="acp"`

---

**最后更新**: 2026-03-12 00:15  
**下次审查**: 2026-03-19

---

## 2026-03-12 00:32: V3.7.3 升级执行中

### 📊 执行进度

| 阶段 | 状态 | 完成时间 |
|------|------|----------|
| 阶段 0: 备份 | ✅ 完成 | 00:32 |
| 阶段一：核心变更 | ✅ 完成 | 00:33 |
| 阶段二：配套规范 | ✅ 完成 | 00:35 |
| 阶段三：文档化 | ✅ 完成 | 00:36 |
| 阶段四：Git 提交推送 | ⏳ 待执行 | - |
| 阶段五：飞书同步 | ⏳ 待执行 | - |

### ✅ 已完成工作

**阶段 0: 备份**
- 宪法规范备份：`versions/constitution/V3.7.3/CONSTITUTION_V3.7.md`
- 智能体配置备份：`versions/agents/V3.7.3/`（3 个 AGENTS.md）
- 技能目录备份：`versions/skills/V3.7.3/`（44 个技能，全量）
- 备份时间戳：2026-03-12_00:32:28

**阶段一：核心变更**
- 更新 `requirement-acceptance/AGENTS.md`（新增前置完整性检查）
- 更新 `requirement-delivery/AGENTS.md`（新增 Git 推送强制要求）

**阶段二：配套规范**
- 创建 `SKILLS_NAMING_CONVENTION.md`（技能命名规范 V1.0）
- 创建 `skills_manifest.json`（技能注册表，16 个活跃技能）

**阶段三：文档化**
- 更新 `CHANGELOG.md`（V3.7.3 变更记录）

### ⏳ 待执行工作

**阶段四：Git 提交与推送**
- Git add 所有变更文件
- Git commit（Conventional Commits）
- Git push origin main
- Git tag v3.7.3

**阶段五：飞书同步（可选）**
- 创建飞书文档《宪法规范 V3.7.3 升级说明》

---

**最后更新**: 2026-03-12 00:41  
**下次审查**: 2026-03-19

---

## 2026-03-12 00:41: V3.7.3 升级完成！✅

### 🎉 升级状态

**所有阶段已完成**！

| 阶段 | 状态 | 完成时间 |
|------|------|----------|
| 阶段 0: 备份 | ✅ 完成 | 00:32 |
| 阶段一：核心变更 | ✅ 完成 | 00:33 |
| 阶段二：配套规范 | ✅ 完成 | 00:35 |
| 阶段三：文档化 | ✅ 完成 | 00:36 |
| 阶段四：Git 提交推送 | ✅ 完成 | 00:40 |
| 阶段五：飞书同步 | ✅ 完成 | 00:41 |

### 📦 最终交付物

**Git 提交**: `f9f7cb7`  
**Git Tag**: `v3.7.3`  
**飞书文档**: https://feishu.cn/docx/JvkOdTwDCoSsuRxlbcXcawrfnmh

### 📊 变更统计

- 243 个文件变更
- +30,634 行插入
- -8 行删除

### ✅ 核心变更

1. **验收前置完整性检查** - 解决无效验收问题
2. **技能 ID 注册表** - 解决 ID 冲突问题
3. **Git 推送强制** - 解决交付不完整问题

---

**最后更新**: 2026-03-12 00:41  
**下次审查**: 2026-03-19