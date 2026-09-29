# Protocol Alpha Finder — 产品定位与项目定义（团队版）

> **Purpose:** 这份文档用于团队内部统一理解：我们到底在做什么、为什么做、什么是核心、什么不是核心、Agent 为什么必要、MVP 应该做到哪里。

---

# 1. 项目一句话

**Protocol Alpha Finder 是一个 Seed-driven 的 AI Protocol Alpha Discovery System。**

它从少量已知的 **Protocol Alpha** 出发，找到真正执行过这些机会的 **Strategy Wallets**，再通过 Agent 分析这些 Wallet 的完整链上历史，发现更多非标准化的 Protocol Alpha，并继续验证其收益机制、当前有效性与执行风险。

最简公式：

> **Protocol Alpha → Strategy Wallet → New Protocol Alpha**

最重要的一句话：

> **Alpha finds Wallets. Wallets find more Alpha.**

---

# 2. 我们真正的问题域：Protocol Alpha

我们的第一层定位必须非常明确：

> **We focus on Protocol Alpha, not Trading Alpha.**

## 2.1 什么是 Protocol Alpha

**Protocol Alpha = 来自协议规则、智能合约状态或执行路径的经济机会，而不是来自预测市场价格的收益。**

英文定义：

> **Protocol Alpha is an economic edge created by protocol rules, smart-contract states, or execution paths — not by predicting market prices.**

典型形式包括：

- permissionless liquidation reward
- keeper reward
- protocol maintenance reward
- settlement reward
- non-obvious mint / redeem path
- off-UI contract execution path
- protocol-specific incentive
- contract-native execution opportunity
- 需要理解协议规则才能执行的收益动作

## 2.2 我们不做什么

我们不是：

- Smart Money 产品
- copy trading 产品
- token recommendation 产品
- trading signal 产品
- whale tracker
- portfolio dashboard
- 普通 DeFi yield aggregator
- 单纯 MEV classifier
- liquidation bot 产品
- transaction debugger

我们不关注：

- 哪个 Token 会涨
- 谁买得早
- 谁 PnL 高
- 哪个 Whale 最近买了什么
- momentum / sniper / follower 等 trading behavior

一句话：

> **Trading edge ≠ Protocol edge**

---

# 3. 产品的核心不是“一个 Alpha”，而是两个实体之间的转换

整个产品可以抽象成两个核心实体：

## 3.1 Protocol Alpha

一个已经确认或正在验证的协议级收益机制。

## 3.2 Strategy Wallet

一个已经在链上实际执行过至少一种非平凡 Protocol Alpha 的 Wallet。

注意：

我们不要求这个 Wallet：

- 高频
- 大资金
- 一定是 bot
- 一定是机构
- 一定长期盈利

只要它已经证明：

> **它曾经发现并执行过一个非显然的 protocol opportunity**

它就是一个高信息价值的研究对象。

---

# 4. 最重要的产品 Insight：用 Alpha 找人

传统 Smart Money 的筛选逻辑通常是：

```text
High PnL / Good Trader
        ↓
Study the Wallet
```

我们的筛选逻辑是：

```text
Known Protocol Alpha
        ↓
Who executed it?
        ↓
Strategy Wallet
```

也就是说：

> **我们不是因为这个 Wallet 有钱或者赚钱多而研究它，而是因为它已经证明过一次 protocol insight。**

这是一个非常重要的 search prior。

核心假设：

> **If someone discovered one Protocol Alpha, they may have discovered others.**

中文：

> **如果一个 Wallet 曾经发现过一个 Protocol Alpha，它的历史里更可能存在其他值得研究的 Protocol Alpha。**

---

# 5. Alpha Seed：已知 Alpha 是起点，不是产品结果

我们需要一小批高质量的 **Alpha Seeds** 来启动系统。

一个好的 Seed 应尽量满足：

- permissionless
- contract-native
- 有明确经济收益
- 不是普通前端直接包装好的标准按钮
- 普通技术用户可执行
- 不主要依赖巨额资本
- 能在链上识别出真实执行者

