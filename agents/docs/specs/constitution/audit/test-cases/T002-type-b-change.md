---
test_id: T002
title: Type-B 变更快速流程验证
complexity: B
agents_involved:
  - navigator
  - clarification
  - understanding
  - resolution
  - acceptance
  - delivery
  - audit
estimated_duration: 45min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---

## 测试目标

验证 Type-B 变更快速流程是否符合宪法规范 V3.16.0，包括:
- 24 小时冷静期要求
- 核心规约文档
- Hard Gate 检查
- 审计抽查

## 前置条件

1. 银河导航员已初始化
2. 审计智能体已启动
3. 测试任务目录已创建
4. DECISION_LOG.md 已创建

## 测试步骤

1. **创建 Type-B 变更任务**
   - 通过银河导航员创建任务 REQ-TEST-002
   - 标记为 Type-B 变更
   - 创建 DECISION_LOG.md

2. **执行需求澄清阶段**
   - 生成 clarification-report.md
   - 获取用户确认

3. **执行 Gate #1 检查**
   - 验证澄清报告完整
   - 记录检查结果

4. **执行需求理解阶段**
   - 生成 specs/requirements.md
   - 生成 specs/design.md
   - 生成 specs/tasks.md
   - 生成 specs/acceptance-criteria.md

5. **执行 Gate #2 检查**
   - 验证 4 个规约文档存在
   - 记录检查结果

6. **等待冷静期 (模拟 24 小时)**
   - 记录 DECISION_LOG.md 创建时间
   - 模拟时间流逝 24 小时
   - 验证冷静期检查通过

7. **执行需求解决阶段**
   - 按 tasks.md 执行任务
   - 完成自测验证

8. **执行 Gate #3 检查**
   - 验证任务完成
   - 记录检查结果

9. **执行需求验收阶段**
   - 生成 acceptance-report.md
   - 获取用户确认

10. **执行 Gate #4 检查**
    - 验证验收通过
    - 记录检查结果

11. **执行需求交付阶段**
    - 生成交付报告
    - 完成交付

12. **审计抽查**
    - 审计智能体执行抽查
    - 生成 audit-report.md

## 预期结果

1. 所有阶段按顺序执行
2. 24 小时冷静期满足
3. Hard Gate 检查全部通过
4. 审计报告生成

## 验收标准 (Checklist)

- [ ] clarification-report.md 存在
- [ ] specs/requirements.md 存在
- [ ] specs/design.md 存在
- [ ] specs/tasks.md 存在
- [ ] specs/acceptance-criteria.md 存在
- [ ] acceptance-report.md 存在
- [ ] delivery-report.md 存在
- [ ] gate-records.md 存在且包含 4 个 Gate 记录
- [ ] audit-report.md 存在
- [ ] DECISION_LOG.md 存在且冷静期满足 24 小时
- [ ] 所有任务状态为 completed/delivered
