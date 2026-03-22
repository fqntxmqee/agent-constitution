# Template 规约生成系统（V3.12.0 ✅ 已实现）

> **状态**：✅ 已实现
> **参考**：gstack SKILL.md.tmpl → gen-skill-docs → SKILL.md
> **制定日期**：2026-03-22

---

## 背景

gstack 的核心工程化设计：

```
SKILL.md.tmpl → bun run gen-skill-docs → SKILL.md
```

代码是唯一真相，文档永远不过时。

---

## 我们的实现

### 模板文件

```
templates/specs/
├── proposal.md.tmpl    # 提案模板
├── design.md.tmpl     # 技术设计模板
└── tasks.md.tmpl      # 任务清单模板
```

### 生成器

```
scripts/gen-spec.py
```

### 用法

```bash
python3 scripts/gen-spec.py <template> <output> [key=value ...]

# 示例
python3 scripts/gen-spec.py tasks.md.tmpl \
    project/openclaw-portfolio-dashboard/changes/init/tasks.md \
    project=openclaw-portfolio-dashboard \
    version=1.0 \
    title="Portfolio Dashboard Tasks" \
    overview="实现仪表盘核心功能"
```

---

## 模板字段

所有模板支持以下默认变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `{{title}}` | - | 文档标题 |
| `{{project}}` | - | 项目名称 |
| `{{version}}` | 1.0 | 版本号 |
| `{{date}}` | 2026-03-22 | 日期（自动生成） |
| `{{owner}}` | auto-generated | 负责人 |

额外变量可按需传入 key=value 格式。

---

## 下一步

- [x] 创建模板文件（proposal.md.tmpl, design.md.tmpl, tasks.md.tmpl）
- [x] 开发生成器（gen-spec.py）
- [x] 验证功能正常
- [ ] 在实际项目中试点使用
