# Protocol Alpha Finder — Pitch Guide（评委沟通版 / 中英双语）

> **Purpose:** 这份文档帮助团队成员向评委解释项目。重点不是背技术细节，而是让评委快速理解：
>
> 1. 我们做的是 Protocol Alpha，不是 Trading Alpha  
> 2. 已知 Alpha 是 Seed，用来找到高信息价值 Wallet  
> 3. Agent 从这些 Wallet 中开放式发现更多 Alpha  
> 4. Validation + Risk 把“有趣模式”变成“可执行机会”

---

# 1. Pitch 最推荐的起点：从真实个人经历开始

不要一上来讲：

> “We built an AI agent...”

这样太像 Hackathon 模板。

更好的开场是：

> **I started from a real problem.**

讲一个 liquidation 场景。

中文逻辑：

> 我自己会研究 liquidation。  
> 有时候我会看到一个有利润的机会已经被另一个地址执行了。  
> 这个机会并不是 private information，只是对方比我更早发现并理解了协议机制。  
> 这让我产生一个很自然的问题：  
> **如果这个 Wallet 找到过一个我没找到的 Protocol Alpha，它还找到过什么？**

这就是项目最可信的 motivation。

---

# 2. 推荐的整场 Pitch 逻辑

```text
Personal Pain
    ↓
Protocol Alpha
    ↓
Known Alpha as Seed
    ↓
Strategy Wallet
    ↓
Agent Open-ended Discovery
    ↓
Validation + Execution Risk
    ↓
TRON Demo
    ↓
Vision: Alpha → Wallet → Alpha
```

---

# 3. 第一卖点：Protocol Alpha, not Trading Alpha

这是第一个必须让评委理解的点。

## English

**Most on-chain intelligence products focus on trading behavior.**

**We focus on Protocol Alpha, not Trading Alpha.**

**Protocol Alpha comes from protocol mechanics and smart-contract execution, not from predicting market prices.**

## 中文

大多数链上分析工具关注 trading behavior。

我们关注的是 Protocol Alpha，不是 Trading Alpha。

Protocol Alpha 的收益来自协议机制和智能合约执行，而不是来自预测价格。

---

# 4. 如何快速举例

## English

**For example, a permissionless liquidation reward, a keeper reward, or a non-obvious contract execution path can be Protocol Alpha.**

## 中文

比如：

- permissionless liquidation reward
- keeper reward
- 特殊 contract execution path

都可以是 Protocol Alpha。

重点：

> **不要让评委以为 Protocol Alpha = liquidation。**

Liquidation 只是例子。

---

# 5. 第二卖点：Known Alpha Is a Seed

这是项目最重要的 insight 之一。

## English

**We do not stop at the known Alpha.**

**We use it as a seed.**

**We ask: who actually executed this opportunity?**

## 中文

我们不是发现一个 Alpha 就结束。

我们把已知 Alpha 当 Seed。

然后问：

> 谁真正执行过这个机会？

---

# 6. 为什么要找这些 Wallet

这是 Pitch 中最需要说服评委的地方。

不要说：

> “These are smart wallets.”

太主观。

要说：

> **These wallets have already demonstrated one protocol insight on-chain.**

## English

**These wallets are valuable because they already demonstrated one protocol insight.**

**They are higher-signal research targets than random wallets.**

**If they found one Protocol Alpha, they may have found others.**

## 中文

这些 Wallet 有价值，不是因为它们钱多。

而是因为：

> 它们已经通过链上行为证明过一次 protocol insight。

因此它们比随机 Wallet 更值得研究。

核心假设：

> **If they found one, they may have found others.**

---

# 7. 最核心的产品公式

这一句一定要让评委记住：

> **Alpha finds Wallets. Wallets find more Alpha.**

中文：

> 已知 Alpha 帮我们找到 Wallet，Wallet 再帮助我们发现更多 Alpha。

你也可以讲：

> **Known Alpha is the clue. The Wallet is the path. New Alpha is the product.**

中文：

> 已知 Alpha 是线索，Wallet 是路径，新的 Alpha 才是产品。

---

# 8. 第三卖点：Why Agent?

不要说：

> “We use AI because AI is powerful.”

要说：

