# V3.13.0 文件变更清单

**升级版本**: V3.12.0 → V3.13.0  
**变更日期**: 2026-03-23  
**变更类型**: Type-B (Minor 变更)  

---

## 📝 文件 1: AGENTS.md

### 位置
`/Users/fukai/project/openclaw-workspace/AGENTS.md`

### 变更类型
修订（重大修订）

### 具体变更

#### 删除章节：ACP Harness 强制规范

**删除以下内容**（约 150 行）：

```markdown
### ⚠️ ACP Harness 强制规范（V3.7.2 · 2026-03-12 更新）

**核心规则：** 需求理解、需求解决、需求验收、需求交付智能体必须使用 `runtime="acp"`，禁止使用 `runtime="subagent"`。

**适用智能体：**
- ✅ `requirement-understanding`（需求理解）- 需要读取项目上下文生成规约
- ✅ `requirement-resolution`（需求解决）- 需要完整项目上下文编写代码
- ✅ `requirement-acceptance`（需求验收）- 需要运行测试、代码审查
- ✅ `requirement-delivery`（需求交付）- 需要 Git 操作、环境检查

**正确用法：**
```python
# 需求理解
sessions_spawn(
    runtime="acp",                    # ← 必须用 acp，不是 subagent
    agentId="requirement-understanding",
    label="requirement-understanding-xxx",
    task="按澄清提案产出 OpenSpec 规约"
)

# 需求解决
sessions_spawn(
    runtime="acp",                    # ← 必须用 acp，不是 subagent
    agentId="requirement-resolution",
    label="requirement-resolution-xxx",
    task="按 tasks.md 执行，使用 Cursor CLI"
)

# 需求验收
sessions_spawn(
    runtime="acp",                    # ← 必须用 acp，不是 subagent
    agentId="requirement-acceptance",
    label="requirement-acceptance-xxx",
    task="按 AC 逐项验收，独立验证"
)

# 需求交付
sessions_spawn(
    runtime="acp",                    # ← 必须用 acp，不是 subagent
    agentId="requirement-delivery",
    label="requirement-delivery-xxx",
    task="Git 提交、部署、交付报告"
)
```

**错误用法（禁止）：**
```python
# ❌ 禁止这样用！
sessions_spawn(
    runtime="subagent",      # ← 错误！subagent 没有 Cursor 上下文
    agentId="requirement-understanding",  # 或其他三个智能体
    label="requirement-xxx",
    task="..."
)
```

**为什么必须用 ACP：**
1. OpenClaw 在 `runtime="acp"` 下拉起 **Cursor CLI** 的 ACP 服务端：`agent acp`（与 `cursor agent acp` 等价，取决于 PATH 中的可执行文件名），经 **stdio + JSON-RPC** 与宿主集成；在工作区上下文中执行，不限于仅在 Cursor 桌面 IDE 内使用（参见 [Using Agent in CLI — ACP](https://cursor.com/docs/cli/acp)）
2. **回退路径**：无法使用 ACP 时，可用 `cursor agent --print`（官方称为非交互 / headless 模式，见 [Using Agent in CLI — Non-interactive](https://cursor.com/docs/cli/using)）委托 Cursor 完成步骤，工具能力与 CLI 一致
3. 符合宪法规范要求（开发类任务必须通过 Cursor CLI，禁止在无 harness 下直接 `write` 业务代码）
4. `runtime="subagent"` 不具备上述 Cursor CLI harness，无法可靠完成开发类任务

**各智能体使用 Cursor CLI 的原因：**
| 智能体 | 为什么需要 Cursor CLI |
|--------|----------------------|
| 需求理解 | 读取项目代码结构、技术栈、依赖关系，生成贴合实际的规约 |
| 需求解决 | 编写代码、运行自测、修复循环 |
| 需求验收 | 运行测试套件、代码审查、安全扫描、一致性比对 |
| 需求交付 | Git 操作、环境检查、敏感信息扫描 |
```

#### 新增章节：执行方式选择规范

**新增以下内容**（约 80 行）：

