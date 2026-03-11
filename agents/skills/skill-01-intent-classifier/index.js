/**
 * Skill-01: 全域意图分类引擎
 * 
 * 功能：将用户请求分类为开发类/内容类/技能类/运维类
 * 归属：需求澄清智能体
 * 版本：1.0
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 模型配置（使用 OpenClaw 默认模型或显式指定）
  model: process.env.INTENT_CLASSIFIER_MODEL || 'default',
  
  // 置信度阈值
  confidenceThreshold: 0.7,
  
  // Prompt 路径
  promptPath: path.join(__dirname, 'prompts/intent-classification.txt')
};

/**
 * 加载 Prompt 模板
 */
function loadPrompt() {
  const promptContent = fs.readFileSync(CONFIG.promptPath, 'utf8');
  
  // 提取 System Prompt 部分
  const systemMatch = promptContent.match(/## System Prompt\n\n```\n([\s\S]*?)\n```/);
  const systemPrompt = systemMatch ? systemMatch[1] : '';
  
  return { systemPrompt, fullContent: promptContent };
}

/**
 * 构建 User Prompt
 */
function buildUserPrompt(input, context) {
  let userPrompt = `请对以下用户请求进行意图分类：\n\n用户请求：${input}`;
  
  if (context) {
    userPrompt += `\n\n当前上下文：${context}`;
  }
  
  userPrompt += '\n\n请输出 JSON 格式的分类结果。';
  
  return userPrompt;
}

/**
 * 解析 LLM 输出，提取 JSON
 */
function parseOutput(output) {
  try {
    // 尝试直接解析
    return JSON.parse(output);
  } catch (e) {
    // 尝试提取 JSON 块
    const jsonMatch = output.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // 尝试提取花括号内的内容
    const braceMatch = output.match(/{[\s\S]*}/);
    if (braceMatch) {
      return JSON.parse(braceMatch[0]);
    }
    
    throw new Error(`无法解析 LLM 输出：${output}`);
  }
}

/**
 * 验证分类结果
 */
function validateResult(result) {
  const validIntents = ['development', 'content', 'skill', 'operation'];
  const validRoutes = ['standard', 'fast'];
  const validComplexity = ['high', 'medium', 'low'];
  
  if (!validIntents.includes(result.primaryIntent)) {
    throw new Error(`无效的意图类别：${result.primaryIntent}`);
  }
  
  if (result.secondaryIntents && !Array.isArray(result.secondaryIntents)) {
    throw new Error('secondaryIntents 必须是数组');
  }
  
  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
    throw new Error(`无效的置信度：${result.confidence}`);
  }
  
  if (result.suggestedRoute && !validRoutes.includes(result.suggestedRoute)) {
    throw new Error(`无效的路由建议：${result.suggestedRoute}`);
  }
  
  if (result.complexity && !validComplexity.includes(result.complexity)) {
    throw new Error(`无效的复杂度：${result.complexity}`);
  }
  
  return true;
}

/**
 * 意图分类主函数
 * 
 * @param {string} input - 用户请求
 * @param {object} options - 可选配置
 * @param {string} options.context - 会话上下文
 * @param {string} options.model - 使用的模型
 * @returns {Promise<object>} 分类结果
 */
async function classifyIntent(input, options = {}) {
  const { systemPrompt } = loadPrompt();
  const userPrompt = buildUserPrompt(input, options.context);
  
  // 使用 OpenClaw 的 LLM 能力
  // 注意：实际使用时需要通过 OpenClaw 的工具调用
  const response = await callLLM({
    model: options.model || CONFIG.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });
  
  const result = parseOutput(response);
  validateResult(result);
  
  return result;
}

/**
 * 调用 LLM（占位函数，实际使用时替换为 OpenClaw 工具调用）
 */
async function callLLM(params) {
  // 这是一个占位实现
  // 实际使用时需要通过 OpenClaw 的 sessions_spawn 或直接调用模型
  
  console.warn('⚠️ callLLM 是占位函数，需要通过 OpenClaw 工具调用');
  
  // 示例：使用 OpenClaw sessions_spawn 调用
  // const result = await sessions_spawn({
  //   runtime: 'subagent',
  //   task: `请执行以下对话：\nSystem: ${params.messages[0].content}\nUser: ${params.messages[1].content}`,
  //   mode: 'run'
  // });
  
  return '{"primaryIntent": "development", "secondaryIntents": [], "confidence": 0.9, "reasoning": "占位实现", "suggestedRoute": "standard", "complexity": "medium"}';
}

/**
 * 运行测试用例
 */
async function runTests() {
  const testCases = [
    { input: '创建一个贪吃蛇游戏', expected: 'development' },
    { input: '写一篇技术博客', expected: 'content' },
    { input: '查询东京天气', expected: 'skill' },
    { input: '部署应用到生产环境', expected: 'operation' },
    { input: '创建一个电商网站，支持支付和物流', expected: 'development' },
  ];
  
  console.log('🧪 运行意图分类测试...\n');
  
  let passed = 0;
  for (const tc of testCases) {
    try {
      const result = await classifyIntent(tc.input);
      const success = result.primaryIntent === tc.expected;
      
      if (success) {
        console.log(`✅ ${tc.input} → ${result.primaryIntent}`);
        passed++;
      } else {
        console.log(`❌ ${tc.input} → ${result.primaryIntent} (期望：${tc.expected})`);
      }
    } catch (e) {
      console.log(`❌ ${tc.input} → 错误：${e.message}`);
    }
  }
  
  console.log(`\n📊 测试结果：${passed}/${testCases.length} 通过`);
  return passed === testCases.length;
}

// 导出
module.exports = {
  classifyIntent,
  runTests,
  CONFIG
};

// CLI 入口
if (require.main === module) {
  const input = process.argv.slice(2).join(' ');
  
  if (input === '--test') {
    runTests().then(success => process.exit(success ? 0 : 1));
  } else if (input) {
    classifyIntent(input).then(result => {
      console.log(JSON.stringify(result, null, 2));
    }).catch(e => {
      console.error('错误:', e.message);
      process.exit(1);
    });
  } else {
    console.log('用法：node index.js <用户请求> | --test');
  }
}
