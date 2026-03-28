---
test_id: T007
title: 版本备份与回滚验证
complexity: A
agents_involved:
  - navigator
  - resolution
  - audit
estimated_duration: 50min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---

## 测试目标

验证版本备份与回滚机制是否符合宪法规范 V3.16.0，包括:
- 白名单文件备份
- Git Hook 配置
- 版本标签管理
- 回滚流程

## 前置条件

1. Git 仓库已初始化
2. 白名单配置文件已创建
3. Git Hook 已配置

## 测试步骤

1. **配置白名单**
   - 创建 .backup-whitelist 文件
   - 列出需要备份的文件/目录
   - 配置备份策略

2. **配置 Git Hook**
   - 创建 .git/hooks/pre-commit
   - 添加备份检查逻辑
   - 测试 Hook 触发

3. **创建版本备份**
   - 修改白名单内文件
   - 执行 git commit
   - 触发自动备份
   - 验证备份文件存在

4. **创建版本标签**
   - 执行 git tag v1.0.0
   - 验证标签创建成功
   - 记录标签信息

5. **模拟回滚场景**
   - 修改文件引入问题
   - 执行 git revert 或 git reset
   - 验证回滚成功
   - 恢复备份文件

6. **审计检查**
   - 审计智能体验证备份完整
   - 验证 Git Hook 正常工作
   - 验证回滚流程正确

## 预期结果

1. 白名单文件正确备份
2. Git Hook 正常触发
3. 版本标签管理正确
4. 回滚流程有效

## 验收标准 (Checklist)

- [ ] .backup-whitelist 文件存在
- [ ] 白名单包含正确的文件/目录
- [ ] .git/hooks/pre-commit 存在
- [ ] Git Hook 包含备份检查逻辑
- [ ] 执行 commit 时触发备份
- [ ] 备份文件存在于正确位置
- [ ] git tag 创建成功
- [ ] 回滚流程验证通过
- [ ] 审计检查通过
