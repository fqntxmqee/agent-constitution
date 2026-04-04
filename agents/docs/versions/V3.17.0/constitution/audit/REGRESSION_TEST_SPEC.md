# 回归测试规范 (Regression Test Specification)

**文档类型**: 宪法规范执行保障体系 - 回归测试规范  
**版本号**: V3.17.0  
**创建日期**: 2026-03-27  
**更新日期**: 2026-04-05  
**状态**: 已生效  
**关联规范**: `agents/docs/specs/constitution/CONSTITUTION.md` (V3.17.0)

---

## 一、概述

### 1.1 目的

建立自动化回归测试机制，定期验证智能体协同是否符合宪法规范 V3.16.0，确保规范执行的持续性和稳定性。

### 1.2 核心原则

- **自动化执行**: 每日自动执行，无需人工干预
- **全面覆盖**: 覆盖所有核心场景和复杂流程
- **快速反馈**: 测试失败立即告警
- **可追溯**: 测试报告完整记录，便于问题定位

### 1.3 适用范围

- 所有 8 大智能体协同流程
- 所有变更类型 (Type-A/B/C)
- 所有复杂度级别 (A/B/C/S)

---

## 二、测试用例格式

### 2.1 文件格式

**文件扩展名**: `.md`

**目录位置**: `agents/docs/specs/constitution/audit/test-cases/`

**文件命名**: `T{序号}-{用例名称}.md`

示例:
- `T001-type-a-change.md`
- `T002-type-b-change.md`
- `T003-type-c-change.md`

### 2.2 YAML Front Matter

每个测试用例文件头部必须包含 YAML Front Matter:

```yaml
---
test_id: T001
title: Type-A 变更完整流程验证
complexity: A
agents_involved:
  - navigator
  - clarification
  - understanding
  - resolution
  - acceptance
  - delivery
  - audit
estimated_duration: 60min
created_date: 2026-03-27
last_updated: 2026-03-27
version: 1.0
---
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| test_id | string | ✅ | 测试用例 ID (T001-T010) |
| title | string | ✅ | 测试用例标题 |
| complexity | string | ✅ | 复杂度级别 (A/B/C/S) |
| agents_involved | array | ✅ | 参与的智能体列表 |
| estimated_duration | string | ✅ | 预计执行时长 |
| created_date | date | ✅ | 创建日期 |
| last_updated | date | ✅ | 最后更新日期 |
| version | number | ✅ | 版本号 |

### 2.3 测试用例正文结构

```markdown
## 测试目标

清晰描述本测试用例的验证目的。

## 前置条件

列出执行测试前必须满足的条件。

## 测试步骤

详细列出可执行的测试步骤。

## 预期结果

描述期望的输出和状态。

## 验收标准 (Checklist)

- [ ] 检查项 1
- [ ] 检查项 2
- [ ] 检查项 3
```

### 2.4 完整示例

```markdown
---
test_id: T001
title: Type-A 变更完整流程验证
complexity: A
agents_involved:
  - navigator
  - clarification
  - understanding
  - resolution
  - acceptance
  - delivery
  - audit
estimated_duration: 60min
---

## 测试目标

验证 Type-A 变更完整流程是否符合宪法规范 V3.16.0，包括:
- 3 天冷静期要求
- 完整规约文档
- Hard Gate 检查
- 审计检查

## 前置条件

1. 银河导航员已初始化
2. 审计智能体已启动
3. 飞书通知渠道已配置
4. 测试任务目录已创建

## 测试步骤

1. 创建 Type-A 变更任务
2. 执行需求澄清阶段
3. 执行需求理解阶段 (生成 OpenSpec)
4. 等待冷静期 (模拟 3 天)
5. 执行需求解决阶段
6. 执行需求验收阶段
7. 执行需求交付阶段
8. 验证所有产出物

## 预期结果

1. 所有阶段按顺序执行
2. 每个阶段产出物完整
3. Hard Gate 检查全部通过
4. 审计报告生成
5. 交付物完整

## 验收标准 (Checklist)

