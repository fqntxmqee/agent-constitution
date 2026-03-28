---
test_id: T004
title: Hub-Spoke 任务协同验证
complexity: B
agents_involved:
  - navigator
  - clarification
  - understanding
  - resolution
  - acceptance
  - delivery
estimated_duration: 40min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---

## 测试目标

验证 Hub-Spoke 任务协同机制是否符合宪法规范 V3.16.0，包括:
- 银河导航员任务分发
- 各智能体任务接收
- 状态更新同步
- 任务完成汇报

## 前置条件

1. 银河导航员已初始化
2. 所有 8 大智能体已配置
3. 任务索引文件 `.tasks/index.md` 已创建

## 测试步骤

1. **银河导航员创建任务**
   - 创建 `.tasks/index.md` 任务索引
   - 创建 `.tasks/navigator/REQ-TEST-004/task-001.md`
   - 任务状态设为 pending

2. **分派给需求澄清智能体**
   - 更新任务状态为 running
   - 创建 `.tasks/clarification/REQ-TEST-004/task-001.md`

3. **需求澄清智能体执行**
   - 接收任务
   - 生成 clarification-report.md
   - 更新任务状态为 completed
   - 汇报银河导航员

4. **银河导航员更新索引**
   - 更新 `.tasks/index.md` 中任务状态
   - 分派给下一智能体

5. **重复步骤 2-4 直到所有阶段完成**
   - understanding 阶段
   - resolution 阶段
   - acceptance 阶段
   - delivery 阶段

6. **验证任务状态同步**
   - 检查 `.tasks/index.md` 状态正确
   - 检查各智能体任务文件状态一致

## 预期结果

1. 任务正确分发到各智能体
2. 状态更新及时同步
3. 任务完成正确汇报
4. 任务索引完整准确

## 验收标准 (Checklist)

- [ ] `.tasks/index.md` 存在且包含所有任务
- [ ] `.tasks/navigator/REQ-TEST-004/` 目录存在
- [ ] `.tasks/clarification/REQ-TEST-004/` 目录存在
- [ ] `.tasks/understanding/REQ-TEST-004/` 目录存在
- [ ] `.tasks/resolution/REQ-TEST-004/` 目录存在
- [ ] `.tasks/acceptance/REQ-TEST-004/` 目录存在
- [ ] `.tasks/delivery/REQ-TEST-004/` 目录存在
- [ ] 所有任务文件状态正确 (pending → running → completed)
- [ ] 银河导航员收到所有阶段完成汇报
- [ ] `.tasks/index.md` 最终状态为 delivered
