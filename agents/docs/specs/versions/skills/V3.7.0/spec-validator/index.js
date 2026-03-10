/**
 * Skill-A03: 规约验证器 (Specification Validator)
 * 验证 OpenSpec 文档集的完整性、格式合规性、用户确认记录
 * @version 1.0
 * @date 2026-03-10
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_DOCS = ['proposal.md', 'specs/requirements.md', 'design.md', 'tasks.md'];
const OPTIONAL_DOCS = ['acceptance/criteria.md', 'confirmation/intent.md', 'confirmation/blueprint.md', 'confirmation/deployment.md', 'README.md'];

const PROPOSAL_CHECKS = [
  { name: '项目名称', pattern: /#+\s*.*(?:项目 | 提案|Proposal)/i, required: true },
  { name: '背景描述', pattern: /(?:背景 | 动机|Background|Motivation)/i, required: true },
  { name: '目标定义', pattern: /(?:目标 | 范围|Goal|Objective|Scope)/i, required: true },
  { name: '验收标准', pattern: /(?:验收 |AC\d|Acceptance\s*Criteria)/i, required: true },
  { name: '交付物清单', pattern: /(?:交付 | 交付物|Deliver)/i, required: true },
  { name: '用户确认', pattern: /(?:确认|Confirm|用户确认)/i, required: false }
];

const REQUIREMENTS_CHECKS = [
  { name: '功能需求', pattern: /(?:功能|FR\d|Functional)/i, required: true },
  { name: '非功能需求', pattern: /(?:非功能|NFR\d|Non-Functional|性能)/i, required: true }
];

const DESIGN_CHECKS = [
  { name: '系统架构', pattern: /(?:架构|Architecture|系统)/i, required: true },
  { name: '组件设计', pattern: /(?:组件|Component|模块)/i, required: true },
  { name: '流程设计', pattern: /(?:流程|Flow|Process)/i, required: true }
];

const TASKS_CHECKS = [
  { name: '任务清单', pattern: /(?:任务|Task|步骤)/i, required: true },
  { name: '任务依赖', pattern: /(?:顺序 | 依赖|Phase)/i, required: true },
  { name: '验收标准映射', pattern: /(?:AC|验收)/i, required: true }
];

const AC_PATTERN = /AC\d+/gi;

function readFile(filePath) {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  } catch (e) { return null; }
}

function fileExists(filePath) { return fs.existsSync(filePath); }

function checkMarkdownContent(content, pattern) {
  return content ? pattern.test(content) : false;
}

function extractAcceptanceCriteria(content) {
  if (!content) return [];
  const criteria = [], lines = content.split('\n');
  let currentAC = null, currentDescription = [];
  
  for (const line of lines) {
    const acMatch = line.match(/(AC\d+|验收标准\s*\d+)/i);
    if (acMatch) {
      if (currentAC) {
        const desc = currentDescription.join(' ').trim();
        criteria.push({ id: currentAC, description: desc, valid: desc.length > 0, verifiable: /验证 | 检查 | 测试|verify|check|test/i.test(desc) });
      }
      currentAC = acMatch[1].trim();
      const afterMatch = line.substring(acMatch.index + acMatch[0].length).trim();
      currentDescription = afterMatch ? [afterMatch.replace(/^[:：\|]\s*/, '')] : [];
    } else if (currentAC && line.trim() && !line.startsWith('#')) {
      currentDescription.push(line.trim());
    }
  }
  
  if (currentAC) {
    const desc = currentDescription.join(' ').trim();
    criteria.push({ id: currentAC, description: desc, valid: desc.length > 0, verifiable: /验证 | 检查 | 测试|verify|check|test/i.test(desc) });
  }
  return criteria;
}

