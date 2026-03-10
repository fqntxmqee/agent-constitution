# P0 核心技能实现计划

**版本**: 1.0  
**创建日期**: 2026-03-09  
**优先级**: 🔴 P0（核心流程必需）  
**预计工期**: 12 天

---

## 📋 P0 技能清单（实际交付 11 个）

| 序号 | Skill ID | 名称 | 归属智能体 | 工期 | 状态 |
|------|----------|------|------------|------|------|
| 1 | Skill-01 | 全域意图分类引擎 | 需求澄清 | 1 天 | ✅ 完成 |
| 2 | Skill-03 | 跨域模糊性探测器 | 需求澄清 | 1 天 | ✅ 完成 |
| 3 | Skill-04 | 动态路由决策器 | 需求澄清 | 0.5 天 | ✅ 完成 |
| 4 | Skill-05 | 需求理解智能体 | 需求理解 | 1 天 | ✅ 完成（新增） |
| 5 | Skill-06 | 多模态蓝图转换器 | 需求理解 | 2 天 | ✅ 完成 |
| 6 | Skill-07 | 需求解决智能体 | 需求解决 | 2 天 | ✅ 完成（原 Skill-06） |
| 7 | Skill-08 | 记忆管理智能体 | 需求解决 | 1 天 | ✅ 完成（新增） |
| 8 | Skill-09 | 工具调用智能体 | 需求解决 | 1 天 | ✅ 完成（扩展） |
| 9 | Skill-10 | 上下文管理智能体 | 需求解决 | 1 天 | ✅ 完成（新增） |
| 10 | Skill-16 | 验收测试智能体 | 需求验收 | 2 天 | ✅ 完成（原 Skill-07） |
| 11 | Skill-25 | 系统监控智能体 | 需求交付 | 1 天 | ✅ 完成 |

**注**: 实际交付超出原计划，新增 3 个技能（Skill-05/08/10），Skill-09 功能扩展。

---

## 📁 技能存放位置

```
agents/skills/
├── skill-01-intent-classifier/
│   ├── SKILL.md
│   ├── index.js (或 .py)
│   └── prompts/
├── skill-03-ambiguity-detector/
├── skill-04-routing-decider/
├── skill-06-blueprint-converter/
├── skill-09-ac-definer/
├── skill-10-task-atomizer/
├── skill-13-test-generator/
├── skill-16-test-runner/
├── skill-18-fact-verifier/
└── skill-25-security-scanner/
```

---

## 🔧 技能实现详情

### Skill-01: 全域意图分类引擎

**归属**: 需求澄清智能体

**功能**: 将用户请求分类为开发类/内容类/技能类/运维类，识别主意图与从属意图

**实现方案**: LLM Prompt + 规则分类

**输入**: 用户原始表述

**输出**:
```json
{
  "primaryIntent": "development",
  "secondaryIntents": ["integration"],
  "confidence": 0.95,
  "reasoning": "用户请求涉及系统开发 + 第三方 API 集成"
}
```

**Prompt 模板**:
```
你是一个意图分类专家。请将用户请求分类为以下类别之一：
- development: 软件开发、系统构建
- content: 内容创作、文案撰写、咨询分析
- skill: 技能调用、数据处理、API 调用
- operation: 运维操作、部署、监控

用户请求：{user_input}

输出 JSON 格式：
{
  "primaryIntent": "...",
  "secondaryIntents": [],
  "confidence": 0.0-1.0,
  "reasoning": "..."
}
```

**验收标准**:
- [ ] 准确率 >90%（测试集验证）
- [ ] 响应时间 <2 秒
- [ ] 支持复合意图识别

---

### Skill-03: 跨域模糊性探测器

**归属**: 需求澄清智能体

**功能**: 检测需求中的模糊点，生成追问清单

**实现方案**: LLM Prompt + 追问模板

**输入**: 用户请求 + 意图分类结果

**输出**:
```json
{
  "ambiguities": [
    {
      "field": "tech_stack",
      "question": "请确认技术栈偏好：React/Vue? NestJS/Spring?",
      "priority": "high"
    },
    {
      "field": "deployment",
      "question": "部署环境：Docker/云服务器/本地？",
      "priority": "medium"
    }
  ],
  "isClear": false
}
```