> **Because Protocol Alpha is open-ended.**

## English

**Protocol Alpha does not have a fixed shape.**

**We cannot define every strategy in advance.**

**The next opportunity may not look like liquidation, arbitrage, or any known category.**

**So this is not only classification. It is discovery.**

## 中文

Protocol Alpha 没有固定形态。

我们无法提前定义所有策略。

下一个 Alpha 可能根本不是 liquidation、arbitrage 或任何已知类别。

所以：

> 这不是简单分类，而是真正的发现。

---

# 9. 一句解释 Agent

非常推荐背：

> **We know where to look, but we do not know what we will find.**

中文：

> 我们知道应该去哪里找，但不知道最后会发现什么。

这句话能非常快解释：

> 为什么 Seed 重要，为什么 Agent 也重要。

---

# 10. Agent 实际做什么

## English

**The agent analyzes contracts, functions, token flows, and repeated behavior across the full wallet history.**

**It turns low-level transactions into strategy candidates.**

## 中文

Agent 会分析：

- contract
- function
- token flow
- repeated behavior
- transaction sequence
- protocol context

最终把大量底层交易：

> 转成少量 Strategy / Alpha Candidates。

---

# 11. Agent 不是负责算账

如果评委问 AI 是否可靠：

## English

**We use the agent for understanding and hypothesis generation.**

**We use deterministic code for token flows, PnL, on-chain state, and validation.**

## 中文

Agent 负责：

> 理解和提出假设。

代码负责：

> 资金流、PnL、链上状态和验证。

这会让技术架构显得更可信。

---

# 12. 第四层：Validation

发现模式不能直接叫 Alpha。

## English

**A historical pattern is not automatically an Alpha.**

**We first validate why it made money.**

**Then we check whether it still works today.**

## 中文

一个历史行为模式不等于 Alpha。

我们必须验证：

1. 为什么赚钱
2. 今天是否仍然有效

---

# 13. Execution Risk

## English

**Finally, we ask a practical question: can a normal technical user actually execute it today?**

## 中文

最后我们问一个非常实际的问题：

> 普通技术用户今天真的能执行并赚钱吗？

分析：

- competition
- timing
- Energy / gas
- liquidity
- slippage
- capital
- protocol changes
- oracle dependency

---

# 14. TRON Seed Demo 怎么讲

建议不要把三个例子说成“我们的三个产品”。

应该说：

> **These are our initial discovery seeds in the TRON ecosystem.**

---

## Seed 1 — Energy Rental Liquidation

最强 Seed。

### English

**Energy Rental liquidation is a strong seed because it is permissionless, contract-native, and economically rewarded.**

**More importantly, it helps us identify wallets that looked below the standard user flow.**

### 中文

Energy Rental liquidation 很适合作为 Seed：

- permissionless
- contract-native
- 有 reward
- 能筛出真正看过协议底层逻辑的 Wallet

---

## Seed 2 — USDD Keeper / `redo()`

### English

**USDD keeper actions show another type of Protocol Alpha: protocol maintenance with an economic incentive.**

### 中文

USDD keeper 类动作展示：

> Protocol Alpha 不只等于 liquidation。

它可以是：

> protocol maintenance + keeper incentive。

---

## Seed 3 — JustLend Lending Liquidation

这里要稍微谨慎。

### English

**JustLend lending liquidation is an important protocol mechanism, but standard UI liquidation is a weaker signal.**

**We are more interested in direct, bot-like, or non-standard executors that show technical intent.**

### 中文

JustLend liquidation 是重要生态案例。

但标准 UI liquidation 本身对“高级协议 insight”的证明较弱。

因此我们更关注：

- direct contract executor
- bot-like execution
- non-standard execution pattern

这会显得我们的 Seed 设计更加严谨。

---

# 15. 为什么 TRON 很适合

## English

**TRON is not just a chain where we deploy the product.**

**The discovery seeds themselves are TRON-native: Energy, JustLend, and USDD.**

**That makes TRON part of the discovery logic, not just infrastructure.**

## 中文

TRON 不只是我们的部署链。

我们第一批 Seed 本身就是 TRON-native：

- Energy
- JustLend
- USDD

所以 TRON 是产品逻辑的一部分，而不只是底层基础设施。

