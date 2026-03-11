/**
 * Skill-02: 需求澄清 (Requirement Clarification)
 *
 * 纯 JavaScript (Node.js 18+)，无外部依赖。
 * 功能：需求澄清问题生成、模糊性消除、上下文收集、澄清结果整理。
 *
 * 输入：{ userInput, context?, options? }
 * 输出：{ success, proposal, clarificationQuestions, collectedContext, ambiguitySummary }
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 错误码与常量
// ---------------------------------------------------------------------------

const ERROR_CODES = {
  CLARIFICATION_INVALID_INPUT: 'CLARIFICATION_INVALID_INPUT',
  CLARIFICATION_CONTEXT_ERROR: 'CLARIFICATION_CONTEXT_ERROR',
};

const DEFAULT_CONTEXT_SOURCES = ['filesystem', 'spec_path'];
const INTENTS = ['development', 'content', 'skill', 'operation'];
const ROUTES = ['standard', 'fast'];
const COMPLEXITY_LEVELS = ['high', 'medium', 'low'];

// 轻量模糊性检测：关键词与对应澄清问题模板
const AMBIGUITY_RULES = [
  {
    pattern: /做|开发|建|搭建|实现|写一个|做一个/i,
    exclude: /写一篇|写博客|查|查询|天气|翻译/i,
    field: 'tech_stack',
    question: '前端希望用 React 还是 Vue？后端语言有偏好吗？',
    domain: 'technical',
  },
  {
    pattern: /做|开发|建|搭建/i,
    exclude: /部署|deploy|k8s|docker|vercel|serverless|内网|云/i,
    field: 'deployment',
    question: '计划部署到云服务器、容器（如 Docker/K8s）还是 Serverless？',
    domain: 'technical',
  },
  {
    pattern: /做|开发|建|后台|平台|系统/i,
    exclude: /数据|database|api|接口|自建|第三方|mysql|postgres/i,
    field: 'data_source',
    question: '数据来自自建库还是第三方 API？如需对接外部 API，是否有文档或鉴权方式？',
    domain: 'technical',
  },
  {
    pattern: /先做核心|核心功能|主要功能|先上/i,
    exclude: /首期|一期|mvp|包含.*功能|清单/i,
    field: 'priority',
    question: '首期 MVP 需要包含哪些功能？哪些可以后续迭代？',
    domain: 'business',
  },
  {
    pattern: /纯前端|只做前端|仅前端/i,
    and: /后端|api|接口|写接口|服务端/i,
    field: 'tech_stack',
    question: '需要纯前端还是需要配套后端服务？',
    domain: 'technical',
  },
];

// ---------------------------------------------------------------------------
// 需求澄清问题生成 (Generate Clarification Questions)
// ---------------------------------------------------------------------------

/**
 * 根据用户输入与可选模糊项列表生成澄清问题
 * @param {object} input - { userInput, options?: { ambiguities?: array } }
 * @returns {string[]} 澄清问题列表
 */
function generateClarificationQuestions(input) {
  const userInput = (input && input.userInput) ? String(input.userInput).trim() : '';
  const ambiguities = (input && input.options && input.options.ambiguities) || [];
  const questions = [];
  const seen = new Set();

  if (ambiguities.length > 0) {
    for (const a of ambiguities) {
      const q = (a.suggestion || a.description || '').trim();
      if (q && !seen.has(q)) {
        seen.add(q);
        questions.push(q);
      }
    }
  }

  if (questions.length > 0) {
    return questions;
  }

  // 无 ambiguities 时使用轻量规则生成
  const text = userInput.toLowerCase();
  for (const rule of AMBIGUITY_RULES) {
    const match = rule.pattern.test(text) && (!rule.exclude || !rule.exclude.test(text));
    const andMatch = !rule.and || rule.and.test(text);
    if (match && andMatch && !seen.has(rule.question)) {
      seen.add(rule.question);
      questions.push(rule.question);
    }
  }

  return questions;
}

