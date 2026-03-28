---
test_id: T005
title: Story File 上下文管理验证
complexity: B
agents_involved:
  - navigator
  - clarification
  - understanding
  - resolution
  - audit
estimated_duration: 35min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---

## 测试目标

验证 Story File 上下文管理机制是否符合宪法规范 V3.16.0，包括:
- story/state.md 状态更新
- story/context/ 上下文文件管理
- 阶段完成后状态同步
- 上下文加载验证

## 前置条件

1. 银河导航员已初始化
2. story/state.md 已创建
3. story/context/ 目录已创建

## 测试步骤

1. **初始化 Story File**
   - 创建 story/state.md
   - 创建 story/context/ 目录
   - 设置初始状态

2. **执行需求澄清阶段**
   - 需求澄清智能体加载 story/state.md
   - 生成 clarification-report.md
   - 更新 story/state.md (阶段完成标记)
   - 创建 story/context/clarification-xxx.md

3. **执行需求理解阶段**
   - 需求理解智能体加载 story/state.md 和上下文
   - 生成 OpenSpec 文档
   - 更新 story/state.md
   - 创建 story/context/understanding-xxx.md

4. **执行需求解决阶段**
   - 需求解决智能体加载 story/state.md 和上下文
   - 执行任务
   - 更新 story/state.md
   - 创建 story/context/resolution-xxx.md

5. **审计检查**
   - 审计智能体验证 story/state.md 更新及时
   - 验证 story/context/ 文件完整
   - 检查 VIO-007 违规 (Story File 未更新)

## 预期结果

1. 每个阶段完成后 story/state.md 及时更新
2. story/context/ 目录包含各阶段上下文文件
3. 无 VIO-007 违规
4. 上下文加载正确

## 验收标准 (Checklist)

- [ ] story/state.md 存在
- [ ] story/state.md 包含所有阶段状态
- [ ] story/state.md 最后修改时间为最近
- [ ] story/context/ 目录存在
- [ ] story/context/clarification-xxx.md 存在
- [ ] story/context/understanding-xxx.md 存在
- [ ] story/context/resolution-xxx.md 存在
- [ ] 审计检查无 VIO-007 违规
- [ ] 各智能体正确加载上下文
