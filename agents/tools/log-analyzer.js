#!/usr/bin/env node

/**
 * 审计智能体 - 日志分析器 CLI 工具
 * 
 * 用于审计智能体分析 OpenClaw 会话日志，检测违规操作
 * 
 * 使用方法:
 *   node log-analyzer.js analyze --sessions "~/.openclaw/agents/x/sessions/x.jsonl"
 *   node log-analyzer.js violations --sessions "~/.openclaw/agents/cursor/sessions/x.jsonl"
 *   node log-analyzer.js rules
 * 
 * 注：x 为通配符，支持 glob 模式
 */

const path = require('path');
const fs = require('fs');

// 导入日志分析器核心
const logAnalyzer = require('../../../skills/audit/skill-a01-log-analyzer/index.js');

// ============================================================================
// CLI 参数解析
// ============================================================================

function parseArgs(args) {
  const result = {
    command: null,
    options: {}
  };
  
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        result.options[key] = value;
        i++;
      } else {
        result.options[key] = true;
      }
    } else if (!result.command) {
      result.command = arg;
    }
    i++;
  }
  
  return result;
}

// ============================================================================
// 命令处理
// ============================================================================

async function cmdAnalyze(options) {
  const sessionPaths = options.sessions 
    ? options.sessions.split(',') 
    : ['~/.openclaw/agents/*/sessions/*.jsonl'];
  
  console.log('🔍 开始分析会话日志...');
  console.log(`   会话路径：${sessionPaths.join(', ')}`);
  
  const config = {};
  
  if (options.eventTypes) {
    config.eventTypes = options.eventTypes.split(',');
  }
  
  if (options.startTime && options.endTime) {
    config.timeRange = {
      start: parseInt(options.startTime),
      end: parseInt(options.endTime)
    };
  }
  
  const result = await logAnalyzer.analyze({
    sessionPaths,
    config
  });
  
  // 输出结果
  console.log('\n📊 分析结果');
  console.log('='.repeat(60));
  console.log(`  分析时间：${result.meta.analyzedAt}`);
  console.log(`  会话数量：${result.meta.sessionCount}`);
  console.log(`  事件数量：${result.meta.eventCount}`);
  
  if (result.meta.timeRange) {
    console.log(`  时间范围：${new Date(result.meta.timeRange.start).toISOString()} - ${new Date(result.meta.timeRange.end).toISOString()}`);
  }
  
  console.log('\n📈 事件统计');
  console.log('  按类型:');
  for (const [type, count] of Object.entries(result.statistics.byType)) {
    console.log(`    ${type}: ${count}`);
  }
  console.log('  按工具:');
  for (const [tool, count] of Object.entries(result.statistics.byTool)) {
    console.log(`    ${tool}: ${count}`);
  }
  
  console.log('\n🚨 违规检测');
  if (result.violations.length === 0) {
    console.log('  ✅ 未发现违规操作');
  } else {
    console.log(`  ⚠️  发现 ${result.violations.length} 个违规:`);
    for (const v of result.violations) {
      console.log(`    [${v.level}] ${v.ruleId}: ${v.name}`);
      console.log(`      会话：${v.sessionId}`);
      console.log(`      时间：${new Date(v.timestamp).toISOString()}`);
      console.log(`      建议：${v.recommendation}`);
    }
  }
  
  console.log('\n📋 合规评分');
  console.log(`  总分：${result.compliance.score}/100 (${result.compliance.level})`);
  console.log('  细项:');
  for (const [item, score] of Object.entries(result.compliance.breakdown)) {
    console.log(`    ${item}: ${score}`);
  }
  
  // 输出 JSON 结果（可选）
  if (options.json) {
    console.log('\n📄 JSON 输出:');
    console.log(JSON.stringify(result, null, 2));
  }
  
  return result;
}

