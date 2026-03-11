/**
 * FitBot 健身教练智能体 - 专业版
 */

class FitBot {
  constructor(config = {}) {
    this.config = {
      name: 'FitBot Pro', version: '1.0.0',
      userLevel: config.userLevel || 'intermediate',
      trainingType: config.trainingType || 'dumbbell-split',
      runningGoal: config.runningGoal || { distance: 'half-marathon', current: '2:10', target: '2:00' },
      cyclingSchedule: config.cyclingSchedule || { duration: 60, intensity: 'low-medium', frequency: 'daily' },
      dietFocus: config.dietFocus || 'high-protein',
      dataSource: config.dataSource || 'huawei-watch',
      messageChannel: config.messageChannel || 'feishu-bot',
      ...config
    };
    this.userData = { workouts: [], nutrition: [], metrics: { weight: [], bodyFat: [], restingHeartRate: [], sleep: [] }, progress: {} };
  }

  generateWorkoutPlan(week = 1) {
    return { week, strength: this._generateStrengthPlan(), running: this._generateRunningPlan(week), cycling: this._generateCyclingPlan(), rest: ['周日'] };
  }

  _generateStrengthPlan() {
    return {
      type: '哑铃三分化',
      schedule: {
        '周一': { focus: '推 (胸/肩/三头)', exercises: [
          { name: '哑铃卧推', sets: 4, reps: '8-10', rest: 90 },
          { name: '哑铃肩上推举', sets: 4, reps: '8-10', rest: 90 },
          { name: '哑铃飞鸟', sets: 3, reps: '10-12', rest: 60 },
          { name: '哑铃侧平举', sets: 3, reps: '12-15', rest: 60 },
          { name: '哑铃臂屈伸', sets: 3, reps: '10-12', rest: 60 }
        ]},
        '周三': { focus: '拉 (背/二头)', exercises: [
          { name: '哑铃划船', sets: 4, reps: '8-10', rest: 90 },
          { name: '哑铃硬拉', sets: 4, reps: '8-10', rest: 90 },
          { name: '哑铃弯举', sets: 3, reps: '10-12', rest: 60 },
          { name: '锤式弯举', sets: 3, reps: '10-12', rest: 60 },
          { name: '俯身反向飞鸟', sets: 3, reps: '12-15', rest: 60 }
        ]},
        '周五': { focus: '腿 (股四头/腘绳/小腿)', exercises: [
          { name: '哑铃深蹲', sets: 4, reps: '8-10', rest: 90 },
          { name: '哑铃弓步', sets: 3, reps: '10-12', rest: 90 },
          { name: '哑铃罗马尼亚硬拉', sets: 3, reps: '10-12', rest: 90 },
          { name: '哑铃提踵', sets: 4, reps: '15-20', rest: 60 },
          { name: '平板支撑', sets: 3, reps: '60s', rest: 60 }
        ]}
      }
    };
  }

  _generateRunningPlan(week) {
    const progression = Math.min(week / 12, 1);
    return {
      type: '半马配速训练', goal: { current: '2:10', target: '2:00' },
      schedule: {
        '周二': { type: '轻松跑', duration: 45, pace: '6:30-7:00 min/km', heartRate: '130-150 bpm' },
        '周四': { type: '配速跑', duration: 40, pace: this._interpolatePace('6:20', '5:41', progression) + ' min/km', heartRate: '150-165 bpm' },
        '周六': { type: '长距离', duration: 90 + (week * 5), pace: '6:30-7:00 min/km', heartRate: '130-150 bpm' }
      }
    };
  }

  _generateCyclingPlan() {
    return { type: '有氧恢复', schedule: { '每日': { duration: 60, intensity: '中低强度', heartRate: '120-140 bpm', notes: '保持轻松，促进恢复' } } };
  }

  generateNutritionPlan(weight = 75) {
    const calories = weight * 35, protein = Math.round(weight * 2.0);
    return {
      type: '高蛋白增肌计划',
      daily: { calories: Math.round(calories), protein, carbs: Math.round(calories * 0.45 / 4), fat: Math.round(calories * 0.25 / 9) },
      meals: {
        breakfast: { name: '高蛋白早餐', items: ['燕麦 50g', '蛋白 4 个 + 全蛋 2 个', '牛奶 250ml', '香蕉 1 根'], protein: '35g' },
        lunch: { name: '均衡午餐', items: ['鸡胸肉 150g', '米饭 150g', '蔬菜 200g', '橄榄油 10g'], protein: '40g' },
        dinner: { name: '高蛋白晚餐', items: ['鱼肉 150g', '红薯 150g', '蔬菜 200g', '牛油果 半个'], protein: '40g' },
        snacks: { name: '加餐', items: ['蛋白粉 1 勺', '坚果 30g', '希腊酸奶 100g'], protein: '30g' }
      }
    };
  }

  importHuaweiData(data) {
    const timestamp = new Date().toISOString();
    const workouts = (data.workouts || []).map(w => ({ ...w, date: w.date || timestamp }));
    
    this.userData.workouts.push(...workouts);
    if (data.heartRate && data.heartRate.resting) {
      this.userData.metrics.restingHeartRate.push({ date: timestamp, value: data.heartRate.resting });
    }
    if (data.sleep && Object.keys(data.sleep).length > 0) {
      this.userData.metrics.sleep.push({ date: timestamp, ...data.sleep });
    }
    
    return { success: true, imported: { timestamp, workouts, heartRate: data.heartRate || {}, sleep: data.sleep || {}, steps: data.steps || 0 } };
  }

  analyzeTrainingLoad() {
    const workouts = this.userData.workouts;
    if (workouts.length === 0) return { status: '无数据', load: 0, intensity: 0, trend: '无' };
    const totalVolume = workouts.reduce((sum, w) => sum + (w.volume || w.duration || 0), 0);
    const avgIntensity = workouts.reduce((sum, w) => sum + (w.intensity || 5), 0) / workouts.length;
    return { status: totalVolume > 10000 ? '高' : totalVolume > 5000 ? '中' : '低', load: totalVolume, intensity: avgIntensity.toFixed(1), trend: '稳定' };
  }

  generateWeeklyReport() {
    const now = Date.now(), weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const workouts = this.userData.workouts.filter(w => new Date(w.date || now).getTime() >= weekAgo);
    return {
      period: '本周',
      summary: { totalWorkouts: workouts.length, strengthSessions: workouts.filter(w => w.type === 'strength').length, runningSessions: workouts.filter(w => w.type === 'running').length, cyclingSessions: workouts.filter(w => w.type === 'cycling').length },
      highlights: [`完成 ${workouts.length} 次训练`, `力量训练 ${workouts.filter(w => w.type === 'strength').length} 次`, `跑步训练 ${workouts.filter(w => w.type === 'running').length} 次`],
      suggestions: ['保持当前训练频率', '注意恢复和睡眠', '逐步增加跑步配速']
    };
  }

  _interpolatePace(start, end, progress) {
    const [sMin, sSec] = start.split(':').map(Number);
    const [eMin, eSec] = end.split(':').map(Number);
    const current = (sMin * 60 + sSec) - ((sMin * 60 + sSec) - (eMin * 60 + eSec)) * progress;
    return Math.floor(current / 60) + ':' + Math.round(current % 60).toString().padStart(2, '0');
  }
}

module.exports = { FitBot };
