# Self-Improving Memory (HOT)

> 持久偏好和已确认的复用规则 | 精简版

**版本**: 2.0.0 (精简归档)  
**更新日期**: 2026-03-24  
**归档文件**: memory.archive.md

---

## 🛡️ 宪法铁律（不可违反）

1. **主会话禁止直接写业务代码** - 必须走 `sessions_spawn`
2. **用户授权不可凌驾于宪法** - 任何授权都不能违反铁律
3. **ACP 失败回退 subagent** - 主会话直接 write 属严重违规
4. **智能体优先原则** - 任务优先安排对应智能体，主会话不自己动手

---

## 🎯 主会话职责

**角色**: 协调员/导航员（不是执行者）

**智能体分工**:
- 开发 → `requirement-resolution`
- 交付 → `requirement-delivery`
- 审计 → `audit`
- 清理 → `requirement-resolution`

---

## 📋 核心流程规则

### 验收流程（6 步，15 分钟）
1. 汇报已加载 AC
2. E2E 测试
3. 问题记录
4. 修复验证
5. 报告生成
6. 用户确认

### Subagent Timeout 分级
- 简单任务：4m
- 复杂任务：15m+

### 宪法升级检查
- 必须全局 grep 检查所有智能体版本号
- 审计必须验证版本号统一性
- Git 提交前通过 pre-commit version hook

---

## 🔧 通用规则

| 规则 | 说明 |
|------|------|
| 路径 | 用 workspace 绝对路径，不用 `~/` |
| Cron | 与 crontab 配置一致 |
| Channel | 多通道环境下 delivery.channel 必填 |
| 模型 | MiniMax 限流 → 百炼 Qwen3.5 |

---

## 📚 Domain 记忆

| Domain | 路径/配置 |
|--------|-----------|
| Self-Improving | `/Users/fukai/project/openclaw-workspace/self-improving/` |
| Proactivity | `/Users/fukai/project/openclaw-workspace/proactivity/` |
| Portfolio | ACP 豁免，必须 sessions_spawn |
| 默认模型 | `bailian/qwen3.5-plus` |

---

## 📦 归档

**历史条目**: 见 `memory.archive.md`

**归档规则**:
- 保留：最近 30 天 + constitution 核心规则
- 归档：超过 30 天的旧条目

---

_最后更新：2026-03-24 00:40 (Asia/Shanghai)_