```markdown
### 🎯 执行方式选择规范（V3.13.0 · 2026-03-23 更新）

**核心规则：** 智能体应根据任务复杂度自主选择执行方式，优先保证效率与质量的平衡。

**执行方式对比：**

| 执行方式 | 适用场景 | 优势 | 局限 |
|---------|---------|------|------|
| `runtime="acp"` | 复杂开发任务、需要完整项目上下文、多文件修改 | 完整上下文、Cursor 工具链、代码审查能力 | 启动开销较大 |
| `runtime="subagent"` | 简单任务、单文件修改、配置调整、文档更新 | 快速启动、轻量级、低开销 | 无 Cursor 上下文 |
| 直接工具调用 | 单一操作（如 read/write/exec） | 即时执行、无额外开销 | 无智能体能力 |

**推荐用法：**

```python
# 复杂开发任务（推荐 ACP）
sessions_spawn(
    runtime="acp",                    # ← 复杂任务推荐
    agentId="requirement-resolution",
    label="requirement-resolution-xxx",
    task="按 tasks.md 执行，使用 Cursor CLI"
)

# 简单配置调整（可用 Subagent）
sessions_spawn(
    runtime="subagent",               # ← 简单任务可用
    agentId="requirement-resolution",
    label="config-update-xxx",
    task="修改配置文件 XXX，添加 YYY 设置"
)

# 单一文件读取（直接工具调用）
read(path="config.yaml")              # ← 无需 spawn 智能体
```

**铁律（保留）：**
- ❌ 禁止主会话直接 `write` 业务代码
- ✅ 开发类任务应通过子智能体执行（ACP 或 Subagent）
- ✅ 多文件修改、代码审查、测试运行等复杂任务优先使用 ACP

**决策指南：**

```
任务复杂度评估：
├─ 单文件修改？ → Subagent
├─ 多文件修改？ → ACP
├─ 需要代码审查？ → ACP
├─ 需要运行测试？ → ACP
├─ 配置/文档更新？ → Subagent
└─ 不确定？ → 优先 ACP（安全选择）
```
```

#### 修订表格：子 Agent 工作区与职责

**原表格**：

| Agent ID | 名称 | 职责摘要 |
|----------|------|----------|
| requirement-understanding | 需求理解 | 将用户需求转化为标准化规约（OpenSpec：proposal、specs、design、tasks） |
| requirement-clarification | 需求澄清 | 识别模糊/矛盾/缺失，产出澄清清单，用户确认后再执行 |
| requirement-resolution | 需求解决 | 优先在 ACP（`runtime="acp"`）下按 Specs/Tasks 执行；回退时用 `cursor agent --print`；最小化修改；禁止 write 写业务代码 |
| requirement-acceptance | 需求验收 | 交付物与规约逐项核对，通过后方可进入交付阶段 |
| requirement-delivery | 需求交付 | Git 提交、部署、交付报告 |
| progress-tracking | 进展跟进 | 监控各子智能体状态，周期汇报 |
| audit | 审计 | 合规监察（无规约开发、未用 Cursor CLI、部署不规范等） |
| summary-reflection | 总结反思 | 日志分析、亮点沉淀、问题改进 |

**修订后表格**：

| Agent ID | 名称 | 职责摘要 | 推荐执行方式 |
|----------|------|----------|-------------|
| requirement-understanding | 需求理解 | 将用户需求转化为标准化规约（OpenSpec：proposal、specs、design、tasks） | ACP（需要项目上下文） |
| requirement-clarification | 需求澄清 | 识别模糊/矛盾/缺失，产出澄清清单，用户确认后再执行 | Subagent 或 ACP |
| requirement-resolution | 需求解决 | 按 Specs/Tasks 执行开发任务 | ACP（复杂）或 Subagent（简单） |
| requirement-acceptance | 需求验收 | 交付物与规约逐项核对，通过后方可进入交付阶段 | ACP（需要测试/审查） |
| requirement-delivery | 需求交付 | Git 提交、部署、交付报告 | ACP 或 Subagent |
| progress-tracking | 进展跟进 | 监控各子智能体状态，周期汇报 | Subagent |
| audit | 审计 | 合规监察（无规约开发、未用 Cursor CLI、部署不规范等） | Subagent |
| summary-reflection | 总结反思 | 日志分析、亮点沉淀、问题改进 | Subagent |

#### 修订：Development Rules 章节

**原内容**：
```markdown
**V3.12.0 核心新增（冷静期中，提前知）**：
- **飞书链接发送强制化**：所有用户确认节点，必须先发飞书文档链接给用户，用户确认后才能进入下一阶段
```

