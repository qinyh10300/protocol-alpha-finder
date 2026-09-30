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

export const ALL_SEEDS: Seed = { id: "all", name: "All", chain: "TRON" };
export const SEED_SHORT_NAMES: Record<string, string> = {
  "energy-rental-liquidation": "Energy Rental",
  "justlend-lending-liquidation": "JustLend Lending",
  "usdd-keeper-auction": "USDD Keeper",
};

export const DEFAULT_DEMO_SEED = PROTOCOL_SEEDS[0].id;
