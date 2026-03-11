/**
 * FitBot 健身教练智能体 - 主类
 * 遵循宪法规范 V3.7
 */

const { WorkoutPlanner } = require('./modules/workout-planner');
const { NutritionPlanner } = require('./modules/nutrition-planner');
const { MessagingService } = require('./integrations/messaging');

class FitBot {
  constructor(config = {}) {
    this.config = {
      name: 'FitBot Pro',
      version: '1.0.0',
      userLevel: config.userLevel || 'intermediate',
      trainingType: config.trainingType || 'dumbbell-split',
      runningGoal: config.runningGoal || { distance: 'half-marathon', current: '2:10', target: '2:00' },
      cyclingSchedule: config.cyclingSchedule || { duration: 60, intensity: 'low-medium', frequency: 'daily' },
      dietFocus: config.dietFocus || 'high-protein',
      weight: config.weight || 75,
      ...config
    };

    this.workoutPlanner = new WorkoutPlanner(config);
    this.nutritionPlanner = new NutritionPlanner(config);
    this.messaging = new MessagingService(config);
    
    this.userData = {
      workouts: [],
      nutrition: [],
      metrics: { weight: [], bodyFat: [], restingHeartRate: [], sleep: [] },
      progress: {}
    };
  }

  /**
   * 生成周训练计划
   */
  generateWeeklyPlan(week = 1) {
    return this.workoutPlanner.generateWeeklyPlan(week);
  }

  /**
   * 生成饮食计划
   */
  generateNutritionPlan(weight = this.config.weight) {
    return this.nutritionPlanner.generatePlan(weight);
  }

  /**
   * 导入训练数据
   */
  importData(data) {
    const timestamp = new Date().toISOString();
    const workouts = (data.workouts || []).map(w => ({ ...w, date: w.date || timestamp }));
    
    this.userData.workouts.push(...workouts);
    if (data.heartRate?.resting) {
      this.userData.metrics.restingHeartRate.push({ date: timestamp, value: data.heartRate.resting });
    }
    if (data.sleep && Object.keys(data.sleep).length > 0) {
      this.userData.metrics.sleep.push({ date: timestamp, ...data.sleep });
    }
    
    return { success: true, imported: { timestamp, workouts } };
  }

  /**
   * 分析训练数据
   */
  analyzeData() {
    const workouts = this.userData.workouts;
    if (workouts.length === 0) return { status: '无数据', load: 0 };
    
    const totalVolume = workouts.reduce((sum, w) => sum + (w.volume || w.duration || 0), 0);
    const avgIntensity = workouts.reduce((sum, w) => sum + (w.intensity || 5), 0) / workouts.length;
    
    return {
      status: totalVolume > 10000 ? '高' : totalVolume > 5000 ? '中' : '低',
      load: totalVolume,
      intensity: avgIntensity.toFixed(1),
      trend: '稳定'
    };
  }

  /**
   * 生成周报
   */
  generateWeeklyReport() {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const workouts = this.userData.workouts.filter(w => new Date(w.date || now).getTime() >= weekAgo);
    
    return {
      period: '本周',
      summary: {
        totalWorkouts: workouts.length,
        strengthSessions: workouts.filter(w => w.type === 'strength').length,
        runningSessions: workouts.filter(w => w.type === 'running').length,
        cyclingSessions: workouts.filter(w => w.type === 'cycling').length
      },
      highlights: [
        `完成 ${workouts.length} 次训练`,
        `力量训练 ${workouts.filter(w => w.type === 'strength').length} 次`,
        `跑步训练 ${workouts.filter(w => w.type === 'running').length} 次`
      ],
      suggestions: ['保持当前训练频率', '注意恢复和睡眠', '逐步增加跑步配速']
    };
  }

  /**
   * 发送训练提醒
   */
  async sendDailyReminder() {
    const plan = this.workoutPlanner.generateStrengthPlan();
    const today = new Date().toLocaleDateString('zh-CN', { weekday: 'long' });
    const workout = plan.schedule[today] || plan.schedule['周一'];
    
    if (workout) {
      return this.messaging.sendWorkoutReminder(workout);
    }
    return { success: false, message: '今日无训练计划' };
  }

  /**
   * 发送周报
   */
  async sendWeeklyReport() {
    const report = this.generateWeeklyReport();
    return this.messaging.sendWeeklyReport(report);
  }
}

module.exports = { FitBot };
