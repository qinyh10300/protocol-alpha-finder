/// <reference types="vite/client" />
import { DEFAULT_DEMO_SEED, PROTOCOL_SEEDS } from "./seeds";

export const isPagesBuild = import.meta.env.MODE === "pages";

export function currentPath() {
  if (isPagesBuild) {
    return new URLSearchParams(location.search).get("view") || "/research";
  }
  return ["/", "/frontend/", "/frontend/index.html"].includes(location.pathname)
    ? "/research"
    : location.pathname;
}

export function currentMode(): "archive" | "demo" {
  // The public workspace always opens in replay; saved results need an explicit URL.
  return !isPagesBuild &&
    new URLSearchParams(location.search).get("mode") === "archive"
    ? "archive"
    : "demo";
}

export function currentSeed(mode = currentMode()) {
  const seed = new URLSearchParams(location.search).get("seed");
  if (seed === "all" || PROTOCOL_SEEDS.some((entry) => entry.id === seed))
    return seed!;
  return mode === "demo" ? DEFAULT_DEMO_SEED : "all";
}

/** Keep static-host routes on index.html so shared links also work after refresh. */
export function routeUrl(
  path: string,
  mode = currentMode(),
  seedId = currentSeed(mode),
) {
  const url = new URL(isPagesBuild ? location.pathname : path, location.origin);
  if (isPagesBuild) url.searchParams.set("view", path);
  url.searchParams.set("mode", mode);
  if (seedId !== (mode === "demo" ? DEFAULT_DEMO_SEED : "all")) {
    url.searchParams.set("seed", seedId);
  }
  return url.href;
}
