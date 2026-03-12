# FitBot Pro 健身教练智能体 - 技术设计文档

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FitBot Pro 系统架构                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        用户交互层                                │   │
│  │                    飞书机器人 / 飞书小程序                        │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        API 网关层                                │   │
│  │              消息路由 / 认证 / 限流 / 日志                       │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        业务逻辑层                                │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│  │  │ 运动规划  │ │ 饮食规划  │ │ 数据分析  │ │ 进度追踪  │       │   │
│  │  │ Service   │ │ Service   │ │ Service   │ │ Service   │       │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐                     │   │
│  │  │ 提醒服务  │ │ 飞书集成  │ │ AI 建议    │                     │   │
│  │  │ Service   │ │ Service   │ │ Engine    │                     │   │
│  │  └───────────┘ └───────────┘ └───────────┘                     │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        数据访问层                                │   │
│  │              Repository / DAO / 数据转换                         │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        数据存储层                                │   │
│  │         SQLite (本地数据) + JSON (配置文件)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        外部服务                                  │   │
│  │         华为健康 API / 飞书机器人 API                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 模块依赖图

```
                    ┌─────────────┐
                    │  用户交互   │
                    │  (飞书)     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   API 网关   │
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
│   进度追踪模块   │ │   提醒模块  │ │   飞书集成    │
│                 │ │             │ │    模块       │
│ - 力量追踪      │ │ - 训练提醒  │ │ - 消息发送    │
│ - 耐力追踪      │ │ - 饮食提醒  │ │ - 周报推送    │
│ - 身体数据      │ │ - 恢复提醒  │ │ - 交互处理    │
└────────┬────────┘ └──────┬──────┘ └───────┬───────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │  数据存储   │
                    │  (SQLite)   │
                    └─────────────┘
```

---

## 2. 核心模块设计

### 2.1 运动规划模块

#### 三分化力量训练计划生成

```typescript
interface StrengthPlan {
  week: number;
  days: TrainingDay[];
}

interface TrainingDay {
  dayType: 'push' | 'pull' | 'legs';
  exercises: Exercise[];
  duration: number; // minutes
}

interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g., "8-12"
  weight?: string; // e.g., "70% 1RM"
  rest: number; // seconds
  notes?: string;
}

// 推日动作库
const pushExercises = [
  { name: '哑铃卧推', muscle: 'chest' },
  { name: '哑铃肩推', muscle: 'shoulders' },
  { name: '哑铃飞鸟', muscle: 'chest' },
  { name: '侧平举', muscle: 'shoulders' },
  { name: '臂屈伸', muscle: 'triceps' },
  { name: '俯卧撑', muscle: 'chest' },
];

// 拉日动作库
const pullExercises = [
  { name: '哑铃划船', muscle: 'back' },
  { name: '引体向上', muscle: 'back' },
  { name: '哑铃弯举', muscle: 'biceps' },
  { name: '面拉', muscle: 'rear_delts' },
  { name: '锤式弯举', muscle: 'biceps' },
];

// 腿日动作库
const legExercises = [
  { name: '哑铃深蹲', muscle: 'quads' },
  { name: '罗马尼亚硬拉', muscle: 'hamstrings' },
  { name: '弓步蹲', muscle: 'quads' },
  { name: '小腿提踵', muscle: 'calves' },
  { name: '臀桥', muscle: 'glutes' },
];
```

#### 跑步训练计划生成

```typescript
interface RunningPlan {
  week: number;
  goal: string; // e.g., "半马 2:00"
  sessions: RunningSession[];
}

interface RunningSession {
  type: 'easy' | 'tempo' | 'interval' | 'long' | 'recovery';
  duration: number; // minutes
  distance?: number; // km
  pace?: string; // e.g., "5:30-6:00/km"
  heartRateZone?: number; // 1-5
  notes?: string;
}

// 半马训练周期 (8 周)
const halfMarathonPlan = [
  { week: 1, longRun: 8, totalDistance: 25 },
  { week: 2, longRun: 10, totalDistance: 30 },
  { week: 3, longRun: 12, totalDistance: 35 },
  { week: 4, longRun: 8, totalDistance: 25 }, // 减量周
  { week: 5, longRun: 14, totalDistance: 40 },
  { week: 6, longRun: 16, totalDistance: 45 },
  { week: 7, longRun: 10, totalDistance: 30 }, // 减量周
  { week: 8, longRun: 5, totalDistance: 15 }, // 比赛周
];
```

