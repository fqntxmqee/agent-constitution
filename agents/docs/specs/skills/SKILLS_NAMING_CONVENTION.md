# 技能命名规范 (V1.0)

**版本号**: 1.0  
**创建日期**: 2026-03-12  
**状态**: ✅ 已生效  
**依据**: 宪法规范 V3.7.3 第六章 4.5 节

---

## 📋 概述

本规范定义了 OpenClaw 技能系统的命名规则、ID 分配机制和注册表管理流程，确保技能 ID 全局唯一性和可追溯性。

---

## 🎯 ID 格式规范

### 标准格式

```
skill-NNN-{skill-name}
```

**组成部分**:
- `skill`: 固定前缀，标识为技能类型
- `NNN`: 3 位数字序号（001, 002, 003...）
- `skill-name`: 小写连字符命名（kebab-case）

### 命名示例

| 技能 ID | 技能名称 | 说明 |
|---------|----------|------|
| `skill-001-intent-classifier` | 全域意图分类引擎 | 第一个技能 |
| `skill-002-requirement-clarification` | 需求澄清智能体 | 第二个技能 |
| `skill-003-ambiguity-detector` | 跨域模糊性探测器 | 第三个技能 |
| `skill-004-routing-decider` | 动态路由决策器 | 第四个技能 |

### 命名规则

**✅ 正确示例**:
- `skill-001-intent-classifier`
- `skill-011-requirement-resolution`
- `skill-025-system-monitor`

**❌ 错误示例**:
- `skill-1-intent-classifier`（序号不足 3 位）
- `skill-001-Intent-Classifier`（使用了大写）
- `skill-001_intent_classifier`（使用了下划线）
- `intent-classifier`（缺少前缀和序号）

---

## 🔢 序号分配规则

### 分配原则

1. **顺序分配**: 按技能创建时间顺序分配序号
2. **唯一性**: 每个序号只能分配给一个技能
3. **不回收**: 已废弃的技能序号至少保留 90 天冷却期
4. **连续性**: 尽量保持序号连续，允许跳跃（如跳过保留序号）

### 序号段划分

| 序号段 | 用途 | 说明 |
|--------|------|------|
| 001-099 | 核心技能 | 宪法定义的 8 个智能体相关技能 |
| 100-199 | 扩展技能 | 用户自定义技能 |
| 200-299 | 实验技能 | 测试和实验性技能 |
| 300-999 | 保留 | 未来扩展 |

---

## 📇 技能注册表

### 注册表文件

**位置**: `agents/skills/skills_manifest.json`

**作用**: 维护全局技能 ID 索引，防止 ID 冲突

### 文件格式

```json
{
  "version": "1.0",
  "updatedAt": "2026-03-12T00:00:00Z",
  "totalSkills": 11,
  "skills": [
    {
      "id": "skill-001-intent-classifier",
      "name": "全域意图分类引擎",
      "status": "active",
      "createdAt": "2026-03-09",
      "location": "agents/skills/skill-01-intent-classifier/",
      "tests": 10,
      "passRate": "100%",
      "description": "全域意图分类引擎，支持 8 类意图识别"
    },
    {
      "id": "skill-002-requirement-clarification",
      "name": "需求澄清智能体",
      "status": "active",
      "createdAt": "2026-03-09",
      "location": "agents/skills/skill-02-requirement-clarification/",
      "tests": 8,
      "passRate": "100%",
      "description": "需求澄清智能体，意图识别与路由"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 技能 ID（全局唯一） |
| `name` | string | ✅ | 技能中文名称 |
| `status` | string | ✅ | 状态（active/inactive/deprecated） |
| `createdAt` | string | ✅ | 创建日期（YYYY-MM-DD） |
| `location` | string | ✅ | 技能目录路径 |
| `tests` | number | ⏸️ | 测试用例数量 |
| `passRate` | string | ⏸️ | 测试通过率 |
| `description` | string | ⏸️ | 技能描述 |

---

## 🔍 冲突检测机制

### 创建新技能时的检查流程

```
1. 检查 skills_manifest.json 是否已存在相同 ID
   ├─ 存在 → 拒绝创建，提示可用 ID
   └─ 不存在 → 继续步骤 2

2. 检查 agents/skills/ 目录是否已存在相同 ID 的目录
   ├─ 存在 → 拒绝创建，提示目录冲突
   └─ 不存在 → 继续步骤 3

3. 分配新序号（下一个可用序号）

