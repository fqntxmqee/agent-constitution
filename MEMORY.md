# MEMORY.md - 长期记忆

> 本文件记录重要决策、经验教训、规范变更等需要长期保留的信息

**归档说明**: 2026-03-09 至 03-15 的历史记录已归档至 `memory/2026-03-09-to-03-15-constitution-upgrades.md`

---

## 2026-03-23: V3.13.0 - 移除强制 ACP 模式

### 📜 规范升级

- **从 V3.12.0 升级到 V3.13.0**
- **升级日期**: 2026-03-23
- **冷静期**: 24 小时（Type-B 变更）
- **生效日期**: 2026-03-24 23:13
- **状态**: ✅ 已生效（冷静期已结束）

### 🎯 核心变更

**移除强制 ACP 模式要求**：
- V3.12.0: 需求解决智能体**必须**使用 `runtime="acp"`
- V3.13.0: 智能体**自主选择**执行方式（ACP / Subagent / 直接工具调用）

### 📝 变更原因

1. 强制 ACP 在简单场景下增加不必要开销
2. 智能体需要根据任务复杂度灵活选择执行方式
3. Subagent 在简单任务中更高效

### 📋 升级流程（已执行）

1. ✅ summary-reflection 生成升级提案
2. ✅ 飞书文档创建并补充内容
3. ✅ 用户确认（2026-03-23 23:12）
4. ✅ audit 审计验证（6/6 通过）
5. ✅ Git 提交 + 推送
6. ✅ V3.13.0 备份完成
7. ⏳ 冷静期 24 小时

### 📁 更新的文件

| 文件 | 变更 |
|------|------|
| `AGENTS.md` | 移除 ACP 强制规范，新增执行方式选择规范 |
| `CONSTITUTION.md` | 版本号 V3.12.0 → V3.13.0 |
| `CHANGELOG.md` | 新增 V3.13.0 变更记录 |
| `requirement-resolution/AGENTS.md` | 执行方式自主选择说明 |
| `audit/AGENTS.md` | 审计检查从 runtime 改为 sessions_spawn |

### ⚠️ 保留铁律

- ❌ 禁止主会话直接 `write`/`edit` 业务代码到 `/project/` 或 `/src/`
- ✅ 必须通过 `sessions_spawn` 派发任务给子智能体
- ✅ 子智能体可自主选择执行方式

### 💡 执行方式选择建议

| 方式 | 适用场景 |
|------|----------|
| ACP (`runtime="acp"`) | 复杂开发任务、需要完整项目上下文 |
| Subagent (`runtime="subagent"`) | 简单任务、单文件修改、配置调整 |
| 直接工具调用 | 单一操作（read/write/exec） |

### 🔗 相关链接

- 飞书提案：https://feishu.cn/docx/HB00d6o47oud7rxnJRfcl4gbnBh
- 决策记录：`agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/DECISION_LOG.md`
- 审计报告：`agents/docs/versions/V3.12.0/constitution/upgrade-to-V3.13.0/audit-report.md`

---

## 2026-03-22: V3.12.0 正式生效 + ACP 空会话分析

### 📜 版本状态
- **宪法规范版本**: V3.12.0 ✅ 今日正式生效
- **V3.11.0**: 2026-03-22 15:17 冷静期结束，已并入 V3.12.0

### 🔍 ACP Cursor 会话问题分析

#### 问题发现
- **12 个 ACP cursor 会话**全部 `messages: []`，属于残留会话记录
- Portfolio T-01 脚手架任务**至少重试了 5 次**，全部立即以 `acpx exited with code 1` 失败

#### 根因确认
| 原因 | 证据 |
|------|------|
| `cursor-agent acp` 命令存在但 Cursor 模型服务不可用 | 所有会话在 phase:start 后 2-3 秒即 phase:error，退出码 1 |
| 不是网络/权限问题 | acpx 进程启动成功（phase:start 记录存在） |
| 不是 CLI 版本问题 | cursor-agent 版本 2026.02.27-e7d2ef6 |

#### 会话分类
| 类型 | 数量 | 最后更新时间 |
|------|------|-------------|
| Portfolio T-01 重试会话 | 5 个 | 14:10 (ee68f330) |
| ACP 测试会话 | 1 个 | 03-20 |
| 其他 agent ACP 后台调用 | 5+ 个 | 分散 |

#### 关键证据（acp-stream.jsonl）
```
所有失败会话共同模式:
1. lifecycle/phase:start (启动成功)
2. ~2-3 秒后 lifecycle/phase:error
3. error: "acpx exited with code 1"
4. cursor stream relay timed out after 21600s (6 小时超时)
```

