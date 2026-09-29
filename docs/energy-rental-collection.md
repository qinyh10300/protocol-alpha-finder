# Energy Rental 数据采集与每日检查

## 运行

仅需要 Python 3 标准库，所有接口均为只读。默认数据目录为 `data/energy-rental/`，已加入 `.gitignore`。

```bash
# 首次发现：最近 90 天，最多 5 个实际发起钱包
python3 scripts/collect_energy_rental.py discover --days 90 --wallets 5 --max-pages 300

# 首次钱包历史抓取
python3 scripts/collect_energy_rental.py history --max-pages 300
python3 scripts/summarize_energy_rental.py

# 后续增量检查
python3 scripts/collect_energy_rental.py update --max-pages 300
python3 scripts/summarize_energy_rental.py
```

可通过 `--data-dir` 指定另一份独立数据目录。`history` 可重复使用 `--address <address>` 限定 watchlist 中的部分钱包。不要同时运行覆盖同一钱包的采集任务。

有 TronGrid Key 时，通过本机环境变量 `TRONGRID_API_KEY` 提供。脚本不会保存认证请求头。公共接口也可能允许访问，是否限流以实际响应为准。

## 筛选标准

主网协议入口为 `TU2MJ5Veik1LRAgjeSzEdvmDYx7mefJZvd`。读取 `Liquidate` 事件，只使用 `resourceType=1` 的 Energy 清算作为 Seed。

1. 按事件中的 liquidator 分组，按事件数量安排取证顺序。
2. 对各组抽取最新、中间与最早事件，读取交易正文和成功回执。
3. 核对原始日志的合约地址、事件 topic、三个 indexed 地址，以及五个数据字段。
4. 用 top-level `owner_address` 定位实际发起钱包。事件 liquidator 可能是执行合约，不自动认定其为钱包或把它与发起者认定为同一实体。
5. 钱包按以上取证顺序去重入选，最多 5 个。这是研究目标筛选，不是收益排名或所有权证明。

首轮有 17 笔独立核验的交易样本。进一步用钱包交易 ID 与清算事件关联，统计可归属到这些发起交易的 Seed 行为。

## 存储与完整性

- `runs/<run>/NNNNN.json.gz`：请求 URL、POST 参数、抓取时间、HTTP 状态、响应内容和原始 HTTP 响应 SHA-256。JSON 内容已解析保存，原始响应的排版不作保留。
- `research.sqlite3`：`items` 存去重数据，`coverage` 存每次分页检查范围与状态，`checkpoints` 存每条流的完整检查末端。
- `wallets/<address>/transactions.jsonl`：主交易，含数据源提供的内部调用明细。
- `wallets/<address>/trc20.jsonl`：TRC20 / TRC721 转移及授权类记录，类型以原字段为准。
- `wallets/<address>/internal.jsonl`：按地址索引的内部记录；空结果不代表交易回执中没有内部调用。
- `evidence/`：成功交易样本、receipt、事件及角色关系。
- `contracts/`：已获取的合约代码、名称及公开 ABI。
- `sources/`：官方文档和文档所附 ABI 快照。
- `watchlist.json`、`coverage.json`、`research_summary.json`、`wallet_summary.csv`、`REPORT.md`：名单与结果。

每次更新截止时间为当前 UTC 时间减两分钟，并只取确认数据。增量从上次完整检查点向前重叠一天，使用稳定 ID 去重。分页失败或达到页数上限不会推进检查点；有 continuation URL 时，下次先续取未完成部分。长时间延迟的索引补录可能仍需更大的重叠或定期全窗口复核。

完整状态只表示该数据源在请求区间内返回了全部可分页记录，不等于独立节点对账。首次范围为 90 天，不是钱包终身历史。

## 交易数据质量

汇总脚本会先运行 `verify_energy_rental.py`，核对全部主交易观测的 raw_data_hex SHA-256 与 txID。首轮发现 364 条资源委托/撤回记录的 TronGrid 索引响应遗漏 `Permission_id`；两个节点原始回包证实该差异。

脚本按官方 protobuf 的 Contract.Permission_id 字段补充候选值，仅接受重建原始字节后 SHA-256 精确匹配既有 txID 的结果。派生修正单独写入 `quality/permission_id_corrections.jsonl`，不会覆盖原始索引响应。`quality/verification.json` 列出直接匹配、可恢复和仍待核验的数量；未解决问题不能当作已验证。

## 监控判断

汇总脚本保存目标合约的本地基线。新目标合约进入 `alerts.json`，仅表示在已采集历史中首次出现，尚未证明是新的 Alpha。

部分执行合约没有公开 ABI，可能直接解析 packed calldata。前四字节会作为 selector 候选保存，但不把每次变化都当成“新方法”或触发通知，避免产生大量误报。

每日检查同时查看新增交易与失败情况；只有有证据的新行为、显著失败变化或抓取问题才需要通知。收益机制、当前状态与完整经济性仍需单独验证，合约收到的奖励不能直接当作钱包净收益。

## 本地校验

```bash
python3 -m unittest discover -s tests -v
```

覆盖地址转换、原始事件日志核验、相同转移记录的保留与重复抓取去重，以及失败分页不推进检查点。
