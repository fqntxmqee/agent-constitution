# 宪法规范 V3.7.3 升级提案（完整版）

**提案编号**: CONSTITUTION-2026-001  
**提案日期**: 2026-03-12  
**提案智能体**: 主会话（基于 summary-reflection 报告）  
**状态**: 📝 待用户确认  
**流程依据**: `agents/docs/specs/constitution/CONSTITUTION_ITERATION_PROCESS.md`

---

## 📊 升级背景

基于 2026-03-11 每日总结反思报告中发现的问题和改进机会，提出 V3.7.3 升级方案。

### 问题回顾

| 问题 | 影响 | 根因 |
|------|------|------|
| req-B 在代码未实现情况下进入验收 | 无效验收，资源浪费 | 缺少验收前置条件检查 |
| Skill-06 ID 重复（两个技能） | 技能引用混淆 | 缺少技能 ID 注册表机制 |
| Git 提交后推送待确认 | 交付流程不完整 | Git 推送要求不明确 |
| 会话锁竞争（历史问题） | 性能下降 30% | 多 agent 并发访问同一会话 |

---

## 🎯 核心变更

### 变更 1: 验收前置条件检查 🔴 高优先级

**问题**: 需求验收智能体在交付物不完整时仍进入正式验收流程

**解决方案**: 在需求验收智能体工作流程中增加「前置完整性检查」环节

**新增规范**:
```markdown
## 🔧 内部执行逻辑（更新）

### 阶段 0: 前置完整性检查（新增）
1. **加载交付物清单**: 从解决智能体提交物中读取预期文件列表
2. **文件存在性验证**: 检查关键文件是否存在
   - 开发类: 代码文件、配置文件、测试文件
   - 内容类: 文档文件、引用源
   - 技能类: SKILL.md、index.js、test.js
3. **完整性判定**:
   - ✅ 完整 → 进入正式验收流程
   - ❌ 缺失 → 出具《完整性失败报告》，退回需求解决智能体

### 阶段 1: 正式验收（原有流程）
...（保持不变）
```

**验收检查清单模板**:
```markdown
## 交付物完整性检查清单

**任务类型**: [开发类/内容类/技能类]

**预期文件**:
- [ ] 文件 1
- [ ] 文件 2
- ...

**检查结果**: ✅ 完整 / ❌ 缺失（详见下表）

**缺失文件**:
| 文件路径 | 预期内容 | 缺失影响 |
|----------|----------|----------|
| ... | ... | ... |

**结论**: 允许进入正式验收 / 退回补充
```

**影响范围**:
- `agents/constitution/requirement-acceptance/AGENTS.md`
- `agents/docs/specs/constitution/CONSTITUTION_V3.7.md` 第三章 3.4 节

---

### 变更 2: 技能 ID 命名规范与注册表 🟡 中优先级

**问题**: Skill-06 ID 被两个不同技能使用（blueprint-converter 和 requirement-resolution）

**解决方案**: 建立技能 ID 注册表机制，强制全局唯一性

**新增规范**:
```markdown
## 技能 ID 命名规范（新增第六章 4.5 节）

### ID 格式
```
skill-NNN-{skill-name}
```
- `NNN`: 3 位数字序号（001, 002, 003...）
- `skill-name`: 小写连字符命名（kebab-case）

### 唯一性要求
- ✅ 技能 ID 必须全局唯一
- ✅ 禁止复用已废弃的技能 ID（至少保留 90 天冷却期）
- ✅ 技能 ID 变更需更新注册表并通知所有引用方

### 技能注册表（skills_manifest.json）
```json
{
  "version": "1.0",
  "updatedAt": "2026-03-12T00:00:00Z",
  "skills": [
    {
      "id": "skill-001-intent-classifier",
      "name": "全域意图分类引擎",
      "status": "active",
      "createdAt": "2026-03-09",
      "location": "agents/skills/skill-01-intent-classifier/",
      "tests": 10,
      "passRate": "100%"
    },
    ...
  ]
}
```

### 冲突检测
- 技能创建时必须检查注册表
- 发现冲突 → 拒绝创建并提示可用 ID
- 定期审计脚本检测潜在冲突
```

**影响范围**:
- `agents/docs/specs/skills/SKILLS_NAMING_CONVENTION.md`（新增）
- `agents/skills/skills_manifest.json`（新增）
- `agents/docs/specs/constitution/CONSTITUTION_V3.7.md` 第六章

