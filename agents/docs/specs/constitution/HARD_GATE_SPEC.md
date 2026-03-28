# Hard Gate 规范 (Hard Gate Specification)

**文档类型**: 宪法规范执行保障体系 - Hard Gate 规范  
**版本号**: V1.0  
**创建日期**: 2026-03-27  
**状态**: 已生效  
**关联规范**: `agents/docs/specs/constitution/CONSTITUTION.md`

---

## 一、概述

### 1.1 目的

建立 Hard Gate 检查机制，在智能体阶段流转时强制执行检查清单，确保每个阶段的产出物完整合规后方可进入下一阶段。

### 1.2 核心原则

- **强制检查**: 阶段流转前必须通过 Hard Gate 检查
- **清单驱动**: 每个 Gate 有明确的检查清单
- **记录追溯**: 所有检查结果写入任务文件
- **整改闭环**: 不通过时生成整改建议，整改后重新检查

### 1.3 适用范围

- 所有 8 大智能体的阶段流转
- 所有任务执行流程
- 所有复杂度级别 (A/B/C/S)

---

## 二、4 个 Hard Gate 检查点

### 2.1 Gate 总览

| Gate 编号 | 检查点 | 前置阶段 | 后置阶段 | 检查时机 |
|-----------|--------|----------|----------|----------|
| Gate #1 | 澄清→理解 | Clarification | Understanding | 澄清完成后 |
| Gate #2 | 理解→解决 | Understanding | Resolution | 理解完成后 |
| Gate #3 | 解决→验收 | Resolution | Acceptance | 解决完成后 |
| Gate #4 | 验收→交付 | Acceptance | Delivery | 验收完成后 |

### 2.2 Gate 流转图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Clarification│────▶│ Understanding│────▶│  Resolution │────▶│ Acceptance  │────▶│   Delivery  │
│   (澄清)     │ G1  │   (理解)     │ G2  │   (解决)    │ G3  │   (验收)    │ G4  │   (交付)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       ▲                   ▲                   ▲                   ▲                   ▲
       │                   │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┴───────────────────┘
                                    未通过时退回整改
```

---

## 三、Gate 检查清单

### 3.1 Gate #1: 澄清→理解

**检查时机**: 需求澄清完成后，进入需求理解前

**检查清单**:

| 序号 | 检查项 | 检查方法 | 必需 |
|------|--------|----------|------|
| 1 | 意图识别报告已生成 | 检查 `.tasks/{task-id}/clarification-report.md` 存在 | ✅ |
| 2 | L1-L4 定位已完成 | 检查报告中包含 L1-L4 定位内容 | ✅ |
| 3 | 用户确认已获取 | 检查报告中有用户确认记录 | ✅ |
| 4 | HARD GATE 检查通过 | 检查 Gate #1 检查记录 | ✅ |

**检查清单 (Markdown 格式)**:
```markdown
### Gate #1: Clarification → Understanding
- [ ] 意图识别报告已生成 (clarification-report.md)
- [ ] L1-L4 定位已完成
- [ ] 用户确认已获取
- [ ] HARD GATE 检查通过
```

**通过标准**: 4 项全部勾选

**不通过处理**: 退回 Clarification 阶段，补充缺失内容

---

### 3.2 Gate #2: 理解→解决

**检查时机**: 需求理解完成后，进入需求解决前

**检查清单**:

| 序号 | 检查项 | 检查方法 | 必需 |
|------|--------|----------|------|
| 1 | 需求规格文档已生成 | 检查 `specs/requirements.md` 存在且内容完整 | ✅ |
| 2 | 技术设计方案已生成 | 检查 `specs/design.md` 存在且内容完整 | ✅ |
| 3 | 任务清单已生成 | 检查 `specs/tasks.md` 存在且内容完整 | ✅ |
| 4 | 验收标准已生成 | 检查 `specs/acceptance-criteria.md` 存在且内容完整 | ✅ |
| 5 | 用户确认已获取 | 检查 OpenSpec 文档有用户确认记录 | ✅ |

**检查清单 (Markdown 格式)**:
```markdown
### Gate #2: Understanding → Resolution
- [ ] 需求规格文档已生成 (specs/requirements.md)
- [ ] 技术设计方案已生成 (specs/design.md)
- [ ] 任务清单已生成 (specs/tasks.md)
- [ ] 验收标准已生成 (specs/acceptance-criteria.md)
- [ ] 用户确认已获取
```

**通过标准**: 5 项全部勾选

**不通过处理**: 退回 Understanding 阶段，补充缺失文档

---

### 3.3 Gate #3: 解决→验收

**检查时机**: 需求解决完成后，进入需求验收前

**检查清单**:

| 序号 | 检查项 | 检查方法 | 必需 |
|------|--------|----------|------|
| 1 | 所有任务已完成 | 检查 `specs/tasks.md` 中所有任务状态为 completed | ✅ |
| 2 | 自测验证通过 | 检查任务文件中有自测验证记录 | ✅ |
| 3 | 交付物完整 | 检查交付物清单中的所有文件存在 | ✅ |
| 4 | 代码审查通过 (如适用) | 检查代码审查记录 (若有代码变更) | ⚠️ |

**检查清单 (Markdown 格式)**:
```markdown
### Gate #3: Resolution → Acceptance
- [ ] 所有任务已完成
- [ ] 自测验证通过
- [ ] 交付物完整
- [ ] 代码审查通过 (如适用)
```

**通过标准**: 所有适用项全部勾选

**不通过处理**: 退回 Resolution 阶段，完成缺失任务或修复问题

---

### 3.4 Gate #4: 验收→交付

**检查时机**: 需求验收完成后，进入需求交付前

**检查清单**:

| 序号 | 检查项 | 检查方法 | 必需 |
|------|--------|----------|------|
| 1 | 验收测试通过 | 检查 `acceptance-report.md` 中验收结论为通过 | ✅ |
| 2 | 用户验收确认 | 检查验收报告中有用户确认记录 | ✅ |
| 3 | 交付报告已生成 | 检查 `delivery-report.md` 存在 | ✅ |
| 4 | 文档已归档 | 检查所有文档已保存到正确位置 | ✅ |

**检查清单 (Markdown 格式)**:
```markdown
### Gate #4: Acceptance → Delivery
- [ ] 验收测试通过
- [ ] 用户验收确认
- [ ] 交付报告已生成 (delivery-report.md)
- [ ] 文档已归档
```

**通过标准**: 4 项全部勾选

**不通过处理**: 退回 Acceptance 阶段，完成验收或补充文档

---

## 四、检查通过/不通过处理流程

### 4.1 通过流程

```
开始 Gate 检查
    ↓
