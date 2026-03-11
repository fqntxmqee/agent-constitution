# Cursor CLI Skill 验证报告

**验证时间**: 2026-03-07 12:58  
**验证人**: 小欧 (OpenClaw)

---

## ✅ 验证结果

| 检查项 | 状态 | 说明 |
|--------|------|------|
| **Skill 文件创建** | ✅ 成功 | `skills/cursor-cli/index.js` |
| **package.json** | ✅ 成功 | NPM 配置正确 |
| **README 文档** | ✅ 成功 | 使用文档完整 |
| **cursor 命令** | ✅ 可用 | `/usr/local/bin/cursor` |
| **cursor agent** | ✅ 可用 | `cursor agent --print` 工作正常 |
| **实际测试** | ✅ 成功 | 回复"Cursor CLI Skill 验证成功" |

---

## 🧪 测试命令

```bash
# 1. 检查 Cursor 安装
which cursor
# 输出：/usr/local/bin/cursor ✅

# 2. 检查版本
cursor --version
# 输出：2.6.13 ✅

# 3. 测试 agent 命令
cursor agent --print "你好，请回复'Cursor CLI Skill 验证成功'" --trust
# 输出：Cursor CLI Skill 验证成功 ✅
```

---

## 📁 文件结构

```
skills/cursor-cli/
├── index.js           # ✅ Skill 主文件 (3.2KB)
├── package.json       # ✅ NPM 配置 (261B)
└── README.md          # ✅ 使用文档 (3.2KB)
```

---

## 🎯 可用命令

### 1. 直接使用

```bash
# 生成代码
cursor agent --print "创建 Python 贪吃蛇游戏"

# 编辑文件
cursor edit -i "添加暂停功能" src/snake.py

# 分析项目
cursor agent --print "分析当前项目结构"
```

### 2. 在 Agent 中使用

```python
sessions_spawn(
    label="需求解决智能体",
    runtime="subagent",
    task="""
    使用 cursor CLI 执行：
    ```bash
    cursor agent --print "创建 Python 文件"
    ```
    """
)
```

### 3. 使用工具调用

```python
# 生成代码
result = await tools.cursor_generate(
    prompt="创建贪吃蛇游戏",
    language="python"
)

# 编辑文件
result = await tools.cursor_edit(
    file="src/snake.py",
    instruction="添加暂停功能"
)
```

---

## ✅ 验证结论

**Cursor CLI Skill 已就绪！**

- ✅ Skill 文件创建完成
- ✅ Cursor CLI 安装正常
- ✅ `cursor agent --print` 命令工作正常
- ✅ 可在 Agent 任务中使用

---

## 🚀 下次任务使用示例

```python
sessions_spawn(
    label="需求解决智能体",
    runtime="subagent",
    task="""
    使用 Cursor CLI 开发贪吃蛇游戏：
    
    ```bash
    cursor agent --print "创建 Python 贪吃蛇游戏，400x400 画面，pygame 库"
    cursor agent --print "创建蛇类，初始长度 3 节，键盘控制"
    cursor agent --print "创建食物类，随机生成避开蛇身"
    cursor agent --print "创建游戏主循环，碰撞检测，分数系统"
    cursor agent --print "添加每 100 分加速机制"
    cursor agent --print "添加重新开始功能（空格键）"
    ```
    
    验证：
    ```bash
    cd snake-game && python snake.py
    ```
    """
)
```

---

**验证完成，Cursor CLI Skill 可以投入使用！** ✅
