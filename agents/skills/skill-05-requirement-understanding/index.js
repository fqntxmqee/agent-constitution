/**
 * Skill-05: 需求理解智能体 (Requirement Understanding)
 * 将已确认提案转化为规约增量 (Spec Delta) 与执行蓝图 (Execution Blueprint)。
 * 纯 JavaScript (Node.js 18+)，无外部依赖 (除 fs/path)。
 */

const fs = require('fs');
const path = require('path');

// --- Error codes ---
const UNDERSTANDING_INVALID_INPUT = 'UNDERSTANDING_INVALID_INPUT';
const UNDERSTANDING_FORMAT_ERROR = 'UNDERSTANDING_FORMAT_ERROR';
const UNDERSTANDING_CONSISTENCY_ERROR = 'UNDERSTANDING_CONSISTENCY_ERROR';
const UNDERSTANDING_VALIDATION_FAILED = 'UNDERSTANDING_VALIDATION_FAILED';
const UNDERSTANDING_UNKNOWN_ERROR = 'UNDERSTANDING_UNKNOWN_ERROR';

// --- OpenSpec 文档定义 ---
const OPENSPEC_DOCUMENTS = [
  { file: 'proposal.md', purpose: '项目提案与背景、目标、范围' },
  { file: 'specs/requirements.md', purpose: '需求规格与验收条件（AC）' },
  { file: 'design.md', purpose: '技术设计与架构要点' },
  { file: 'tasks.md', purpose: '可执行任务列表' },
];

const BLUEPRINT_FORMS = ['openspec', 'content-outline', 'execution-plan'];

/**
 * 格式验证器：验证 OpenSpec 或对应形态的文档结构
 */
class FormatValidator {
  /**
   * @param {{ form: string, documents: Array<{file: string}> }} blueprint
   * @returns {{ valid: boolean, issues: Array<{name: string, passed: boolean, message: string}> }}
   */
  validate(blueprint) {
    const issues = [];
    const form = blueprint.form || 'openspec';

    if (form === 'openspec') {
      const requiredFiles = OPENSPEC_DOCUMENTS.map((d) => d.file);
      const actualFiles = (blueprint.documents || []).map((d) => d.file);
      const missing = requiredFiles.filter((f) => !actualFiles.includes(f));
      if (missing.length > 0) {
        issues.push({
          name: 'openspec-structure',
          passed: false,
          message: `缺少必需文档: ${missing.join(', ')}`,
        });
      } else {
        issues.push({
          name: 'openspec-structure',
          passed: true,
          message: 'proposal, specs, design, tasks 齐全',
        });
      }
    }

    const tasks = blueprint.tasks || [];
    const acList = blueprint.AC || blueprint.acList || [];
    if (acList.length === 0) {
      issues.push({
        name: 'ac-present',
        passed: false,
        message: '蓝图至少需包含一条验收条件 (AC)',
      });
    } else {
      issues.push({
        name: 'ac-present',
        passed: true,
        message: `AC 共 ${acList.length} 条`,
      });
    }

    const allVerifiable = acList.every((ac) => ac.verifiable !== false);
    if (!allVerifiable && acList.length > 0) {
      issues.push({
        name: 'ac-verifiable',
        passed: false,
        message: 'AC 均须具备可验证描述 (verifiable: true)',
      });
    } else if (acList.length > 0) {
      issues.push({
        name: 'ac-verifiable',
        passed: true,
        message: 'AC 均具备可验证描述',
      });
    }

    if (tasks.length === 0) {
      issues.push({
        name: 'tasks-present',
        passed: false,
        message: '蓝图至少需包含一条可执行任务',
      });
    } else {
      issues.push({
        name: 'tasks-present',
        passed: true,
        message: `任务共 ${tasks.length} 条`,
      });
    }

    const valid = issues.every((c) => c.passed);
    return { valid, issues, checks: issues };
  }
}

/**
 * 一致性校验器：与主规约对比，检查逻辑冲突
 */
