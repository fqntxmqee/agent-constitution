# REQ-001 Context - 002 需求理解

**阶段**: requirement-understanding  
**智能体**: 脑洞整理师 💡  
**日期**: 2026-03-26  

---

## 📋 任务概述

基于澄清提案产出完整 OpenSpec（specs/design/tasks/AC）。

---

## 🎯 输入

- 《已确认提案》（来自需求澄清）
- 用户确认记录（传感器配置 + 4 天时间约束）

---

## 📊 自动决策项（8 个）

银河导航员基于最佳实践自动决策：

| 问题 | 决策 |
|------|------|
| T-01: OpenClaw 迁移范围 | 完整迁移 4 模块 |
| T-02: 7B 模型选型 | Qwen2.5 7B |
| T-06: SCHED_AI 调度器 | Phase 0 用现有，Phase 2 自研 |
| DS-02: AI 推理输入 | 文本 + 视觉多模态 |
| U-01: 目标用户 | 开发者 |
| P-01: MVP 范围 | 基础系统 + OpenClaw 核心 + 本地推理 |
| P-03: 性能目标 | 推理延迟<1s，启动<10s |
| A-01: 完成定义 | 能启动 + 运行 AI + 控制机器人 |

---

## 🏗️ L1-L4 框架分析

### L1 领域层（Domain）

| 领域 | 说明 |
|------|------|
| **机器人控制域** | 电机控制、传感器驱动、运动学 |
| **AI 推理域** | LLM 推理、视觉处理、语音交互 |
| **系统域** | Yocto 系统、内核、运行时 |

### L2 场景层（Scenario）

| 场景 | 所属领域 | 说明 |
|------|----------|------|
| 语音控制移动 | 机器人控制域 + AI 推理域 | 语音指令 → 电机响应 |
| 视觉问答 | AI 推理域 | 摄像头图像 → 文本描述 |
| 自主导航 | 机器人控制域 | SLAM 建图 + 路径规划 |

### L3 业务活动层（Business Activity）

| 活动 | 所属场景 | 输入 | 输出 |
|------|----------|------|------|
| 语音识别 | 语音控制移动 | 音频流 | 文本指令 |
| 意图理解 | 语音控制移动 | 文本指令 | 控制命令 |
| 电机控制 | 语音控制移动 | 控制命令 | PWM 信号 |
| 图像采集 | 视觉问答 | 摄像头 | 图像帧 |
| 视觉推理 | 视觉问答 | 图像帧 | 文本描述 |

### L4 功能点层（Function Point）

| 功能点 | 所属活动 | 复用状态 |
|--------|----------|----------|
| `recognize_speech(audio)` | 语音识别 | 新增 |
| `understand_intent(text)` | 意图理解 | 新增 |
| `move_forward(speed)` | 电机控制 | 新增 |
| `capture_image()` | 图像采集 | 新增 |
| `generate_caption(image)` | 视觉推理 | 新增 |
| `read_encoders()` | 电机控制 | 新增 |
| `read_imu()` | 传感器 | 新增 |

---

## 📁 产出文件

### OpenSpec 规约

1. **specs/requirements.md** - 详细需求规格
2. **design.md** - 架构设计（5 层架构）
3. **tasks.md** - 任务分解（4 天 19 任务）
4. **acceptance-criteria.md** - 验收标准

### 关键设计

**5 层架构**:
```
L5: Agent 应用层 (TypeScript/Python)
L4: Agent 运行时 (OpenClaw Hub-Spoke + Tool + Memory)
L3: AI 服务层 (llama.cpp + Qwen2.5 7B)
L2: 机器人中间件 (电机控制 + 传感器驱动)
L1: 系统层 (Yocto + PREEMPT_RT)
```

**4 天 19 任务并发策略**:
- Subagent A: Day 1 (Yocto + OpenClaw)
- Subagent B: Day 2 (Tool + AI)
- Subagent C: Day 3 (电机 + 传感器)
- Subagent D: Day 4 (测试 + 交付)

---

## ⚠️ 关键约束

| 约束 | 值 |
|------|-----|
| 可用时间 | 4 天（2026-03-26 ~ 2026-03-29） |
| 系统 | Yocto Kirkstone + meta-raspberrypi |
| 内核 | PREEMPT_RT（Yocto 包） |
| 模型 | Qwen2.5 7B (Q4_K_M 量化) |
| 内存 | <4GB（AI 推理） |

---

**完成时间**: 2026-03-26 14:02
