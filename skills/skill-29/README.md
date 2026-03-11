# 错误追踪智能体 (Skill-29)

## 简介
错误追踪智能体是全域 38 智能体技能之一，负责错误追踪智能体相关任务。

## 安装
技能位于 `agents/skills/skill-29/`

## 使用
```javascript
const { execute } = require('./skill-29');
const result = await execute({ input: '...' });
```

## API
### execute(input)
- **参数**: input - 输入对象
- **返回**: 执行结果对象

## 测试
```bash
node test.js
```

## 验收标准
- AC1: 功能正确执行
- AC2: 响应时间 <3 秒
- AC3: 错误处理完善
- AC4: 测试覆盖率 ≥90%