---

### 变更 3: Git 推送强制要求 🟡 中优先级

**问题**: Git 提交完成但推送待确认，交付流程不完整

**解决方案**: 明确 Git 推送是需求交付智能体的必要职责

**新增规范**:
```markdown
## 🔧 内部执行逻辑（更新）

### 开发类任务交付流程
1. **Git 提交**: 使用 Conventional Commits 规范
2. **Git 推送**: 
   - ✅ 默认自动推送到远程仓库
   - ⚠️ 若用户明确禁止推送 → 记录原因并跳过
   - ❌ 推送失败 → 立即报告用户并阻塞交付
3. **远程验证**: 确认远程仓库已同步
4. **Release Note**: 生成本次交付的发布说明
5. **交付报告**: 含任务摘要、成果链接、后续建议
```

**用户确认节点补充**:
```markdown
## 用户确认节点（更新）

**交付前确认**:
- [ ] 验收报告已审核通过
- [ ] 交付物完整性已验证
- [ ] **Git 推送目标分支确认**（main/develop/release）
- [ ] 生产环境部署需二次确认（强制）
```

**影响范围**:
- `agents/constitution/requirement-delivery/AGENTS.md`
- `agents/docs/specs/constitution/CONSTITUTION_V3.7.md` 第二章 3.5 节

---

### 变更 4: 支撑智能体三周期体系 🟢 低优先级（文档化现有实践）

**问题**: 支撑智能体协作模式未明确写入宪法

**解决方案**: 将已验证有效的三周期体系写入宪法

**新增规范**:
```markdown
## 支撑智能体三周期体系（新增第二章 6.3 节）

### 周期设计原则

| 智能体 | 周期 | 职责 | 设计理由 |
|--------|------|------|----------|
| progress-tracking | 30 分钟 | 进展汇报 | 短周期保持透明度，及时识别阻塞 |
| audit | 2 小时 | 合规检查 | 中周期平衡检查频率与资源消耗 |
| summary-reflection | 24 小时 | 总结反思 | 长周期沉淀知识，避免碎片化 |

### 配置要求
- **progress-tracking**: 每 30 分钟自动执行，产出进展报告
- **audit**: 每 2 小时自动执行，产出审计报告
- **summary-reflection**: 每日 23:00 自动执行 + 里程碑触发

### 报告流转
- 进展报告 → 主会话汇总 → 用户
- 审计报告 → 主会话 + 飞书文档 → 用户
- 总结报告 → 主会话 + 飞书文档 + MEMORY.md → 用户
```

**影响范围**:
- `agents/docs/specs/constitution/CONSTITUTION_V3.7.md` 第二章 6.3 节
- `HEARTBEAT.md`（引用更新）

---

### 变更 5: 独立会话目录（锁竞争解决方案） 🟢 低优先级

**问题**: 多 agent 并发访问同一会话导致锁竞争（历史问题 10+ 次/任务）

**解决方案**: 实现独立会话目录，彻底隔离

**新增规范**:
```markdown
## 独立会话目录规范（新增第七章 7.4 节）

### 目录结构
```
~/.openclaw/agents/
├── requirement-understanding/
│   └── sessions/
├── requirement-resolution/
│   └── sessions/
├── requirement-acceptance/
│   └── sessions/
├── requirement-delivery/
│   └── sessions/
├── progress-tracking/
│   └── sessions/
├── audit/
│   └── sessions/
└── summary-reflection/
    └── sessions/
```

### 优势
- ✅ 无锁竞争（各智能体独立目录）
- ✅ 清晰隔离（易于调试和审计）
- ✅ 性能提升 30%（无等待时间）

### 迁移计划
- 新任务立即使用独立会话目录
- 旧任务继续完成，无需迁移
```

**影响范围**:
- `agents/docs/config/INDEPENDENT_SESSION_DIRECTORY.md`（已存在，需引用）
- `agents/docs/specs/constitution/CONSTITUTION_V3.7.md` 第七章

---

## 📋 受影响的文件清单

### 备份文件（阶段 0）
| 文件/目录 | 备份类型 | 备份位置 |
|-----------|---------|----------|
| `CONSTITUTION.md` | 全量备份 | `agents/docs/versions/V3.7.3/constitution/` |
| `agents/constitution/*/AGENTS.md` | 受影响 4 个 | `agents/docs/versions/V3.7.3/agents/` |
| `agents/skills/*` | 全量备份（推荐） | `agents/docs/versions/V3.7.3/skills/` |

