# 前端

使用原生 HTML、CSS 和 JavaScript 实现。入口为 `index.html`，数据来自 `../demo/scenarios.json`。

## 本地运行

在仓库根目录执行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

访问 <http://localhost:8000/frontend/>。需通过 HTTP 加载，直接双击 HTML 会因浏览器文件访问限制而无法读取示例 JSON。

## 交互

- 切换 Energy Rental、USDD 和 JustLend 三个 Seed。
- 点击流程步骤查看研究入口、示例钱包、候选假设和缺失证据。
- 开始或暂停流程演示；切换 Seed 会重置演示。
- 下载 Pitch Deck，访问产品定位文档和 Skills。

当前没有钱包连接、交易执行、链上查询或模型调用。产品对象和研究流程来自项目文档，示例行为由本项目合成。

## 后续接入

前端和 Skills 尚未自动连接。真实接入应由后端运行 Agent 与只读数据工具，保存带来源的研究产物，再向前端提供运行状态与产物。密钥应保存在服务端环境中。

以仓库根目录作为静态站点目录即可发布本页面，同时保留 `demo/`、`docs/`、`skills/`、`pitch-deck/` 的相对路径。本仓库目前没有启用托管。
