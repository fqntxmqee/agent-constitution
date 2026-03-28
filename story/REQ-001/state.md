# REQ-001 状态 - AIOS 项目

**需求 ID**: REQ-001  
**项目名称**: AIOS (AI-native Operating System for Robots)  
**创建日期**: 2026-03-26  
**当前阶段**: requirement-delivery（需求交付）  

---

## 📊 需求概览

| 维度 | 值 |
|------|-----|
| **硬件** | 树莓派 5 (8GB) + NVMe SSD |
| **场景** | DIY 轮式机器人 |
| **系统** | Yocto Kirkstone + meta-raspberrypi |
| **内核** | PREEMPT_RT |
| **AI 推理** | llama.cpp + Qwen2.5 7B (Q4_K_M) |
| **复杂度** | S 级（企业/超复杂） |
| **时间约束** | 4 天 MVP（2026-03-26 ~ 2026-03-29） |

---

## 🔄 当前阶段

**阶段**: requirement-delivery（需求交付）

**进度**:
```
✅ 需求澄清 (requirement-clarification)
    ↓
✅ 需求理解 (requirement-understanding)
    ↓
✅ 需求解决 (requirement-resolution) - 4 天 19 任务完成
    ↓
✅ 需求验收 (requirement-acceptance) - 有条件通过 75%
    ↓
🔄 需求交付 (requirement-delivery) - 进行中
```

---

## 📁 关键决策

| 决策 ID | 决策内容 | 日期 |
|---------|----------|------|
| DEC-001 | 坚持 Yocto 深度定制（不用 Ubuntu） | 2026-03-26 |
| DEC-002 | 4 天极限 MVP，并发执行 19 任务 | 2026-03-26 |
| DEC-003 | 移除进展跟进智能体，银河导航员统一跟进 | 2026-03-26 |
| DEC-004 | 传感器配置：摄像头 + IMU + 编码器（Phase 0） | 2026-03-26 |

---

## 📋 任务状态

| 任务 ID | 智能体 | 状态 | 产出 |
|---------|--------|------|------|
| task-001 | requirement-clarification | ✅ 完成 | proposal.md + 飞书文档 |
| task-002 | requirement-understanding | ✅ 完成 | OpenSpec（4 份文档） |
| task-003 | requirement-resolution | ✅ 完成 | AIOS MVP（19 任务） |
| task-004 | requirement-acceptance | ✅ 完成 | acceptance-report.md（有条件通过 75%） |
| task-005 | requirement-delivery | 🔄 进行中 | — |

---

## 📂 规约路径

```
project/aios/changes/init/
├── proposal.md                    # 澄清提案
├── CLARIFICATION_SUMMARY.md       # 摘要
├── specs/requirements.md          # 需求规格
├── design.md                      # 架构设计
├── tasks.md                       # 任务分解（19 任务）
├── acceptance-criteria.md         # 验收标准
├── acceptance-report.md           # 验收报告
├── user-confirmation.md           # 用户确认记录
└── feishu-doc-urls.txt            # 飞书链接
```

---

## 🎯 MVP 完成定义

- [x] **能启动**: Yocto 系统从 NVMe SSD 启动
- [x] **能运行 AI**: Qwen2.5 7B 推理（文本问答）
- [x] **能控制机器人运动**: 电机响应控制指令

---

## ⏭️ 下一步

1. 完成 task-005（需求交付）
2. Git 提交 + 标签 v1.0.0-mvp
3. 交付报告
4. 项目复盘（summary-reflection）

---

**最后更新**: 2026-03-26 23:36
