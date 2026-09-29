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
  return isPagesBuild ||
    new URLSearchParams(location.search).get("mode") === "demo"
    ? "demo"
    : "archive";
}

export function currentSeed(mode = currentMode()) {
  const seed = new URLSearchParams(location.search).get("seed");
  if (PROTOCOL_SEEDS.some((entry) => entry.id === seed)) return seed!;
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
  if (mode === "demo") url.searchParams.set("mode", "demo");
  if (seedId !== (mode === "demo" ? DEFAULT_DEMO_SEED : "all")) {
    url.searchParams.set("seed", seedId);
  }
  return url.href;
}