重要：

> **Known Alpha is our seed, not our final result.**

我们并不是在做某个 liquidation / keeper action 的专用工具。

这些 Alpha 的作用是：

> **帮我们找到谁值得继续研究。**

---

# 6. 当前 TRON Seed 设计

## 6.1 Primary Seed — Energy Rental Liquidation

这是目前最符合我们定义的 Seed。

为什么好：

- permissionless
- contract-native
- third-party execution
- 有 protocol-defined reward
- 标准用户 Energy Rental 流程并不是“去清算别人”
- 可以找到实际执行过该动作的 Wallet
- 不以巨额资本作为核心门槛

它非常适合作为：

> **Proof of Protocol Discovery**

也就是：

> “这个 Wallet 曾经主动发现并执行过一个不显然的协议机会。”

---

## 6.2 Strong Candidate — USDD Keeper / `redo()`

USDD auction / keeper 体系提供一个很好的第二类 Seed 方向：

> **permissionless protocol maintenance + keeper incentive**

它和 Energy Rental liquidation 很不同，因此很适合证明：

> Protocol Alpha 不只是一种固定 taxonomy。

这里应重点验证：

- 主网实际 keeper execution
- reward 参数
- 历史事件
- 当前是否仍有效
- 是否为普通前端暴露的标准用户行为

---

## 6.3 Secondary / Conditional Seed — JustLend Lending Liquidation

JustLend 普通借贷 liquidation 本身是 TRON 生态的重要协议机制，但要注意：

> **标准 liquidation 存在官方 Liquidation Tool / UI，因此一次普通 UI liquidation 并不能强力证明“这个 Wallet 有额外 protocol insight”。**

所以它不应该和 Energy Rental liquidation 完全等价地当成最强 Seed。

它更适合作为：

- TRON lending ecosystem case
- bot / direct-contract / non-standard executor 的研究入口
- 如果发现 off-UI execution pattern，再提升为高质量 Seed

团队对外不要简单说：

> “所有 JustLend liquidator 都是 Strategy Wallet。”

我们更严谨的说法是：

> **We look for liquidation executors whose behavior shows protocol-level technical intent.**

---

# 7. 核心 Discovery Flywheel

完整工作流：

```text
Known Protocol Alpha
        ↓
Find Executors
        ↓
Strategy Wallets
        ↓
Agent investigates full history
        ↓
Alpha Candidates
        ↓
Mechanism Validation
        ↓
Current Validation
        ↓
Execution Risk
        ↓
Validated Protocol Alpha
        ↓
Becomes a new Seed
        ↓
Find more Strategy Wallets
        ↓
...
```

最终形成：

# **Protocol Alpha Graph**

两个核心节点：

```text
Protocol Alpha
Strategy Wallet
```

关系：

```text
Strategy Wallet --executed--> Protocol Alpha
```

新的 Alpha 会带来新的 Wallet；
新的 Wallet 又会带来新的 Alpha。

---

# 8. 为什么必须用 Agent

这是第三个核心卖点。

## 8.1 Protocol Alpha 是 Open-ended 的

如果我们只找：

- liquidation
- arbitrage
- sandwich
- JIT

那么传统规则系统就够了。

但我们真正想找的可能是：

```text
Contract A.foo()
→ Contract B.settle()
→ claim()
→ redeem()
→ reward
```

在看到它之前，我们甚至不知道它应该叫什么。

所以：

> **This is not only classification. This is discovery.**

## 8.2 Agent 的核心价值

Agent 的任务不是聊天。

Agent 要做：

1. 理解 Wallet 的完整历史
2. 识别协议与合约
3. 理解函数语义
4. 识别重复行为和 sequence
5. 聚类相似 transaction patterns
6. 重建 token / asset flow
7. 阅读 ABI / docs / contract context
8. 推断为什么这个行为可能有经济意义
9. 生成 Alpha Candidate
10. 给出需要进一步验证的假设

一句非常重要的话：

> **We know where to look, but we do not know what we will find.**

这正是 Agent 合理存在的原因。

