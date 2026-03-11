/**
 * 飞书机器人集成 - FitBot 独立机器人
 */

class FeishuBot {
  constructor(config = {}) {
    this.config = {
      webhookUrl: config.webhookUrl || '',
      appId: config.appId || '',
      appSecret: config.appSecret || '',
      ...config
    };
  }

  /**
   * 发送消息
   */
  async sendMessage(content) {
    const message = {
      msg_type: 'interactive',
      card: {
        header: {
          title: { tag: 'plain_text', content: '🏋️ FitBot 健身教练' },
          template: 'blue'
        },
        elements: [
          {
            tag: 'div',
            text: { tag: 'lark_md', content: content }
          }
        ]
      }
    };
    
    // 模拟发送（实际需调用飞书 API）
    console.log('[FeishuBot] 发送消息:', content);
    return { success: true, messageId: Date.now().toString() };
  }

  /**
   * 发送训练提醒
   */
  async sendWorkoutReminder(workout) {
    const content = `💪 **训练提醒**

**今日训练**: ${workout.focus}
**时间**: 今晚 19:00
**预计时长**: 60 分钟

准备好了吗？开始吧！🔥`;
    
    return this.sendMessage(content);
  }

  /**
   * 发送周报
   */
  async sendWeeklyReport(report) {
    const content = `📊 **本周训练总结**

**训练总次数**: ${report.summary.totalWorkouts}
- 力量训练：${report.summary.strengthSessions} 次
- 跑步训练：${report.summary.runningSessions} 次
- 骑车训练：${report.summary.cyclingSessions} 次

**亮点**:
${report.highlights.map(h => `• ${h}`).join('\n')}

**建议**:
${report.suggestions.map(s => `• ${s}`).join('\n')}

继续保持！💪`;
    
    return this.sendMessage(content);
  }

  /**
   * 接收消息（webhook 回调）
   */
  async onMessage(callback) {
    // 实际需设置 webhook 接收
    console.log('[FeishuBot] 消息回调已注册');
    return { success: true };
  }
}

module.exports = { FeishuBot };
