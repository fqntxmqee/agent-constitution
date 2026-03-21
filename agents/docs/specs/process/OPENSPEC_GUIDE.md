# OpenSpec 规范驱动开发指南

> 版本：v1.0  
> 创建时间：2026-03-06  
> 基于：[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) (28k⭐)

---

## 🎯 核心理念

```
→ fluid not rigid      (灵活而非僵化)
→ iterative not waterfall  (迭代而非瀑布)
→ easy not complex     (简单而非复杂)
→ built for brownfield   (面向现有项目)
→ scalable             (可扩展到企业级)
```

---

## 📋 工作流程

### 标准流程
```
1. /opsx:propose "your idea"  → 创建变更提案
2. /opsx:apply                → 实施任务
3. /opsx:archive              → 归档完成
```

### 产出结构
```
project/add-dark-mode/changes/init/
├── proposal.md    # 为什么做、做什么
├── specs/         # 需求和场景
├── design.md      # 技术方案
└── tasks.md       # 实施清单
```

---

## 🛠️ 安装配置

### 安装 OpenSpec CLI
```bash
npm install -g @fission-ai/openspec@latest
```

### 项目初始化
```bash
cd your-project
openspec init
```

### 更新 Agent 指令
```bash
openspec update
```

---

## 📝 每日资讯推送 - OpenSpec 规范版

### 1. 创建变更提案
```bash
openspec init
/opsx:propose "每日技术资讯自动推送"
```

**生成文件：**
- `project/daily-news-push/changes/init/proposal.md`
- `project/daily-news-push/changes/init/specs/requirements.md`
- `project/daily-news-push/changes/init/design.md`
- `project/daily-news-push/changes/init/tasks.md`

### 2. 提案模板

```markdown
# Proposal: 每日技术资讯自动推送

## Why
- 每日 10:00 自动推送 AI 业界 + GitHub Blog 资讯
- 减少手动收集时间，保持信息同步

## What
- AI 业界日报：20 条（5+3+5+5 结构）
- GitHub Blog 日报：10 条翻译
- 飞书文档 + 消息推送

## Success Criteria
- [ ] 每日 10:00 准时推送
- [ ] 内容符合模板规范
- [ ] 论文/模型含核心思路总结
- [ ] 飞书文档创建成功
```

### 3. 规范模板

```markdown
# Specs: 每日技术资讯推送

## Functional Requirements

### FR-1: AI 业界日报
- FR-1.1: 收集 5 条 AI 业界动态
- FR-1.2: 收集 3 条编程开发新闻
- FR-1.3: 收集 5 篇最新论文（含核心思路）
- FR-1.4: 收集 5 个开源模型（含核心特点）

### FR-2: GitHub Blog 日报
- FR-2.1: 获取 7 篇最新文章
- FR-2.2: 获取 3 条 Changelog 更新
- FR-2.3: 中文翻译（100-150 字摘要）

### FR-3: 推送机制
- FR-3.1: Cron 每日 10:00 触发
- FR-3.2: 飞书文档创建
- FR-3.3: 飞书消息推送

## Non-Functional Requirements

### NFR-1: 性能
- NFR-1.1: 单次执行 < 5 分钟
- NFR-1.2: 数据源超时 < 30 秒

### NFR-2: 可靠性
- NFR-2.1: 失败自动重试 3 次
- NFR-2.2: 错误日志记录
```

### 4. 设计模板

```markdown
# Design: 每日技术资讯推送

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Cron      │ →  │  Push Script │ →  │  Feishu     │
│  10:00      │    │  daily_news  │    │  API        │
└─────────────┘    └──────────────┘    └─────────────┘
                        │
                        ↓
                   ┌──────────────┐
                   │  Data Sources│
                   │ - GitHub Blog│
                   │ - arXiv      │
                   │ - HuggingFace│
                   └──────────────┘
```

## Components

### 1. Cron Scheduler
- 配置：`0 10 * * *`
- 脚本：`scripts/daily_tech_news.sh`

### 2. Data Collector
- GitHub Blog: web_fetch
- arXiv: web_fetch / API
- HuggingFace: browser snapshot

