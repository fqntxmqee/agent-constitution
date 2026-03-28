/**
 * Skill-A02: 合规检查器 (Compliance Checker)
 * 
 * 审计智能体合规检查引擎
 * 检查 runtime 配置、工具使用、任务执行顺序、用户确认节点
 * 
 * @version 1.0
 * @date 2026-03-10
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================================================
// 常量定义
// ============================================================================

const DEFAULT_RULES = [
  { id: 'R001', name: 'Runtime 配置错误', description: '开发任务必须使用 runtime="acp"', level: '严重', suggestion: '使用 runtime="acp" 执行开发任务' },
  { id: 'R002', name: '违规使用 write 工具', description: '禁止使用 write 工具创建业务代码', level: '严重', suggestion: '使用 sessions_spawn（ACP 或 subagent）由子会话进行代码开发' },
  { id: 'R003', name: '任务顺序错误', description: '任务未按 tasks.md 定义顺序执行', level: '一般', suggestion: '按 tasks.md 定义的任务顺序执行' },
  { id: 'R004', name: '缺失意图确认', description: '未找到用户意图确认记录', level: '一般', suggestion: '在 proposal.md 中添加用户确认章节' },
  { id: 'R005', name: '缺失蓝图确认', description: '未找到用户蓝图确认记录', level: '一般', suggestion: '在 design.md 中添加确认记录' },
  { id: 'R006', name: '缺失部署确认', description: '未找到用户部署确认记录', level: '轻微', suggestion: '添加部署确认记录' }
];

const ALLOWED_WRITE_PATTERNS = [
  /\.md$/, /.*\/config\/.*/, /.*\/docs\/.*/, /.*\/test\.js$/,
  /.*\/skills\/.*\/SKILL\.md$/, /.*\.json$/, /.*\/package-lock\.json$/,
  /.*\/tsconfig\.json$/, /.*\/jest\.config\.js$/
];

const BUSINESS_CODE_PATTERNS = [
  /.*\/src\/.*\.(js|ts|py)$/, /.*\/lib\/.*\.(js|ts|py)$/,
  /.*\/app\/.*\.(js|ts|py)$/, /.*\.py$/
];

// ============================================================================
// 工具函数
// ============================================================================

function readFile(filePath) {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  } catch (e) { return null; }
}

function isBusinessCodePath(filePath) {
  if (!filePath) return false;
  for (const p of ALLOWED_WRITE_PATTERNS) { if (p.test(filePath)) return false; }
  for (const p of BUSINESS_CODE_PATTERNS) { if (p.test(filePath)) return true; }
  return false;
}

async function parseJsonlFile(filePath) {
  const events = [];
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: fs.createReadStream(filePath, { encoding: 'utf8' }), crlfDelay: Infinity });
    rl.on('line', (line) => { if (line.trim()) { try { events.push(JSON.parse(line)); } catch (e) {} } });
    rl.on('close', () => resolve(events));
    rl.on('error', reject);
  });
}

async function expandPaths(patterns) {
  const allPaths = [];
  for (const pattern of patterns) {
    const expanded = pattern.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '');
    if (expanded.includes('*')) {
      try {
        const { glob } = require('fs/promises');
        for await (const file of glob(expanded)) { allPaths.push(file); }
      } catch (e) { if (fs.existsSync(expanded)) allPaths.push(expanded); }
    } else { if (fs.existsSync(expanded)) allPaths.push(expanded); }
  }
  return allPaths;
}

function parseTaskOrder(tasksPath) {
  const content = readFile(tasksPath);
  if (!content) return [];
  const tasks = [], lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/(?:###\s*)?(Task-\d+)/i);
    if (match) tasks.push(match[1]);
  }
  return tasks;
}

function extractTaskExecutionOrder(events) {
  const tasks = [], taskPattern = /Task-\d+/gi;
  for (const event of events) {
    for (const field of ['task', 'label', 'message']) {
      if (event[field] && typeof event[field] === 'string') {
        const match = event[field].match(taskPattern);
        if (match) tasks.push(match[0]);
      }
    }
  }
  return [...new Set(tasks)];
}

function calculateScore(violations) {
  let score = 100;
  for (const v of violations) {
    score -= v.level === '严重' ? 20 : v.level === '一般' ? 10 : 5;
  }
  return Math.max(0, Math.min(100, score));
}

function getLevel(score) {
  if (score >= 90) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 60) return '待改进';
  return '严重';
}