**Prompt 模板**:
```
你是一个需求分析专家。请检测以下请求中的模糊点：

用户请求：{user_input}
意图分类：{intent_classification}

检查以下维度是否有缺失或模糊：
- 技术栈（前端/后端/数据库）
- 部署环境
- 数据源/API
- 用户角色与权限
- 功能优先级
- 验收标准
- 时间/资源约束

输出 JSON 格式：
{
  "ambiguities": [
    {"field": "...", "question": "...", "priority": "high|medium|low"}
  ],
  "isClear": true/false
}
```

**验收标准**:
- [ ] 能识别 80% 以上的常见模糊点
- [ ] 追问问题清晰、具体
- [ ] 支持多轮追问

---

### Skill-04: 动态路由决策器

**归属**: 需求澄清智能体

**功能**: 决定走标准构建流还是快速执行流

**实现方案**: 规则引擎（复杂度判断）

**输入**: 意图分类 + 模糊性检测结果

**输出**:
```json
{
  "route": "standard",
  "complexity": "high",
  "reasoning": "涉及多模块系统开发，需要完整蓝图"
}
```

**决策规则**:
```javascript
function decideRoute(intent, ambiguities, userRequest) {
  // 复杂任务 → 标准构建流
  if (intent === 'development' && hasMultipleModules(userRequest)) {
    return { route: 'standard', complexity: 'high' };
  }
  
  // 简单任务 → 快速执行流
  if (ambiguities.length === 0 && isSimpleTask(userRequest)) {
    return { route: 'fast', complexity: 'low' };
  }
  
  // 默认标准流
  return { route: 'standard', complexity: 'medium' };
}
```

**验收标准**:
- [ ] 规则可配置
- [ ] 决策理由清晰
- [ ] 支持用户覆盖

---

### Skill-06: 多模态蓝图转换器

**归属**: 需求理解智能体

**功能**: 将已确认需求转化为标准化执行蓝图（OpenSpec/大纲/执行计划）

**实现方案**: LLM Prompt + 模板

**输入**: 《已确认提案》

**输出**:
- 开发类：`proposal.md`, `specs/requirements.md`, `design.md`, `tasks.md`
- 内容类：内容执行大纲
- 技能类：参数映射与执行计划

**模板结构**（OpenSpec）:
```markdown
# 项目提案 (proposal.md)

## 背景
...

## 目标
...

## 成功标准
...
```

```markdown
# 需求规范 (specs/requirements.md)

## 功能需求
- FR1: ...
- FR2: ...

## 非功能需求
- NFR1: ...
```

```markdown
# 技术方案 (design.md)

## 架构设计
...

## 技术栈
...
```

```markdown
# 任务清单 (tasks.md)

- [ ] Phase 1: ...
- [ ] Phase 2: ...
```

**验收标准**:
- [ ] 模板完整、结构清晰
- [ ] 支持多种蓝图形态
- [ ] 生成的任务可执行、可验证

---

### Skill-09: 跨域验收标准定义器

**归属**: 需求理解智能体

**功能**: 为任务定义可验证的 AC（验收标准）

**实现方案**: LLM Prompt + AC 模板

**输入**: 执行蓝图

**输出**:
```markdown
## 验收标准 (AC)

- AC1: [可验证的完成条件]
  - 验证方法：...
  - 通过标准：...
  
- AC2: ...
```

**Prompt 模板**:
```
你是一个 QA 专家。请为以下蓝图定义验收标准：

蓝图内容：{blueprint}

为每个功能/需求定义 AC，格式：
- AC 编号
- 可验证的完成条件
- 验证方法（测试/审查/演示）
- 通过标准（量化指标）

示例：
- AC1: 用户登录功能正常
  - 验证方法：自动化测试
  - 通过标准：测试通过率 100%
```

**验收标准**:
- [ ] AC 可验证、可量化
- [ ] 覆盖所有关键功能
- [ ] 验证方法明确

---

### Skill-10: 任务原子化拆解器

**归属**: 需求解决智能体

**功能**: 将蓝图/计划拆解为可独立验证的步骤（Step-by-Step）

**实现方案**: LLM Prompt + Tasks 模板

