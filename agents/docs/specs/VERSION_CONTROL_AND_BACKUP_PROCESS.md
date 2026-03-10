# 宪法规范与技能版本控制及备份流程 (V3.7)

**版本**: 1.0  
**创建日期**: 2026-03-10  
**状态**: ✅ 已生效

---

## 📋 概述

本流程定义了宪法规范和技能的版本控制机制，确保每次迭代升级后都有完整的备份存储，支持版本追溯、回滚和审计。

---

## 🎯 目标

1. **版本追溯**: 每次变更有完整的版本记录
2. **备份存储**: 每次迭代后自动备份到指定位置
3. **快速回滚**: 支持快速回滚到任意历史版本
4. **审计支持**: 支持审计智能体查询历史版本

---

## 📂 目录结构

### 宪法规范版本库

```
agents/docs/specs/versions/
├── constitution/
│   ├── V3.7.0/
│   │   ├── CONSTITUTION_V3.7.0.md
│   │   ├── CHANGELOG_V3.7.0.md
│   │   └── backup_timestamp.txt
│   ├── V3.7.1/
│   │   ├── CONSTITUTION_V3.7.1.md
│   │   ├── CHANGELOG_V3.7.1.md
│   │   └── backup_timestamp.txt
│   ├── V3.7.2/
│   │   ├── CONSTITUTION_V3.7.2.md
│   │   ├── CHANGELOG_V3.7.2.md
│   │   └── backup_timestamp.txt
│   └── latest -> V3.7.2/  (符号链接)
├── agents/
│   ├── V3.7.0/
│   │   ├── requirement-clarification/AGENTS.md
│   │   ├── requirement-understanding/AGENTS.md
│   │   ├── requirement-resolution/AGENTS.md
│   │   ├── requirement-acceptance/AGENTS.md
│   │   ├── requirement-delivery/AGENTS.md
│   │   ├── progress-tracking/AGENTS.md
│   │   ├── audit/AGENTS.md
│   │   ├── summary-reflection/AGENTS.md
│   │   └── backup_timestamp.txt
│   ├── V3.7.1/
│   │   └── ...
│   └── V3.7.2/
│       └── ...
└── skills/
    ├── V3.7.0/
    │   ├── skill-01-intent-classifier/
    │   ├── skill-03-ambiguity-detector/
    │   └── ...
    ├── V3.7.1/
    │   └── ...
    └── V3.7.2/
        └── ...
```

### 备份存储位置

| 类型 | 主存储 | 备份存储 1 | 备份存储 2 |
|------|--------|----------|----------|
| **宪法规范** | `agents/docs/specs/` | `agents/docs/specs/versions/constitution/` | 飞书知识库 |
| **智能体定义** | `agents/constitution/*/AGENTS.md` | `agents/docs/specs/versions/agents/` | 飞书知识库 |
| **技能** | `agents/skills/` | `agents/docs/specs/versions/skills/` | 飞书知识库 |
| **变更日志** | `agents/docs/specs/CHANGELOG.md` | `agents/docs/specs/versions/` | 飞书文档 |

---

## 🔄 版本控制流程

### 宪法规范版本控制

```
用户确认迭代提案
        ↓
总结反思智能体创建新版本号
        ↓
复制当前宪法规范到版本库
        ↓
更新宪法规范文档
        ↓
更新变更日志
        ↓
创建版本备份（含时间戳）
        ↓
同步到飞书知识库
        ↓
审计智能体验证备份完成
```

### 技能版本控制

```
新技能开发完成/现有技能更新
        ↓
需求验收智能体验收通过
        ↓
复制技能到版本库
        ↓
更新技能清单
        ↓
创建技能备份（含时间戳）
        ↓
同步到飞书知识库
        ↓
审计智能体验证备份完成
```

---

## 📝 版本号规则

### 宪法规范版本号

**格式**: `V{主版本}.{次版本}.{修订号}`