class ConsistencyChecker {
  /**
   * @param {{ added: string[], modified: string[], removed?: string[] }} specDelta
   * @param {string} [mainSpecPath]
   * @param {boolean} [strict]
   * @returns {{ valid: boolean, issues: Array<{type: string, message: string}> }}
   */
  check(specDelta, mainSpecPath, strict = true) {
    const issues = [];

    if (!mainSpecPath || !mainSpecPath.trim()) {
      return { valid: true, issues, consistencyValid: true };
    }

    try {
      const resolved = path.resolve(mainSpecPath);
      if (!fs.existsSync(resolved)) {
        issues.push({
          type: 'consistency',
          message: `主规约路径不存在: ${mainSpecPath}`,
        });
        return {
          valid: !strict,
          issues,
          consistencyValid: false,
        };
      }

      const mainSpecDir = fs.statSync(resolved).isDirectory() ? resolved : path.dirname(resolved);
      const mainProposalPath = path.join(mainSpecDir, 'proposal.md');
      const mainSpecsPath = path.join(mainSpecDir, 'specs', 'requirements.md');

      if (specDelta.modified && specDelta.modified.length > 0) {
        for (const item of specDelta.modified) {
          if (item.includes('requirements') || item.includes('proposal')) {
            issues.push({
              type: 'consistency',
              message: `修改项可能与主规约重叠: ${item}，请人工确认无冲突`,
            });
          }
        }
      }

      const consistencyValid = issues.length === 0;
      return {
        valid: strict ? consistencyValid : true,
        issues,
        consistencyValid,
      };
    } catch (err) {
      issues.push({
        type: 'consistency',
        message: `一致性校验异常: ${err.message}`,
      });
      return {
        valid: false,
        issues,
        consistencyValid: false,
      };
    }
  }
}

/**
 * 增量规约生成器：基于已确认提案生成 added/modified/removed 与影响范围
 */
class SpecDeltaGenerator {
  /**
   * @param {{ title?: string, summary: string, goals?: string[], scope?: string, constraints?: string[] }} confirmedProposal
   * @param {{ mainSpecPath?: string }} context
   * @returns {{ added: string[], modified: string[], removed: string[], impactScope?: string, impactAnalysis?: string }}
   */
  generate(confirmedProposal, context = {}) {
    const added = [];
    const modified = [];
    const removed = [];

    added.push('proposal.md');
    added.push('specs/requirements.md');
    added.push('design.md');
    added.push('tasks.md');

    if (context.mainSpecPath) {
      try {
        const resolved = path.resolve(context.mainSpecPath);
        if (fs.existsSync(resolved)) {
          const dir = fs.statSync(resolved).isDirectory() ? resolved : path.dirname(resolved);
          const existing = [
            'proposal.md',
            'specs/requirements.md',
            'design.md',
            'tasks.md',
          ].filter((f) => fs.existsSync(path.join(dir, f)));
          existing.forEach((f) => {
            if (added.includes(f)) {
              added.splice(added.indexOf(f), 1);
              modified.push(f);
            }
          });
        }
      } catch (_) {
        // 忽略 IO 错误，按全新项目处理
      }
    }

    const scope = confirmedProposal.scope || confirmedProposal.summary || '';
    const impactScope = scope.slice(0, 200);
    const impactAnalysis = `变更影响: ${added.length} 项新增, ${modified.length} 项修改, ${removed.length} 项移除。范围: ${impactScope}`;

    return {
      added,
      modified,
      removed,
      impactScope,
      impactAnalysis,
    };
  }
}

/**
 * 执行蓝图生成器：生成 documents、tasks、AC
 */
