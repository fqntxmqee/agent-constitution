# 版本备份目录（先版本、后类型）

本目录采用**先版本目录、后类型子目录**结构：每个版本一个目录，其下为该版本的 agents、constitution、skills 备份。

## 结构

```
agents/docs/versions/
├── V3.7.0/
│   ├── agents/          # 该版本智能体配置（AGENTS.md 等）
│   ├── constitution/    # 该版本宪法快照与升级过程文档
│   └── skills/         # 该版本技能
├── V3.7.2/
│   └── constitution/   # 仅 constitution 的升级过程（如 upgrade-to-V3.7.3）
├── V3.7.3/
│   ├── agents/
│   ├── constitution/
│   └── skills/
└── latest -> V3.7.3    # 符号链接指向当前最新版本
```

## 宪法升级过程文档

某次升级（如 V3.7.3→V3.7.4）的提案、设计、交付报告等位于：

`V{源版本}/constitution/upgrade-to-V{目标版本}/`

例如：`V3.7.3/constitution/upgrade-to-V3.7.4/`