function getDeadline(level) {
  const now = new Date();
  now.setDate(now.getDate() + (level === '严重' ? 1 : level === '一般' ? 3 : 7));
  return now.toISOString().split('T')[0];
}

// ============================================================================
// 检查函数
// ============================================================================

function checkRuntime(events, rules) {
  const violations = [], evidence = [];
  const rule = rules.find(r => r.id === 'R001') || DEFAULT_RULES[0];
  
  for (const event of events) {
    if (event.tool === 'sessions_spawn') {
      const isDevTask = /开发|实现|创建|编写|代码|skill/i.test(event.task || '');
      if (event.runtime === 'subagent' && isDevTask) {
        violations.push({
          ruleId: 'R001', name: rule.name, level: rule.level, description: rule.description,
          evidence: { tool: 'sessions_spawn', runtime: event.runtime, task: (event.task || '').slice(0, 200) },
          timestamp: event.timestamp || Date.now(), sessionId: event.sessionId || 'unknown', suggestion: rule.suggestion
        });
      }
      evidence.push({ tool: 'sessions_spawn', runtime: event.runtime, passed: event.runtime === 'acp' || !isDevTask });
    }
  }
  return { passed: violations.length === 0, violations, evidence };
}

function checkToolUsage(events, rules) {
  const violations = [], evidence = [];
  const rule = rules.find(r => r.id === 'R002') || DEFAULT_RULES[1];
  
  for (const event of events) {
    if (event.tool === 'write') {
      const filePath = event.path || event.file_path;
      if (isBusinessCodePath(filePath)) {
        violations.push({
          ruleId: 'R002', name: rule.name, level: rule.level, description: rule.description,
          evidence: { tool: 'write', path: filePath, contentPreview: (event.content || '').slice(0, 100) },
          timestamp: event.timestamp || Date.now(), sessionId: event.sessionId || 'unknown', suggestion: rule.suggestion
        });
      }
      evidence.push({ tool: 'write', path: filePath, isBusinessCode: isBusinessCodePath(filePath), passed: !isBusinessCodePath(filePath) });
    }
  }
  return { passed: violations.length === 0, violations, evidence };
}

function checkTaskOrder(specPath, events, rules) {
  const violations = [];
  const tasksPath = path.join(specPath, 'tasks.md');
  const rule = rules.find(r => r.id === 'R003') || DEFAULT_RULES[2];
  const expectedOrder = parseTaskOrder(tasksPath);
  const actualOrder = extractTaskExecutionOrder(events);
  
  if (expectedOrder.length > 0 && actualOrder.length > 0) {
    const expectedIndex = {};
    expectedOrder.forEach((task, index) => { expectedIndex[task] = index; });
    let lastIndex = -1;
    for (const task of actualOrder) {
      if (expectedIndex[task] !== undefined && expectedIndex[task] < lastIndex) {
        violations.push({
          ruleId: 'R003', name: rule.name, level: rule.level, description: rule.description,
          evidence: { expected: expectedOrder, actual: actualOrder, errorTask: task },
          timestamp: Date.now(), sessionId: 'task-order-check', suggestion: rule.suggestion
        });
        break;
      }
      if (expectedIndex[task] !== undefined) lastIndex = expectedIndex[task];
    }
  }
  return { passed: violations.length === 0, expected: expectedOrder, actual: actualOrder, violations };
}