逐项检查清单
    ↓
所有项通过？──是──→ 记录检查结果
    ↓                    ↓
   否              允许进入下一阶段
    ↓
生成整改建议
    ↓
退回前一阶段
    ↓
整改完成后重新检查
```

**通过时操作**:
1. 在 `.tasks/{task-id}/gate-records.md` 记录检查结果
2. 更新任务状态为下一阶段
3. 通知下一阶段智能体开始工作

**通过记录格式**:
```markdown
### Gate #X: [阶段名] → [阶段名]
- **检查时间**: 2026-03-27 09:00:00
- **检查人**: [智能体名称]
- **检查结果**: ✅ 通过
- **检查清单**:
  - [x] 检查项 1
  - [x] 检查项 2
  - [x] 检查项 3
  - [x] 检查项 4
- **备注**: 所有检查项通过，允许进入下一阶段
```

---

### 4.2 不通过流程

**不通过时操作**:
1. 在 `.tasks/{task-id}/gate-records.md` 记录检查结果
2. 标记未通过检查项
3. 生成整改建议
4. 任务状态保持当前阶段
5. 通知当前阶段智能体进行整改

**不通过记录格式**:
```markdown
### Gate #X: [阶段名] → [阶段名]
- **检查时间**: 2026-03-27 09:00:00
- **检查人**: [智能体名称]
- **检查结果**: ❌ 不通过
- **检查清单**:
  - [x] 检查项 1
  - [ ] 检查项 2 (未通过)
  - [x] 检查项 3
  - [x] 检查项 4
- **未通过原因**: 检查项 2 不满足要求，具体为...
- **整改建议**: 
  1. 补充 XXX 文档
  2. 完善 XXX 内容
  3. 重新提交检查
- **下次检查时间**: 整改完成后自动触发
```

---

### 4.3 整改后重新检查

**重新检查流程**:
1. 智能体完成整改
2. 更新任务文件
3. 自动触发 Gate 重新检查
4. 检查通过后进入下一阶段

**重新检查限制**:
- 同一 Gate 最多重新检查 3 次
- 3 次不通过后升级告警，需用户介入

---

## 五、检查记录格式

### 5.1 记录文件位置

**文件路径**: `.tasks/{task-id}/gate-records.md`

**文件结构**:
```markdown
# Hard Gate 检查记录

**任务 ID**: {task-id}
**创建时间**: YYYY-MM-DD HH:mm:ss

---

## Gate #1: Clarification → Understanding

