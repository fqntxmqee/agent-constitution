# Skill-A04: 审计报告生成器 (Audit Report Generator)

**版本**: 1.0  
**创建日期**: 2026-03-10  
**归属**: 审计智能体专用技能

---

## 🎯 定位

审计智能体的报告生成引擎，负责汇总日志分析、合规检查、规约验证结果，生成标准化审计报告。

---

## 📥 输入

### 输入参数

```javascript
{
  // 必填：审计项目名称
  projectName: string,
  
  // 必填：审计时间范围
  auditPeriod: {
    start: string,  // ISO 日期或时间戳
    end: string
  },
  
  // 可选：各子技能分析结果
  analysis: {
    logAnalysis: Object,      // Skill-A01 日志分析结果
    complianceCheck: Object,  // Skill-A02 合规检查结果
    specValidation: Object    // Skill-A03 规约验证结果
  },
  
  // 可选：报告配置
  config: {
    format: 'markdown' | 'json',
    outputPath: string,
    syncFeishu: boolean
  }
}
```

---

## 🔧 处理逻辑

### 1. 数据汇总

汇总三个子技能的分析结果：
- Skill-A01: 日志分析违规
- Skill-A02: 合规检查违规
- Skill-A03: 规约验证问题

### 2. 综合评分计算

| 维度 | 权重 | 来源 |
|------|------|------|
| 规约完整性 | 25% | Skill-A03 |
| 开发合规 | 30% | Skill-A02 + A01 |
| 验收合规 | 25% | Skill-A02 |
| 交付合规 | 20% | Skill-A01 + A02 |

### 3. 报告模板结构

```markdown
# 🔍 审计报告

## 审计结论
## 审计概览
## 违规清单
## 整改建议
## 详细分析
## 附录
```

---

## 📤 输出

```javascript
{
  meta: { reportId, generatedAt, projectName, auditPeriod },
  conclusion: { passed, score, level, summary },
  dimensions: { specIntegrity, developmentCompliance, acceptanceCompliance, deliveryCompliance },
  violations: { critical: [...], major: [...], minor: [...] },
  recommendations: [{ priority, description, deadline }],
  output: { markdownPath, jsonPath, feishuDocId }
}
```

---

## ✅ 验收标准

| AC | 标准 | 验证方式 |
|----|------|----------|
| AC1 | 支持汇总多源数据 | 单元测试 |
| AC2 | 正确计算综合得分 | 单元测试 |
| AC3 | 生成符合 V3.7 规范的报告 | 单元测试 |
| AC4 | 支持 Markdown 输出 | 单元测试 |
| AC5 | 支持 JSON 输出 | 单元测试 |
| AC6 | 违规清单分类正确 | 单元测试 |
| AC7 | 100% 测试覆盖率 | 运行测试 |
| AC8 | 无外部依赖 | 检查实现 |

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块
- **模板引擎**: 简单字符串替换
- **飞书集成**: 通过 feishu_doc 工具
- **性能要求**: 报告生成 <5 秒

---

## 📚 使用示例

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
```

---

## 🔗 相关文档

- 宪法规范 V3.7 第二章 §7（审计智能体）
- Skill-A01 日志分析器
- Skill-A02 合规检查器
- Skill-A03 规约验证器

---

*最后更新*: 2026-03-10  
*维护者*: 审计智能体