- [ ] clarification-report.md 存在
- [ ] specs/requirements.md 存在
- [ ] specs/design.md 存在
- [ ] specs/tasks.md 存在
- [ ] specs/acceptance-criteria.md 存在
- [ ] acceptance-report.md 存在
- [ ] delivery-report.md 存在
- [ ] gate-records.md 存在且包含 4 个 Gate 记录
- [ ] audit-report.md 存在
- [ ] 冷静期检查通过
```

---

## 三、测试执行流程

### 3.1 标准执行流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    回归测试执行流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 加载 (LOAD)                                                 │
│     • 从 test-cases/ 目录加载所有测试用例                       │
│     • 解析 YAML Front Matter                                    │
│     • 构建测试用例列表                                          │
│                                                                 │
│  2. 执行 (EXECUTE)                                              │
│     • 通过 OpenClaw sessions_spawn 执行每个测试用例             │
│     • 等待执行完成或超时                                        │
│     • 收集执行结果                                              │
│                                                                 │
│  3. 检查 (CHECK)                                                │
│     • 验证执行结果是否符合预期                                  │
│     • 检查产出物完整性                                          │
│     • 检查 Hard Gate 记录                                       │
│                                                                 │
│  4. 报告 (REPORT)                                               │
│     • 生成 Markdown 测试报告                                    │
│     • 计算通过率统计                                            │
│     • 发送告警 (如有失败)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 执行脚本

**脚本位置**: `scripts/run-regression-test.sh`

**脚本内容**:
```bash
#!/bin/bash
# run-regression-test.sh - 回归测试执行脚本

set -e

# 配置
TEST_CASES_DIR="agents/docs/specs/constitution/audit/test-cases"
REPORT_DIR="agents/constitution/audit/reports"
LOG_FILE="agents/constitution/audit/logs/regression-test-$(date +%Y%m%d).log"

# 创建报告目录
mkdir -p "$REPORT_DIR"

# 初始化报告
REPORT_FILE="$REPORT_DIR/regression-test-$(date +%Y%m%d-%H%M%S).md"
echo "# 回归测试报告" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**执行时间**: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 计数器
TOTAL=0
PASSED=0
FAILED=0

# 结果表格
echo "## 详细结果" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| 用例 ID | 名称 | 状态 | 耗时 | 备注 |" >> "$REPORT_FILE"
echo "|---------|------|------|------|------|" >> "$REPORT_FILE"

# 遍历测试用例
for test_file in "$TEST_CASES_DIR"/T*.md; do
    if [ -f "$test_file" ]; then
        TOTAL=$((TOTAL + 1))
        
        # 解析测试用例 ID 和标题
        TEST_ID=$(grep "^test_id:" "$test_file" | cut -d: -f2 | tr -d ' ')
        TEST_TITLE=$(grep "^title:" "$test_file" | cut -d: -f2- | tr -d ' "')
        
        echo "执行测试：$TEST_ID - $TEST_TITLE" | tee -a "$LOG_FILE"
        
        # 记录开始时间
        START_TIME=$(date +%s)
        
        # 执行测试 (通过 OpenClaw sessions_spawn)
        # 这里简化为模拟，实际应调用 OpenClaw CLI
        if openclaw agent --agent test-runner --message "执行测试用例 $TEST_ID" --json 2>/dev/null; then
            STATUS="✅ 通过"
            PASSED=$((PASSED + 1))
            REMARK="-"
        else
            STATUS="❌ 失败"
            FAILED=$((FAILED + 1))
            REMARK="执行失败"
        fi
        
        # 记录结束时间
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        DURATION_MIN=$((DURATION / 60))
        
        # 写入报告
        echo "| $TEST_ID | $TEST_TITLE | $STATUS | ${DURATION_MIN}min | $REMARK |" >> "$REPORT_FILE"
        
        echo "测试结果：$STATUS (耗时：${DURATION_MIN}min)" | tee -a "$LOG_FILE"
    fi
done

# 计算通过率
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$(echo "scale=2; $PASSED * 100 / $TOTAL" | bc)
else
    PASS_RATE=0
fi

# 写入报告概览
sed -i "3a\\
**总用例数**: $TOTAL\\
**通过数**: $PASSED\\
**失败数**: $FAILED\\
**通过率**: ${PASS_RATE}%" "$REPORT_FILE"

# 失败分析
if [ $FAILED -gt 0 ]; then
    echo "" >> "$REPORT_FILE"
    echo "## 失败分析" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "失败用例需要进一步分析原因，详见日志文件：$LOG_FILE" >> "$REPORT_FILE"
    
    # 发送告警
    echo "发送失败告警..." | tee -a "$LOG_FILE"
    # 这里调用飞书告警 API
fi

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**测试完成**: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"

echo "回归测试完成：$PASSED/$TOTAL 通过 (${PASS_RATE}%)" | tee -a "$LOG_FILE"
```

### 3.3 超时控制

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 单用例超时 | 90 分钟 | 超过 90 分钟未完成则标记超时 |
| 总测试超时 | 6 小时 | 全部测试超过 6 小时则中断 |
| 超时处理 | 标记为失败，记录日志 | 超时用例标记为 ❌ 超时 |

### 3.4 并发控制

- **默认**: 串行执行 (避免资源竞争)
- **可选**: 并行执行 (最多 3 个并发会话)
- **配置**: 通过环境变量 `REGRESSION_TEST_CONCURRENCY` 控制

---

## 四、测试报告格式

### 4.1 报告模板

```markdown
# 回归测试报告

