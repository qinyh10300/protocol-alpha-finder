# Strategy Wallet 发现与验证方法

[English](ARCHITECTURE.md) · **简体中文** · [项目首页](../README.zh-CN.md)

**已知 Alpha → 策略钱包 → 新 Alpha。** 从已知协议机制出发，找到真正执行过它的钱包，再通过这些钱包更广泛的活动发现并验证新候选。

![Strategy Wallet 发现与验证流程](images/system-architecture-zh-CN.svg)

## 图中的研究样本

钱包卡片选取自已保存的研究结果。候选卡片按相近假设归类；连线表示阶段交接，不表示钱包与候选按行一一对应。

| 钱包 | 已观察到的活动 | 候选机制 |
| --- | --- | --- |
| A · `TNQ8…GDW2m` | Energy Rental 清算，同时包含资源租赁与归还 | 租赁 → 清算 → 归还（`WAI-ENERGY-01`） |
| B · `TUAA…uqrSS` | JustLend 清算及跨池兑换 | 清算 → 赎回 → 兑换（`WAI-LENDING-01`）；跨池循环兑换（`WAI-CYCLE-01`） |
| C · `TFaz…hVFB` | JustLend 清算及抵押品赎回 | 清算 → 赎回 → 兑换（`WAI-LENDING-02`） |

来源为已保存的 `validation-handoff.json` 与 `validation-results.json`。成本和资金效率方面的收益仍是假设。本次有限范围查询中，USDD 没有已核验钱包。五份留档报告为三份持续观察、两份证据不足，尚无候选被提升为新 Seed。

## 四个 Skill

### 1. 编排研究 — `protocol-alpha-discovery`

确定链、时间窗口与研究边界。协调钱包发现、研究和验证，保留证据与未解决的问题。覆盖既定范围或缺少必要证据时停止。

### 2. 发现并核验钱包 — `alpha-seed-wallets`

从 Energy Rental 清算、JustLend 清算或 USDD keeper／拍卖操作出发。匹配调用与成功回执，识别真实执行者，并区分中继者、辅助合约与奖励接收方。

**输出：** 去重后的策略钱包候选，附执行证据与入口来源。筛选依据是已发生的协议活动；执行过一次操作不代表已证明优势或盈利。

### 3. 发现候选 — `wallet-alpha-investigation`

逐个研究钱包更广泛的历史，包括原始入口之外的活动。从重复调用序列与资产流动中形成机制假设，保留支持交易与其他可能解释。

**输出：** Alpha 候选，附证据、覆盖限制与能够推翻假设的检查项。

### 4. 验证候选 — `protocol-alpha-validation`

还原机制与资产流，核算已知成本，检查协议当前状态并评估执行条件。区分历史观察与当前可用性，缺失的输入保留为未知。

**输出：** Alpha 报告，包含机制判断、当前状态、执行要求和后续检查。审阅结果分为可执行、持续观察、已排除和证据不足。

## 何时进入下一轮

只有机制得到验证，才可在研究范围内作为新的 Seed Alpha，并保留当前限制。仅有合理假设不足以进入下一轮。本次留档尚未将候选提升为新入口。

## 源文件

[编排 Skill](../skills/protocol-alpha-discovery/SKILL.md) · [钱包发现 Skill](../skills/alpha-seed-wallets/SKILL.md) · [钱包研究 Skill](../skills/wallet-alpha-investigation/SKILL.md) · [候选验证 Skill](../skills/protocol-alpha-validation/SKILL.md)

中英文 SVG 和 [Mermaid 图](diagrams/system-architecture-zh-CN.mmd) 均由 [render_architecture.py](diagrams/render_architecture.py) 生成：

```bash
python3 docs/diagrams/render_architecture.py
```