**新增内容**：
```markdown
**V3.13.0 核心新增（本次升级）**：
- **执行方式自主选择**：移除 `runtime="acp"` 强制要求，智能体可根据任务复杂度自主选择执行方式
- **保留铁律**：继续禁止主会话直接 `write` 业务代码
```

---

## 📝 文件 2: CONSTITUTION.md

### 位置
`agents/docs/specs/constitution/CONSTITUTION.md`

### 变更类型
修订（版本号更新）

### 具体变更

#### 版本号更新

**原内容**：
```markdown
# 智能体协同系统宪法规范（当前生效）

**版本号**: V3.12.0
**生效日期**: 2026-03-22
**状态**: ✅ 已生效
```

**变更后**：
```markdown
# 智能体协同系统宪法规范（当前生效）

**版本号**: V3.13.0
**生效日期**: 2026-03-23（待确认）
**状态**: 🕐 冷静期中
```

#### 变更日志引用更新

**原内容**：
```markdown
**最新版本**: V3.10.0 (2026-03-19)
```

**变更后**：
```markdown
**最新版本**: V3.13.0 (2026-03-23)
```

#### 规范版本更新

**原内容**：
```markdown
**规范版本**: V3.11.0  
**生效日期**: 2026-03-22  
**下次审查**: 2026-04-22
```

**变更后**：
```markdown
**规范版本**: V3.13.0  
**生效日期**: 2026-03-23（待确认）  
**下次审查**: 2026-04-23
```

---

## 📝 文件 3: CHANGELOG.md

### 位置
`agents/docs/specs/constitution/CHANGELOG.md`

### 变更类型
新增（在顶部插入新记录）

### 具体变更

#### 新增 V3.13.0 记录

**在顶部插入以下内容**：

```markdown
# 宪法规范变更日志

## V3.13.0 (2026-03-23)

### 修订

**执行方式选择规范（移除 ACP 强制）**
- 移除 `runtime="acp"` 强制要求（DEC-041）
- 允许智能体根据任务复杂度自主选择执行方式（ACP / Subagent / 直接工具调用）
- 新增执行方式选择指南和决策矩阵
- 保留铁律：禁止主会话直接 `write` 业务代码

**AGENTS.md 更新**
- 删除「ACP Harness 强制规范」章节（V3.7.2 引入）
- 新增「执行方式选择规范」章节
- 更新子 Agent 工作区与职责表（增加推荐执行方式列）
- 更新 Development Rules 章节（V3.13.0 新增说明）

### 变更依据

- 用户指令：2026-03-23 GMT+8
- 决策记录：DEC-041
- 升级提案：`agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/proposal.md`

### 问题解决

- 解决简单任务被迫使用 ACP 导致效率低下的问题
- 解决智能体无法根据任务特点选择最优执行方式的问题
- 解决 Subagent 在简单场景中优势被强制禁止的问题

### 保留原则

- 继续禁止主会话直接 `write` 业务代码（铁律）
- 复杂任务仍推荐使用 ACP（完整上下文、代码审查能力）
- 审计智能体继续监督合规性

---

## V3.12.0 (2026-03-22)
...（原有内容保持不变）
```

---

## 📊 变更统计

| 文件 | 变更类型 | 新增行数 | 删除行数 | 修改行数 |
|------|---------|---------|---------|---------|
| AGENTS.md | 修订 | ~80 | ~150 | ~20 |
| CONSTITUTION.md | 修订 | ~5 | ~5 | ~5 |
| CHANGELOG.md | 新增 | ~40 | 0 | 0 |
| **合计** | - | **~125** | **~155** | **~25** |

---

## ✅ 执行清单

### 用户确认后执行

- [ ] 备份当前文件（确认 V3.12.0 备份已存在）
- [ ] 修改 AGENTS.md（删除 ACP 强制规范，新增执行方式选择规范）
- [ ] 修改 CONSTITUTION.md（版本号更新）
- [ ] 修改 CHANGELOG.md（新增 V3.13.0 记录）
- [ ] 提交 Git 变更（Conventional Commits）
- [ ] 通知 audit 智能体验证
- [ ] 等待 24 小时冷静期
- [ ] 正式生效

---

**变更清单版本**: 1.0  
**创建时间**: 2026-03-23  
**状态**: 待用户确认