function checkUserConfirmationRecords(specPath, content) {
  const result = { intentConfirmed: false, blueprintConfirmed: false, deploymentConfirmed: false, evidence: [] };
  
  if (content) {
    if (/(?:意图确认 | 用户确认|Confirm.*Intent|Approve)/i.test(content)) {
      result.intentConfirmed = true;
      result.evidence.push({ type: 'intent', source: 'proposal.md' });
    }
    if (/(?:蓝图确认 | 方案确认|Confirm.*Design|蓝图.*确认)/i.test(content)) {
      result.blueprintConfirmed = true;
      result.evidence.push({ type: 'blueprint', source: 'proposal.md' });
    }
    if (/(?:部署确认 | 上线确认|Confirm.*Deploy)/i.test(content)) {
      result.deploymentConfirmed = true;
      result.evidence.push({ type: 'deployment', source: 'proposal.md' });
    }
  }
  
  const confirmationDir = path.join(specPath, 'confirmation');
  if (fs.existsSync(confirmationDir)) {
    const files = fs.readdirSync(confirmationDir);
    if (files.some(f => /intent/i.test(f))) { result.intentConfirmed = true; result.evidence.push({ type: 'intent', source: 'confirmation/intent.md' }); }
    if (files.some(f => /blueprint|design/i.test(f))) { result.blueprintConfirmed = true; result.evidence.push({ type: 'blueprint', source: 'confirmation/blueprint.md' }); }
    if (files.some(f => /deploy/i.test(f))) { result.deploymentConfirmed = true; result.evidence.push({ type: 'deployment', source: 'confirmation/deployment.md' }); }
  }
  
  const designContent = readFile(path.join(specPath, 'design.md'));
  if (designContent && /(?:确认 |Confirm|签署|Sign)/i.test(designContent) && !result.blueprintConfirmed) {
    result.blueprintConfirmed = true;
    result.evidence.push({ type: 'blueprint', source: 'design.md' });
  }
  
  return result;
}

function calculateScore(issues) {
  let score = 100;
  for (const issue of issues) {
    score -= issue.level === 'critical' ? 15 : issue.level === 'warning' ? 5 : 1;
  }
  return Math.max(0, Math.min(100, score));
}

function getLevel(score) {
  if (score >= 90) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 60) return '待改进';
  return '严重';
}

function checkCompleteness(specPath, config = {}) {
  const requiredDocs = config.requiredDocs || REQUIRED_DOCS;
  const result = { required: [], optional: [], missing: [] };
  
  for (const doc of requiredDocs) {
    const docPath = path.join(specPath, doc);
    const exists = fileExists(docPath);
    result.required.push({ name: doc, exists, path: docPath });
    if (!exists) result.missing.push(doc);
  }
  
  for (const doc of OPTIONAL_DOCS) {
    const docPath = path.join(specPath, doc);
    result.optional.push({ name: doc, exists: fileExists(docPath), path: docPath });
  }
  
  return result;
}

