# Skills

四个目录组成一个可复用的研究流程。`SKILL.md` 是给宿主 Agent 的指令，不能自行发起 API 调用。

| Skill | 用途 |
| --- | --- |
| [protocol-alpha-discovery](protocol-alpha-discovery/SKILL.md) | 编排完整研究流程 |
| [alpha-seed-wallets](alpha-seed-wallets/SKILL.md) | 从三个默认 Alpha 入口识别策略钱包候选，去重并保留各入口证据 |
| [wallet-alpha-investigation](wallet-alpha-investigation/SKILL.md) | 从钱包历史形成候选假设 |
| [protocol-alpha-validation](protocol-alpha-validation/SKILL.md) | 审查机制、当前状态与执行风险 |

## 使用

在支持 `SKILL.md` 的宿主中，将这四个技能目录一起放入其技能目录，保持同级关系。也可以让 Agent 直接读取对应文件。仓库没有自动修改你的本机技能配置。

默认流程：**三个 Alpha 入口 → 策略钱包候选 → 钱包历史研究 → 候选机制验证 → 有证据的新 Seed**。

三个入口是 Energy Rental 清算、JustLend 借贷清算、USDD keeper／拍卖操作。用户未另定范围时，先检查 TRON 主网近 90 天，每个入口最多选 5 个有交易证据的钱包；同一钱包跨入口去重，保留全部来源。USDD 的触发清算、重启拍卖和购买抵押品分别记录。详见[入口与取证规则](alpha-seed-wallets/references/tron-seeds.md)和[钱包交接结构](alpha-seed-wallets/references/wallet-handoff.md)。

运行时使用可访问的链上工具或用户提供的交易、回执与合约材料。某个入口缺少数据时，报告缺口，并继续研究其他入口已核验的钱包。钱包历史研究涵盖其他合约和新机制，不限于最初三类。

目前仓库的 Python 采集器仅实现 Energy Rental。其余两个入口已写入 Skill 的研究流程，实际抓取仍需要宿主链上工具或对应数据；不能将一个采集器成功视为三个入口全部完成。

示例请求：

> 使用 protocol-alpha-discovery，从 Energy Rental 清算、JustLend 借贷清算、USDD keeper／拍卖三个入口寻找策略钱包，然后研究这些钱包的历史并验证候选机制。报告每个入口的覆盖情况，保留来源证据，对未证实的机制和当前机会保持 UNCERTAIN。

输出格式见主 Skill 的 [研究记录结构](protocol-alpha-discovery/references/research-record.md)。
