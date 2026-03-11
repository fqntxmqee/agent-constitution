/**
 * Skill-A03: 规约验证器 (Specification Validator)
 * 
 * 审计智能体规约完整性验证引擎
 * 检查 OpenSpec 文档集的完整性、格式合规性、用户确认记录
 * 
 * @version 1.0
 * @date 2026-03-10
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 常量定义
// ============================================================================

const REQUIRED_DOCS = [
  'proposal.md',
  'specs/requirements.md',
  'design.md',
  'tasks.md'
];

const OPTIONAL_DOCS = [
  'acceptance/criteria.md',
  'confirmation/intent.md',
  'confirmation/blueprint.md',
  'confirmation/deployment.md',
  'README.md',
  'CHANGELOG.md'
];

// proposal.md 检查项
const PROPOSAL_CHECKS = [
  { name: '项目名称', pattern: /#+\s*.*(?:项目 | 提案|Proposal)/i, required: true },
  { name: '背景描述', pattern: /(?:背景 | 动机|Background|Motivation)/i, required: true },
  { name: '目标定义', pattern: /(?:目标 | 范围|Goal|Objective|Scope)/i, required: true },
  { name: '验收标准', pattern: /(?:验收 |AC\d|Acceptance\s*Criteria)/i, required: true },
  { name: '交付物清单', pattern: /(?:交付 | 交付物|Deliver|交付物清单)/i, required: true },
  { name: '用户确认', pattern: /(?:确认|Confirm|用户确认|审批|Approve)/i, required: false }
];

// specs/requirements.md 检查项
const REQUIREMENTS_CHECKS = [
  { name: '功能需求', pattern: /(?:功能|FR\d|Functional\s*Requirement)/i, required: true },
  { name: '非功能需求', pattern: /(?:非功能|NFR\d|Non-Functional|性能 | 可靠性)/i, required: true },
  { name: '接口定义', pattern: /(?:接口|API|Interface)/i, required: false },
  { name: '数据字典', pattern: /(?:数据|Data|字典|Dictionary|结构)/i, required: false }
];

// design.md 检查项
const DESIGN_CHECKS = [
  { name: '系统架构', pattern: /(?:架构|Architecture|系统 |System)/i, required: true },
  { name: '组件设计', pattern: /(?:组件|Component|模块|Module)/i, required: true },
  { name: '流程设计', pattern: /(?:流程|Flow|Process|步骤)/i, required: true },
  { name: '数据结构', pattern: /(?:数据|Data|结构|Structure|模型|Model)/i, required: false }
];

// tasks.md 检查项
const TASKS_CHECKS = [
  { name: '任务清单', pattern: /(?:任务|Task|步骤|阶段)/i, required: true },
  { name: '任务依赖', pattern: /(?:顺序 | 依赖|先后|Phase|Stage)/i, required: true },
  { name: '验收标准映射', pattern: /(?:AC|验收)/i, required: true },
  { name: '工时估算', pattern: /(?:工时 | 时间|小时|h|预计)/i, required: false }
];

// AC 验证模式
const AC_PATTERN = /AC\d+/gi;
const AC_DEFINITION_PATTERN = /(?:AC\d+|验收标准\s*\d+)[\s\S]{0,200}/gi;

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 读取文件内容
 */
function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

/**
 * 检查文件是否存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 检查 Markdown 内容是否包含特定模式
 */
function checkMarkdownContent(content, pattern) {
  if (!content) return false;
  return pattern.test(content);
}

/**
 * 提取 AC（验收标准）
 */
function extractAcceptanceCriteria(content) {
  if (!content) return [];
  
  const criteria = [];
  const lines = content.split('\n');
  
  let currentAC = null;
  let currentDescription = [];
  
  for (const line of lines) {
    // 检测新的 AC - 支持多种格式：AC1, AC1:, AC1 |, 验收标准 1
    const acMatch = line.match(/(AC\d+|验收标准\s*\d+)/i);
    if (acMatch) {
      // 保存之前的 AC
      if (currentAC) {
        const desc = currentDescription.join(' ').trim();
        criteria.push({
          id: currentAC,
          description: desc,
          valid: desc.length > 0,
          verifiable: /验证 | 检查 | 测试|verify|check|test/i.test(desc)
        });
      }
      
      currentAC = acMatch[1].trim();
      // 提取 AC 后面的描述
      const afterMatch = line.substring(acMatch.index + acMatch[0].length).trim();
      currentDescription = afterMatch ? [afterMatch.replace(/^[:：\|]\s*/, '')] : [];
    } else if (currentAC && line.trim() && !line.startsWith('#')) {
      // 继续收集当前 AC 的描述（跳过标题行）
      currentDescription.push(line.trim());
    }
  }
  
  // 保存最后一个 AC
  if (currentAC) {
    const desc = currentDescription.join(' ').trim();
    criteria.push({
      id: currentAC,
      description: desc,
      valid: desc.length > 0,
      verifiable: /验证 | 检查 | 测试|verify|check|test/i.test(desc)
    });
  }
  
  return criteria;
}

