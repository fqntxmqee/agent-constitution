# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## 🌐 Cursor 区域限制 / 代理配置（解决 "Model provider doesn't serve your region"）

用于 OpenClaw ACP 调用本地 Cursor CLI 时出现区域限制时的代理配置。

### 已写入 Cursor 的配置（User settings.json）

- `http.proxy`: `http://127.0.0.1:7890`（本地代理地址，端口按你的工具改）
- `http.proxySupport`: `override`
- `cursor.general.disableHttp2`: `true`

**常用代理端口**：Clash 7890、V2Ray 10809、Surge 6152。若端口不同，在 Cursor 里 `Cmd + Shift + P` → “Open User Settings (JSON)” 修改 `http.proxy` 中的端口。

### 使用前请确认

1. **本机代理已开启**（Clash / V2Ray / Surge 等），且端口与上面一致。
2. **重启 Cursor**：改完设置后完全退出 Cursor 再打开，再通过 ACP 调用 Cursor CLI。
3. 若仍报错：尝试代理的 **TUN 模式**（全局代理），或换节点到 **美国西岸**（如 Oregon、California）。
