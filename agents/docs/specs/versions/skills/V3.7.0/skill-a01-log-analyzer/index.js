/**
 * Skill-A01: 日志分析器 (Log Analyzer)
 * 
 * 审计智能体核心分析引擎
 * 解析 OpenClaw 会话日志、提取关键事件、检测违规操作
 * 
 * @version 1.0
 * @date 2026-03-10
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { glob } = require('fs/promises');

// ============================================================================
// 常量定义
// ============================================================================

const EVENT_TYPES = ['toolCall', 'message', 'thinking', 'system'];

const VIOLATION_RULES = {
  V001: {
    id: 'V001',
    name: '无规约写业务代码',
    level: '严重',
    description: '检测到使用 write 工具创建业务代码',
    recommendation: '使用 runtime="acp" + Cursor CLI 开发'
  },
  V002: {
    id: 'V002',
    name: '使用 subagent 执行开发',
    level: '严重',
    description: '检测到使用 runtime="subagent" 执行开发任务',
    recommendation: '使用 runtime="acp" 执行开发任务'
  },
  V003: {
    id: 'V003',
    name: '跳过验收直接交付',
    level: '一般',
    description: '未找到验收报告但有交付行为',
    recommendation: '先执行验收流程，生成交付报告'
  },
  V004: {
    id: 'V004',
    name: '未使用 Cursor CLI',
    level: '一般',
    description: '开发任务未使用 Cursor CLI',
    recommendation: '使用 cursor agent --print 进行开发'
  },
  V005: {
    id: 'V005',
    name: '敏感信息泄露',
    level: '严重',
    description: '检测到敏感信息（API Key/密码/Token）',
    recommendation: '移除敏感信息，使用环境变量或密钥管理'
  }
};

// 业务代码路径特征（使用 write 工具为违规）
const BUSINESS_CODE_PATTERNS = [
  /.*\.js$/,
  /.*\.ts$/,
  /.*\.py$/,
  /.*\/src\/.*/,
  /.*\/lib\/.*/,
  /.*\/app\/.*/
];

// 允许使用 write 工具的路径（白名单）
const ALLOWED_WRITE_PATTERNS = [
  /.*\.md$/,
  /.*\.json$/,
  /.*\/config\/.*/,
  /.*\/docs\/.*/,
  /.*\/test\.js$/,
  /.*\/test\.ts$/,
  /.*\/skills\/.*\/SKILL\.md$/,
  /.*\/package-lock\.json$/,
  /.*\/tsconfig\.json$/,
  /.*\/jest\.config\.js$/
];

// 敏感信息检测模式
const SENSITIVE_PATTERNS = [
  /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/i,
  /password\s*[=:]\s*['"][^'"]+['"]/i,
  /secret\s*[=:]\s*['"][^'"]+['"]/i,
  /token\s*[=:]\s*['"][^'"]+['"]/i,
  /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/,
  /AKIA[0-9A-Z]{16}/,  // AWS Access Key
  /ghp_[A-Za-z0-9]{36}/,  // GitHub Personal Access Token
];

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 展开 glob 路径
 */
async function expandPaths(patterns) {
  const allPaths = [];
  
  for (const pattern of patterns) {
    const expanded = pattern.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '');
    
    if (expanded.includes('*')) {
      try {
        const globber = glob(expanded);
        for await (const file of globber) {
          allPaths.push(file);
        }
      } catch (e) {
        // glob 不支持时使用简单处理
        allPaths.push(expanded);
      }
    } else {
      allPaths.push(expanded);
    }
  }
  
  // 过滤存在的文件
  return allPaths.filter(p => fs.existsSync(p));
}

/**
 * 判断是否为业务代码路径
 */
