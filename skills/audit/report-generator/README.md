# Skill-A04: 审计报告生成器 (Audit Report Generator)

审计智能体核心技能，用于汇总分析结果、生成标准化审计报告。

---

## 🚀 快速开始

### 安装

无需安装，纯 Node.js 实现，无外部依赖。

```bash
cd agents/skills/audit/report-generator
```

### 基本用法

```javascript
const reportGenerator = require('./report-generator');

const report = await reportGenerator.generate({
  projectName: 'P0 技能开发',
  auditPeriod: { start: '2026-03-09', end: '2026-03-10' },
  analysis: {
    logAnalysis: {...},
    complianceCheck: {...},
    specValidation: {...}
  },
  config: {
    format: 'markdown',
    outputPath: 'reports/audit-2026-03-10.md'
  }
});

console.log('报告生成完成:', report.output.markdownPath);
```

---

## 📋 API 参考

### `generate(params)`

生成完整审计报告。

**参数:**
```javascript
{
  projectName: string,
  auditPeriod: { start: string, end: string },
  analysis: { logAnalysis, complianceCheck, specValidation },
  config: { format, outputPath, syncFeishu }
}
```

**返回:**
```javascript
{
  meta: { reportId, generatedAt, projectName, auditPeriod },
  conclusion: { passed, score, level, summary, status },
  dimensions: { specIntegrity, developmentCompliance, acceptanceCompliance, deliveryCompliance },
  violations: { critical, major, minor },
  recommendations: [{ priority, category, description, deadline }],
  output: { markdownPath, jsonPath, feishuDocId }
}
```

### `generateFromTemplate(template, data)`

从自定义模板生成报告。

### `saveReport(report, outputPath, format)`

保存报告到文件。

### `getDefaultTemplate()`

获取默认报告模板。

### `mergeViolations(analysis)`

合并多源违规数据。

### `generateRecommendations(violations, analysis)`

生成整改建议。

### `calculateDimensionScores(analysis)`

计算各维度得分。

### `calculateOverallScore(dimensions)`

计算综合得分。

### `getLevelByScore(score)`

根据得分确定等级。

---

## 🔧 CLI 工具

```bash
# 生成报告
node agents/constitution/audit/tools/report-generator.js generate \
  --project "P0 技能开发" \
  --start 2026-03-09 \
  --end 2026-03-10 \
  --output reports/audit.md

# 查看模板
node agents/constitution/audit/tools/report-generator.js template
```

---

## 📊 评分维度

| 维度 | 权重 | 说明 | 来源 |
|------|------|------|------|
| 规约完整性 | 25% | OpenSpec 文档完整性 | Skill-A03 |
| 开发合规 | 30% | runtime、工具使用 | Skill-A02 + A01 |
| 验收合规 | 25% | 验收流程执行 | Skill-A02 |
| 交付合规 | 20% | 交付规范执行 | Skill-A01 + A02 |

---

## 📈 等级标准

| 得分 | 等级 | 说明 |
|------|------|------|
| 90-100 | 优秀 | 完全符合 V3.7 规范 |
| 75-89 | 良好 | 基本符合，少量问题 |
| 60-74 | 待改进 | 多处问题，需整改 |
| 0-59 | 严重 | 严重违规，必须重做 |

---

## ✅ 测试

```bash
node test.js
```

**测试覆盖率:** 100%

---

## 📁 文件结构

```
report-generator/
├── SKILL.md           # 技能规约
├── README.md          # 使用文档
├── index.js           # 核心实现
├── test.js            # 单元测试 (100% 覆盖)
└── tools/
    └── report-generator.js  # CLI 工具
```

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块
- **模板引擎**: 简单字符串替换
- **飞书集成**: 通过 feishu_doc 工具
- **性能要求**: 报告生成 <5 秒

---

## 📚 相关文档

- [SKILL.md](./SKILL.md) - 技能规约
- [宪法规范 V3.7](../../../../agents/docs/specs/constitution/CONSTITUTION_V3.7.md)
- [Skill-A01 日志分析器](../skill-a01-log-analyzer/)
- [Skill-A02 合规检查器](../compliance-checker/)
- [Skill-A03 规约验证器](../skill-a03-spec-validator/)

---

*版本*: 1.0  
*创建日期*: 2026-03-10  
*维护者*: 审计智能体
