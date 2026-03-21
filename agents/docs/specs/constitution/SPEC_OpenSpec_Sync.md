# OpenSpec 规约同步机制规范

> 版本: 3.10.0  
> 创建时间: 2026-03-20  
> 生效日期: 2026-03-21  
> 类型: Type-C（流程改进）

---

## 一、目的

确保**本地规约文件**与**飞书文档**内容一致，实现：
- 规约可追溯、可审计
- 多地多端可访问
- 避免版本分裂

---

## 二、核心原则

### 2.1 飞书作为唯一真相源

飞书文档作为**唯一真相源**，所有用户-facing 的规约内容以飞书为准。

本地文件作为**开发参考**，可由工具自动生成或手动维护。

### 2.2 规约按项目+需求隔离

每个**独立需求**有独立的规约目录，结构如下：

```
project/{项目名}/changes/{需求名}/
├── proposal.md              # 需求提案
├── specs/
│   └── requirements.md     # 详细需求（L2/L3/L4）
├── design.md                # 技术设计
├── tasks.md                # 任务清单
├── test-report.md          # 验收报告（可选）
├── story/                  # Story File 上下文（V3.11.0 新增）
│   ├── state.md            # 当前故事状态
│   ├── context/            # 各阶段上下文
│   ├── decisions/          # 决策索引
│   └── feedback/           # 用户反馈
└── feishu-doc-urls.txt     # 飞书文档链接索引
```

### 2.3 同步时机

| 阶段 | 同步要求 | 说明 |
|------|----------|------|
| 需求澄清完成 | ✅ 必须 | 提案同步到飞书，用户确认链接 |
| 需求理解完成 | ✅ 必须 | 蓝图（design/tasks）同步到飞书，用户确认 |
| 需求解决完成 | ⚠️ 如有变更 | 开发过程中规约有变更时同步 |
| 需求交付完成 | ✅ 必须 | 验收报告同步到飞书，链接回写本地 |

---

## 三、同步操作规范

### 3.1 创建飞书文档

```markdown
## 操作
1. 本地创建规约文件
2. 调用 feishu_doc create（title + content）
3. 获取返回的 doc_token
4. 将链接追加到 feishu-doc-urls.txt

## 格式（feishu-doc-urls.txt）
| 文档类型 | 飞书链接 | 本地路径 | 最后更新 |
|----------|----------|----------|----------|
| proposal | https://feishu.cn/docx/xxx | proposal.md | 2026-03-20 |
| design | https://feishu.cn/docx/yyy | design.md | 2026-03-20 |
```

### 3.2 更新飞书文档

```markdown
## 操作
1. 本地修改规约文件
2. 调用 feishu_doc write（content 覆盖）
3. 更新 feishu-doc-urls.txt 的最后更新时间

## 注意
- 使用 write 而非 append（append 可能导致重复）
- 更新后验证 block_count > 0
```

### 3.3 读取飞书文档

```markdown
## 操作
1. 调用 feishu_doc read 验证内容
2. 若 block_count == 0，立即 feishu_doc write 补充
3. 与本地文件交叉验证

## 验证清单
- [ ] block_count > 0
- [ ] 内容与预期一致
- [ ] 格式正确（表格/代码/标题）
```

---

## 四、冲突处理

### 4.1 本地与飞书不一致

**处理规则**：
1. 飞书内容 > 本地内容（飞书是真相源）
2. 若本地有而飞书没有，以飞书为准，本地覆盖
3. 若飞书有而本地没有，提示用户确认

### 4.2 飞书文档为空

**处理规则**：
1. 调用 feishu_doc read 检查 block_count
2. 若 block_count == 0，立即 feishu_doc write 补充
3. 记录错误到审计报告

---

## 五、审计检查

在**需求理解**和**需求交付**阶段，审计智能体应检查：

### 5.1 需求理解阶段
- [ ] 本地 proposal.md 存在且内容完整
- [ ] 飞书文档已创建，链接在 feishu-doc-urls.txt
- [ ] 设计方案已同步到飞书

### 5.2 需求交付阶段
- [ ] 验收报告已同步到飞书
- [ ] 飞书链接已回写到本地
- [ ] 本地文件与飞书内容一致（可抽样验证）

---

## 六、违规处理

| 级别 | 情况 | 处理 |
|------|------|------|
| 🔴 严重 | 交付阶段飞书文档为空 | 立即补充，拒绝交付 |
| 🟡 一般 | 同步延迟 > 24h | 提醒同步，纳入下次审计 |
| 🟢 轻微 | 链接未回写 | 建议改进 |

---

## 七、模板

### 7.1 feishu-doc-urls.txt 模板

```txt
# 飞书文档链接索引
# 格式：| 类型 | 链接 | 本地路径 | 最后更新 |
| proposal | https://feishu.cn/docx/xxx | proposal.md | 2026-03-20 |
| design | https://feishu.cn/docx/yyy | design.md | 2026-03-20 |
| tasks | https://feishu.cn/docx/zzz | tasks.md | 2026-03-20 |
| test-report | (待交付后补充) | test-report.md | - |
```

### 7.2 同步检查清单

```markdown
## 同步前
- [ ] 本地文件已保存
- [ ] 飞书 doc_token 已获取

## 同步后
- [ ] feishu_doc read 验证 block_count > 0
- [ ] feishu-doc-urls.txt 已更新
- [ ] 用户确认链接

## 交付前
- [ ] 所有飞书文档 block_count > 0
- [ ] 链接全部回写本地
- [ ] 审计通过
```

---

## 八、参考

- 主规范：`CONSTITUTION.md`
- 需求理解智能体：`requirement-understanding/AGENTS.md`
- 需求交付智能体：`requirement-delivery/AGENTS.md`
- 审计智能体：`audit/AGENTS.md`

---

**版本**: 3.10.0
**状态**: 待生效（2026-03-21）  
**下次审查**: 2026-03-27
