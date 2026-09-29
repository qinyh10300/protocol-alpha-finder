# Skills

四个目录组成一个可复用的研究流程。`SKILL.md` 是给宿主 Agent 的指令，不能自行发起 API 调用。

| Skill | 用途 |
| --- | --- |
| [protocol-alpha-discovery](protocol-alpha-discovery/SKILL.md) | 编排完整研究流程 |
| [alpha-seed-wallets](alpha-seed-wallets/SKILL.md) | 识别 Seed 的真实执行者 |
| [wallet-alpha-investigation](wallet-alpha-investigation/SKILL.md) | 从钱包历史形成候选假设 |
| [protocol-alpha-validation](protocol-alpha-validation/SKILL.md) | 审查机制、当前状态与执行风险 |

## 使用

在支持 `SKILL.md` 的宿主中，将这四个技能目录一起放入其技能目录，保持同级关系。也可以让 Agent 直接读取对应文件。仓库没有自动修改你的本机技能配置。

运行时提供一个已知协议机制、可验证的交易样本和合约材料。具备链上工具时，可以在授权范围内继续只读取证；缺少工具时，根据已提供材料形成有边界的研究结果。

示例请求：

> 使用 protocol-alpha-discovery，研究所附 TRON 交易。请区分已观察事实与策略假设，报告历史覆盖范围，并对缺失证据保持 UNCERTAIN。

输出格式见主 Skill 的 [研究记录结构](protocol-alpha-discovery/references/research-record.md)。