// ---------------------------------------------------------------------------
// 模糊性消除 (Ambiguity Elimination)
// ---------------------------------------------------------------------------

/**
 * 轻量模糊性检测，返回与 Skill-03 兼容的摘要结构
 * @param {string} userInput
 * @param {array} externalAmbiguities - 可选，来自 Skill-03 的 ambiguities
 * @returns {object} { isClear, ambiguities, domains }
 */
function eliminateAmbiguity(userInput, externalAmbiguities) {
  if (Array.isArray(externalAmbiguities) && externalAmbiguities.length > 0) {
    const domains = [...new Set(externalAmbiguities.map((a) => a.domain).filter(Boolean))];
    const hasBlocking = externalAmbiguities.some(
      (a) => a.severity === 'high' || a.severity === 'medium'
    );
    return {
      isClear: !hasBlocking,
      ambiguities: externalAmbiguities,
      domains: domains.length ? domains : ['business'],
    };
  }

  const text = (userInput || '').trim().toLowerCase();
  const ambiguities = [];
  const domainSet = new Set();

  for (const rule of AMBIGUITY_RULES) {
    const match = rule.pattern.test(text) && (!rule.exclude || !rule.exclude.test(text));
    const andMatch = !rule.and || rule.and.test(text);
    if (match && andMatch) {
      ambiguities.push({
        type: 'missing',
        description: `未明确：${rule.field}`,
        severity: 'medium',
        suggestion: rule.question,
        domain: rule.domain,
        field: rule.field,
      });
      domainSet.add(rule.domain);
    }
  }

  const isClear = ambiguities.length === 0;
  return {
    isClear,
    ambiguities,
    domains: [...domainSet],
  };
}

// ---------------------------------------------------------------------------
// 上下文收集 (Context Collection)
// ---------------------------------------------------------------------------

/**
 * 根据 sources 收集上下文
 * @param {object} input - { userInput, options?: { contextSources?, specPath? } }
 * @param {string} baseDir - 可选，项目根目录
 * @returns {object} { sources, snippets, specPath }
 */
function collectContext(input, baseDir) {
  const sources = (input && input.options && input.options.contextSources) || DEFAULT_CONTEXT_SOURCES;
  const specPath = (input && input.options && input.options.specPath) || null;
  const query = (input && input.userInput) ? String(input.userInput).trim() : '';
  const result = { sources: [], snippets: [], specPath: null };

  if (sources.includes('spec_path') && specPath) {
    result.sources.push('spec_path');
    result.specPath = specPath;
    try {
      const fullPath = baseDir ? path.resolve(baseDir, specPath) : path.resolve(specPath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        const proposalPath = path.join(fullPath, 'proposal.md');
        if (fs.existsSync(proposalPath)) {
          const content = fs.readFileSync(proposalPath, 'utf8');
          result.snippets.push({ source: 'spec_path', path: proposalPath, snippet: content.slice(0, 500) });
        }
      }
    } catch (err) {
      result.snippets.push({ source: 'spec_path', path: specPath, snippet: '', error: err.message });
    }
  }

  if (sources.includes('filesystem') && query) {
    result.sources.push('filesystem');
    try {
      const readmePath = baseDir ? path.join(baseDir, 'README.md') : 'README.md';
      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf8');
        result.snippets.push({ source: 'filesystem', path: readmePath, snippet: content.slice(0, 400) });
      }
    } catch (err) {
      result.snippets.push({ source: 'filesystem', path: 'README.md', snippet: '', error: err.message });
    }
  }

  if (result.sources.length === 0 && sources.length > 0) {
    result.sources = sources;
  }

  return result;
}

// ---------------------------------------------------------------------------
// 澄清结果整理 (Organize Clarification Result)
// ---------------------------------------------------------------------------

