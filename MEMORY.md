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
- ✅ `agents/docs/specs/constitution/CONSTITUTION.md` - V3.7 主规范（新增）

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

- **主规范**: `agents/docs/specs/constitution/CONSTITUTION.md`
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

- [ ] 小红书前端项目：使用 `runtime="acp"` 重新执行需求解决（历史遗留，需评估是否仍需执行）
- [ ] 更新 MEMORY.md 待办清理（本次会话已更新）

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

- `agents/docs/specs/constitution/architecture/CONSTITUTION_V3.7_PARALLEL.md` - V3.7.1 需求级并行架构规范（新增）
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
- [x] 需求验收/交付智能体更新（已随 V3.10.0 完成）
- [x] 更新 `CONSTITUTION.md` 宪法主规范
- ⏭️ **已忽略** V3.7.2 单独验证（V3.10.0 已覆盖）

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
- 宪法规范备份：`agents/docs/versions/V3.7.3/constitution/`
- 智能体配置备份：`agents/docs/versions/V3.7.3/agents/`（3 个 AGENTS.md）
- 技能目录备份：`agents/docs/versions/V3.7.3/skills/`（44 个技能，全量）
- 备份时间戳：2026-03-12_00:32:28

**阶段一：核心变更**
- 更新 `requirement-acceptance/AGENTS.md`（新增前置完整性检查）
- 更新 `requirement-delivery/AGENTS.md`（新增 Git 推送强制要求）

**阶段二：配套规范**
- 创建 `SKILLS_NAMING_CONVENTION.md`（技能命名规范 V1.0）
- 创建 `skills_manifest.json`（技能注册表，16 个活跃技能）

**阶段三：文档化**
- 更新 `CHANGELOG.md`（V3.7.3 变更记录）

## 2026-03-15: 状态确认

### ✅ V3.7.3 待办已完成
- Git 已推送到 V3.10.0
- 工作区干净，无需提交

### 📊 当前版本
- **宪法规范版本**: V3.9.2（已推送）

---

## 2026-03-15: V3.9.2 智能体规范升级

### 📜 规范升级

- **从 V3.9 升级到 V3.9.2**
- **生效日期**: 2026-03-15
- **状态**: ✅ 已完成

### 🎯 核心变更

**需求澄清智能体（迷糊粉碎机）**：
| 变更项 | 内容 |
|--------|------|
| 新增步骤 | 技术选型确认（后端/数据库/认证） |
| 产出增加 | 技术选型字段 |

**需求理解智能体（脑洞整理师）**：
| 变更项 | 内容 |
|--------|------|
| 产出强化 | L2→L3 映射表（强制） |
| 产出强化 | L3→L4 映射表（强制） |

### 📋 验证 B 结果

- 电商交易系统需求走通全流程
- 发现问题：L2-L3 未关联 + 技术选型未确认
- 已修正规范并更新智能体

### 📁 更新的文件

| 文件 | 变更 |
|------|------|
| `requirement-clarification/AGENTS.md` | V3.9.2，新增技术选型确认 |
| `requirement-understanding/AGENTS.md` | V3.9.2，新增 L2→L3、L3→L4 映射表 |

---

## 2026-03-20: SPEC_OpenSpec_Sync 规约同步机制

### 新增规范

- **文件名**: `SPEC_OpenSpec_Sync.md`
- **位置**: `agents/docs/specs/constitution/SPEC_OpenSpec_Sync.md`
- **版本**: 3.10.0
- **状态**: ✅ 已创建

### 核心内容

| 类别 | 内容 |
|------|------|
| 同步原则 | 飞书作为唯一真相源，本地仅作开发参考 |
| 目录结构 | 按需求隔离，每个需求独立目录 |
| 同步时机 | 澄清完成、理解完成、交付完成必须同步 |
| 冲突处理 | 飞书 > 本地 |
| 审计检查 | 理解/交付阶段检查飞书文档 block_count |

### 审计检查清单

