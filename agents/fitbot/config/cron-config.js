/**
 * 定时任务配置 - FitBot cron 配置
 */

module.exports = {
  // 每日训练提醒（18:00）
  dailyReminder: {
    name: 'fitbot-daily-reminder',
    schedule: {
      kind: 'cron',
      expr: '0 18 * * *',  // 每天 18:00
      tz: 'Asia/Shanghai'
    },
    payload: {
      kind: 'systemEvent',
      text: 'fitbot:send-daily-reminder'
    },
    sessionTarget: 'main',
    enabled: true
  },

  // 每周日报送（周日 20:00）
  weeklyReport: {
    name: 'fitbot-weekly-report',
    schedule: {
      kind: 'cron',
      expr: '0 20 * * 0',  // 每周日 20:00
      tz: 'Asia/Shanghai'
    },
    payload: {
      kind: 'systemEvent',
      text: 'fitbot:send-weekly-report'
    },
    sessionTarget: 'main',
    enabled: true
  },

  // 晨间问候（可选，8:00）
  morningGreeting: {
    name: 'fitbot-morning-greeting',
    schedule: {
      kind: 'cron',
      expr: '0 8 * * *',  // 每天 8:00
      tz: 'Asia/Shanghai'
    },
    payload: {
      kind: 'systemEvent',
      text: 'fitbot:send-morning-greeting'
    },
    sessionTarget: 'main',
    enabled: false  // 默认关闭
  }
};
