# 审计规范 V3.9.0 - 版本说明

**版本**: 3.9.0  
**生效日期**: 2026-03-16  
**对齐**: 智能体协同系统宪法规范 V3.9.0

---

## 📋 文档清单

| 文件 | 用途 | 状态 |
|------|------|------|
| AGENTS.md | 审计智能体工作规范 | ✅ 已更新 |
| AUDIT_STANDARD_V3.9.0.md | 总体框架（参考业界标准） | ✅ 新建 |
| CHECKLIST_V3.9.0.md | 检查清单（80+ 具体检查项） | ✅ 新建 |
| ISSUE_STATE_MACHINE.md | 问题跟踪状态机 | ✅ 新建 |
| REPORT_TEMPLATES.md | 报告模板（4 种） | ✅ 新建 |
| config/audit_config.md | 配置参数（阈值/频率/通知） | ✅ 新建 |
| scripts/audit_run.sh | 可执行审计脚本 | ✅ 新建 |

---

## 🆕 V3.9.0 新增内容

### 1️⃣ 总体框架 (AUDIT_STANDARD_V3.9.0.md)

参考业界标准（COBIT、ISO 27001、NIST CSF、SOC 2），建立完整的审计框架：

- **四大审计维度**: 安全、合规、运行、行为
- **6 步审计闭环**: 数据收集 → 分析 → 分级 → 决策 → 报告 → 跟踪
- **熔断机制**: 高置信度违规立即熔断
- **问题跟踪**: 4 级分类 + 状态机流转

### 2️⃣ 检查清单 (CHECKLIST_V3.9.0.md)

**80+ 具体检查项**，每项包含：
- ID（唯一标识）
- 判断逻辑（如何判定通过/失败）
- 执行命令（可直接运行）
- 阈值（通过/失败边界）
- 等级（Critical/High/Medium/Low）
- 处置（发现问题后的操作）

**分类**:
- 安全检查 (SEC-001 ~ SEC-104): 16 项
- 合规检查 (CMP-001 ~ CMP-303): 16 项
- 运行检查 (OPS-001 ~ OPS-203): 9 项
- 行为检查 (BEH-001 ~ BEH-203): 9 项

### 3️⃣ 执行脚本 (scripts/audit_run.sh)

**可直接运行的 bash 脚本**：

```bash
# 快速审计（安全 + 运行 + 行为）
./scripts/audit_run.sh --quick

# 全面审计（包含合规检查）
./scripts/audit_run.sh --full

# 仅安全检查
./scripts/audit_run.sh --security

# 项目合规检查
./scripts/audit_run.sh --compliance --project=/path/to/project
```

### 4️⃣ 配置参数 (config/audit_config.md)

**JSON 格式配置**，包含：
- 阈值配置（Critical 自动熔断、错误率阈值等）
- 调度配置（审计频率、心跳间隔等）
- 通知配置（分级通知渠道）
- 升级配置（超时升级规则）
- 保留配置（日志保留期）

### 5️⃣ 问题跟踪状态机 (ISSUE_STATE_MACHINE.md)

**6 种状态流转**：
```
NEW → PENDING → IN_PROGRESS → VERIFICATION → CLOSED
                              ↑
                              └── REOPENED
```

**4 级问题等级**：
| 等级 | 响应时限 | 升级时限 |
|------|----------|----------|
| Critical | 立即 | 1 小时 |
| High | 24 小时 | 48 小时 |
| Medium | 7 天 | 14 天 |
| Low | 30 天 | 60 天 |

### 6️⃣ 报告模板 (REPORT_TEMPLATES.md)

**4 种标准化模板**：
1. **实时告警** - Critical 问题即时通知
2. **每日审计报告** - 完整的日度审计
3. **专项审计报告** - 深度问题分析
4. **周报汇总** - 周度趋势分析

---

## 🔄 与 V3.7.3 的变更对比

| 维度 | V3.7.3 | V3.9.0 |
|------|--------|--------|
| **框架** | 经验驱动 | 业界标准驱动 |
| **检查项** | ~20 项 | 80+ 项 |
| **判断逻辑** | 文字描述 | 可执行命令 |
| **执行脚本** | 无 | audit_run.sh |
| **配置管理** | 硬编码 | JSON 配置 |
| **状态机** | 无 | 6 状态流转 |
| **报告模板** | 单一格式 | 4 种模板 |
| **阈值定义** | 未定义 | 明确数值 |
| **通知机制** | 未定义 | 分级通知 |
| **升级规则** | 未定义 | 明确时限 |
| **问题跟踪** | 简单记录 | 状态机管理 |

---

## 🚀 快速开始

### Step 1: 赋予执行权限

```bash
chmod +x /Users/fukai/project/openclaw-workspace/agents/constitution/audit/scripts/audit_run.sh
```

### Step 2: 运行一次完整审计

```bash
cd /Users/fukai/project/openclaw-workspace/agents/constitution/audit
./scripts/audit_run.sh --full
```

### Step 3: 查看报告

```bash
cat logs/audits/audit_$(date "+%Y-%m-%d_%H%M").md
```

---

## 📊 审计覆盖范围

### 安全审计 (Security)
- ✅ 配置安全（6 项）
- ✅ 工具权限（4 项）
- ✅ 高危命令检测（10+ 正则）

### 合规审计 (Compliance)
- ✅ 规约执行（5 项）
- ✅ Runtime 检查（4 项）
- ✅ 验收合规（3 项）
- ✅ 交付合规（3 项）

### 运行审计 (Operational)
- ✅ 健康状态（4 项）
- ✅ 会话状态（3 项）
- ✅ 资源使用（3 项）

### 行为审计 (Behavioral)
- ✅ 职责边界（3 项）
- ✅ 指令分析（2 项）
- ✅ 异常检测（3 项）

---

## 📝 版本对齐

本审计规范与以下文档版本对齐：

| 文档 | 版本 |
|------|------|
| 智能体协同系统宪法规范 | V3.9.0 |
| 银河导航员工作规范 | V3.9.0 |
| 审计智能体工作规范 | V3.9.0 |

---

## 📚 参考标准

- COBIT 2019 Framework
- ISO 27001:2022 Information Security Management
- NIST Cybersecurity Framework 2.0
- SOC 2 Type II Criteria
- 智能体协同系统宪法规范 V3.9.0

---

**维护者**: 规则守护者 🛡️  
**最后更新**: 2026-03-16
