# 代码审查智能体 (Skill-12)

## 简介
代码审查智能体是全域 38 智能体技能之一，负责代码审查智能体相关任务。

## 安装
技能位于 `agents/skills/skill-12/`

## 使用
```javascript
const { execute } = require('./skill-12');
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
