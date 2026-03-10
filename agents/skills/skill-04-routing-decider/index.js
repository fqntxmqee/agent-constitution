/**
 * Skill-04: 动态路由决策器 (Routing Decider) - 核心实现
 * 纯 JavaScript (Node.js 18+)，无外部依赖（仅 fs/path）
 * 响应时间 <1 秒，导出 decider 单例
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 常量与错误码
// ---------------------------------------------------------------------------

const ERROR_CODES = {
  ROUTING_INVALID_INPUT: 'ROUTING_INVALID_INPUT',
  ROUTING_NO_MATCH: 'ROUTING_NO_MATCH',
  ROUTING_CONFIG_ERROR: 'ROUTING_CONFIG_ERROR',
  ROUTING_DECIDE_FAILED: 'ROUTING_DECIDE_FAILED',
};

const VALID_OPERATORS = ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'in'];

const VALID_TARGET_AGENTS = [
  'requirement-understanding',
  'requirement-clarification',
  'requirement-resolution',
  'requirement-acceptance',
  'requirement-delivery',
  'standard',
  'fast',
];

const CONFIG_FILENAME = 'routing-rules.json';
const CONFIG_DIR = 'config';

// ---------------------------------------------------------------------------
// ConfigLoader - 配置加载器（从 config/routing-rules.json 加载）
// ---------------------------------------------------------------------------

class ConfigLoader {
  /**
   * @param {string} [skillRootDir] - 技能根目录，默认 __dirname
   * @returns {{ rules: Array, defaultRoute: string }}
   */
  load(skillRootDir = __dirname) {
    const configPath = path.join(skillRootDir, CONFIG_DIR, CONFIG_FILENAME);
    let raw;
    try {
      raw = fs.readFileSync(configPath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        const e = new Error(`Config file not found: ${configPath}`);
        e.code = ERROR_CODES.ROUTING_CONFIG_ERROR;
        e.cause = err;
        throw e;
      }
      const e = new Error(`Failed to read config: ${err.message}`);
      e.code = ERROR_CODES.ROUTING_CONFIG_ERROR;
      e.cause = err;
      throw e;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      const e = new Error(`Invalid JSON in config: ${err.message}`);
      e.code = ERROR_CODES.ROUTING_CONFIG_ERROR;
      e.cause = err;
      throw e;
    }

    if (data == null || typeof data !== 'object') {
      const e = new Error('Config must be a non-null object');
      e.code = ERROR_CODES.ROUTING_CONFIG_ERROR;
      throw e;
    }

    const rules = Array.isArray(data.rules) ? data.rules : [];
    const defaultRoute =
      typeof data.defaultRoute === 'string' && data.defaultRoute !== ''
        ? data.defaultRoute
        : 'standard';

    return { rules, defaultRoute };
  }
}

// ---------------------------------------------------------------------------
// InputValidator - 输入验证器
// ---------------------------------------------------------------------------