class BlueprintGenerator {
  /**
   * @param {{ title?: string, summary: string, goals?: string[], scope?: string, constraints?: string[] }} confirmedProposal
   * @param {{ projectName?: string, intentResult?: string, taskType?: string }} context
   * @param {{ blueprintForm?: string, outputPath?: string }} options
   * @returns {{ form: string, outputPath: string, documents: object[], tasks: object[], AC: object[], acList: object[], summary: string }}
   */
  generate(confirmedProposal, context = {}, options = {}) {
    const intent = (confirmedProposal.intent || context.intentResult || 'development').toLowerCase();
    const form = options.blueprintForm || (intent === 'development' ? 'openspec' : intent === 'content' ? 'content-outline' : 'execution-plan');
    const projectName = context.projectName || 'default-project';
    const basePath = options.outputPath || path.join('openspec', 'changes', projectName);
    const outputPath = path.normalize(basePath);

    const documents = form === 'openspec'
      ? OPENSPEC_DOCUMENTS.map((d) => ({ ...d }))
      : [
          { file: 'outline.md', purpose: '内容或执行大纲' },
          { file: 'tasks.md', purpose: '可执行任务列表' },
        ];

    const goals = confirmedProposal.goals || [confirmedProposal.summary];
    const acList = goals.slice(0, 10).map((g, i) => ({
      id: `AC${i + 1}`,
      description: typeof g === 'string' ? g : (g.label || g.text || String(g)),
      verifiable: true,
    }));

    if (acList.length === 0) {
      acList.push({
        id: 'AC1',
        description: confirmedProposal.summary || '需求按提案完成并可验收',
        verifiable: true,
      });
    }

    const tasks = acList.map((ac, i) => ({
      id: `T${String(i + 1).padStart(3, '0')}`,
      title: `任务 ${i + 1}: ${ac.description.slice(0, 40)}${ac.description.length > 40 ? '...' : ''}`,
      dependsOn: i === 0 ? [] : [`T${String(i).padStart(3, '0')}`],
      acRefs: [ac.id],
    }));

    const summary = `蓝图形态: ${form}，输出目录: ${outputPath}。共 ${documents.length} 个文档，${tasks.length} 个任务，${acList.length} 条 AC。供需求解决按序执行，验收按 AC 验证。`;

    return {
      form,
      outputPath,
      documents,
      tasks,
      AC: acList,
      acList,
      summary,
    };
  }
}

/**
 * 需求理解主类：串联 SpecDelta、Blueprint、FormatValidator、ConsistencyChecker
 */
class RequirementUnderstanding {
  constructor() {
    this.specDeltaGenerator = new SpecDeltaGenerator();
    this.blueprintGenerator = new BlueprintGenerator();
    this.formatValidator = new FormatValidator();
    this.consistencyChecker = new ConsistencyChecker();
  }

