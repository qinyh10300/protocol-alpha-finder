/// <reference types="vite/client" />

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

/** Keep static-host routes on index.html so shared links also work after refresh. */
export function routeUrl(path: string, mode = currentMode()) {
  const url = new URL(isPagesBuild ? location.pathname : path, location.origin);
  if (isPagesBuild) url.searchParams.set("view", path);
  if (mode === "demo") url.searchParams.set("mode", "demo");
  return url.href;
}
