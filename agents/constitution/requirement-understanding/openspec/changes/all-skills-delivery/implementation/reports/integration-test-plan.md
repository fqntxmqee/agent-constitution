# 技能集成测试计划

## 1. 测试概述

**测试目标:** 验证 11 个 P0 技能间的集成调用正确性

**测试范围:**
- 技能间调用测试
- 数据流验证
- 错误处理测试
- 性能测试

**测试时间:** 0.5 天 (4 小时)

**前置条件:**
- 11 个 P0 技能单元测试通过
- 技能接口定义完成
- 测试环境就绪

---

## 2. 测试场景

### 2.1 技能间调用测试

**测试技能对:**

| 用例 ID | 调用方 | 被调用方 | 测试内容 | 优先级 |
|---------|--------|----------|----------|--------|
| INT-001 | Skill-01 | Skill-03 | 意图→任务分析 | P0 |
| INT-002 | Skill-03 | Skill-04 | 任务分析→路由 | P0 |
| INT-003 | Skill-04 | Skill-05 | 路由→需求理解 | P0 |
| INT-004 | Skill-05 | Skill-06 | 蓝图→执行 | P0 |
| INT-005 | Skill-06 | Skill-07 | 执行→验收 | P0 |
| INT-006 | Skill-06 | Skill-09 | 执行→工具调用 | P0 |
| INT-007 | Skill-08 | All | 记忆存取 | P0 |
| INT-008 | Skill-10 | All | 上下文注入 | P0 |
| INT-009 | Skill-25 | All | 监控数据采集 | P1 |
| INT-010 | Skill-16 | All | 安全检查 | P1 |

**验证点:**
- [ ] 接口调用成功
- [ ] 参数传递正确
- [ ] 返回值格式正确
- [ ] 超时处理正确

---

### 2.2 数据流验证

**数据流路径:**

```
用户输入
   │
   ▼
┌─────────────┐
│ Skill-01    │ 意图识别
│ (intent)    │
└──────┬──────┘
       │ intent + entities
       ▼
┌─────────────┐
│ Skill-03    │ 任务分析
│ (analyzer)  │
└──────┬──────┘
       │ taskType + complexity + resources
       ▼
┌─────────────┐
│ Skill-04    │ 路由决策
│ (routing)   │
└──────┬──────┘
       │ routeTo + reasoning
       ▼
┌─────────────┐
│ Skill-05    │ 需求理解
│ (understand)│
└──────┬──────┘
       │ blueprint + AC
       ▼
┌─────────────┐
│ Skill-06    │ 需求解决
│ (solver)    │
└──────┬──────┘
       │ result
       ▼
┌─────────────┐
│ Skill-07    │ 验收测试
│ (accept)    │
└──────┬──────┘
       │ pass/fail + report
       ▼
用户交付
```

**测试用例:**

| 用例 ID | 数据流 | 验证内容 | 优先级 |
|---------|--------|----------|--------|
| DF-001 | 输入→意图 | 意图识别数据完整 | P0 |
| DF-002 | 意图→分析 | 分析输入数据完整 | P0 |
| DF-003 | 分析→路由 | 路由输入数据完整 | P0 |
| DF-004 | 路由→理解 | 理解输入数据完整 | P0 |
| DF-005 | 理解→解决 | 蓝图数据完整 | P0 |
| DF-006 | 解决→验收 | 执行结果数据完整 | P0 |

---

### 2.3 错误处理测试

**错误场景:**

| 用例 ID | 错误场景 | 预期处理 | 优先级 |
|---------|----------|----------|--------|
| ERR-001 | 技能调用超时 | 重试 3 次后失败 | P0 |
| ERR-002 | 无效输入格式 | 返回明确错误 | P0 |
| ERR-003 | 技能不可用 | 降级处理 | P0 |
| ERR-004 | 数据格式不匹配 | 数据转换/错误 | P0 |
| ERR-005 | 资源不足 | 排队/拒绝 | P1 |
| ERR-006 | 网络异常 | 重试/失败 | P1 |

