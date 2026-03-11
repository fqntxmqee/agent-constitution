/**
 * FitBot 测试脚本
 */

const { FitBot } = require('../src/fitbot.js');
const { FeishuBot } = require('../src/integrations/feishu-bot.js');

const assert = require('assert');

let passed = 0;
const total = 12;

function test(name, fn) {
  try {
    fn();
    console.log('[PASS]', name);
    passed++;
  } catch (err) {
    console.log('[FAIL]', name, err.message);
  }
}

// AC1: 运动规划功能
test('AC1-01: 生成力量训练计划', () => {
  const bot = new FitBot();
  const plan = bot.generateWorkoutPlan(1);
  assert.ok(plan.strength, '力量计划应存在');
  assert.ok(plan.strength.schedule['周一'], '周一训练应存在');
});

test('AC1-02: 生成跑步计划', () => {
  const bot = new FitBot();
  const plan = bot.generateWorkoutPlan(1);
  assert.ok(plan.running, '跑步计划应存在');
  assert.strictEqual(plan.running.goal.target, '2:00', '半马目标应为 2:00');
});

test('AC1-03: 生成骑车计划', () => {
  const bot = new FitBot();
  const plan = bot.generateWorkoutPlan(1);
  assert.ok(plan.cycling, '骑车计划应存在');
  assert.strictEqual(plan.cycling.schedule['每日'].duration, 60, '骑车时长应为 60 分钟');
});

// AC2: 饮食规划功能
test('AC2-01: 生成高蛋白饮食计划', () => {
  const bot = new FitBot();
  const nutrition = bot.generateNutritionPlan(75);
  assert.ok(nutrition, '饮食计划应存在');
  assert.ok(nutrition.daily.protein >= 140, '蛋白质应≥140g');
});

// AC3: 华为数据导入
test('AC3-01: 导入华为手表数据', () => {
  const bot = new FitBot();
  const data = {
    workouts: [{ type: 'running', duration: 45, volume: 5000 }],
    heartRate: { resting: 55 },
    sleep: { duration: 7.5, quality: 'good' },
    steps: 10000
  };
  const result = bot.importHuaweiData(data);
  assert.strictEqual(result.success, true, '导入应成功');
});

// AC4: 数据分析
test('AC4-01: 分析训练负荷', () => {
  const bot = new FitBot();
  bot.importHuaweiData({ workouts: [{ volume: 5000, intensity: 6 }] });
  const analysis = bot.analyzeTrainingLoad();
  assert.ok(analysis.load >= 0, '训练负荷应≥0');
});

// AC5: 进度追踪
test('AC5-01: 生成周报', () => {
  const bot = new FitBot();
  bot.importHuaweiData({ workouts: [
    { type: 'strength', date: new Date().toISOString() },
    { type: 'running', date: new Date().toISOString() }
  ]});
  const report = bot.generateWeeklyReport();
  assert.ok(report.summary.totalWorkouts >= 0, '训练次数应≥0');
});

// AC6: 提醒功能
test('AC6-01: 飞书机器人发送提醒', async () => {
  const feishu = new FeishuBot();
  const result = await feishu.sendWorkoutReminder({ focus: '推 (胸/肩/三头)' });
  assert.strictEqual(result.success, true, '发送应成功');
});

// AC7: 飞书集成
test('AC7-01: 飞书机器人初始化', () => {
  const feishu = new FeishuBot({ webhookUrl: 'test' });
  assert.ok(feishu.config.webhookUrl, 'webhook 应配置');
});

// AC8: 周报推送
test('AC8-01: 飞书发送周报', async () => {
  const feishu = new FeishuBot();
  const report = {
    summary: { totalWorkouts: 5, strengthSessions: 2, runningSessions: 2, cyclingSessions: 1 },
    highlights: ['完成 5 次训练'],
    suggestions: ['保持频率']
  };
  const result = await feishu.sendWeeklyReport(report);
  assert.strictEqual(result.success, true, '发送应成功');
});

// 性能测试
test('PERF-01: 响应时间 <1 秒', () => {
  const bot = new FitBot();
  const start = Date.now();
  bot.generateWorkoutPlan(1);
  bot.generateNutritionPlan(75);
  const duration = Date.now() - start;
  assert.ok(duration < 1000, `响应时间应<1 秒，实际${duration}ms`);
});

// 配置验证
test('CONFIG-01: 用户配置正确', () => {
  const bot = new FitBot({
    userLevel: 'intermediate',
    trainingType: 'dumbbell-split',
    runningGoal: { distance: 'half-marathon', current: '2:10', target: '2:00' }
  });
  assert.strictEqual(bot.config.userLevel, 'intermediate', '健身水平应为中级');
  assert.strictEqual(bot.config.runningGoal.target, '2:00', '跑步目标应为 2:00');
});

console.log('\n总计：' + passed + '/' + total);
console.log(passed === total ? '✅ 全部通过' : '❌ 有失败');
process.exit(passed === total ? 0 : 1);