---

# 9. Agent 与 Deterministic Code 的边界

我们不应该把所有事情都交给 LLM。

## Agent 擅长

- contract / function semantic understanding
- cross-transaction pattern reasoning
- protocol context understanding
- hypothesis generation
- unknown strategy interpretation

## Deterministic Code 擅长

- token flow reconstruction
- balance delta
- historical PnL
- gas / Energy cost
- price conversion
- event decoding
- current parameter reading
- on-chain state validation
- execution simulation

最佳架构：

> **Agent for understanding + hypothesis**
>
> **Code for measurement + proof**

---

# 10. Alpha Candidate ≠ Validated Alpha

Agent 找到的东西先叫：

# **Alpha Candidate**

不能一发现模式就说：

> “这是 Alpha。”

需要三层验证。

---

# 11. Mechanism Validation

需要回答：

> **Why does this make money?**

至少还原：

```text
Capital In
    ↓
Contract Actions
    ↓
Protocol Mechanism / Reward
    ↓
Capital Out
```

验证：

- 收益来自哪里
- 是 protocol reward 还是 market movement
- token flow
- accounting mechanism
- historical execution cost
- net economic outcome

---

# 12. Current Validation

历史上赚钱，不代表今天还能赚钱。

需要重新检查：

- 当前 contract state
- reward parameter
- liquidity
- oracle
- price
- Energy / gas cost
- protocol parameter
- competition
- upgrade / pause status

输出可以是：

- ACTIVE
- DEGRADED
- EXPIRED
- UNCERTAIN

---

# 13. Execution Risk

真正的问题不是：

> “这个策略理论上赚钱吗？”

而是：

> **“我今天真的能执行并赚到吗？”**

需要分析：

- competition
- latency / timing
- Energy / gas
- slippage
- liquidity
- oracle dependency
- admin / upgrade risk
- capital requirement
- strategy capacity
- execution failure
- state race

最好的输出不是一个抽象 Risk Score，而是：

> **What must remain true for this strategy to work?**

---

# 14. 最终产品输出

最终产品不是：

- Wallet Report
- Transaction List
- AI Summary
- Chatbot Answer

最终输出应该是：

# **Validated Protocol Alpha**

一个结果应该包含：

```text
Alpha Name / Hypothesis

Discovered from:
Strategy Wallet

Observed behavior:
Transaction / contract sequence

Historical evidence:
count / dates / flows

Profit mechanism:
why this makes money

Historical economics:
profit / cost

Current status:
ACTIVE / DEGRADED / EXPIRED / UNCERTAIN

Current economics:
reward / cost / capacity

Execution requirements:
capital / RPC / permissions / timing

Execution risks:
competition / liquidity / protocol risk
```

---

# 15. 产品形态

当前工作名：

# **Protocol Alpha Finder**

类别：

> **Seed-driven Protocol Alpha Discovery Agent**

产品界面应围绕以下对象组织：

1. Alpha Seeds
2. Strategy Wallets
3. Agent Investigation
4. Alpha Candidates
5. Validation
6. Execution Risk
7. Protocol Alpha Graph

产品重点不是 chat-first。

Chat 可以存在，但只是交互层。

---

# 16. 个人 Motivation：为什么这不是 Hackathon 伪需求

项目来自一个真实研究体验：

> 在做 liquidation / protocol research 时，经常看到一个机会已经被别人先执行。

这时真正有价值的问题不是：

> “这个 liquidation 是什么？”

而是：

> **“为什么这个 Wallet 比我先发现？它还发现过什么？”**

因此：

> **The liquidation is not the product. It is the clue.**

进一步：

> **The wallet is not the final answer. It is the path to more Protocol Alpha.**

Agent 只是把原本人工完成的：

```text
发现 opportunity
→ 找 executor
→ 看历史
→ 理解 contract
→ 形成 hypothesis
→ 验证
```

自动化和规模化。

---

# 17. 竞品定位

## Nansen / Smart Money

它们通常从：

> profitable traders / PnL / holdings / flows

开始。

我们从：

