# 审计检查清单 V3.9.0（可执行版）

**版本**: 3.9.0  
**用途**: 每次审计必须逐项执行的检查清单  
**执行方式**: 自动化脚本 + 人工复核  
**遵循**: 智能体协同系统宪法规范 V3.9.0

---

## 📋 使用说明

每个检查项包含：
- **ID**: 唯一标识（用于追踪）
- **检查内容**: 具体检查什么
- **判断逻辑**: 如何判定通过/失败
- **执行命令**: 可执行的 shell 命令或工具调用
- **阈值**: 通过/失败的边界值
- **等级**: Critical/High/Medium/Low
- **处置**: 发现问题后的操作

---

## 1️⃣ 安全检查（Security）

### 1.1 配置安全

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| SEC-001 | iMessage 群组策略 | groupPolicy != "open" | `openclaw config get channels.imessage.groupPolicy` | allowlist | 🔴 Critical | 熔断 + 告警 |
| SEC-002 | iMessage DM 策略 | dmPolicy != "open" | `openclaw config get channels.imessage.dmPolicy` | pairing/allowlist | 🔴 Critical | 熔断 + 告警 |
| SEC-003 | 沙箱模式启用 | sandbox.mode == "all" | `openclaw config get agents.defaults.sandbox.mode` | all | 🟡 High | 限期整改 |
| SEC-004 | 文件系统限制 | fs.workspaceOnly == true | `openclaw config get agents.defaults.tools.fs.workspaceOnly` | true | 🟡 High | 限期整改 |
| SEC-005 | 控制 UI 安全认证 | allowInsecureAuth == false | `openclaw config get gateway.controlUi.allowInsecureAuth` | false | 🟡 High | 限期整改 |
| SEC-006 | API 密钥配置 | 无硬编码/明文 | `grep -r "API_KEY\|api_key\|apikey" ~/.openclaw/` | 0 匹配 | 🔴 Critical | 立即修复 |

### 1.2 工具权限

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| SEC-101 | exec 工具调用 | 无高危命令 | 检查 sessions_history 中的 exec 调用 | 无 rm -rf/curl\|bash 等 | 🔴 Critical | 熔断 |
| SEC-102 | write 工具调用 | 仅限工作区 | 检查 write 的 path 参数 | path 包含 workspace | 🟡 High | 告警 |
| SEC-103 | browser 工具调用 | 无恶意 URL | 检查 browser 的 url 参数 | 非已知恶意域名 | 🟡 High | 告警 |
| SEC-104 | message 工具调用 | 无未授权发送 | 检查 message 的 target | 目标在允许列表 | 🟡 High | 告警 |

### 1.3 高危命令检测

```bash
# 高危命令正则（匹配即告警）
DANGEROUS_COMMANDS=(
  "rm\s+-rf"
  "curl.*\|\s*(ba)?sh"
  "wget.*\|\s*(ba)?sh"
  "chmod\s+777"
  "dd\s+"
  "mkfs"
  "fdisk"
  ":\(\)\{\s*:\|:\s*&\s*\};:"
  "sudo\s+rm"
  "> /dev/.*"
  "echo.*>.*\.sh.*&&.*\.\/.*\.sh"
)
```

---

## 2️⃣ 合规检查（Compliance）

### 2.1 规约执行

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| CMP-001 | proposal.md 存在 | 文件存在且非空 | `test -s {project}/proposal.md` | 存在 | 🔴 Critical | 熔断 |
| CMP-002 | specs/requirements.md 存在 | 文件存在且非空 | `test -s {project}/specs/requirements.md` | 存在 | 🔴 Critical | 熔断 |
| CMP-003 | design.md 存在 | 文件存在且非空 | `test -s {project}/design.md` | 存在 | 🔴 Critical | 熔断 |
| CMP-004 | tasks.md 存在 | 文件存在且非空 | `test -s {project}/tasks.md` | 存在 | 🔴 Critical | 熔断 |
| CMP-005 | 规约用户确认 | 有用户确认记录 | 检查 sessions_history 中的用户确认消息 | 有确认 | 🔴 Critical | 熔断 |

