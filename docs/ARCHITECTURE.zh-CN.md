# 系统架构

[English（默认）](ARCHITECTURE.md) · **简体中文** · [项目概览](../README.zh-CN.md) · [Pitch Deck](../pitch-deck/README.zh-CN.md)

Protocol Alpha Finder 将宿主 Agent 的研究流程接入以证据为核心的网页工作台。架构沿用 Pitch Deck 中的发现循环，分别呈现解释与假设、验证、结果留档和人工审阅。

![系统架构](images/system-architecture-zh-CN.svg)

[可编辑的 Mermaid 源文件](diagrams/system-architecture-zh-CN.mmd) · [英文架构图](images/system-architecture-en.svg)

## 1. 证据与发现范围

三个默认入口是 Energy Rental 清算、JustLend 借贷清算，以及 USDD keeper／拍卖操作。每个入口都提供一个待研究的机制，以及寻找有执行证据的钱包的路径。

仓库中的采集器通过只读数据服务 API 实现 Energy Rental 发现和钱包历史分页。其他入口需要宿主 Agent 提供额外工具或已有证据。研究依据包括交易回执、解码后的操作、资产流动、ABI、协议材料和状态读取结果。数据服务的查询完成只描述所请求的时间区间和索引；覆盖记录会保留尚未核验的部分。

## 2. 宿主 Agent 与四个 Skill

`protocol-alpha-discovery` 负责研究范围、阶段交接、覆盖情况和停止条件，并协调以下三个工作阶段：

1. **`alpha-seed-wallets`** 核验实际执行者，区分发起者、辅助合约和接收者等角色，合并钱包记录，并保留钱包所属的全部入口。
2. **`wallet-alpha-investigation`** 独立研究每个钱包。产品界面呈现 History → Analyze → Search Alpha 三个步骤。Agent 会调查钱包更广泛的活动，输出候选假设、来源交易、替代解释和证伪检查。
3. **`protocol-alpha-validation`** 评估候选的机制、历史证据、当前状态、执行条件以及尚待完成的检查。

Agent 推理负责解释观察结果和提出假设；确定性的交易重建、核算和状态检查为验证提供证据。仓库已实现采集器检查和交接校验，通用经济性核算引擎仍在计划中。Skills 在宿主 Agent 环境中运行，使用宿主的工具和权限。

## 3. 留档与阶段交接

本地 `data/` 目录不纳入 Git。以下文件将研究阶段连接到应用：

| 产物 | 内容与用途 |
| --- | --- |
| `strategy-wallet-discovery/strategy-wallets.json` | 各入口的覆盖情况、钱包身份和发现证据 |
| `wallet-alpha-investigation/history-summary.json` | 每个钱包的历史记录数量与覆盖情况 |
| `wallet-alpha-investigation/validation-handoff.json` | 候选 ID、钱包来源、支持交易和假设 |
| `protocol-alpha-validation/validation-results.json` | 候选评估、当前状态观察和执行条件 |
| `protocol-alpha-validation/historical-ledgers.json` | 已完成核对的历史样本 |
| `protocol-alpha-validation/state-index.json` 和 `supplement.json` | 留存的当前状态证据 |
| `protocol-alpha-discovery-test/research-record.json` | 最终编排记录与停止原因 |

各阶段的 Markdown 报告和原始证据可通过白名单产物链接查看。界面使用留档中的阶段时间戳；它们与单个钱包的交易执行时间分别记录。

## 4. 本地应用

### 适配器与 API

[`research_adapter.py`](../scripts/research_adapter.py) 将留档转换为前端的数据格式。它校验候选 ID、钱包身份、来源交易对应关系，以及验证阶段记录的调查输入 SHA-256。交接不一致时会返回错误，避免将旧验证结果附到已变化的研究内容上。

[`serve_research.py`](../scripts/serve_research.py) 提供快照、钱包、候选、报告、活动和白名单产物接口。开发时，API 使用 `5174` 端口，由 `5173` 端口的 Vite 代理。构建后，同一个 Python 服务在 `4173` 端口提供应用页面和 API。

`POST /api/research-runs` 打开已保存研究的视图。API 读取现有产物，目前没有集成 Agent 运行器或交易执行接口。

### 前端

`ApiResearchDataSource` 为 React + TypeScript 工作台提供数据。浏览器每五秒轮询一次快照，也提供手动刷新结果的操作。主要界面包括：

- 各自独立的钱包调查；
- 附带来源证据的 Alpha 候选；
- 报告预览、报告库和独立报告页；
- 作为辅助视图的活动抽屉，展示四个 Skill 的阶段记录。

默认语言为英文。中文翻译在展示层应用，标识符、地址、来源链接和原始产物保持原样。语言偏好、已保存的报告和观察列表存储在当前浏览器中。Markdown 导出使用当前选择的语言。

### 合成 Demo

`MockResearchDataSource` 读取实现包中的模拟数据，通过独立的定时回放为同一套界面提供数据。它在约 17 秒内模拟钱包进度和候选验证，支持暂停和重播。切换模式会清空当前研究视图并选择另一个数据源；通过 Run Discovery 可重新开始回放。

[在线 Demo](https://qinyh10300.github.io/protocol-alpha-finder/frontend/index.html) 是 GitHub Pages 静态构建，使用该模拟数据源，并通过查询参数保存报告页面路径。Python API 和研究留档保留在本地。`main` 更新时，Pages 工作流会构建并部署前端。

## 5. 报告结果与发现循环

每个候选都可以生成 Alpha Report。报告的审阅结论与原始机会状态分别保存在两个字段中：

| 报告结论 | 审阅含义 |
| --- | --- |
| `ACTIONABLE` | 证据支持在所列条件下执行 |
| `MONITOR` | 保留有证据支持的历史机制，继续检查当前条件 |
| `REJECTED` | 记录排除该候选的证据和原因 |
| `INSUFFICIENT_EVIDENCE` | 保留假设，以及评估它所需的检查 |

当前留档包含五份报告：三份 Monitor、两份 Insufficient Evidence。五个候选的原始机会状态均保留为 `UNCERTAIN`。本次留档中的候选尚未被提升为新的入口。

已建立的机制可以作为后续研究的新入口，同时保留其当前状态和适用限制。自动扩展入口和 Protocol Alpha Graph 属于未来能力。

## 当前实现与后续工作

| 当前可用 | 后续计划 |
| --- | --- |
| 宿主执行 Skills，并保存交接产物 | 集成后端 Agent 运行器 |
| 快照轮询，以及从产物重建的活动记录 | 实时任务事件 |
| 采集器验证和交接一致性检查 | 通用资金流、成本与盈利性验证 |
| 浏览器本地保存报告和观察列表 | 定时监控任务 |
| 每份评估都明确列出后续检查 | 经审阅的入口扩展与 Alpha Graph |

## 架构图源文件

概览图面向演示，每个框只保留简短信息。中英文 SVG 使用相同的固定布局，由 [render_architecture.py](diagrams/render_architecture.py) 通过 Python 标准库生成：

```bash
python3 docs/diagrams/render_architecture.py
```

脚本同时生成对应的 Mermaid 文件，方便编辑图结构。详细行为与后续计划保留在上文。产品截图采集于 2026 年 9 月 30 日。
