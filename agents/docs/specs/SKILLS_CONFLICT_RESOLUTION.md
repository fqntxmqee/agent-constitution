# 宪法技能表冲突解决方案

**版本**: V3.7.2  
**创建日期**: 2026-03-10  
**状态**: ✅ 已完成  
**完成时间**: 2026-03-10 11:20

---

## 🔍 问题概述

在 V3.7 技能开发过程中，出现了以下冲突和遗漏：

1. **命名冲突**: Skill-06 有两个版本
2. **功能不匹配**: 部分技能功能与原计划不符
3. **技能缺失**: P0 计划中的部分技能未开发
4. **审计技能缺失**: 审计智能体无专用技能

---

## 📊 冲突清单

### 1. 命名冲突

| Skill ID | 版本 1 | 版本 2 | 状态 |
|----------|--------|--------|------|
| **Skill-06** | blueprint-converter (多模态蓝图转换器) | requirement-resolution (需求解决智能体) | ❌ 冲突 |

**解决方案**: 
- 保留 `skill-06-blueprint-converter`（符合 P0 计划）
- 重命名 `skill-06-requirement-resolution` → `skill-07-requirement-resolution`
- 后续技能 ID 依次顺延

---

### 2. 功能不匹配

| Skill ID | P0 计划 | 实际开发 | 状态 |
|----------|---------|----------|------|
| **Skill-09** | 跨域验收标准定义器 | 工具调用智能体 | ❌ 不匹配 |
| **Skill-10** | 任务原子化拆解器 | 上下文管理智能体 | ❌ 不匹配 |
| **Skill-25** | 敏感信息终检器 | 系统监控智能体 | ❌ 不匹配 |

**解决方案**:
- 保留已开发技能（功能有用）
- 更新 P0 计划文档，使其与实际一致
- 或补全原计划技能（根据需要）

---

### 3. 技能缺失

| Skill ID | P0 计划名称 | 归属智能体 | 状态 |
|----------|------------|-----------|------|
| **Skill-13** | 自适应测试/审查生成器 | 需求解决 | ❌ 缺失 |
| **Skill-16** | 自动化测试/审查运行器 | 需求验收 | ❌ 缺失 |
| **Skill-18** | 事实与逻辑验证器 | 需求验收 | ❌ 缺失 |

**解决方案**: 
- 评估是否需要补全
- 如需要，创建新的开发任务

---

### 4. 审计技能缺失

| Skill ID | 名称 | 归属智能体 | 状态 |
|----------|------|-----------|------|
| **Skill-A01** | 日志分析器 | 审计 | ❌ 缺失 |
| **Skill-A02** | 合规检查器 | 审计 | ❌ 缺失 |
| **Skill-A03** | 规约验证器 | 审计 | ❌ 缺失 |
| **Skill-A04** | 审计报告生成器 | 审计 | ❌ 缺失 |

**解决方案**: 
- 创建审计智能体专用技能
- 实现日志分析、合规检查等功能

---

## ✅ 最终技能映射表（V3.7.2 · 已完成）

### 需求澄清智能体

| Skill ID | 简称 | 功能 | 状态 |
|----------|------|------|------|
| Skill-01 | intent-classifier | 意图识别 | ✅ 完成 |
| Skill-03 | ambiguity-detector | 模糊性检测 | ✅ 完成 |
| Skill-04 | routing-decider | 路由决策 | ✅ 完成 |

### 需求理解智能体

| Skill ID | 简称 | 功能 | 状态 |
|----------|------|------|------|
| Skill-05 | requirement-understanding | 产出 OpenSpec | ✅ 完成 |
| Skill-06 | blueprint-converter | 蓝图转换 | ✅ 完成 |

### 需求解决智能体

| Skill ID | 简称 | 功能 | 状态 |
|----------|------|------|------|
| Skill-07 | requirement-resolution | 执行开发任务 | ✅ 完成 |
| Skill-08 | memory-manager | 管理记忆 | ✅ 完成 |
| Skill-09 | tool-caller | 调用工具/API | ✅ 完成 |
| Skill-10 | context-manager | 管理上下文 | ✅ 完成 |

### 需求验收智能体

| Skill ID | 简称 | 功能 | 状态 |
|----------|------|------|------|
| Skill-16 | acceptance-tester | 独立验收 | ✅ 完成 |

