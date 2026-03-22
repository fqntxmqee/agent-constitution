# Story File 规范

**版本**: 1.0  
**生效日期**: 2026-03-22（V3.11.0）  
**关联决策**: DEC-031  

---

## 一、概述

Story File 是需求开发过程中的**上下文传递容器**，确保多智能体协作时上下文不丢失。

### 设计原则

1. **上下文优先**：每个智能体启动时，首先读取 Story State，了解历史上下文
2. **增量更新**：智能体完成后，只追加新内容，不覆盖历史
3. **DEC 引用**：所有技术决策必须关联到 DEC-XXX 决策记录
4. **用户可见**：所有内容对用户透明，用户可随时查看

---

## 二、目录结构

```
project/{项目名}/changes/{需求名}/
├── proposal.md
├── specs/requirements.md
├── design.md
├── tasks.md
├── story/
│   ├── state.md                    # 核心：当前故事状态（必选）
│   ├── context/
│   │   ├── 001-analysis.md         # 分析阶段上下文
│   │   ├── 002-clarification.md   # 澄清阶段上下文
│   │   ├── 003-understanding.md   # 理解阶段上下文
│   │   ├── 004-resolution.md      # 解决阶段上下文
│   │   └── 005-acceptance.md       # 验收阶段上下文
│   ├── decisions/
│   │   └── index.md               # 决策索引（引用 DEC-XXX）
│   └── feedback/
│       ├── 001-user-feedback.md   # 用户反馈
│       └── 002-system-feedback.md # 系统反馈（如审计）
```

---

## 三、核心文件规范

### 3.1 state.md（必选）

每个需求**必须有且仅有一个** state.md，是上下文传递的核心。

```markdown
# Story State

## 基本信息
| 字段 | 值 |
|------|-----|
| requirementId | req-A |
| 项目名 | example-project |
| 需求名 | user-authentication |
| 复杂度 | B级（普通） |
| 当前阶段 | resolving |
| 活跃子 agent | resolution-reqA-001 |
| 创建时间 | 2026-03-22 09:00 |
| 最后更新 | 2026-03-22 10:30 |

## 上下文链
| 阶段 | 状态 | 完成时间 | 关键产出 |
|------|------|---------|---------|
| analysis | ✅ 完成 | 2026-03-22 09:15 | 分析报告 |
| clarification | ✅ 完成 | 2026-03-22 09:20 | proposal.md |
| understanding | ✅ 完成 | 2026-03-22 09:45 | specs/design/tasks |
| resolution | 🔄 进行中 | 2026-03-22 10:30 | - |
| acceptance | ⏳ 待开始 | - | - |
| delivery | ⏳ 待开始 | - | - |

## 待传递到下一智能体的关键信息
1. [用户强调] 性能优先，P0 级 task 需单独标注
2. [技术决策] 使用 Redis 缓存（见 DEC-031）
3. [可复用] 已有 3 个 L4 功能点（见 design.md §2.3）
4. [风险项] 支付模块需第三方联调，预计延迟 2 天

## 当前阶段详情
### Resolution 进展
- 总 task 数：12
- 已完成：5
- 进行中：2
- 待开始：5
- 阻塞：0

## 更新日志
| 时间 | 阶段 | 操作 | 子 agent |
|------|------|------|---------|
| 09:00 | analysis | 完成 | clarification-reqA-001 |
| 09:20 | clarification | 完成 | clarification-reqA-001 |
| 09:45 | understanding | 完成 | understanding-reqA-001 |
| 10:30 | resolution | 更新进度 | resolution-reqA-001 |
```

---

### 3.2 context/{阶段}.md（必选）

每个阶段完成后，当阶段智能体需创建对应的 context 文件。

**命名规则**：`{序号}_{阶段}.md`（序号从 001 开始）

