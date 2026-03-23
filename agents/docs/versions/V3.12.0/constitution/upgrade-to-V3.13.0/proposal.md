# 宪法规范迭代提案 (V3.12.0 → V3.13.0)

**提案编号**: UPG-013  
**提案日期**: 2026-03-23  
**提案人**: summary-reflection (subagent 代理)  
**变更类型**: Type-B (Minor 变更 - 流程优化)  
**冷静期**: 24 小时  

---

## 📋 变更概览

| 章节 | 变更类型 | 变更摘要 | 优先级 |
|------|---------|---------|--------|
| AGENTS.md - Development Rules | 修订 | 移除 `runtime="acp"` 强制要求 | P0 |
| AGENTS.md - ACP Harness 强制规范 | 修订 | 改为推荐 ACP，允许自主选择 | P0 |
| AGENTS.md - 子 Agent 工作区与职责表 | 修订 | 更新需求解决智能体描述 | P1 |
| CONSTITUTION.md | 修订 | 版本号更新 V3.12.0 → V3.13.0 | P1 |
| CHANGELOG.md | 新增 | V3.13.0 变更记录 | P1 |

---

## 🎯 变更背景与动机

### 当前问题

V3.7.2 引入的 `runtime="acp"` 强制规范在早期确保了开发类任务的代码质量和上下文完整性，但在实际运行中发现以下问题：

1. **过度约束**: 某些简单任务（如单文件修改、配置调整）无需完整 Cursor 上下文，强制 ACP 增加不必要开销
2. **灵活性不足**: 智能体无法根据任务复杂度自主选择最优执行方式
3. **Subagent 能力被低估**: 简单任务使用 Subagent 更高效，但被强制禁止

### 变更目标

1. **移除强制约束**: 不再强制要求 `runtime="acp"`
2. **赋予自主权**: 允许智能体根据任务复杂度自主选择执行方式（ACP / Subagent / 直接工具调用）
3. **保留核心铁律**: 继续禁止主会话直接 `write` 业务代码

---

## 📝 变更对比

### 变更前（V3.12.0）

**AGENTS.md - ACP Harness 强制规范章节**:

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
```

### 变更后（V3.13.0）

**AGENTS.md - 执行方式选择规范（新增章节）**:

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
```

**铁律（保留）：**
- ❌ 禁止主会话直接 `write` 业务代码
- ✅ 开发类任务应通过子智能体执行（ACP 或 Subagent）
- ✅ 多文件修改、代码审查、测试运行等复杂任务优先使用 ACP
```

**AGENTS.md - 子 Agent 工作区与职责表（修订）**:

| Agent ID | 名称 | 职责摘要 | 推荐执行方式 |
|----------|------|----------|-------------|
| requirement-understanding | 需求理解 | 将用户需求转化为标准化规约 | ACP（需要项目上下文） |
| requirement-clarification | 需求澄清 | 识别模糊/矛盾/缺失，产出澄清清单 | Subagent 或 ACP |
| requirement-resolution | 需求解决 | 按 Specs/Tasks 执行开发任务 | ACP（复杂）或 Subagent（简单） |
| requirement-acceptance | 需求验收 | 交付物与规约逐项核对 | ACP（需要测试/审查） |
| requirement-delivery | 需求交付 | Git 提交、部署、交付报告 | ACP 或 Subagent |
| progress-tracking | 进展跟进 | 监控各子智能体状态，周期汇报 | Subagent |
| audit | 审计 | 合规监察 | Subagent |
| summary-reflection | 总结反思 | 日志分析、亮点沉淀、问题改进 | Subagent |
```

---

## 🔍 影响分析

### 影响智能体

| 智能体 | 影响程度 | 说明 |
|--------|---------|------|
| requirement-understanding | 低 | 仍推荐 ACP（需要项目上下文） |
| requirement-clarification | 中 | 可根据任务选择 Subagent |
| requirement-resolution | 高 | 获得自主选择权，简单任务可用 Subagent |
| requirement-acceptance | 低 | 仍推荐 ACP（需要测试/审查能力） |
| requirement-delivery | 中 | Git 操作可用 Subagent |
| progress-tracking | 无变化 | 继续使用 Subagent |
| audit | 无变化 | 继续使用 Subagent |
| summary-reflection | 无变化 | 继续使用 Subagent |

### 影响流程

- **需求解决流程**: 智能体可自主选择执行方式，按任务复杂度决策
- **主会话派发**: 不再强制指定 `runtime="acp"`，由子智能体自主决定
- **审计检查**: 审计清单移除 `runtime="acp"` 强制检查项

### 影响评估