| 层级 | 触发条件 | 示例 |
|------|---------|------|
| **主版本** | 重大架构变更（如新增智能体、删除智能体） | V3.0.0 → V4.0.0 |
| **次版本** | 功能增强（如新增流程、职责扩展） | V3.7.0 → V3.7.2 |
| **修订号** | 文字修订、错别字修正、格式调整 | V3.7.1 → V3.7.2 |

### 技能版本号

**格式**: `{技能 ID}-V{主版本}.{次版本}.{修订号}`

**示例**:
- `skill-01-intent-classifier-V1.0.0`
- `skill-03-ambiguity-detector-V1.1.0`
- `audit-log-analyzer-V1.0.0`

---

## 💾 备份策略

### 备份频率

| 类型 | 触发条件 | 备份时间 |
|------|---------|---------|
| **宪法规范** | 每次版本更新 | 版本生效后 1 小时内 |
| **技能** | 新技能开发完成/现有技能更新 | 验收通过后 1 小时内 |
| **变更日志** | 每次版本更新 | 版本生效后 1 小时内 |

### 备份内容

#### 宪法规范备份

- 宪法规范文档（CONSTITUTION_V{版本号}.md）
- 变更日志（CHANGELOG_V{版本号}.md）
- 迭代提案（CONSTITUTION_ITERATION_PROPOSAL_{编号}.md）
- 备份时间戳（backup_timestamp.txt）

#### 智能体定义备份

- 智能体 AGENTS.md 文件（8 个智能体）
  - requirement-clarification/AGENTS.md
  - requirement-understanding/AGENTS.md
  - requirement-resolution/AGENTS.md
  - requirement-acceptance/AGENTS.md
  - requirement-delivery/AGENTS.md
  - progress-tracking/AGENTS.md
  - audit/AGENTS.md
  - summary-reflection/AGENTS.md
- 智能体清单（agents_manifest.json）
- 备份时间戳（backup_timestamp.txt）

#### 技能备份

- 技能目录（完整复制）
  - SKILL.md
  - index.js
  - test.js
  - README.md
  - prompts/
  - templates/（如有）
- 技能清单（skills_manifest.json）
- 验收报告（ACCEPTANCE_REPORT.md）
- 备份时间戳（backup_timestamp.txt）

### 备份验证

**负责人**: 审计智能体  
**验证内容**:
- 备份文件完整性（所有文件存在）
- 备份文件可读性（文件可打开）
- 版本号正确性（与变更日志一致）
- 时间戳准确性（备份后 1 小时内）

---

## 📚 飞书知识库同步

### 同步位置

| 类型 | 飞书知识库位置 | 文档命名 |
|------|--------------|---------|
| **宪法规范** | 知识库 → 规范文档 → 宪法规范 | `[宪法规范] V{版本号} - {日期}` |
| **智能体定义** | 知识库 → 规范文档 → 智能体 | `[智能体] {智能体名称} V{版本号}` |
| **技能** | 知识库 → 规范文档 → 技能库 | `[技能] {技能名称} V{版本号}` |
| **变更日志** | 知识库 → 规范文档 → 变更日志 | `[变更日志] V{版本号} - {日期}` |

### 同步流程

1. **总结反思智能体** 创建飞书文档
2. **上传内容**（宪法规范/智能体定义/技能/变更日志）
3. **设置权限**（只读，管理员可编辑）
4. **通知审计智能体** 验证同步完成
5. **审计智能体** 验证飞书文档可访问
6. **记录同步链接** 到本地备份目录

---

## 🔍 版本查询与回滚

### 版本查询

**位置**: `agents/docs/specs/versions/constitution/`

**查询方式**:
```bash
# 查看所有版本
ls -la agents/docs/specs/versions/constitution/

# 查看特定版本
cat agents/docs/specs/versions/constitution/V3.7.0/CONSTITUTION_V3.7.0.md

# 查看最新版本
cat agents/docs/specs/versions/constitution/latest/CONSTITUTION_V3.7.2.md
```

### 版本回滚

**流程**:
```
发现当前版本问题
        ↓
总结反思智能体提出回滚提案
        ↓
用户确认回滚
        ↓
复制历史版本到主存储
        ↓
更新版本号（增加修订号）
        ↓
更新变更日志（记录回滚）
        ↓
创建新版本备份
        ↓
审计智能体验证回滚完成
```

