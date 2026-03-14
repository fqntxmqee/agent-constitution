/**
 * Skill-07: 验收测试智能体 (Acceptance Tester)
 * 核心实现：AC 提取、逐项验证、报告生成、质量门禁
 * Node.js 18+，无外部依赖（仅 fs/path）
 */

const fs = require('fs');
const path = require('path');

// --- 错误码 ---
const ERRORS = {
  ACCEPTANCE_INVALID_INPUT: 'ACCEPTANCE_INVALID_INPUT',
  ACCEPTANCE_EXTRACTION_FAILED: 'ACCEPTANCE_EXTRACTION_FAILED',
  ACCEPTANCE_VALIDATION_ERROR: 'ACCEPTANCE_VALIDATION_ERROR',
  ACCEPTANCE_REPORT_FAILED: 'ACCEPTANCE_REPORT_FAILED',
  ACCEPTANCE_QUALITY_GATE_ERROR: 'ACCEPTANCE_QUALITY_GATE_ERROR',
};

/**
 * 自定义错误，带 code 与 message
 */
class AcceptanceError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'AcceptanceError';
    this.code = code;
    this.details = details;
  }
}

/**
 * AC 提取器：从蓝图中提取验收标准（AC）
 * - 若 blueprint.acList 存在则直接使用并标准化
 * - 否则从 blueprint.path 下文档（如 specs/requirements.md）解析
 */
class ACExtractor {
  /**
   * @param {{ path: string, documents?: Array<{file: string, purpose?: string}>, acList?: Array<{id: string, description: string, verification?: string}> }} blueprint
   * @returns {Array<{ id: string, description: string, verification: string }>}
   */
  extract(blueprint) {
    if (blueprint.acList && Array.isArray(blueprint.acList) && blueprint.acList.length > 0) {
      return this._normalizeAcList(blueprint.acList);
    }
    if (!blueprint.path || typeof blueprint.path !== 'string') {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_EXTRACTION_FAILED, 'Blueprint path is required when acList is not provided');
    }
    const basePath = path.isAbsolute(blueprint.path) ? blueprint.path : path.resolve(process.cwd(), blueprint.path);
    const documents = blueprint.documents || [
      { file: 'specs/requirements.md', purpose: '需求规格与验收条件' },
      { file: 'tasks.md', purpose: '任务列表' },
    ];
    const acList = this._extractFromDocuments(basePath, documents);
    if (!acList.length) {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_EXTRACTION_FAILED, 'No AC found in blueprint documents', { path: basePath });
    }
    return acList;
  }

  _normalizeAcList(acList) {
    return acList.map((ac) => ({
      id: String(ac.id || ac.acId || ''),
      description: String(ac.description || ''),
      verification: String(ac.verification || ac.description || ''),
    })).filter((ac) => ac.id && ac.description);
  }

  _extractFromDocuments(basePath, documents) {
    const seen = new Set();
    const result = [];
    for (const doc of documents) {
      const filePath = path.join(basePath, doc.file);
      if (!fs.existsSync(filePath)) continue;
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const extracted = this._parseAcFromMarkdown(content);
        for (const ac of extracted) {
          if (ac.id && !seen.has(ac.id)) {
            seen.add(ac.id);
            result.push(ac);
          }
        }
      } catch (_) {
        // 单文件读失败不抛，继续下一个
      }
    }
    return result;
  }

  /**
   * 从 Markdown 文本解析 AC：支持 - [ ] AC-1: ... / ### AC-1 / **AC-1** / AC-N 格式
   */
  _parseAcFromMarkdown(content) {
    const result = [];
    const idPattern = /(?:AC[-_]?\d+|验收标准\s*[-_]?\d+)/gi;
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^[-*]\s*\[[\sx]\]\s*(AC[-_]?\d+)\s*[:：]\s*(.+)$/i)
        || line.match(/^#+\s*(AC[-_]?\d+)\s*[:：]?\s*(.+)$/i)
        || line.match(/^\*\*(AC[-_]?\d+)\*\*\s*[:：]\s*(.+)$/i)
        || line.match(/^(AC[-_]?\d+)\s*[:：]\s*(.+)$/i);
      if (match) {
        const id = match[1].toUpperCase().replace(/_/g, '-');
        let description = match[2].trim();
        let verification = description;
        const nextLine = lines[i + 1];
        if (nextLine && /^\s*(验证|verification|检查)/i.test(nextLine)) {
          verification = nextLine.replace(/^\s*(验证|verification|检查)\s*[:：]?\s*/i, '').trim();
        }
        result.push({ id, description, verification });
      }
    }
    // 兜底：整段中出现的 AC-N 作为简单 AC
    const ids = [...new Set(content.match(idPattern) || [])];
    for (const rawId of ids) {
      const id = rawId.toUpperCase().replace(/_/g, '-');
      if (result.some((r) => r.id === id)) continue;
      const regex = new RegExp(id.replace(/[-]/g, '[-_]?') + '\\s*[:：]?\\s*([^\\n]+)', 'i');
      const descMatch = content.match(regex);
      result.push({
        id,
        description: descMatch ? descMatch[1].trim() : id,
        verification: descMatch ? descMatch[1].trim() : id,
      });
    }
    return result;
  }
}