**验证点:**
- [ ] 错误正确捕获
- [ ] 错误信息清晰
- [ ] 重试机制有效
- [ ] 降级处理正确

---

### 2.4 性能测试

**性能指标:**

| 指标 | 要求 | 测量方式 |
|------|------|----------|
| 响应时间 | <3 秒 (P99) | 端到端时间 |
| 吞吐量 | ≥50 req/s | 并发测试 |
| 技能调用延迟 | <500ms | 单次调用 |
| 内存占用 | <100MB | 稳态运行 |

**测试用例:**

| 用例 ID | 测试类型 | 并发数 | 持续时间 | 优先级 |
|---------|----------|--------|----------|--------|
| PERF-001 | 单次请求 | 1 | 100 次 | P0 |
| PERF-002 | 并发请求 | 10 | 5 分钟 | P0 |
| PERF-003 | 压力测试 | 50 | 10 分钟 | P1 |
| PERF-004 | 稳定性测试 | 20 | 30 分钟 | P1 |

---

## 3. 测试环境

### 3.1 环境配置

```yaml
environment:
  name: integration-test-env
  node: v22.15.1
  openclaw: latest
  skills:
    tested: 11
    versions: all latest
  monitoring:
    enabled: true
    metrics: [response_time, throughput, error_rate]
```

### 3.2 测试工具

```json
{
  "testFramework": "Jest",
  "loadTesting": "k6",
  "mocking": "jest.mock",
  "reporting": "jest-html-reporter"
}
```

---

## 4. 测试执行

### 4.1 执行步骤

```bash
# 1. 准备测试环境
npm install
npm run build

# 2. 运行集成测试
npm run test:integration

# 3. 运行性能测试
npm run test:performance

# 4. 生成测试报告
npm run report:integration

# 5. 截图取证
npm run screenshot:integration
```

### 4.2 测试脚本示例

```typescript
// tests/integration/skill-calls.test.ts
describe('技能间调用集成测试', () => {
  it('INT-001: Skill-01 → Skill-03 调用', async () => {
    const input = '创建一个 Python 技能';
    
    // Skill-01 意图识别
    const intent = await skill01.recognize(input);
    
    // Skill-03 任务分析
    const analysis = await skill03.analyze({ intent });
    
    expect(analysis.taskType).toBeDefined();
    expect(analysis.complexity).toBeDefined();
  });
  
  it('INT-004: Skill-05 → Skill-06 调用', async () => {
    const blueprint = {
      taskType: 'development',
      steps: ['step1', 'step2'],
      ac: ['AC1', 'AC2']
    };
    
    // Skill-06 执行蓝图
    const result = await skill06.solve(blueprint);
    
    expect(result.status).toBe('success');
    expect(result.deliverable).toBeDefined();
  });
});

// tests/integration/error-handling.test.ts
describe('错误处理集成测试', () => {
  it('ERR-001: 技能调用超时处理', async () => {
    jest.spyOn(skill06, 'solve').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 10000))
    );
    
    await expect(skill06.solve(blueprint))
      .rejects
      .toThrow('Timeout');
  });
});
```

---

## 5. 验收标准

| 标准 | 要求 | 验证方式 |
|------|------|----------|
| INT-AC1 | 10 个调用测试 100% 通过 | 测试报告 |
| INT-AC2 | 6 个数据流验证通过 | 数据检查 |
| INT-AC3 | 6 个错误处理测试通过 | 错误注入 |
| INT-AC4 | 4 个性能测试达标 | 性能报告 |
| INT-AC5 | 响应时间 <3 秒 | 性能监控 |
| INT-AC6 | 截图取证完整 | 截图检查 |

---

## 6. 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 技能接口变更 | 低 | 高 | 接口版本控制 |
| 测试数据污染 | 中 | 中 | 测试数据隔离 |
| 性能环境差异 | 中 | 中 | 环境标准化 |

---

*文档版本: 1.0*
*创建日期: 2026-03-11*
*执行日期: 2026-03-11*
