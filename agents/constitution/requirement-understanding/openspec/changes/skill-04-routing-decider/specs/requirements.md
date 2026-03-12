# Skill-04 动态路由决策器 - 需求规格说明书

## 1. 功能需求 (Functional Requirements)

### 1.1 输入处理 (FR-001)

**描述:** 接收并解析上游智能体的输出数据

**输入格式:**
```json
{
  "skill01": {
    "intent": "string",
    "confidence": number,
    "entities": []
  },
  "skill03": {
    "taskType": "string",
    "complexity": "low|medium|high",
    "requiresTools": ["string"],
    "estimatedSteps": number
  },
  "userOverride": {
    "enabled": boolean,
    "targetAgent": "string"
  }
}
```

**验收条件:**
- 能正确解析 JSON 输入
- 对缺失字段有默认值处理
- 对无效输入返回明确错误

---

### 1.2 规则引擎核心 (FR-002)

**描述:** 基于预定义规则进行路由决策

**规则结构:**
```json
{
  "rules": [
    {
      "id": "rule-001",
      "name": "开发任务路由",
      "conditions": [
        { "field": "skill03.taskType", "operator": "equals", "value": "development" }
      ],
      "action": {
        "routeTo": "coding-agent",
        "priority": 1
      }
    }
  ]
}
```

**支持的运算符:**
- `equals` - 等于
- `notEquals` - 不等于
- `contains` - 包含
- `greaterThan` - 大于
- `lessThan` - 小于
- `in` - 在列表中

**验收条件:**
- 所有运算符正确实现
- 规则按优先级执行
- 支持多条件组合 (AND 逻辑)

---

### 1.3 决策输出 (FR-003)

**描述:** 生成包含决策理由的输出

**输出格式:**
```json
{
  "decision": {
    "routeTo": "string",
    "confidence": number
  },
  "reasoning": "string",
  "factors": [
    {
      "name": "string",
      "value": "any",
      "weight": number,
      "matchedRule": "string"
    }
  ],
  "matchedRules": ["string"],
  "timestamp": "ISO8601"
}
```

**验收条件:**
- 输出包含完整的 reasoning 字段
- factors 数组列出所有影响决策的因素
- matchedRules 列出所有匹配的规则 ID

---

### 1.4 用户覆盖机制 (FR-004)

**描述:** 允许用户手动指定路由目标

**行为:**
- 当 `userOverride.enabled = true` 时，忽略规则引擎结果
- 直接使用 `userOverride.targetAgent` 作为路由目标
- 在输出中标记为"用户覆盖"

**验收条件:**
- 用户覆盖优先于规则引擎
- 输出中明确标识覆盖状态
- 保留原始规则决策供参考

---

### 1.5 配置加载 (FR-005)

**描述:** 从 JSON 文件加载路由规则配置

**配置路径:** `config/routing-rules.json`

**验收条件:**
- 支持相对路径和绝对路径
- 配置变更无需重启 (可选)
- 配置错误有明确提示

---

## 2. 非功能需求 (Non-Functional Requirements)

### 2.1 性能需求 (NFR-001)

| 指标 | 要求 | 测量方式 |
|------|------|----------|
| 响应时间 | < 1 秒 (P99) | 从输入到输出的端到端时间 |
| 吞吐量 | ≥ 100 请求/秒 | 并发测试 |
| 内存占用 | < 50MB | 稳态运行 |

---

### 2.2 可靠性需求 (NFR-002)

| 指标 | 要求 |
|------|------|
| 可用性 | 99.9% |
| 错误率 | < 0.1% |
| 故障恢复 | 自动重试，最多 3 次 |

---

### 2.3 可维护性需求 (NFR-003)

- **代码覆盖率:** 100% (AC4)
- **文档覆盖率:** 所有公共 API 有文档
- **配置可维护性:** JSON 格式，带注释模板

---

### 2.4 安全性需求 (NFR-004)

- 配置文件权限控制
- 输入验证防止注入攻击
- 不记录敏感数据

---

### 2.5 兼容性需求 (NFR-005)

| 组件 | 版本要求 |
|------|----------|
| Node.js | ≥ 18.0.0 |
| OpenClaw | 最新稳定版 |
| Skill-01 | API v1.0+ |
| Skill-03 | API v1.0+ |

---

## 3. 接口定义

### 3.1 主入口函数

```typescript
interface RoutingDecider {
  decide(input: RoutingInput): Promise<RoutingOutput>;
  loadRules(configPath: string): Promise<void>;
  validateRules(): boolean;
}
```

### 3.2 错误码定义

| 错误码 | 含义 | 处理方式 |
|--------|------|----------|
| RD-001 | 配置加载失败 | 使用默认规则 |
| RD-002 | 输入格式错误 | 返回详细错误信息 |
| RD-003 | 无匹配规则 | 返回默认路由 |
| RD-004 | 规则语法错误 | 启动时抛出异常 |

---

## 4. 数据字典

| 字段 | 类型 | 说明 |
|------|------|------|
| intent | string | Skill-01 识别的意图 |
| confidence | number | 意图置信度 (0-1) |
| taskType | string | 任务类型 |
| complexity | string | 任务复杂度 |
| routeTo | string | 目标智能体标识 |
| reasoning | string | 决策理由文本 |

---

## 5. 验收标准映射

| AC 编号 | 关联需求 | 验证方法 |
|---------|----------|----------|
| AC1 | FR-005 | 检查配置文件加载 |
| AC2 | FR-003 | 检查输出格式 |
| AC3 | FR-004 | 检查用户覆盖功能 |
| AC4 | NFR-003 | 运行测试覆盖率报告 |
| AC5 | NFR-001 | 性能测试 |
| AC6 | NFR-005 | 集成测试 |

---

*文档版本: 1.0*
*创建日期: 2026-03-10*