### 2.2 Runtime 检查

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| CMP-101 | runtime 类型 | runtime == "acp" | 检查 sessions_spawn 的 runtime 参数 | acp | 🔴 Critical | 熔断 |
| CMP-102 | 禁止 subagent 开发 | runtime != "subagent" | 检查 sessions_spawn 的 runtime 参数 | 非 subagent | 🔴 Critical | 熔断 |
| CMP-103 | Cursor CLI 使用 | 使用 --print 模式 | 检查 cursor 命令参数 | --print | 🟡 High | 整改 |
| CMP-104 | PTY 模式 | pty == true | 检查 exec 的 pty 参数 | true | 🟡 High | 整改 |

### 2.3 验收合规

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| CMP-201 | 验收报告存在 | requirement-acceptance 产出报告 | 检查 reports/ 目录 | 有验收报告 | 🔴 Critical | 熔断 |
| CMP-202 | 验收逐项核对 | 验收报告包含逐项检查 | 检查验收报告内容 | 有 check list | 🟡 High | 整改 |
| CMP-203 | 验收截图 | 有截图证据（如适用） | 检查 reports/ 中的图片 | 有截图 | 🟢 Medium | 建议 |

### 2.4 交付合规

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| CMP-301 | Git 提交规范 | Conventional Commits | `git log --oneline` | 符合格式 | 🟡 High | 整改 |
| CMP-302 | 交付报告存在 | 有交付报告 | 检查 delivery-report.md | 存在 | 🟡 High | 整改 |
| CMP-303 | 飞书文档同步 | 有飞书文档链接 | 检查交付报告中的链接 | 有链接 | 🟢 Medium | 建议 |

---

## 3️⃣ 运行检查（Operational）

### 3.1 健康状态

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| OPS-001 | 网关状态 | 网关正常运行 | `openclaw gateway status` | running | 🔴 Critical | 重启 |
| OPS-002 | iMessage 通道 | 通道正常 | `openclaw health` | ok | 🟡 High | 检查配置 |
| OPS-003 | Feishu 通道 | 通道正常 | `openclaw health` | ok | 🟡 High | 检查配置 |
| OPS-004 | 智能体加载 | 所有智能体正常 | `openclaw health` | 10 个智能体 | 🟡 High | 检查配置 |

### 3.2 会话状态

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| OPS-101 | 活跃会话数 | 会话数在合理范围 | `openclaw sessions list` | < 50 | 🟢 Low | 监控 |
| OPS-102 | 会话锁状态 | 无 stale 锁 | `openclaw doctor` | stale=no | 🟢 Low | 清理 |
| OPS-103 | 孤立事务文件 | 无过多孤立文件 | `openclaw doctor` | < 10 | 🟢 Low | 清理 |

### 3.3 资源使用

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| OPS-201 | Token 配额 | 未超配额 | 检查 sessions_list 中的 usage | < 90% | 🟡 High | 告警 |
| OPS-202 | API 限流 | 无 429 错误 | 检查 sessions_history 中的错误 | 0 次 | 🟡 High | 降频 |
| OPS-203 | 存储使用 | 未超容量 | `du -sh ~/.openclaw/` | < 10GB | 🟢 Low | 清理 |

---

## 4️⃣ 行为检查（Behavioral）

### 4.1 职责边界

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| BEH-001 | 非职责 NO_REPLY | 非职责消息返回 NO_REPLY | 检查 sessions_history | 100% | 🟡 High | 培训 |
| BEH-002 | 禁止主动发言 | 无主动发起话题 | 检查 sessions_history | 0 次 | 🟡 High | 告警 |
| BEH-003 | 禁止闲聊 | 无与职责无关对话 | 检查 sessions_history | 0 次 | 🟡 High | 告警 |

