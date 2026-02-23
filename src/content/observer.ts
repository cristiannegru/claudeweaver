/**
 * content/observer.ts — Step 1.1
 *
 * Two-layer MutationObserver architecture:
 *   1. Root sentinel: watches document.body for the conversation container
 *      to appear or disappear (handles SPA navigation between conversations).
 *   2. Conversation observer: watches the container for new user-message nodes.
 *
 * On each new user message:
 *   - Increments interaction_count
 *   - Sends INTERACTION_DETECTED to background
 *   - Logs to console for testing
 *
 * Does NOT estimate tokens. Split decision lives in Step 1.4.
 */

import browser from 'webextension-polyfill';
import { DEFAULT_SELECTORS } from '../shared/constants';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** Interaction count for the current conversation view. Resets on navigation. */
let interactionCount = 0;

/** Set of user-message elements we've already counted (avoids double-fire). */
const knownUserMessages = new WeakSet<Element>();

/** Active conversation observer — disconnected on navigation. */
let conversationObserver: MutationObserver | null = null;

/** The currently-observed conversation container element. */
let currentContainer: Element | null = null;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

const USER_MESSAGE_SEL = DEFAULT_SELECTORS.user_message; // [data-testid="user-message"]

/**
 * Find the conversation container (turn list parent).
 * Strategy: find any user-message, walk up to the turn list parent.
 * Fallback: use the class-based selector directly.
 *
 * We prefer the walk-up approach because it anchors off a data-testid
 * (low fragility) rather than class names (medium fragility).
 */
function findConversationContainer(): Element | null {
  // Primary: anchor off a user-message node and walk up
  const anyUserMsg = document.querySelector(USER_MESSAGE_SEL);
  if (anyUserMsg) {
    // Walk up to find the turn list parent.
    // DOM structure: user-message → ... → turn wrapper → turn_list_parent
    // turn_list_parent has all turns as direct children.
    let el: Element | null = anyUserMsg;
    for (let depth = 0; depth < 10 && el; depth++) {
      el = el.parentElement;
      if (!el) break;
      // Heuristic: the turn list parent has multiple direct children
      // and contains user-message descendants
      const userMsgs = el.querySelectorAll(USER_MESSAGE_SEL);
      if (userMsgs.length > 0 && el.children.length >= userMsgs.length) {
        // Confirm this isn't just a single-turn wrapper — we want the
        // element whose direct children are the individual turns.
        const directChildrenWithUserMsg = Array.from(el.children).filter(
          (child) => child.querySelector(USER_MESSAGE_SEL) !== null
        );
        if (directChildrenWithUserMsg.length === userMsgs.length) {
          return el;
        }
      }
    }
  }

  // Fallback: class-based selector from audit
  return document.querySelector(DEFAULT_SELECTORS.turn_list_parent);
}

// ---------------------------------------------------------------------------
// Conversation Observer (inner layer)
// ---------------------------------------------------------------------------

/**
 * Count any user-message nodes we haven't seen yet within the container.
 * Called both on initial attach (to baseline existing messages) and on mutation.
 */
function scanForNewUserMessages(scope: Element): void {
  const userMessages = scope.querySelectorAll(USER_MESSAGE_SEL);
  for (const msg of userMessages) {
    if (knownUserMessages.has(msg)) continue;
    knownUserMessages.add(msg);
    interactionCount++;

    console.log(
      `[ClaudeWeaver] 🔵 User message detected — interaction_count: ${interactionCount}`
    );

    // Notify background
    browser.runtime.sendMessage({
      type: 'INTERACTION_DETECTED',
      count: interactionCount,
      segmentId: '', // TODO: populated from active segment in Step 1.4
    }).catch((err) => {
      // Background may not have a listener yet — swallow during dev
      console.warn('[ClaudeWeaver] sendMessage failed:', err.message);
    });
  }
}

function attachConversationObserver(container: Element): void {
  // Disconnect previous if any
  detachConversationObserver();

  currentContainer = container;

  // Baseline: count existing user messages (don't fire messages for them)
  const existing = container.querySelectorAll(USER_MESSAGE_SEL);
  for (const msg of existing) {
    knownUserMessages.add(msg);
  }
  // Don't increment interactionCount for pre-existing messages.
  // Count starts at 0 for this viewing session.

  console.log(
    `[ClaudeWeaver] 📎 Conversation observer attached. ` +
    `${existing.length} existing messages baselined.`
  );

  conversationObserver = new MutationObserver((mutations) => {
    // Fast path: check if any mutation added nodes that contain user messages
    let hasNewNodes = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasNewNodes = true;
        break;
      }
    }
    if (!hasNewNodes) return;

    // Re-scan the container for any user messages we haven't counted
    scanForNewUserMessages(container);
  });

  conversationObserver.observe(container, {
    childList: true,
    subtree: true,
  });
}

function detachConversationObserver(): void {
  if (conversationObserver) {
    conversationObserver.disconnect();
    conversationObserver = null;
  }
  currentContainer = null;
}

// ---------------------------------------------------------------------------
// Root Sentinel (outer layer)
// ---------------------------------------------------------------------------

/** Debounce timer for container checks after DOM mutations. */
let sentinelDebounce: ReturnType<typeof setTimeout> | null = null;

const SENTINEL_DEBOUNCE_MS = 300;

/**
 * Called when the root sentinel detects DOM changes.
 * Checks whether the conversation container has appeared, disappeared,
 * or been replaced (SPA navigation to a different conversation).
 */
function onRootMutation(): void {
  if (sentinelDebounce) clearTimeout(sentinelDebounce);
  sentinelDebounce = setTimeout(() => {
    const container = findConversationContainer();

    if (container && container !== currentContainer) {
      // New or different container — reset and attach
      interactionCount = 0;
      // WeakSet entries for old container nodes will be GC'd automatically
      console.log('[ClaudeWeaver] 🔄 Navigation detected — resetting observer.');
      attachConversationObserver(container);
    } else if (!container && currentContainer) {
      // Container disappeared (navigated away from conversation)
      console.log('[ClaudeWeaver] ⏸️ Conversation container removed — detaching.');
      detachConversationObserver();
      interactionCount = 0;
    }
    // If container === currentContainer, no action needed.
  }, SENTINEL_DEBOUNCE_MS);
}

let rootSentinel: MutationObserver | null = null;

/**
 * Start the root sentinel. Call once from the content script entry point.
 * Idempotent — calling multiple times is safe.
 */
export function startObserver(): void {
  if (rootSentinel) return; // Already running

  console.log('[ClaudeWeaver] 🚀 Starting root sentinel observer.');

  // Try immediate attach if conversation is already rendered
  const container = findConversationContainer();
  if (container) {
    attachConversationObserver(container);
  }

  rootSentinel = new MutationObserver(onRootMutation);
  rootSentinel.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Stop everything. Call on extension unload if needed.
 */
export function stopObserver(): void {
  detachConversationObserver();
  if (rootSentinel) {
    rootSentinel.disconnect();
    rootSentinel = null;
  }
  if (sentinelDebounce) {
    clearTimeout(sentinelDebounce);
    sentinelDebounce = null;
  }
  interactionCount = 0;
  console.log('[ClaudeWeaver] 🛑 Observer stopped.');
}

/**
 * Get current interaction count (exposed for split rule engine in Step 1.4).
 */
export function getInteractionCount(): number {
  return interactionCount;
}

/**
 * Reset interaction count (e.g. after a split is executed).
 */
export function resetInteractionCount(): void {
  interactionCount = 0;
}