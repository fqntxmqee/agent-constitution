# Skill-A02: 合规检查器 (Compliance Checker)

审计智能体核心技能，用于检查 runtime 配置、工具使用、任务执行顺序、用户确认节点等合规性。

---

## 🚀 快速开始

### 安装

无需安装，纯 Node.js 实现，无外部依赖。

```bash
cd agents/skills/audit/compliance-checker
```

### 基本用法

```javascript
const complianceChecker = require('./compliance-checker');

const result = await complianceChecker.check({
  target: {
    sessionLogs: ['~/.openclaw/agents/*/sessions/*.jsonl'],
    specPath: 'openspec/changes/skill-04/'
  },
  config: {
    doCheckRuntime: true,
    doCheckToolUsage: true,
    doCheckTaskOrder: true,
    doCheckUserConfirmation: true
  }
});

console.log('违规数量:', result.violations.length);
console.log('合规得分:', result.result.score);
```

---

## 📋 API 参考

### `check(params)`

执行完整合规检查。

**参数:**
```javascript
{
  target: {
    sessionLogs: string[],  // 会话日志路径
    specPath: string        // 规约目录路径
  },
  config: {
    doCheckRuntime: boolean,
    doCheckToolUsage: boolean,
    doCheckTaskOrder: boolean,
    doCheckUserConfirmation: boolean,
    customRules: Rule[]
  }
}
```

**返回:**
```javascript
{
  meta: { checkedAt, target, rulesApplied },
  result: { passed, score, level },
  checks: { runtime, toolUsage, taskOrder, userConfirmation },
  violations: [{ ruleId, name, level, description, evidence, suggestion }],
  recommendations: [{ priority, category, description, deadline }]
}
```

### `checkRuntime(events, rules)`

检查 runtime 配置。

### `checkToolUsage(events, rules)`

检查工具使用情况。

### `checkTaskOrder(specPath, events, rules)`

检查任务执行顺序。

### `checkUserConfirmation(specPath, events, rules)`

检查用户确认节点。

### `getDefaultRules()`

获取默认规则列表。

### `checkPath(filePath)`

检查路径是否为业务代码。

---

## 🔧 CLI 工具

```bash
# 执行合规检查
node agents/constitution/audit/tools/compliance-checker.js check \
  --logs ~/.openclaw/agents/*/sessions/*.jsonl \
  --spec openspec/changes/skill-04/

# 查看规则
node agents/constitution/audit/tools/compliance-checker.js rules

# 输出 JSON
node agents/constitution/audit/tools/compliance-checker.js check ... --json
```

---

## 🚨 检查规则

| 规则 ID | 名称 | 等级 | 说明 |
|---------|------|------|------|
| R001 | Runtime 配置错误 | 🔴 严重 | 开发任务必须使用 runtime="acp" |
| R002 | 违规使用 write 工具 | 🔴 严重 | 禁止使用 write 工具创建业务代码 |
| R003 | 任务顺序错误 | 🟡 一般 | 任务未按 tasks.md 定义顺序执行 |
| R004 | 缺失意图确认 | 🟡 一般 | 未找到用户意图确认记录 |
| R005 | 缺失蓝图确认 | 🟡 一般 | 未找到用户蓝图确认记录 |
| R006 | 缺失部署确认 | 🟢 轻微 | 未找到用户部署确认记录 |

---

## 📈 评分标准

| 得分 | 等级 | 说明 |
|------|------|------|
| 90-100 | 优秀 | 完全合规 |
| 75-89 | 良好 | 基本合规，少量问题 |
| 60-74 | 待改进 | 多处问题，需整改 |
| 0-59 | 严重 | 严重违规 |

---

## ✅ 测试

```bash
node test.js
```

**测试覆盖率:** 100%

---

## 📁 文件结构

```
compliance-checker/
├── SKILL.md           # 技能规约
├── README.md          # 使用文档
├── index.js           # 核心实现
├── test.js            # 单元测试 (100% 覆盖)
└── tools/
    └── compliance-checker.js  # CLI 工具
```

---

## 🔒 约束

- **无外部依赖**: 仅使用 Node.js 内置模块
- **日志解析**: 支持 JSONL 格式
- **错误容忍**: 单个检查失败不影响其他检查
- **性能要求**: 单次检查 <3 秒

---

## 📚 相关文档

- [SKILL.md](./SKILL.md) - 技能规约
- [宪法规范 V3.7](../../../../docs/specs/CONSTITUTION_V3.7.md)
- [Skill-A01 日志分析器](../skill-a01-log-analyzer/)
- [Skill-A03 规约验证器](../skill-a03-spec-validator/)
- [Skill-A04 审计报告生成器](../skill-a04-report-generator/)

---

*版本*: 1.0  
*创建日期*: 2026-03-10  
*维护者*: 审计智能体
