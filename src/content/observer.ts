// ============================================================
// ClaudeWeaver — DOM Observer
// Detects user messages, counts interactions, triggers splits.
// Phase 1 implementation target.
// ============================================================

import { sendToBackground } from '@shared/messages';
import { loadSelectors } from './selectors';

let observer: MutationObserver | null = null;
let interactionCount = 0;
let activeSegmentId: string | null = null;
let splitThreshold = 2;

/** Initialize the observer on the Claude conversation container. */
export async function initObserver(segmentId: string, threshold: number): Promise<void> {
  activeSegmentId = segmentId;
  splitThreshold = threshold;
  interactionCount = 0;

  // TODO Phase 1.1: Attach MutationObserver to conversation container
  // - Watch for new user message DOM nodes
  // - On detection: increment counter, send INTERACTION_DETECTED
  // - When count >= threshold: send SPLIT_TRIGGERED
  // - Must re-attach if container is replaced (page navigation)
  throw new Error('Not implemented — Phase 1.1');
}

/** Detach the observer. */
export function destroyObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  interactionCount = 0;
  activeSegmentId = null;
}

/** Get current interaction count (for sidebar display). */
export function getInteractionCount(): number {
  return interactionCount;
}

/**
 * Detect Claude's auto-generated conversation title.
 * Watches document.title or title element mutations.
 */
export async function watchForTitle(): Promise<void> {
  // TODO Phase 1.1: Watch for title changes, send TITLE_DETECTED
  throw new Error('Not implemented — Phase 1.1');
}
