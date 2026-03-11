/**
 * 消息集成模块 - 飞书消息发送
 */

class MessagingService {
  constructor(config = {}) {
    this.config = {
      channel: config.channel || 'feishu',
      ...config
    };
  }

  /**
   * 发送飞书消息（使用 OpenClaw message 工具）
   */
  async sendFeishuMessage(content, options = {}) {
    const message = {
      action: 'send',
      channel: this.config.channel,
      message: content,
      ...options
    };

    // 调用 OpenClaw message 工具
    // 实际使用时通过 OpenClaw runtime 调用
    console.log('[MessagingService] 发送飞书消息:', content);
    
    return {
      success: true,
      messageId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 发送训练提醒
   */
  async sendWorkoutReminder(workout) {
    const content = `💪 **训练提醒**

**今日训练**: ${workout.focus}
**时间**: 今晚 19:00
**预计时长**: 60 分钟

**主要动作**:
${workout.exercises?.slice(0, 3).map(e => `• ${e.name} ${e.sets}x${e.reps}`).join('\n') || '查看完整计划'}

准备好了吗？开始吧！🔥`;

    return this.sendFeishuMessage(content, {
      type: 'interactive',
      category: 'workout-reminder'
    });
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

    return this.sendFeishuMessage(content, {
      type: 'interactive',
      category: 'weekly-report'
    });
  }

  /**
   * 发送进度更新
   */
  async sendProgressUpdate(progress) {
    const content = `📈 **进度更新**

${progress.message}

**当前数据**:
${Object.entries(progress.data).map(([k, v]) => `• ${k}: ${v}`).join('\n')}

继续加油！💪`;

    return this.sendFeishuMessage(content, {
      type: 'interactive',
      category: 'progress-update'
    });
  }
}

module.exports = { MessagingService };