> **known contract-native Alpha**

开始。

区别：

> **Trading edge vs Protocol edge**

---

## Phoenix Research

Phoenix 提供了一个非常重要的市场验证：

> **A wallet can represent a strategy.**

它证明：

> Wallet history 可以承载 strategy intelligence。

但 Phoenix 主要研究：

> trading strategy / market behavior

我们研究：

> smart-contract strategy / protocol behavior

一句话：

> **Phoenix finds trading strategies in wallets. We find protocol strategies in wallets.**

它对我们更像：

> **Vision validation**

而不是完全正面竞品。

---

## EigenPhi

这是最接近的竞品之一。

它证明：

> 复杂链上行为可以被还原成 technical strategy。

但其核心分析长期更偏：

- arbitrage
- liquidation
- sandwich
- MEV
- known transaction taxonomy

这类模式非常适合：

> **taxonomy-driven detection**

我们更强调：

> **open-ended strategy discovery**

一句话：

> **EigenPhi is strong at known MEV / technical strategy detection. We focus on discovering non-standard Protocol Alpha.**

---

## Arkham / Phalcon

它们擅长：

> wallet / transaction understanding

我们解决：

> **strategy discovery across many transactions**

一句话：

> **They explain transactions. We discover strategies from transaction history.**

---

## DeFiLlama / Sentora

它们主要搜索：

> known pool / known yield / known strategy space

我们搜索：

> **unknown opportunities hidden in behavior**

---

# 18. 我们真正的新意是什么

不要 claim：

- Wallet Analysis 是新的
- AI 理解合约是新的
- Strategy Detection 是新的
- Liquidation Analysis 是新的

真正的新意是四件事组合：

## 18.1 New Scope
> **Protocol Alpha, not Trading Alpha**

## 18.2 New Search Prior
> **Known Alpha selects high-signal Wallets**

## 18.3 New Discovery Loop
> **Alpha → Wallet → New Alpha**

## 18.4 Open-ended Agent Discovery
> **Discover non-standard strategies instead of only classifying known ones**

---

# 19. TRON 为什么特别适合这个项目

TRON 不是一个随便选择的部署链。

它提供了非常适合作为 Protocol Alpha Discovery Seed 的协议环境：

- Energy / resource mechanics
- Energy Rental
- JustLend
- USDD
- permissionless liquidation / keeper-style mechanisms
- mature smart-contract activity

因此当前 Demo 可以做到：

> **Seeds themselves are TRON-native.**

这比：

> “我们做了一个通用 AI 产品，然后接了 TRON API”

更强。

---

# 20. Hackathon MVP

MVP 不需要：

- 全链实时监控
- 多链
- 自动找到 100 个 Alpha
- leaderboard
- fancy chat
- trading execution
- 保证发现一个从未有人知道的实时赚钱机会

MVP 需要证明：

```text
Real TRON Alpha Seed
        ↓
Real Executors
        ↓
Strategy Wallet Selection
        ↓
Agent History Analysis
        ↓
Non-trivial Alpha Candidate
        ↓
Mechanism Validation
        ↓
Current / Risk Assessment
```

成功标准：

> **证明 Alpha → Wallet → Alpha 这条 discovery loop 是可行的。**

---

# 21. 团队必须统一记住的五句话

> **1. We focus on Protocol Alpha, not Trading Alpha.**

> **2. Known Alpha is our seed, not our final result.**

> **3. Users who found one Alpha are high-signal places to search for others.**

> **4. Protocol Alpha is open-ended, so the Agent must discover rather than only classify.**

> **5. Alpha finds Wallets. Wallets find more Alpha.**

---

# 22. 最终定位

> **Protocol Alpha Finder is a seed-driven AI discovery system that starts from known contract-native opportunities, finds the Strategy Wallets behind them, mines their full on-chain history for non-standard strategies, and validates new Protocol Alpha through mechanism, current-state, and execution-risk analysis.**

长期 Vision：

> **Build a self-growing Protocol Alpha Graph connecting opportunities with the wallets that discovered them.**
