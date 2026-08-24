import type { Agent } from "./valorant";

// In-memory registry to avoid re-fetching previously cached assets
const cachedUrls = new Set<string>();

/**
 * Preloads a single image URL and decodes it asynchronously for zero-latency paint
 */
export function preloadImage(url: string, timeoutMs = 8000): Promise<void> {
  if (!url || cachedUrls.has(url)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const img = new Image();
    let isSettled = false;

    const finalize = () => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      clearTimeout(timer);
      cachedUrls.add(url);
      resolve();
    };

    const timer = setTimeout(finalize, timeoutMs);

    img.onload = () => {
      // Decode image ahead of time to prevent GPU hitching on initial display
      if ("decode" in img) {
        img.decode().then(finalize).catch(finalize);
      } else {
        finalize();
      }
    };

    img.onerror = finalize;
    img.src = url;
  });
}

/**
 * Preloads all slice icons and winner portraits in parallel
 */
export async function preloadAgentAssets(agents: Agent[]): Promise<void> {
  if (!agents || agents.length === 0) {
    return;
  }

  const urlsToFetch = new Set<string>();

  for (const agent of agents) {
    if (agent.icon) {
      urlsToFetch.add(agent.icon);
    }
    if (agent.portrait) {
      urlsToFetch.add(agent.portrait);
    }
  }

  // AllSettled guarantees application continues even if an individual asset fails
  await Promise.allSettled(Array.from(urlsToFetch).map((url) => preloadImage(url)));
}