/**
 * AC 验证器：逐项验证 AC 完成情况
 * 结合 deliverables 与 executionResults 判定 pass/fail，并记录 evidence/comment
 */
class ACValidator {
  /**
   * @param {Array<{ id: string, description: string, verification: string }>} acList
   * @param {{ code?: string[], codePaths?: string[], docs?: string[], docPaths?: string[], artifacts?: string[] }} deliverables
   * @param {{ summary?: string, selfCheck?: boolean, selfReviewPassed?: boolean, tasksCompleted?: string[] }} executionResults
   * @returns {Array<{ acId: string, description: string, status: 'pass'|'fail', evidence: string, comment?: string }>}
   */
  validate(acList, deliverables, executionResults = {}) {
    const codePaths = deliverables.codePaths || deliverables.code || [];
    const docPaths = deliverables.docPaths || deliverables.docs || [];
    const artifacts = deliverables.artifacts || [];
    const allPaths = [...codePaths, ...docPaths, ...artifacts].filter(Boolean);
    const selfPassed = executionResults.selfCheck === true || executionResults.selfReviewPassed === true;

    return acList.map((ac) => {
      const { status, evidence, comment } = this._verifyOne(ac, allPaths, deliverables, executionResults, selfPassed);
      return {
        acId: ac.id,
        description: ac.description,
        status,
        evidence,
        comment: comment || undefined,
      };
    });
  }

  _verifyOne(ac, allPaths, deliverables, executionResults, selfPassed) {
    const ver = (ac.verification || ac.description || '').toLowerCase();
    const desc = (ac.description || '').toLowerCase();

    // 1) 验证要求提到「文件存在」或具体路径
    const fileRef = this._extractFileRef(ver + ' ' + desc);
    if (fileRef) {
      const resolved = this._resolvePath(fileRef, deliverables);
      const exists = resolved && fs.existsSync(resolved);
      return {
        status: exists ? 'pass' : 'fail',
        evidence: exists ? `File exists: ${resolved}` : `File not found: ${fileRef}`,
        comment: exists ? undefined : 'Required file or path not found',
      };
    }

    // 2) 验证要求「内容包含」某关键字
    const contentKeyword = this._extractContentKeyword(ver);
    if (contentKeyword) {
      const found = this._searchInDeliverables(contentKeyword, deliverables);
      return {
        status: found.found ? 'pass' : 'fail',
        evidence: found.evidence,
        comment: found.found ? undefined : 'Expected content not found in deliverables',
      };
    }

    // 3) 无具体验证方式：根据交付物存在性 + 执行自查
    if (allPaths.length === 0) {
      return {
        status: 'fail',
        evidence: 'No deliverables provided for verification',
        comment: 'Cannot verify AC without deliverables',
      };
    }
    const anyExists = allPaths.some((p) => {
      try {
        return fs.existsSync(path.resolve(process.cwd(), p));
      } catch {
        return false;
      }
    });
    if (!anyExists) {
      return {
        status: 'fail',
        evidence: 'None of the listed deliverable paths exist',
        comment: 'Deliverables paths are missing or invalid',
      };
    }
    return {
      status: selfPassed ? 'pass' : 'fail',
      evidence: selfPassed
        ? `Deliverables present; execution self-check passed`
        : `Deliverables present (${allPaths.length} path(s)); self-check not passed or missing`,
      comment: selfPassed ? undefined : 'Execution self-check not passed or not provided',
    };
  }