function getValueByPath(obj, fieldPath) {
  if (obj == null || typeof fieldPath !== 'string' || fieldPath === '') return undefined;
  const parts = fieldPath.split('.');
  let current = obj;
  for (const key of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

class InputValidator {
  /**
   * 验证 decide() 的输入
   * @param {object} input - { skill01, skill03?, userOverride? }
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate(input) {
    const errors = [];

    if (input == null || typeof input !== 'object') {
      errors.push('input must be a non-null object');
      return { valid: false, errors };
    }

    if (!input.skill01 || typeof input.skill01 !== 'object') {
      errors.push('skill01 is required and must be an object');
    } else {
      const s1 = input.skill01;
      if (typeof s1.intent !== 'string' || s1.intent.trim() === '') {
        errors.push('skill01.intent must be a non-empty string');
      }
      const conf = s1.confidence;
      if (conf != null && (typeof conf !== 'number' || conf < 0 || conf > 1)) {
        errors.push('skill01.confidence must be a number in [0, 1] when present');
      }
      if (s1.entities != null && !Array.isArray(s1.entities)) {
        errors.push('skill01.entities must be an array when present');
      }
    }

    if (input.skill03 != null) {
      if (typeof input.skill03 !== 'object') {
        errors.push('skill03 must be an object when present');
      } else {
        const s3 = input.skill03;
        if (s3.taskType != null && typeof s3.taskType !== 'string') {
          errors.push('skill03.taskType must be a string when present');
        }
        if (
          s3.complexity != null &&
          !['high', 'medium', 'low'].includes(s3.complexity)
        ) {
          errors.push('skill03.complexity must be one of high|medium|low when present');
        }
        if (s3.requiresTools != null && typeof s3.requiresTools !== 'boolean') {
          errors.push('skill03.requiresTools must be a boolean when present');
        }
        if (
          s3.estimatedSteps != null &&
          (typeof s3.estimatedSteps !== 'number' || s3.estimatedSteps < 0)
        ) {
          errors.push('skill03.estimatedSteps must be a non-negative number when present');
        }
      }
    }

    if (input.userOverride != null) {
      if (typeof input.userOverride !== 'object') {
        errors.push('userOverride must be an object when present');
      } else {
        const uo = input.userOverride;
        if (uo.enabled != null && typeof uo.enabled !== 'boolean') {
          errors.push('userOverride.enabled must be a boolean when present');
        }
        if (uo.targetAgent != null && typeof uo.targetAgent !== 'string') {
          errors.push('userOverride.targetAgent must be a string when present');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ---------------------------------------------------------------------------
// RuleEngine - 规则引擎核心（支持 6 种运算符）
// ---------------------------------------------------------------------------

class RuleEngine {
  /**
   * @param {{ rules: Array, defaultRoute: string }} config
   */
  constructor(config) {
    this.config = config || { rules: [], defaultRoute: 'standard' };
  }

  _evaluateCondition(input, condition) {
    if (!condition || typeof condition !== 'object') return false;
    const { field, operator, value } = condition;
    if (!field || !operator || !VALID_OPERATORS.includes(operator)) return false;

    const actual = getValueByPath(input, field);

    switch (operator) {
      case 'equals':
        return actual === value;
      case 'notEquals':
        return actual !== value;
      case 'contains': {
        if (actual == null) return false;
        if (Array.isArray(actual)) return actual.includes(value);
        const str = String(actual);
        const search = value != null ? String(value) : '';
        return str.includes(search);
      }
      case 'greaterThan': {
        const numActual = Number(actual);
        const numValue = Number(value);
        if (Number.isNaN(numActual) || Number.isNaN(numValue)) return false;
        return numActual > numValue;
      }
      case 'lessThan': {
        const numActual = Number(actual);
        const numValue = Number(value);
        if (Number.isNaN(numActual) || Number.isNaN(numValue)) return false;
        return numActual < numValue;
      }
      case 'in': {
        if (!Array.isArray(value)) return false;
        return value.includes(actual);
      }
      default:
        return false;
    }
  }

  /**
   * 按优先级降序匹配，第一条全部条件满足的规则生效。
   * 规则支持 conditions (数组，AND) 或 condition (单条，兼容)。
   * @returns {{ routeTo: string, matchedRule: object|null, matchedRules: string[], noMatch: boolean }}
   */
  evaluate(input) {
    const rules = Array.isArray(this.config.rules) ? this.config.rules : [];
    const sorted = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    for (const rule of sorted) {
      const conds = Array.isArray(rule.conditions)
        ? rule.conditions
        : rule.condition != null
          ? [rule.condition]
          : [];
      const allMatch = conds.every((c) => this._evaluateCondition(input, c));
      if (allMatch && rule.then && rule.then.routeTo != null) {
        return {
          routeTo: rule.then.routeTo,
          matchedRule: rule,
          matchedRules: [rule.id || rule.then.routeTo].filter(Boolean),
          noMatch: false,
        };
      }
    }

    return {
      routeTo: this.config.defaultRoute || 'standard',
      matchedRule: null,
      matchedRules: [],
      noMatch: true,
    };
  }
}

// ---------------------------------------------------------------------------
// OutputGenerator - 决策输出生成器
// ---------------------------------------------------------------------------

class OutputGenerator {
  /**
   * 从输入与命中规则生成 factors：name, value, weight, matchedRule
   */
  buildFactors(input, matchedRule) {
    const factors = [];
    const ruleId = matchedRule && (matchedRule.id || matchedRule.then?.routeTo);

    if (input.skill01) {
      const weight = 0.4;
      factors.push({
        name: 'intent',
        value: input.skill01.intent,
        weight,
        matchedRule: ruleId || null,
      });
      if (input.skill01.confidence != null) {
        factors.push({
          name: 'confidence',
          value: input.skill01.confidence,
          weight: 0.2,
          matchedRule: ruleId || null,
        });
      }
    }

    if (input.skill03) {
      if (input.skill03.complexity != null) {
        factors.push({
          name: 'complexity',
          value: input.skill03.complexity,
          weight: 0.3,
          matchedRule: ruleId || null,
        });
      }
      if (input.skill03.estimatedSteps != null) {
        factors.push({
          name: 'estimatedSteps',
          value: input.skill03.estimatedSteps,
          weight: 0.1,
          matchedRule: ruleId || null,
        });
      }
      if (input.skill03.requiresTools != null) {
        factors.push({
          name: 'requiresTools',
          value: input.skill03.requiresTools,
          weight: 0.1,
          matchedRule: ruleId || null,
        });
      }
    }

    return factors;
  }

  /**
   * 生成 reasoning 文案
   */
  buildReasoning(options) {
    const {
      routeTo,
      isOverride,
      matchedRules,
      noMatch,
      input,
    } = options;

    if (isOverride) {
      return `采纳用户指定路由：${routeTo}。`;
    }
    if (noMatch || matchedRules.length === 0) {
      return `无规则命中，使用默认路由「${routeTo}」。`;
    }
    const parts = [];
    if (input.skill01?.intent) parts.push(`意图 ${input.skill01.intent}`);
    if (input.skill03?.complexity) parts.push(`复杂度 ${input.skill03.complexity}`);
    const desc = parts.length ? parts.join('、') + '，' : '';
    return `${desc}匹配规则 ${matchedRules.join(', ')}，路由至「${routeTo}」。`;
  }

  /**
   * 计算决策置信度
   */
  buildConfidence(input, isOverride, noMatch, matchedRules) {
    if (isOverride) return Math.min(1, (input.skill01?.confidence ?? 0.9) + 0.05);
    if (noMatch || matchedRules.length === 0) return 0.7;
    const base = input.skill01?.confidence;
    const c = typeof base === 'number' ? base : 0.9;
    return Math.min(1, Math.max(0, c));
  }

  /**
   * 生成完整输出对象
   */
  build(options) {
    const {
      routeTo,
      isOverride,
      reasoning,
      factors,
      matchedRules,
      noMatch,
      input,
    } = options;

    const confidence = this.buildConfidence(input, isOverride, noMatch, matchedRules);

    return {
      decision: {
        routeTo,
        confidence,
        isOverride: Boolean(isOverride),
      },
      reasoning: reasoning || this.buildReasoning({
        routeTo,
        isOverride,
        matchedRules,
        noMatch,
        input,
      }),
      factors: Array.isArray(factors) ? factors : [],
      matchedRules: Array.isArray(matchedRules) ? matchedRules : [],
      timestamp: new Date().toISOString(),
    };
  }
}

// ---------------------------------------------------------------------------
// RoutingDecider - 主决策类
// ---------------------------------------------------------------------------

class RoutingDecider {
  constructor(options = {}) {
    this.skillRootDir = options.skillRootDir || __dirname;
    this.configLoader = new ConfigLoader();
    this.validator = new InputValidator();
    this.outputGenerator = new OutputGenerator();
    this._rulesConfig = null;
    this._configLoaded = false;
  }

  _getRulesConfig() {
    if (!this._configLoaded) {
      try {
        this._rulesConfig = this.configLoader.load(this.skillRootDir);
      } catch (err) {
        if (err.code === ERROR_CODES.ROUTING_CONFIG_ERROR) throw err;
        const e = new Error(err.message);
        e.code = ERROR_CODES.ROUTING_CONFIG_ERROR;
        e.cause = err;
        throw e;
      }
      this._configLoaded = true;
    }
    return this._rulesConfig;
  }

  _isUserOverrideValid(input) {
    const uo = input.userOverride;
    if (!uo || typeof uo !== 'object') return false;
    if (uo.enabled !== true) return false;
    const target = uo.targetAgent;
    return (
      typeof target === 'string' &&
      target.trim() !== '' &&
      VALID_TARGET_AGENTS.includes(target)
    );
  }

  /**
   * 主方法：执行路由决策
   * @param {object} input - { skill01: { intent, confidence, entities? }, skill03?: {...}, userOverride?: { enabled, targetAgent } }
   * @returns {Promise<object>} { decision, reasoning, factors, matchedRules, timestamp }
   */
  async decide(input) {
    const start = Date.now();

    const validation = this.validator.validate(input);
    if (!validation.valid) {
      const err = new Error(validation.errors.join('; '));
      err.code = ERROR_CODES.ROUTING_INVALID_INPUT;
      err.details = validation.errors;
      throw err;
    }

    try {
      // 1. 用户覆盖优先
      if (this._isUserOverrideValid(input)) {
        const routeTo = input.userOverride.targetAgent;
        const factors = this.outputGenerator.buildFactors(input, null);
        factors.push({
          name: 'userOverride',
          value: routeTo,
          weight: 1,
          matchedRule: null,
        });
        const result = this.outputGenerator.build({
          routeTo,
          isOverride: true,
          reasoning: `采纳用户指定路由：${routeTo}。`,
          factors,
          matchedRules: [],
          noMatch: false,
          input,
        });
        if (Date.now() - start > 1000) {
          console.warn('[Skill-04] decide() exceeded 1s');
        }
        return result;
      }

      // 2. 加载规则并匹配
      const config = this._getRulesConfig();
      const ruleEngine = new RuleEngine(config);
      const { routeTo, matchedRule, matchedRules, noMatch } = ruleEngine.evaluate(input);

      const factors = this.outputGenerator.buildFactors(input, matchedRule);
      const reasoning = this.outputGenerator.buildReasoning({
        routeTo,
        isOverride: false,
        matchedRules,
        noMatch,
        input,
      });

      const result = this.outputGenerator.build({
        routeTo,
        isOverride: false,
        reasoning,
        factors,
        matchedRules,
        noMatch,
        input,
      });

      if (Date.now() - start > 1000) {
        console.warn('[Skill-04] decide() exceeded 1s');
      }
      return result;
    } catch (err) {
      if (err.code === ERROR_CODES.ROUTING_CONFIG_ERROR) throw err;
      const wrap = new Error(`ROUTING_DECIDE_FAILED: ${err.message}`);
      wrap.code = ERROR_CODES.ROUTING_DECIDE_FAILED;
      wrap.cause = err;
      throw wrap;
    }
  }

  /**
   * 同步版本
   */
  decideSync(input) {
    const validation = this.validator.validate(input);
    if (!validation.valid) {
      const err = new Error(validation.errors.join('; '));
      err.code = ERROR_CODES.ROUTING_INVALID_INPUT;
      err.details = validation.errors;
      throw err;
    }

    if (this._isUserOverrideValid(input)) {
      const routeTo = input.userOverride.targetAgent;
      const factors = this.outputGenerator.buildFactors(input, null);
      factors.push({
        name: 'userOverride',
        value: routeTo,
        weight: 1,
        matchedRule: null,
      });
      return this.outputGenerator.build({
        routeTo,
        isOverride: true,
        reasoning: `采纳用户指定路由：${routeTo}。`,
        factors,
        matchedRules: [],
        noMatch: false,
        input,
      });
    }

    const config = this._getRulesConfig();
    const ruleEngine = new RuleEngine(config);
    const { routeTo, matchedRule, matchedRules, noMatch } = ruleEngine.evaluate(input);
    const factors = this.outputGenerator.buildFactors(input, matchedRule);
    const reasoning = this.outputGenerator.buildReasoning({
      routeTo,
      isOverride: false,
      matchedRules,
      noMatch,
      input,
    });
    return this.outputGenerator.build({
      routeTo,
      isOverride: false,
      reasoning,
      factors,
      matchedRules,
      noMatch,
      input,
    });
  }

  reloadConfig() {
    this._configLoaded = false;
    this._rulesConfig = null;
    return this._getRulesConfig();
  }
}

// ---------------------------------------------------------------------------
// 单例导出
// ---------------------------------------------------------------------------

const decider = new RoutingDecider();

module.exports = {
  decider,
  RoutingDecider,
  RuleEngine,
  InputValidator,
  OutputGenerator,
  ConfigLoader,
  ERROR_CODES,
  VALID_OPERATORS,
  VALID_TARGET_AGENTS,
};
