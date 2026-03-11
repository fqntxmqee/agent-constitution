# Cursor CLI Skill

**版本**: 1.0.0  
**描述**: 为 OpenClaw 提供 Cursor CLI 的原生集成

---

## 🚀 安装

### 方式 1: 本地安装（推荐）

```bash
cd /Users/fukai/project/openclaw-workspace
openclaw skills install ./skills/cursor-cli
```

### 方式 2: 使用 clawhub

```bash
clawhub install cursor-cli
```

---

## 📋 可用命令

### 1. cursor

使用 Cursor CLI 执行代码任务

**用法**:
```bash
cursor <command> [options] <prompt>
```

**示例**:
```bash
# 生成代码
cursor agent --print "创建 Python 贪吃蛇游戏"

# 分析项目
cursor agent --print "分析当前项目结构"

# 创建组件
cursor agent --print "创建 React 组件"
```

---

## 🛠️ 可用工具

### cursor_generate

使用 Cursor AI 生成代码

**参数**:
- `prompt` (必需): 代码生成提示
- `language` (可选): 目标编程语言 (python/javascript/typescript/java/go/rust)
- `trust` (可选): 是否信任工作区 (默认 true)

**示例**:
```python
# 在 Python 代码中调用
result = await tools.cursor_generate(
    prompt="创建贪吃蛇游戏",
    language="python",
    trust=True
)
```

### cursor_edit

使用 Cursor AI 编辑文件

**参数**:
- `file` (必需): 要编辑的文件路径
- `instruction` (必需): 编辑指令

**示例**:
```python
result = await tools.cursor_edit(
    file="src/snake.py",
    instruction="添加暂停功能"
)
```

---

## 📝 使用示例

### 示例 1: 创建新项目

```bash
# 使用 cursor 命令
cursor agent --print "创建 Spring Boot 项目结构"
```

### 示例 2: 在 Agent 中使用

```python
sessions_spawn(
    label="需求解决智能体",
    runtime="subagent",
    task="""
    使用 cursor_generate 工具创建代码：
    
    ```python
    result = await tools.cursor_generate(
        prompt="创建 Python 贪吃蛇游戏，400x400 画面",
        language="python"
    )
    ```
    """
)
```

### 示例 3: 编辑现有文件

```bash
# 编辑文件
cursor edit -i "添加重新开始功能" src/snake.py
```

---

## ⚙️ 配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `CURSOR_PATH` | Cursor CLI 路径 | `/usr/local/bin/cursor` |
| `CURSOR_TIMEOUT` | 命令超时时间（秒） | 300 |
| `CURSOR_MAX_BUFFER` | 输出缓冲区大小（MB） | 10 |

### openclaw.json 配置

```json
{
  "skills": {
    "cursor-cli": {
      "enabled": true,
      "path": "/usr/local/bin/cursor",
      "timeout": 300,
      "trustByDefault": true
    }
  }
}
```

---

## 🔍 故障排查

### 问题 1: 找不到 cursor 命令

**解决**:
```bash
# 检查安装
which cursor

# 如果未安装，下载 https://cursor.sh
```

### 问题 2: 工作区信任问题

**解决**:
```bash
# 添加 --trust 参数
cursor agent --print "任务" --trust

# 或者手动信任工作区
cursor agent
# 然后按提示信任目录
```

### 问题 3: 超时

**解决**:
```bash
# 增加超时时间
export CURSOR_TIMEOUT=600
```

---

## 📚 相关资源

- [Cursor 官方文档](https://cursor.sh/docs)
- [OpenClaw Skills 开发指南](https://docs.openclaw.ai/skills)
- [Qoder CLI Skill](https://github.com/openclaw/qoder-skill)

---

**Cursor CLI Skill v1.0.0** ✅