### 4.2 指令分析

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| BEH-101 | 指令来源可追溯 | 所有指令有 sender | 检查 sessions_history | 100% | 🟡 High | 修复 |
| BEH-102 | 指令解析无歧义 | 无多次确认同一指令 | 检查 sessions_history | < 3 次 | 🟢 Low | 优化 |

### 4.3 异常检测

| ID | 检查项 | 判断逻辑 | 执行命令 | 阈值 | 等级 | 处置 |
|----|--------|----------|----------|------|------|------|
| BEH-201 | 输出异常 | 无乱码/截断 | 检查 sessions_history | 0 次 | 🟡 High | 修复 |
| BEH-202 | 频率异常 | 无短时间内大量调用 | 检查 sessions_list | < 10 次/分钟 | 🟡 High | 限流 |
| BEH-203 | 错误率异常 | 错误率 < 5% | 计算错误会话占比 | < 5% | 🟡 High | 排查 |

---

## 5️⃣ 执行脚本

### 5.1 安全检查脚本

```bash
#!/bin/bash
# audit_security.sh - 安全检查脚本

set -e

CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0

log_result() {
  local id=$1
  local status=$2
  local message=$3
  echo "[$status] $id: $message"
}

# SEC-001: iMessage 群组策略
GROUP_POLICY=$(openclaw config get channels.imessage.groupPolicy 2>/dev/null || echo "open")
if [[ "$GROUP_POLICY" == "open" ]]; then
  log_result "SEC-001" "❌ CRITICAL" "iMessage groupPolicy=open"
  ((CRITICAL_COUNT++))
else
  log_result "SEC-001" "✅ PASS" "iMessage groupPolicy=$GROUP_POLICY"
fi

# SEC-002: iMessage DM 策略
DM_POLICY=$(openclaw config get channels.imessage.dmPolicy 2>/dev/null || echo "open")
if [[ "$DM_POLICY" == "open" ]]; then
  log_result "SEC-002" "❌ CRITICAL" "iMessage dmPolicy=open"
  ((CRITICAL_COUNT++))
else
  log_result "SEC-002" "✅ PASS" "iMessage dmPolicy=$DM_POLICY"
fi

# SEC-003: 沙箱模式
SANDBOX_MODE=$(openclaw config get agents.defaults.sandbox.mode 2>/dev/null || echo "off")
if [[ "$SANDBOX_MODE" != "all" ]]; then
  log_result "SEC-003" "⚠️ HIGH" "sandbox.mode=$SANDBOX_MODE (expected: all)"
  ((HIGH_COUNT++))
else
  log_result "SEC-003" "✅ PASS" "sandbox.mode=all"
fi

# SEC-006: API 密钥检查
API_KEY_LEAK=$(grep -r "API_KEY\|api_key\|apikey" ~/.openclaw/ 2>/dev/null | grep -v ".jsonl" | wc -l)
if [[ $API_KEY_LEAK -gt 0 ]]; then
  log_result "SEC-006" "❌ CRITICAL" "发现 $API_KEY_LEAK 处 API 密钥泄露"
  ((CRITICAL_COUNT++))
else
  log_result "SEC-006" "✅ PASS" "未发现 API 密钥泄露"
fi

# 汇总
echo ""
echo "========== 安全检查汇总 =========="
echo "Critical: $CRITICAL_COUNT"
echo "High: $HIGH_COUNT"
echo "Medium: $MEDIUM_COUNT"
echo "Low: $LOW_COUNT"

if [[ $CRITICAL_COUNT -gt 0 ]]; then
  echo "状态: ❌ 失败（发现 Critical 问题）"
  exit 1
elif [[ $HIGH_COUNT -gt 0 ]]; then
  echo "状态: ⚠️ 待整改（发现 High 问题）"
  exit 0
else
  echo "状态: ✅ 通过"
  exit 0
fi
```

### 5.2 合规检查脚本

