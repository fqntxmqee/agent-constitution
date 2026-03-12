# FitBot 健身教练智能体重构 - 技术设计文档

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           OpenClaw Runtime                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      FitBot 智能体                               │   │
│  │                   (agents/fitbot/)                               │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │                    SOUL.md                               │   │   │
│  │  │  身份：健身教练智能体                                     │   │   │
│  │  │  原则：科学训练 + 数据驱动                                │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │ 运动规划    │  │ 饮食规划    │  │ 数据分析    │             │   │
│  │  │ Service     │  │ Service     │  │ Service     │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │ 进度追踪    │  │ 飞书交互    │  │ 定时任务    │             │   │
│  │  │ Service     │  │ Service     │  │ Service     │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    宪法技能 (可选调用)                           │   │
│  │  skill-01 (意图识别) | skill-03 (任务分析) | skill-04 (路由)   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    OpenClaw 工具                                 │   │
│  │  message (飞书) | cron (定时) | exec (本地)                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 模块依赖图

```
                    ┌─────────────┐
                    │  用户消息   │
                    │  (飞书)     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  消息路由   │
                    │  (可选)     │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼────────┐ ┌──────▼──────┐ ┌───────▼───────┐
│   运动规划模块   │ │  饮食规划   │ │   数据分析    │
│                 │ │    模块     │ │    模块       │
│ - 力量计划      │ │ - 热量计算  │ │ - 华为数据    │
│ - 跑步计划      │ │ - 营养分配  │ │ - 负荷分析    │
│ - 骑车安排      │ │ - 时机建议  │ │ - 恢复评估    │
│ - 日程协调      │ │             │ │               │
└────────┬────────┘ └──────┬──────┘ └───────┬───────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼────────┐ ┌──────▼──────┐ ┌───────▼───────┐
│   进度追踪模块   │ │   飞书交互  │ │   定时任务    │
│                 │ │    模块     │ │    模块       │
│ - 力量追踪      │ │ - 消息发送  │ │ - 训练提醒    │
│ - 耐力追踪      │ │ - 命令处理  │ │ - 饮食提醒    │
│ - 身体数据      │ │ - 周报推送  │ │ - 周报定时    │
└────────┬────────┘ └──────┬──────┘ └───────┬───────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  数据存储   │
                    │  (SQLite)   │
                    └─────────────┘
```

---

## 2. 核心模块设计

### 2.1 运动规划模块

#### 三分化力量训练计划生成

```typescript
// src/services/training.ts

interface TrainingPlan {
  week: number;
  startDate: string;
  endDate: string;
  days: TrainingDay[];
}

interface TrainingDay {
  dayType: 'push' | 'pull' | 'legs' | 'rest' | 'cardio';
  date: string;
  exercises: Exercise[];
  duration: number; // minutes
  notes?: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest: number; // seconds
  equipment: string[];
}

// 推日动作库
const pushExercises: Exercise[] = [
  { name: '哑铃卧推', sets: 4, reps: '8-12', rest: 90, equipment: ['哑铃'] },
  { name: '哑铃肩推', sets: 4, reps: '8-12', rest: 90, equipment: ['哑铃'] },
  { name: '哑铃飞鸟', sets: 3, reps: '10-15', rest: 60, equipment: ['哑铃'] },
  { name: '侧平举', sets: 3, reps: '12-15', rest: 60, equipment: ['哑铃'] },
  { name: '臂屈伸', sets: 3, reps: '10-12', rest: 60, equipment: ['哑铃'] },
];

// 拉日动作库
const pullExercises: Exercise[] = [
  { name: '哑铃划船', sets: 4, reps: '8-12', rest: 90, equipment: ['哑铃'] },
  { name: '引体向上', sets: 3, reps: '力竭', rest: 90, equipment: ['单杠'] },
  { name: '哑铃弯举', sets: 3, reps: '10-12', rest: 60, equipment: ['哑铃'] },
  { name: '面拉', sets: 3, reps: '12-15', rest: 60, equipment: ['弹力带'] },
];

// 腿日动作库
const legExercises: Exercise[] = [
  { name: '哑铃深蹲', sets: 4, reps: '8-12', rest: 90, equipment: ['哑铃'] },
  { name: '罗马尼亚硬拉', sets: 4, reps: '8-12', rest: 90, equipment: ['哑铃'] },
  { name: '弓步蹲', sets: 3, reps: '10-12', rest: 60, equipment: ['哑铃'] },
  { name: '小腿提踵', sets: 4, reps: '15-20', rest: 60, equipment: [] },
];

function generateStrengthPlan(week: number, userLevel: string): TrainingPlan {
  // 根据用户水平和周数生成计划
  // 实现渐进超负荷逻辑
}
```

