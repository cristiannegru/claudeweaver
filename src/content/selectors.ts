// ============================================================
// ClaudeWeaver — Selector Abstraction Layer
// Maps semantic actions to CSS selectors. Loaded from storage.
// When Claude ships UI updates, only the config needs changing.
// ============================================================
// STATUS: Defaults are SPECULATIVE. Step 0.3 (DOM audit) populates real values.
// ============================================================

import type { SelectorMap } from '@shared/types';
import { getSelectorConfig } from '@shared/storage';

let cachedConfig: SelectorMap | null = null;

/** Load selector config from storage (cached after first call). */
export async function loadSelectors(): Promise<SelectorMap> {
  if (!cachedConfig) {
    cachedConfig = await getSelectorConfig();
  }
  return cachedConfig;
}

/** Invalidate cached selectors (call after config update). */
export function invalidateSelectorCache(): void {
  cachedConfig = null;
}

/** Query the DOM for a semantic action. Returns null if not found. */
export async function querySelector(action: keyof SelectorMap): Promise<Element | null> {
  const config = await loadSelectors();
  const selector = config[action];
  if (!selector) return null;
  return document.querySelector(selector);
}

/** Query all matching elements for a semantic action. */
export async function querySelectorAll(action: keyof SelectorMap): Promise<Element[]> {
  const config = await loadSelectors();
  const selector = config[action];
  if (!selector) return [];
  return Array.from(document.querySelectorAll(selector));
}

/**
 * Wait for an element matching a semantic action to appear in the DOM.
 * Uses MutationObserver. Resolves when found, rejects after timeout.
 */
export async function waitForSelector(
  action: keyof SelectorMap,
  timeoutMs = 5000
): Promise<Element> {
  // Check if already present
  const existing = await querySelector(action);
  if (existing) return existing;

  const config = await loadSelectors();
  const selector = config[action];
  if (!selector) throw new Error(`No selector configured for action: ${action}`);

  return new Promise<Element>((resolve, reject) => {
    const timeout = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for selector: ${action} (${selector})`));
    }, timeoutMs);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearTimeout(timeout);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}