function validateFormat(specPath) {
  const result = {
    proposal: { valid: true, checks: [] },
    requirements: { valid: true, checks: [] },
    design: { valid: true, checks: [] },
    tasks: { valid: true, checks: [] }
  };
  
  const proposalContent = readFile(path.join(specPath, 'proposal.md'));
  if (proposalContent) {
    for (const check of PROPOSAL_CHECKS) {
      const passed = checkMarkdownContent(proposalContent, check.pattern);
      result.proposal.checks.push({ name: check.name, passed, required: check.required });
      if (!passed && check.required) result.proposal.valid = false;
    }
  } else {
    result.proposal.valid = false;
    result.proposal.checks = PROPOSAL_CHECKS.map(c => ({ name: c.name, passed: false, required: c.required }));
  }
  
  const requirementsContent = readFile(path.join(specPath, 'specs/requirements.md'));
  if (requirementsContent) {
    for (const check of REQUIREMENTS_CHECKS) {
      const passed = checkMarkdownContent(requirementsContent, check.pattern);
      result.requirements.checks.push({ name: check.name, passed, required: check.required });
      if (!passed && check.required) result.requirements.valid = false;
    }
  } else {
    result.requirements.valid = false;
    result.requirements.checks = REQUIREMENTS_CHECKS.map(c => ({ name: c.name, passed: false, required: c.required }));
  }
  
  const designContent = readFile(path.join(specPath, 'design.md'));
  if (designContent) {
    for (const check of DESIGN_CHECKS) {
      const passed = checkMarkdownContent(designContent, check.pattern);
      result.design.checks.push({ name: check.name, passed, required: check.required });
      if (!passed && check.required) result.design.valid = false;
    }
  } else {
    result.design.valid = false;
    result.design.checks = DESIGN_CHECKS.map(c => ({ name: c.name, passed: false, required: c.required }));
  }
  
  const tasksContent = readFile(path.join(specPath, 'tasks.md'));
  if (tasksContent) {
    for (const check of TASKS_CHECKS) {
      const passed = checkMarkdownContent(tasksContent, check.pattern);
      result.tasks.checks.push({ name: check.name, passed, required: check.required });
      if (!passed && check.required) result.tasks.valid = false;
    }
  } else {
    result.tasks.valid = false;
    result.tasks.checks = TASKS_CHECKS.map(c => ({ name: c.name, passed: false, required: c.required }));
  }
  
  return result;
}

function validateAcceptanceCriteria(specPath) {
  const result = { count: 0, valid: 0, invalid: 0, criteria: [] };
  
  const proposalContent = readFile(path.join(specPath, 'proposal.md'));
  if (proposalContent) result.criteria.push(...extractAcceptanceCriteria(proposalContent));
  
  const requirementsContent = readFile(path.join(specPath, 'specs/requirements.md'));
  if (requirementsContent) result.criteria.push(...extractAcceptanceCriteria(requirementsContent));
  
  result.count = result.criteria.length;
  result.valid = result.criteria.filter(c => c.valid && c.verifiable).length;
  result.invalid = result.count - result.valid;
  
  return result;
}

function generateIssues(completeness, formatValidation, userConfirmation, acceptanceCriteria, config) {
  const issues = [];
  
  for (const doc of completeness.missing) {
    issues.push({ level: 'critical', category: 'completeness', document: doc, message: `缺失必需文档：${doc}`, suggestion: `创建 ${doc} 文件` });
  }
  
  if (!formatValidation.proposal.valid) {
    for (const check of formatValidation.proposal.checks) {
      if (!check.passed && check.required) {
        issues.push({ level: 'critical', category: 'format', document: 'proposal.md', message: `proposal.md 缺少${check.name}`, suggestion: `在 proposal.md 中添加${check.name}章节` });
      }
    }
  }
  
  if (!formatValidation.requirements.valid) {
    for (const check of formatValidation.requirements.checks) {
      if (!check.passed && check.required) {
        issues.push({ level: 'warning', category: 'format', document: 'specs/requirements.md', message: `requirements.md 缺少${check.name}`, suggestion: `在 requirements.md 中添加${check.name}章节` });
      }
    }
  }
  
  if (!formatValidation.design.valid) {
    for (const check of formatValidation.design.checks) {
      if (!check.passed && check.required) {
        issues.push({ level: 'warning', category: 'format', document: 'design.md', message: `design.md 缺少${check.name}`, suggestion: `在 design.md 中添加${check.name}章节` });
      }
    }
  }
  
  if (!formatValidation.tasks.valid) {
    for (const check of formatValidation.tasks.checks) {
      if (!check.passed && check.required) {
        issues.push({ level: 'warning', category: 'format', document: 'tasks.md', message: `tasks.md 缺少${check.name}`, suggestion: `在 tasks.md 中添加${check.name}章节` });
      }
    }
  }
  
  if (config.checkUserConfirmation !== false) {
    if (!userConfirmation.intentConfirmed) {
      issues.push({ level: 'warning', category: 'confirmation', document: 'proposal.md', message: '缺少意图确认记录', suggestion: '在 proposal.md 中添加用户确认章节或创建 confirmation/intent.md' });
    }
    if (!userConfirmation.blueprintConfirmed) {
      issues.push({ level: 'warning', category: 'confirmation', document: 'design.md', message: '缺少蓝图确认记录', suggestion: '在 design.md 中添加确认记录或创建 confirmation/blueprint.md' });
    }
  }
  
  if (config.checkAcceptanceCriteria !== false) {
    if (acceptanceCriteria.count === 0) {
      issues.push({ level: 'critical', category: 'ac', document: 'proposal.md', message: '未定义验收标准（AC）', suggestion: '在 proposal.md 或 requirements.md 中定义至少 3 个验收标准' });
    } else if (acceptanceCriteria.count < 3) {
      issues.push({ level: 'warning', category: 'ac', document: 'proposal.md', message: `验收标准数量不足（当前${acceptanceCriteria.count}个，建议至少 3 个）`, suggestion: '补充更多验收标准' });
    }
    if (acceptanceCriteria.invalid > 0) {
      issues.push({ level: 'info', category: 'ac', document: 'proposal.md', message: `${acceptanceCriteria.invalid}个 AC 缺少验证方式说明`, suggestion: '为每个 AC 添加验证方式说明' });
    }
  }
  
  return issues;
}

