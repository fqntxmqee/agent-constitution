/**
 * Skill-06: 多模态蓝图转换器 (Blueprint Converter)
 * 根据 taskType 选择蓝图形态，生成标准化文档结构。
 * 纯 JavaScript，Node.js 18+，无外部依赖（仅 fs/path）。
 */

const path = require('path');

// --- 错误码 ---
const BLUEPRINT_INVALID_INPUT = 'BLUEPRINT_INVALID_INPUT';
const BLUEPRINT_UNKNOWN_FORM = 'BLUEPRINT_UNKNOWN_FORM';
const BLUEPRINT_PATH_ERROR = 'BLUEPRINT_PATH_ERROR';

const TASK_TYPES = Object.freeze(['development', 'content', 'skill']);
const COMPLEXITY_LEVELS = Object.freeze(['high', 'medium', 'low']);
const DEFAULT_COMPLEXITY = 'medium';
const DEFAULT_BASE_PATH = 'openspec/changes';

/**
 * 输入验证器：校验 confirmedRequirement、taskType、complexity 等
 */
class InputValidator {
  /**
   * @param {object} input - 技能输入
   * @returns {{ valid: boolean, error?: { code: string, message: string } }}
   */
  validate(input) {
    if (input == null || typeof input !== 'object') {
      return {
        valid: false,
        error: {
          code: BLUEPRINT_INVALID_INPUT,
          message: 'Input must be a non-null object',
        },
      };
    }

    const { confirmedRequirement, taskType, complexity, context } = input;

    if (!confirmedRequirement || typeof confirmedRequirement !== 'object') {
      return {
        valid: false,
        error: {
          code: BLUEPRINT_INVALID_INPUT,
          message: 'confirmedRequirement is required and must be an object',
        },
      };
    }

    const summary = confirmedRequirement.summary;
    if (summary == null || (typeof summary !== 'string') || summary.trim() === '') {
      return {
        valid: false,
        error: {
          code: BLUEPRINT_INVALID_INPUT,
          message: 'confirmedRequirement.summary is required and must be a non-empty string',
        },
      };
    }

    if (taskType == null || typeof taskType !== 'string' || taskType.trim() === '') {
      return {
        valid: false,
        error: {
          code: BLUEPRINT_INVALID_INPUT,
          message: 'taskType is required and must be a non-empty string',
        },
      };
    }

    const normalizedTaskType = taskType.trim().toLowerCase();
    if (!TASK_TYPES.includes(normalizedTaskType)) {
      return {
        valid: false,
        error: {
          code: BLUEPRINT_UNKNOWN_FORM,
          message: `taskType must be one of: ${TASK_TYPES.join(', ')}. Got: ${taskType}`,
        },
      };
    }

    if (complexity != null) {
      const normalizedComplexity = typeof complexity === 'string' ? complexity.trim().toLowerCase() : complexity;
      if (!COMPLEXITY_LEVELS.includes(normalizedComplexity)) {
        return {
          valid: false,
          error: {
            code: BLUEPRINT_INVALID_INPUT,
            message: `complexity must be one of: ${COMPLEXITY_LEVELS.join(', ')}. Got: ${complexity}`,
          },
        };
      }
    }

    return { valid: true };
  }
}

/**
 * 蓝图形态选择器：根据 taskType 映射到 blueprintForm
 */
class BlueprintSelector {
  static FORM_MAP = Object.freeze({
    development: 'openspec',
    content: 'content-outline',
    skill: 'execution-plan',
  });

  /**
   * @param {string} taskType - development | content | skill
   * @returns {{ form: string } | { error: { code: string, message: string } }}
   */
  select(taskType) {
    const normalized = (taskType || '').trim().toLowerCase();
    const form = BlueprintSelector.FORM_MAP[normalized];
    if (!form) {
      return {
        error: {
          code: BLUEPRINT_UNKNOWN_FORM,
          message: `Unknown taskType: ${taskType}. Allowed: ${TASK_TYPES.join(', ')}`,
        },
      };
    }
    return { form };
  }
}

/**
 * 文档生成器：按形态返回标准化文档列表（file + purpose）
 */
class DocumentGenerator {
  static OPENSPEC_DOCS = Object.freeze([
    { file: 'proposal.md', purpose: '项目提案与背景、目标、范围' },
    { file: 'specs/requirements.md', purpose: '需求规格与验收条件（AC）' },
    { file: 'design.md', purpose: '技术设计与架构要点' },
    { file: 'tasks.md', purpose: '可执行任务列表，供需求解决按序执行' },
  ]);

  static CONTENT_OUTLINE_DOCS = Object.freeze([
    { file: 'outline.md', purpose: '内容大纲与章节结构' },
    { file: 'style-guide.md', purpose: '风格指南、语气、格式要求' },
    { file: 'milestones.md', purpose: '内容里程碑与交付节点' },
  ]);

  static EXECUTION_PLAN_DOCS = Object.freeze([
    { file: 'plan.md', purpose: '执行计划与步骤说明' },
    { file: 'checklist.md', purpose: '检查清单与完成标准' },
    { file: 'resources.md', purpose: '依赖资源、API、数据源等' },
  ]);