#### 跑步训练计划生成

```typescript
// src/services/running.ts

interface RunningPlan {
  week: number;
  goal: string;
  currentPace: string;
  targetPace: string;
  sessions: RunningSession[];
}

interface RunningSession {
  type: 'easy' | 'tempo' | 'interval' | 'long' | 'recovery';
  day: number; // 1-7
  duration: number; // minutes
  distance?: number; // km
  pace?: string;
  heartRateZone?: number;
  notes?: string;
}

// 半马 8 周训练模板
const halfMarathon8Weeks = [
  { week: 1, longRun: 8, totalDistance: 25, keyWorkout: 'tempo' },
  { week: 2, longRun: 10, totalDistance: 30, keyWorkout: 'intervals' },
  { week: 3, longRun: 12, totalDistance: 35, keyWorkout: 'tempo' },
  { week: 4, longRun: 8, totalDistance: 25, keyWorkout: 'recovery' }, // 减量
  { week: 5, longRun: 14, totalDistance: 40, keyWorkout: 'intervals' },
  { week: 6, longRun: 16, totalDistance: 45, keyWorkout: 'tempo' },
  { week: 7, longRun: 10, totalDistance: 30, keyWorkout: 'recovery' }, // 减量
  { week: 8, longRun: 5, totalDistance: 15, keyWorkout: 'race' }, // 比赛周
];

function generateRunningPlan(
  currentHalfMarathonTime: number,
  targetTime: number,
  weeks: number
): RunningPlan {
  // 根据当前成绩和目标生成训练计划
}
```

---

### 2.2 饮食规划模块

#### 热量与营养计算

```typescript
// src/services/nutrition.ts

interface NutritionPlan {
  dailyCalories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  trainingDay: MealPlan;
  restDay: MealPlan;
}

interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions: string[];
}

// Mifflin-St Jeor 公式
function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: string
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

// TDEE 计算
function calculateTDEE(bmr: number, activityLevel: number): number {
  return bmr * activityLevel;
}

// 高蛋白饮食宏量营养素分配
function calculateMacros(
  calories: number,
  weight: number,
  goal: string
): NutritionPlan {
  const proteinPerKg = goal === 'muscle_gain' ? 2.0 : 1.6;
  const protein = weight * proteinPerKg;
  const proteinCalories = protein * 4;
  
  const fatRatio = 0.25;
  const fatCalories = calories * fatRatio;
  const fat = fatCalories / 9;
  
  const carbsCalories = calories - proteinCalories - fatCalories;
  const carbs = carbsCalories / 4;
  
  return {
    dailyCalories: calories,
    protein,
    carbs,
    fat,
    trainingDay: generateMealPlan(calories, 'training'),
    restDay: generateMealPlan(calories * 0.9, 'rest'),
  };
}
```

---

### 2.3 数据分析模块

#### 华为数据解析

```typescript
// src/services/huawei.ts

interface HuaweiWorkout {
  startTime: string;
  endTime: string;
  sportType: number;
  calories: number;
  distance: number;
  avgHeartRate: number;
  maxHeartRate: number;
}

interface HuaweiSleep {
  startTime: string;
  endTime: string;
  sleepScore: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awake: number;
}

interface HuaweiData {
  workouts: HuaweiWorkout[];
  sleep: HuaweiSleep[];
  heartRates: Array<{ timestamp: string; value: number }>;
  steps: Array<{ date: string; value: number }>;
}

function parseHuaweiCSV(csvContent: string): HuaweiData {
  // 解析华为健康导出的 CSV 文件
}

function parseHuaweiJSON(jsonContent: string): HuaweiData {
  // 解析华为健康导出的 JSON 文件
}

function validateData(data: HuaweiData): ValidationResult {
  // 验证数据完整性和准确性
}
```

#### 训练负荷计算 (ACWR)