  /**
   * 主入口
   * @param {{
   *   confirmedProposal: { title?: string, summary: string, goals?: string[], scope?: string, constraints?: string[] },
   *   context?: { projectName?: string, intentResult?: string, taskType?: string, mainSpecPath?: string },
   *   options?: { blueprintForm?: string, outputPath?: string, strictValidation?: boolean }
   * }} input
   * @returns {Promise<{
   *   blueprint: { documents: object[], tasks: object[], acList: object[], outputPath: string },
   *   specDelta: { added: string[], modified: string[], impactAnalysis: string },
   *   validationReport: { formatValid: boolean, consistencyValid: boolean, issues: object[] },
   *   status: 'success' | 'error',
   *   error?: { code: string, message: string }
   * }>}
   */
  async understand(input) {
    const start = Date.now();

    try {
      if (!input || typeof input !== 'object') {
        throw this._error(UNDERSTANDING_INVALID_INPUT, 'input 必须为非空对象');
      }

      const { confirmedProposal, context = {}, options = {} } = input;

      if (!confirmedProposal || typeof confirmedProposal !== 'object') {
        throw this._error(UNDERSTANDING_INVALID_INPUT, 'confirmedProposal 必填且为对象');
      }

      if (!confirmedProposal.summary && !confirmedProposal.title) {
        throw this._error(UNDERSTANDING_INVALID_INPUT, 'confirmedProposal 至少需要 summary 或 title');
      }

      const proposal = {
        ...confirmedProposal,
        summary: confirmedProposal.summary || confirmedProposal.title || '',
      };

      const strict = options.strictValidation !== false;

      // 1. 规约增量
      const specDelta = this.specDeltaGenerator.generate(proposal, context);

      // 2. 执行蓝图
      const fullBlueprint = this.blueprintGenerator.generate(proposal, context, options);

      // 3. 格式验证
      const formatResult = this.formatValidator.validate(fullBlueprint);
      if (!formatResult.valid) {
        const issues = formatResult.checks.filter((c) => !c.passed).map((c) => ({ type: 'format', message: c.message, name: c.name }));
        if (strict) {
          throw this._error(UNDERSTANDING_FORMAT_ERROR, `格式验证未通过: ${issues.map((i) => i.message).join('; ')}`, { validationReport: { formatValid: false, issues } });
        }
      }

      // 4. 一致性校验
      const consistencyResult = this.consistencyChecker.check(
        specDelta,
        context.mainSpecPath,
        strict,
      );
      if (!consistencyResult.consistencyValid && consistencyResult.issues.length > 0) {
        if (strict) {
          throw this._error(UNDERSTANDING_CONSISTENCY_ERROR, consistencyResult.issues.map((i) => i.message).join('; '), { validationReport: { consistencyValid: false, issues: consistencyResult.issues } });
        }
      }

      const allIssues = [
        ...(formatResult.checks || []).map((c) => ({ type: c.passed ? 'check' : 'format', name: c.name, message: c.message })),
        ...(consistencyResult.issues || []).map((i) => ({ type: 'consistency', message: i.message })),
      ].filter((i) => i.type !== 'check' || !i.message.includes('齐全'));

      const validationReport = {
        formatValid: formatResult.valid,
        consistencyValid: consistencyResult.consistencyValid !== false,
        issues: allIssues.filter((i) => i.type !== 'check'),
        errors: formatResult.checks.filter((c) => !c.passed).map((c) => c.message).concat(consistencyResult.issues.map((i) => i.message)),
        warnings: [],
        checks: formatResult.checks || [],
      };

      const elapsed = Date.now() - start;
      if (elapsed >= 2000) {
        validationReport.warnings.push('响应时间超过 2 秒，请优化');
      }

      return {
        blueprint: {
          documents: fullBlueprint.documents,
          tasks: fullBlueprint.tasks,
          acList: fullBlueprint.acList,
          outputPath: fullBlueprint.outputPath,
          form: fullBlueprint.form,
          summary: fullBlueprint.summary,
        },
        specDelta: {
          added: specDelta.added,
          modified: specDelta.modified,
          removed: specDelta.removed,
          impactScope: specDelta.impactScope,
          impactAnalysis: specDelta.impactAnalysis,
        },
        validationReport: {
          formatValid: validationReport.formatValid,
          consistencyValid: validationReport.consistencyValid,
          issues: validationReport.issues,
          errors: validationReport.errors,
          warnings: validationReport.warnings,
          checks: validationReport.checks,
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };
    } catch (err) {
      if (err.code && err.code.startsWith('UNDERSTANDING_')) {
        return {
          blueprint: { documents: [], tasks: [], acList: [], outputPath: '' },
          specDelta: { added: [], modified: [], impactAnalysis: '' },
          validationReport: { formatValid: false, consistencyValid: false, issues: [{ type: 'error', message: err.message }] },
          timestamp: new Date().toISOString(),
          status: 'error',
          error: { code: err.code, message: err.message },
        };
      }
      return {
        blueprint: { documents: [], tasks: [], acList: [], outputPath: '' },
        specDelta: { added: [], modified: [], impactAnalysis: '' },
        validationReport: { formatValid: false, consistencyValid: false, issues: [{ type: 'error', message: err.message }] },
        timestamp: new Date().toISOString(),
        status: 'error',
        error: { code: UNDERSTANDING_UNKNOWN_ERROR, message: err.message },
      };
    }
  }

  _error(code, message, extra = {}) {
    const err = new Error(message);
    err.code = code;
    Object.assign(err, extra);
    return err;
  }
}

// --- 单例与导出 ---
const understanding = new RequirementUnderstanding();

module.exports = {
  RequirementUnderstanding,
  SpecDeltaGenerator,
  BlueprintGenerator,
  FormatValidator,
  ConsistencyChecker,
  understanding,
  errors: {
    UNDERSTANDING_INVALID_INPUT,
    UNDERSTANDING_FORMAT_ERROR,
    UNDERSTANDING_CONSISTENCY_ERROR,
    UNDERSTANDING_VALIDATION_FAILED,
    UNDERSTANDING_UNKNOWN_ERROR,
  },
};