### 更新文件（阶段一 ~ 阶段三）
| 文件 | 变更类型 | 优先级 |
|------|----------|--------|
| `agents/constitution/requirement-acceptance/AGENTS.md` | 新增前置检查 | 🔴 P0 |
| `agents/constitution/requirement-delivery/AGENTS.md` | Git 推送强制 | 🟡 P1 |
| `agents/constitution/requirement-understanding/AGENTS.md` | 已更新（V3.7.2） | ✅ 已完成 |
| `agents/docs/specs/constitution/CONSTITUTION_V3.7.md` | 整合所有变更 | 🔴 P0 |
| `agents/docs/specs/skills/SKILLS_NAMING_CONVENTION.md` | 新增规范 | 🟡 P1 |
| `agents/skills/skills_manifest.json` | 新增注册表 | 🟡 P1 |
| `agents/docs/specs/constitution/CHANGELOG.md` | 新增变更日志 | 🟡 P1 |
| `HEARTBEAT.md` | 引用更新 | 🟢 P2 |
| `MEMORY.md` | 升级记录 | 🟢 P2 |

---

## 🚀 执行计划（完整版 · 5 阶段）

### 阶段 0: 备份（新增 · P0）🔴

**依据**: `CONSTITUTION_ITERATION_PROCESS.md` 阶段 0

**执行内容**:
```bash
# 1. 创建版本目录
mkdir -p agents/docs/versions/V3.7.3/constitution/
mkdir -p agents/docs/versions/V3.7.3/agents/
mkdir -p agents/docs/versions/V3.7.3/skills/

# 2. 备份宪法规范主文档
cp agents/docs/specs/constitution/CONSTITUTION.md agents/docs/versions/V3.7.3/constitution/CONSTITUTION.md

# 3. 备份相关智能体 AGENTS.md（受影响的 4 个）
cp agents/constitution/requirement-acceptance/AGENTS.md agents/docs/versions/V3.7.3/agents/
cp agents/constitution/requirement-delivery/AGENTS.md agents/docs/versions/V3.7.3/agents/
cp agents/constitution/requirement-understanding/AGENTS.md agents/docs/versions/V3.7.3/agents/

# 4. 备份技能目录（全部技能）
# 方案 A: 全量备份（推荐，确保完整性）
cp -r agents/skills/* agents/docs/versions/V3.7.3/skills/

# 方案 B: 仅备份受影响的技能（如 Skill-06 需要重命名）
# cp -r agents/skills/skill-06-* agents/docs/versions/V3.7.3/skills/
# cp -r agents/skills/skill-11-* agents/docs/versions/V3.7.3/skills/

# 5. 记录备份时间戳
date +"备份时间：%Y-%m-%d_%H:%M:%S" > agents/docs/versions/V3.7.3/constitution/backup_timestamp.txt
```

**备份策略说明**:
- **宪法规范**: 全量备份（单个文件，成本低）
- **智能体 AGENTS.md**: 仅备份受影响的 4 个（requirement-acceptance, requirement-delivery, requirement-understanding, requirement-resolution）
- **技能目录**: 
  - 方案 A（推荐）: 全量备份所有技能，确保版本完整性
  - 方案 B: 仅备份受影响的技能（如 Skill-06 需要重命名）

**验收标准**:
- [ ] 宪法规范备份完成
- [ ] 智能体 AGENTS.md 备份完成
- [ ] 技能目录备份完成（全量或受影响技能）
- [ ] 备份时间戳记录完成

---

### 阶段一：核心变更（P0）

**执行内容**:
1. 更新 `requirement-acceptance/AGENTS.md`（前置检查）
2. 更新 `CONSTITUTION_V3.7.md`（整合变更）
3. 测试验收前置检查流程

**验收标准**:
- [ ] 验收前置检查流程测试通过
- [ ] 审计智能体验证合规性

---

### 阶段二：配套规范（P1）

**执行内容**:
4. 创建 `SKILLS_NAMING_CONVENTION.md`
5. 创建 `skills_manifest.json`（初始化现有 11 个技能）
6. 更新 `requirement-delivery/AGENTS.md`（Git 推送）

**验收标准**:
- [ ] 技能命名规范文档创建完成
- [ ] 技能注册表初始化完成（11 个技能）
- [ ] Git 推送流程测试通过

