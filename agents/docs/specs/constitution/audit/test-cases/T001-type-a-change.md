---
test_id: T001
title: Type-A 变更完整流程验证
complexity: A
agents_involved:
  - navigator
  - clarification
  - understanding
  - resolution
  - acceptance
  - delivery
  - audit
estimated_duration: 60min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---

## 测试目标

验证 Type-A 变更完整流程是否符合宪法规范 V3.16.0，包括:
- 3 天冷静期要求
- 完整规约文档 (requirements.md, design.md, tasks.md, acceptance-criteria.md)
- Hard Gate 检查 (4 个 Gate)
- 审计检查

## 前置条件

1. 银河导航员已初始化
2. 审计智能体已启动
3. 飞书通知渠道已配置
4. 测试任务目录已创建
5. DECISION_LOG.md 已创建 (用于冷静期计算)

## 测试步骤

1. **创建 Type-A 变更任务**
   - 通过银河导航员创建任务 REQ-TEST-001
   - 标记为 Type-A 变更
   - 创建 DECISION_LOG.md，记录创建时间

2. **执行需求澄清阶段**
   - 需求澄清智能体生成 clarification-report.md
   - 包含 L1-L4 定位
   - 获取用户确认

3. **执行 Gate #1 检查**
   - 检查 clarification-report.md 存在
   - 检查 L1-L4 定位完整
   - 检查用户确认已获取
   - 记录 gate-records.md

4. **执行需求理解阶段**
   - 生成 specs/requirements.md
   - 生成 specs/design.md
   - 生成 specs/tasks.md
   - 生成 specs/acceptance-criteria.md
   - 获取用户确认

5. **执行 Gate #2 检查**
   - 检查 4 个规约文档存在且完整
   - 检查用户确认已获取
   - 记录 gate-records.md

6. **等待冷静期 (模拟 3 天)**
   - 记录 DECISION_LOG.md 创建时间
   - 模拟时间流逝 3 天
   - 验证冷静期检查通过

7. **执行需求解决阶段**
   - 按 tasks.md 执行所有任务
   - 更新 story/state.md 和 story/context/
   - 完成自测验证

8. **执行 Gate #3 检查**
   - 检查所有任务已完成
   - 检查自测验证通过
   - 检查交付物完整
   - 记录 gate-records.md

9. **执行需求验收阶段**
   - 需求验收智能体执行验收测试
   - 生成 acceptance-report.md
   - 获取用户验收确认

10. **执行 Gate #4 检查**
    - 检查验收测试通过
    - 检查用户验收确认
    - 检查交付报告已生成
    - 记录 gate-records.md

11. **执行需求交付阶段**
    - 生成交付报告
    - 同步飞书文档
    - 保存链接到本地

12. **审计检查**
    - 审计智能体执行全流程审计
    - 生成 audit-report.md
    - 验证所有规约遵守

## 预期结果

1. 所有阶段按顺序执行 (clarification → understanding → resolution → acceptance → delivery)
2. 每个阶段产出物完整
3. 4 个 Hard Gate 检查全部通过
4. 冷静期检查通过 (满 3 天)
5. 审计报告生成
6. 交付物完整

## 验收标准 (Checklist)

- [ ] clarification-report.md 存在且包含 L1-L4 定位
- [ ] specs/requirements.md 存在且内容完整
- [ ] specs/design.md 存在且内容完整
- [ ] specs/tasks.md 存在且内容完整
- [ ] specs/acceptance-criteria.md 存在且内容完整
- [ ] acceptance-report.md 存在且验收通过
- [ ] delivery-report.md 存在
- [ ] gate-records.md 存在且包含 4 个 Gate 记录
- [ ] audit-report.md 存在
- [ ] DECISION_LOG.md 存在且冷静期满足 3 天
- [ ] story/state.md 已更新
- [ ] story/context/ 目录有上下文文件
- [ ] 所有任务状态为 completed/delivered