### 3. Content Formatter
- 模板：`agents/AI_NEWS_TEMPLATE.md`
- 规范：论文 100-150 字核心思路
- 规范：模型 100-150 字核心特点

### 4. Feishu Publisher
- 创建文档：feishu_doc.create
- 写入内容：feishu_doc.write
- 推送消息：message.send
```

### 5. 任务清单

```markdown
# Tasks: 每日技术资讯推送

## Phase 1: 基础设施

- [ ] 1.1 安装 OpenSpec CLI
- [ ] 1.2 项目初始化 (openspec init)
- [ ] 1.3 创建变更提案 (/opsx:propose)
- [ ] 1.4 配置 Cron 任务

## Phase 2: 数据源集成

- [ ] 2.1 GitHub Blog 抓取
- [ ] 2.2 arXiv 论文获取
- [ ] 2.3 HuggingFace 模型获取
- [ ] 2.4 错误处理机制

## Phase 3: 内容格式化

- [ ] 3.1 AI 资讯模板 (20 条)
- [ ] 3.2 GitHub 翻译模板 (10 条)
- [ ] 3.3 论文核心思路总结
- [ ] 3.4 模型核心特点总结

## Phase 4: 推送机制

- [ ] 4.1 飞书文档创建
- [ ] 4.2 飞书消息推送
- [ ] 4.3 推送日志记录
- [ ] 4.4 失败重试机制

## Phase 5: 测试验证

- [ ] 5.1 手动测试推送
- [ ] 5.2 Cron 自动触发测试
- [ ] 5.3 错误场景测试
- [ ] 5.4 性能优化
```

---

## 🔧 推荐模型

OpenSpec 最佳实践：
- **规划阶段**: Opus 4.5 / GPT 5.2
- **实施阶段**: Opus 4.5 / GPT 5.2
- **上下文管理**: 实施前清理上下文窗口

---

## 📊 项目结构

```
openclaw-workspace/
├── openspec/
│   └── changes/
│       ├── daily-news-push/
│       │   ├── proposal.md
│       │   ├── specs/
│       │   │   └── requirements.md
│       │   ├── design.md
│       │   └── tasks.md
│       └── sports-content/
│           └── ...
├── scripts/
│   ├── daily_tech_news.sh
│   └── daily_news_push.py
├── agents/
│   ├── AI_NEWS_TEMPLATE.md
│   ├── GITHUB_BLOG_DAILY.md
│   └── OPENSPEC_GUIDE.md
└── daily-content/
    └── YYYY-MM-DD/
```

---

## ✅ 检查清单

### 提案阶段
- [ ] 明确 Why（为什么做）
- [ ] 明确 What（做什么）
- [ ] 定义 Success Criteria

### 规范阶段
- [ ] 功能需求完整（FR）
- [ ] 非功能需求完整（NFR）
- [ ] 需求可测试

### 设计阶段
- [ ] 架构图清晰
- [ ] 组件职责明确
- [ ] 数据流完整

### 实施阶段
- [ ] 按 tasks.md 逐项完成
- [ ] 每项任务可验证
- [ ] 完成后归档

---

## 📚 参考资源

| 文档 | 链接 |
|------|------|
| Getting Started | [docs/getting-started.md](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md) |
| Workflows | [docs/workflows.md](https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md) |
| Commands | [docs/commands.md](https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md) |
| CLI | [docs/cli.md](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md) |
| Concepts | [docs/concepts.md](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) |

---

## 🎯 与现有规范整合

### TOOLS.md 更新
```markdown
### 📋 规范优先原则（OpenSpec 版）

**核心规则：** 开发前必须先创建 OpenSpec 提案和规范

**执行流程：**
1. /opsx:propose "需求描述" → 创建 proposal.md
2. 编写 specs/requirements.md → 定义需求
3. 编写 design.md → 技术方案
4. 编写 tasks.md → 实施清单
5. 按 tasks.md 逐项执行
6. /opsx:archive → 归档
```

---

**状态：** ✅ 规范已创建  
**适用范围：** 所有 AI 辅助开发任务  
**推荐模型：** Opus 4.5 / GPT 5.2
