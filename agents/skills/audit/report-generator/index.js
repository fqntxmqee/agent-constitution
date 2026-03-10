/**
 * Skill-A04: 审计报告生成器 (Audit Report Generator)
 * 汇总日志分析、合规检查、规约验证结果，生成标准化审计报告
 * @version 1.0
 * @date 2026-03-10
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_TEMPLATE = `# 🔍 审计报告

**项目名称**: {projectName}  
**审计时间**: {auditPeriod}  
**报告生成时间**: {generatedAt}  
**审计智能体**: Audit Agent (V3.7)

---

## 📊 审计结论

| 项目 | 结果 |
|------|------|
| 综合得分 | **{score}/100** |
| 审计等级 | {level} |
| 审计状态 | {status} |

{summary}

---

## 📈 审计概览

### 维度评分

| 维度 | 得分 | 等级 | 权重 |
|------|------|------|------|
| 规约完整性 | {specScore} | {specLevel} | 25% |
| 开发合规 | {devScore} | {devLevel} | 30% |
| 验收合规 | {accScore} | {accLevel} | 25% |
| 交付合规 | {delScore} | {delLevel} | 20% |

### 问题统计

| 等级 | 数量 |
|------|------|
| 🔴 严重 | {criticalCount} |
| 🟡 一般 | {majorCount} |
| 🟢 轻微 | {minorCount} |

---

## 🚨 违规清单

{violationsSection}

---

## 💡 整改建议

{recommendationsSection}

---

## 📋 详细分析

### 日志分析
{logAnalysisSection}

### 合规检查
{complianceCheckSection}

### 规约验证
{specValidationSection}

---

## 📎 附录

### 审计方法
1. **日志分析**: 解析 OpenClaw 会话日志，检测违规操作
2. **合规检查**: 验证 runtime、工具使用、任务顺序、用户确认
3. **规约验证**: 检查 OpenSpec 文档完整性与格式合规性

### 参考文档
- 宪法规范 V3.7 第二章 §7（审计智能体）
- 宪法规范 V3.7 第三章 3.6（审计智能体 vs. 所有智能体）

---

*本报告由审计智能体自动生成*  
*报告 ID: {reportId}*
`;

const VIOLATION_LEVELS = { '严重': 'critical', '一般': 'major', '轻微': 'minor' };
const SCORE_LEVELS = { 优秀: { min: 90 }, 良好: { min: 75 }, 待改进: { min: 60 }, 严重: { min: 0 } };

function generateReportId() {
  return `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

function formatAuditPeriod(period) {
  if (!period) return '未指定';
  const start = typeof period.start === 'string' ? period.start : new Date(period.start).toISOString().split('T')[0];
  const end = typeof period.end === 'string' ? period.end : new Date(period.end).toISOString().split('T')[0];
  return `${start} ~ ${end}`;
}

function getLevelByScore(score) {
  for (const [level, range] of Object.entries(SCORE_LEVELS)) {
    if (score >= range.min) return level;
  }
  return '严重';
}

function getAuditStatus(passed, score) {
  if (passed) return '✅ 通过';
  if (score >= 60) return '⚠️ 待整改';
  return '❌ 不通过';
}

function mergeViolations(analysis) {
  const violations = { critical: [], major: [], minor: [] };
  
  if (analysis.logAnalysis?.violations) {
    for (const v of analysis.logAnalysis.violations) {
      const level = VIOLATION_LEVELS[v.level] || 'minor';
      violations[level].push({ source: '日志分析', ...v });
    }
  }
  
  if (analysis.complianceCheck?.violations) {
    for (const v of analysis.complianceCheck.violations) {
      const level = VIOLATION_LEVELS[v.level] || 'minor';
      violations[level].push({ source: '合规检查', ...v });
    }
  }
  
  if (analysis.specValidation?.issues) {
    for (const issue of analysis.specValidation.issues) {
      const level = ['critical', 'major', 'minor'].includes(issue.level) ? issue.level : (VIOLATION_LEVELS[issue.level] || 'minor');
      violations[level].push({ source: '规约验证', ruleId: issue.category?.toUpperCase() || 'SPEC', name: issue.message, level: issue.level, description: issue.message, document: issue.document, suggestion: issue.suggestion });
    }
  }
  
  return violations;
}

function generateRecommendations(violations, analysis) {
  const recommendations = [];
  const seen = new Set();
  
  for (const level of ['critical', 'major', 'minor']) {
    for (const v of violations[level]) {
      if (v.suggestion && !seen.has(v.suggestion)) {
        recommendations.push({
          priority: level === 'critical' ? 'high' : level === 'major' ? 'medium' : 'low',
          category: v.source,
          description: v.suggestion,
          deadline: getDeadline(level)
        });
        seen.add(v.suggestion);
      }
    }
  }
  
  if (analysis.specValidation?.recommendations) {
    for (const rec of analysis.specValidation.recommendations) {
      if (!seen.has(rec)) {
        recommendations.push({ priority: 'medium', category: '规约验证', description: rec, deadline: getDeadline('major') });
        seen.add(rec);
      }
    }
  }
  
  recommendations.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
  return recommendations;
}

function getDeadline(level) {
  const now = new Date();
  now.setDate(now.getDate() + (level === 'critical' ? 1 : level === 'major' ? 3 : 7));
  return now.toISOString().split('T')[0];
}

function calculateDimensionScores(analysis) {
  const scores = {
    specIntegrity: { score: 100, level: '优秀', weight: 0.25 },
    developmentCompliance: { score: 100, level: '优秀', weight: 0.30 },
    acceptanceCompliance: { score: 100, level: '优秀', weight: 0.25 },
    deliveryCompliance: { score: 100, level: '优秀', weight: 0.20 }
  };
  
  if (analysis.specValidation?.result) {
    scores.specIntegrity.score = analysis.specValidation.result.score;
    scores.specIntegrity.level = analysis.specValidation.result.level;
  }
  
  const devViolations = (analysis.logAnalysis?.violations || []).filter(v => ['R001', 'R002', 'V001', 'V002', 'V004'].includes(v.ruleId));
  const devScore = Math.max(0, 100 - devViolations.length * 20);
  scores.developmentCompliance.score = devScore;
  scores.developmentCompliance.level = getLevelByScore(devScore);
  
  if (analysis.complianceCheck?.acceptanceCheck) {
    scores.acceptanceCompliance.score = analysis.complianceCheck.acceptanceCheck.passed ? 100 : 50;
    scores.acceptanceCompliance.level = getLevelByScore(scores.acceptanceCompliance.score);
  }
  
  const deliveryViolations = (analysis.logAnalysis?.violations || []).filter(v => ['R003', 'V003', 'V005'].includes(v.ruleId));
  const delScore = Math.max(0, 100 - deliveryViolations.length * 25);
  scores.deliveryCompliance.score = delScore;
  scores.deliveryCompliance.level = getLevelByScore(delScore);
  
  return scores;
}

function calculateOverallScore(dimensions) {
  let totalScore = 0, totalWeight = 0;
  for (const dim of Object.values(dimensions)) {
    totalScore += dim.score * dim.weight;
    totalWeight += dim.weight;
  }
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

function renderViolationsSection(violations) {
  const sections = [];
  
  if (violations.critical.length > 0) {
    let section = '### 🔴 严重违规\n\n';
    violations.critical.forEach((v, i) => {
      section += `${i + 1}. **[${v.ruleId}] ${v.name}**\n`;
      section += `   - 来源：${v.source}\n`;
      if (v.sessionId) section += `   - 会话：${v.sessionId}\n`;
      if (v.document) section += `   - 文档：${v.document}\n`;
      section += `   - 说明：${v.description}\n`;
      section += `   - 建议：${v.suggestion}\n\n`;
    });
    sections.push(section);
  } else {
    sections.push('### 🔴 严重违规\n\n✅ 无严重违规\n\n');
  }
  
  if (violations.major.length > 0) {
    let section = '### 🟡 一般违规\n\n';
    violations.major.forEach((v, i) => {
      section += `${i + 1}. **[${v.ruleId}] ${v.name}**\n`;
      section += `   - 来源：${v.source}\n`;
      section += `   - 说明：${v.description}\n`;
      section += `   - 建议：${v.suggestion}\n\n`;
    });
    sections.push(section);
  } else {
    sections.push('### 🟡 一般违规\n\n✅ 无一般违规\n\n');
  }
  
  if (violations.minor.length > 0) {
    let section = '### 🟢 轻微违规\n\n';
    violations.minor.forEach((v, i) => {
      section += `${i + 1}. **[${v.ruleId}] ${v.name}**\n`;
      section += `   - 来源：${v.source}\n`;
      section += `   - 说明：${v.description}\n\n`;
    });
    sections.push(section);
  } else {
    sections.push('### 🟢 轻微违规\n\n✅ 无轻微违规\n\n');
  }
  
  return sections.join('');
}

function renderRecommendationsSection(recommendations) {
  if (recommendations.length === 0) return '✅ 无需整改，所有检查项均通过。\n';
  
  let section = '';
  const byPriority = { high: [], medium: [], low: [] };
  recommendations.forEach(r => byPriority[r.priority].push(r));
  
  let index = 1;
  if (byPriority.high.length > 0) {
    section += '#### 🔴 高优先级\n\n';
    byPriority.high.forEach(r => {
      section += `${index++}. ${r.description}\n   - 类别：${r.category}\n   - 期限：${r.deadline}\n\n`;
    });
  }
  if (byPriority.medium.length > 0) {
    section += '#### 🟡 中优先级\n\n';
    byPriority.medium.forEach(r => {
      section += `${index++}. ${r.description}\n   - 类别：${r.category}\n   - 期限：${r.deadline}\n\n`;
    });
  }
  if (byPriority.low.length > 0) {
    section += '#### 🟢 低优先级\n\n';
    byPriority.low.forEach(r => {
      section += `${index++}. ${r.description}\n   - 类别：${r.category}\n   - 期限：${r.deadline}\n\n`;
    });
  }
  return section;
}

function renderDetailsSection(analysis) {
  const sections = {};
  
  sections.logAnalysis = '```\n';
  if (analysis.logAnalysis?.meta) {
    sections.logAnalysis += `会话数量：${analysis.logAnalysis.meta.sessionCount || 0}\n`;
    sections.logAnalysis += `事件数量：${analysis.logAnalysis.meta.eventCount || 0}\n`;
  }
  if (analysis.logAnalysis?.compliance) {
    sections.logAnalysis += `合规得分：${analysis.logAnalysis.compliance.score || 100}/100\n`;
  }
  sections.logAnalysis += '```\n';
  
  sections.complianceCheck = '```\n';
  if (analysis.complianceCheck) {
    sections.complianceCheck += `Runtime 检查：${analysis.complianceCheck.runtimeCheck?.passed ? '通过' : '不通过'}\n`;
    sections.complianceCheck += `工具使用检查：${analysis.complianceCheck.toolUsageCheck?.passed ? '通过' : '不通过'}\n`;
    sections.complianceCheck += `验收检查：${analysis.complianceCheck.acceptanceCheck?.passed ? '通过' : '不通过'}\n`;
  }
  sections.complianceCheck += '```\n';
  
  sections.specValidation = '```\n';
  if (analysis.specValidation?.result) {
    sections.specValidation += `验证状态：${analysis.specValidation.result.passed ? '通过' : '不通过'}\n`;
    sections.specValidation += `得分：${analysis.specValidation.result.score}/100\n`;
    sections.specValidation += `等级：${analysis.specValidation.result.level}\n`;
  }
  if (analysis.specValidation?.completeness) {
    const missing = analysis.specValidation.completeness.missing || [];
    sections.specValidation += `缺失文档：${missing.length > 0 ? missing.join(', ') : '无'}\n`;
  }
  sections.specValidation += '```\n';
  
  return sections;
}

function generateSummary(conclusion, violations, recommendations) {
  const parts = [];
  if (conclusion.passed) {
    parts.push('✅ 本次审计通过，所有检查项符合 V3.7 宪法规范要求。');
  } else {
    parts.push(`❌ 本次审计未通过，发现 ${violations.critical.length + violations.major.length} 个需要整改的问题。`);
  }
  if (violations.critical.length > 0) {
    parts.push(`\n🔴 严重违规 ${violations.critical.length} 项，必须立即整改。`);
  }
  if (recommendations.length > 0) {
    const highPriority = recommendations.filter(r => r.priority === 'high').length;
    if (highPriority > 0) {
      parts.push(`\n⚠️ 高优先级整改建议 ${highPriority} 项，请在 24 小时内完成。`);
    }
  }
  return parts.join('');
}

async function generate(params) {
  const { projectName, auditPeriod, analysis = {}, config = {} } = params;
  const { format = 'markdown', outputPath, syncFeishu = false } = config;
  
  const violations = mergeViolations(analysis);
  const recommendations = generateRecommendations(violations, analysis);
  const dimensions = calculateDimensionScores(analysis);
  const overallScore = calculateOverallScore(dimensions);
  const overallLevel = getLevelByScore(overallScore);
  const passed = violations.critical.length === 0 && overallScore >= 60;
  
  const reportId = generateReportId();
  const generatedAt = new Date().toISOString();
  
  const reportData = {
    meta: { reportId, generatedAt, projectName, auditPeriod: formatAuditPeriod(auditPeriod), version: '1.0' },
    conclusion: { passed, score: overallScore, level: overallLevel, summary: generateSummary({ passed, score: overallScore }, violations, recommendations), status: getAuditStatus(passed, overallScore) },
    dimensions, violations, recommendations,
    details: { logAnalysis: analysis.logAnalysis || {}, complianceCheck: analysis.complianceCheck || {}, specValidation: analysis.specValidation || {} }
  };
  
  const details = renderDetailsSection(analysis);
  let reportContent = DEFAULT_TEMPLATE
    .replace('{projectName}', projectName)
    .replace('{auditPeriod}', formatAuditPeriod(auditPeriod))
    .replace('{generatedAt}', generatedAt)
    .replace('{reportId}', reportId)
    .replace('{score}', overallScore.toString())
    .replace('{level}', overallLevel)
    .replace('{status}', getAuditStatus(passed, overallScore))
    .replace('{summary}', reportData.conclusion.summary)
    .replace('{specScore}', dimensions.specIntegrity.score.toString())
    .replace('{specLevel}', dimensions.specIntegrity.level)
    .replace('{devScore}', dimensions.developmentCompliance.score.toString())
    .replace('{devLevel}', dimensions.developmentCompliance.level)
    .replace('{accScore}', dimensions.acceptanceCompliance.score.toString())
    .replace('{accLevel}', dimensions.acceptanceCompliance.level)
    .replace('{delScore}', dimensions.deliveryCompliance.score.toString())
    .replace('{delLevel}', dimensions.deliveryCompliance.level)
    .replace('{criticalCount}', violations.critical.length.toString())
    .replace('{majorCount}', violations.major.length.toString())
    .replace('{minorCount}', violations.minor.length.toString())
    .replace('{violationsSection}', renderViolationsSection(violations))
    .replace('{recommendationsSection}', renderRecommendationsSection(recommendations))
    .replace('{logAnalysisSection}', details.logAnalysis)
    .replace('{complianceCheckSection}', details.complianceCheck)
    .replace('{specValidationSection}', details.specValidation);
  
  const output = { markdownPath: null, jsonPath: null, feishuDocId: null };
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const mdPath = outputPath.endsWith('.md') ? outputPath : outputPath + '.md';
    fs.writeFileSync(mdPath, reportContent, 'utf8');
    output.markdownPath = mdPath;
    const jsonPath = outputPath.replace(/\.md$/, '') + '.json';
    fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2), 'utf8');
    output.jsonPath = jsonPath;
  }
  
  reportData.output = output;
  return reportData;
}

function generateFromTemplate(templateContent, data) {
  let content = templateContent;
  for (const [key, value] of Object.entries(data)) {
    content = content.split(`{${key}}`).join(typeof value === 'object' ? JSON.stringify(value) : String(value));
  }
  return content;
}

function saveReport(report, outputPath, format = 'markdown') {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (format === 'markdown' || format === 'md') {
    const mdPath = outputPath.endsWith('.md') ? outputPath : outputPath + '.md';
    const content = report.content || report.markdown || '';
    fs.writeFileSync(mdPath, content, 'utf8');
    return mdPath;
  } else if (format === 'json') {
    const jsonPath = outputPath.endsWith('.json') ? outputPath : outputPath + '.json';
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    return jsonPath;
  }
  return null;
}

function getDefaultTemplate() { return DEFAULT_TEMPLATE; }

module.exports = {
  generate, generateFromTemplate, saveReport, getDefaultTemplate,
  mergeViolations, generateRecommendations, calculateDimensionScores, calculateOverallScore, getLevelByScore,
  VIOLATION_LEVELS, SCORE_LEVELS
};
