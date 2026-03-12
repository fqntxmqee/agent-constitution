# Skill-04 动态路由决策器 - 技术设计文档

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     OpenClaw Runtime                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Skill-01   │    │   Skill-03   │    │   User Override  │  │
│  │  意图识别    │    │   任务分析   │    │     (可选)       │  │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘  │
│         │                   │                      │            │
│         └───────────────────┼──────────────────────┘            │
│                             │                                   │
│                             ▼                                   │
│              ┌──────────────────────────────┐                   │
│              │     Skill-04 路由决策器      │                   │
│              │                              │                   │
│              │  ┌────────────────────────┐  │                   │
│              │  │    输入验证器          │  │                   │
│              │  │  InputValidator        │  │                   │
│              │  └───────────┬────────────┘  │                   │
│              │              │               │                   │
│              │              ▼               │                   │
│              │  ┌────────────────────────┐  │                   │
│              │  │    规则引擎核心        │  │                   │
│              │  │    RuleEngine          │  │                   │
│              │  └───────────┬────────────┘  │                   │
│              │              │               │                   │
│              │              ▼               │                   │
│              │  ┌────────────────────────┐  │                   │
│              │  │    决策输出生成器      │  │                   │
│              │  │   OutputGenerator      │  │                   │
│              │  └───────────┬────────────┘  │                   │
│              │              │               │                   │
│              └──────────────┼───────────────┘                   │
│                             │                                   │
│                             ▼                                   │
│              ┌──────────────────────────────┐                   │
│              │      目标执行智能体          │                   │
│              │   (coding/content/data/...)  │                   │
│              └──────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1.2 组件职责

| 组件 | 职责 | 依赖 |
|------|------|------|
| InputValidator | 验证输入格式，提供默认值 | 无 |
| RuleEngine | 执行规则匹配，返回匹配结果 | 配置文件 |
| OutputGenerator | 生成决策输出，包含理由 | RuleEngine 结果 |
| ConfigLoader | 加载和解析路由规则配置 | 文件系统 |

---

## 2. 决策流程

### 2.1 主决策流程图

```
                    ┌─────────────────┐
                    │   接收输入      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  检查用户覆盖   │
                    │  (userOverride) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │ enabled=true │ enabled=false│
              ▼              │              ▼
    ┌─────────────────┐      │    ┌─────────────────┐
    │ 使用用户指定目标│      │    │   加载规则配置  │
    │ 标记为"覆盖"    │      │    └────────┬────────┘
    └────────┬────────┘      │             │
             │               │             ▼
             │               │    ┌─────────────────┐
             │               │    │  规则引擎匹配   │
             │               │    │  (按优先级)     │
             │               │    └────────┬────────┘
             │               │             │
             │               │             ▼
             │               │    ┌─────────────────┐
             │               │    │  收集匹配因素   │
             │               │    │  (factors)      │
             │               │    └────────┬────────┘
             │               │             │
             ▼               │             ▼
    ┌─────────────────────────────────────────────────┐
    │              生成决策输出                        │
    │  - routeTo (目标智能体)                          │
    │  - reasoning (决策理由)                          │
    │  - factors (影响因素)                            │
    │  - matchedRules (匹配规则)                       │
    └─────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   返回结果      │
                    └─────────────────┘
```

---

### 2.2 规则匹配流程

```
┌─────────────────────────────────────────────────────────────┐
│                    规则引擎匹配流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  for each rule in rules (sorted by priority):              │
│                                                             │
│    ┌─────────────────┐                                      │
│    │  评估条件 1     │───不匹配───┐                         │
│    └─────────────────┘            │                         │
│              │ 匹配               ▼                         │
│              ▼           ┌─────────────────┐                │
│    ┌─────────────────┐   │   跳过此规则    │                │
│    │  评估条件 2     │   │   继续下一条    │                │
│    └─────────────────┘   └─────────────────┘                │
│              │                                              │
│              ▼ (所有条件匹配)                                 │
│    ┌─────────────────┐                                      │
│    │  记录匹配结果   │                                      │
│    │  收集因素       │                                      │
│    └─────────────────┘                                      │
│                                                             │
│  返回最高优先级的匹配结果                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 数据结构设计

### 3.1 路由规则配置 (routing-rules.json)

```json
{
  "version": "1.0",
  "defaultRoute": "general-agent",
  "rules": [
    {
      "id": "rule-001",
      "name": "开发任务路由",
      "description": "将开发类任务路由到编码智能体",
      "priority": 100,
      "conditions": [
        {
          "field": "skill03.taskType",
          "operator": "equals",
          "value": "development"
        },
        {
          "field": "skill01.confidence",
          "operator": "greaterThan",
          "value": 0.7
        }
      ],
      "action": {
        "routeTo": "coding-agent",
        "metadata": {
          "reason": "高置信度开发任务"
        }
      }
    },
    {
      "id": "rule-002",
      "name": "内容创作路由",
      "description": "将内容类任务路由到内容智能体",
      "priority": 90,
      "conditions": [
        {
          "field": "skill03.taskType",
          "operator": "in",
          "value": ["writing", "editing", "translation"]
        }
      ],
      "action": {
        "routeTo": "content-agent",
        "metadata": {
          "reason": "内容创作类任务"
        }
      }
    }
  ]
}
```

### 3.2 决策输出结构

```typescript
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

