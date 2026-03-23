# Self-Improving Memory (HOT)

> 持久偏好和已确认的复用规则

---

## 🏷️ 元信息
- 版本: 1.0.0
- 创建日期: 2026-03-22
- 上次更新: 2026-03-23

---

## 📌 确认的持久偏好

### constitution（2026-03-23 promote）

| 规则 | 说明 | 来源 | 确认日期 |
|------|------|------|----------|
| 主会话禁止直接写业务代码 | `write`/`edit` 到 `project/src` 路径，必须走 `sessions_spawn` | corrections | 2026-03-23 |
| "用户授权"不可作为违反宪法规范的借口 | 任何授权都不能凌驾于宪法铁律之上 | corrections | 2026-03-23 |
| ACP 失败的唯一正确回退是 subagent | 主会话直接 write 属于严重违规 | corrections | 2026-03-23 |
| 铁律双层防护 | 写入 AGENTS.md + MEMORY.md，双重保护 | corrections | 2026-03-23 |
| 验收智能体必须先汇报已加载 AC | 启动 checkpoint，防止跳过 SOP 第一步 | corrections | 2026-03-23 |
| 验收流程精简 + E2E 强制 | 14 步→6 步，15 分钟（含 E2E），timeout 15m/12m | corrections | 2026-03-23 |
| subagent timeout 按复杂度分级 | 简单任务 4m，复杂任务 15m+ | corrections | 2026-03-23 |
| **宪法升级必须全局 grep 检查所有智能体版本号** | 不能只改核心文件，必须 `grep -r "旧版本号" agents/constitution/*/AGENTS.md` | corrections | 2026-03-23 |
| **审计检查必须验证智能体版本号统一性** | 抽查改为全量检查，智能体数量 = 9 个 | corrections | 2026-03-23 |
| **Git 提交前必须通过 pre-commit version hook** | 自动化拦截版本号不统一的提交 | corrections | 2026-03-23 |

---

## 🔄 复用规则

### 通用

| 规则 | 来源 | 确认日期 |
|------|------|----------|
| Self-Improving 路径必须用 workspace 绝对路径 | `~/` 在 OpenClaw 沙盒下被误解，必须用 `/Users/fukai/project/openclaw-workspace/...` | corrections | 2026-03-23 |
| cron 任务需与 crontab 配置一致 | crontab 是实际执行层，HEARTBEAT.md 是参考文档 | corrections | 2026-03-23 |
| delivery.channel 必须在多通道环境下显式指定 | imessage + feishu 并存时，channel 必填 | corrections | 2026-03-23 |
| 模型限流时切换供应商 | MiniMax 限流 → 百炼 Qwen3.5 | corrections | 2026-03-23 |

---

## 📚 Domain 记忆

### constitution

- Self-Improving 目录：`/Users/fukai/project/openclaw-workspace/self-improving/`（从 `~/` 迁移）
- Proactivity 目录：`/Users/fukai/project/openclaw-workspace/proactivity/`（从 `~/` 迁移）
- V3.12.0 问题检测靠人工，需系统自检机制

### coding

- Portfolio 项目：ACP 豁免，但必须走 sessions_spawn，不允许主会话直接 write
- 模型：`bailian/qwen3.5-plus`（100 万 token 上下文，无限流）

### feishu

---

## 🗂️ Projects 记忆

### Portfolio Dashboard

- T-01~T-17 全部完成，验收通过（代码 + 运行时）
- 飞书报告：https://feishu.cn/docx/XrjQdDdYXoAnrCxD5TFcEwvIn2e