---

### 阶段三：文档化（P2）

**执行内容**:
7. 更新 `HEARTBEAT.md`（三周期体系引用）
8. 更新 `MEMORY.md`（V3.7.3 升级记录）
9. 更新 `CHANGELOG.md`（V3.7.3 变更日志）

**验收标准**:
- [ ] CHANGELOG.md 记录 V3.7.2 → V3.7.3 变更
- [ ] MEMORY.md 记录升级日志

---

### 阶段四：Git 提交与推送（P0）🔴

**执行内容**:
```bash
# 1. Git add 所有变更文件
git add agents/docs/specs/constitution/CONSTITUTION_V3.7.3_PROPOSAL.md
git add agents/docs/specs/constitution/CONSTITUTION_V3.7.md
git add agents/docs/specs/constitution/CHANGELOG.md
git add agents/constitution/*/AGENTS.md
git add agents/docs/specs/skills/SKILLS_NAMING_CONVENTION.md
git add agents/skills/skills_manifest.json
git add agents/docs/versions/

# 2. Git commit（Conventional Commits 规范）
git commit -m "feat: 宪法规范升级至 V3.7.3（验收前置检查 + 技能 ID 注册表 + Git 推送强制）"

# 3. Git push 到远程仓库
git push origin main

# 4. 创建 Git tag
git tag -a v3.7.3 -m "宪法规范 V3.7.3 - 验收前置检查 + 技能 ID 注册表 + Git 推送强制"
git push origin v3.7.3
```

**验收标准**:
- [ ] Git 提交完成（Conventional Commits）
- [ ] Git push 成功
- [ ] Git tag 创建并推送

---

### 阶段五：飞书同步（P1 · 可选但推荐）

**执行内容**:
1. 创建飞书文档《宪法规范 V3.7.3 升级说明》
2. 上传变更对比和说明
3. 保存链接到 workspace

**文档结构**:
```markdown
# 宪法规范 V3.7.3 升级说明

## 变更概览
| 变更 | 优先级 | 解决问题 |
|------|--------|----------|
| 验收前置检查 | P0 | 无效验收 |
| 技能 ID 注册表 | P1 | ID 冲突 |
| Git 推送强制 | P1 | 交付不完整 |

## 变更对比
（详细对比表）

## 影响分析
- 影响智能体：requirement-acceptance, requirement-delivery
- 影响技能：需更新技能 ID
- 影响流程：验收流程增加前置检查

## 参考链接
- 提案文档：[CONSTITUTION_V3.7.3_PROPOSAL.md](链接)
- 宪法规范：[CONSTITUTION_V3.7.3.md](链接)
```

**保存位置**:
```
openspec/changes/constitution-v3.7.3/feishu-doc-url.txt
```

**验收标准**:
- [ ] 飞书文档创建完成
- [ ] 链接保存到 workspace

---

## ⚠️ 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 前置检查导致验收延迟 | 低 | 低 | 检查应在 1 分钟内完成 |
| 技能 ID 注册表初始化工作量大 | 中 | 低 | 可逐步完善，不影响核心功能 |
| Git 推送失败阻塞交付 | 中 | 中 | 明确失败处理流程，用户可 override |
| 独立会话目录兼容性问题 | 低 | 中 | 新旧并存，逐步迁移 |
| 备份文件占用空间 | 低 | 低 | 仅备份受影响文件，非全量备份 |

---

## ✅ 验收标准（分阶段）

### 阶段 0: 备份
- [ ] 宪法规范备份完成
- [ ] 智能体 AGENTS.md 备份完成
- [ ] 备份时间戳记录完成

### 阶段一：核心变更
- [ ] 验收前置检查流程测试通过
- [ ] 审计智能体验证合规性

### 阶段二：配套规范
- [ ] 技能命名规范文档创建完成
- [ ] 技能注册表初始化完成（11 个技能）
- [ ] Git 推送流程测试通过

### 阶段三：文档化
- [ ] CHANGELOG.md 记录 V3.7.2 → V3.7.3 变更
- [ ] MEMORY.md 记录升级日志

### 阶段四：Git 提交与推送
- [ ] Git 提交完成（Conventional Commits）
- [ ] Git push 成功
- [ ] Git tag 创建并推送

### 阶段五：飞书同步
- [ ] 飞书文档创建完成
- [ ] 链接保存到 workspace

