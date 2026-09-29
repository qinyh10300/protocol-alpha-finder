# Strategy Wallet 发现与验证方法

[English](ARCHITECTURE.md) · **简体中文** · [项目首页](../README.zh-CN.md)

**已知 Alpha → 策略钱包 → 新 Alpha。** 从已知协议机制出发，找到真正执行过它的钱包，再通过这些钱包更广泛的活动发现并验证新候选。

![Strategy Wallet 发现与验证流程](images/system-architecture-zh-CN.svg)

## 如何阅读流程图

大框内包含五个阶段：**Alpha Seeds → 策略钱包 → 历史交易 → Alpha 候选 → 验证**。每个 Seed 连接两个虚拟 TRON 地址。高亮钱包提供示例中研究的历史，三组交易分别支持三个候选机制，其中一个候选进入验证。

蓝色的 Skill 1–4 标记对应四个操作，**Protocol Alpha Finder 通过虚线统一编排**，实线表示研究证据的流转。历史采集覆盖指定时间范围；未完整获取的数据会明确记录。

| 候选示例 | 为什么值得研究？ |
| --- | --- |
| 租赁组合操作 | 合并调用可能降低执行成本 |
| 抵押品回收 | 赎回并兑换可能更快释放占用资金 |
| 拍卖时机 | 短暂折价值得结合执行成本检查 |

六个钱包用于展示方法，不代表实际留档数量。USDD 钱包与拍卖假设属于示意。本次留档中，USDD 没有已核验钱包；五份报告为三份持续观察、两份证据不足，尚无候选被提升为新 Seed。真实证据保存在 `validation-handoff.json` 与 `validation-results.json` 中。

## Skill 对应关系

图中编号表示四个操作。仓库现有四个 Skill 包，其中历史采集与候选分析均由 `wallet-alpha-investigation` 承担。

| 图中位置 | 完成的工作 | 仓库 Skill |
| --- | --- | --- |
| Skill 1 | 匹配 Seed 操作与成功回执，找到真实执行者 | `alpha-seed-wallets` |
| Skill 2 | 采集钱包历史，记录获取范围与完整性 | `wallet-alpha-investigation` |
| Skill 3 | 分析调用序列与资产流动，形成候选机制 | `wallet-alpha-investigation` |
| Skill 4 | 检查机制、成本、当前状态与执行条件 | `protocol-alpha-validation` |
| Protocol Alpha Finder | 确定研究范围，统一编排四个操作 | `protocol-alpha-discovery` |

每个候选保留来源钱包、支持交易、其他可能解释与缺失证据。验证报告分为可执行、持续观察、已排除或证据不足。历史上执行过操作，不等于当前仍可盈利。

## 何时进入下一轮

只有机制得到验证，才可在研究范围内作为新的 Seed Alpha，并保留当前限制。仅有合理假设不足以进入下一轮。本次留档尚未将候选提升为新入口。

## 源文件

[编排 Skill](../skills/protocol-alpha-discovery/SKILL.md) · [钱包发现 Skill](../skills/alpha-seed-wallets/SKILL.md) · [钱包研究 Skill](../skills/wallet-alpha-investigation/SKILL.md) · [候选验证 Skill](../skills/protocol-alpha-validation/SKILL.md)

中英文 SVG 和 [Mermaid 图](diagrams/system-architecture-zh-CN.mmd) 均由 [render_architecture.py](diagrams/render_architecture.py) 生成：

```bash
python3 docs/diagrams/render_architecture.py
```

## 研究数据

[数据研究与观察流程](DATA_ARCHITECTURE.zh-CN.md)说明我们分析哪些历史证据，以及如何从钱包的新活动中发现新候选。
