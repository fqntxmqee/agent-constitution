/**
 * Skill-03: 跨域模糊性探测器 (Ambiguity Detector)
 *
 * 纯 JavaScript (Node.js 18+)，无外部依赖。
 * 响应时间 <500ms。导出 detector 单例。
 *
 * 输入：{ userInput, context?, options? }
 * 输出：{ isClear, ambiguities, clarificationQuestions, confidence, domains }
 */

// ---------------------------------------------------------------------------
// 错误码与常量
// ---------------------------------------------------------------------------

const ERROR_CODES = {
  AMBIGUITY_INVALID_INPUT: 'AMBIGUITY_INVALID_INPUT',
  AMBIGUITY_DETECTION_FAILED: 'AMBIGUITY_DETECTION_FAILED',
  AMBIGUITY_VALIDATION_ERROR: 'AMBIGUITY_VALIDATION_ERROR',
};

const AMBIGUITY_TYPES = ['missing', 'ambiguous', 'conflicting', 'incomplete'];
const SEVERITIES = ['high', 'medium', 'low'];
const DOMAINS = ['technical', 'business', 'user_experience'];
const FIELDS = [
  'tech_stack',
  'deployment',
  'data_source',
  'user_role',
  'priority',
  'acceptance',
  'timeline',      // V3.7.4 新增
  'resources',     // V3.7.4 新增
];

const FIELD_TO_DOMAIN = {
  tech_stack: 'technical',
  deployment: 'technical',
  data_source: 'technical',
  user_role: 'business',
  priority: 'business',
  acceptance: 'business',
  timeline: 'business',      // V3.7.4 新增
  resources: 'business',     // V3.7.4 新增
};

// ---------------------------------------------------------------------------
// AmbiguityScanner - 模糊性扫描器（4 种类型）
// ---------------------------------------------------------------------------

class AmbiguityScanner {
  constructor(options = {}) {
    this.scope = options.scope || FIELDS;
    this.depth = options.detectionDepth || 'standard';
  }

  /**
   * 扫描 userInput，返回原始模糊项列表（含 type, field, severity, description, suggestion）
   */
  scan(userInput, context = {}) {
    const text = (userInput || '').trim().toLowerCase();
    const ambiguities = [];

    if (!text) return ambiguities;

    const checks = [
      () => this._checkMissing(text, context),
      () => this._checkAmbiguous(text, context),
      () => this._checkConflicting(text, context),
      () => this._checkIncomplete(text, context),
    ];

    for (const fn of checks) {
      const items = fn.call(this);
      for (const item of items) {
        if (this.scope.length === 0 || this.scope.includes(item.field)) {
          ambiguities.push(item);
        }
      }
    }

    return ambiguities;
  }