```bash
#!/bin/bash
# audit_compliance.sh - 合规检查脚本

PROJECT_DIR=$1

if [[ -z "$PROJECT_DIR" ]]; then
  echo "用法: audit_compliance.sh <项目目录>"
  exit 1
fi

CRITICAL_COUNT=0
HIGH_COUNT=0

# CMP-001: proposal.md
if [[ ! -s "$PROJECT_DIR/proposal.md" ]]; then
  echo "[❌ CRITICAL] CMP-001: proposal.md 不存在或为空"
  ((CRITICAL_COUNT++))
else
  echo "[✅ PASS] CMP-001: proposal.md 存在"
fi

# CMP-002: specs/requirements.md
if [[ ! -s "$PROJECT_DIR/specs/requirements.md" ]]; then
  echo "[❌ CRITICAL] CMP-002: specs/requirements.md 不存在或为空"
  ((CRITICAL_COUNT++))
else
  echo "[✅ PASS] CMP-002: specs/requirements.md 存在"
fi

# CMP-003: design.md
if [[ ! -s "$PROJECT_DIR/design.md" ]]; then
  echo "[❌ CRITICAL] CMP-003: design.md 不存在或为空"
  ((CRITICAL_COUNT++))
else
  echo "[✅ PASS] CMP-003: design.md 存在"
fi

# CMP-004: tasks.md
if [[ ! -s "$PROJECT_DIR/tasks.md" ]]; then
  echo "[❌ CRITICAL] CMP-004: tasks.md 不存在或为空"
  ((CRITICAL_COUNT++))
else
  echo "[✅ PASS] CMP-004: tasks.md 存在"
fi

# 汇总
echo ""
echo "========== 合规检查汇总 =========="
echo "Critical: $CRITICAL_COUNT"
echo "High: $HIGH_COUNT"

if [[ $CRITICAL_COUNT -gt 0 ]]; then
  echo "状态: ❌ 熔断（缺少规约文档）"
  exit 1
else
  echo "状态: ✅ 通过"
  exit 0
fi
```

### 5.3 会话审计脚本

```bash
#!/bin/bash
# audit_sessions.sh - 会话行为审计脚本

# 获取最近 24 小时活跃会话
SESSIONS=$(openclaw sessions list --active-minutes=1440 --limit=100 --message-limit=10)

# 统计各智能体会话数
echo "========== 智能体会话统计 =========="
echo "$SESSIONS" | jq -r '.sessions[] | .key' | cut -d: -f2 | sort | uniq -c | sort -rn

# 检查错误会话
echo ""
echo "========== 错误会话检查 =========="
echo "$SESSIONS" | jq -r '.sessions[] | select(.messages[] | .stopReason == "error") | .key'

# 检查长时间无响应会话
echo ""
echo "========== 长时会话检查 =========="
echo "$SESSIONS" | jq -r '.sessions[] | select(.updatedAt < (now - 86400) * 1000) | .key'
```

---

## 6️⃣ 检查频率

| 检查类别 | 频率 | 执行方式 |
|----------|------|----------|
| 安全检查 | 每 2 小时 | 自动化脚本 |
| 合规检查 | 每任务 | 任务开始时 |
| 运行检查 | 每 2 小时 | 自动化脚本 |
| 行为检查 | 每 2 小时 | 自动化脚本 |
| 全面审计 | 每日 23:00 | 人工复核 |

---

## 7️⃣ 处置矩阵

| 等级 | 自动处置 | 通知 | 恢复条件 |
|------|----------|------|----------|
| 🔴 Critical | 立即熔断 | 即时告警 | 用户确认 + 整改完成 |
| 🟡 High | 记录 + 告警 | 24h 内通知 | 限期整改 |
| 🟢 Medium | 记录 | 周报汇总 | 建议改进 |
| 🔵 Low | 记录 | 月报汇总 | 持续监控 |

---

**版本**: 3.9.0  
**最后更新**: 2026-03-16  
**维护者**: 规则守护者 🛡️  
**对齐**: 宪法规范 V3.9.0