---

# 16. 竞品：Nansen

## English

**Nansen starts from profitable traders and asks what they are buying.**

**We start from known contract-native Alpha and ask what else the executors discovered.**

## 中文

Nansen：

> 从 profitable trader 出发。

我们：

> 从 known Protocol Alpha 出发。

一句话：

> **Trading edge vs Protocol edge**

---

# 17. 竞品：Phoenix Research

Phoenix 对我们的价值更多是：

> **Vision validation**

它证明：

> Wallet history 可以承载 strategy intelligence。

## English

**Phoenix shows that a wallet can reveal a strategy.**

**But Phoenix mainly focuses on trading behavior.**

**We apply the same higher-level idea to smart-contract and protocol behavior.**

## 中文

Phoenix 主要：

> Wallet → Trading Strategy

我们：

> Wallet → Protocol Strategy

这证明我们的核心 idea 不是凭空想象。

---

# 18. 竞品：EigenPhi

EigenPhi 是最接近的技术类竞品之一。

## English

**EigenPhi is strong at known MEV and technical strategy detection.**

**We focus on open-ended Protocol Alpha discovery.**

**Our agent can look for strategies that may not fit any predefined category.**

## 中文

EigenPhi 很强，但更偏：

- arbitrage
- liquidation
- sandwich
- MEV
- known taxonomy

我们更强调：

> **unknown / non-standard Protocol Alpha discovery**

---

# 19. 一句话竞争定位

推荐背：

> **Phoenix shows that wallets can reveal strategies. EigenPhi shows that complex on-chain actions can reveal technical strategies. We combine these ideas in a different problem space: Protocol Alpha.**

中文：

> Phoenix 证明 Wallet 可以承载 Strategy。  
> EigenPhi 证明复杂链上行为可以被理解为技术策略。  
> 我们把这两个思想应用到了另一个问题域：Protocol Alpha。

然后接：

> **We start from known Alpha, find the wallets behind it, and use agents to discover new, non-standard Alpha from their history.**

---

# 20. 30 秒 Pitch

## English

**We focus on Protocol Alpha, not Trading Alpha.**

**We start from known contract-native opportunities, find the wallets that executed them, and use those wallets as high-signal research targets.**

**Then our AI agent analyzes their full on-chain history to discover other non-obvious smart-contract strategies.**

**Finally, we validate why they make money, whether they still work today, and what execution risks they have.**

**The core idea is simple: Alpha finds Wallets, and Wallets find more Alpha.**

---

# 21. 60 秒 Pitch

## English

**I started from a real problem.**

**When I research liquidations, I often find that someone else has already executed a profitable protocol opportunity.**

**That made me ask: if this wallet found one non-obvious opportunity before I did, what else has it found?**

**Our focus is Protocol Alpha, not Trading Alpha. Protocol Alpha comes from protocol mechanics and smart-contract execution, not from predicting market prices.**

**We use known Alpha as seeds, find the wallets that executed them, and let our AI agent analyze their full on-chain history.**

**The agent looks for new contract patterns and strategy candidates that we did not define in advance.**

**Then we validate why the strategy made money, whether it still works today, and what execution risks it has.**

**So the loop is simple: Alpha finds Wallets. Wallets find more Alpha.**

---

# 22. 最推荐的 2–3 分钟叙事

## Part 1 — Personal Story

**I started from a real liquidation research problem.**

**Sometimes I find a profitable opportunity only after another wallet has already executed it.**

**The opportunity was public. They simply found it earlier.**

**That made me ask: what else has this wallet found?**

---

## Part 2 — Define Scope

**We call this Protocol Alpha.**

**It is not about predicting token prices.**

**It is about economic opportunities created by protocol mechanics and smart-contract execution.**

---

## Part 3 — Seed Insight

**Known Alpha is not our final result. It is our seed.**

**We use it to find wallets that already demonstrated one protocol insight.**

**These wallets are better research targets than random wallets.**

---

## Part 4 — Agent

**But the next Alpha may not fit a known category.**

**So our agent performs open-ended discovery across the full wallet history.**

**It studies contracts, functions, token flows, and repeated behavior.**

---

## Part 5 — Validation

