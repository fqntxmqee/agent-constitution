# 宪法规范仓库目录结构标准

**版本号**: V1.0  
**生效日期**: 2026-03-12  
**状态**: ✅ 已确认  
**关联决策**: DEC-021, DEC-022

---

## 🎯 目的

明确宪法规范仓库的目录结构标准，确保：
- ✅ 目录结构清晰，便于宪法规范升级
- ✅ 避免项目代码和个人文件混入
- ✅ 版本备份规范，支持回滚
- ✅ 所有参与者遵守统一标准

---

## 📁 标准目录结构

**说明**：以下路径均相对于**仓库根**（本宪法规范仓库根，即当前工作区根）。目录结构以本规范为**唯一权威**；白名单、交付清单等仅保留路径清单并引用本规范。

### 根目录

```
仓库根/
│
├── agents/                           # 【核心】智能体与文档
│   ├── constitution/                 # 8 个智能体配置
│   │   └── */AGENTS.md               # 仅允许 AGENTS.md
│   └── docs/                         # 【核心】文档（路径前缀 agents/docs/）
│       ├── specs/                    # 宪法规范文档
│       ├── decisions/                # 全局决策记录（见 §3 说明）
│       ├── discussions/             # 全局讨论记录（见 §4 说明）
│       ├── proposals/                # 全局提案文档（见 §5 说明）
│       ├── templates/                # 智能体模板
│       └── versions/                 # 版本备份（先版本后类型，见 §7）
│           ├── V{version}/
│           │   ├── agents/
│           │   ├── constitution/     # 含 upgrade-to-V{目标}/ 过程文档
│           │   └── skills/
│           └── latest -> V{version}/
│
├── .gitignore                        # Git 忽略规则
├── README.md                         # 仓库说明
└── AGENTS.md                         # 工作区配置（可选）
```

---

## ✅ 允许的目录和文件

### 1. agents/constitution/（智能体配置）

**允许**:
```
agents/constitution/
├── audit/AGENTS.md                   # ✅ 审计智能体
├── progress-tracking/AGENTS.md       # ✅ 进展跟进智能体
├── requirement-acceptance/AGENTS.md  # ✅ 需求验收智能体
├── requirement-clarification/AGENTS.md  # ✅ 需求澄清智能体
├── requirement-delivery/AGENTS.md    # ✅ 需求交付智能体
├── requirement-resolution/AGENTS.md  # ✅ 需求解决智能体
├── requirement-understanding/AGENTS.md  # ✅ 需求理解智能体
└── summary-reflection/AGENTS.md      # ✅ 总结反思智能体
```

**每个智能体目录仅允许 AGENTS.md 文件**。

**禁止**:
```
agents/constitution/audit/
├── .openclaw/                        # ❌ 禁止
├── skills/                           # ❌ 禁止（技能在全局 agents/skills/）
├── tools/                            # ❌ 禁止（工具在全局 agents/tools/）
├── reports/                          # ❌ 禁止（报告在 docs/reports/）
└── *.json                            # ❌ 禁止（状态文件）
```

**说明**:
- **技能（skills）** 是全局共享的，放在 `agents/skills/`
- **工具（tools）** 是全局共享的，放在 `agents/tools/`
- **智能体配置** 仅包含 AGENTS.md，定义智能体职责和行为规范

---

### 2. agents/docs/specs/（宪法规范文档，方案 A 分目录）

**允许**:
```
agents/docs/specs/
├── README.md                         # ✅ 规范索引
├── constitution/                     # ✅ 宪法（方案 A：根仅 CONSTITUTION.md + CHANGELOG）
│   ├── CONSTITUTION.md               # ✅ 唯一入口
│   ├── CHANGELOG.md
│   ├── README.md
│   ├── upgrade/                      # 升级流程
│   ├── change-classification/        # 变更分类
│   ├── cooling-off/                  # 冷静期
│   ├── audit/                        # 审计清单
│   ├── backup/                       # 备份与回滚
│   ├── delivery/                     # 交付校验
│   ├── directory-standard/          # 本规范
│   ├── decision-recording/          # 决策记录规范
│   └── architecture/                # 架构扩展
├── process/                          # ✅ OpenSpec、审计、仓库治理
├── skills/                           # ✅ 技能命名、冲突解决等
└── meta/                             # ✅ 版本控制与备份流程说明
```

**禁止**:
```
agents/docs/specs/
├── project-*.md                      # ❌ 项目文档
├── meeting-*.md                      # ❌ 会议记录
└── personal-*.md                     # ❌ 个人文档
```

---

### 3. agents/docs/decisions/（全局决策记录）

**用途**：仅用于**跨版本、非单次升级**的决策。**某次升级过程**的决策记录放在 `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/decisions/`，详见 §7 与 DECISION_RECORDING_RULES.md 第六节。