**示例**:
```bash
# 回滚到 V3.7.0
cp agents/docs/specs/versions/constitution/V3.7.0/CONSTITUTION_V3.7.0.md \
   agents/docs/specs/CONSTITUTION_V3.7.3.md

# 更新变更日志
echo "## V3.7.3 (2026-03-10)\n\n### 回滚\n- 回滚到 V3.7.0 版本\n- 原因：V3.7.2 发现严重问题" >> \
   agents/docs/specs/CHANGELOG.md
```

---

## 📊 版本清单

### 宪法规范版本历史

| 版本 | 日期 | 变更摘要 | 备份位置 | 飞书链接 |
|------|------|---------|---------|---------|
| V3.7.0 | 2026-03-09 | 初始版本 | `versions/constitution/V3.7.0/` | 待生成 |
| V3.7.1 | 2026-03-10 | 增加审计智能体职责 | `versions/constitution/V3.7.1/` | 待生成 |
| V3.7.2 | 待定 | 增加宪法规范迭代流程 | 待生成 | 待生成 |

### 技能版本历史

| 技能 ID | 当前版本 | 日期 | 备份位置 | 飞书链接 |
|--------|---------|------|---------|---------|
| skill-01 | V1.0.0 | 2026-03-09 | `versions/skills/V3.7.0/` | 待生成 |
| skill-03 | V1.0.0 | 2026-03-09 | `versions/skills/V3.7.0/` | 待生成 |
| ... | ... | ... | ... | ... |

---

## 📝 变更日志格式

### 宪法规范变更日志

```markdown
# 宪法规范变更日志

## V3.7.2 (2026-03-10)

### 新增
- 审计智能体周期性审计职责（第二章 §7）
- 总结反思智能体规范迭代职责（第二章 §8）
- 宪法规范迭代流程（第四章 4.5）

### 修订
- 更新可配置参数（第五章）

### 回滚
- 无

### 已知问题
- 无

## V3.7.1 (2026-03-10)

### 新增
- 审计智能体职责（第二章 §7）

### 修订
- 更新验收流程（第二章 §4）

## V3.7.0 (2026-03-09)

### 初始版本
- 8 个核心智能体定义
- 5 大核心原则
- 完整工作流程
```

### 技能变更日志

```markdown
# 技能变更日志

## skill-01-intent-classifier

### V1.0.0 (2026-03-09)
- 初始版本
- 支持 4 种意图分类
- 支持复合意图识别

## skill-03-ambiguity-detector

### V1.0.0 (2026-03-09)
- 初始版本
- 支持 6 维度模糊性检测
- 支持优先级判定
```

---

## 🔗 相关文档

- 宪法规范迭代流程：`CONSTITUTION_ITERATION_PROCESS.md`
- 总结反思智能体 AGENTS.md：`agents/constitution/summary-reflection/AGENTS.md`
- 审计智能体 AGENTS.md：`agents/constitution/audit/AGENTS.md`
- 变更日志：`CHANGELOG.md`

---

## 📝 示例：版本备份脚本

```bash
#!/bin/bash
# 宪法规范版本备份脚本

VERSION="V3.7.2"
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="agents/docs/specs/versions/constitution/${VERSION}"

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 复制宪法规范
cp agents/docs/specs/CONSTITUTION_${VERSION}.md ${BACKUP_DIR}/

# 复制变更日志
cp agents/docs/specs/CHANGELOG.md ${BACKUP_DIR}/CHANGELOG_${VERSION}.md

# 创建时间戳
echo "备份时间：$(date +%Y-%m-%d_%H:%M:%S)" > ${BACKUP_DIR}/backup_timestamp.txt

# 更新符号链接
ln -sfn ${VERSION} agents/docs/specs/versions/constitution/latest

echo "宪法规范 ${VERSION} 备份完成"
```

---

**文档版本**: 1.0  
**创建日期**: 2026-03-10  
**下次审查**: 2026-03-17
