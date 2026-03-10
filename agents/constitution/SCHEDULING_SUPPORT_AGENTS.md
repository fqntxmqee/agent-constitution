# 支撑智能体定时执行方式

> 进展跟进、审计、总结反思三个智能体的定时触发方案说明

---

## 📋 三种方式对比

| 方式 | 适用场景 | 时间精度 | 依赖 | 推荐度 |
|------|----------|----------|------|--------|
| **系统 Cron** | 本机 7×24 需精确周期 | 高（按分钟） | `openclaw` 在 PATH、终端环境 | ⭐⭐⭐ 最常用 |
| **macOS launchd** | 本机、需继承 OpenClaw 环境变量 | 高 | 需配置 plist | ⭐⭐⭐ 推荐（Mac） |
| **Heartbeat** | 主会话已被轮询（如 Cursor/Discord） | 依赖轮询间隔 | 主会话在线 | ⭐⭐ 补充 |

---

## 方式一：系统 Cron（推荐，跨平台）

**优点**：配置简单、时间精确、不依赖主会话在线。  
**注意**：cron 环境与登录 shell 不同，需保证 `openclaw` 可用（PATH）及必要时指定工作目录。

### 1. 确认 openclaw 在 cron 中可用

```bash
# 查看当前 openclaw 路径
which openclaw
# 若在 /usr/local/bin 或 /opt/homebrew/bin，cron 默认 PATH 可能不包含，建议在 crontab 首行设置：
# PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin
```

### 2. 编辑 crontab

```bash
crontab -e
```

### 3. 添加以下行（按需调整 PATH 与工作目录）

```cron
# OpenClaw 支撑智能体定时执行（V3.7）
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin
# 可选：让 openclaw 在指定工作区执行（部分 agent 会读工作区文件）
# OPENCLAW_WORKSPACE=/Users/fukai/project/openclaw-workspace

# 进展跟进 - 每 30 分钟
*/30 * * * * openclaw agent --agent progress-tracking --message "执行进展汇报"

# 审计 - 每 2 小时（整点 0 分）
0 */2 * * * openclaw agent --agent audit --message "执行周期性审计"

# 总结反思 - 每日 23:00
0 23 * * * openclaw agent --agent summary-reflection --message "执行每日总结"
```

### 4. 一键生成/安装（可选）

工作区提供脚本，可打印或直接追加到 crontab：

```bash
# 仅打印要添加的 crontab 内容
./scripts/install-support-agents-cron.sh

# 交互式追加到当前 crontab（会先移除同款旧块）
./scripts/install-support-agents-cron.sh --install
```

### 5. 验证

```bash
# 查看已安装的 cron
crontab -l

# 手动执行一次（与 cron 命令一致），确认无报错
openclaw agent --agent progress-tracking --message "执行进展汇报"
```

**若 openclaw 需在项目目录下执行**，可改为（替换为你的工作区路径）：

```cron
*/30 * * * * cd /Users/fukai/project/openclaw-workspace && openclaw agent --agent progress-tracking --message "执行进展汇报"
0 */2 * * * cd /Users/fukai/project/openclaw-workspace && openclaw agent --agent audit --message "执行周期性审计"
0 23 * * * cd /Users/fukai/project/openclaw-workspace && openclaw agent --agent summary-reflection --message "执行每日总结"
```

---

## 方式二：macOS launchd（推荐在本机 Mac 上使用）

**优点**：由系统统一调度、可继承 LaunchAgent 的 EnvironmentVariables（与 `openclaw-sync-env-to-plist.sh` 一致）、不依赖登录终端。  
**适用**：已用 LaunchAgent 跑 OpenClaw gateway、希望定时任务也用相同环境时。

### 1. 创建 plist（示例：进展跟进，每 30 分钟）

路径：`~/Library/LaunchAgents/ai.openclaw.progress-tracking.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ai.openclaw.progress-tracking</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string>
    <string>openclaw</string>
    <string>agent</string>
    <string>--agent</string>
    <string>progress-tracking</string>
    <string>--message</string>
    <string>执行进展汇报</string>
  </array>
  <key>StartInterval</key>
  <integer>1800</integer>
  <key>WorkingDirectory</key>
  <string>/Users/fukai/project/openclaw-workspace</string>
  <key>StandardOutPath</key>
  <string>/tmp/openclaw-progress-tracking.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/openclaw-progress-tracking.err</string>
</dict>
</plist>
```

- `StartInterval`: 秒，1800 = 30 分钟。  
- 若需与 gateway 相同的环境变量，可复制 `ai.openclaw.gateway.plist` 的 `EnvironmentVariables` 到本 plist。

### 2. 审计（每 2 小时）

`~/Library/LaunchAgents/ai.openclaw.audit.plist`：

- `StartInterval`: 7200（2 小时）  
- `ProgramArguments`: `openclaw agent --agent audit --message "执行周期性审计"`  
- 其余同上（WorkingDirectory、StandardOutPath/StandardErrorPath）。

### 3. 总结反思（每日 23:00）

用 **StartCalendarInterval** 代替 StartInterval：

```xml
<key>StartCalendarInterval</key>
<dict>
  <key>Hour</key>
  <integer>23</integer>
  <key>Minute</key>
  <integer>0</integer>
</dict>
```

### 4. 加载与查看

```bash
launchctl load ~/Library/LaunchAgents/ai.openclaw.progress-tracking.plist
launchctl list | grep openclaw
# 停止
launchctl unload ~/Library/LaunchAgents/ai.openclaw.progress-tracking.plist
```

---

## 方式三：Heartbeat（主会话轮询时触发）

当前 **HEARTBEAT.md** 已配置三个智能体的职责与周期说明；实际触发依赖「主会话收到 heartbeat 轮询」的频率。

- **特点**：不单独起系统定时器，由 Cursor/Discord 等对主会话的轮询间接触发；时间取决于轮询间隔，非严格每 30 分钟/2 小时。
- **适用**：作为补充，或在不方便用 cron/launchd 的环境里使用。
- **配置**：保持现有 `HEARTBEAT.md` 即可；若希望主会话在 heartbeat 时**主动调用**这三个 agent，需在主会话逻辑或 MCP 中根据 `memory/heartbeat-state.json` 的 lastChecks 时间决定是否执行并调用 `openclaw agent --agent ...`。

---

## 建议组合

- **本机希望严格按时执行**：用 **Cron** 或 **launchd** 任选其一即可。  
- **本机已有 OpenClaw LaunchAgent 且希望环境一致**：优先 **launchd**。  
- **主会话常开且希望少维护**：保留 **Heartbeat** 说明，再叠加 **Cron/launchd** 做兜底，避免漏跑。

---

## 相关文档

| 文档 | 说明 |
|------|------|
| `agents/constitution/PERIODIC_AGENTS_CONFIG.md` | 三个智能体周期与职责 |
| `agents/constitution/SUPPORT_AGENTS_MONITORING.md` | 监控与手动触发命令 |
| `HEARTBEAT.md` | Heartbeat 与周期性任务说明 |

---

**文档版本**: 1.0  
**创建日期**: 2026-03-10
