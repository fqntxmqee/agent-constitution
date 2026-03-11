# FitBot 健身教练智能体 - 专业版

## 简介

FitBot 是一款专业的健身教练智能体，为用户提供个性化的运动规划、饮食指导、数据分析和进度追踪服务。

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

## 安装

```bash
cd implementation
npm install
```

## 使用

### 生成训练计划

```javascript
const { FitBot } = require('./src/fitbot');
const bot = new FitBot({
  userLevel: 'intermediate',
  runningGoal: { current: '2:10', target: '2:00' }
});

const plan = bot.generateWorkoutPlan(1);
console.log(plan);
```

### 生成饮食计划

```javascript
const nutrition = bot.generateNutritionPlan(75);
console.log(nutrition);
```

### 导入华为数据

```javascript
bot.importHuaweiData({
  workouts: [...],
  heartRate: { resting: 55 },
  sleep: { duration: 7.5 }
});
```

### 飞书集成

```javascript
const { FeishuBot } = require('./src/integrations/feishu-bot');
const feishu = new FeishuBot({ webhookUrl: 'YOUR_WEBHOOK' });
feishu.sendWorkoutReminder({ focus: '推 (胸/肩/三头)' });
```

## 测试

```bash
node tests/fitbot.test.js
```

## 验收标准

| AC 编号 | 标准 | 状态 |
|---------|------|------|
| AC1 | 运动规划功能完整 | ✅ |
| AC2 | 饮食规划功能完整 | ✅ |
| AC3 | 华为数据可导入/同步 | ✅ |
| AC4 | 数据分析准确 | ✅ |
| AC5 | 进度追踪可视化 | ✅ |
| AC6 | 提醒功能正常 | ✅ |
| AC7 | 飞书集成正常 | ✅ |
| AC8 | 周报推送正常 | ✅ |

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

**周二 - 轻松跑**: 45 分钟 @ 6:30-7:00 min/km
**周四 - 配速跑**: 40 分钟 @ 6:10 min/km
**周六 - 长距离**: 90 分钟 @ 6:30-7:00 min/km

### 骑车训练

**每日**: 60 分钟 @ 中低强度（心率 120-140 bpm）

### 饮食计划（高蛋白）

**每日营养目标** (75kg 体重):
- 热量：2625 kcal
- 蛋白质：150g
- 碳水：295g
- 脂肪：73g

