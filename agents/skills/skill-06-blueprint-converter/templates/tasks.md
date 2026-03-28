# Tasks: {{project_name}} - 任务清单

> 可执行任务列表 · OpenSpec 规范  
> 创建日期：{{created_date}}  
> 供需求解决智能体按序执行（经 sessions_spawn，禁止主会话直接 write 业务代码）

---

## 说明

- 按 Phase 与任务顺序执行，完成一项勾选一项。
- 执行方：需求解决智能体（经 sessions_spawn 委托 Worker，禁止主会话 write 业务代码）。
- 验收依据：`specs/requirements.md` 中的 AC。

---

## Phase 1: {{phase1_name}}

- [ ] 1.1 {{task_1_1}}
- [ ] 1.2 {{task_1_2}}
- [ ] 1.3 {{task_1_3}}
- [ ] 1.4 {{task_1_4}}

---

## Phase 2: {{phase2_name}}

- [ ] 2.1 {{task_2_1}}
- [ ] 2.2 {{task_2_2}}
- [ ] 2.3 {{task_2_3}}
- [ ] 2.4 {{task_2_4}}

---

## Phase 3: {{phase3_name}}

- [ ] 3.1 {{task_3_1}}
- [ ] 3.2 {{task_3_2}}
- [ ] 3.3 {{task_3_3}}
- [ ] 3.4 {{task_3_4}}

---

## Phase 4: {{phase4_name}}

- [ ] 4.1 {{task_4_1}}
- [ ] 4.2 {{task_4_2}}
- [ ] 4.3 {{task_4_3}}
- [ ] 4.4 {{task_4_4}}

---

## Phase 5: 测试与验收

- [ ] 5.1 {{task_5_1}}
- [ ] 5.2 {{task_5_2}}
- [ ] 5.3 {{task_5_3}}
- [ ] 5.4 对照 `specs/requirements.md` 逐项核对 AC

---

## 完成标准

- 所有任务项已勾选
- AC 全部通过（由需求验收智能体验证）
- 无未解决的高优先级问题