```typescript
// src/services/analysis.ts

interface TrainingLoad {
  acuteLoad: number; // 7 天平均
  chronicLoad: number; // 28 天平均
  acwr: number; // 急性/慢性比
  riskLevel: 'low' | 'moderate' | 'high';
}

function calculateACWR(loads: number[]): TrainingLoad {
  const acuteLoad = average(loads.slice(-7));
  const chronicLoad = average(loads.slice(-28));
  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;
  
  let riskLevel: TrainingLoad['riskLevel'];
  if (acwr < 0.8 || acwr > 1.5) {
    riskLevel = 'high';
  } else if (acwr < 1.0 || acwr > 1.3) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }
  
  return { acuteLoad, chronicLoad, acwr, riskLevel };
}

interface RecoveryStatus {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: 'train' | 'recover' | 'rest';
}

function assessRecovery(data: RecoveryData): RecoveryStatus {
  const factors = [
    { name: '睡眠质量', score: data.sleepScore, weight: 0.3 },
    { name: 'HRV 状态', score: data.hrvScore, weight: 0.25 },
    { name: '静息心率', score: data.rhrScore, weight: 0.2 },
    { name: '主观疲劳', score: data.rpeScore, weight: 0.15 },
    { name: '肌肉酸痛', score: data.sorenessScore, weight: 0.1 },
  ];
  
  const score = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  
  let level: RecoveryStatus['level'];
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'good';
  else if (score >= 40) level = 'fair';
  else level = 'poor';
  
  let recommendation: RecoveryStatus['recommendation'];
  if (score >= 70) recommendation = 'train';
  else if (score >= 50) recommendation = 'recover';
  else recommendation = 'rest';
  
  return { score, level, recommendation };
}
```

---

### 2.4 飞书交互模块

#### 消息发送

```typescript
// src/services/feishu.ts

import { message } from '@openclaw/tools';

interface FeishuMessage {
  type: 'text' | 'post' | 'interactive';
  content: string | PostContent | InteractiveContent;
}

async function sendFeishuMessage(
  target: string,
  messageContent: FeishuMessage
): Promise<void> {
  await message({
    action: 'send',
    channel: 'feishu',
    target,
    message: formatMessage(messageContent),
  });
}

// 发送训练提醒
async function sendTrainingReminder(plan: TrainingDay): Promise<void> {
  const content: FeishuMessage = {
    type: 'post',
    content: {
      title: '💪 训练提醒',
      items: [
        { tag: 'text', text: `今天训练：${plan.dayType.toUpperCase()}` },
        { tag: 'text', text: `时长：${plan.duration}分钟` },
        { tag: 'text', text: `动作：${plan.exercises.map(e => e.name).join(', ')}` },
      ],
    },
  };
  
  await sendFeishuMessage(userFeishuId, content);
}

// 发送周报
async function sendWeeklyReport(report: WeeklyReport): Promise<void> {
  const content: FeishuMessage = {
    type: 'post',
    content: {
      title: `📊 周报 (${report.week})`,
      items: [
        { tag: 'text', text: `训练次数：${report.training.count}` },
        { tag: 'text', text: `总时长：${report.training.totalMinutes}分钟` },
        { tag: 'text', text: `平均睡眠：${report.recovery.avgSleepScore}分` },
        { tag: 'text', text: `下周建议：${report.nextWeek.advice}` },
      ],
    },
  };
  
  await sendFeishuMessage(userFeishuId, content);
}
```

---

### 2.5 定时任务模块

```typescript
// src/services/scheduler.ts

import { cron } from '@openclaw/tools';

// 训练提醒 (每天 8:00)
const trainingReminderJob = {
  name: 'training-reminder',
  schedule: { kind: 'cron', expr: '0 8 * * *' },
  payload: { kind: 'systemEvent', text: '发送训练提醒' },
  sessionTarget: 'main',
};

// 饮食提醒 (每天 12:00, 18:00)
const nutritionReminderJob = {
  name: 'nutrition-reminder',
  schedule: { kind: 'cron', expr: '0 12,18 * * *' },
  payload: { kind: 'systemEvent', text: '发送饮食提醒' },
  sessionTarget: 'main',
};

// 周报推送 (每周一 9:00)
const weeklyReportJob = {
  name: 'weekly-report',
  schedule: { kind: 'cron', expr: '0 9 * * 1' },
  payload: { kind: 'systemEvent', text: '生成并发送周报' },
  sessionTarget: 'main',
};

async function setupCronJobs(): Promise<void> {
  await cron({ action: 'add', job: trainingReminderJob });
  await cron({ action: 'add', job: nutritionReminderJob });
  await cron({ action: 'add', job: weeklyReportJob });
}
```

---

## 3. 数据模型

### 3.1 数据库 Schema

