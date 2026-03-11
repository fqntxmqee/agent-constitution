/**
 * Cursor CLI Skill for OpenClaw
 * 
 * 提供 Cursor CLI 的原生集成，支持代码生成、编辑、分析等功能
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = {
  name: 'cursor-cli',
  description: 'Cursor CLI 代码生成与编辑工具',
  version: '1.0.0',
  
  commands: [
    {
      name: 'cursor',
      description: '使用 Cursor CLI 执行代码任务',
      usage: 'cursor <command> [options] <prompt>',
      examples: [
        'cursor agent --print "创建 Python 贪吃蛇游戏"',
        'cursor agent --print "分析当前项目结构"',
        'cursor agent --print "创建 React 组件"'
      ],
      handler: async (args, context) => {
        return await executeCursorCommand(args);
      }
    }
  ],
  
  tools: [
    {
      name: 'cursor_generate',
      description: '使用 Cursor AI 生成代码',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: '代码生成提示'
          },
          language: {
            type: 'string',
            description: '目标编程语言',
            enum: ['python', 'javascript', 'typescript', 'java', 'go', 'rust']
          },
          trust: {
            type: 'boolean',
            description: '是否信任工作区',
            default: true
          }
        },
        required: ['prompt']
      },
      handler: async (params) => {
        return await cursorGenerate(params.prompt, params.language, params.trust);
      }
    },
    {
      name: 'cursor_edit',
      description: '使用 Cursor AI 编辑文件',
      parameters: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            description: '要编辑的文件路径'
          },
          instruction: {
            type: 'string',
            description: '编辑指令'
          }
        },
        required: ['file', 'instruction']
      },
      handler: async (params) => {
        return await cursorEdit(params.file, params.instruction);
      }
    }
  ]
};

/**
 * 执行 Cursor 命令
 */
async function executeCursorCommand(args) {
  const command = `cursor ${args.join(' ')}`;
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 300000, // 5 分钟超时
      maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
    });
    
    return {
      success: true,
      output: stdout,
      error: stderr
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 使用 Cursor 生成代码
 */
async function cursorGenerate(prompt, language = 'python', trust = true) {
  const trustFlag = trust ? '--trust' : '';
  const command = `cursor agent --print "${prompt}" ${trustFlag}`;
  
  return await executeCursorCommand(command.split(' '));
}

/**
 * 使用 Cursor 编辑文件
 */
async function cursorEdit(file, instruction) {
  const command = `cursor edit -i "${instruction}" "${file}"`;
  
  return await executeCursorCommand(command.split(' '));
}
