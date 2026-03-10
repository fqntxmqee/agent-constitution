# 宪法规范变更日志

## V3.7.0 (2026-03-09)

### 初始版本

#### 新增
- 8 个核心智能体定义（AGENTS.md）
  - requirement-clarification（需求澄清智能体）
  - requirement-understanding（需求理解智能体）
  - requirement-resolution（需求解决智能体）
  - requirement-acceptance（需求验收智能体）
  - requirement-delivery（需求交付智能体）
  - progress-tracking（进展跟进智能体）
  - audit（审计智能体）
  - summary-reflection（总结反思智能体）
- 5 大核心原则
  - 规约驱动
  - 全域意图导向
  - 规范与法律优先级
  - 数据安全与隐私保护
  - 可追溯与可审计
- 完整工作流程
  - 标准构建流
  - 快速执行流
  - 异常熔断流程

#### 智能体备份
- 8 个智能体 AGENTS.md 文件已备份到 `versions/agents/V3.7.0/`
- 智能体清单：`versions/agents/V3.7.0/agents_manifest.json`

#### 技能
- skill-01: 全域意图分类引擎
- skill-03: 跨域模糊性探测器
- skill-04: 动态路由决策器
- skill-06: 多模态蓝图转换器
- skill-06: 需求解决智能体
- skill-07: 验收测试智能体
- skill-08: 记忆管理智能体
- skill-09: 工具调用智能体
- skill-10: 上下文管理智能体
- skill-16: 验收测试智能体
- skill-25: 系统监控智能体

### 已知问题
- 无

---

## V3.7.1 (2026-03-10)

### 新增
- 审计智能体周期性审计职责（每 2 小时）
- 审计智能体规范缺陷报告职责
- 总结反思智能体宪法规范迭代提案职责
- 宪法规范迭代流程（第四章 4.5）

### 修订
- 更新可配置参数（第五章）
  - 新增 N_reflection_hours 参数
  - 新增用户确认超时时间参数

### 修复
- 无

### 已知问题
- 无

---

## V3.7.2 (待定)

### 提案中
- 版本控制和备份流程
- 技能版本管理
- 飞书知识库同步

### 待确认
- [ ] 新增审计智能体周期性审计职责（每 2 小时）
- [ ] 新增审计智能体规范缺陷报告职责
- [ ] 新增总结反思智能体宪法规范迭代提案职责
- [ ] 新增宪法规范迭代流程

---

# 技能变更日志

## skill-01-intent-classifier

### V1.0.0 (2026-03-09)
- 初始版本
- 支持 4 种意图分类（development, content, skill, operation）
- 支持复合意图识别
- 测试覆盖率 100%（10/10 测试用例）

## skill-03-ambiguity-detector

### V1.0.0 (2026-03-09)
- 初始版本
- 支持 6 维度模糊性检测
  - tech_stack（技术栈）
  - deployment（部署环境）
  - data_source（数据源/API）
  - user_role（用户角色）
  - priority（功能优先级）
  - acceptance（验收标准）
- 支持优先级判定（high/medium/low）
- 测试覆盖率 100%（10/10 测试用例）

## skill-04-routing-decider

### V1.0.0 (2026-03-09)
- 初始版本
- 支持规则引擎路由决策
- 支持 6 种运算符（equals, notEquals, contains, greaterThan, lessThan, in）
- 支持用户覆盖机制
- 测试覆盖率 100%（10/10 测试用例）

## skill-05-requirement-understanding

### V1.0.0 (2026-03-09)
- 初始版本
- 支持需求理解智能体功能
- 测试覆盖率 100%（8/8 测试用例）

## skill-06-blueprint-converter

### V1.0.0 (2026-03-09)
- 初始版本
- 支持 3 种蓝图形态
  - OpenSpec（开发类）
  - ContentOutline（内容类）
  - ExecutionPlan（技能/数据类）
- 测试覆盖率 100%（10/10 测试用例）

## skill-06-requirement-resolution

### V1.0.0 (2026-03-09)
- 初始版本
- 支持需求解决智能体功能
- 测试覆盖率 100%（10/10 测试用例）

## skill-07-acceptance-tester

### V1.0.0 (2026-03-09)
- 初始版本
- 支持验收测试智能体功能
- 测试覆盖率 100%（8/8 测试用例）

## skill-08-memory-manager

### V1.0.0 (2026-03-09)
- 初始版本
- 支持记忆管理智能体功能
- 测试覆盖率 100%（10/10 测试用例）

## skill-09-tool-caller

### V1.0.0 (2026-03-09)
- 初始版本
- 支持工具调用智能体功能
- 测试覆盖率 100%（10/10 测试用例）

## skill-10-context-manager

### V1.0.0 (2026-03-09)
- 初始版本
- 支持上下文管理智能体功能
- 测试覆盖率 100%（10/10 测试用例）

## skill-16-acceptance-tester

### V1.0.0 (2026-03-09)
- 初始版本
- 支持验收测试智能体功能
- 测试覆盖率 100%（8/8 测试用例）

## skill-25-system-monitor

### V1.0.0 (2026-03-09)
- 初始版本
- 支持系统监控智能体功能
- 测试覆盖率 100%（10/10 测试用例）

---

**最后更新**: 2026-03-10 13:28 GMT+8  
**当前版本**: V3.7.0  
**下次更新**: 用户确认迭代提案 001 后
