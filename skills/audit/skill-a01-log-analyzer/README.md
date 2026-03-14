# Skill-A01: 日志分析器 (Log Analyzer)

审计智能体核心技能，用于解析 OpenClaw 会话日志、检测违规操作。

---

## 🚀 快速开始

### 安装

无需安装，纯 Node.js 实现，无外部依赖。

```bash
cd agents/skills/audit/skill-a01-log-analyzer
```

### 基本用法

```javascript
const logAnalyzer = require('./index.js');

// 分析会话日志
const result = await logAnalyzer.analyze({
  sessionPaths: ['~/.openclaw/agents/*/sessions/*.jsonl']
});

console.log('违规数量:', result.violations.length);
console.log('合规评分:', result.compliance.score);
```

---

## 📋 API 参考

### `analyze(params)`

完整分析会话日志。

**参数:**
```javascript
{
  sessionPaths: string[],  // 必填：会话日志路径列表
  config: {
    detectViolations: boolean,  // 是否检测违规，默认 true
    eventTypes: string[],       // 事件类型过滤
    timeRange: { start, end }   // 时间范围过滤 (ms)
  }
}
```

**返回:**
```javascript
{
  meta: { analyzedAt, sessionCount, eventCount, timeRange },
  statistics: { byType, byTool },
  events: [...],
  violations: [...],
  compliance: { score, level, breakdown }
}
```

### `detectViolations(params)`

仅检测违规操作。

**参数:** 同 `analyze`

**返回:**
```javascript
{
  meta: {...},
  violations: [...],
  compliance: {...}
}
```

### `getViolationRules()`

获取所有违规规则列表。

**返回:** `ViolationRule[]`

### `checkPath(filePath)`

检查路径是否为业务代码（使用 write 工具是否违规）。

**参数:** `filePath` - 文件路径

**返回:**
```javascript
{
  isBusinessCode: boolean,  // 是否为业务代码
  isAllowed: boolean        // 是否允许使用 write 工具
}
```

---

## 🚨 违规规则

| 规则 ID | 名称 | 等级 | 说明 |
|---------|------|------|------|
| V001 | 无规约写业务代码 | 🔴 严重 | 使用 write 工具创建业务代码 |
| V002 | 使用 subagent 执行开发 | 🔴 严重 | 开发任务使用 runtime="subagent" |
| V003 | 跳过验收直接交付 | 🟡 一般 | 无验收报告但有交付行为 |
| V004 | 未使用 Cursor CLI | 🟡 一般 | 开发任务未使用 cursor 工具 |
| V005 | 敏感信息泄露 | 🔴 严重 | 内容包含 API Key/密码/Token |

---

## 🔧 CLI 工具

使用 `tools/log-analyzer.js` 进行命令行分析：

```bash
# 完整分析
node tools/log-analyzer.js analyze --sessions ~/.openclaw/agents/*/sessions/*.jsonl

# 仅检测违规
node tools/log-analyzer.js violations --sessions ~/.openclaw/agents/cursor/sessions/*.jsonl

# 查看违规规则
node tools/log-analyzer.js rules

# 检查路径
node tools/log-analyzer.js check-path --path /src/main.js

# 输出 JSON
node tools/log-analyzer.js violations --sessions ... --json
```

---

## 📊 输出示例

### 分析结果

```json
{
  "meta": {
    "analyzedAt": "2026-03-10T09:42:00.000Z",
    "sessionCount": 5,
    "eventCount": 1234,
    "timeRange": {
      "start": 1773082342919,
      "end": 1773082400000
    }
  },
  "statistics": {
    "byType": {
      "toolCall": 500,
      "message": 600,
      "thinking": 100,
      "system": 34
    },
    "byTool": {
      "write": 50,
      "read": 100,
      "exec": 80
    }
  },
  "violations": [
    {
      "ruleId": "V001",
      "name": "无规约写业务代码",
      "level": "严重",
      "sessionId": "session-123",
      "timestamp": 1773082342919,
      "description": "检测到使用 write 工具创建业务代码",
      "evidence": {
        "tool": "write",
        "path": "/src/main.js",
        "contentPreview": "function main() {..."
      },
      "recommendation": "使用 runtime=\"acp\" + Cursor CLI 开发"
    }
  ],
  "compliance": {
    "score": 85,
    "level": "良好",
    "breakdown": {
      "规约先行": 100,
      "开发合规": 80,
      "验收合规": 70,
      "交付合规": 90
    }
  }
}
```

---

## ✅ 测试

运行测试套件：

```bash
node test.js
```

**测试覆盖率:** 100%

---

## 📁 文件结构

```
skill-a01-log-analyzer/
├── SKILL.md           # 技能规约
├── README.md          # 使用文档
├── index.js           # 核心实现
├── test.js            # 单元测试 (100% 覆盖)
└── tools/
    └── log-analyzer.js  # CLI 工具
```

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块
- **流式处理**: 支持大文件 (>100MB)
- **错误容忍**: 单行解析失败不影响其他行
- **性能要求**: 100MB 文件解析 <10 秒

---

## 📚 相关文档

- [SKILL.md](./SKILL.md) - 技能规约
- [宪法规范 V3.7](../../../../agents/docs/specs/constitution/CONSTITUTION_V3.7.md)
- [审计智能体 AGENTS.md](../../../constitution/audit/AGENTS.md)

---

*版本*: 1.0  
*创建日期*: 2026-03-10  
*维护者*: 审计智能体