**输入**: 《执行蓝图》或《轻量执行计划》

**输出**:
```markdown
## 执行步骤

1. [ ] 步骤 1: ...
   - 输入：...
   - 输出：...
   - 验证：...

2. [ ] 步骤 2: ...
```

**验收标准**:
- [ ] 步骤独立、可验证
- [ ] 步骤间依赖清晰
- [ ] 每步有明确输入输出

---

### Skill-13: 自适应测试/审查生成器

**归属**: 需求解决智能体

**功能**: 根据代码/需求生成测试用例

**实现方案**: Cursor CLI + 测试框架

**输入**: 代码 + 需求规范

**输出**: 测试文件（Jest/Pytest 等）

**实现方式**:
```bash
# 使用 Cursor CLI 生成测试
cursor agent --print "为以下代码生成 Jest 测试用例：{code}"
```

**验收标准**:
- [ ] 测试覆盖关键功能
- [ ] 测试可运行
- [ ] 测试用例清晰

---

### Skill-16: 自动化测试/审查运行器

**归属**: 需求验收智能体

**功能**: 运行测试套件、代码审查、安全扫描

**实现方案**: Jest/Pytest + Browser Automation

**输入**: 代码 + 测试文件

**输出**: 测试报告

**实现方式**:
```bash
# 运行测试
npm test -- --coverage

# 浏览器自动化测试
# 使用 OpenClaw browser 工具
```

**验收标准**:
- [ ] 测试报告完整
- [ ] 支持覆盖率统计
- [ ] 支持截图取证

---

### Skill-18: 事实与逻辑验证器

**归属**: 需求验收智能体

**功能**: 联网检索、事实核查、交叉验证

**实现方案**: web_search + 交叉验证

**输入**: 待验证内容

**输出**:
```json
{
  "verified": true,
  "sources": [
    {"url": "...", "confidence": 0.9}
  ],
  "contradictions": []
}
```

**验收标准**:
- [ ] 支持多源交叉验证
- [ ] 置信度评估准确
- [ ] 发现矛盾点

---

### Skill-25: 敏感信息终检器

**归属**: 需求交付智能体

**功能**: 交付前敏感信息扫描（API Key、密码、PII）

**实现方案**: Gitleaks/truffleHog

**输入**: 代码目录

**输出**:
```json
{
  "passed": true,
  "findings": []
}
```

**实现方式**:
```bash
# 使用 Gitleaks 扫描
gitleaks detect --source . --report-path report.json
```

**验收标准**:
- [ ] 检测准确率高
- [ ] 误报率低
- [ ] 报告清晰

---

## 📅 开发计划

### 第 1-2 天：需求澄清技能
- [ ] Skill-01: 全域意图分类引擎
- [ ] Skill-03: 跨域模糊性探测器
- [ ] Skill-04: 动态路由决策器

### 第 3-4 天：需求理解技能
- [ ] Skill-06: 多模态蓝图转换器
- [ ] Skill-09: 跨域验收标准定义器

### 第 5 天：需求解决技能
- [ ] Skill-10: 任务原子化拆解器

### 第 6-7 天：测试技能
- [ ] Skill-13: 自适应测试/审查生成器

### 第 8-9 天：需求验收技能
- [ ] Skill-16: 自动化测试/审查运行器
- [ ] Skill-18: 事实与逻辑验证器

### 第 10 天：交付安全技能
- [ ] Skill-25: 敏感信息终检器

### 第 11-12 天：集成测试与优化
- [ ] 端到端测试
- [ ] 性能优化
- [ ] 文档完善

---

## ✅ 验收标准（整体）

- [ ] 10 个 P0 技能全部实现
- [ ] 支持完整标准构建流（澄清→理解→解决→验收→交付）
- [ ] 端到端测试通过
- [ ] 文档完整

---

## 🔗 相关文件

- V3.7 主规范：`agents/docs/specs/CONSTITUTION_V3.7.md`
- 技能差距分析：`agents/docs/specs/V37_SKILLS_GAP_ANALYSIS.md`
- 智能体配置：`agents/constitution/README.md`

---

**创建时间**: 2026-03-09 22:45  
**下次审查**: 完成 Skill-04 后