function isBusinessCodePath(filePath) {
  if (!filePath) return false;
  
  // 检查白名单
  for (const pattern of ALLOWED_WRITE_PATTERNS) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  
  // 检查黑名单
  for (const pattern of BUSINESS_CODE_PATTERNS) {
    if (pattern.test(filePath)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检测敏感信息
 */
function detectSensitiveInfo(content) {
  if (!content || typeof content !== 'string') return [];
  
  const matches = [];
  for (const pattern of SENSITIVE_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      matches.push({
        pattern: pattern.toString(),
        match: match[0],
        position: match.index
      });
    }
  }
  
  return matches;
}

/**
 * 生成事件 ID
 */
function generateEventId(sessionId, index) {
  return `evt-${sessionId.slice(-8)}-${index.toString().padStart(4, '0')}`;
}

/**
 * 解析单行 JSON
 */
function parseLine(line, sessionId, index) {
  try {
    const parsed = JSON.parse(line);
    // OpenClaw JSONL 格式：每行直接是事件数据，包含 type, timestamp, data 等字段
    // 提取工具调用数据时，需要正确处理嵌套结构
    const eventData = parsed.data || parsed;
    return {
      id: generateEventId(sessionId, index),
      type: parsed.type || 'unknown',
      timestamp: parsed.timestamp || Date.now(),
      sessionId: sessionId,
      data: eventData,
      raw: parsed  // 保留原始数据
    };
  } catch (e) {
    return null; // 解析失败，跳过
  }
}

/**
 * 流式解析 JSONL 文件
 */
async function parseJsonlFile(filePath) {
  const events = [];
  const sessionId = path.basename(filePath, '.jsonl');
  
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity
    });
    
    let index = 0;
    
    rl.on('line', (line) => {
      if (line.trim()) {
        const event = parseLine(line, sessionId, index);
        if (event) {
          events.push(event);
        }
        index++;
      }
    });
    
    rl.on('close', () => {
      resolve(events);
    });
    
    rl.on('error', (err) => {
      reject(err);
    });
    
    readStream.on('error', (err) => {
      reject(err);
    });
  });
}

// ============================================================================
// 违规检测
// ============================================================================

/**
 * 检测单个事件的违规
 */
function detectEventViolations(event) {
  const violations = [];
  
  // V001: 无规约写业务代码
  if (event.type === 'toolCall' && event.data.tool === 'write') {
    const filePath = event.data.path || event.data.file_path;
    if (isBusinessCodePath(filePath)) {
      violations.push({
        ruleId: 'V001',
        ...VIOLATION_RULES.V001,
        eventId: event.id,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        evidence: {
          tool: 'write',
          path: filePath,
          contentPreview: (event.data.content || '').slice(0, 100)
        },
        recommendation: VIOLATION_RULES.V001.recommendation
      });
    }
  }
  
  // V002: 使用 subagent 执行开发
  if (event.type === 'toolCall' && event.data.tool === 'sessions_spawn') {
    const runtime = event.data.runtime;
    const task = event.data.task || '';
    
    // 判断是否为开发任务
    const isDevTask = /开发|实现|创建|编写|代码|skill/i.test(task);
    
    if (runtime === 'subagent' && isDevTask) {
      violations.push({
        ruleId: 'V002',
        ...VIOLATION_RULES.V002,
        eventId: event.id,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        evidence: {
          tool: 'sessions_spawn',
          runtime: runtime,
          task: task.slice(0, 200)
        },
        recommendation: VIOLATION_RULES.V002.recommendation
      });
    }
  }
  
  // V005: 敏感信息泄露
  if (event.type === 'toolCall' && event.data.tool === 'write') {
    const content = event.data.content || '';
    const sensitiveMatches = detectSensitiveInfo(content);
    
    if (sensitiveMatches.length > 0) {
      violations.push({
        ruleId: 'V005',
        ...VIOLATION_RULES.V005,
        eventId: event.id,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        evidence: {
          tool: 'write',
          path: event.data.path || event.data.file_path,
          sensitiveMatches: sensitiveMatches
        },
        recommendation: VIOLATION_RULES.V005.recommendation
      });
    }
  }
  
  return violations;
}

/**
 * 检测会话级违规（需要跨事件分析）
 */
