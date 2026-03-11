# FitBot 工具配置

## OpenClaw 工具

### message 工具（飞书消息）

**用途：** 发送训练提醒、周报推送、用户交互

**配置：**
```javascript
// 飞书机器人 Webhook（独立 FitBot 机器人）
{
  "channel": "feishu",
  "webhookUrl": "https://open.feishu.cn/open-apis/bot/v2/hook/xxx",
  "msgType": "interactive"
}
```

**使用示例：**
```javascript
// 发送训练提醒
message.send({
  channel: 'feishu',
  msgType: 'interactive',
  card: {
    header: { title: { content: '💪 训练提醒' } },
    elements: [{ tag: 'div', text: { content: '今晚 19:00 力量训练（推日）' } }]
  }
});

// 发送周报
message.send({
  channel: 'feishu',
  msgType: 'interactive',
  card: {
    header: { title: { content: '📊 本周训练总结' } },
    elements: [{ tag: 'div', text: { content: '完成 5 次训练...' } }]
  }
});
```

---

### cron 工具（定时任务）

**用途：** 配置训练提醒、周报推送定时任务

**配置：**
```javascript
// 每日训练提醒（18:00）
cron.add({
  name: 'fitbot-daily-reminder',
  schedule: { kind: 'cron', expr: '0 18 * * *', tz: 'Asia/Shanghai' },
  payload: { kind: 'systemEvent', text: 'fitbot:send-reminder' },
  sessionTarget: 'main'
});

// 每周日报送（周日 20:00）
cron.add({
  name: 'fitbot-weekly-report',
  schedule: { kind: 'cron', expr: '0 20 * * 0', tz: 'Asia/Shanghai' },
  payload: { kind: 'systemEvent', text: 'fitbot:send-weekly-report' },
  sessionTarget: 'main'
});
```

---

### memory 工具（记忆存储）

**用途：** 存储用户配置、训练记录、进度数据

**配置：**
```javascript
// 长期记忆（用户配置）
memory.search({ query: 'fitbot user config' });

// 短期记忆（当前会话）
memory.get({ path: 'MEMORY.md', from: 1, lines: 50 });
```

---

## 外部集成

### 华为手表数据

**数据源：** 华为运动健康 API / 手动导入

**数据类型：**
- 训练记录（类型、时长、强度）
- 心率数据（静息心率、训练心率）
- 睡眠数据（时长、质量）
- 步数数据

**导入方式：**
```javascript
// JSON 格式导入
{
  "workouts": [
    { "type": "running", "duration": 45, "date": "2026-03-11" }
  ],
  "heartRate": { "resting": 55 },
  "sleep": { "duration": 7.5, "quality": "good" },
  "steps": 10000
}
```

---

## 消息模板

### 训练提醒模板
```
💪 **训练提醒**

**今日训练**: {focus}
**时间**: {time}
**预计时长**: {duration} 分钟

准备好了吗？开始吧！🔥
```

### 周报模板
```
📊 **本周训练总结**

**训练总次数**: {total}
- 力量训练：{strength} 次
- 跑步训练：{running} 次
- 骑车训练：{cycling} 次

**亮点**:
{highlights}

**建议**:
{suggestions}

继续保持！💪
```

---

## 工具使用规范

1. **message 工具**
   - 仅用于发送健身相关消息
   - 避免频繁打扰（每日提醒≤2 次）
   - 消息格式统一使用 interactive card

2. **cron 工具**
   - 定时任务需用户确认
   - 支持用户自定义时间
   - 提供关闭/暂停选项

3. **memory 工具**
   - 用户数据加密存储
   - 定期备份重要数据
   - 尊重用户隐私

---

*文档版本：1.0*
*创建日期：2026-03-11*
