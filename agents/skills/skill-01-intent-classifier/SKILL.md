# Skill-01: 全域意图分类引擎

**版本号**: 1.0  
**创建日期**: 2026-03-09  
**归属智能体**: 需求澄清智能体  
**状态**: ✅ 已实现

---

## 📋 技能描述

将用户请求分类为四大意图类别（开发类/内容类/技能类/运维类），识别主意图与从属意图，支持复合意图识别。

---

## 🎯 触发条件

- 需求澄清智能体接收到用户原始请求
- 需要对请求进行意图分类以决定路由

---

## 📥 输入

```json
{
  "user_input": "用户原始表述",
  "context": "可选：当前会话上下文、历史意图标签"
}
```

---

## 📤 输出

```json
{
  "primaryIntent": "development|content|skill|operation",
  "secondaryIntents": ["skill", "operation"],
  "confidence": 0.95,
  "reasoning": "用户请求涉及系统开发 + 第三方 API 集成",
  "suggestedRoute": "standard|fast",
  "complexity": "high|medium|low"
}
```

### 意图类别定义

| 意图 ID | 名称 | 说明 | 示例 |
|---------|------|------|------|
| `development` | 开发类 | 软件开发、系统构建、功能实现 | "创建一个小红书内容运营平台" |
| `content` | 内容类 | 内容创作、文案撰写、咨询分析 | "写一篇技术博客文章" |
| `skill` | 技能类 | 技能调用、数据处理、API 调用 | "查询东京的天气" |
| `operation` | 运维类 | 运维操作、部署、监控 | "部署应用到生产环境" |

---

## 🔧 执行逻辑

### 步骤 1: 加载 Prompt 模板

读取 `prompts/intent-classification.txt` 模板

### 步骤 2: 调用 LLM 进行分类

使用默认模型（或配置模型）执行意图分类

### 步骤 3: 解析输出

验证 JSON 格式，提取意图分类结果

### 步骤 4: 应用路由规则

根据意图类型和复杂度，建议路由（标准流/快速流）

### 步骤 5: 返回结果

输出结构化分类结果

---

## 📁 文件结构

```
agents/skills/skill-01-intent-classifier/
├── SKILL.md                      # 本文件
├── index.js                      # 技能实现（可选）
└── prompts/
    ├── intent-classification.txt # 意图分类 Prompt 模板
    └── system.txt                # 系统 Prompt（可选）
```

---

## 🧪 验收标准

- [ ] 准确率 >90%（测试集验证）
- [ ] 响应时间 <2 秒
- [ ] 支持复合意图识别
- [ ] 输出 JSON 格式正确
- [ ] 路由建议合理

---

## 🔗 依赖技能

无（独立技能）

---

## 📚 相关文档

- V3.7 主规范：`agents/docs/specs/constitution/CONSTITUTION.md`
- 需求澄清智能体：`agents/constitution/requirement-clarification/AGENTS.md`
- 规范索引（含技能文档）：`agents/docs/specs/README.md`

---

## 📝 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-03-09 | 初始版本 |
