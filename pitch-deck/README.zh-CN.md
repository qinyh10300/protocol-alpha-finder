# Pitch Deck

[English](README.md) · **简体中文** · [项目主页](../README.zh-CN.md)

## 下载

**[下载原始 TRON Pitch Deck · 11 页](Protocol_Alpha_Finder_TRON_Pitch.pptx)**

[中英双语讲稿](../docs/Protocol_Alpha_Finder_Pitch_Guide_v2_Bilingual.md) · [原始产品定位](../docs/Protocol_Alpha_Finder_Product_Positioning_v2.md) · [当前系统架构](../docs/ARCHITECTURE.zh-CN.md)

原始 PPTX 完整保留，记录项目最初的产品主张。以下说明将其中的产品愿景与当前实现对应起来。

## 核心叙事

一个执行者已经通过链上行为展示过一次协议洞察。从这个钱包的历史中，还能发现什么？

Protocol Alpha Finder 从已知协议机制出发，找到真实执行者，再逐个研究钱包中的新候选。每个候选都可以生成报告，说明机制、证据、当前状态和执行条件。

**已知 Alpha 帮助我们找到钱包，钱包再帮助我们发现更多 Alpha。**

## 幻灯片目录

| 页码 | 主题 |
| --- | --- |
| 1 | Protocol Alpha Finder |
| 2 | 清算研究中的真实问题 |
| 3 | Protocol Alpha 与交易 Alpha |
| 4 | TRON 发现入口 |
| 5 | Alpha → Wallet → Alpha |
| 6 | Agent 的开放式发现 |
| 7 | 技术架构 |
| 8 | 以 TRON 作为首个生态 |
| 9 | 相关产品与项目定位 |
| 10 | Hackathon MVP 与 Alpha Graph 愿景 |
| 11 | 资料来源附录 |

## 当前演示与讲述口径

| 主题 | 当前实现 |
| --- | --- |
| 发现入口 | Skills 默认从 Energy Rental 清算、JustLend 借贷清算、USDD keeper／拍卖操作三个入口开始，分别保留证据和覆盖缺口。当前 Python 采集器覆盖 Energy Rental；其余入口需要宿主工具或提供的证据。 |
| 研究流程 | 四个 Skill 指导宿主 Agent 完成编排、钱包发现、钱包研究与验证。每个钱包拥有独立的 History → Analyze → Search Alpha 任务。 |
| 产品输出 | Wallet Investigations → Alpha Candidates → Alpha Reports。交易以证据量和来源形式出现。每个候选都可以生成报告。 |
| 报告结果 | `ACTIONABLE`、`MONITOR`、`REJECTED` 或 `INSUFFICIENT_EVIDENCE`。本地留档运行包含五份报告：三份 Monitor、两份 Insufficient Evidence，均保留原始 `UNCERTAIN` 当前状态。 |
| 运行方式 | 前端通过本地 API 读取已保存的 Skill 产物，并随文件更新刷新。宿主 Agent 执行 Skills；API 不会自行运行研究循环。 |

留档报告支持研究审阅，尚未证明当前盈利性或可执行机会。Monitor 表示候选具有继续核查的理由，可以在所需证据或条件出现后重新检查。

### 与原始材料的差异

- 第 4 页将 JustLend 借贷清算称为“Broad Seed”，原始 v2 定位将其列为条件式 Seed。当前 Skills 将其纳入三个默认入口，并要求用证据区分普通参与行为与技术执行模式。
- 第 7 页仅展示可执行结果。当前产品支持上述四种报告结果，也为证据不足或暂时不可执行的候选提供报告。
- PPT 描述的是确定性资金核算、实时状态检查和验证的目标架构。完整盈利核算与自动运行的后端 Agent 循环仍属于后续工作。
- 原 PPT 中的奖励比例、keeper 激励和协议接口，需要补齐当前合约、交易、区块与查询时间证据后，才能作为实时事实对外展示。Demo 数据用于说明交互流程，与留档研究结果分开。