**允许**:
```
agents/docs/decisions/
├── DECISION_LOG.md                   # ✅ 决策日志索引
└── DEC-{NNN}.md                      # ✅ 决策记录（DEC-001 至 DEC-XXX）
```

**命名规则**:
- 格式：`DEC-{3 位数字}.md`
- 示例：`DEC-001.md`, `DEC-002.md`, `DEC-030.md`
- 序号：从 001 开始递增

---

### 4. agents/docs/discussions/（全局讨论记录）

**用途**：仅用于**跨版本、非单次升级**的讨论。**某次升级过程**的讨论记录放在 `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/discussions/`，详见 §7。

**允许**:
```
agents/docs/discussions/
└── DISCUSSION_{议题编号}_{主题}.md   # ✅ 讨论记录
```

**命名规则**:
- 格式：`DISCUSSION_{3 位数字}_{主题}.md`
- 示例：`DISCUSSION_001_VERSIONING.md`
- 主题：使用大写字母和下划线

---

### 5. agents/docs/proposals/（全局提案文档）

**用途**：仅用于**跨版本、非单次升级**的提案与演练（如总结报告、回滚演练、飞书配置）。**某次宪法升级**的提案、设计、交付报告等一律放在 `agents/docs/versions/V{源版本}/constitution/upgrade-to-V{目标版本}/`，详见 §7。

**允许**:
```
agents/docs/proposals/
├── constitutional/                   # ✅ 宪法相关总结/报告（非单次升级）
│   └── CONSTITUTION_V{version}_*.md
├── drills/                           # ✅ 演练记录
│   └── ROLLBACK_DRILL_{NNN}.md
└── configs/                          # ✅ 配置指南
    └── *_CONFIG.md
```

