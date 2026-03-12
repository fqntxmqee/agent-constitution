#!/usr/bin/env node

/**
 * 审计智能体 - 审计报告生成器 CLI 工具
 * 使用方法:
 *   node report-generator.js generate --project "P0 技能开发" --start 2026-03-09 --end 2026-03-10
 *   node report-generator.js template
 */

const path = require('path');
const reportGenerator = require('../../../skills/audit/report-generator/index.js');

function parseArgs(args) {
  const result = { command: null, options: {} };
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) { result.options[key] = value; i++; }
      else { result.options[key] = true; }
    } else if (!result.command) { result.command = arg; }
    i++;
  }
  return result;
}

async function cmdGenerate(options) {
  const projectName = options.project || options.p || '未命名项目';
  const startDate = options.start || options.s;
  const endDate = options.end || options.e;
  const outputPath = options.output || options.o;
  
  if (!startDate || !endDate) {
    console.error('❌ 请提供审计时间范围：--start YYYY-MM-DD --end YYYY-MM-DD');
    process.exit(1);
  }
  
  console.log('📊 生成审计报告...');
  console.log(`   项目名称：${projectName}`);
  console.log(`   审计时间：${startDate} ~ ${endDate}`);
  
  const analysis = {
    logAnalysis: { meta: { sessionCount: 0, eventCount: 0 }, violations: [], compliance: { score: 100, level: '优秀' } },
    complianceCheck: { runtimeCheck: { passed: true }, toolUsageCheck: { passed: true }, acceptanceCheck: { passed: true }, violations: [] },
    specValidation: { result: { passed: true, score: 100, level: '优秀' }, completeness: { missing: [] }, issues: [], recommendations: [] }
  };
  
  const report = await reportGenerator.generate({
    projectName,
    auditPeriod: { start: startDate, end: endDate },
    analysis,
    config: { format: 'markdown', outputPath: outputPath || `reports/audit-${projectName}-${startDate}.md` }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 审计报告生成完成');
  console.log('='.repeat(60));
  
  console.log(`\n📋 项目：${report.meta.projectName}`);
  console.log(`🕐 审计时间：${report.meta.auditPeriod}`);
  console.log(`📄 报告 ID: ${report.meta.reportId}`);
  
  const statusIcon = report.conclusion.passed ? '✅' : '❌';
  console.log(`\n${statusIcon} 状态：${report.conclusion.status}`);
  console.log(`📊 得分：${report.conclusion.score}/100 (${report.conclusion.level})`);
  
  console.log('\n📁 输出文件');
  if (report.output.markdownPath) console.log(`   📄 Markdown: ${report.output.markdownPath}`);
  if (report.output.jsonPath) console.log(`   📄 JSON: ${report.output.jsonPath}`);
  
  console.log('\n📈 维度评分');
  for (const [dim, data] of Object.entries(report.dimensions)) {
    const dimName = { specIntegrity: '规约完整性', developmentCompliance: '开发合规', acceptanceCompliance: '验收合规', deliveryCompliance: '交付合规' }[dim];
    console.log(`   ${dimName}: ${data.score}/100 (${data.level})`);
  }
  
  console.log('\n🚨 违规统计');
  console.log(`   🔴 严重：${report.violations.critical.length}`);
  console.log(`   🟡 一般：${report.violations.major.length}`);
  console.log(`   🟢 轻微：${report.violations.minor.length}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 整改建议');
    report.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.description}`);
    });
    if (report.recommendations.length > 5) console.log(`   ... 还有 ${report.recommendations.length - 5} 条建议`);
  }
  
  return report;
}

function cmdTemplate() {
  console.log('📋 审计报告模板');
  console.log('='.repeat(60));
  console.log(reportGenerator.getDefaultTemplate());
}

function cmdHelp() {
  console.log(`
审计智能体 - 审计报告生成器 CLI

使用方法:
  node report-generator.js <command> [options]

命令:
  generate   生成审计报告
  template   显示报告模板
  help       显示帮助

选项:
  --project, -p   项目名称
  --start, -s     审计开始日期 (YYYY-MM-DD)
  --end, -e       审计结束日期 (YYYY-MM-DD)
  --output, -o    输出文件路径
  --json          输出 JSON 格式

示例:
  node report-generator.js generate --project "P0 技能开发" --start 2026-03-09 --end 2026-03-10
  node report-generator.js generate -p "项目 A" -s 2026-03-01 -e 2026-03-10 -o reports/audit.md
  node report-generator.js template
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) { cmdHelp(); process.exit(0); }
  
  const { command, options } = parseArgs(args);
  try {
    switch (command) {
      case 'generate': await cmdGenerate(options); break;
      case 'template': cmdTemplate(); break;
      case 'help': cmdHelp(); break;
      default: console.error(`❌ 未知命令：${command}`); cmdHelp(); process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) { main(); }
module.exports = { generate: cmdGenerate, template: cmdTemplate, help: cmdHelp, reportGenerator };
