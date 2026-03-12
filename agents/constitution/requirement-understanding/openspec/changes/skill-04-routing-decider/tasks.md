# Skill-04 动态路由决策器 - 任务清单

## 任务概览

| 阶段 | 任务数 | 预计工时 | 状态 |
|------|--------|----------|------|
| 初始化 | 2 | 0.5h | ⏳ 待执行 |
| 核心开发 | 5 | 4h | ⏳ 待执行 |
| 测试 | 3 | 2h | ⏳ 待执行 |
| 文档 | 2 | 1h | ⏳ 待执行 |
| **总计** | **12** | **7.5h** | |

---

## 阶段 1: 项目初始化

### Task-001: 创建项目结构

**描述:** 初始化 Node.js 项目并创建目录结构

**执行步骤:**
```bash
# 1. 进入项目目录
cd openspec/changes/skill-04-routing-decider

# 2. 初始化 npm 项目
npm init -y

# 3. 创建目录结构
mkdir -p src config tests docs

# 4. 安装开发依赖
npm install --save-dev typescript jest @types/jest ts-jest
npm install --save-dev @types/node

# 5. 配置 TypeScript
npx tsc --init
```

**验收标准:**
- [ ] package.json 创建成功
- [ ] tsconfig.json 配置正确
- [ ] 目录结构完整

**预计工时:** 15 分钟

---

### Task-002: 创建路由规则配置文件

**描述:** 创建默认的 routing-rules.json 配置文件

**执行步骤:**
1. 在 `config/` 目录下创建 `routing-rules.json`
2. 包含以下规则模板:
   - 开发任务路由规则
   - 内容创作路由规则
   - 技能/数据任务路由规则
   - 默认路由规则

**配置文件内容:**
```json
{
  "version": "1.0",
  "defaultRoute": "general-agent",
  "rules": [
    {
      "id": "rule-dev-001",
      "name": "开发任务路由",
      "priority": 100,
      "conditions": [
        { "field": "skill03.taskType", "operator": "equals", "value": "development" }
      ],
      "action": { "routeTo": "coding-agent" }
    },
    {
      "id": "rule-content-001",
      "name": "内容创作路由",
      "priority": 90,
      "conditions": [
        { "field": "skill03.taskType", "operator": "in", "value": ["writing", "editing"] }
      ],
      "action": { "routeTo": "content-agent" }
    },
    {
      "id": "rule-skill-001",
      "name": "技能/数据任务路由",
      "priority": 80,
      "conditions": [
        { "field": "skill03.taskType", "operator": "in", "value": ["skill", "data"] }
      ],
      "action": { "routeTo": "skill-agent" }
    }
  ]
}
```

**验收标准:**
- [ ] JSON 格式有效
- [ ] 包含至少 3 条规则
- [ ] 规则优先级正确设置

**预计工时:** 15 分钟

---

## 阶段 2: 核心开发

### Task-003: 实现类型定义

**描述:** 在 `src/types.ts` 中定义所有类型接口

**执行内容:**
```typescript
// 输入类型
interface RoutingInput {
  skill01: {
    intent: string;
    confidence: number;
    entities?: any[];
  };
  skill03: {
    taskType: string;
    complexity: 'low' | 'medium' | 'high';
    requiresTools?: string[];
    estimatedSteps?: number;
  };
  userOverride?: {
    enabled: boolean;
    targetAgent: string;
  };
}

// 规则类型
interface Rule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  conditions: Condition[];
  action: Action;
}

interface Condition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
}

interface Action {
  routeTo: string;
  metadata?: Record<string, any>;
}

// 输出类型
interface RoutingOutput {
  decision: {
    routeTo: string;
    confidence: number;
    isOverride: boolean;
  };
  reasoning: string;
  factors: Factor[];
  matchedRules: string[];
  timestamp: string;
  version: string;
}

interface Factor {
  name: string;
  value: any;
  weight: number;
  matchedRule: string;
  contribution: string;
}
```

