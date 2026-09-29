# Protocol Alpha Finder

[English](README.md) · **简体中文**

从执行过清算或 keeper 操作的钱包出发，在 TRON 上寻找协议机会。

**[Pitch Deck](pitch-deck/Protocol_Alpha_Finder_TRON_Pitch.pptx)** · **[在线 Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html)** — 点击 **Replay Demo** 播放流程。Energy Rental 和 USDD 使用明确标注的模拟示例，JustLend 回放已保存的链上研究记录。

## 工作流程

1. 从已知机制出发：Energy Rental、JustLend 清算或 USDD keeper 操作。
2. 找到真实执行者，逐个研究钱包的其他历史活动。
3. 验证候选，生成包含证据与后续检查的报告。

每个候选都有报告，结果分为：**可执行、持续观察、已排除、证据不足**。

![展示 Skill 留档结果的研究工作台](docs/images/workspace-zh-CN.png)

## 研究结果

2026 年 9 月 29 日完成验证的研究：**10 个钱包 · 52,582 笔去重主交易 · 5 份报告**。

结果为 **3 份持续观察、2 份证据不足**。五个机会均尚不确定，当前盈利能力未获证实。

## 系统架构

从三个 Seed 找到策略钱包，形成候选机制，再进行验证。流程下方的四个 Skill 说明各阶段的工作。

![Seed Alpha 发现流程](docs/images/system-architecture-zh-CN.svg)

[方法与 Skills](docs/ARCHITECTURE.zh-CN.md)

## 数据架构

SQLite 索引采集证据；JSON 记录关联钱包、候选与验证结果。

![数据库与研究数据](docs/images/data-architecture-zh-CN.svg)

[数据模型](docs/DATA_ARCHITECTURE.zh-CN.md)

## 本地运行

需要 Node.js 20.19+ 或 22.12+，以及 Python 3.10+。

```bash
git clone https://github.com/qinyh10300/protocol-alpha-finder.git
cd protocol-alpha-finder
npm ci
npm run dev
```

打开[本地 Demo](http://127.0.0.1:5173/research?mode=demo)。真实研究需要恢复 `data/` 留档文件，这些文件未纳入 Git。

[Skill 配置](skills/README.md) · [开发说明](frontend/README.md) · [演示说明](pitch-deck/README.zh-CN.md)