function detectSessionViolations(events) {
  const violations = [];
  const sessionId = events[0]?.sessionId || 'unknown';
  
  // 检查是否有开发任务但无验收
  let hasDevTask = false;
  let hasAcceptance = false;
  let hasDelivery = false;
  let hasCursorCli = false;
  
  for (const event of events) {
    if (event.type === 'toolCall') {
      const task = event.data.task || '';
      if (/开发|实现|创建|编写/i.test(task)) {
        hasDevTask = true;
      }
      
      if (event.data.tool === 'cursor') {
        hasCursorCli = true;
      }
      
      // 检查验收相关
      if (event.data.tool === 'feishu_doc' || 
          (event.data.path && /acceptance|验收/i.test(event.data.path))) {
        hasAcceptance = true;
      }
      
      // 检查交付相关
      if (event.data.tool === 'message' || 
          (event.data.path && /delivery|交付/i.test(event.data.path))) {
        hasDelivery = true;
      }
    }
  }
  
  // V003: 跳过验收直接交付
  if (hasDelivery && !hasAcceptance && hasDevTask) {
    violations.push({
      ruleId: 'V003',
      ...VIOLATION_RULES.V003,
      eventId: 'session-' + sessionId,
      timestamp: events[events.length - 1]?.timestamp || Date.now(),
      sessionId: sessionId,
      evidence: {
        hasDevTask: true,
        hasAcceptance: false,
        hasDelivery: true
      },
      recommendation: VIOLATION_RULES.V003.recommendation
    });
  }
  
  // V004: 未使用 Cursor CLI
  if (hasDevTask && !hasCursorCli) {
    violations.push({
      ruleId: 'V004',
      ...VIOLATION_RULES.V004,
      eventId: 'session-' + sessionId,
      timestamp: events[events.length - 1]?.timestamp || Date.now(),
      sessionId: sessionId,
      evidence: {
        hasDevTask: true,
        hasCursorCli: false
      },
      recommendation: VIOLATION_RULES.V004.recommendation
    });
  }
  
  return violations;
}

// ============================================================================
// 统计分析
// ============================================================================

/**
 * 统计事件
 */
function calculateStatistics(events) {
  const byType = {};
  const byTool = {};
  
  for (const event of events) {
    // 按类型统计
    byType[event.type] = (byType[event.type] || 0) + 1;
    
    // 按工具统计
    if (event.type === 'toolCall' && event.data.tool) {
      byTool[event.data.tool] = (byTool[event.data.tool] || 0) + 1;
    }
  }
  
  return { byType, byTool };
}

/**
 * 计算合规评分
 */