- [ ] 本地 proposal.md 存在且内容完整
- [ ] 飞书文档已创建，链接在 feishu-doc-urls.txt
- [ ] 设计方案已同步到飞书
- [ ] 验收报告已同步到飞书
- [ ] 链接已回写本地

### 违规处理

| 级别 | 情况 | 处理 |
|------|------|------|
| 🔴 严重 | 交付阶段飞书文档为空 | 立即补充，拒绝交付 |
| 🟡 一般 | 同步延迟 > 24h | 提醒同步 |
| 🟢 轻微 | 链接未回写 | 建议改进 |

---

## 2026-03-21: 主 Agent 配置审查与修正（V3.10.0）

### 📋 发现的问题

| # | 问题 | 严重性 |
|---|------|--------|
| 1 | CONSTITUTION.md footer 版本号 V3.9.0，与顶部 V3.10.0 不一致 | 🔴 |
| 2 | AGENTS.md 引用不存在的 `agents/constitution/README.md` | 🔴 |
| 3 | CONSTITUTION.md 两处飞书链接标注"待创建"但无实际链接 | 🟡 |
| 4 | CONSTITUTION.md 声称"唯一入口"但智能体实际读各自 AGENTS.md，语义歧义 | 🟡 |
| 5 | AGENTS.md 缺少身份声明（未明确"我就是银河导航员"） | 🟡 |
| 6 | TEAM_ROLES.md 参考文档 4 个路径全部错误（裸文件名不存在） | 🔴 |
| 7 | CONSTITUTION.md 末尾引用不存在的 README.md | 🟡 |

### ✅ 已修正内容

| # | 文件 | 修正 |
|---|------|------|
| 1 | `CONSTITUTION.md` | footer 版本号 V3.9.0 → **V3.10.0**（2026-03-19），审查日期 2026-04-12 → **2026-04-19** |
| 2 | `CONSTITUTION.md` | "唯一入口"说明 → **"宪法规范索引（唯一权威来源）"**，注明智能体实际读 `agents/constitution/<agent>/AGENTS.md` |
| 3 | `CONSTITUTION.md` | 末尾 README.md → `../constitution/TEAM_ROLES.md` |
| 4 | `CONSTITUTION.md` | 两处"待创建"飞书链接 → 改为"该规范无需飞书同步，本地文件为主" |
| 5 | `AGENTS.md` | 顶部添加身份声明（银河导航员 🧭，遵循 V3.10.0，引用 GALAXY_NAVIGATOR.md） |
| 6 | `AGENTS.md` | 更多细节添加 GALAXY_NAVIGATOR.md 和 TEAM_ROLES.md 引用；原不存在 README 引用已修正 |
| 7 | `TEAM_ROLES.md` | 参考文档 4 个路径全部修正为相对路径 |

### 📐 修正后架构

```
agents/docs/specs/constitution/CONSTITUTION.md
  = 宪法规范索引（唯一权威来源）
  └── 索引 ../constitution/TEAM_ROLES.md（目录结构说明）

agents/constitution/
  ├── GALAXY_NAVIGATOR.md  ← 银河导航员（主 Agent）职责定义
  ├── TEAM_ROLES.md        ← 8 大智能体昵称与协作流程
  └── <8个智能体>/AGENTS.md ← 各智能体执行依据

AGENTS.md（workspace根目录）
  = 主 Agent（银河导航员）工作区入口
  ├── 声明身份 + 遵循 V3.10.0
  └── 引用 GALAXY_NAVIGATOR.md + CONSTITUTION.md（宪法索引）
```

### 💡 关键经验

- **宪法权威来源**：CONSTITUTION.md 是规范索引，各 AGENTS.md 是执行依据，两级分离
- **主 Agent 身份**：AGENTS.md 必须明确声明自己是"银河导航员"，避免职责模糊
- **路径引用必须验证**：所有 markdown 引用路径在提交前应做 existence check

---

## 2026-03-21: 规约路径重构（openspec/changes → project/{项目名}/changes/{需求名}）

