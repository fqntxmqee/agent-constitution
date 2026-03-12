#!/usr/bin/env node

/**
 * 审计智能体 - 规约验证器 CLI 工具
 * 使用方法:
 *   node spec-validator.js validate --path openspec/changes/skill-04/
 *   node spec-validator.js check --path openspec/changes/skill-04/
 *   node spec-validator.js docs
 */

const path = require('path');
const specValidator = require('../../../skills/audit/spec-validator/index.js');

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

async function cmdValidate(options) {
  const specPath = options.path || options.p;
  if (!specPath) { console.error('❌ 请提供规约路径：--path <规约目录>'); process.exit(1); }
  
  console.log('🔍 开始验证规约...');
  console.log(`   规约路径：${specPath}`);
  
  const result = await specValidator.validate({
    specPath,
    config: {
      checkUserConfirmation: options.noUserConfirm !== true,
      checkAcceptanceCriteria: options.noACCheck !== true
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 验证报告');
  console.log('='.repeat(60));
  
  console.log(`\n📋 项目：${result.meta.projectName}`);
  console.log(`🕐 验证时间：${result.meta.validatedAt}`);
  
  const statusIcon = result.result.passed ? '✅' : '❌';
  console.log(`\n${statusIcon} 状态：${result.result.passed ? '通过' : '不通过'}`);
  console.log(`📊 得分：${result.result.score}/100 (${result.result.level})`);
  console.log(`🔴 严重问题：${result.result.criticalIssues}`);
  console.log(`🟡 警告：${result.result.warnings}`);
  
  console.log('\n📁 文档完整性');
  console.log('   必需文档:');
  result.completeness.required.forEach(doc => {
    console.log(`     ${doc.exists ? '✅' : '❌'} ${doc.name}`);
  });
  
  console.log('\n📝 格式验证');
  const formatDocs = ['proposal', 'requirements', 'design', 'tasks'];
  formatDocs.forEach(doc => {
    const data = result.formatValidation[doc];
    const passedChecks = data.checks.filter(c => c.passed).length;
    const totalChecks = data.checks.length;
    console.log(`   ${data.valid ? '✅' : '❌'} ${doc}: ${passedChecks}/${totalChecks} 检查通过`);
  });
  
  console.log('\n✅ 用户确认');
  console.log(`   意图确认：${result.userConfirmation.intentConfirmed ? '是 ✅' : '否 ❌'}`);
  console.log(`   蓝图确认：${result.userConfirmation.blueprintConfirmed ? '是 ✅' : '否 ❌'}`);
  console.log(`   部署确认：${result.userConfirmation.deploymentConfirmed ? '是 ✅' : '否 ❌'}`);
  
  console.log('\n📋 验收标准 (AC)');
  console.log(`   总数：${result.acceptanceCriteria.count}`);
  console.log(`   有效：${result.acceptanceCriteria.valid}`);
  console.log(`   无效：${result.acceptanceCriteria.invalid}`);
  
  if (result.issues.length > 0) {
    console.log('\n🚨 问题清单');
    const byLevel = { critical: [], warning: [], info: [] };
    result.issues.forEach(i => byLevel[i.level].push(i));
    
    if (byLevel.critical.length > 0) {
      console.log(`\n   🔴 严重 (${byLevel.critical.length}):`);
      byLevel.critical.forEach(i => console.log(`     - [${i.document}] ${i.message}`));
    }
    if (byLevel.warning.length > 0) {
      console.log(`\n   🟡 警告 (${byLevel.warning.length}):`);
      byLevel.warning.forEach(i => console.log(`     - [${i.document}] ${i.message}`));
    }
  }
  
  if (result.recommendations.length > 0) {
    console.log('\n💡 整改建议');
    result.recommendations.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
  }
  
  if (options.json) {
    console.log('\n📄 JSON 输出:');
    console.log(JSON.stringify(result, null, 2));
  }
  
  if (!result.result.passed) process.exit(1);
  return result;
}

async function cmdCheck(options) {
  const specPath = options.path || options.p;
  if (!specPath) { console.error('❌ 请提供规约路径：--path <规约目录>'); process.exit(1); }
  
  console.log('🔍 检查规约完整性...');
  const result = specValidator.checkCompleteness({ specPath });
  
  console.log('\n文档完整性:');
  console.log('='.repeat(60));
  console.log('\n必需文档:');
  let allPresent = true;
  result.required.forEach(doc => {
    console.log(`  ${doc.exists ? '✅' : '❌'} ${doc.name}`);
    if (!doc.exists) allPresent = false;
  });
  
  console.log('\n可选文档:');
  result.optional.forEach(doc => console.log(`  ${doc.exists ? '✅' : '⚠️'} ${doc.name}`));
  
  if (result.missing.length > 0) {
    console.log(`\n❌ 缺失 ${result.missing.length} 个必需文档:`);
    result.missing.forEach(doc => console.log(`   - ${doc}`));
  } else {
    console.log('\n✅ 所有必需文档完整');
  }
  return result;
}

function cmdDocs() {
  console.log('📋 OpenSpec 规约文档要求');
  console.log('='.repeat(60));
  console.log('\n🔴 必需文档:');
  specValidator.getRequiredDocs().forEach(doc => console.log(`   - ${doc}`));
  console.log('\n⚠️  可选文档:');
  specValidator.getOptionalDocs().forEach(doc => console.log(`   - ${doc}`));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`
审计智能体 - 规约验证器 CLI

使用方法:
  node spec-validator.js <command> [options]

命令:
  validate   完整验证规约（格式 + 完整性 + 用户确认 + AC）
  check      仅检查文档完整性
  docs       显示规约文档要求

选项:
  --path, -p       规约目录路径
  --noUserConfirm  跳过用户确认检查
  --noACCheck      跳过 AC 检查
  --json           输出 JSON 格式

示例:
  node spec-validator.js validate --path openspec/changes/skill-04/
  node spec-validator.js check --path openspec/changes/skill-04/
  node spec-validator.js docs
`);
    process.exit(0);
  }
  
  const { command, options } = parseArgs(args);
  try {
    switch (command) {
      case 'validate': await cmdValidate(options); break;
      case 'check': await cmdCheck(options); break;
      case 'docs': cmdDocs(); break;
      default: console.error(`❌ 未知命令：${command}`); process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) { main(); }
module.exports = { validate: cmdValidate, check: cmdCheck, docs: cmdDocs, specValidator };