**必须包含**：
```markdown
# {阶段名称} 上下文

## 阶段信息
| 字段 | 值 |
|------|-----|
| 阶段 | {阶段名} |
| 完成时间 | YYYY-MM-DD HH:MM |
| 子 agent | {agent-name} |
| 运行时长 | Xmin |

## 输入
- 读取了什么文件
- 用户输入内容摘要

## 输出
- 产出的文件列表
- 关键决策摘要

## 关键决策
| 决策 | 内容 | DEC 引用 |
|------|------|---------|
| 01 | XXX 技术选型 | DEC-XXX |

## 用户确认项（如有）
- [ ] 用户确认了 XXX
- [ ] 用户提出了 YYY 修改意见

## 遗留项（传递到下一阶段）
1. ...
```

---

### 3.3 decisions/index.md（必选）

管理当前需求的所有技术决策。

```markdown
# 决策索引

## 决策列表
| # | 决策内容 | 决策时间 | DEC 引用 |
|---|---------|---------|---------|
| 01 | 采用 Redis 缓存方案 | 2026-03-22 09:30 | DEC-031 |
| 02 | 认证方式使用 JWT | 2026-03-22 09:30 | DEC-032 |

## 决策详情

### 01 - Redis 缓存方案
**内容**：用户 session 存储从内存迁移到 Redis  
**理由**：支持分布式部署和会话共享  
**DEC**：DEC-031  
**确认时间**：2026-03-22 09:30  
**确认人**：用户

### 02 - JWT 认证
**内容**：使用 JWT 作为 API 认证机制  
**理由**：无状态、可跨服务、可 OAuth  
**DEC**：DEC-032  
**确认时间**：2026-03-22 09:30  
**确认人**：用户
```

---

### 3.4 feedback/{序号}-{类型}.md（可选）

用户反馈记录。

```markdown
# 用户反馈 #{序号}

## 基本信息
| 字段 | 值 |
|------|-----|
| 反馈时间 | YYYY-MM-DD HH:MM |
| 反馈来源 | 用户/审计/其他 |
| 关联阶段 | resolution |
| 关联 task | task-003 |

## 反馈内容
（原始反馈内容）

## 处理方案
（如何处理这条反馈）

## 状态
- [ ] 已处理
- [ ] 已合并到 tasks
- [ ] 需要用户进一步确认
```

---

## 四、智能体行为规范

### 4.1 读取规则

每个智能体启动时**必须**按以下顺序读取：

1. `story/state.md` — 了解当前状态和上下文链
2. `story/decisions/index.md` — 了解所有技术决策
3. `story/context/{最新}.md` — 了解上一阶段详情
4. `story/feedback/*.md` — 了解所有未处理的反馈

### 4.2 更新规则

智能体完成后**必须**更新：

1. **state.md**：
   - 更新 `当前阶段`
   - 更新 `上下文链`
   - 更新 `待传递信息`
   - 追加 `更新日志`

2. **context/{阶段}.md**（新建）：
   - 创建当前阶段的 context 文件

3. **decisions/index.md**（如有新决策）：
   - 追加新决策条目

### 4.3 禁止行为

- ❌ 禁止删除或覆盖已有 context 文件
- ❌ 禁止在 state.md 中删除历史日志
- ❌ 禁止跳过读取 state.md 直接开始工作
- ❌ 禁止在 context 中记录与需求无关的内容

---

## 五、与 OpenSpec 的关系

| OpenSpec | Story File | 说明 |
|-----------|------------|------|
| proposal.md | context/002-clarification.md | 澄清产出对应上下文 |
| specs/requirements.md | context/003-understanding.md | 理解产出对应上下文 |
| design.md | decisions/index.md | 设计决策在 Story 中索引 |
| tasks.md | context/004-resolution.md | 任务详情在对应阶段上下文 |

**核心区别**：
- OpenSpec 是**规约**（应该做什么）
- Story File 是**过程记忆**（做了什么、怎么做的、为什么）

---

## 六、示例

详见：`project/constitution/changes/v3.11.0/examples/story-example/`

---

**规范版本**: 1.0  
**创建日期**: 2026-03-21  
**关联决策**: DEC-031  
**下次审查**: 2026-06-21