function generateRecommendations(issues) {
  const recommendations = [];
  const seen = new Set();
  for (const issue of issues) {
    if ((issue.level === 'critical' || issue.level === 'warning') && issue.suggestion && !seen.has(issue.suggestion)) {
      recommendations.push(issue.suggestion);
      seen.add(issue.suggestion);
    }
  }
  return recommendations;
}

function extractProjectName(specPath) {
  const proposalPath = path.join(specPath, 'proposal.md');
  const content = readFile(proposalPath);
  if (content) {
    const titleMatch = content.match(/^#\s*(.+)$/m);
    if (titleMatch) return titleMatch[1].trim();
  }
  return path.basename(specPath);
}

async function validate(params) {
  const { specPath, config = {} } = params;
  const { checkUserConfirmation = true, checkAcceptanceCriteria = true } = config;
  
  const completeness = checkCompleteness(specPath);
  const formatValidation = validateFormat(specPath);
  
  const proposalContent = readFile(path.join(specPath, 'proposal.md'));
  const userConfirmation = checkUserConfirmationRecords(specPath, proposalContent);
  
  const acceptanceCriteria = validateAcceptanceCriteria(specPath);
  
  const issues = generateIssues(completeness, formatValidation, userConfirmation, acceptanceCriteria, config);
  const score = calculateScore(issues);
  const level = getLevel(score);
  const recommendations = generateRecommendations(issues);
  
  const criticalIssues = issues.filter(i => i.level === 'critical').length;
  const warnings = issues.filter(i => i.level === 'warning').length;
  
  return {
    meta: { validatedAt: new Date().toISOString(), specPath, projectName: extractProjectName(specPath) },
    result: { passed: criticalIssues === 0, score, level, criticalIssues, warnings },
    completeness, formatValidation, userConfirmation, acceptanceCriteria, issues, recommendations
  };
}

function checkCompletenessOnly(params) {
  const { specPath, config = {} } = params;
  return checkCompleteness(specPath, config);
}

function getRequiredDocs() { return [...REQUIRED_DOCS]; }
function getOptionalDocs() { return [...OPTIONAL_DOCS]; }

module.exports = {
  validate,
  checkCompleteness: checkCompletenessOnly,
  validateFormat,
  validateAcceptanceCriteria,
  checkUserConfirmation: checkUserConfirmationRecords,
  getRequiredDocs,
  getOptionalDocs,
  REQUIRED_DOCS,
  OPTIONAL_DOCS
};