### 检查记录 1
- **检查时间**: YYYY-MM-DD HH:mm:ss
- **检查人**: [智能体名称]
- **检查结果**: ✅ 通过 / ❌ 不通过
- **检查清单**:
  - [x] 意图识别报告已生成
  - [x] L1-L4 定位已完成
  - [x] 用户确认已获取
  - [x] HARD GATE 检查通过
- **备注**: [如有]

---

## Gate #2: Understanding → Resolution

### 检查记录 1
- **检查时间**: YYYY-MM-DD HH:mm:ss
- **检查人**: [智能体名称]
- **检查结果**: ✅ 通过 / ❌ 不通过
- **检查清单**:
  - [x] 需求规格文档已生成
  - [x] 技术设计方案已生成
  - [x] 任务清单已生成
  - [x] 验收标准已生成
  - [x] 用户确认已获取
- **备注**: [如有]

---

## Gate #3: Resolution → Acceptance

### 检查记录 1
- **检查时间**: YYYY-MM-DD HH:mm:ss
- **检查人**: [智能体名称]
- **检查结果**: ✅ 通过 / ❌ 不通过
- **检查清单**:
  - [x] 所有任务已完成
  - [x] 自测验证通过
  - [x] 交付物完整
  - [x] 代码审查通过 (如适用)
- **备注**: [如有]

---

## Gate #4: Acceptance → Delivery

### 检查记录 1
- **检查时间**: YYYY-MM-DD HH:mm:ss
- **检查人**: [智能体名称]
- **检查结果**: ✅ 通过 / ❌ 不通过
- **检查清单**:
  - [x] 验收测试通过
  - [x] 用户验收确认
  - [x] 交付报告已生成
  - [x] 文档已归档
- **备注**: [如有]
```

---

### 5.2 检查记录数据结构 (JSON)

**文件位置**: `.tasks/{task-id}/gate-records.json` (可选，用于程序化处理)

**数据结构**:
```json
{
  "task_id": "REQ-001-task-001",
  "gate_records": [
    {
      "gate_id": "Gate #1",
      "from_stage": "clarification",
      "to_stage": "understanding",
      "check_time": "2026-03-27T09:00:00Z",
      "checker": "银河导航员",
      "passed": true,
      "checklist": [
        { "item": "意图识别报告已生成", "passed": true },
        { "item": "L1-L4 定位已完成", "passed": true },
        { "item": "用户确认已获取", "passed": true },
        { "item": "HARD GATE 检查通过", "passed": true }
      ],
      "notes": "所有检查项通过"
    }
  ]
}
```

---

## 六、与银河导航员集成

### 6.1 职责更新

银河导航员 (`agents/constitution/GALAXY_NAVIGATOR.md`) 增加以下职责:

1. **Gate 检查触发**: 阶段流转前自动触发 Hard Gate 检查
2. **检查执行**: 按照检查清单逐项检查
3. **流转控制**: 未通过 Gate 时阻止流转
4. **记录持久化**: 检查结果写入 gate-records.md

### 6.2 流转控制逻辑

```javascript
// 伪代码示例
async function transitionStage(fromStage, toStage, taskId) {
  const gate = getGate(fromStage, toStage);
  const checklist = getChecklist(gate);
  
  const result = await checkGate(checklist, taskId);
  
  if (result.passed) {
    recordGateResult(taskId, gate, result);
    updateTaskStage(taskId, toStage);
    notifyNextAgent(toStage, taskId);
    return { allowed: true };
  } else {
    recordGateResult(taskId, gate, result);
    generateFixSuggestions(result.failedItems);
    notifyCurrentAgent(fromStage, taskId, result);
    return { 
      allowed: false, 
      reason: result.failedItems,
      suggestions: result.suggestions 
    };
  }
}
```

---

## 七、性能要求

| 指标 | 要求 | 验证方法 |
|------|------|----------|
| Gate 检查时间 | < 30 秒 | 从触发检查到出结果的时间 |
| 检查准确率 | > 99% | 检查结果与人工复核的一致性 |
| 记录完整性 | 100% | 所有 Gate 检查都有记录 |
| 流转控制有效性 | 100% | 未通过 Gate 无法进入下一阶段 |

---

## 八、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| V1.0 | 2026-03-27 | 初始版本 | 需求解决智能体 |

---

## 九、参考文档

- `agents/docs/specs/constitution/CONSTITUTION.md` - 宪法规范总览
- `agents/docs/specs/constitution/audit/REAL_TIME_FUSE.md` - 实时熔断规范
- `agents/docs/specs/constitution/audit/REGRESSION_TEST_SPEC.md` - 回归测试规范
- `agents/constitution/GALAXY_NAVIGATOR.md` - 银河导航员工作规范

---

**规范状态**: 已生效  
**生效日期**: 2026-03-27  
**下次审查**: 2026-04-27
