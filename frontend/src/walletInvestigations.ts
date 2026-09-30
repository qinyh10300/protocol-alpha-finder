import { groupCandidates } from "./candidateGroups";
import type { Snapshot, StrategyWallet } from "./types";

/**
 * Select display rows without removing wallet, candidate or report evidence.
 * Replay callers use the full saved snapshot so partial progress cannot change rows.
 */
export function selectInvestigationWallets(
  snapshot: Snapshot,
): StrategyWallet[] {
  const candidateGroups = new Map<
    string,
    { key: string; sourceWallets: string[] }
  >();
  for (const group of groupCandidates(snapshot.candidates, snapshot)) {
    for (const candidate of group.members) {
      candidateGroups.set(candidate.id, {
        key: group.key,
        sourceWallets: candidate.sourceWallets,
      });
    }
  }

  const ranked = snapshot.wallets.map((wallet, index) => {
    const groups = new Set<string>();
    let unresolved = false;
    for (const id of wallet.candidateIds) {
      const candidate = candidateGroups.get(id);
      if (candidate?.sourceWallets.includes(wallet.address)) {
        groups.add(candidate.key);
      } else {
        unresolved = true;
      }
    }
    return { index, groups, unresolved };
  });
  ranked.sort((a, b) => b.groups.size - a.groups.size || a.index - b.index);

  const covered = new Set<string>();
  const retained = new Set<number>();
  for (const { index, groups, unresolved } of ranked) {
    if (
      !groups.size ||
      unresolved ||
      [...groups].some((group) => !covered.has(group))
    ) {
      retained.add(index);
      groups.forEach((group) => covered.add(group));
    }
  }
  return snapshot.wallets.filter((_, index) => retained.has(index));
}