**总体完成标志**: 所有阶段验收通过 ✅

---

## 📊 预期效果

| 指标 | V3.7.2 | V3.7.3 预期 |
|------|--------|-------------|
| 无效验收次数 | 1 次（req-B） | 0 次 |
| 技能 ID 冲突 | 1 次 | 0 次 |
| Git 推送遗漏 | 1 次 | 0 次 |
| 锁竞争次数 | 0 次（今日） | 0 次 |
| 验收流程效率 | 基准 | +20%（避免无效验收） |

---

## ❓ 用户确认事项

**请确认以下内容**:

### 必须确认（阻塞升级）

1. ✅ **是否同意** V3.7.3 升级方案（5 项核心变更 + 5 阶段执行计划）？
   - [ ] 同意 → 按阶段 0 → 阶段 5 顺序执行
   - [ ] 需要修改 → 告知调整内容

2. ❓ **技能 ID 冲突处理**: Skill-06 重复问题，选择哪个技能重命名？
   - [ ] 方案 A: `skill-06-requirement-resolution` → `skill-11-requirement-resolution` ✅ 推荐（保持技能开发顺序）
   - [ ] 方案 B: `skill-06-blueprint-converter` → `skill-11-blueprint-converter`

3. ❓ **Git 推送策略**: 默认自动推送还是每次确认？
   - [ ] 方案 A: 默认自动推送（非生产分支）✅ 推荐（减少人工干预）
   - [ ] 方案 B: 每次推送前用户确认

### 建议确认（优化项）

4. ❓ **飞书同步**: 是否创建飞书文档？
   - [ ] 是 → 执行阶段五
   - [ ] 否 → 跳过阶段五（仅 Git 存档）

---

**请回复确认后，我开始执行升级！** 🚀

---

## 📎 附录：完整升级检查清单

```markdown
# V3.7.3 升级检查清单（完整版）

## 阶段 0: 备份 🔴
- [ ] 创建 agents/docs/versions/V3.7.3/constitution/ 目录
- [ ] 创建 agents/docs/versions/V3.7.3/agents/ 目录
- [ ] 创建 agents/docs/versions/V3.7.3/skills/ 目录
- [ ] 备份 CONSTITUTION.md → agents/docs/versions/V3.7.3/constitution/
- [ ] 备份 requirement-acceptance/AGENTS.md → agents/docs/versions/V3.7.3/agents/
- [ ] 备份 requirement-delivery/AGENTS.md → agents/docs/versions/V3.7.3/agents/
- [ ] 备份 requirement-understanding/AGENTS.md → agents/docs/versions/V3.7.3/agents/
- [ ] 备份 skills/* → agents/docs/versions/V3.7.3/skills/（全量或受影响技能）
- [ ] 记录 backup_timestamp.txt

## 阶段一：核心变更 🔴
- [ ] 更新 requirement-acceptance/AGENTS.md（前置检查）
- [ ] 更新 CONSTITUTION_V3.7.md（整合变更）
- [ ] 测试验收前置检查流程
- [ ] 审计验证合规性

## 阶段二：配套规范 🟡
- [ ] 创建 SKILLS_NAMING_CONVENTION.md
- [ ] 创建 skills_manifest.json（11+ 个技能）
- [ ] 更新 requirement-delivery/AGENTS.md（Git 推送）

## 阶段三：文档化 🟢
- [ ] 更新 CHANGELOG.md
- [ ] 更新 MEMORY.md
- [ ] 更新 HEARTBEAT.md（可选）

## 阶段四：Git 提交与推送 🔴
- [ ] git add 所有变更文件（含 versions/ 备份目录）
- [ ] git commit -m "feat: 宪法规范升级至 V3.7.3"
- [ ] git push origin main
- [ ] git tag -a v3.7.3 -m "宪法规范 V3.7.3"
- [ ] git push origin v3.7.3

## 阶段五：飞书同步 🟡（可选）
- [ ] 创建飞书文档《宪法规范 V3.7.3 升级说明》
- [ ] 保存链接到 openspec/changes/constitution-v3.7.3/feishu-doc-url.txt

## 最终验收 ✅
- [ ] 所有阶段验收通过
- [ ] 审计报告确认合规
- [ ] 用户最终确认
```

---

**提案版本**: V3.7.3-draft-001  
**创建时间**: 2026-03-12 00:20  
**下次审查**: 用户确认后
