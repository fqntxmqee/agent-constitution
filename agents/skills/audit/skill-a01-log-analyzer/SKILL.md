# Skill-A01: 日志分析器 (Log Analyzer)

**版本**: 1.0  
**创建日期**: 2026-03-10  
**归属**: 审计智能体专用技能

---

## 🎯 定位

审计智能体的核心分析引擎，负责解析 OpenClaw 会话日志、提取关键事件、检测违规操作。

---

## 📥 输入

### 输入参数

```javascript
{
  // 必填：会话日志路径列表
  sessionPaths: string[],  // e.g. ["~/.openclaw/agents/main/sessions/xxx.jsonl"]
  
  // 可选：分析配置
  config: {
    // 检测规则
    detectViolations: boolean,  // 默认 true
    
    // 时间范围过滤
    timeRange?: {
      start: number,  // 时间戳 (ms)
      end: number     // 时间戳 (ms)
    },
    
    // 事件类型过滤
    eventTypes?: string[],  // e.g. ["toolCall", "message", "thinking"]
    
    // 智能体类型过滤
    agentTypes?: string[]   // e.g. ["requirement-resolution", "coding-agent"]
  }
}
```

### JSONL 文件格式

每行是一个 JSON 对象，表示一个事件：

```json
{
  "type": "toolCall",
  "timestamp": 1773082342919,
  "sessionId": "xxx",
  "data": {
    "tool": "write",
    "path": "/path/to/file.js",
    "content": "..."
  }
}
```

---

## 🔧 处理逻辑

### 1. 日志解析

```
┌─────────────────────────────────────────┐
│         读取 JSONL 文件                  │
├─────────────────────────────────────────┤
│  逐行解析 → 过滤无效行 → 提取事件       │
├─────────────────────────────────────────┤
│  按时间戳排序 → 构建事件流              │
└─────────────────────────────────────────┘
```

### 2. 事件提取

支持的事件类型：

| 类型 | 说明 | 提取字段 |
|------|------|----------|
| `toolCall` | 工具调用 | tool, path, content, target, message |
| `message` | 消息收发 | channel, to, from, content |
| `thinking` | 思考过程 | content, duration |
| `system` | 系统事件 | event, metadata |

### 3. 违规检测

#### 检测规则

| 规则 ID | 规则名称 | 检测条件 | 违规等级 |
|---------|----------|----------|----------|
| V001 | 无规约写业务代码 | `tool="write"` + 路径包含业务代码特征 | 🔴 严重 |
| V002 | 使用 subagent 执行开发 | `tool="sessions_spawn"` + `runtime="subagent"` + 开发类任务 | 🔴 严重 |
| V003 | 跳过验收直接交付 | 无验收报告 + 有交付行为 | 🟡 一般 |
| V004 | 开发任务未走 sessions_spawn | 开发任务 + 无 sessions_spawn / cursor 工具调用 | 🟡 一般 |
| V005 | 敏感信息泄露 | 内容包含 API Key/密码/Token 模式 | 🔴 严重 |

#### 业务代码路径特征

以下路径模式被视为业务代码（使用 write 工具为违规）：

- `*.js` (非 test.js, config.js)
- `*.ts` (非配置文件)
- `*.py` (业务逻辑)
- `src/` 目录下的文件
- `lib/` 目录下的文件
- `app/` 目录下的文件

以下路径允许使用 write 工具：

- `*.md` (文档)
- `*.json` (配置，非 package-lock.json)
- `config/` 目录
- `docs/` 目录
- `test.js`, `test.ts` (测试文件)
- `skills/*/SKILL.md` (技能规约)

---

## 📤 输出

### 分析结果结构

```javascript
{
  // 分析元数据
  meta: {
    analyzedAt: "2026-03-10T09:42:00.000Z",
    sessionCount: 5,
    eventCount: 1234,
    timeRange: {
      start: 1773082342919,
      end: 1773082400000
    }
  },
  
  // 事件统计
  statistics: {
    byType: {
      toolCall: 500,
      message: 600,
      thinking: 100,
      system: 34
    },
    byTool: {
      write: 50,
      read: 100,
      exec: 80,
      browser: 20,
      // ...
    }
  },
  
  // 提取的事件（可选，支持分页）
  events: [
    {
      id: "evt-001",
      type: "toolCall",
      timestamp: 1773082342919,
      sessionId: "xxx",
      data: { /* 原始数据 */ }
    }
  ],
  
  // 违规检测结果
  violations: [
    {
      ruleId: "V001",
      ruleName: "无规约写业务代码",
      level: "严重",
      eventId: "evt-xxx",
      timestamp: 1773082342919,
      sessionId: "xxx",
      description: "检测到使用 write 工具创建业务代码",
      evidence: {
        tool: "write",
        path: "/path/to/code.js",
        contentPreview: "function main() {..."
      },
      recommendation: "使用 sessions_spawn(runtime=\"acp\"|\"subagent\") 委托 Worker 开发"
    }
  ],
  
  // 合规评分
  compliance: {
    score: 85,  // 0-100
    level: "良好",  // 优秀/良好/待改进/严重
    breakdown: {
      规约先行: 100,
      开发合规: 80,
      验收合规: 70,
      交付合规: 90
    }
  }
}
```

---

## ✅ 验收标准

| AC | 标准 | 验证方式 |
|----|------|----------|
| AC1 | 支持解析单个或多个 JSONL 文件 | 单元测试 |
| AC2 | 正确提取 toolCall/message/thinking 事件 | 单元测试 |
| AC3 | 检测 V001-V005 违规规则 | 单元测试 |
| AC4 | 输出符合定义的 JSON 结构 | 单元测试 |
| AC5 | 100% 测试覆盖率 | 运行测试 |
| AC6 | 无外部依赖（纯 Node.js） | 检查 package.json |
| AC7 | 支持大文件流式解析（>100MB） | 性能测试 |

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块 (fs, path, stream)
- **流式处理**: 支持大文件，避免一次性加载到内存
- **错误容忍**: 单行解析失败不影响其他行
- **性能要求**: 100MB 文件解析 <10 秒

---

## 📚 使用示例

### 基本用法

```javascript
const logAnalyzer = require('./skill-a01-log-analyzer');

// 分析单个会话
const result = await logAnalyzer.analyze({
  sessionPaths: ['~/.openclaw/agents/main/sessions/session-123.jsonl']
});

console.log(result.violations);
```

### 批量分析

```javascript
// 分析多个会话
const result = await logAnalyzer.analyze({
  sessionPaths: [
    '~/.openclaw/agents/main/sessions/session-1.jsonl',
    '~/.openclaw/agents/main/sessions/session-2.jsonl'
  ],
  config: {
    detectViolations: true,
    eventTypes: ['toolCall', 'message']
  }
});
```

### 违规检测

```javascript
// 仅检测违规
const result = await logAnalyzer.detectViolations({
  sessionPaths: ['~/.openclaw/agents/cursor/sessions/*.jsonl']
});

if (result.violations.length > 0) {
  console.error('发现违规操作:', result.violations);
}
```

---

## 🔗 相关文档

- 宪法规范 V3.7 第二章 §7（审计智能体）
- OpenClaw 会话日志格式
- 违规等级定义 (`agents/constitution/audit/AGENTS.md`)

---

*最后更新*: 2026-03-10  
*维护者*: 审计智能体