4. 更新 skills_manifest.json
```

### 冲突检测脚本

```bash
#!/bin/bash
# scripts/check-skill-id-conflict.sh

SKILL_ID=$1
MANIFEST="agents/skills/skills_manifest.json"

# 检查 manifest 中是否存在
if grep -q "\"id\": \"$SKILL_ID\"" $MANIFEST; then
    echo "❌ 技能 ID 冲突：$SKILL_ID 已存在于注册表"
    exit 1
fi

# 检查目录是否存在
if [ -d "agents/skills/$SKILL_ID" ]; then
    echo "❌ 技能目录冲突：agents/skills/$SKILL_ID 已存在"
    exit 1
fi

echo "✅ 技能 ID 可用：$SKILL_ID"
exit 0
```

---

## 📝 技能创建流程

### 步骤 1: 检查可用 ID

```bash
# 查看当前最大序号
cat agents/skills/skills_manifest.json | jq '.skills | map(.id) | map(split("-")[1] | tonumber) | max'

# 输出：11（下一个可用序号是 12）
```

### 步骤 2: 创建技能目录

```bash
mkdir -p agents/skills/skill-012-new-skill/
cd agents/skills/skill-012-new-skill/
```

### 步骤 3: 创建技能文件

```bash
# 创建必要文件
touch SKILL.md index.js test.js README.md
mkdir prompts/
```

### 步骤 4: 更新注册表

编辑 `agents/skills/skills_manifest.json`，添加新技能记录：

```json
{
  "id": "skill-012-new-skill",
  "name": "新技能名称",
  "status": "active",
  "createdAt": "2026-03-12",
  "location": "agents/skills/skill-012-new-skill/",
  "tests": 0,
  "passRate": "N/A",
  "description": "技能描述"
}
```

### 步骤 5: 验证

```bash
# 运行冲突检测脚本
./scripts/check-skill-id-conflict.sh skill-012-new-skill

# 输出：✅ 技能 ID 可用：skill-012-new-skill
```

---

## 🔄 技能废弃流程

### 废弃条件

- 技能不再使用
- 技能被新版本替代
- 技能存在严重缺陷

### 废弃步骤

1. **标记状态**: 更新 `skills_manifest.json` 中技能状态为 `deprecated`
2. **保留目录**: 保留技能目录至少 90 天
3. **记录原因**: 在技能 SKILL.md 中添加废弃说明
4. **通知引用方**: 通知所有可能引用该技能的智能体

### 废弃示例

```json
{
  "id": "skill-006-blueprint-converter",
  "name": "多模态蓝图转换器",
  "status": "deprecated",
  "deprecatedAt": "2026-03-12",
  "deprecationReason": "功能已合并到 skill-005-requirement-understanding",
  "createdAt": "2026-03-09",
  "location": "agents/skills/skill-06-blueprint-converter/"
}
```

---

## 📊 技能 ID 冲突处理

### 历史遗留问题（V3.7.3 升级时）

**问题**: Skill-06 ID 被两个技能使用
- `skill-06-blueprint-converter`（多模态蓝图转换器）
- `skill-06-requirement-resolution`（需求解决智能体）

**解决方案**:
1. 保留 `skill-06-blueprint-converter`（按创建顺序）
2. 重命名 `skill-06-requirement-resolution` → `skill-11-requirement-resolution`

### 重命名步骤

```bash
# 1. 备份原目录
cp -r agents/skills/skill-06-requirement-resolution agents/skills/skill-11-requirement-resolution

# 2. 更新 SKILL.md 中的技能 ID
sed -i '' 's/skill-06-requirement-resolution/skill-11-requirement-resolution/g' agents/skills/skill-11-requirement-resolution/SKILL.md

# 3. 更新 skills_manifest.json
# 手动编辑或使用脚本更新

# 4. 删除原目录（确认无引用后）
rm -rf agents/skills/skill-06-requirement-resolution

# 5. 验证
./scripts/check-skill-id-conflict.sh skill-11-requirement-resolution
```

---

## 📚 参考文档

- 宪法规范 V3.7.3 第六章 4.5 节
- 技能开发规范：`agents/docs/specs/SKILLS_DEVELOPMENT.md`
- 技能测试规范：`agents/docs/specs/SKILLS_TESTING.md`

---

## 📝 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2026-03-12 | 初始版本（V3.7.3 升级） |

---

**规范版本**: 1.0  
**创建日期**: 2026-03-12  
**下次审查**: 2026-03-19