  _extractFileRef(text) {
    const m = text.match(/(?:文件|path|file)\s*[:：]?\s*([^\s,，]+)/i)
      || text.match(/(?:存在|exist)\s+([^\s,，]+)/i)
      || text.match(/[\w./-]+\.(?:md|tsx?|jsx?|json|yaml|yml)(?=\s|$)/);
    return m ? m[1].trim() : null;
  }

  _extractContentKeyword(text) {
    const m = text.match(/(?:包含|contain|content)\s*[:：]?\s*["']?([^"'\s,，]+)/i);
    return m ? m[1].trim() : null;
  }

  _resolvePath(fileRef, deliverables) {
    const codePaths = deliverables.codePaths || deliverables.code || [];
    const docPaths = deliverables.docPaths || deliverables.docs || [];
    const all = [...codePaths, ...docPaths, deliverables.artifacts || []].flat().filter(Boolean);
    const base = process.cwd();
    if (path.isAbsolute(fileRef) && fs.existsSync(fileRef)) return fileRef;
    const asIs = path.join(base, fileRef);
    if (fs.existsSync(asIs)) return asIs;
    const name = path.basename(fileRef);
    for (const p of all) {
      const full = path.isAbsolute(p) ? p : path.join(base, p);
      if (path.basename(full) === name && fs.existsSync(full)) return full;
      if (fs.existsSync(full) && full.endsWith(fileRef)) return full;
    }
    return null;
  }

  _searchInDeliverables(keyword, deliverables) {
    const codePaths = deliverables.codePaths || deliverables.code || [];
    const docPaths = deliverables.docPaths || deliverables.docs || [];
    const all = [...codePaths, ...docPaths].filter(Boolean);
    const base = process.cwd();
    for (const p of all) {
      const full = path.isAbsolute(p) ? p : path.join(base, p);
      if (!fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes(keyword)) {
          return { found: true, evidence: `Keyword "${keyword}" found in ${p}` };
        }
      } catch (_) {}
    }
    return { found: false, evidence: `Keyword "${keyword}" not found in deliverables` };
  }
}

/**
 * 测试报告生成器：生成完整 Markdown 报告
 */
class ReportGenerator {
  /**
   * @param {string} overallStatus
   * @param {Array<{ acId: string, description: string, status: string, evidence: string, comment?: string }>} acResults
   * @param {string[]} recommendations
   * @param {{ verifiedAt: string, acTotal: number, acPassed: number, acFailed: number }} metadata
   * @returns {string}
   */
  generate(overallStatus, acResults, recommendations, metadata) {
    const lines = [
      '# 验收测试报告',
      '',
      `**总体结论**: ${overallStatus === 'pass' ? '✅ 通过' : '❌ 不通过'}`,
      `**验证时间**: ${metadata.verifiedAt}`,
      `**AC 统计**: 共 ${metadata.acTotal} 条，通过 ${metadata.acPassed} 条，失败 ${metadata.acFailed} 条`,
      '',
      '## 逐项 AC 结果',
      '',
      '| AC ID | 描述 | 状态 | 证据 | 备注 |',
      '|-------|------|------|------|------|',
    ];
    for (const r of acResults) {
      const statusStr = r.status === 'pass' ? '✅ pass' : '❌ fail';
      const evidence = (r.evidence || '').replace(/\|/g, '\\|').slice(0, 80);
      const comment = (r.comment || '').replace(/\|/g, '\\|').slice(0, 40);
      lines.push(`| ${r.acId} | ${(r.description || '').slice(0, 50)} | ${statusStr} | ${evidence} | ${comment} |`);
    }
    lines.push('', '## 改进建议', '');
    if (recommendations.length > 0) {
      recommendations.forEach((rec) => lines.push(`- ${rec}`));
    } else {
      lines.push('- 无');
    }
    lines.push('', '---', '');
    return lines.join('\n');
  }
}

/**
 * 质量门禁检查器：判定 overallStatus 与遗漏 AC
 */
class QualityGate {
  /**
   * @param {Array<{ id: string }>} acList 蓝图中的 AC 列表
   * @param {Array<{ acId: string, status: string }>} acResults 验证结果
   * @returns {{ overallStatus: 'pass'|'fail', acTotal: number, acPassed: number, acFailed: number }}
   */
  evaluate(acList, acResults) {
    const acTotal = acResults.length;
    const acPassed = acResults.filter((r) => r.status === 'pass').length;
    const acFailed = acTotal - acPassed;
    const allPassed = acFailed === 0 && acTotal > 0;
    const noMissing = acList.length === acResults.length;
    const overallStatus = allPassed && noMissing ? 'pass' : 'fail';
    return { overallStatus, acTotal, acPassed, acFailed };
  }
}

/**
 * 验收测试主类：串联 AC 提取、验证、报告、质量门禁
 */
class AcceptanceTester {
  constructor() {
    this.acExtractor = new ACExtractor();
    this.acValidator = new ACValidator();
    this.reportGenerator = new ReportGenerator();
    this.qualityGate = new QualityGate();
  }

