/**
 * Skill-02: 需求澄清 - 测试脚本（10 个用例）
 *
 * 运行: node test.js
 * 通过: 总计 10/10，退出码 0
 */

const {
  clarify,
  generateClarificationQuestions,
  eliminateAmbiguity,
  collectContext,
  organizeClarificationResult,
  ERROR_CODES,
} = require('./index.js');

let passed = 0;

const tests = [
  ['T01: clarify 返回成功结构', () => {
    const r = clarify({ userInput: '做一个内容运营平台' });
    if (!r.success || !r.proposal || !Array.isArray(r.clarificationQuestions) || !r.collectedContext || !r.ambiguitySummary) throw new Error('missing fields');
    if (typeof r.proposal.intent !== 'string' || typeof r.proposal.suggestedRoute !== 'string') throw new Error('proposal intent/route');
  }],
  ['T02: 澄清问题生成（来自 ambiguities）', () => {
    const q = generateClarificationQuestions({
      userInput: '做一个后台',
      options: {
        ambiguities: [
          { suggestion: '前端希望用 React 还是 Vue？', domain: 'technical' },
          { suggestion: '计划部署到哪里？' },
        ],
      },
    });
    if (!Array.isArray(q) || q.length < 2) throw new Error('expected at least 2 questions');
  }],
  ['T03: 澄清问题生成（规则）', () => {
    const q = generateClarificationQuestions({ userInput: '做一个内容运营平台，先做核心功能' });
    if (!Array.isArray(q) || q.length === 0) throw new Error('vague input should yield questions');
  }],
  ['T04: 模糊性消除（外部 ambiguities）', () => {
    const r = eliminateAmbiguity('做一个后台', [
      { type: 'missing', severity: 'high', domain: 'technical', suggestion: '明确技术栈' },
      { type: 'ambiguous', severity: 'medium', domain: 'business', suggestion: '明确 MVP 范围' },
    ]);
    if (r.isClear !== false || r.ambiguities.length !== 2) throw new Error('isClear false and 2 ambiguities');
    if (!r.domains.includes('technical') || !r.domains.includes('business')) throw new Error('domains');
  }],
  ['T05: 模糊性消除（轻量检测）', () => {
    const r = eliminateAmbiguity('做一个内容运营平台');
    if (typeof r.isClear !== 'boolean' || !Array.isArray(r.ambiguities) || !Array.isArray(r.domains)) throw new Error('structure');
  }],
  ['T06: 上下文收集结构', () => {
    const r = collectContext(
      { userInput: '做一个后台', options: { contextSources: ['filesystem'] } },
      __dirname
    );
    if (!r.sources || !Array.isArray(r.snippets) || !r.sources.includes('filesystem')) throw new Error('context structure');
  }],
  ['T07: 澄清结果整理', () => {
    const p = organizeClarificationResult({
      userInput: '用 React 做管理后台，部署到 Vercel',
      options: { intent: 'development', suggestedRoute: 'standard' },
      clarificationQuestions: ['后端用 Node 还是其他？'],
      ambiguitySummary: { isClear: false, count: 1, domains: ['technical'] },
    });
    if (p.intent !== 'development' || p.openQuestions.length !== 1 || !p.summary || !p.complexity) throw new Error('proposal structure');
  }],
  ['T08: 非法输入抛错', () => {
    try {
      clarify(null);
      throw new Error('should throw');
    } catch (e) {
      if (e.code !== ERROR_CODES.CLARIFICATION_INVALID_INPUT) throw e;
    }
    try {
      clarify({ userInput: 123 });
      throw new Error('should throw');
    } catch (e) {
      if (e.code !== ERROR_CODES.CLARIFICATION_INVALID_INPUT) throw e;
    }
  }],
  ['T09: 非开发类输入', () => {
    const r = clarify({ userInput: '查一下北京天气' });
    if (!r.success || typeof r.ambiguitySummary.isClear !== 'boolean') throw new Error('non-dev input');
  }],
  ['T10: 带 options 完整调用', () => {
    const r = clarify({
      userInput: '先做核心功能，技术栈你定',
      options: {
        intent: 'development',
        suggestedRoute: 'standard',
        contextSources: ['filesystem'],
        ambiguities: [
          { type: 'ambiguous', severity: 'medium', domain: 'business', suggestion: '首期 MVP 需要包含哪些功能？' },
        ],
      },
    });
    if (!r.success || r.proposal.intent !== 'development') throw new Error('options.intent');
    if (!r.clarificationQuestions.some((q) => q.includes('MVP') || q.includes('功能'))) throw new Error('questions from ambiguities');
  }],
];

for (const [name, fn] of tests) {
  try {
    fn();
    console.log('[PASS]', name);
    passed++;
  } catch (e) {
    console.log('[FAIL]', name, e.message);
  }
}

console.log('\n总计：' + passed + '/10');
process.exit(passed === 10 ? 0 : 1);
