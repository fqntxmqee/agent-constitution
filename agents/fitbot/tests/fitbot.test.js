/**
 * FitBot 测试脚本
 */

const { FitBot } = require('../src/fitbot');
const { WorkoutPlanner } = require('../src/modules/workout-planner');
const { NutritionPlanner } = require('../src/modules/nutrition-planner');

const assert = require('assert');

let passed = 0;
const total = 15;

function test(name, fn) {
  try {
    fn();
    console.log('[PASS]', name);
    passed++;
  } catch (err) {
    console.log('[FAIL]', name, err.message);
  }
}

// 阶段 2: P0 核心功能测试
test('P0-01: 生成力量训练计划', () => {
  const planner = new WorkoutPlanner();
  const plan = planner.generateStrengthPlan();
  assert.ok(plan.type === '哑铃三分化', '应为哑铃三分化');
  assert.ok(plan.schedule['周一'], '周一训练应存在');
});

test('P0-02: 生成跑步计划', () => {
  const bot = new FitBot();
  const plan = bot.generateWeeklyPlan(1);
  assert.ok(plan.running, '跑步计划应存在');
  assert.strictEqual(plan.running.goal.target, '2:00', '半马目标应为 2:00');
});

test('P0-03: 生成骑车计划', () => {
  const bot = new FitBot();
  const plan = bot.generateWeeklyPlan(1);
  assert.ok(plan.cycling, '骑车计划应存在');
  assert.strictEqual(plan.cycling.schedule['每日'].duration, 60, '骑车时长应为 60 分钟');
});

test('P0-04: 生成高蛋白饮食计划', () => {
  const planner = new NutritionPlanner();
  const nutrition = planner.generatePlan(75);
  assert.ok(nutrition.daily.protein >= 140, '蛋白质应≥140g');
  assert.ok(nutrition.meals.breakfast, '早餐应存在');
});

test('P0-05: 导入训练数据', () => {
  const bot = new FitBot();
  const data = { workouts: [{ type: 'running', duration: 45 }], heartRate: { resting: 55 } };
  const result = bot.importData(data);
  assert.strictEqual(result.success, true, '导入应成功');
});

test('P0-06: 分析训练数据', () => {
  const bot = new FitBot();
  bot.importData({ workouts: [{ duration: 5000, intensity: 6 }] });
  const analysis = bot.analyzeData();
  assert.ok(analysis.load >= 0, '训练负荷应≥0');
});

test('P0-07: 生成周报', () => {
  const bot = new FitBot();
  bot.importData({ workouts: [{ type: 'strength', date: new Date().toISOString() }] });
  const report = bot.generateWeeklyReport();
  assert.ok(report.summary.totalWorkouts >= 0, '训练次数应≥0');
});

test('P0-08: 发送训练提醒', async () => {
  const bot = new FitBot();
  const result = await bot.sendDailyReminder();
  assert.ok(result.success !== false, '提醒应发送');
});

test('P0-09: 发送周报', async () => {
  const bot = new FitBot();
  const result = await bot.sendWeeklyReport();
  assert.ok(result.success !== false, '周报应发送');
});

test('P0-10: 用户配置正确', () => {
  const bot = new FitBot({ userLevel: 'intermediate', weight: 75 });
  assert.strictEqual(bot.config.userLevel, 'intermediate', '健身水平应为中级');
  assert.strictEqual(bot.config.weight, 75, '体重应为 75kg');
});

// 性能测试
test('PERF-01: 响应时间 <1 秒', () => {
  const bot = new FitBot();
  const start = Date.now();
  bot.generateWeeklyPlan(1);
  bot.generateNutritionPlan(75);
  const duration = Date.now() - start;
  assert.ok(duration < 1000, `响应时间应<1 秒，实际${duration}ms`);
});

// 宪法规范 V3.7 合规测试
test('V3.7-01: AGENTS.md 存在', () => {
  const fs = require('fs');
  const path = require('path');
  const agentsPath = path.join(__dirname, '../AGENTS.md');
  assert.ok(fs.existsSync(agentsPath), 'AGENTS.md 应存在');
});

test('V3.7-02: SOUL.md 存在', () => {
  const fs = require('fs');
  const path = require('path');
  const soulPath = path.join(__dirname, '../SOUL.md');
  assert.ok(fs.existsSync(soulPath), 'SOUL.md 应存在');
});

test('V3.7-03: TOOLS.md 存在', () => {
  const fs = require('fs');
  const path = require('path');
  const toolsPath = path.join(__dirname, '../TOOLS.md');
  assert.ok(fs.existsSync(toolsPath), 'TOOLS.md 应存在');
});

test('V3.7-04: 目录结构正确', () => {
  const fs = require('fs');
  const path = require('path');
  const srcPath = path.join(__dirname, '../src');
  assert.ok(fs.existsSync(srcPath), 'src 目录应存在');
  assert.ok(fs.existsSync(path.join(srcPath, 'modules')), 'modules 目录应存在');
  assert.ok(fs.existsSync(path.join(srcPath, 'integrations')), 'integrations 目录应存在');
});

console.log('\n' + '='.repeat(50));
console.log('总计：' + passed + '/' + total);
console.log(passed === total ? '✅ 全部通过' : '❌ 有失败');
console.log('='.repeat(50));
process.exit(passed === total ? 0 : 1);