async function cmdViolations(options) {
  const sessionPaths = options.sessions 
    ? options.sessions.split(',') 
    : ['~/.openclaw/agents/*/sessions/*.jsonl'];
  
  console.log('🚨 检测违规操作...');
  
  const result = await logAnalyzer.detectViolations({
    sessionPaths
  });
  
  console.log('\n违规结果:');
  console.log('='.repeat(60));
  
  if (result.violations.length === 0) {
    console.log('✅ 未发现违规操作');
  } else {
    // 按等级分组
    const byLevel = {};
    for (const v of result.violations) {
      if (!byLevel[v.level]) {
        byLevel[v.level] = [];
      }
      byLevel[v.level].push(v);
    }
    
    for (const level of ['严重', '一般', '轻微']) {
      if (byLevel[level]) {
        console.log(`\n${level === '严重' ? '🔴' : level === '一般' ? '🟡' : '🟢'} ${level} (${byLevel[level].length}):`);
        for (const v of byLevel[level]) {
          console.log(`  - ${v.ruleId}: ${v.name}`);
          console.log(`    会话：${v.sessionId}`);
          console.log(`    ${v.description}`);
        }
      }
    }
  }
  
  console.log('\n合规评分:');
  console.log(`  ${result.compliance.score}/100 (${result.compliance.level})`);
  
  if (options.json) {
    console.log('\nJSON 输出:');
    console.log(JSON.stringify(result, null, 2));
  }
  
  return result;
}

function cmdRules() {
  console.log('📋 违规规则列表');
  console.log('='.repeat(60));
  
  const rules = logAnalyzer.getViolationRules();
  
  for (const rule of rules) {
    const icon = rule.level === '严重' ? '🔴' : rule.level === '一般' ? '🟡' : '🟢';
    console.log(`\n${icon} ${rule.id}: ${rule.name}`);
    console.log(`   等级：${rule.level}`);
    console.log(`   说明：${rule.description}`);
    console.log(`   建议：${rule.recommendation}`);
  }
}

async function cmdCheckPath(options) {
  if (!options.path) {
    console.error('❌ 请提供路径参数：--path /path/to/file');
    process.exit(1);
  }
  
  const result = logAnalyzer.checkPath(options.path);
  
  console.log(`路径：${options.path}`);
  console.log(`  业务代码：${result.isBusinessCode ? '是 🔴' : '否 ✅'}`);
  console.log(`  允许 write: ${result.isAllowed ? '是 ✅' : '否 🔴'}`);
}

// ============================================================================
// 主函数
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
审计智能体 - 日志分析器 CLI

使用方法:
  node log-analyzer.js <command> [options]

命令:
  analyze      分析会话日志（完整分析）
  violations   仅检测违规操作
  rules        显示违规规则列表
  check-path   检查路径是否为业务代码

选项:
  --sessions   会话日志路径（逗号分隔，支持 glob）
  --eventTypes 事件类型过滤（逗号分隔：toolCall,message,thinking）
  --startTime  开始时间戳（ms）
  --endTime    结束时间戳（ms）
  --path       检查路径（check-path 命令使用）
  --json       输出 JSON 格式

示例:
  node log-analyzer.js analyze --sessions ~/.openclaw/agents/*/sessions/*.jsonl
  node log-analyzer.js violations --sessions ~/.openclaw/agents/cursor/sessions/*.jsonl
  node log-analyzer.js rules
  node log-analyzer.js check-path --path /src/main.js
`);
    process.exit(0);
  }
  
  const { command, options } = parseArgs(args);
  
  try {
    switch (command) {
      case 'analyze':
        await cmdAnalyze(options);
        break;
      case 'violations':
        await cmdViolations(options);
        break;
      case 'rules':
        cmdRules();
        break;
      case 'check-path':
        cmdCheckPath(options);
        break;
      default:
        console.error(`❌ 未知命令：${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行 CLI
if (require.main === module) {
  main();
}

// 导出供编程使用
module.exports = {
  analyze: cmdAnalyze,
  violations: cmdViolations,
  rules: cmdRules,
  checkPath: cmdCheckPath,
  logAnalyzer
};
