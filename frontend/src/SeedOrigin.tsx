import { SEED_SHORT_NAMES } from "./seeds";
import { useI18n } from "./i18n";

export function SeedOrigin({
  ids,
  provenance,
}: {
  ids?: string[];
  provenance?: "recorded" | "synthetic";
}) {
  const { t } = useI18n();
  if (!ids?.length) return null;
  return (
    <span className={`seed-origin ${provenance || ""}`}>
      <span>{ids.map((id) => SEED_SHORT_NAMES[id] || id).join(" · ")}</span>
      {provenance && (
        <small>
          {t(provenance === "synthetic" ? "Synthetic" : "Recorded")}
        </small>
      )}
    </span>
  );
}