**After discovery, deterministic code validates the mechanism, current profitability, and execution risk.**

---

## Part 6 — TRON

**Our first seeds are TRON-native: Energy Rental liquidation, USDD keeper actions, and selected JustLend liquidation executors.**

---

## Part 7 — Vision

**The long-term vision is a Protocol Alpha Graph.**

**Every Alpha can lead us to new wallets, and every high-signal wallet can lead us to new Alpha.**

**Alpha finds Wallets. Wallets find more Alpha.**

---

# 23. 推荐 PPT 结构

## Slide 1 — Personal Problem
**Someone found it before me. What else did they find?**

## Slide 2 — Scope
**Protocol Alpha, not Trading Alpha**

## Slide 3 — Seed
**Known Alpha is the clue**

## Slide 4 — Core Insight
**Alpha → Wallet → Alpha**

## Slide 5 — Why Agent
**We know where to look. We do not know what we will find.**

## Slide 6 — TRON Seeds
Energy Rental / USDD / selected JustLend executors

## Slide 7 — Technical Workflow
Seed → Wallet → Agent → Validation

## Slide 8 — Competitors
Nansen / Phoenix / EigenPhi

## Slide 9 — Demo
Real Seed → Real Wallet → Candidate

## Slide 10 — Vision
**Protocol Alpha Graph**

---

# 24. 评委最可能问的问题

## Q1. Isn't this just Smart Money?

**No. Smart Money usually starts from trading performance. We start from known smart-contract Alpha.**

中文：

不是。

Smart Money 从 trading performance 出发。

我们从 known Protocol Alpha 出发。

---

## Q2. Isn't this just EigenPhi?

**EigenPhi is very strong at known MEV and technical strategy detection. We focus on open-ended discovery of non-standard Protocol Alpha from high-signal wallet histories.**

---

## Q3. Why do you need AI?

**Because we cannot define every Alpha in advance. The agent is used for semantic understanding and hypothesis generation across many transactions. Deterministic code is used for proof and validation.**

---

## Q4. Why start from Wallets?

**We do not start from random wallets. We start from wallets that already demonstrated one protocol insight. That gives us a strong search prior.**

---

## Q5. Why TRON?

**Because the initial discovery seeds themselves are TRON-native: Energy, JustLend, and USDD. TRON is part of the research space, not just deployment infrastructure.**

---

## Q6. What if the Alpha is already expired?

**That is still useful. Our system should distinguish ACTIVE, DEGRADED, EXPIRED, and UNCERTAIN opportunities. Historical Alpha still validates the discovery method.**

---

# 25. 不要说什么

不要说：

> “We find smart money.”

不要说：

> “We built an AI wallet analyzer.”

不要说：

> “We built a liquidation tool.”

不要说：

> “AI automatically finds guaranteed profit.”

不要说：

> “Nobody has ever done strategy discovery before.”

不要把 Energy Rental / USDD / JustLend 讲成三个最终产品。

---

# 26. 一定要说什么

> **Protocol Alpha, not Trading Alpha.**

> **Known Alpha is our seed, not our final result.**

> **The executor has already demonstrated one protocol insight.**

> **The Agent performs open-ended discovery.**

> **Validation separates a historical pattern from a real opportunity.**

> **Alpha finds Wallets. Wallets find more Alpha.**

---

# 27. 如果只能背 8 句英文

1. **I started from a real problem.**

2. **We focus on Protocol Alpha, not Trading Alpha.**

3. **Known Alpha is our seed, not our final result.**

4. **We find the wallets that actually executed it.**

5. **These wallets already demonstrated one protocol insight.**

6. **If they found one Alpha, they may have found others.**

7. **Our agent performs open-ended discovery across their full on-chain history.**

8. **Alpha finds Wallets. Wallets find more Alpha.**

---

# 28. 最后一句 Vision

推荐收尾：

> **Today we start with a few TRON Alpha seeds. Our long-term goal is to build a self-growing Protocol Alpha Graph — connecting opportunities with the wallets that discovered them.**

中文：

> 今天我们从几个 TRON 的 Alpha Seed 开始。  
> 长期目标是建立一张不断自我扩张的 Protocol Alpha Graph，把机会和发现这些机会的钱包连接起来。