**验收标准:**
- [ ] 所有类型定义完整
- [ ] TypeScript 编译通过
- [ ] 导出所有公共类型

**预计工时:** 30 分钟

---

### Task-004: 实现输入验证器

**描述:** 在 `src/validator.ts` 中实现输入验证逻辑

**执行内容:**
```typescript
class InputValidator {
  validate(input: any): RoutingInput {
    // 1. 检查必需字段
    // 2. 类型验证
    // 3. 提供默认值
    // 4. 返回验证后的输入
  }
  
  private validateSkill01(data: any): void;
  private validateSkill03(data: any): void;
  private validateUserOverride(data: any): void;
}
```

**验收标准:**
- [ ] 能检测缺失字段
- [ ] 能检测类型错误
- [ ] 提供有意义的错误信息
- [ ] 单元测试覆盖所有验证分支

**预计工时:** 45 分钟

---

### Task-005: 实现规则引擎核心

**描述:** 在 `src/engine.ts` 中实现规则匹配引擎

**执行内容:**
```typescript
class RuleEngine {
  private rules: Rule[];
  
  constructor(configPath: string);
  
  async loadRules(): Promise<void>;
  
  match(input: RoutingInput): MatchResult {
    // 1. 按优先级排序规则
    // 2. 遍历规则
    // 3. 评估每个条件
    // 4. 返回匹配结果
  }
  
  private evaluateCondition(condition: Condition, input: RoutingInput): boolean;
  
  private getFieldValue(field: string, input: RoutingInput): any;
}
```

**支持的运算符实现:**
- `equals` - 严格相等
- `notEquals` - 不相等
- `contains` - 字符串包含
- `greaterThan` - 数值大于
- `lessThan` - 数值小于
- `in` - 值在数组中

**验收标准:**
- [ ] 所有运算符正确实现
- [ ] 规则按优先级执行
- [ ] 支持嵌套字段访问 (如 skill03.taskType)
- [ ] 单元测试覆盖所有运算符

**预计工时:** 90 分钟

---

### Task-006: 实现输出生成器

**描述:** 在 `src/generator.ts` 中实现决策输出生成

**执行内容:**
```typescript
class OutputGenerator {
  generate(matchResult: MatchResult, input: RoutingInput): RoutingOutput {
    // 1. 构建决策对象
    // 2. 生成决策理由
    // 3. 收集影响因素
    // 4. 返回完整输出
  }
  
  private buildReasoning(factors: Factor[]): string;
  
  private calculateConfidence(matchedRules: Rule[]): number;
  
  private buildFactors(matchResult: MatchResult, input: RoutingInput): Factor[];
}
```

**验收标准:**
- [ ] 输出格式符合规格
- [ ] reasoning 字段清晰易懂
- [ ] factors 包含所有影响因素
- [ ] 支持用户覆盖标记

**预计工时:** 45 分钟

---

### Task-007: 实现主入口和配置加载器

**描述:** 在 `src/index.ts` 和 `src/config/loader.ts` 中实现主入口

**执行内容:**
```typescript
// src/index.ts
export class RoutingDecider {
  private validator: InputValidator;
  private engine: RuleEngine;
  private generator: OutputGenerator;
  
  constructor(configPath?: string);
  
  async decide(input: RoutingInput): Promise<RoutingOutput>;
  
  async loadRules(configPath: string): Promise<void>;
  
  validateRules(): boolean;
}

// 导出单例
export const decider = new RoutingDecider();
export default decider;
```

**验收标准:**
- [ ] 主入口导出正确
- [ ] 支持自定义配置路径
- [ ] 错误处理完善
- [ ] 提供使用示例

**预计工时:** 45 分钟

---

## 阶段 3: 测试

### Task-008: 编写单元测试

**描述:** 为所有核心组件编写单元测试

