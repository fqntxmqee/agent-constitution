# Skill-A02: 合规检查器 (Compliance Checker)

**版本**: 1.0  
**创建日期**: 2026-03-10  
**归属**: 审计智能体专用技能

---

## 🎯 定位

审计智能体的合规检查引擎，负责检查 runtime 配置、工具使用、任务执行顺序、用户确认节点等合规性。

---

## 📥 输入

### 输入参数

```javascript
{
  // 必填：检查对象
  target: {
    // 会话日志路径（用于检查 runtime 和工具使用）
    sessionLogs: string[],
    
    // 规约目录（用于检查任务顺序和用户确认）
    specPath: string
  },
  
  // 可选：检查配置
  config: {
    // 自定义检查规则
    customRules: Rule[],
    
    // 是否检查 runtime
    checkRuntime: boolean,  // 默认 true
    
    // 是否检查工具使用
    checkToolUsage: boolean,  // 默认 true
    
    // 是否检查任务顺序
    checkTaskOrder: boolean,  // 默认 true
    
    // 是否检查用户确认
    checkUserConfirmation: boolean  // 默认 true
  }
}
```

---

## 🔧 处理逻辑

### 1. Runtime 配置检查

检查 `sessions_spawn` 工具调用：

| 检查项 | 要求 | 违规等级 |
|--------|------|----------|
| runtime 参数 | 开发任务必须为 "acp" | 🔴 严重 |
| 开发任务 | 禁止使用 "subagent" | 🔴 严重 |

### 2. 工具使用检查

检查 `write` 工具调用：

| 路径模式 | 是否允许 | 说明 |
|----------|----------|------|
| `*.md` | ✅ 允许 | 文档文件 |
| `*.json` (配置) | ✅ 允许 | 配置文件 |
| `config/` | ✅ 允许 | 配置目录 |
| `docs/` | ✅ 允许 | 文档目录 |
| `src/*.js` | ❌ 禁止 | 业务代码 |
| `lib/*.ts` | ❌ 禁止 | 业务代码 |

### 3. 任务执行顺序检查

解析 `tasks.md`，检查实际执行顺序是否符合定义。

### 4. 用户确认节点检查

| 确认节点 | 检查内容 | 违规等级 |
|----------|----------|----------|
| 意图确认 | proposal.md 或 confirmation/intent.md | 🟡 一般 |
| 蓝图确认 | design.md 签署或 confirmation/blueprint.md | 🟡 一般 |
| 部署确认 | 部署章节或 confirmation/deployment.md | 🟢 轻微 |

---

## 📤 输出

```javascript
{
  meta: { checkedAt, target, rulesApplied },
  result: { passed, score, level },
  checks: { runtime, toolUsage, taskOrder, userConfirmation },
  violations: [{ ruleId, name, level, description, evidence, suggestion }],
  recommendations: [{ priority, category, description, deadline }]
}
```

---

## ✅ 验收标准

| AC | 标准 | 验证方式 |
|----|------|----------|
| AC1 | 正确检测 runtime 违规 | 单元测试 |
| AC2 | 正确检测工具使用违规 | 单元测试 |
| AC3 | 正确检测任务顺序错误 | 单元测试 |
| AC4 | 正确检测用户确认缺失 | 单元测试 |
| AC5 | 违规等级分类正确 | 单元测试 |
| AC6 | 支持自定义检查规则 | 单元测试 |
| AC7 | 100% 测试覆盖率 | 运行测试 |
| AC8 | 无外部依赖 | 检查实现 |

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块
- **日志解析**: 支持 JSONL 格式
- **错误容忍**: 单个检查失败不影响其他检查
- **性能要求**: 单次检查 <3 秒

---

## 📚 使用示例

```javascript
const complianceChecker = require('./compliance-checker');

const result = await complianceChecker.check({
  target: {
    sessionLogs: ['~/.openclaw/agents/*/sessions/*.jsonl'],
    specPath: 'project/skill-04/changes/init/'
  },
  config: {
    checkRuntime: true,
    checkToolUsage: true,
    checkTaskOrder: true,
    checkUserConfirmation: true
  }
});

console.log('违规数量:', result.violations.length);
console.log('合规得分:', result.result.score);
```

---

## 🔗 相关文档

- 宪法规范 V3.7 第二章 §7（审计智能体）
- Skill-A01 日志分析器
- Skill-A04 审计报告生成器

---

*最后更新*: 2026-03-10  
*维护者*: 审计智能体