/**
 * 检查用户确认记录
 */
function checkUserConfirmationRecords(specPath, content) {
  const result = {
    intentConfirmed: false,
    blueprintConfirmed: false,
    deploymentConfirmed: false,
    evidence: []
  };
  
  // 检查 proposal.md 中的确认章节
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
  
  // 检查 confirmation 目录
  const confirmationDir = path.join(specPath, 'confirmation');
  if (fs.existsSync(confirmationDir)) {
    const files = fs.readdirSync(confirmationDir);
    
    if (files.some(f => /intent/i.test(f))) {
      result.intentConfirmed = true;
      result.evidence.push({ type: 'intent', source: 'confirmation/intent.md' });
    }
    
    if (files.some(f => /blueprint|design/i.test(f))) {
      result.blueprintConfirmed = true;
      result.evidence.push({ type: 'blueprint', source: 'confirmation/blueprint.md' });
    }
    
    if (files.some(f => /deploy/i.test(f))) {
      result.deploymentConfirmed = true;
      result.evidence.push({ type: 'deployment', source: 'confirmation/deployment.md' });
    }
  }
  
  // 检查设计文档中的确认
  const designPath = path.join(specPath, 'design.md');
  const designContent = readFile(designPath);
  if (designContent && /(?:确认 |Confirm|签署|Sign)/i.test(designContent)) {
    if (!result.blueprintConfirmed) {
      result.blueprintConfirmed = true;
      result.evidence.push({ type: 'blueprint', source: 'design.md' });
    }
  }
  
  return result;
}

/**
 * 计算得分
 */