  _checkMissing(text, context) {
    const out = [];
    const hasTech = /react|vue|angular|next\.?js|node|python|go|java|mysql|postgres|mongodb|docker|k8s|kubernetes|vercel|serverless|flutter|taro|uni-?app/i.test(text);
    const hasDeploy = /部署|deploy|k8s|kubernetes|docker|vercel|serverless|内网|云|服务器/i.test(text);
    const hasData = /数据|database|api|接口|自建|第三方|mysql|postgres|sqlite/i.test(text);
    const hasRole = /角色|管理员|用户|权限|admin|reader|writer/i.test(text);
    const hasPriority = /首期|mvp|一期|二期|优先级|先做|核心功能|必须/i.test(text);
    const hasAcceptance = /验收|完成|算完成|成功指标|测试/i.test(text);

    const isDevRequest = /做|开发|建|搞|写一个|做一个|搭建|实现/i.test(text) &&
      !/写一篇|写博客|查|查询|天气|翻译/i.test(text);

    if (!isDevRequest) return out;

    if (!hasTech && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'tech_stack',
        severity: 'high',
        description: '未说明前端技术栈与后端语言',
        suggestion: '明确前端框架（如 React/Vue）与后端语言（如 Node/Go）',
      });
    }
    if (!hasDeploy && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'deployment',
        severity: 'medium',
        description: '未说明部署环境',
        suggestion: '明确部署目标（云服务器/容器/Serverless 等）',
      });
    }
    if (!hasData && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'data_source',
        severity: 'high',
        description: '未说明数据来源或 API',
        suggestion: '明确数据来自自建库还是第三方 API 及鉴权方式',
      });
    }
    if (!hasRole && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'user_role',
        severity: 'medium',
        description: '未说明目标用户或角色权限',
        suggestion: '明确系统面向哪些角色及权限划分',
      });
    }
    if (!hasPriority && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'priority',
        severity: 'high',
        description: '未说明功能优先级或 MVP 范围',
        suggestion: '列出首期 MVP 功能清单及可后续迭代项',
      });
    }
    if (!hasAcceptance && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'acceptance',
        severity: 'medium',
        description: '未说明验收标准',
        suggestion: '明确完成定义与成功指标',
      });
    }
    // V3.7.4 新增：时间约束检测
    const hasTimeline = /截止|交付时间|什么时候完成|多久|几天|本周|下周|月底|月初|号|日前|之前|之后/i.test(text);
    if (!hasTimeline && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'timeline',
        severity: 'medium',
        description: '未说明时间约束或交付日期',
        suggestion: '明确项目截止日期或期望交付时间',
      });
    }
    // V3.7.4 新增：资源约束检测
    const hasResources = /预算|多少钱|成本|费用|几个人|团队|人力|服务器|许可|license|付费/i.test(text);
    if (!hasResources && isDevRequest) {
      out.push({
        type: 'missing',
        field: 'resources',
        severity: 'low',
        description: '未说明资源约束（预算/人力/工具）',
        suggestion: '明确项目预算、可用人员及工具许可情况',
      });
    }
    return out;
  }

  _checkAmbiguous(text, context) {
    const out = [];
    if (/先做核心|核心功能|主要功能|先上|先搞/i.test(text) && !/首期|一期|mvp|包含.*功能/i.test(text)) {
      out.push({
        type: 'ambiguous',
        field: 'priority',
        severity: 'high',
        description: '「先做核心功能」存在歧义，未定义核心范围',
        suggestion: '列出首期 MVP 功能清单',
      });
    }
    if (/简单|简易|轻量|小工具/i.test(text) && text.length < 80) {
      out.push({
        type: 'ambiguous',
        field: 'priority',
        severity: 'low',
        description: '「简单/轻量」范围不明确',
        suggestion: '明确首期功能范围',
      });
    }
    if (/你看着办|你定|随便|都行|后面再说/i.test(text)) {
      out.push({
        type: 'ambiguous',
        field: 'tech_stack',
        severity: 'medium',
        description: '技术选型交由实现方决定，存在歧义',
        suggestion: '明确技术栈偏好或约束',
      });
    }
    return out;
  }

  _checkConflicting(text, context) {
    const out = [];
    const pureFront = /纯前端|只做前端|仅前端|前端页面/i.test(text);
    const needBackend = /后端|api|接口|写接口|服务端|server/i.test(text);
    if (pureFront && needBackend) {
      out.push({
        type: 'conflicting',
        field: 'tech_stack',
        severity: 'high',
        description: '既说纯前端又提到后端/接口，存在冲突',
        suggestion: '明确是否需要后端服务及职责划分',
      });
    }
    const miniProg = /小程序/i.test(text);
    const multiPlatform = /多端|h5|app|pc/i.test(text);
    if (miniProg && multiPlatform && !/微信|支付宝|uni|taro/i.test(text)) {
      out.push({
        type: 'conflicting',
        field: 'tech_stack',
        severity: 'medium',
        description: '小程序与多端表述可能冲突',
        suggestion: '明确小程序类型（微信/支付宝）或是否多端统一',
      });
    }
    return out;
  }

  _checkIncomplete(text, context) {
    const out = [];
    const hasFront = /react|vue|next|angular|flutter/i.test(text);
    const hasBack = /node|python|go|java|fastapi|express/i.test(text);
    const hasDb = /mysql|postgres|sqlite|mongodb|prisma/i.test(text);
    if (hasFront && !hasBack && !hasDb && /做|开发|建/i.test(text)) {
      out.push({
        type: 'incomplete',
        field: 'tech_stack',
        severity: 'high',
        description: '只提到前端技术，未说明后端与数据层',
        suggestion: '补充后端语言与数据库选型',
      });
    }
    if (hasFront && hasBack && !hasDb && /做|开发|建|后台/i.test(text)) {
      out.push({
        type: 'incomplete',
        field: 'data_source',
        severity: 'medium',
        description: '技术栈部分明确，数据源未说明',
        suggestion: '明确数据来源与存储方式',
      });
    }
    const hasSomeTech = /react|vue|node|mysql/i.test(text);
    const noDeploy = !/部署|deploy|上线|内网|vercel/i.test(text);
    if (hasSomeTech && noDeploy && /做|开发|建/i.test(text)) {
      out.push({
        type: 'incomplete',
        field: 'deployment',
        severity: 'low',
        description: '技术栈已给出，部署环境未说明',
        suggestion: '明确部署目标与环境',
      });
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// DomainAnalyzer - 跨域分析器
// ---------------------------------------------------------------------------

class DomainAnalyzer {
  constructor(options = {}) {
    this.domainsFilter = options.domains || DOMAINS;
  }

  /**
   * 为每条 ambiguity 附加 domain，并返回本次涉及的所有 domains
   */
  analyze(ambiguities) {
    const domainSet = new Set();
    const enriched = ambiguities.map((a) => {
      const domain = FIELD_TO_DOMAIN[a.field] || 'business';
      if (this.domainsFilter.length === 0 || this.domainsFilter.includes(domain)) {
        domainSet.add(domain);
        return { ...a, domain };
      }
      return null;
    }).filter(Boolean);
    return {
      ambiguities: enriched,
      domains: [...domainSet],
    };
  }
}

// ---------------------------------------------------------------------------
// QuestionGenerator - 澄清问题生成器（V3.7.4 增强：优先级排序 + 分批追问）
// ---------------------------------------------------------------------------

class QuestionGenerator {
  static TEMPLATES = {
    tech_stack: {
      missing: '前端希望用 React 还是 Vue？后端语言有偏好吗？',
      ambiguous: '技术栈是否有明确偏好或约束？',
      conflicting: '需要纯前端还是需要配套后端服务？',
      incomplete: '后端与数据库计划用哪些技术？',
    },
    deployment: {
      missing: '计划部署到云服务器、容器（如 Docker/K8s）还是 Serverless？',
      ambiguous: '部署环境有无现成约束？',
      conflicting: '请明确部署目标与运行环境。',
      incomplete: '部署目标与 CI/CD 有要求吗？',
    },
    data_source: {
      missing: '数据来自自建库还是第三方 API？如需对接外部 API，是否有文档或鉴权方式？',
      ambiguous: '数据源与接口规范是否已定？',
      conflicting: '请统一数据来源与接口职责。',
      incomplete: '数据存储与 API 鉴权方式是否确定？',
    },
    user_role: {
      missing: '系统面向哪些角色？是否需要区分管理员与普通用户？',
      ambiguous: '角色与权限粒度如何界定？',
      conflicting: '请明确角色划分与权限范围。',
      incomplete: '多角色与权限模型是否已明确？',
    },
    priority: {
      missing: '首期 MVP 需要包含哪些功能？哪些可以后续迭代？',
      ambiguous: '首期 MVP 范围与优先级是否已定？',
      conflicting: '请列出首期必须上线的功能清单。',
      incomplete: '功能分期与必选/可选是否明确？',
    },
    acceptance: {
      missing: '怎样算完成？有无明确的验收条件、成功指标或测试用例要求？',
      ambiguous: '验收标准与完成定义是否一致？',
      conflicting: '请统一验收条件与上线标准。',
      incomplete: '测试范围与成功指标是否已定？',
    },
    timeline: {  // V3.7.4 新增
      missing: '这个项目期望什么时候完成？有截止日期或交付时间吗？',
      ambiguous: '时间约束是否明确？',
      conflicting: '请统一时间安排与交付计划。',
      incomplete: '项目周期与里程碑是否已定？',
    },
    resources: {  // V3.7.4 新增
      missing: '项目预算是多少？有现成的开发团队或工具许可吗？',
      ambiguous: '资源约束是否明确？',
      conflicting: '请统一预算与人力安排。',
      incomplete: '基础设施与工具许可是否已准备？',
    },
  };

  /**
   * V3.7.4 增强：按优先级排序 + 分批追问
   * @param {Array} ambiguities - 模糊项列表
   * @param {Object} options - 选项
   * @param {number} options.batchSize - 每批最多问题数（默认 3）
   * @param {boolean} options.sortByPriority - 是否按优先级排序（默认 true）
   * @returns {Object} { questions: [], batches: [[]], total: number }
   */
  generate(ambiguities, options = {}) {
    const {
      batchSize = 3,
      sortByPriority = true
    } = options;

    const seen = new Set();
    const questions = [];
    const prioritized = [];

    // V3.7.4 增强：按严重程度排序（high → medium → low）
    const sorted = sortByPriority
      ? [...ambiguities].sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        })
      : ambiguities;

    for (const a of sorted) {
      const key = `${a.field}:${a.type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const fieldT = QuestionGenerator.TEMPLATES[a.field];
      const q = (fieldT && fieldT[a.type]) || a.suggestion || a.description;
      if (q && !questions.includes(q)) {
        questions.push(q);
        prioritized.push({
          question: q,
          field: a.field,
          severity: a.severity,
          type: a.type
        });
      }
    }

    // V3.7.4 增强：分批追问
    const batches = [];
    for (let i = 0; i < prioritized.length; i += batchSize) {
      batches.push(prioritized.slice(i, i + batchSize).map(p => p.question));
    }

    return {
      questions,           // 所有问题（扁平列表）
      batches,             // 分批问题（二维数组）
      total: questions.length,
      firstBatch: batches[0] || [],  // 第一批问题（优先问）
      hasMore: batches.length > 1    // 是否还有后续问题
    };
  }
}

// ---------------------------------------------------------------------------
// ConfidenceCalculator - 置信度计算器
// ---------------------------------------------------------------------------

class ConfidenceCalculator {
  calculate(userInput, ambiguities, domains) {
    const len = (userInput || '').trim().length;
    let c = 0.9;
    if (len < 10) c -= 0.3;
    else if (len < 30) c -= 0.15;
    if (ambiguities.length > 6) c -= 0.2;
    else if (ambiguities.length > 3) c -= 0.1;
    if (domains.length >= 3) c -= 0.05;
    return Math.max(0, Math.min(1, Math.round(c * 100) / 100));
  }
}

// ---------------------------------------------------------------------------
// AmbiguityDetector - 主类
// ---------------------------------------------------------------------------

class AmbiguityDetector {
  constructor(options = {}) {
    this.defaultOptions = {
      detectionDepth: options.detectionDepth || 'standard',
      domains: options.domains || DOMAINS,
      scope: options.scope || FIELDS,
    };
    this.scanner = new AmbiguityScanner(this.defaultOptions);
    this.domainAnalyzer = new DomainAnalyzer(this.defaultOptions);
    this.questionGenerator = new QuestionGenerator();
    this.confidenceCalculator = new ConfidenceCalculator();
  }

  /**
   * 主入口
   * @param {object} input - { userInput, context?, options? }
   * @returns {object} { isClear, ambiguities, clarificationQuestions, confidence, domains }
   */
  detect(input) {
    const err = this._validateInput(input);
    if (err) throw err;

    const userInput = (input.userInput || '').trim();
    const context = input.context || {};
    const options = { ...this.defaultOptions, ...(input.options || {}) };

    this.scanner.scope = options.scope || FIELDS;
    this.scanner.depth = options.detectionDepth || 'standard';
    this.domainAnalyzer.domainsFilter = options.domains || DOMAINS;

    let ambiguities = this.scanner.scan(userInput, context);
    const { ambiguities: enriched, domains } = this.domainAnalyzer.analyze(ambiguities);
    ambiguities = enriched;

    // V3.7.4 增强：按严重程度排序（high → medium → low）
    const severityOrder = { high: 0, medium: 1, low: 2 };
    ambiguities.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // V3.7.4 增强：支持分批追问选项
    const questionOptions = {
      batchSize: options.batchSize || 3,
      sortByPriority: options.sortByPriority !== false  // 默认启用优先级排序
    };
    const questionResult = this.questionGenerator.generate(ambiguities, questionOptions);
    
    const confidence = this.confidenceCalculator.calculate(userInput, ambiguities, domains);

    const hasBlocking = ambiguities.some(
      (a) => a.severity === 'high' || a.severity === 'medium'
    );
    const isClear = !hasBlocking;

    return {
      isClear,
      ambiguities: ambiguities.map((a) => ({
        type: a.type,
        description: a.description,
        severity: a.severity,
        suggestion: a.suggestion,
        domain: a.domain,
        field: a.field,
      })),
      clarificationQuestions: questionResult.questions,  // 向后兼容：扁平列表
      clarificationQuestionsBatches: questionResult.batches,  // V3.7.4 新增：分批问题
      firstBatch: questionResult.firstBatch,  // V3.7.4 新增：第一批问题（优先问）
      hasMoreQuestions: questionResult.hasMore,  // V3.7.4 新增：是否还有后续问题
      confidence,
      domains,
    };
  }

  _validateInput(input) {
    if (input == null || typeof input !== 'object') {
      const e = new Error('input must be a non-null object');
      e.code = ERROR_CODES.AMBIGUITY_INVALID_INPUT;
      return e;
    }
    if (typeof input.userInput !== 'string') {
      const e = new Error('userInput must be a string');
      e.code = ERROR_CODES.AMBIGUITY_INVALID_INPUT;
      return e;
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// 单例与导出
// ---------------------------------------------------------------------------

const detector = new AmbiguityDetector();

module.exports = {
  AmbiguityDetector,
  AmbiguityScanner,
  DomainAnalyzer,
  QuestionGenerator,
  ConfidenceCalculator,
  detector,
  ERROR_CODES,
  AMBIGUITY_TYPES,
  SEVERITIES,
  DOMAINS,
  FIELDS,
};

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const input = args.join(' ').trim();
  if (!input) {
    console.log('用法: node index.js <用户请求>');
    console.log('示例: node index.js "做一个内容运营平台"');
    process.exit(0);
  }
  try {
    const result = detector.detect({ userInput: input });
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('错误:', e.code || 'ERROR', e.message);
    process.exit(1);
  }
}
