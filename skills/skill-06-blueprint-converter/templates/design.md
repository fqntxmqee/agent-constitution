# Design: {{project_name}} - 技术设计文档

> 技术设计 · OpenSpec 规范  
> 创建日期：{{created_date}}  
> 关联需求：`specs/requirements.md`

---

## 概述

{{design_overview}}

---

## 架构设计 (Architecture)

### 系统架构图

```
{{architecture_diagram}}
```

### 架构说明

{{architecture_description}}

---

## 技术栈 (Tech Stack)

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| {{layer_1_name}} | {{layer_1_tech}} | {{layer_1_note}} |
| {{layer_2_name}} | {{layer_2_tech}} | {{layer_2_note}} |
| {{layer_3_name}} | {{layer_3_tech}} | {{layer_3_note}} |

---

## 模块与组件

### 1. {{component_1_name}}

- 职责：{{component_1_responsibility}}
- 接口/入口：{{component_1_interface}}
- 依赖：{{component_1_dependencies}}

### 2. {{component_2_name}}

- 职责：{{component_2_responsibility}}
- 接口/入口：{{component_2_interface}}
- 依赖：{{component_2_dependencies}}

### 3. {{component_3_name}}

- 职责：{{component_3_responsibility}}
- 接口/入口：{{component_3_interface}}
- 依赖：{{component_3_dependencies}}

---

## 数据流与接口

### 数据流

{{data_flow_description}}

### 关键接口

| 接口 | 方向 | 说明 |
|------|------|------|
| {{interface_1_name}} | {{interface_1_direction}} | {{interface_1_description}} |
| {{interface_2_name}} | {{interface_2_direction}} | {{interface_2_description}} |

---

## 状态与边界情况

### 状态机（如适用）

{{state_machine_description}}

### 异常与边界处理

- {{exception_1}}: {{exception_1_handling}}
- {{exception_2}}: {{exception_2_handling}}

---

## 部署与运行环境

- 运行环境：{{runtime_environment}}
- 依赖服务：{{dependent_services}}
- 配置项：{{config_items}}

---

## 附录

- 需求规格：`specs/requirements.md`
- 任务清单：`tasks.md`