  /**
   * @param {string} blueprintForm - openspec | content-outline | execution-plan
   * @returns {Array<{ file: string, purpose: string }>}
   */
  getDocuments(blueprintForm) {
    switch (blueprintForm) {
      case 'openspec':
        return [...DocumentGenerator.OPENSPEC_DOCS];
      case 'content-outline':
        return [...DocumentGenerator.CONTENT_OUTLINE_DOCS];
      case 'execution-plan':
        return [...DocumentGenerator.EXECUTION_PLAN_DOCS];
      default:
        return [];
    }
  }
}

/**
 * 路径解析器：根据 confirmedRequirement.path 或 summary 生成 outputPath
 */
class PathResolver {
  /**
   * 从 summary 推导项目名：取首行、去非法字符、截断
   * @param {string} summary
   * @returns {string}
   */
  static deriveProjectName(summary) {
    const firstLine = (summary || '').trim().split(/\r?\n/)[0] || 'unnamed';
    const sanitized = firstLine
      .replace(/[^\p{L}\p{N}\s\-_]/gu, '')
      .replace(/\s+/g, '-')
      .trim()
      .slice(0, 50);
    return sanitized || 'unnamed';
  }

  /**
   * @param {object} confirmedRequirement - 至少含 summary，可选 path
   * @param {string} blueprintForm - 形态，用于约定目录结构
   * @returns {string} outputPath 目录路径，末尾带 /
   */
  resolve(confirmedRequirement, blueprintForm) {
    const reqPath = confirmedRequirement.path;
    if (reqPath != null && typeof reqPath === 'string' && reqPath.trim() !== '') {
      const normalized = path.normalize(reqPath.trim()).replace(/\\/g, '/');
      return normalized.endsWith('/') ? normalized : `${normalized}/`;
    }
    const projectName = PathResolver.deriveProjectName(confirmedRequirement.summary);
    return `${DEFAULT_BASE_PATH}/${projectName}/`;
  }
}

/**
 * 蓝图转换器：主入口，串联校验 → 选择形态 → 解析路径 → 生成文档列表 → 返回结果
 */
class BlueprintConverter {
  constructor() {
    this.validator = new InputValidator();
    this.selector = new BlueprintSelector();
    this.documentGenerator = new DocumentGenerator();
    this.pathResolver = new PathResolver();
  }

  /**
   * 生成 summary 文案
   * @param {string} blueprintForm
   * @param {string} outputPath
   * @param {number} docCount
   * @returns {string}
   */
  _buildSummary(blueprintForm, outputPath, docCount) {
    const formLabel = {
      'openspec': 'OpenSpec 开发蓝图',
      'content-outline': '内容大纲蓝图',
      'execution-plan': '执行计划蓝图',
    }[blueprintForm] || '蓝图';
    return `已生成${formLabel}，共 ${docCount} 份文档，输出目录：${outputPath}。请确认后进入需求解决或按文档落盘。`;
  }

  /**
   * 主方法：将输入转换为蓝图输出
   * @param {object} input - { confirmedRequirement, taskType, complexity?, context? }
   * @returns {Promise<object>} 成功：{ blueprintForm, outputPath, documents, summary }；失败：{ success: false, error: { code, message } }
   */
  async convert(input) {
    const validation = this.validator.validate(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const { confirmedRequirement, taskType, complexity = DEFAULT_COMPLEXITY, context } = input;
    const normalizedTaskType = taskType.trim().toLowerCase();

    const selection = this.selector.select(normalizedTaskType);
    if (selection.error) {
      return { success: false, error: selection.error };
    }

    const blueprintForm = selection.form;
    const documents = this.documentGenerator.getDocuments(blueprintForm);
    const outputPath = this.pathResolver.resolve(confirmedRequirement, blueprintForm);
    const summary = this._buildSummary(blueprintForm, outputPath, documents.length);

    return {
      success: true,
      blueprintForm,
      outputPath,
      documents,
      summary,
      _meta: { taskType: normalizedTaskType, complexity, hasContext: !!context },
    };
  }

  /**
   * 同步版 convert，便于无 async 环境调用
   * @param {object} input
   * @returns {object}
   */
  convertSync(input) {
    const validation = this.validator.validate(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const { confirmedRequirement, taskType } = input;
    const normalizedTaskType = (taskType || '').trim().toLowerCase();
    const selection = this.selector.select(normalizedTaskType);
    if (selection.error) {
      return { success: false, error: selection.error };
    }

    const blueprintForm = selection.form;
    const documents = this.documentGenerator.getDocuments(blueprintForm);
    const outputPath = this.pathResolver.resolve(confirmedRequirement, blueprintForm);
    const summary = this._buildSummary(blueprintForm, outputPath, documents.length);

    return {
      success: true,
      blueprintForm,
      outputPath,
      documents,
      summary,
    };
  }
}

// --- 单例与导出 ---
const converter = new BlueprintConverter();

module.exports = {
  BlueprintConverter,
  InputValidator,
  BlueprintSelector,
  DocumentGenerator,
  PathResolver,
  converter,
  errors: {
    BLUEPRINT_INVALID_INPUT,
    BLUEPRINT_UNKNOWN_FORM,
    BLUEPRINT_PATH_ERROR,
  },
  constants: {
    TASK_TYPES,
    COMPLEXITY_LEVELS,
    DEFAULT_COMPLEXITY,
    DEFAULT_BASE_PATH,
  },
};