### 📋 问题
- `openspec/changes/{项目名}/` 路径不合理：所有需求混在一个目录，不支持多需求并行
- 与 V3.7.1 需求级并行架构不匹配

### ✅ 已完成

**规范文件路径引用更新（16个文件）：**
- `AGENTS.md` — 所有命令模板 + 路径定义
- `SPEC_OpenSpec_Sync.md` — 规约隔离结构
- `CONSTITUTION_PARALLEL.md` — 示例路径
- `CONSTITUTION_DIRECTORY_STANDARD.md` — 目录规范
- `OPENSPEC_GUIDE.md` — 示例路径
- `REPOSITORY_GOVERNANCE.md` — 治理规则
- `summary-reflection/AGENTS.md` — 报告路径
- 技能文件：skill-05/06/07/16 + audit 相关 SKILL.md/README.md（共14个文件）

**实际目录迁移：**
```
openspec/changes/
├── all-skills-delivery/      → project/all-skills-delivery/changes/phase1/
├── constitution-v3.10.0/    → project/constitution/changes/v3.10.0/
├── constitution-v3.7.4/     → project/constitution/changes/v3.7.4/
├── ecommerce-mvp/            → project/ecommerce-mvp/changes/init/
└── fitbot-pro/               → project/fitbot-pro/changes/init/
```

### 📐 新路径规范

```
project/{项目名}/changes/{需求名}/
├── proposal.md              # 需求提案
├── specs/requirements.md   # 详细需求
├── design.md               # 技术设计
├── tasks.md               # 任务清单
└── （交付物：代码等）
```

### ⚠️ 未修改（历史记录）
- `CONSTITUTION_UPGRADE_AND_LAYOUT_PLAN.md` — V3.7.3→v3.7.4 历史迁移记录，保留原路径
- `ITERATION_PROCESS.md` — 历史引用
- 审计日志 — 历史快照
- `openspec/` 目录结构（assets/ 保留，changes/ 已清空）

---

**最后更新**: 2026-03-21 08:56
---

## 2026-03-21: Rokid Glasses × OpenClaw Channel 项目

### 📋 项目概述

**项目名称**: rokid-glass-channel  
**阶段**: Phase 1 - 语音指令传达 + 响应反馈  
**状态**: ⏸️ 暂停中（等待环境准备）

### ✅ 已完成

| 模块 | 状态 |
|------|------|
| OpenClaw Channel Plugin | ✅ 代码完成，已编译 |
| Android APP | ✅ 代码完成 |
| 规约文档 v1.2.0 | ✅ |
| 验收报告 | ✅ |
| 联调手册 | ✅ |
| 测试检查表 | ✅ |
| 飞书同步 | ✅ |

### ⏸️ 暂停原因

- Android SDK 未安装
- Android Studio 未安装
- 无法编译 APK

### ⏭️ 下一步

1. 安装 Android Studio / Android SDK
2. 编译 APK
3. 真机联调测试（M3 阶段）

### 📁 项目文件

- 代码: `project/rokid-glass-channel/`
- 规约: `project/rokid-glass-channel/changes/phase1-voice/`
- 联调文档: `project/rokid-glass-channel/docs/`
- 待办事项: `memory/rokid-glass-channel-pause.md`

### 🔗 飞书文档

| 文档 | 链接 |
|------|------|
| 需求规范 | https://feishu.cn/docx/JYyBdFJ0so6TVIxvS0hctSPPnFe |
| 技术设计 | https://feishu.cn/docx/Uwpud8PtuoXJ0Vx6p4kcanA2n9Y |
| 任务清单 | https://feishu.cn/docx/GTpAd3OnJogTBkxr3gccUnzpnNe |
| 验收报告 | https://feishu.cn/docx/W3YjdJOf0oMOYvxEpYochy9knZd |
| 联调手册 | https://feishu.cn/docx/S4G5derCvoVuFzxQq3jc1gufnLg |
| 测试检查表 | https://feishu.cn/docx/X9vWdOHWYoDw7Ix4pLUcSGAHnOf |

---

**最后更新**: 2026-03-21 14:21