function calculateComplianceScore(violations, events) {
  const totalEvents = events.length;
  if (totalEvents === 0) return { score: 100, level: '优秀', breakdown: {} };
  
  // 按违规等级扣分
  let score = 100;
  const breakdown = {
    规约先行: 100,
    开发合规: 100,
    验收合规: 100,
    交付合规: 100
  };
  
  for (const v of violations) {
    if (v.level === '严重') {
      score -= 15;
      if (v.ruleId === 'V001' || v.ruleId === 'V002') {
        breakdown.开发合规 -= 20;
      } else if (v.ruleId === 'V005') {
        breakdown.交付合规 -= 20;
      }
    } else if (v.level === '一般') {
      score -= 5;
      if (v.ruleId === 'V003') {
        breakdown.验收合规 -= 15;
      } else if (v.ruleId === 'V004') {
        breakdown.开发合规 -= 10;
      }
    }
  }
  
  // 确保分数在 0-100 之间
  score = Math.max(0, Math.min(100, score));
  Object.keys(breakdown).forEach(k => {
    breakdown[k] = Math.max(0, Math.min(100, breakdown[k]));
  });
  
  // 确定等级
  let level;
  if (score >= 90) level = '优秀';
  else if (score >= 75) level = '良好';
  else if (score >= 60) level = '待改进';
  else level = '严重';
  
  return { score, level, breakdown };
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 分析会话日志
 * 
 * @param {Object} params - 分析参数
 * @param {string[]} params.sessionPaths - 会话日志路径列表
 * @param {Object} [params.config] - 分析配置
 * @returns {Promise<Object>} 分析结果
 */
async function analyze(params) {
  const { sessionPaths, config = {} } = params;
  const {
    detectViolations = true,
    timeRange,
    eventTypes,
    agentTypes
  } = config;
  
  // 展开路径
  const expandedPaths = await expandPaths(sessionPaths);
  
  if (expandedPaths.length === 0) {
    return {
      meta: {
        analyzedAt: new Date().toISOString(),
        sessionCount: 0,
        eventCount: 0,
        timeRange: null
      },
      statistics: { byType: {}, byTool: {} },
      events: [],
      violations: [],
      compliance: { score: 100, level: '优秀', breakdown: {} }
    };
  }
  
  // 解析所有文件
  const allEvents = [];
  for (const filePath of expandedPaths) {
    try {
      const events = await parseJsonlFile(filePath);
      allEvents.push(...events);
    } catch (e) {
      console.error(`解析文件失败：${filePath}`, e.message);
    }
  }
  
  // 按时间戳排序
  allEvents.sort((a, b) => a.timestamp - b.timestamp);
  
  // 过滤事件类型
  let filteredEvents = allEvents;
  if (eventTypes && eventTypes.length > 0) {
    filteredEvents = allEvents.filter(e => eventTypes.includes(e.type));
  }
  
  // 过滤时间范围
  if (timeRange) {
    filteredEvents = filteredEvents.filter(e => 
      e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
    );
  }
  
  // 计算时间范围
  const actualTimeRange = filteredEvents.length > 0 ? {
    start: filteredEvents[0].timestamp,
    end: filteredEvents[filteredEvents.length - 1].timestamp
  } : null;
  
  // 统计
  const statistics = calculateStatistics(filteredEvents);
  
  // 违规检测
  let violations = [];
  if (detectViolations) {
    // 事件级违规
    for (const event of filteredEvents) {
      const eventViolations = detectEventViolations(event);
      violations.push(...eventViolations);
    }
    
    // 会话级违规（按会话分组）
    const eventsBySession = {};
    for (const event of allEvents) {
      if (!eventsBySession[event.sessionId]) {
        eventsBySession[event.sessionId] = [];
      }
      eventsBySession[event.sessionId].push(event);
    }
    
    for (const sessionId of Object.keys(eventsBySession)) {
      const sessionEvents = eventsBySession[sessionId];
      const sessionViolations = detectSessionViolations(sessionEvents);
      violations.push(...sessionViolations);
    }
  }
  
  // 合规评分
  const compliance = calculateComplianceScore(violations, filteredEvents);
  
  return {
    meta: {
      analyzedAt: new Date().toISOString(),
      sessionCount: expandedPaths.length,
      eventCount: filteredEvents.length,
      timeRange: actualTimeRange
    },
    statistics,
    events: filteredEvents,
    violations,
    compliance
  };
}

/**
 * 仅检测违规
 * 
 * @param {Object} params - 分析参数
 * @returns {Promise<Object>} 违规检测结果
 */
async function detectViolations(params) {
  const result = await analyze({ ...params, config: { detectViolations: true } });
  return {
    meta: result.meta,
    violations: result.violations,
    compliance: result.compliance
  };
}

/**
 * 获取违规规则列表
 */
function getViolationRules() {
  return Object.values(VIOLATION_RULES);
}

/**
 * 判断路径是否为业务代码
 */
function checkPath(filePath) {
  return {
    isBusinessCode: isBusinessCodePath(filePath),
    isAllowed: !isBusinessCodePath(filePath)
  };
}

// ============================================================================
// 导出
// ============================================================================

module.exports = {
  analyze,
  detectViolations,
  getViolationRules,
  checkPath,
  VIOLATION_RULES,
  EVENT_TYPES
};