#### 结论
- **Cursor ACP 模式根本不可用**，不是暂时故障
- 建议切换到其他 ACP agent（如 `pi`、`codex`、`claude`）
- 或回退为 **`sessions_spawn(runtime="subagent")`** 由子会话执行业务代码（已不再使用 Cursor CLI `cursor agent --print` 路径）

#### 待用户决策
- [ ] 是否切换到其他 ACP agent？
- [ ] 是否临时授权 write 工具绕过 ACP 限制？

---

## 2026-03-21 15:25: V3.11.0 升级

### 📜 规范版本
- **从 V3.10.0 升级到 V3.11.0**
- **生效日期**: 2026-03-22（冷静期后）
- **状态**: ✅ 已提交 Git + 推送

### 🎯 核心变更（借鉴 BMAD Method）

| # | 改进项 | 来源 |
|---|--------|------|
| P0-1 | Story File 上下文工程化 | BMAD Story File |
| P0-2 | 需求复杂度评级（C/B/A/S） | BMAD 自适应路径 |
| P1-3 | Clarification 拆分为 Analysis + Clarification | BMAD 分析阶段 |
| P1-4 | 8 个智能体 SOP 清单化 | BMAD SOP 清单 |

### 📋 决策记录
- DEC-031: Story File 上下文工程化
- DEC-032: 需求复杂度评级机制
- DEC-033: Clarification 阶段拆分
- DEC-034: 智能体 SOP 清单化

### 📁 新增文档
- `story/STORY_FILE_SPEC.md`
- `DEC-031~034.md`
- `DECISION_LOG.md`

### ⚠️ Type-B 冷静期
- 冷静期：24h（2026-03-22 15:17 截止）
- V3.11.0 将在冷静期后正式生效

### 💡 经验
- 3 个子智能体并行更新 SOP 章节，总耗时 1m32s
- Story File 规范设计参考了 BMAD Story File 上下文工程化理念
- Git Hook 自动备份机制在提交时触发

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
  └── <8 个智能体>/AGENTS.md ← 各智能体执行依据

AGENTS.md（workspace 根目录）
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

**规范文件路径引用更新（16 个文件）：**
- `AGENTS.md` — 所有命令模板 + 路径定义
- `SPEC_OpenSpec_Sync.md` — 规约隔离结构
- `CONSTITUTION_PARALLEL.md` — 示例路径
- `CONSTITUTION_DIRECTORY_STANDARD.md` — 目录规范
- `OPENSPEC_GUIDE.md` — 示例路径
- `REPOSITORY_GOVERNANCE.md` — 治理规则
- `summary-reflection/AGENTS.md` — 报告路径
- 技能文件：skill-05/06/07/16 + audit 相关 SKILL.md/README.md（共 14 个文件）

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

## 2026-03-22 20:29: Self-Improving Proactive Agent 安装与整合

### 📥 已安装
- `skill-vetter` (1.0.0) - 安全审查，即装即用
- `self-improving-proactive-agent` (1.0.0) - 自提升主动智能体
- `summarize` (1.0.0) - CLI 工具，需安装 `brew install steipete/tap/summarize`

### 🔗 与 summary-reflection 整合

| 系统 | 性质 | 触发 |
|------|------|------|
| `summary-reflection` 智能体 | 离线深度分析 | 每日 23:00 + 任务完成后 |
| `~/self-improving/` | 实时轻量学习 | 每个 session 持续 |
| `~/proactivity/` | 主动执行状态 | 每次 heartbeat |

**整合原则**：不重叠，互相补强。summary-reflection 产出改进方案 → 写入 corrections.md → 用户确认后 promote 到 memory.md。

### 📁 目录结构
```
~/self-improving/          # 持久学习
~/proactivity/             # 主动执行
```

### ⚠️ 下次 session 验证
- [ ] 验证 ~/self-improving/ 和 ~/proactivity/ 文件存在
- [ ] HEARTBEAT.md 主动心跳行为是否生效

---

## ⚠️ 铁律（2026-03-23 追加）

**禁止主会话直接写业务代码到 project/src 目录**
- 触发：`write`/`edit` 目标含 `/project/` 或 `/src/` → 必须走 `sessions_spawn`
- 绝不允许用"用户授权豁免"绕过
- ACP 不可用 → 尝试 subagent → 绝不允许主会话直接 write
- 违反 = 严重违规，标记 PROCESS_VIOLATION

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

- 代码：`project/rokid-glass-channel/`
- 规约：`project/rokid-glass-channel/changes/phase1-voice/`
- 联调文档：`project/rokid-glass-channel/docs/`
- 待办事项：`memory/rokid-glass-channel-pause.md`

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

**最后更新**: 2026-03-24 08:37  
**归档后大小**: ~400 行（原 825 行）  
**归档内容**: `memory/2026-03-09-to-03-15-constitution-upgrades.md`