**分类规则**:
- **constitutional/**: 宪法相关总结报告（非单次 upgrade-to-V 过程）
- **drills/**: 回滚演练、测试演练等
- **configs/**: 配置指南、操作手册等

---

### 6. agents/docs/templates/（智能体模板）

**允许**:
```
agents/docs/templates/
└── {智能体名称}-agent.md             # ✅ 智能体模板
```

**示例**:
- `audit-agent.md`
- `progress-tracking-agent.md`
- `requirement-delivery-agent.md`

---

### 7. agents/docs/versions/（版本备份，先版本后类型）

**允许**:
```
agents/docs/versions/
├── V{version}/                       # 版本目录（先版本、后类型）
│   ├── agents/                       # 该版本智能体配置备份
│   ├── constitution/                 # 该版本宪法快照与升级过程文档
│   │   ├── CONSTITUTION_*.md
│   │   ├── backup_timestamp.txt
│   │   └── upgrade-to-V{目标版本}/   # 某次升级过程文档（从本版本升级到目标版本）
│   │       ├── proposal.md
│   │       ├── design.md
│   │       ├── decisions/            # 该次升级的决策记录
│   │       ├── discussions/          # 该次升级的讨论记录
│   │       └── delivery-report.md 等
│   └── skills/                       # 该版本技能备份
└── latest -> V{version}/             # ✅ 符号链接指向当前最新版本
```

**约定**：单次升级（如 V3.7.3→V3.7.4）的提案、讨论、决策、交付**一律**放在 `V{源版本}/constitution/upgrade-to-V{目标版本}/`，不放在顶层 agents/docs/decisions、discussions、proposals。

**版本命名规则**:
- 格式：`V{MAJOR}.{MINOR}.{PATCH}`
- 示例：`V3.9.0`, `V4.0.0`
- 遵循 SemVer 2.0.0

---

## ❌ 禁止的目录和文件

### 1. 项目代码

```
❌ us_stock_system/                  # 股票项目
❌ fitbot/                           # FitBot 项目
❌ fitbot-pro/                       # FitBot Pro 项目
❌ openspec/changes/                 # OpenSpec 变更（移至独立仓库）
❌ 其他项目代码目录
```

### 2. 个人文件

```
❌ memory/                           # 个人记忆文件
❌ IDENTITY.md                       # 个人身份文件
❌ SOUL.md                           # 个人灵魂文件
❌ USER.md                           # 用户信息文件
❌ TOOLS.md                          # 工具配置
❌ TODO.md                           # 待办事项
❌ HEARTBEAT.md                      # 心跳配置
```

### 3. 状态文件

```
❌ .openclaw/                        # OpenClaw 状态
❌ *.json                            # 状态文件（task-state.json, audit-state.json 等）
❌ *.log                             # 日志文件
```

### 4. 临时备份

```
❌ skills.backup.*/                  # 技能临时备份
❌ *.backup.*/                       # 其他临时备份
❌ agents.bak/                       # 智能体备份
```

### 5. 依赖目录

```
❌ node_modules/                     # Node.js 依赖
❌ __pycache__/                      # Python 缓存
❌ .venv/                            # Python 虚拟环境
❌ venv/                             # Python 虚拟环境
```

### 6. 其他

```
❌ docs/（非宪法相关）               # 项目文档
❌ scripts/                          # 脚本文件
❌ templates/（非智能体模板）        # 模板文件
❌ .github/workflows/                # GitHub Actions（不需要）
```

---

## 📝 命名规范

### 文件命名

| 类型 | 格式 | 示例 |
|------|------|------|
| **宪法规范** | `CONSTITUTION_{主题}.md` | `CONSTITUTION_CHANGE_CLASSIFICATION.md` |
| **决策记录** | `DEC-{3 位数字}.md` | `DEC-001.md` |
| **讨论记录** | `DISCUSSION_{3 位数字}_{主题}.md` | `DISCUSSION_001_VERSIONING.md` |
| **提案文档** | `{分类}/{主题}.md` | `constitutional/CONSTITUTION_V3.9.0_FINAL_REPORT.md` |
| **智能体模板** | `{名称}-agent.md` | `audit-agent.md` |
| **版本备份** | `V{MAJOR}.{MINOR}.{PATCH}` | `V3.9.0` |

### 目录命名

| 类型 | 格式 | 示例 |
|------|------|------|
| **智能体** | `{名称}`（小写，连字符） | `requirement-delivery` |
| **文档分类** | `{名称}`（小写，复数） | `specs`, `decisions`, `proposals` |
| **版本备份** | `V{version}` | `V3.9.0` |

---

## 🔧 宪法规范升级流程

### 升级前准备

1. **阅读本规范**
   - 确认了解允许的目录和文件
   - 确认了解禁止的目录和文件

2. **创建分支**
   ```bash
   git checkout -b feature/constitution-V{version}
   ```

3. **生成文件清单**
   ```bash
   # 列出所有准备提交的文件
   git add -A
   git diff --cached --name-only > /tmp/staged_files.txt
   ```

### 升级中操作

4. **白名单校验**
   - 对比 `CONSTITUTION_BACKUP_WHITELIST.md`
   - 确保无黑名单文件
   - 确保所有文件在允许目录内

5. **目录结构校验**
   - 检查是否有非标准目录
   - 检查是否有 node_modules, .openclaw 等
   - 检查文件命名是否规范

6. **生成校验报告**
   ```markdown
   ## 目录结构校验报告
   
   ### 提交文件数量
   - 总计：XX 个文件
   
   ### 白名单校验
   - ✅ 无黑名单文件
   - ✅ 所有文件在允许目录内
   
   ### 目录结构校验
   - ✅ 无 node_modules
   - ✅ 无 .openclaw
   - ✅ 文件命名规范
   ```

### 升级后操作

7. **版本备份**
   ```bash
   # 创建版本备份目录
   mkdir -p agents/docs/versions/V{version}/constitution/
   
   # 复制规范文档
   cp agents/docs/specs/constitution/CONSTITUTION.md agents/docs/versions/V{version}/constitution/
   
   # 创建备份元数据
   # 更新 latest 符号链接
   ```

8. **Git 提交**
   ```bash
   git commit -m "feat: 宪法 V{version} 升级"
   git push origin feature/constitution-V{version}
   ```

9. **创建 Pull Request**
   - 标题：`feat: 宪法 V{version} 升级`
   - 描述：包含变更摘要、影响分析、校验报告

10. **合并后操作**
    - 创建 Git Tag：`git tag -a v{version}`
    - 推送 Tag：`git push origin v{version}`
    - 更新飞书文档

---

## 📊 校验清单

### 提交前检查

- [ ] 所有文件在允许目录内
- [ ] 无黑名单文件
- [ ] 无 node_modules, .openclaw 等
- [ ] 文件命名符合规范
- [ ] 目录命名符合规范
- [ ] 已生成校验报告
- [ ] 用户确认校验报告

### 提交后检查

- [ ] Git 提交成功
- [ ] Git push 成功
- [ ] 版本备份完成
- [ ] Git Tag 创建成功
- [ ] 飞书文档同步

---

## 🚨 违规处理

### 违规等级

| 等级 | 说明 | 处理 |
|------|------|------|
| 🔴 严重 | 提交项目代码或个人文件 | 立即回滚 + 审计记录 |
| 🟡 一般 | 提交非标准目录 | 限期清理 |
| 🟢 轻微 | 文件命名不规范 | 建议改进 |

### 处理流程

```
发现违规 → 审计记录 → 回滚提交 → 清理文件 → 重新提交
```

---

## 📚 参考文档

- `CONSTITUTION_BACKUP_WHITELIST.md` - 备份白名单规范
- `VERSION_BACKUP_AND_ROLLBACK.md` - 版本备份与回滚规范
- `CONSTITUTION_DELIVERY_CHECKLIST.md` - 交付校验清单

---

**规范版本**: V1.0  
**创建日期**: 2026-03-12  
**关联决策**: DEC-021, DEC-022  
**下次审查**: 2026-04-12