---

## 4. 模块设计

### 4.1 目录结构

```
skill-04-routing-decider/
├── src/
│   ├── index.ts              # 主入口
│   ├── types.ts              # 类型定义
│   ├── validator.ts          # 输入验证器
│   ├── engine.ts             # 规则引擎核心
│   ├── generator.ts          # 输出生成器
│   └── config/
│       └── loader.ts         # 配置加载器
├── config/
│   └── routing-rules.json    # 路由规则配置
├── tests/
│   ├── validator.test.ts
│   ├── engine.test.ts
│   ├── generator.test.ts
│   └── integration.test.ts
├── docs/
│   └── usage.md              # 使用文档
└── package.json
```

### 4.2 核心类设计

```typescript
// 规则引擎核心
class RuleEngine {
  private rules: Rule[];
  
  constructor(config: RoutingConfig);
  
  match(input: RoutingInput): MatchResult;
  
  private evaluateCondition(
    condition: Condition, 
    input: RoutingInput
  ): boolean;
  
  private sortByPriority(rules: Rule[]): Rule[];
}

// 输出生成器
class OutputGenerator {
  generate(
    matchResult: MatchResult,
    input: RoutingInput
  ): RoutingOutput;
  
  private buildReasoning(
    factors: Factor[]
  ): string;
  
  private calculateConfidence(
    matchedRules: Rule[]
  ): number;
}
```

---

## 5. 错误处理

### 5.1 异常类型

```typescript
class RoutingError extends Error {
  code: string;
  details: any;
  
  constructor(code: string, message: string, details?: any);
}

// 预定义错误
const Errors = {
  CONFIG_NOT_FOUND: 'RD-001',
  INVALID_INPUT: 'RD-002',
  NO_MATCHING_RULE: 'RD-003',
  INVALID_RULE_SYNTAX: 'RD-004',
};
```

### 5.2 错误处理策略

| 错误类型 | 处理策略 | 是否抛出 |
|----------|----------|----------|
| 配置加载失败 | 使用默认规则，记录警告 | 否 |
| 输入格式错误 | 返回错误响应 | 是 |
| 无匹配规则 | 返回默认路由 | 否 |
| 规则语法错误 | 启动时抛出，阻止运行 | 是 |

---

## 6. 测试策略

### 6.1 测试分层

```
┌─────────────────────────────────────┐
│         E2E 测试 (10%)              │
│   完整流程，模拟真实场景             │
├─────────────────────────────────────┤
│       集成测试 (20%)                │
│   组件间交互，Skill-01/03 模拟       │
├─────────────────────────────────────┤
│        单元测试 (70%)               │
│   各组件独立测试，覆盖所有分支       │
└─────────────────────────────────────┘
```

### 6.2 测试用例清单 (10 个核心用例)

| ID | 测试场景 | 预期结果 |
|----|----------|----------|
| T01 | 开发任务路由 | 路由到 coding-agent |
| T02 | 内容任务路由 | 路由到 content-agent |
| T03 | 用户覆盖 | 使用用户指定目标 |
| T04 | 多条件匹配 | 正确评估 AND 逻辑 |
| T05 | 优先级处理 | 高优先级规则优先 |
| T06 | 无匹配规则 | 返回默认路由 |
| T07 | 无效输入 | 返回错误响应 |
| T08 | 配置加载 | 正确解析 JSON |
| T09 | 决策理由生成 | 包含完整 factors |
| T10 | 性能测试 | 响应时间 <1 秒 |

---

## 7. 部署配置

### 7.1 环境变量

```bash
# 可选配置
ROUTING_CONFIG_PATH=./config/routing-rules.json
DEFAULT_ROUTE=general-agent
LOG_LEVEL=info
```

### 7.2 依赖安装

```bash
npm install
npm run build
npm test  # 验证 100% 覆盖率
```

---

*文档版本: 1.0*
*创建日期: 2026-03-10*