---

### 2.2 饮食规划模块

#### 热量与营养计算

```typescript
interface NutritionPlan {
  dailyCalories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  meals: MealPlan[];
}

interface MealPlan {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions: string[];
}

// 计算基础代谢 (Mifflin-St Jeor 公式)
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

// 计算每日热量需求
function calculateTDEE(bmr: number, activityLevel: number): number {
  return bmr * activityLevel;
}

// 高蛋白饮食宏量营养素分配
function calculateMacros(calories: number, weight: number, goal: string): NutritionPlan {
  const proteinPerKg = goal === 'muscle_gain' ? 2.0 : 1.6;
  const protein = weight * proteinPerKg;
  const proteinCalories = protein * 4;
  
  const fatRatio = 0.25;
  const fatCalories = calories * fatRatio;
  const fat = fatCalories / 9;
  
  const carbsCalories = calories - proteinCalories - fatCalories;
  const carbs = carbsCalories / 4;
  
  return { dailyCalories: calories, protein, carbs, fat, meals: [] };
}
```

---

### 2.3 数据分析模块

#### 华为数据解析

```typescript
interface HuaweiWorkout {
  startTime: string;
  endTime: string;
  sportType: number;
  calories: number;
  distance: number;
  avgHeartRate: number;
  maxHeartRate: number;
  steps?: number;
}

interface HuaweiSleep {
  startTime: string;
  endTime: string;
  sleepScore: number;
  deepSleep: number; // minutes
  lightSleep: number;
  remSleep: number;
  awake: number;
}

interface HuaweiHealthData {
  workouts: HuaweiWorkout[];
  sleep: HuaweiSleep[];
  heartRates: { timestamp: string; value: number }[];
  steps: { date: string; value: number }[];
}
```

#### 训练负荷计算 (ACWR)

```typescript
interface TrainingLoad {
  acuteLoad: number; // 7 天平均
  chronicLoad: number; // 28 天平均
  acwr: number; // 急性/慢性比
  riskLevel: 'low' | 'moderate' | 'high';
}

function calculateACWR(loads: number[]): TrainingLoad {
  const acuteLoad = average(loads.slice(-7));
  const chronicLoad = average(loads.slice(-28));
  const acwr = acuteLoad / chronicLoad;
  
  let riskLevel: 'low' | 'moderate' | 'high';
  if (acwr < 0.8 || acwr > 1.5) {
    riskLevel = 'high';
  } else if (acwr < 1.0 || acwr > 1.3) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }
  
  return { acuteLoad, chronicLoad, acwr, riskLevel };
}
```

#### 恢复状态评估

```typescript
interface RecoveryStatus {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor';
  factors: RecoveryFactor[];
  recommendation: 'train' | 'recover' | 'rest';
}

interface RecoveryFactor {
  name: string;
  score: number;
  weight: number;
}

function assessRecovery(data: RecoveryData): RecoveryStatus {
  const factors: RecoveryFactor[] = [
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
  
  return { score, level, factors, recommendation };
}
```

---

### 2.4 飞书集成模块

#### 消息发送

```typescript
interface FeishuMessage {
  msg_type: 'text' | 'post' | 'interactive';
  content: {
    text?: string;
    post?: PostContent;
    interactive?: InteractiveContent;
  };
  receive_id?: string;
}

interface PostContent {
  zh_cn: {
    title: string;
    content: Array<Array<{
      tag: 'text' | 'link' | 'at';
      text?: string;
      href?: string;
      user_id?: string;
    }>>;
  };
}

// 发送训练提醒
async function sendTrainingReminder(plan: TrainingDay, time: string) {
  const message: FeishuMessage = {
    msg_type: 'post',
    content: {
      post: {
        zh_cn: {
          title: '💪 训练提醒',
          content: [
            [{ tag: 'text', text: `今天训练：${plan.dayType.toUpperCase()}` }],
            [{ tag: 'text', text: `时间：${time}` }],
            [{ tag: 'text', text: `动作：${plan.exercises.map(e => e.name).join(', ')}` }],
            [{ tag: 'text', text: '准备好开始了吗？' }],
          ],
        },
      },
    },
  };
  
  await feishuBot.send(message);
}
```