function calculateScore(issues) {
  let score = 100;
  
  for (const issue of issues) {
    if (issue.level === 'critical') {
      score -= 15;
    } else if (issue.level === 'warning') {
      score -= 5;
    } else if (issue.level === 'info') {
      score -= 1;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 确定等级
 */
function getLevel(score) {
  if (score >= 90) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 60) return '待改进';
  return '严重';
}

// ============================================================================
// 验证函数
// ============================================================================

/**
 * 验证文档完整性
 */
function checkCompleteness(specPath, config = {}) {
  const requiredDocs = config.requiredDocs || REQUIRED_DOCS;
  const optionalDocs = config.optionalDocs || OPTIONAL_DOCS;
  
  const result = {
    required: [],
    optional: [],
    missing: []
  };
  
  // 检查必需文档
  for (const doc of requiredDocs) {
    const docPath = path.join(specPath, doc);
    const exists = fileExists(docPath);
    
    result.required.push({
      name: doc,
      exists,
      path: docPath
    });
    
    if (!exists) {
      result.missing.push(doc);
    }
  }
  
  // 检查可选文档
  for (const doc of optionalDocs) {
    const docPath = path.join(specPath, doc);
    const exists = fileExists(docPath);
    
    result.optional.push({
      name: doc,
      exists,
      path: docPath
    });
  }
  
  return result;
}

/**
 * 验证文档格式
 */
function validateFormat(specPath) {
  const result = {
    proposal: { valid: true, checks: [] },
    requirements: { valid: true, checks: [] },
    design: { valid: true, checks: [] },
    tasks: { valid: true, checks: [] }
  };
  
  // 验证 proposal.md
  const proposalPath = path.join(specPath, 'proposal.md');
  const proposalContent = readFile(proposalPath);
  
  if (proposalContent) {
    for (const check of PROPOSAL_CHECKS) {
      const passed = checkMarkdownContent(proposalContent, check.pattern);
      result.proposal.checks.push({
        name: check.name,
        passed,
        required: check.required
      });
      if (!passed && check.required) {
        result.proposal.valid = false;
      }
    }
  } else {
    result.proposal.valid = false;
    result.proposal.checks = PROPOSAL_CHECKS.map(c => ({
      name: c.name,
      passed: false,
      required: c.required
    }));
  }
  
  // 验证 specs/requirements.md
  const requirementsPath = path.join(specPath, 'specs/requirements.md');
  const requirementsContent = readFile(requirementsPath);
  
  if (requirementsContent) {
    for (const check of REQUIREMENTS_CHECKS) {
      const passed = checkMarkdownContent(requirementsContent, check.pattern);
      result.requirements.checks.push({
        name: check.name,
        passed,
        required: check.required
      });
      if (!passed && check.required) {
        result.requirements.valid = false;
      }
    }
  } else {
    result.requirements.valid = false;
    result.requirements.checks = REQUIREMENTS_CHECKS.map(c => ({
      name: c.name,
      passed: false,
      required: c.required
    }));
  }
  
  // 验证 design.md
  const designPath = path.join(specPath, 'design.md');
  const designContent = readFile(designPath);
  
  if (designContent) {
    for (const check of DESIGN_CHECKS) {
      const passed = checkMarkdownContent(designContent, check.pattern);
      result.design.checks.push({
        name: check.name,
        passed,
        required: check.required
      });
      if (!passed && check.required) {
        result.design.valid = false;
      }
    }
  } else {
    result.design.valid = false;
    result.design.checks = DESIGN_CHECKS.map(c => ({
      name: c.name,
      passed: false,
      required: c.required
    }));
  }
  
  // 验证 tasks.md
  const tasksPath = path.join(specPath, 'tasks.md');
  const tasksContent = readFile(tasksPath);
  
  if (tasksContent) {
    for (const check of TASKS_CHECKS) {
      const passed = checkMarkdownContent(tasksContent, check.pattern);
      result.tasks.checks.push({
        name: check.name,
        passed,
        required: check.required
      });
      if (!passed && check.required) {
        result.tasks.valid = false;
      }
    }
  } else {
    result.tasks.valid = false;
    result.tasks.checks = TASKS_CHECKS.map(c => ({
      name: c.name,
      passed: false,
      required: c.required
    }));
  }
  
  return result;
}

/**
 * 验证 AC（验收标准）
 */
function validateAcceptanceCriteria(specPath) {
  const result = {
    count: 0,
    valid: 0,
    invalid: 0,
    criteria: []
  };
  
  // 从 proposal.md 提取 AC
  const proposalPath = path.join(specPath, 'proposal.md');
  const proposalContent = readFile(proposalPath);
  
  if (proposalContent) {
    const criteria = extractAcceptanceCriteria(proposalContent);
    result.criteria.push(...criteria);
  }
  
  // 从 requirements.md 提取 AC
  const requirementsPath = path.join(specPath, 'specs/requirements.md');
  const requirementsContent = readFile(requirementsPath);
  
  if (requirementsContent) {
    const criteria = extractAcceptanceCriteria(requirementsContent);
    result.criteria.push(...criteria);
  }
  
  // 统计
  result.count = result.criteria.length;
  result.valid = result.criteria.filter(c => c.valid && c.verifiable).length;
  result.invalid = result.count - result.valid;
  
  return result;
}

/**
 * 生成问题清单
 */
function generateIssues(completeness, formatValidation, userConfirmation, acceptanceCriteria, config) {
  const issues = [];
  
  // 完整性问题
  for (const doc of completeness.missing) {
    issues.push({
      level: 'critical',
      category: 'completeness',
      document: doc,
      message: `缺失必需文档：${doc}`,
      suggestion: `创建 ${doc} 文件`
    });
  }
  
  // 格式问题 - proposal
  if (!formatValidation.proposal.valid) {
    for (const check of formatValidation.proposal.checks) {
      if (!check.passed && check.required) {
        issues.push({
          level: 'critical',
          category: 'format',
          document: 'proposal.md',
          message: `proposal.md 缺少${check.name}`,
          suggestion: `在 proposal.md 中添加${check.name}章节`
        });
      }
    }
  }
  
  // 格式问题 - requirements
  if (!formatValidation.requirements.valid) {
    for (const check of formatValidation.requirements.checks) {
      if (!check.passed && check.required) {
        issues.push({
          level: 'warning',
          category: 'format',
          document: 'specs/requirements.md',
          message: `requirements.md 缺少${check.name}`,
          suggestion: `在 requirements.md 中添加${check.name}章节`
        });
      }
    }
  }
  
  // 格式问题 - design
  if (!formatValidation.design.valid) {
    for (const check of formatValidation.design.checks) {
      if (!check.passed && check.required) {
        issues.push({
          level: 'warning',
          category: 'format',
          document: 'design.md',
          message: `design.md 缺少${check.name}`,
          suggestion: `在 design.md 中添加${check.name}章节`
        });
      }
    }
  }
  
  // 格式问题 - tasks
  if (!formatValidation.tasks.valid) {
    for (const check of formatValidation.tasks.checks) {
      if (!check.passed && check.required) {
        issues.push({
          level: 'warning',
          category: 'format',
          document: 'tasks.md',
          message: `tasks.md 缺少${check.name}`,
          suggestion: `在 tasks.md 中添加${check.name}章节`
        });
      }
    }
  }
  
  // 用户确认问题
  if (config.checkUserConfirmation !== false) {
    if (!userConfirmation.intentConfirmed) {
      issues.push({
        level: 'warning',
        category: 'confirmation',
        document: 'proposal.md',
        message: '缺少意图确认记录',
        suggestion: '在 proposal.md 中添加用户确认章节或创建 confirmation/intent.md'
      });
    }
    
    if (!userConfirmation.blueprintConfirmed) {
      issues.push({
        level: 'warning',
        category: 'confirmation',
        document: 'design.md',
        message: '缺少蓝图确认记录',
        suggestion: '在 design.md 中添加确认记录或创建 confirmation/blueprint.md'
      });
    }
  }
  
  // AC 问题
  if (config.checkAcceptanceCriteria !== false) {
    if (acceptanceCriteria.count === 0) {
      issues.push({
        level: 'critical',
        category: 'ac',
        document: 'proposal.md',
        message: '未定义验收标准（AC）',
        suggestion: '在 proposal.md 或 requirements.md 中定义至少 3 个验收标准'
      });
    } else if (acceptanceCriteria.count < 3) {
      issues.push({
        level: 'warning',
        category: 'ac',
        document: 'proposal.md',
        message: `验收标准数量不足（当前${acceptanceCriteria.count}个，建议至少 3 个）`,
        suggestion: '补充更多验收标准'
      });
    }
    
    if (acceptanceCriteria.invalid > 0) {
      issues.push({
        level: 'info',
        category: 'ac',
        document: 'proposal.md',
        message: `${acceptanceCriteria.invalid}个 AC 缺少验证方式说明`,
        suggestion: '为每个 AC 添加验证方式说明'
      });
    }
  }
  
  return issues;
}

/**
 * 生成整改建议
 */
function generateRecommendations(issues) {
  const recommendations = [];
  const seen = new Set();
  
  for (const issue of issues) {
    if (issue.level === 'critical' || issue.level === 'warning') {
      const key = `${issue.category}-${issue.message}`;
      if (!seen.has(key)) {
        recommendations.push(issue.suggestion);
        seen.add(key);
      }
    }
  }
  
  return recommendations;
}

/**
 * 提取项目名称
 */
function extractProjectName(specPath) {
  // 尝试从 proposal.md 提取
  const proposalPath = path.join(specPath, 'proposal.md');
  const content = readFile(proposalPath);
  
  if (content) {
    // 尝试提取标题
    const titleMatch = content.match(/^#\s*(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
  }
  
  // 使用目录名
  const dirName = path.basename(specPath);
  return dirName;
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 验证规约
 * 
 * @param {Object} params - 验证参数
 * @param {string} params.specPath - 规约目录路径
 * @param {Object} [params.config] - 验证配置
 * @returns {Object} 验证报告
 */
function validate(params) {
  const { specPath, config = {} } = params;
  const {
    strict = true,
    requiredDocs = REQUIRED_DOCS,
    checkUserConfirmation = true,
    checkAcceptanceCriteria = true
  } = config;
  
  // 1. 检查完整性
  const completeness = checkCompleteness(specPath, { requiredDocs });
  
  // 2. 验证格式
  const formatValidation = validateFormat(specPath);
  
  // 3. 检查用户确认
  const proposalPath = path.join(specPath, 'proposal.md');
  const proposalContent = readFile(proposalPath);
  const userConfirmation = checkUserConfirmationRecords(specPath, proposalContent);
  
  // 4. 验证 AC
  const acceptanceCriteria = validateAcceptanceCriteria(specPath);
  
  // 5. 生成问题清单
  const issues = generateIssues(completeness, formatValidation, userConfirmation, acceptanceCriteria, config);
  
  // 6. 计算得分
  const score = calculateScore(issues);
  const level = getLevel(score);
  
  // 7. 生成建议
  const recommendations = generateRecommendations(issues);
  
  // 8. 构建报告
  const criticalIssues = issues.filter(i => i.level === 'critical').length;
  const warnings = issues.filter(i => i.level === 'warning').length;
  
  return {
    meta: {
      validatedAt: new Date().toISOString(),
      specPath: specPath,
      projectName: extractProjectName(specPath)
    },
    result: {
      passed: criticalIssues === 0,
      score,
      level,
      criticalIssues,
      warnings
    },
    completeness,
    formatValidation,
    userConfirmation,
    acceptanceCriteria,
    issues,
    recommendations
  };
}

/**
 * 仅检查完整性
 */
function checkCompletenessOnly(params) {
  const { specPath, config = {} } = params;
  return checkCompleteness(specPath, config);
}

/**
 * 获取必需文档列表
 */
function getRequiredDocs() {
  return [...REQUIRED_DOCS];
}

/**
 * 获取可选文档列表
 */
function getOptionalDocs() {
  return [...OPTIONAL_DOCS];
}

// ============================================================================
// 导出
// ============================================================================

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