/**
 * 将澄清相关数据整理为《澄清提案》结构
 * @param {object} input - { userInput, context?, options?, clarificationQuestions?, ambiguitySummary?, collectedContext? }
 * @returns {object} proposal 结构
 */
function organizeClarificationResult(input) {
  const options = (input && input.options) || {};
  const intent = options.intent || 'development';
  const suggestedRoute = options.suggestedRoute || 'standard';
  const userInput = (input && input.userInput) ? String(input.userInput).trim() : '';
  const clarificationQuestions = input.clarificationQuestions || [];
  const ambiguitySummary = input.ambiguitySummary || { isClear: true, count: 0, domains: [] };

  const complexity = userInput.length > 200 ? 'high' : userInput.length > 50 ? 'medium' : 'low';
  const summary = userInput.slice(0, 200) + (userInput.length > 200 ? '...' : '');

  return {
    intent: INTENTS.includes(intent) ? intent : 'development',
    suggestedRoute: ROUTES.includes(suggestedRoute) ? suggestedRoute : 'standard',
    complexity: COMPLEXITY_LEVELS.includes(complexity) ? complexity : 'medium',
    summary,
    confirmedItems: [],
    openQuestions: clarificationQuestions,
  };
}

// ---------------------------------------------------------------------------
// 主入口：clarify
// ---------------------------------------------------------------------------

/**
 * 需求澄清主入口：上下文收集 + 模糊性消除 + 问题生成 + 澄清结果整理
 * @param {object} input - { userInput, context?, options? }
 * @param {object} env - 可选 { baseDir } 用于解析相对路径
 * @returns {object} { success, proposal, clarificationQuestions, collectedContext, ambiguitySummary }
 */
function clarify(input, env) {
  const err = _validateInput(input);
  if (err) throw err;

  const userInput = (input.userInput || '').trim();
  const options = input.options || {};
  const baseDir = (env && env.baseDir) || process.cwd();

  const ambiguityResult = eliminateAmbiguity(userInput, options.ambiguities);
  const clarificationQuestions = generateClarificationQuestions({
    userInput,
    options: { ambiguities: ambiguityResult.ambiguities },
  });
  const collectedContext = collectContext(
    { userInput, options: { contextSources: options.contextSources, specPath: options.specPath } },
    baseDir
  );
  const proposal = organizeClarificationResult({
    userInput,
    options: { intent: options.intent, suggestedRoute: options.suggestedRoute },
    clarificationQuestions,
    ambiguitySummary: {
      isClear: ambiguityResult.isClear,
      count: ambiguityResult.ambiguities.length,
      domains: ambiguityResult.domains,
    },
  });

  return {
    success: true,
    proposal,
    clarificationQuestions,
    collectedContext,
    ambiguitySummary: {
      isClear: ambiguityResult.isClear,
      count: ambiguityResult.ambiguities.length,
      domains: ambiguityResult.domains,
    },
  };
}

function _validateInput(input) {
  if (input == null || typeof input !== 'object') {
    const e = new Error('input must be a non-null object');
    e.code = ERROR_CODES.CLARIFICATION_INVALID_INPUT;
    return e;
  }
  if (typeof input.userInput !== 'string') {
    const e = new Error('userInput must be a string');
    e.code = ERROR_CODES.CLARIFICATION_INVALID_INPUT;
    return e;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

module.exports = {
  clarify,
  generateClarificationQuestions,
  eliminateAmbiguity,
  collectContext,
  organizeClarificationResult,
  ERROR_CODES,
  DEFAULT_CONTEXT_SOURCES,
};

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const userInput = args.join(' ').trim();
  if (!userInput) {
    console.log('用法: node index.js <用户请求>');
    console.log('示例: node index.js "做一个内容运营平台"');
    process.exit(0);
  }
  try {
    const result = clarify({ userInput });
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('错误:', e.code || 'ERROR', e.message);
    process.exit(1);
  }
}
