# 端到端 (E2E) 流程验证测试计划

## 1. 测试概述

**测试目标:** 验证 38 个智能体技能的端到端工作流程正确性

**测试范围:**
- 标准构建流验证
- 快速执行流验证
- 复合意图处理验证

**测试时间:** 0.5 天 (4 小时)

**前置条件:**
- 阶段一 (P0 验收) 已完成
- 11 个技能测试通过率 100%
- 测试环境就绪

---

## 2. 测试场景

### 2.1 场景 A: 标准构建流验证

**流程:** 澄清 → 理解 → 解决 → 验收 → 交付

**测试用例:**

| 用例 ID | 测试场景 | 输入 | 预期输出 | 优先级 |
|---------|----------|------|----------|--------|
| E2E-001 | 开发类任务 | "创建一个 Python 技能" | 完整技能代码 + 测试 | P0 |
| E2E-002 | 内容类任务 | "写一篇技术文档" | 完整文档 | P0 |
| E2E-003 | 技能/数据任务 | "创建一个数据查询技能" | 技能实现 + 数据接口 | P0 |
| E2E-004 | 运维类任务 | "部署一个服务" | 部署完成 + 健康检查 | P1 |

**验证点:**
- [ ] Skill-02 需求澄清正确识别模糊点
- [ ] Skill-05 需求理解生成正确蓝图
- [ ] Skill-06 需求解决执行蓝图
- [ ] Skill-07 验收测试验证 AC
- [ ] 最终交付物符合预期

---

### 2.2 场景 B: 快速执行流验证

**流程:** 澄清 → 解决 → 验收 → 交付

**测试用例:**

| 用例 ID | 测试场景 | 输入 | 预期输出 | 优先级 |
|---------|----------|------|----------|--------|
| E2E-005 | 简单查询 | "今天天气如何" | 天气信息 | P1 |
| E2E-006 | 简单计算 | "计算 123*456" | 正确结果 | P1 |
| E2E-007 | 简单翻译 | "翻译 Hello 到中文" | 正确翻译 | P1 |

**验证点:**
- [ ] 快速流正确跳过理解阶段
- [ ] Skill-06 直接执行简单任务
- [ ] Skill-07 验收通过
- [ ] 响应时间 <3 秒

---

### 2.3 场景 C: 复合意图处理验证

**流程:** 意图识别 → 任务分解 → 并行/串行执行 → 结果融合

**测试用例:**

| 用例 ID | 测试场景 | 输入 | 预期输出 | 优先级 |
|---------|----------|------|----------|--------|
| E2E-008 | 多步骤任务 | "创建技能并测试" | 技能 + 测试报告 | P0 |
| E2E-009 | 多模态任务 | "分析这张图并写报告" | 分析结果 + 报告 | P1 |
| E2E-010 | 依赖任务 | "先分析数据再生成图表" | 分析 + 图表 | P1 |

**验证点:**
- [ ] Skill-01 正确识别复合意图
- [ ] Skill-03 正确分解任务
- [ ] Skill-04 正确路由各子任务
- [ ] 结果正确融合

---

## 3. 测试环境

### 3.1 环境配置

```yaml
environment:
  name: e2e-test-env
  node: v22.15.1
  openclaw: latest
  skills:
    - skill-01 (intent)
    - skill-02 (clarifier)
    - skill-03 (task-analyzer)
    - skill-04 (routing)
    - skill-05 (understanding)
    - skill-06 (solver)
    - skill-07 (acceptance)
    - skill-08 (memory)
    - skill-09 (tool)
    - skill-10 (context)
    - skill-16 (security)
    - skill-25 (monitor)
```

### 3.2 测试数据

```json
{
  "testCases": 10,
  "expectedPassRate": "100%",
  "maxResponseTime": "3s",
  "skillsInvolved": 11
}
```

---

## 4. 测试执行

### 4.1 执行步骤

```bash
# 1. 准备测试环境
npm install
npm run build

# 2. 运行 E2E 测试
npm run test:e2e

# 3. 生成测试报告
npm run report:e2e

# 4. 截图取证
npm run screenshot:e2e
```

### 4.2 测试脚本

```typescript
// tests/e2e/standard-flow.test.ts
describe('标准构建流 E2E 测试', () => {
  it('E2E-001: 开发类任务完整流程', async () => {
    // 1. 用户输入
    const input = '创建一个 Python 技能';
    
    // 2. 意图识别 (Skill-01)
    const intent = await skill01.recognize(input);
    expect(intent.type).toBe('development');
    
    // 3. 需求澄清 (Skill-02)
    const clarified = await skill02.clarify(intent);
    
    // 4. 任务分析 (Skill-03)
    const analysis = await skill03.analyze(clarified);
    expect(analysis.taskType).toBe('development');
    
    // 5. 路由决策 (Skill-04)
    const routing = await skill04.decide(analysis);
    expect(routing.routeTo).toBe('skill-05');
    
    // 6. 需求理解 (Skill-05)
    const blueprint = await skill05.understand(routing);
    expect(blueprint.ac).toBeDefined();
    
    // 7. 需求解决 (Skill-06)
    const result = await skill06.solve(blueprint);
    
    // 8. 验收测试 (Skill-07)
    const acceptance = await skill07.accept(result, blueprint.ac);
    expect(acceptance.passed).toBe(true);
    
    // 9. 交付
    expect(result.deliverable).toBeDefined();
  });
});
```

---

## 5. 验收标准

| 标准 | 要求 | 验证方式 |
|------|------|----------|
| E2E-AC1 | 10 个测试用例 100% 通过 | 测试报告 |
| E2E-AC2 | 标准构建流正确执行 | 流程追踪 |
| E2E-AC3 | 快速执行流正确执行 | 流程追踪 |
| E2E-AC4 | 复合意图正确处理 | 结果验证 |
| E2E-AC5 | 响应时间 <3 秒 | 性能监控 |
| E2E-AC6 | 截图取证完整 | 截图检查 |

---

## 6. 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 技能间通信失败 | 低 | 高 | 重试机制 |
| 响应时间超时 | 中 | 中 | 性能优化 |
| 测试环境不稳定 | 低 | 中 | 环境检查 |

---

*文档版本: 1.0*
*创建日期: 2026-03-11*
*执行日期: 2026-03-11*
