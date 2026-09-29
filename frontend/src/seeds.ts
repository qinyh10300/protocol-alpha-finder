import type { Seed } from "./types";

// IDs match alpha-seed-wallets and the saved-results API.
export const PROTOCOL_SEEDS: Seed[] = [
  {
    id: "energy-rental-liquidation",
    name: "Energy Rental Liquidation",
    chain: "TRON",
    protocol: "JustLend",
  },
  {
    id: "justlend-lending-liquidation",
    name: "JustLend Lending Liquidation",
    chain: "TRON",
    protocol: "JustLend",
  },
  {
    id: "usdd-keeper-auction",
    name: "USDD Keeper / Auction",
    chain: "TRON",
    protocol: "USDD",
  },
];

export const DEFAULT_DEMO_SEED = PROTOCOL_SEEDS[0].id;

// The original Energy Rental scenario remains synthetic. Other seeds replay saved evidence.
// Reuse the implementation-pack examples so reports retain stable IDs and links.
export const DEMO_SCENARIOS: Record<
  string,
  { wallets: string[]; candidates: string[] }
> = {
  "energy-rental-liquidation": {
    wallets: [
      "TJ8e...3K2a",
      "TNQ8...GDW2m",
      "TWqF...Vp7x",
      "TA9k...2dx8",
      "TF6m...9Lp1",
    ],
    candidates: ["cand-usdd-keeper", "cand-settlement", "cand-auction-reset"],
  },
};
