/**
 * 运动规划模块 - 三分化力量训练
 */

class WorkoutPlanner {
  constructor(config = {}) {
    this.config = {
      trainingType: config.trainingType || 'dumbbell-split',
      location: config.location || 'home',
      frequency: config.frequency || 3,
      ...config
    };
  }

  /**
   * 生成力量训练计划（哑铃三分化）
   */
  generateStrengthPlan() {
    return {
      type: '哑铃三分化',
      location: '家庭',
      equipment: ['哑铃', '训练凳（可选）'],
      schedule: {
        '周一': {
          focus: '推 (胸/肩/三头)',
          warmup: '5-10 分钟动态热身',
          exercises: [
            { name: '哑铃卧推', sets: 4, reps: '8-10', rest: 90, tips: '保持肩胛骨收紧' },
            { name: '哑铃肩上推举', sets: 4, reps: '8-10', rest: 90, tips: '核心收紧，不要弓背' },
            { name: '哑铃飞鸟', sets: 3, reps: '10-12', rest: 60, tips: '感受胸肌拉伸' },
            { name: '哑铃侧平举', sets: 3, reps: '12-15', rest: 60, tips: '小重量，控制动作' },
            { name: '哑铃臂屈伸', sets: 3, reps: '10-12', rest: 60, tips: '大臂固定，只动小臂' }
          ],
          cooldown: '5 分钟拉伸'
        },
        '周三': {
          focus: '拉 (背/二头)',
          warmup: '5-10 分钟动态热身',
          exercises: [
            { name: '哑铃划船', sets: 4, reps: '8-10', rest: 90, tips: '保持背部平直' },
            { name: '哑铃硬拉', sets: 4, reps: '8-10', rest: 90, tips: '髋部发力，不要弯腰' },
            { name: '哑铃弯举', sets: 3, reps: '10-12', rest: 60, tips: '大臂固定' },
            { name: '锤式弯举', sets: 3, reps: '10-12', rest: 60, tips: '掌心相对' },
            { name: '俯身反向飞鸟', sets: 3, reps: '12-15', rest: 60, tips: '后束发力' }
          ],
          cooldown: '5 分钟拉伸'
        },
        '周五': {
          focus: '腿 (股四头/腘绳/小腿)',
          warmup: '5-10 分钟动态热身',
          exercises: [
            { name: '哑铃深蹲', sets: 4, reps: '8-10', rest: 90, tips: '膝盖对齐脚尖' },
            { name: '哑铃弓步', sets: 3, reps: '10-12', rest: 90, tips: '每侧' },
            { name: '哑铃罗马尼亚硬拉', sets: 3, reps: '10-12', rest: 90, tips: '感受腘绳拉伸' },
            { name: '哑铃提踵', sets: 4, reps: '15-20', rest: 60, tips: '顶峰收缩' },
            { name: '平板支撑', sets: 3, reps: '60s', rest: 60, tips: '保持身体成直线' }
          ],
          cooldown: '5 分钟拉伸'
        }
      },
      restDays: ['周二', '周四', '周六', '周日'],
      notes: [
        '每次训练前充分热身',
        '训练后进行拉伸',
        '组间休息控制在指定时间',
        '重量选择以完成规定次数为准',
        '动作质量优先于重量'
      ]
    };
  }

  /**
   * 生成周训练计划
   */
  generateWeeklyPlan(week = 1) {
    return {
      week,
      strength: this.generateStrengthPlan(),
      running: this._generateRunningPlan(week),
      cycling: this._generateCyclingPlan(),
      rest: ['周日']
    };
  }

  _generateRunningPlan(week) {
    const progression = Math.min(week / 12, 1);
    const currentPace = '6:20';
    const targetPace = '5:41';
    
    return {
      type: '半马配速训练',
      goal: { current: '2:10', target: '2:00' },
      schedule: {
        '周二': { type: '轻松跑', duration: 45, pace: '6:30-7:00 min/km', heartRate: '130-150 bpm' },
        '周四': { type: '配速跑', duration: 40, pace: this._interpolatePace(currentPace, targetPace, progression) + ' min/km', heartRate: '150-165 bpm' },
        '周六': { type: '长距离', duration: 90 + (week * 5), pace: '6:30-7:00 min/km', heartRate: '130-150 bpm' }
      }
    };
  }

  _generateCyclingPlan() {
    return {
      type: '有氧恢复',
      schedule: {
        '每日': { duration: 60, intensity: '中低强度', heartRate: '120-140 bpm', notes: '保持轻松，促进恢复' }
      }
    };
  }

  _interpolatePace(start, end, progress) {
    const [sMin, sSec] = start.split(':').map(Number);
    const [eMin, eSec] = end.split(':').map(Number);
    const current = (sMin * 60 + sSec) - ((sMin * 60 + sSec) - (eMin * 60 + eSec)) * progress;
    return Math.floor(current / 60) + ':' + Math.round(current % 60).toString().padStart(2, '0');
  }
}

module.exports = { WorkoutPlanner };
