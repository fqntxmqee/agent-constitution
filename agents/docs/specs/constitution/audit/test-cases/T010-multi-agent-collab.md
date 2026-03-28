---
test_id: T010
title: 多智能体协同复杂场景验证
complexity: S
agents_involved:
  - navigator
  - clarification
  - understanding
  - resolution
  - acceptance
  - delivery
  - audit
  - summary-reflection
estimated_duration: 75min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---

## 测试目标

验证多智能体协同复杂场景是否符合宪法规范 V3.16.0，包括:
- 8 大智能体完整流程
- 智能体间协同
- 状态同步
- 异常处理

## 前置条件

1. 所有 8 大智能体已配置并启动
2. 银河导航员已初始化
3. 飞书通知渠道已配置
4. 任务索引已创建

## 测试步骤

1. **银河导航员初始化任务**
   - 创建复杂任务 REQ-TEST-010
   - 标记为 S 级复杂度
   - 创建任务索引

2. **需求澄清阶段**
   - 需求澄清智能体接收任务
   - 执行 L1-L4 分析
   - 生成 clarification-report.md
   - 获取用户确认
   - 更新任务状态

3. **需求理解阶段**
   - 需求理解智能体接收任务
   - 生成 OpenSpec 文档 (requirements/design/tasks/acceptance-criteria)
   - 获取用户确认
   - 更新任务状态

4. **需求解决阶段**
   - 需求解决智能体接收任务
   - 通过 sessions_spawn 执行子任务
   - 更新 story/state.md 和 story/context/
   - 完成自测验证
   - 更新任务状态

5. **需求验收阶段**
   - 需求验收智能体接收任务
   - 执行验收测试
   - 生成 acceptance-report.md
   - 获取用户确认
   - 更新任务状态

6. **需求交付阶段**
   - 需求交付智能体接收任务
   - 生成交付报告
   - 同步飞书文档
   - 保存链接
   - 更新任务状态

7. **审计智能体全程监控**
   - 实时监控各阶段执行
   - 执行 Hard Gate 检查
   - 生成 audit-report.md

8. **总结反思智能体复盘**
   - 任务完成后执行复盘
   - 生成 summary-report.md
   - 记录经验教训

## 预期结果

1. 8 大智能体按顺序协同工作
2. 每个阶段产出物完整
3. 状态同步正确
4. 无违规熔断
5. 审计和总结报告完整

## 验收标准 (Checklist)

- [ ] clarification-report.md 存在且完整
- [ ] specs/requirements.md 存在且完整
- [ ] specs/design.md 存在且完整
- [ ] specs/tasks.md 存在且完整
- [ ] specs/acceptance-criteria.md 存在且完整
- [ ] acceptance-report.md 存在且完整
- [ ] delivery-report.md 存在且完整
- [ ] gate-records.md 存在且包含 4 个 Gate 记录
- [ ] audit-report.md 存在且完整
- [ ] summary-report.md 存在且完整
- [ ] story/state.md 已更新
- [ ] story/context/ 目录有上下文文件
- [ ] 所有任务状态为 delivered
- [ ] 无熔断事件发生
- [ ] 飞书文档同步成功
- [ ] 所有智能体正确协同