  /**
   * 主入口
   * @param {{
   *   blueprint: { path?: string, documents?: Array<{file: string, purpose?: string}>, acList?: Array<{id: string, description: string, verification?: string}> },
   *   deliverables?: { code?: string[], codePaths?: string[], docs?: string[], docPaths?: string[], artifacts?: string[] },
   *   executionResults?: { summary?: string, selfCheck?: boolean, selfReviewPassed?: boolean }
   * }} input
   * @returns {Promise<{
   *   overallStatus: 'pass'|'fail',
   *   acResults: Array<{ acId: string, description: string, status: 'pass'|'fail', evidence: string, comment?: string }>,
   *   report: string,
   *   recommendations: string[],
   *   metadata: { verifiedAt: string, acTotal: number, acPassed: number, acFailed: number }
   * }>}
   */
  async test(input) {
    if (!input || typeof input !== 'object') {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_INVALID_INPUT, 'Input must be a non-null object');
    }
    const { blueprint, deliverables, executionResults = {} } = input;
    if (!blueprint || typeof blueprint !== 'object') {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_INVALID_INPUT, 'blueprint is required');
    }
    if (deliverables === undefined || deliverables === null) {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_INVALID_INPUT, 'deliverables is required');
    }
    const safeDeliverables = typeof deliverables === 'object' ? deliverables : {};
    if (!blueprint.acList && (!blueprint.path || typeof blueprint.path !== 'string')) {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_INVALID_INPUT, 'blueprint must have either acList or path');
    }

    let acList;
    try {
      acList = this.acExtractor.extract(blueprint);
    } catch (e) {
      if (e instanceof AcceptanceError) throw e;
      throw new AcceptanceError(ERRORS.ACCEPTANCE_EXTRACTION_FAILED, e.message, { cause: e });
    }

    let acResults;
    try {
      acResults = this.acValidator.validate(acList, safeDeliverables, executionResults);
    } catch (e) {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_VALIDATION_ERROR, e.message, { cause: e });
    }

    const { overallStatus, acTotal, acPassed, acFailed } = this.qualityGate.evaluate(acList, acResults);
    const verifiedAt = new Date().toISOString();
    const metadata = { verifiedAt, acTotal, acPassed, acFailed };

    const recommendations = this._buildRecommendations(acResults, overallStatus, safeDeliverables);
    let report;
    try {
      report = this.reportGenerator.generate(overallStatus, acResults, recommendations, metadata);
    } catch (e) {
      throw new AcceptanceError(ERRORS.ACCEPTANCE_REPORT_FAILED, e.message, { cause: e });
    }

    return {
      overallStatus,
      acResults,
      report,
      recommendations,
      metadata,
    };
  }

  _buildRecommendations(acResults, overallStatus, deliverables) {
    const list = [];
    const failed = acResults.filter((r) => r.status === 'fail');
    if (failed.length > 0) {
      list.push(`共 ${failed.length} 条 AC 未通过，请根据 evidence/comment 补充交付物或修正实现。`);
      failed.slice(0, 3).forEach((r) => {
        list.push(`[${r.acId}] ${r.comment || r.evidence}`);
      });
    }
    const codePaths = deliverables.codePaths || deliverables.code || [];
    const docPaths = deliverables.docPaths || deliverables.docs || [];
    if (codePaths.length === 0 && docPaths.length === 0) {
      list.push('建议提供明确的 code/docs 交付物路径，便于逐项 AC 验证。');
    }
    if (overallStatus === 'pass' && list.length === 0) {
      list.push('所有 AC 已通过，建议补充单元测试与文档以保持可维护性。');
    }
    return list;
  }
}

// 单例导出
const tester = new AcceptanceTester();

module.exports = {
  AcceptanceTester,
  ACExtractor,
  ACValidator,
  ReportGenerator,
  QualityGate,
  AcceptanceError,
  ERRORS,
  tester,
};
