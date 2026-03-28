---
test_id: T006
title: 决策记录规范验证
complexity: C
agents_involved:
  - navigator
  - audit
estimated_duration: 25min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---

## 测试目标

验证决策记录规范是否符合宪法规范 V3.16.0，包括:
- DECISION_LOG.md 文件格式
- 编号规则 (DEC-XXXX)
- 用户确认记录
- 变更类型标记

## 前置条件

1. 银河导航员已初始化
2. agents/docs/decisions/ 目录已创建

## 测试步骤

1. **创建决策记录**
   - 银河导航员创建 agents/docs/decisions/DEC-0001.md
   - 填写决策标题、日期、变更类型
   - 记录决策背景和目标

2. **记录决策内容**
   - 详细描述决策内容
   - 列出备选方案
   - 记录决策理由

3. **获取用户确认**
   - 在 DECISION_LOG.md 中记录用户确认
   - 包含用户 ID 和确认时间

4. **标记变更类型**
   - 标记为 Type-A/B/C
   - 记录冷静期要求

5. **审计检查**
   - 审计智能体验证 DEC 文件格式
   - 验证编号连续性
   - 验证用户确认存在

## 预期结果

1. DECISION_LOG.md 格式正确
2. 编号规则符合 (DEC-XXXX)
3. 用户确认记录完整
4. 变更类型标记正确

## 验收标准 (Checklist)

- [ ] agents/docs/decisions/DEC-0001.md 存在
- [ ] DEC 文件包含标题、日期、变更类型
- [ ] DEC 文件包含决策内容描述
- [ ] DEC 文件包含备选方案
- [ ] DEC 文件包含决策理由
- [ ] DEC 文件包含用户确认记录
- [ ] 变更类型标记正确 (Type-A/B/C)
- [ ] 冷静期要求记录正确
- [ ] 审计检查通过
