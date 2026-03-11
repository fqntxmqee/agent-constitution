# FitBot 健身教练智能体

**版本**: V3.7 专业版  
**创建日期**: 2026-03-11

---

## 简介

FitBot 是一款遵循宪法规范 V3.7 的专业健身教练智能体，为用户提供个性化运动规划、饮食指导、数据分析和进度追踪服务。

---

## 用户配置

| 配置项 | 值 |
|--------|-----|
| 健身水平 | 中级（1 年经验） |
| 力量训练 | 哑铃三分化（家庭） |
| 跑步目标 | 半马 2:10 → 2:00 |
| 骑车安排 | 每天 1 小时（中低强度） |
| 饮食重点 | 高蛋白（增肌） |
| 数据来源 | 华为手表 |
| 消息渠道 | 飞书机器人（独立） |

---

## 核心功能

### 1. 运动规划
- **力量训练**: 哑铃三分化计划（推/拉/腿）
- **跑步训练**: 半马配速训练
- **骑车训练**: 每日有氧恢复

### 2. 饮食规划
- **高蛋白计划**: 增肌饮食方案
- **营养计算**: 卡路里/蛋白质/碳水/脂肪

### 3. 数据分析
- **训练负荷分析**: 训练量/强度
- **心率分析**: 静息心率/训练心率
- **睡眠分析**: 睡眠质量/时长

### 4. 进度追踪
- **训练进度**: 力量/耐力提升
- **身体数据**: 体重/体脂
- **周报推送**: 每周训练总结

---

## 使用示例

### 生成训练计划
```javascript
const { FitBot } = require('./fitbot');
const bot = new FitBot({
  userLevel: 'intermediate',
  runningGoal: { current: '2:10', target: '2:00' }
});

const plan = bot.generateWeeklyPlan(1);
console.log(plan);
```

### 生成饮食计划
```javascript
const nutrition = bot.generateNutritionPlan(75);
console.log(nutrition);
```

### 导入数据
```javascript
bot.importData({
  workouts: [...],
  heartRate: { resting: 55 },
  sleep: { duration: 7.5 }
});
```

### 发送提醒
```javascript
await bot.sendDailyReminder();
await bot.sendWeeklyReport();
```

---

## 测试

```bash
node tests/fitbot.test.js
```

**测试结果**: 15/15 通过 (100%)

---

## 定时任务配置

### 每日训练提醒（18:00）
```javascript
cron.add({
  name: 'fitbot-daily-reminder',
  schedule: { kind: 'cron', expr: '0 18 * * *', tz: 'Asia/Shanghai' },
  payload: { kind: 'systemEvent', text: 'fitbot:send-daily-reminder' }
});
```

### 每周日报送（周日 20:00）
```javascript
cron.add({
  name: 'fitbot-weekly-report',
  schedule: { kind: 'cron', expr: '0 20 * * 0', tz: 'Asia/Shanghai' },
  payload: { kind: 'systemEvent', text: 'fitbot:send-weekly-report' }
});
```

---

## 首周训练计划示例

### 力量训练（哑铃三分化）

**周一 - 推 (胸/肩/三头)**
- 哑铃卧推 4x8-10
- 哑铃肩上推举 4x8-10
- 哑铃飞鸟 3x10-12
- 哑铃侧平举 3x12-15
- 哑铃臂屈伸 3x10-12

**周三 - 拉 (背/二头)**
- 哑铃划船 4x8-10
- 哑铃硬拉 4x8-10
- 哑铃弯举 3x10-12
- 锤式弯举 3x10-12
- 俯身反向飞鸟 3x12-15

**周五 - 腿**
- 哑铃深蹲 4x8-10
- 哑铃弓步 3x10-12
- 哑铃罗马尼亚硬拉 3x10-12
- 哑铃提踵 4x15-20
- 平板支撑 3x60s

### 跑步训练
- **周二**: 轻松跑 45 分钟 @ 6:30-7:00 min/km
- **周四**: 配速跑 40 分钟 @ 6:10 min/km
- **周六**: 长距离 90 分钟 @ 6:30-7:00 min/km

### 骑车训练
- **每日**: 60 分钟 @ 中低强度（心率 120-140 bpm）

---

## 验收标准

| AC 编号 | 标准 | 状态 |
|---------|------|------|
| AC1 | 运动规划功能完整 | ✅ |
| AC2 | 饮食规划功能完整 | ✅ |
| AC3 | 数据可导入/同步 | ✅ |
| AC4 | 数据分析准确 | ✅ |
| AC5 | 进度追踪可视化 | ✅ |
| AC6 | 提醒功能正常 | ✅ |
| AC7 | 飞书集成正常 | ✅ |
| AC8 | 周报推送正常 | ✅ |

---

**项目状态**: ✅ 交付完成
