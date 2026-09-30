import { SEED_SHORT_NAMES } from "./seeds";

export function SeedOrigin({
  ids,
}: {
  ids?: string[];
  provenance?: "recorded" | "synthetic";
}) {
  if (!ids?.length) return null;
  return (
    <span className="seed-origin">
      <span>{ids.map((id) => SEED_SHORT_NAMES[id] || id).join(" · ")}</span>
    </span>
  );
}
