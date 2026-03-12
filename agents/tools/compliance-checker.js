#!/usr/bin/env node

/**
 * 审计智能体 - 合规检查器 CLI 工具
 * 使用方法:
 *   node compliance-checker.js check --logs "~/.openclaw/agents/x/sessions/x.jsonl" --spec openspec/changes/skill-04/
 *   node compliance-checker.js rules
 * 注：x 为通配符
 */

const path = require('path');
const complianceChecker = require('../../../skills/audit/compliance-checker/index.js');

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

async function cmdCheck(options) {
  const sessionLogs = (options.logs || options.l || '~/.openclaw/agents/*/sessions/*.jsonl').split(',');
  const specPath = options.spec || options.s;
  
  console.log('🔍 开始合规检查...');
  console.log(`   会话日志：${sessionLogs.join(', ')}`);
  console.log(`   规约目录：${specPath || '未指定'}`);
  
  const result = await complianceChecker.check({
    target: { sessionLogs, specPath },
    config: {
      doCheckRuntime: options.runtime !== 'false',
      doCheckToolUsage: options.tool !== 'false',
      doCheckTaskOrder: options.task !== 'false',
      doCheckUserConfirmation: options.confirm !== 'false'
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 合规检查结果');
  console.log('='.repeat(60));
  
  const statusIcon = result.result.passed ? '✅' : '❌';
  console.log(`\n${statusIcon} 状态：${result.result.passed ? '通过' : '不通过'}`);
  console.log(`📊 得分：${result.result.score}/100 (${result.result.level})`);
  console.log(`🔴 严重：${result.violations.filter(v => v.level === '严重').length}`);
  console.log(`🟡 一般：${result.violations.filter(v => v.level === '一般').length}`);
  console.log(`🟢 轻微：${result.violations.filter(v => v.level === '轻微').length}`);
  
  if (result.violations.length > 0) {
    console.log('\n🚨 违规清单:');
    result.violations.forEach((v, i) => {
      console.log(`  ${i + 1}. [${v.level}] ${v.ruleId}: ${v.name}`);
      console.log(`     ${v.description}`);
      console.log(`     建议：${v.suggestion}`);
    });
  }
  
  if (result.recommendations.length > 0) {
    console.log('\n💡 整改建议:');
    result.recommendations.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢'}] ${r.description}`);
      console.log(`     期限：${r.deadline}`);
    });
  }
  
  if (options.json) {
    console.log('\n📄 JSON 输出:');
    console.log(JSON.stringify(result, null, 2));
  }
  
  return result;
}

function cmdRules() {
  console.log('📋 合规检查规则');
  console.log('='.repeat(60));
  const rules = complianceChecker.getDefaultRules();
  rules.forEach(r => {
    const icon = r.level === '严重' ? '🔴' : r.level === '一般' ? '🟡' : '🟢';
    console.log(`\n${icon} ${r.id}: ${r.name}`);
    console.log(`   等级：${r.level}`);
    console.log(`   说明：${r.description}`);
    console.log(`   建议：${r.suggestion}`);
  });
}

function cmdHelp() {
  console.log(`
审计智能体 - 合规检查器 CLI

使用方法:
  node compliance-checker.js <command> [options]

命令:
  check    执行合规检查
  rules    显示检查规则
  help     显示帮助

选项:
  --logs, -l     会话日志路径 (逗号分隔)
  --spec, -s     规约目录路径
  --runtime      是否检查 runtime (默认 true)
  --tool         是否检查工具使用 (默认 true)
  --task         是否检查任务顺序 (默认 true)
  --confirm      是否检查用户确认 (默认 true)
  --json         输出 JSON 格式

示例:
  node compliance-checker.js check --logs ~/.openclaw/agents/*/sessions/*.jsonl --spec openspec/changes/skill-04/
  node compliance-checker.js rules
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) { cmdHelp(); process.exit(0); }
  
  const { command, options } = parseArgs(args);
  try {
    switch (command) {
      case 'check': await cmdCheck(options); break;
      case 'rules': cmdRules(); break;
      case 'help': cmdHelp(); break;
      default: console.error(`❌ 未知命令：${command}`); cmdHelp(); process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) { main(); }
module.exports = { check: cmdCheck, rules: cmdRules, help: cmdHelp, complianceChecker };