function checkUserConfirmation(specPath, events, rules) {
  const violations = [];
  const result = { passed: true, intentConfirmed: false, blueprintConfirmed: false, deploymentConfirmed: false, violations: [] };
  const rulesMap = { R004: rules.find(r => r.id === 'R004') || DEFAULT_RULES[3], R005: rules.find(r => r.id === 'R005') || DEFAULT_RULES[4], R006: rules.find(r => r.id === 'R006') || DEFAULT_RULES[5] };
  
  const proposalContent = readFile(path.join(specPath, 'proposal.md'));
  if (proposalContent) {
    if (/(?:意图确认 | 用户确认|Confirm.*Intent|Approve)/i.test(proposalContent)) result.intentConfirmed = true;
    if (/(?:蓝图确认 | 方案确认|Confirm.*Design|蓝图.*确认)/i.test(proposalContent)) result.blueprintConfirmed = true;
    if (/(?:部署确认 | 上线确认|Confirm.*Deploy)/i.test(proposalContent)) result.deploymentConfirmed = true;
  }
  
  const confirmationDir = path.join(specPath, 'confirmation');
  if (fs.existsSync(confirmationDir)) {
    const files = fs.readdirSync(confirmationDir);
    if (files.some(f => /intent/i.test(f))) result.intentConfirmed = true;
    if (files.some(f => /blueprint|design/i.test(f))) result.blueprintConfirmed = true;
    if (files.some(f => /deploy/i.test(f))) result.deploymentConfirmed = true;
  }
  
  const designContent = readFile(path.join(specPath, 'design.md'));
  if (designContent && /(?:确认 |Confirm|签署|Sign)/i.test(designContent) && !result.blueprintConfirmed) {
    result.blueprintConfirmed = true;
  }
  
  if (!result.intentConfirmed) {
    result.violations.push({ ruleId: 'R004', name: rulesMap.R004.name, level: rulesMap.R004.level, description: rulesMap.R004.description, evidence: { checked: ['proposal.md', 'confirmation/'] }, timestamp: Date.now(), sessionId: 'user-confirmation-check', suggestion: rulesMap.R004.suggestion });
    result.passed = false;
  }
  if (!result.blueprintConfirmed) {
    result.violations.push({ ruleId: 'R005', name: rulesMap.R005.name, level: rulesMap.R005.level, description: rulesMap.R005.description, evidence: { checked: ['proposal.md', 'design.md', 'confirmation/'] }, timestamp: Date.now(), sessionId: 'user-confirmation-check', suggestion: rulesMap.R005.suggestion });
    result.passed = false;
  }
  if (!result.deploymentConfirmed) {
    result.violations.push({ ruleId: 'R006', name: rulesMap.R006.name, level: rulesMap.R006.level, description: rulesMap.R006.description, evidence: { checked: ['proposal.md', 'confirmation/'] }, timestamp: Date.now(), sessionId: 'user-confirmation-check', suggestion: rulesMap.R006.suggestion });
  }
  return result;
}

// ============================================================================
// 主函数
// ============================================================================

async function check(params) {
  const { target, config = {} } = params;
  const { sessionLogs = [], specPath } = target;
  const { customRules = [], doCheckRuntime = true, doCheckToolUsage = true, doCheckTaskOrder = true, doCheckUserConfirmation = true } = config;
  
  const rules = [...DEFAULT_RULES, ...customRules];
  const allEvents = [];
  const expandedPaths = await expandPaths(sessionLogs);
  
  for (const logPath of expandedPaths) {
    try { const events = await parseJsonlFile(logPath); allEvents.push(...events); } catch (e) {}
  }
  
  const checks = {}, allViolations = [];
  if (doCheckRuntime) { checks.runtime = checkRuntime(allEvents, rules); allViolations.push(...checks.runtime.violations); }
  if (doCheckToolUsage) { checks.toolUsage = checkToolUsage(allEvents, rules); allViolations.push(...checks.toolUsage.violations); }
  if (doCheckTaskOrder && specPath) { checks.taskOrder = checkTaskOrder(specPath, allEvents, rules); allViolations.push(...checks.taskOrder.violations); }
  if (doCheckUserConfirmation && specPath) { checks.userConfirmation = checkUserConfirmation(specPath, allEvents, rules); allViolations.push(...checks.userConfirmation.violations); }
  
  const score = calculateScore(allViolations), level = getLevel(score);
  const recommendations = [];
  const seen = new Set();
  for (const v of allViolations) {
    if (v.suggestion && !seen.has(v.suggestion)) {
      recommendations.push({ priority: v.level === '严重' ? 'high' : v.level === '一般' ? 'medium' : 'low', category: v.ruleId, description: v.suggestion, deadline: getDeadline(v.level) });
      seen.add(v.suggestion);
    }
  }
  recommendations.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
  
  return {
    meta: { checkedAt: new Date().toISOString(), target: { sessionLogs: expandedPaths, specPath }, rulesApplied: rules.length },
    result: { passed: allViolations.filter(v => v.level === '严重').length === 0, score, level },
    checks, violations: allViolations, recommendations
  };
}

module.exports = {
  check, checkRuntime, checkToolUsage, checkTaskOrder, checkUserConfirmation,
  getDefaultRules: () => [...DEFAULT_RULES], checkPath: (filePath) => ({ isBusinessCode: isBusinessCodePath(filePath), isAllowed: !isBusinessCodePath(filePath) }),
  DEFAULT_RULES, ALLOWED_WRITE_PATTERNS, BUSINESS_CODE_PATTERNS
};
