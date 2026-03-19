# 宪法规范升级检查清单

> 确保每次升级不会遗漏任何智能体

## ⚠️ 升级前置条件

- [ ] 主规范 `CONSTITUTION.md` 版本号已更新
- [ ] 已创建新版本备份目录 `docs/versions/V{新版本}/`

## 🔄 升级步骤

### 步骤 0：备份当前智能体配置（完整备份）

```bash
VERSION=V{新版本}
SRC=agents/constitution
DST=agents/docs/versions/$VERSION/agents

mkdir -p $DST

# 复制所有智能体的所有 .md 文件（动态适应不同文件数量）
for dir in $SRC/*/; do
  name=$(basename "$dir")
  mkdir -p "$DST/$name"
  # 复制目录下所有 .md 文件
  cp "$dir"*.md "$DST/$name/" 2>/dev/null
done

echo "备份完成，验证完整性..."
```

**说明：** 不同智能体可能有不同数量的文件（AGENTS.md, SOUL.md, TOOLS.md, HEARTBEAT.md, USER.md, IDENTITY.md, 以及各类子规范文件）。使用 `*.md` 通配符自动复制所有文件。

### 步骤 1：更新所有智能体版本号

```bash
cd agents/constitution
for f in */AGENTS.md; do
  sed -i '' 's/V{旧版本}/V{新版本}/g' "$f"
done
```

### 步骤 2：验证智能体版本更新

```bash
# 检查是否所有智能体都已更新
for f in */AGENTS.md; do
  echo -n "$f: "
  grep -m1 "V3\." "$f" | grep -o "V3\.[0-9.]*" | head -1
done
```

### 步骤 3：验证备份完整性

```bash
VERSION=V{新版本}
DST=agents/docs/versions/$VERSION/agents

echo "=== 备份完整性检查 ==="
for dir in $DST/*/; do
  name=$(basename "$dir")
  echo -n "$name: "
  files=("AGENTS.md" "IDENTITY.md" "SOUL.md" "TOOLS.md" "HEARTBEAT.md" "USER.md")
  found=0
  for f in "${files[@]}"; do
    [ -f "$dir$f" ] && ((found++))
  done
  echo "$found/6 文件"
done
```

**预期结果：** 每个智能体目录都应该有 6/6 文件

### 步骤 3：检查清单

| # | 智能体 | 版本 | ✅/❌ |
|---|--------|------|-------|
| 1 | requirement-clarification | V{新版本} | |
| 2 | requirement-understanding | V{新版本} | |
| 3 | requirement-resolution | V{新版本} | |
| 4 | requirement-acceptance | V{新版本} | |
| 5 | requirement-delivery | V{新版本} | |
| 6 | progress-tracking | V{新版本} | |
| 7 | audit | V{新版本} | |
| 8 | summary-reflection | V{新版本} | |

### 步骤 4：提交

```bash
git add agents/constitution/*/AGENTS.md
git commit -m "chore(constitution): 升级宪法规范 V{旧版本} → V{新版本}"
```

---

## 📋 版本历史

| 日期 | 版本 | 备注 |
|------|------|------|
| 2026-03-19 | V3.10.0 | 修复遗漏问题，新增升级检查清单 |
| 2026-03-15 | V3.9.2 | 技术选型确认、L2→L3 映射表 |
| 2026-03-12 | V3.7.3 | ACP Harness 扩展 |
| 2026-03-10 | V3.7.1 | 需求级并行架构 |
| 2026-03-09 | V3.7 | 初始版本 |
