# Protocol Alpha Finder 前端

React + TypeScript + Vite 研究工作台。默认接入本地四个 Skill 的真实产物，提供三栏研究工作区、独立报告页、报告库和可重播的 Demo。

## 启动

在仓库根目录运行：

```bash
npm install
npm run dev
```

打开 <http://127.0.0.1:5173/research>。该命令同时启动 Vite（5173）和 Python 标准库 API（5174），无需 API 密钥。需要 Node.js 20.19+ / 22.12+ 和 Python 3.10+。

构建后运行：

```bash
npm run build
npm start
```

打开 <http://127.0.0.1:4173/research>。生产服务支持报告深链接与刷新。原 `/frontend/` 路径也会进入新工作台。原先的 `python3 -m http.server` 不支持此版 API 和构建流程。

## 界面与交互

- 主工作台按实现包参考图采用紧凑顶部摘要、37/33/30 三栏、几何 A 标识与蓝白配色。
- 默认显示 6 个钱包，84px 桌面行分别显示地址、交易量、结果与独立三阶段状态；列底固定按钮展开全部钱包，支持直接复制地址。
- 候选可按发现顺序、时间或证据数量排序；证据数量来自现有数据，不能解释成收益或置信度。
- 报告列一次展开一份报告，其余保留紧凑入口；包含机制、历史、当前状态、执行条件四段真实摘要。当前状态的限制完整显示。
- 点击其它报告会切换预览并将键盘焦点移到新报告；Copy link 可复制深链接。
- 小屏幕按顺序自然展开，各钱包改为两行结构，不在候选列表内嵌第二层滚动。

## 两种数据模式

### Skill results（默认）

读取当前仓库 `data/` 下的真实 JSON，5 秒轮询更新。Refresh results 重新加载留档；不会重新抓链、调用模型或启动 Agent。运行状态、Activity 中的时间来自已保存的阶段产物，不能解释成前端正在运行四个 Skill。

| Skill | 产物 | 页面用途 |
| --- | --- | --- |
| `alpha-seed-wallets` | `data/strategy-wallet-discovery/strategy-wallets.json` | 三个 Seed 的覆盖、真实钱包、来源交易 |
| `wallet-alpha-investigation` | `data/wallet-alpha-investigation/history-summary.json`、`validation-handoff.json` | 各钱包 History / Analyze / Search Alpha 完成情况、候选假设 |
| `protocol-alpha-validation` | `data/protocol-alpha-validation/validation-results.json` | 验证结论、历史账本、当前读数、条件、缺口及报告 |
| `protocol-alpha-discovery` | `data/protocol-alpha-discovery-test/research-record.json` | 总体编排状态、停止原因、四阶段交接 |

本批留档：10 个钱包、52,582 笔不同主交易、5 条候选、5 份报告。TRC20 和内部交易索引不加进主交易总数。报告上的 reconciled samples 是该候选的已核对历史账本数量，不是所有历史执行次数。USDD 的零钱包和覆盖缺口保留。

`data/` 继续保持 Git 忽略。新克隆项目不会自动获得这些留档；缺失时页面明确报错，可切换 Demo。API 仅开放白名单产物，不开放整个仓库。

### Demo mode

右上角切换后，点击 **Run Discovery**。使用实现包 `06_MOCK_DATA.json`，约 17 秒自动播放各钱包的独立阶段、候选验证与报告出现；支持暂停、继续和重播。页面持续标识合成数据，Demo 的 ACTIONABLE 结论不属于真实研究。Demo 不依赖本地链上留档。

## 报告结果映射

Skill 的机会状态与前端的报告处置是两个字段：

- 原始 `current_state = UNCERTAIN` 原样保留。
- 历史操作机制 `established`：报告为 **MONITOR**，表示值得继续核查，不表示当前可执行或优势成立。
- 机制 `unproven`：报告为 **INSUFFICIENT_EVIDENCE**。
- 本批真实结果不会映射出 ACTIONABLE 或 REJECTED。UI 支持全部四种结果，后续 API 可以显式返回其它结果。

报告中显示映射依据、全部补证条件、原始 JSON 和浏览器交易链接。机制相同但钱包不同的候选保留各自 ID，不擅自合并。Save Report 和 local watchlist 存在当前浏览器；watchlist 不启动自动监控。Export report 下载 Markdown，Copy link 复制本地服务 URL。未证明优势的候选不自动提升为新 Seed。

## 接口与可替换数据源

`src/data.ts` 提供统一的 `ResearchDataSource`、`ApiResearchDataSource` 和 `MockResearchDataSource`。

```text
POST /api/research-runs                 {"seedId":"all", "mode":"archive"}
GET  /api/research-runs/local-all
GET  /api/research-runs/local-all/snapshot
GET  /api/research-runs/local-all/wallets
GET  /api/research-runs/local-all/candidates
GET  /api/research-runs/local-all/reports
GET  /api/research-runs/local-all/activity
GET  /api/reports/report-WAI-CYCLE-01
GET  /api/artifacts/validation
```

POST 在当前服务中打开已保存研究的视图；相同 Seed 返回稳定 ID。Seed 可为 `all`、`energy-rental-liquidation`、`justlend-lending-liquidation`、`usdd-keeper-auction`。`snapshot` 一次返回一致的界面快照，减少多请求间的版本混用。

Python adapter 校验候选、钱包、交易来源和 investigation → validation 的输入哈希。交接不一致时明确返回错误，避免把旧验证附到新候选上。将来接入真正 Agent Runner 时，可替换 API 实现并让 POST 排队执行；本次没有新增 Agent 调度器。

## 验证

```bash
npm run build
npm test
npm run test:e2e
```

浏览器测试使用已安装的 Google Chrome；若要用 Playwright Chromium，可在 `playwright.config.ts` 删除 `channel: 'chrome'` 并安装对应 Chromium。真实数据测试在缺少 `data/` 时跳过；Demo 和错误恢复测试独立运行。

界面参考实现包的文字规范，未采用设计图中的潜力评分、成功率或类别图标。