### 需求交付智能体

| Skill ID | 简称 | 功能 | 状态 |
|----------|------|------|------|
| Skill-25 | system-monitor | 系统监控 | ✅ 完成 |

### 审计智能体

| Skill ID | 简称 | 功能 | 状态 |
|----------|------|------|------|
| Skill-A01 | log-analyzer | 日志分析 | ✅ 完成 |
| Skill-A02 | compliance-checker | 合规检查 | ✅ 完成 |
| Skill-A03 | spec-validator | 规约验证 | ✅ 完成 |
| Skill-A04 | report-generator | 报告生成 | ✅ 完成 |

---

## 📁 目录结构调整

### 当前结构（有冲突）

```
agents/skills/
├── skill-01-intent-classifier/          ✅
├── skill-03-ambiguity-detector/         ✅
├── skill-04-routing-decider/            ✅
├── skill-05-requirement-understanding/  ✅
├── skill-06-blueprint-converter/        ✅
├── skill-06-requirement-resolution/     ❌ 冲突！
├── skill-07-acceptance-tester/          ✅
├── skill-08-memory-manager/             ✅
├── skill-09-tool-caller/                ✅
├── skill-10-context-manager/            ✅
└── skill-25-system-monitor/             ✅
```

### 调整后结构（解决冲突）

```
agents/skills/
├── skill-01-intent-classifier/          ✅
├── skill-03-ambiguity-detector/         ✅
├── skill-04-routing-decider/            ✅
├── skill-05-requirement-understanding/  ✅
├── skill-06-blueprint-converter/        ✅
├── skill-07-requirement-resolution/     ✅ （重命名）
├── skill-08-memory-manager/             ✅
├── skill-09-tool-caller/                ✅
├── skill-10-context-manager/            ✅
├── skill-16-acceptance-tester/          ✅ （重编号）
├── skill-25-system-monitor/             ✅
└── audit/                               ⏳ 新建
    ├── skill-a01-log-analyzer/
    ├── skill-a02-compliance-checker/
    ├── skill-a03-spec-validator/
    └── skill-a04-report-generator/
```

---

## 🛠️ 执行步骤

### 步骤 1: 解决命名冲突（10 分钟）

```bash
# 1. 重命名 skill-06-requirement-resolution
mv agents/skills/skill-06-requirement-resolution agents/skills/skill-07-requirement-resolution

# 2. 重命名 skill-07-acceptance-tester
mv agents/skills/skill-07-acceptance-tester agents/skills/skill-16-acceptance-tester

# 3. 更新 SKILL.md 中的技能 ID
```

### 步骤 2: 更新 P0 计划文档（15 分钟）

- 更新 `P0_SKILLS_IMPLEMENTATION_PLAN.md`
- 使文档与实际开发一致
- 标记已取消的技能

### 步骤 3: 创建审计技能（60 分钟）

- 创建 `agents/skills/audit/` 目录
- 开发 4 个审计技能
- 编写测试和文档

### 步骤 4: 更新宪法规范（15 分钟）

- 更新 `CONSTITUTION_V3.7.md`
- 更新技能映射表
- 更新智能体职责说明

---

## 📊 影响评估

### 不受影响的部分

- ✅ 已完成的 11 个技能功能正常
- ✅ 智能体工作流不受影响
- ✅ 现有任务执行不受影响

### 需要更新的部分

- ⚠️ 技能引用路径（代码中）
- ⚠️ 文档中的技能 ID
- ⚠️ 测试用例中的引用

---

## ✅ 验收标准

- [ ] 无命名冲突（每个 Skill ID 唯一）
- [ ] 技能映射表完整准确
- [ ] 审计智能体有专用技能
- [ ] 所有文档更新完成
- [ ] 测试通过率 100%

---

## 📝 决策记录

| 决策 | 原因 | 影响 |
|------|------|------|
| 保留已开发技能 | 功能有用，已完成 | 需更新 P0 计划 |
| 重命名冲突技能 | 避免 ID 冲突 | 需更新引用 |
| 创建审计技能 | 审计智能体需要 | 提高审计效率 |
| 取消部分 P0 技能 | 功能已被替代 | 减少冗余 |

---

**创建时间**: 2026-03-10 09:40  
**创建人**: 小欧 (Xiao Ou)  
**状态**: 待用户确认执行