| 维度 | 评估 |
|------|------|
| **开发工作量** | 约 0.5 小时（文档修改） |
| **测试工作量** | 无需测试（文档变更） |
| **文档工作量** | 约 0.5 小时（本提案 + 决策记录 + 变更日志） |
| **风险等级** | 低（保留铁律，仅移除执行方式约束） |

### 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| 智能体滥用 Subagent 导致质量问题 | 中 | 中 | 保留铁律 + 审计监督 |
| 复杂任务误用 Subagent | 低 | 中 | 智能体 SOP 中明确推荐 |
| 主会话直接 write 代码 | 低 | 高 | 铁律保留 + 审计检查 |

---

## ✅ 用户确认项

⚠️ 以下变更需用户确认后才能生效：

- [ ] 移除 `runtime="acp"` 强制要求
- [ ] 允许智能体自主选择执行方式（ACP / Subagent / 直接工具调用）
- [ ] 保留铁律：禁止主会话直接 `write` 业务代码
- [ ] 更新 AGENTS.md 执行方式选择规范
- [ ] 更新 CONSTITUTION.md 版本号 V3.12.0 → V3.13.0

---

## 📁 文件修改清单

### 需要修改的文件

| 文件路径 | 变更类型 | 变更摘要 |
|---------|---------|---------|
| `AGENTS.md` | 修订 | 移除 ACP 强制规范，新增执行方式选择规范 |
| `agents/docs/specs/constitution/CONSTITUTION.md` | 修订 | 版本号 V3.12.0 → V3.13.0 |
| `agents/docs/specs/constitution/CHANGELOG.md` | 新增 | V3.13.0 变更记录 |

### 需要创建的文件

| 文件路径 | 说明 |
|---------|------|
| `agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/proposal.md` | 本提案 |
| `agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/DECISION_LOG.md` | 决策记录 |
| `agents/docs/versions/V3.12.0/constitution/backup/` | 备份目录（确认存在） |

---

## 📋 备份清单

### V3.12.0 备份确认

**备份目录**: `agents/docs/versions/V3.12.0/constitution/`

**备份文件清单**:
- [x] `CONSTITUTION.md` - 宪法索引
- [x] `CHANGELOG.md` - 变更日志
- [x] `SPEC_OpenSpec_Sync.md` - OpenSpec 同步规范
- [x] `architecture/` - 架构规范目录
- [x] `audit/` - 审计规范目录
- [x] `backup/` - 备份规范目录
- [x] `change-classification/` - 变更分类目录
- [x] `cooling-off/` - 冷静期规则目录
- [x] `decision-recording/` - 决策记录目录
- [x] `delivery/` - 交付规范目录
- [x] `directory-standard/` - 目录标准目录
- [x] `story/` - Story File 目录
- [x] `upgrade/` - 升级流程目录

**备份状态**: ✅ 已存在（2026-03-22 创建）

---

## 📊 审计监督

### 审计检查点

**审计智能体验证项**:
- [ ] 变更是否经过用户确认
- [ ] 备份是否完整（V3.12.0）
- [ ] 铁律是否保留（禁止主会话直接 write）
- [ ] 变更日志是否更新
- [ ] 版本号是否正确

### 审计意见

**审计人**: audit（待填写）  
**审计时间**: （待填写）  
**审计结论**: （待填写）

---

## 📖 参考文档

### 决策记录
- DEC-XXX: 移除 ACP 强制要求（待创建）

### 相关规范
- `agents/docs/specs/constitution/upgrade/ITERATION_PROCESS.md` - 宪法规范迭代流程
- `agents/docs/specs/constitution/audit/AUDIT_CHECKLIST.md` - 审计检查清单
- `agents/docs/specs/constitution/decision-recording/DECISION_RECORDING_RULES.md` - 决策记录规范

---

## 📝 附录：变更详细对比

### AGENTS.md 完整变更 Diff

**删除章节**:
```markdown
### ⚠️ ACP Harness 强制规范（V3.7.2 · 2026-03-12 更新）
...（整个章节删除）
```

**新增章节**:
```markdown
### 🎯 执行方式选择规范（V3.13.0 · 2026-03-23 更新）
...（见上文"变更后"部分）
```

**修订表格**:
```diff
| requirement-resolution | 需求解决 | 优先在 ACP（`runtime="acp"`）下按 Specs/Tasks 执行；回退时用 `cursor agent --print`；最小化修改；禁止 write 写业务代码 |
+| requirement-resolution | 需求解决 | 按 Specs/Tasks 执行开发任务 | ACP（复杂）或 Subagent（简单） |
```

---

**提案版本**: 1.0  
**提案状态**: 待用户确认  
**预计生效时间**: 用户确认 + 24 小时冷静期后
