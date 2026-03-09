/**
 * Skill-04: 动态路由决策器 - 核心路由决策逻辑
 * 纯 JavaScript (Node.js 18+)，无外部依赖（仅 fs/path）
 * 响应时间 <1 秒，导出 decider 单例
 */

const fs = require('fs');
const path = require('path');

const SUPPORTED_ROUTES = ['standard', 'fast'];
const VALID_OPERATORS = ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'in'];
const CONFIG_FILENAME = 'routing-rules.json';
const CONFIG_DIR = 'config';

// ---------------------------------------------------------------------------
// InputValidator - 输入验证器
// ---------------------------------------------------------------------------

class InputValidator {
  /**
   * 验证 decide() 的输入，抛出带 code 的 Error 便于上层处理
   * @param {object} input - 原始输入
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate(input) {
    const errors = [];

    if (input == null || typeof input !== 'object') {
      errors.push('INPUT_INVALID: input must be a non-null object');
      return { valid: false, errors };
    }

    if (typeof input.user_input !== 'string' || input.user_input.trim() === '') {
      errors.push('USER_INPUT_REQUIRED: user_input must be a non-empty string');
    }

    if (!input.intentResult || typeof input.intentResult !== 'object') {
      errors.push('INTENT_RESULT_REQUIRED: intentResult must be a non-null object');
    } else {
      const ir = input.intentResult;
      if (ir.primaryIntent != null && typeof ir.primaryIntent !== 'string') {
        errors.push('INTENT_RESULT_INVALID: intentResult.primaryIntent must be a string');
      }
      if (ir.complexity != null && !['high', 'medium', 'low'].includes(ir.complexity)) {
        errors.push('INTENT_RESULT_INVALID: intentResult.complexity must be high|medium|low');
      }
      if (ir.suggestedRoute != null && !SUPPORTED_ROUTES.includes(ir.suggestedRoute)) {
        errors.push('INTENT_RESULT_INVALID: intentResult.suggestedRoute must be standard|fast');
      }
    }

    if (input.taskOrAmbiguityResult != null) {
      if (typeof input.taskOrAmbiguityResult !== 'object') {
        errors.push('TASK_RESULT_INVALID: taskOrAmbiguityResult must be an object when present');
      } else if (
        input.taskOrAmbiguityResult.isClear !== undefined &&
        typeof input.taskOrAmbiguityResult.isClear !== 'boolean'
      ) {
        errors.push('TASK_RESULT_INVALID: taskOrAmbiguityResult.isClear must be boolean when present');
      }
    }

    if (input.userOverride != null) {
      if (typeof input.userOverride !== 'object') {
        errors.push('USER_OVERRIDE_INVALID: userOverride must be an object when present');
      } else if (
        input.userOverride.route !== undefined &&
        !SUPPORTED_ROUTES.includes(input.userOverride.route)
      ) {
        errors.push('USER_OVERRIDE_INVALID: userOverride.route must be standard|fast when present');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ---------------------------------------------------------------------------
// RuleEngine - 规则引擎核心（6 种运算符）
// ---------------------------------------------------------------------------

/**
 * 从 input 对象按点分路径取值，如 "intentResult.primaryIntent"
 */
function getValueByPath(obj, fieldPath) {
  if (obj == null || typeof fieldPath !== 'string' || fieldPath === '') {
    return undefined;
  }
  const parts = fieldPath.split('.');
  let current = obj;
  for (const key of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

class RuleEngine {
  constructor(rulesConfig) {
    this.config = rulesConfig || { rules: [], defaultRoute: 'standard' };
  }

  /**
   * 单条件求值：支持 equals, notEquals, contains, greaterThan, lessThan, in
   */
  _evaluateCondition(input, condition) {
    if (!condition || typeof condition !== 'object') return false;
    const { field, operator, value } = condition;
    if (!field || !operator || !VALID_OPERATORS.includes(operator)) {
      return false;
    }

    const actual = getValueByPath(input, field);

    switch (operator) {
      case 'equals':
        return actual === value;
      case 'notEquals':
        return actual !== value;
      case 'contains': {
        if (actual == null) return false;
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
   * 对 input 应用规则列表，返回第一个匹配的 routeTo，否则返回 defaultRoute
   */
  evaluate(input) {
    const rules = Array.isArray(this.config.rules) ? this.config.rules : [];
    const sorted = [...rules].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

    for (const rule of sorted) {
      const cond = rule.condition;
      if (!cond) continue;
      if (this._evaluateCondition(input, cond) && rule.then && rule.then.routeTo) {
        return rule.then.routeTo;
      }
    }

    return this.config.defaultRoute || 'standard';
  }
}

// ---------------------------------------------------------------------------
// OutputGenerator - 决策输出生成器
// ---------------------------------------------------------------------------

class OutputGenerator {
  /**
   * 从 input 提取决策因子（factors）
   */
  extractFactors(input) {
    const factors = [];
    const ir = input.intentResult || {};
    const task = input.taskOrAmbiguityResult;

    if (ir.primaryIntent != null) {
      factors.push({
        name: '意图类型',
        value: ir.primaryIntent,
        weight: 'high',
        effect: ir.primaryIntent === 'development' ? '倾向标准构建流' : '可走快速流',
      });
    }
    if (ir.complexity != null) {
      factors.push({
        name: '复杂度',
        value: ir.complexity,
        weight: ir.complexity === 'high' ? 'high' : 'medium',
        effect: ir.complexity === 'high' ? '倾向标准构建流' : '可考虑快速流',
      });
    }
    if (task && task.isClear === false) {
      factors.push({
        name: '模糊性',
        value: 'isClear: false',
        weight: 'high',
        effect: '需澄清后再进入需求理解',
      });
    }
    if (ir.suggestedRoute != null) {
      factors.push({
        name: '意图建议路由',
        value: ir.suggestedRoute,
        weight: 'medium',
        effect: `意图引擎建议${ir.suggestedRoute === 'fast' ? '快速流' : '标准流'}`,
      });
    }

    return factors;
  }

  /**
   * 根据 routeTo 生成 suggestedNextStep
   */
  getSuggestedNextStep(routeTo, userOverrideApplied) {
    if (userOverrideApplied) {
      return routeTo === 'standard'
        ? '按用户指定走标准构建流，可生成《澄清提案》或进入需求理解'
        : '按用户指定走快速流，用户确认后进入需求解决';
    }
    return routeTo === 'standard'
      ? '调用需求澄清生成《澄清提案》'
      : '用户确认快速流后进入需求解决';
  }

  /**
   * 生成完整输出对象
   */
  build(options) {
    const {
      routeTo,
      reasoning,
      factors,
      userOverrideApplied,
      userOverrideReason,
    } = options;

    const suggestedNextStep = this.getSuggestedNextStep(routeTo, userOverrideApplied);

    const result = {
      routeTo,
      reasoning,
      factors: Array.isArray(factors) ? factors : [],
      userOverrideApplied: Boolean(userOverrideApplied),
      suggestedNextStep,
    };

    if (userOverrideApplied && userOverrideReason) {
      result.reasoning = result.reasoning + (result.reasoning ? ' ' : '') + `用户原因：${userOverrideReason}`;
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// 配置加载器 - 从 config/routing-rules.json 加载规则
// ---------------------------------------------------------------------------

function loadRoutingRules(skillRootDir) {
  const baseDir = skillRootDir || __dirname;
  const configPath = path.join(baseDir, CONFIG_DIR, CONFIG_FILENAME);

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const data = JSON.parse(raw);
    if (data && (Array.isArray(data.rules) || data.defaultRoute != null)) {
      return data;
    }
    return { rules: [], defaultRoute: 'standard' };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { rules: [], defaultRoute: 'standard' };
    }
    throw new Error(`ROUTING_CONFIG_LOAD_FAILED: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// RoutingDecider - 主决策类
// ---------------------------------------------------------------------------

class RoutingDecider {
  constructor(options = {}) {
    this.skillRootDir = options.skillRootDir || __dirname;
    this.validator = new InputValidator();
    this.outputGenerator = new OutputGenerator();
    this._rulesConfig = null;
    this._configLoaded = false;
  }

  _getRulesConfig() {
    if (!this._configLoaded) {
      this._rulesConfig = loadRoutingRules(this.skillRootDir);
      this._configLoaded = true;
    }
    return this._rulesConfig;
  }

  /**
   * 用户覆盖是否有效：存在 userOverride.route 且在支持枚举内
   */
  _isUserOverrideValid(input) {
    const uo = input.userOverride;
    if (!uo || typeof uo !== 'object') return false;
    const route = uo.route;
    return route != null && SUPPORTED_ROUTES.includes(route);
  }

  /**
   * 主方法：执行路由决策
   * @param {object} input - 见 SKILL.md 输入规范
   * @returns {Promise<object>} 见 SKILL.md 输出规范
   */
  async decide(input) {
    const start = Date.now();

    try {
      const validation = this.validator.validate(input);
      if (!validation.valid) {
        const err = new Error(validation.errors.join('; '));
        err.code = 'INPUT_VALIDATION_FAILED';
        err.details = validation.errors;
        throw err;
      }

      const factors = this.outputGenerator.extractFactors(input);

      // 1. 用户覆盖优先
      if (this._isUserOverrideValid(input)) {
        const routeTo = input.userOverride.route;
        const reasoning = '采纳用户指定路由';
        const userReason = input.userOverride.reason;
        const factorsWithOverride = [
          ...factors,
          { name: '用户指定', value: routeTo, weight: 'high', effect: '覆盖规则引擎结果' },
        ];
        const result = this.outputGenerator.build({
          routeTo,
          reasoning,
          factors: factorsWithOverride,
          userOverrideApplied: true,
          userOverrideReason: userReason,
        });
        if (Date.now() - start > 1000) {
          console.warn('[Skill-04] decide() exceeded 1s');
        }
        return result;
      }

      // 2. 规则引擎
      const config = this._getRulesConfig();
      const ruleEngine = new RuleEngine(config);
      const routeTo = ruleEngine.evaluate(input);

      const reasoning =
        factors.length > 0
          ? `基于规则引擎：意图与复杂度等因素匹配到路由「${routeTo}」`
          : `规则引擎默认路由「${routeTo}」`;

      const result = this.outputGenerator.build({
        routeTo,
        reasoning,
        factors,
        userOverrideApplied: false,
      });

      if (Date.now() - start > 1000) {
        console.warn('[Skill-04] decide() exceeded 1s');
      }
      return result;
    } catch (err) {
      if (err.code === 'INPUT_VALIDATION_FAILED' || err.message.startsWith('ROUTING_CONFIG_LOAD_FAILED')) {
        throw err;
      }
      const wrap = new Error(`ROUTING_DECIDE_FAILED: ${err.message}`);
      wrap.code = 'ROUTING_DECIDE_FAILED';
      wrap.cause = err;
      throw wrap;
    }
  }

  /**
   * 同步版本（便于测试或无 async 环境）
   */
  decideSync(input) {
    const validation = this.validator.validate(input);
    if (!validation.valid) {
      const err = new Error(validation.errors.join('; '));
      err.code = 'INPUT_VALIDATION_FAILED';
      err.details = validation.errors;
      throw err;
    }

    if (this._isUserOverrideValid(input)) {
      const routeTo = input.userOverride.route;
      const factors = this.outputGenerator.extractFactors(input);
      const factorsWithOverride = [
        ...factors,
        { name: '用户指定', value: routeTo, weight: 'high', effect: '覆盖规则引擎结果' },
      ];
      return this.outputGenerator.build({
        routeTo,
        reasoning: '采纳用户指定路由',
        factors: factorsWithOverride,
        userOverrideApplied: true,
        userOverrideReason: input.userOverride.reason,
      });
    }

    const config = this._getRulesConfig();
    const ruleEngine = new RuleEngine(config);
    const routeTo = ruleEngine.evaluate(input);
    const factors = this.outputGenerator.extractFactors(input);
    const reasoning =
      factors.length > 0
        ? `基于规则引擎：意图与复杂度等因素匹配到路由「${routeTo}」`
        : `规则引擎默认路由「${routeTo}」`;

    return this.outputGenerator.build({
      routeTo,
      reasoning,
      factors,
      userOverrideApplied: false,
    });
  }

  /**
   * 重新加载配置（用于用户覆盖机制或热更新）
   */
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
  InputValidator,
  RuleEngine,
  OutputGenerator,
  loadRoutingRules,
  SUPPORTED_ROUTES,
  VALID_OPERATORS,
};