#### 周报生成

```typescript
interface WeeklyReport {
  week: string;
  training: TrainingSummary;
  nutrition: NutritionSummary;
  recovery: RecoverySummary;
  progress: ProgressSummary;
  nextWeek: NextWeekPlan;
}

async function generateWeeklyReport(userId: string): Promise<WeeklyReport> {
  const training = await getTrainingSummary(userId);
  const nutrition = await getNutritionSummary(userId);
  const recovery = await getRecoverySummary(userId);
  const progress = await getProgressSummary(userId);
  const nextWeek = await generateNextWeekPlan(userId);
  
  return {
    week: getCurrentWeek(),
    training,
    nutrition,
    recovery,
    progress,
    nextWeek,
  };
}
```

---

## 3. 数据模型

### 3.1 数据库 Schema

```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  feishu_user_id TEXT,
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
  type TEXT, -- strength/running/cycling
  duration INTEGER, -- minutes
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
  meal_type TEXT, -- breakfast/lunch/dinner/snack
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
  waist REAL,
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
  type TEXT, -- training/nutrition/recovery
  time TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 4. 目录结构

```
fitbot-pro/
├── src/
│   ├── index.ts              # 主入口
│   ├── config/
│   │   ├── database.ts       # 数据库配置
│   │   ├── feishu.ts         # 飞书配置
│   │   └── huawei.ts         # 华为配置
│   ├── services/
│   │   ├── training.ts       # 运动规划服务
│   │   ├── nutrition.ts      # 饮食规划服务
│   │   ├── analysis.ts       # 数据分析服务
│   │   ├── tracking.ts       # 进度追踪服务
│   │   ├── reminder.ts       # 提醒服务
│   │   └── feishu.ts         # 飞书集成服务
│   ├── models/
│   │   ├── user.ts           # 用户模型
│   │   ├── workout.ts        # 训练模型
│   │   ├── nutrition.ts      # 饮食模型
│   │   └── metrics.ts        # 身体数据模型
│   ├── repositories/
│   │   ├── user.ts           # 用户数据访问
│   │   ├── workout.ts        # 训练数据访问
│   │   └── ...
│   ├── utils/
│   │   ├── calculators.ts    # 计算工具
│   │   ├── formatters.ts     # 格式化工具
│   │   └── validators.ts     # 验证工具
│   └── types/
│       └── index.ts          # 类型定义
├── data/
│   ├── database.sqlite       # SQLite 数据库
│   └── imports/              # 华为数据导入目录
├── tests/
│   ├── services/
│   ├── models/
│   └── integration/
├── docs/
│   ├── user-guide.md         # 用户指南
│   └── api.md                # API 文档
├── package.json
└── tsconfig.json
```

---

## 5. 测试策略

### 5.1 测试分层

```
┌─────────────────────────────────────┐
│         E2E 测试 (10%)              │
│   完整用户流程测试                   │
├─────────────────────────────────────┤
│       集成测试 (30%)                │
│   服务间交互测试                    │
├─────────────────────────────────────┤
│        单元测试 (60%)               │
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
| 提醒功能 | 定时发送/交互 | 10 |
| 飞书集成 | 消息发送/周报 | 10 |

---

## 6. 部署配置

### 6.1 环境变量

```bash
# 飞书配置
FEISHU_APP_ID=xxx
FEISHU_APP_SECRET=xxx
FEISHU_VERIFICATION_TOKEN=xxx
FEISHU_BOT_WEBHOOK=xxx

# 华为配置 (可选)
HUAWEI_CLIENT_ID=xxx
HUAWEI_CLIENT_SECRET=xxx

# 数据库配置
DATABASE_PATH=./data/database.sqlite

# 应用配置
NODE_ENV=production
PORT=3000
```

### 6.2 启动脚本

```bash
# 安装依赖
npm install

# 数据库初始化
npm run db:init

# 启动服务
npm start

# 开发模式
npm run dev
```

---

*文档版本: 1.0*
*创建日期: 2026-03-11*
*预计交付: 2026-04-22*
