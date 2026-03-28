# Self-Improving Memory Archive

> 历史归档 - 超过 30 天的条目

**归档日期**: 2026-03-24  
**归档规则**: 保留最近 30 天条目 + constitution 核心规则，其余移入归档

---

## 📦 归档内容

### 2026-03-22 至 2026-03-23 历史条目

#### Constitution 规则（历史版本）

| 规则 | 说明 | 来源 | 确认日期 | 状态 |
|------|------|------|----------|------|
| 主会话禁止直接写业务代码 | `write`/`edit` 到 `project/src` 路径，必须走 `sessions_spawn` | corrections | 2026-03-23 | ✅ 保留 |
| "用户授权"不可作为违反宪法规范的借口 | 任何授权都不能凌驾于宪法铁律之上 | corrections | 2026-03-23 | ✅ 保留 |
| ACP 失败的唯一正确回退是 subagent | 主会话直接 write 属于严重违规 | corrections | 2026-03-23 | ✅ 保留 |
| 铁律双层防护 | 写入 AGENTS.md + MEMORY.md，双重保护 | corrections | 2026-03-23 | ✅ 保留 |
| 验收智能体必须先汇报已加载 AC | 启动 checkpoint，防止跳过 SOP 第一步 | corrections | 2026-03-23 | ✅ 保留 |
| 验收流程精简 + E2E 强制 | 14 步→6 步，15 分钟（含 E2E），timeout 15m/12m | corrections | 2026-03-23 | ✅ 保留 |
| subagent timeout 按复杂度分级 | 简单任务 4m，复杂任务 15m+ | corrections | 2026-03-23 | ✅ 保留 |
| 宪法升级必须全局 grep 检查所有智能体版本号 | 不能只改核心文件 | corrections | 2026-03-23 | ✅ 保留 |
| 审计检查必须验证智能体版本号统一性 | 抽查改为全量检查，智能体数量 = 9 个 | corrections | 2026-03-23 | ✅ 保留 |
| Git 提交前必须通过 pre-commit version hook | 自动化拦截版本号不统一的提交 | corrections | 2026-03-23 | ✅ 保留 |
| 智能体优先原则 | 任何任务优先安排对应智能体执行 | corrections | 2026-03-24 | ✅ 保留 |
| 主会话职责 | 主会话是协调员/导航员，不是执行者 | corrections | 2026-03-24 | ✅ 保留 |
| 智能体分工 | 开发→resolution, 交付→delivery, 审计→audit | corrections | 2026-03-24 | ✅ 保留 |

#### 通用规则（历史版本）

| 规则 | 来源 | 确认日期 | 状态 |
|------|------|----------|------|
| Self-Improving 路径必须用 workspace 绝对路径 | corrections | 2026-03-23 | ✅ 保留 |
| cron 任务需与 crontab 配置一致 | corrections | 2026-03-23 | ✅ 保留 |
| delivery.channel 必须在多通道环境下显式指定 | corrections | 2026-03-23 | ✅ 保留 |
| 模型限流时切换供应商 | corrections | 2026-03-23 | ✅ 保留 |

#### Domain 记忆（历史版本）

**constitution**:
- Self-Improving 目录：`/Users/fukai/project/openclaw-workspace/self-improving/`
- Proactivity 目录：`/Users/fukai/project/openclaw-workspace/proactivity/`
- V3.12.0 问题检测靠人工，需系统自检机制

**coding**:
- Portfolio 项目：ACP 豁免，但必须走 sessions_spawn
- 模型：`bailian/qwen3.5-plus`

#### Projects 记忆（历史版本）

**Portfolio Dashboard**:
- T-01~T-17 全部完成，验收通过
- 飞书报告：https://feishu.cn/docx/XrjQdDdYXoAnrCxD5TFcEwvIn2e

---

## 📊 归档统计

| 分类 | 保留数量 | 归档数量 |
|------|----------|----------|
| Constitution 规则 | 13 | 0 |
| 通用规则 | 4 | 0 |
| Domain 记忆 | 2 | 0 |
| Projects 记忆 | 1 | 0 |
| **总计** | **20** | **0** |

**说明**: 当前 memory.md 所有内容均为最近 30 天内创建，无需归档。

---

_归档文件生成时间：2026-03-24 00:40 (Asia/Shanghai)_