**执行时间**: YYYY-MM-DD HH:mm:ss  
**总用例数**: 10  
**通过数**: X  
**失败数**: Y  
**通过率**: Z%

---

## 测试概览

| 指标 | 值 |
|------|-----|
| 总用例数 | 10 |
| 通过数 | X |
| 失败数 | Y |
| 超时数 | Z |
| 通过率 | Z% |
| 总耗时 | X 小时 Y 分钟 |

---

## 详细结果

| 用例 ID | 名称 | 复杂度 | 状态 | 耗时 | 备注 |
|---------|------|--------|------|------|------|
| T001 | Type-A 变更完整流程 | A | ✅ 通过 | 58min | - |
| T002 | Type-B 变更快速流程 | B | ✅ 通过 | 45min | - |
| T003 | Type-C 变更 Patch 流程 | C | ✅ 通过 | 30min | - |
| T004 | Hub-Spoke 任务协同 | B | ✅ 通过 | 40min | - |
| T005 | Story File 上下文管理 | B | ✅ 通过 | 35min | - |
| T006 | 决策记录规范 | C | ✅ 通过 | 25min | - |
| T007 | 版本备份与回滚 | A | ❌ 失败 | 12min | 冷静期检查失败 |
| T008 | 交付校验清单 | B | ✅ 通过 | 38min | - |
| T009 | L1-L4 框架应用 | A | ✅ 通过 | 55min | - |
| T010 | 多智能体协同复杂场景 | S | ✅ 通过 | 75min | - |

---

## 失败分析

### T007 失败原因

**问题描述**: 冷静期检查未通过

**根本原因**: 
- Type-A 变更未满 3 天即执行
- 冷静期检查逻辑有误

**修复建议**:
1. 检查冷静期计算逻辑
2. 确认 DEC 文件创建时间
3. 修复后重新执行测试

**负责人**: @xxx
**预计修复时间**: YYYY-MM-DD

---

## 趋势分析

### 近 7 天通过率趋势

| 日期 | 通过率 | 失败数 |
|------|--------|--------|
| YYYY-MM-DD | 100% | 0 |
| YYYY-MM-DD | 100% | 0 |
| YYYY-MM-DD | 90% | 1 |
| ... | ... | ... |

### 失败用例分布

| 用例 ID | 失败次数 | 最近失败时间 |
|---------|----------|--------------|
| T007 | 1 | YYYY-MM-DD HH:mm |

---

## 附录

### 执行日志

详见：`agents/constitution/audit/logs/regression-test-YYYYMMDD.log`

### 测试环境

- OpenClaw 版本：x.x.x
- 模型：xxx
- 执行节点：xxx
```

### 4.2 报告存储

**存储位置**: `agents/constitution/audit/reports/`

**命名规则**: `regression-test-YYYYMMDD-HHMMSS.md`

**保留策略**:
- 每日报告：保留 30 天
- 每周汇总：保留 90 天
- 每月汇总：保留 1 年

---

## 五、定时调度机制

### 5.1 Cron 配置

**配置位置**: `crontab -e`

**配置内容**:
```bash
# 回归测试 - 每日 02:00 执行 (低峰期)
0 2 * * * cd /Users/fukai/project/openclaw-workspace && bash scripts/run-regression-test.sh >> agents/constitution/audit/logs/cron-regression-test.log 2>&1
```

**调度说明**:

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 执行时间 | 每日 02:00 | 低峰期，避免干扰正常工作 |
| cron 表达式 | `0 2 * * *` | 每天凌晨 2 点 |
| 执行用户 | 当前用户 | 与 OpenClaw 运行用户一致 |
| 工作目录 | workspace 根目录 | 确保相对路径正确 |

### 5.2 OpenClaw 集成

**通过 OpenClaw sessions_spawn 执行**:

```bash
# 方式 1: 直接调用脚本
openclaw sessions_spawn --label "regression-test-$(date +%Y%m%d)" \
  --command "bash scripts/run-regression-test.sh"

# 方式 2: 通过 agent 执行
openclaw agent --agent audit --message "执行回归测试" \
  --session-label "regression-test-$(date +%Y%m%d)"
```

### 5.3 手动触发

**手动执行命令**:
```bash
# 完整执行
bash scripts/run-regression-test.sh

# 执行单个测试用例
bash scripts/run-regression-test.sh --test T001

# 执行指定复杂度的测试
bash scripts/run-regression-test.sh --complexity A
```

### 5.4 暂停/恢复

**暂停调度**:
```bash
# 注释掉 crontab 中的配置
crontab -e
# 在回归测试行前添加 #
```

**恢复调度**:
```bash
# 取消注释
crontab -e
# 移除回归测试行前的 #
```

**临时暂停 (通过标志文件)**:
```bash
# 创建暂停标志
touch agents/constitution/audit/logs/regression-test-paused