```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  feishu_user_id TEXT UNIQUE,
  fitness_level TEXT,
  weight REAL,
  body_fat REAL,
  height REAL,
  age INTEGER,
  gender TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 训练记录表
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date DATE,
  type TEXT,
  duration INTEGER,
  calories INTEGER,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  details JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 饮食记录表
CREATE TABLE nutrition_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date DATE,
  meal_type TEXT,
  calories INTEGER,
  protein REAL,
  carbs REAL,
  fat REAL,
  foods JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 身体数据表
CREATE TABLE body_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date DATE,
  weight REAL,
  body_fat REAL,
  muscle_mass REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 训练计划表
CREATE TABLE training_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  week_start DATE,
  week_end DATE,
  plan JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 提醒设置表
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  time TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 4. 目录结构

```
agents/fitbot/
├── SOUL.md                    # 智能体身份定义
├── AGENTS.md                  # 工作规范
├── src/
│   ├── index.ts               # 主入口
│   ├── services/
│   │   ├── training.ts        # 运动规划服务
│   │   ├── running.ts         # 跑步计划服务
│   │   ├── nutrition.ts       # 饮食规划服务
│   │   ├── huawei.ts          # 华为数据服务
│   │   ├── analysis.ts        # 数据分析服务
│   │   ├── tracking.ts        # 进度追踪服务
│   │   ├── feishu.ts          # 飞书交互服务
│   │   └── scheduler.ts       # 定时任务服务
│   ├── models/
│   │   ├── user.ts            # 用户模型
│   │   ├── workout.ts         # 训练模型
│   │   ├── nutrition.ts       # 饮食模型
│   │   └── metrics.ts         # 身体数据模型
│   ├── repositories/
│   │   ├── database.ts        # 数据库连接
│   │   ├── user.ts            # 用户数据访问
│   │   └── ...
│   ├── utils/
│   │   ├── calculators.ts     # 计算工具
│   │   ├── formatters.ts      # 格式化工具
│   │   └── validators.ts      # 验证工具
│   └── types/
│       └── index.ts           # 类型定义
├── data/
│   ├── database.sqlite        # SQLite 数据库
│   └── imports/               # 华为数据导入目录
│       └── template.csv       # 导入模板
├── tests/
│   ├── services/
│   ├── models/
│   └── e2e/
├── docs/
│   ├── user-guide.md          # 用户指南
│   └── import-guide.md        # 数据导入指南
├── package.json
└── tsconfig.json
```

---

## 5. 测试策略

### 5.1 测试分层

```
┌─────────────────────────────────────┐
│         E2E 测试 (20%)              │
│   完整用户流程测试                   │
├─────────────────────────────────────┤
│       集成测试 (30%)                │
│   服务间交互测试                    │
├─────────────────────────────────────┤
│        单元测试 (50%)               │
│   各模块独立测试                    │
└─────────────────────────────────────┘
```

### 5.2 核心测试用例

| 模块 | 测试场景 | 用例数 |
|------|----------|--------|
| 运动规划 | 计划生成/协调 | 15 |
| 饮食规划 | 热量计算/分配 | 10 |
| 数据分析 | 数据解析/负荷计算 | 15 |
| 进度追踪 | 数据记录/趋势 | 10 |
| 飞书交互 | 消息发送/命令处理 | 10 |
| 定时任务 | 提醒/周报 | 5 |
| E2E | 完整流程 | 5 |
| **总计** | | **70** |

---

## 6. 部署配置

### 6.1 环境变量

```bash
# OpenClaw 配置
OPENCLAW_CHANNEL=feishu
OPENCLAW_ACCOUNTS=default

# 飞书配置 (通过 OpenClaw accounts)
FEISHU_BOT_WEBHOOK=${FEISHU_BOT_WEBHOOK}

# 数据库配置
DATABASE_PATH=./data/database.sqlite

# 应用配置
NODE_ENV=production
```

### 6.2 启动脚本

```bash
# 安装依赖
npm install

# 数据库初始化
npm run db:init

# 启动智能体
npm start

# 开发模式
npm run dev

# 测试
npm test
npm run test:e2e
```

---

## 7. 宪法 V3.7 合规

### 7.1 智能体定位

- **类型:** 领域智能体
- **位置:** agents/fitbot/
- **规范:** 遵循 AgentSkills 规范

### 7.2 技能调用

```typescript
// 可选调用宪法技能
import { sessions_spawn } from '@openclaw/tools';

// 需要意图识别时
const intent = await sessions_spawn({
  runtime: 'subagent',
  agentId: 'skill-01',
  task: '识别用户健身相关意图',
});

// 需要任务分析时
const analysis = await sessions_spawn({
  runtime: 'subagent',
  agentId: 'skill-03',
  task: '分析健身任务复杂度',
});
```

### 7.3 文档规范

- [ ] SOUL.md - 智能体身份
- [ ] AGENTS.md - 工作规范
- [ ] OpenSpec 文档集 (proposal/requirements/design/tasks)

---

*文档版本: 1.0*
*创建日期: 2026-03-11*
*规范版本: 宪法 V3.7*
*预计交付: 2026-04-22*