**测试文件:**
- `tests/validator.test.ts` - 输入验证器测试 (3 个用例)
- `tests/engine.test.ts` - 规则引擎测试 (4 个用例)
- `tests/generator.test.ts` - 输出生成器测试 (3 个用例)

**执行步骤:**
```bash
# 1. 配置 Jest
# 2. 编写测试用例
# 3. 运行测试
npm test

# 4. 检查覆盖率
npm test -- --coverage
```

**验收标准:**
- [ ] 所有测试通过
- [ ] 代码覆盖率 100%
- [ ] 测试用例覆盖所有分支

**预计工时:** 60 分钟

---

### Task-009: 编写集成测试

**描述:** 编写与 Skill-01/03 的集成测试

**测试文件:**
- `tests/integration.test.ts`

**测试场景:**
1. 模拟 Skill-01 + Skill-03 输出
2. 验证路由决策正确性
3. 验证用户覆盖功能
4. 验证错误处理

**验收标准:**
- [ ] 集成测试通过
- [ ] 模拟数据符合实际格式
- [ ] 端到端流程验证通过

**预计工时:** 45 分钟

---

### Task-010: 性能测试

**描述:** 验证响应时间 <1 秒

**执行步骤:**
```typescript
// tests/performance.test.ts
test('响应时间 <1 秒', async () => {
  const start = Date.now();
  await decider.decide(mockInput);
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000);
});
```

**验收标准:**
- [ ] P99 响应时间 <1 秒
- [ ] 连续运行 100 次无超时
- [ ] 内存占用稳定

**预计工时:** 15 分钟

---

## 阶段 4: 文档

### Task-011: 编写使用文档

**描述:** 在 `docs/usage.md` 中编写使用文档

**文档内容:**
1. 快速开始
2. API 参考
3. 配置说明
4. 用户覆盖指南
5. 常见问题

**验收标准:**
- [ ] 文档完整
- [ ] 包含代码示例
- [ ] 用户覆盖有明确说明 (AC3)

**预计工时:** 45 分钟

---

### Task-012: 更新项目文档

**描述:** 更新 README.md 和项目元数据

**执行内容:**
1. 创建 README.md
2. 添加安装说明
3. 添加使用示例
4. 添加贡献指南

**验收标准:**
- [ ] README 完整
- [ ] 包含所有 AC 的验证说明
- [ ] 链接到相关文档

**预计工时:** 15 分钟

---

## 执行顺序

```
Task-001 → Task-002 → Task-003 → Task-004 → Task-005 → Task-006 → Task-007
                                                    ↓
Task-012 ← Task-011 ← Task-010 ← Task-009 ← Task-008 ←────────┘
```

---

## 验收标准检查清单

| AC | 验证任务 | 状态 |
|----|----------|------|
| AC1: 规则可配置 | Task-002, Task-005 | ⏳ |
| AC2: 决策理由清晰 | Task-006, Task-008 | ⏳ |
| AC3: 支持用户覆盖 | Task-003, Task-006, Task-011 | ⏳ |
| AC4: 测试覆盖率 100% | Task-008 | ⏳ |
| AC5: 响应时间 <1 秒 | Task-010 | ⏳ |
| AC6: 与 Skill-01/03 集成 | Task-009 | ⏳ |

---

## 交付确认

完成所有任务后，执行以下确认步骤:

```bash
# 1. 运行所有测试
npm test

# 2. 检查覆盖率
npm test -- --coverage

# 3. 验证文档完整性
ls -la docs/

# 4. 确认文件结构
tree -L 2
```

**交付物清单:**
- [ ] src/ 源代码目录
- [ ] config/routing-rules.json 配置文件
- [ ] tests/ 测试套件
- [ ] docs/usage.md 使用文档
- [ ] README.md 项目说明
- [ ] 本 OpenSpec 文档集

---

*文档版本: 1.0*
*创建日期: 2026-03-10*
*下游消费者：需求解决智能体*