# 恢复执行
rm agents/constitution/audit/logs/regression-test-paused
```

---

## 六、告警机制

### 6.1 告警触发条件

| 触发条件 | 告警级别 | 告警渠道 | 响应时限 |
|----------|----------|----------|----------|
| 测试失败 | 高 | 飞书群消息 | 立即 |
| 测试超时 | 中 | 飞书群消息 | 30 分钟内 |
| 连续失败 (>3 次) | 高 | 飞书群消息 + 邮件 | 立即 |
| 测试通过 | 低 | 仅记录，不告警 | - |

### 6.2 告警消息格式

**飞书消息格式**:
```markdown
🚨 回归测试失败告警

**执行时间**: 2026-03-27 02:00:00
**总用例数**: 10
**通过数**: 9
**失败数**: 1
**通过率**: 90%

**失败用例**:
- T007: 版本备份与回滚 (冷静期检查失败)

**测试报告**: [查看报告](file://agents/constitution/audit/reports/regression-test-20260327-020000.md)

**处理建议**:
1. 查看测试报告了解失败详情
2. 分析失败原因
3. 修复问题后重新执行测试

**快速操作**:
- [查看日志](link-to-log)
- [重新执行](link-to-rerun)
- [忽略本次](link-to-ignore)
```

### 6.3 告警升级

| 级别 | 条件 | 升级操作 |
|------|------|----------|
| L1 | 单次失败 | 飞书群消息 |
| L2 | 连续 3 次失败 | 飞书群消息 + @用户 |
| L3 | 连续 5 次失败 | 飞书群消息 + @用户 + 邮件 |

---

## 七、测试用例集

### 7.1 10 个测试用例清单

| ID | 名称 | 复杂度 | 覆盖场景 | 预计时长 |
|----|------|--------|----------|----------|
| T001 | Type-A 变更完整流程 | A | 3 天冷静期 + 审计检查 | 60min |
| T002 | Type-B 变更快速流程 | B | 24h 冷静期 + 核心检查 | 45min |
| T003 | Type-C 变更 Patch 流程 | C | 无冷静期 + 抽查 | 30min |
| T004 | Hub-Spoke 任务协同 | B | 任务分发 + 状态更新 | 40min |
| T005 | Story File 上下文管理 | B | 上下文加载 + 状态更新 | 35min |
| T006 | 决策记录规范 | C | DEC 文件格式 + 编号规则 | 25min |
| T007 | 版本备份与回滚 | A | 白名单 + Git Hook | 50min |
| T008 | 交付校验清单 | B | 交付前文件同步 | 38min |
| T009 | L1-L4 框架应用 | A | 领域识别 + 功能点编排 | 55min |
| T010 | 多智能体协同复杂场景 | S | 8 智能体完整流程 | 75min |

### 7.2 测试用例目录结构

```
agents/docs/specs/constitution/audit/test-cases/
├── T001-type-a-change.md
├── T002-type-b-change.md
├── T003-type-c-change.md
├── T004-hub-spoke-collab.md
├── T005-story-file-context.md
├── T006-decision-record.md
├── T007-version-backup.md
├── T008-delivery-checklist.md
├── T009-l1-l4-framework.md
└── T010-multi-agent-collab.md
```

---

## 八、性能要求

| 指标 | 要求 | 验证方法 |
|------|------|----------|
| 回归测试执行时间 | < 4 小时 (全部 10 用例) | 从开始到报告生成的总时间 |
| 单用例执行时间 | < 90 分钟 | 单用例从开始到结束的时间 |
| 定时任务准时率 | > 99% | 实际执行时间与计划时间的偏差 |
| 测试报告生成时间 | < 5 分钟 | 从测试完成到报告生成的时间 |

---

## 九、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| V1.0 | 2026-03-27 | 初始版本 | 需求解决智能体 |
| V3.17.0 | 2026-04-05 | 版本号统一；增强并发协同与1分钟响应保障 | 银河导航员 |

---

## 十、参考文档

- `agents/docs/specs/constitution/CONSTITUTION.md` - 宪法规范总览
- `agents/docs/specs/constitution/audit/REAL_TIME_FUSE.md` - 实时熔断规范
- `agents/docs/specs/constitution/HARD_GATE_SPEC.md` - Hard Gate 规范
- `agents/constitution/audit/AGENTS.md` - 审计智能体工作规范
- `HEARTBEAT.md` - 定时任务配置

---

**规范状态**: 已生效  
**生效日期**: 2026-04-05  
**下次审查**: 2026-05-05
