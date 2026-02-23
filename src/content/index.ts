// ============================================================
// ClaudeWeaver — Content Script Entry Point
// Loaded on claude.ai pages. Initializes observer and UI injections.
// ============================================================

import { onMessage } from '@shared/messages';
import type { Message } from '@shared/messages';

/**
 * Content script initialization.
 * Runs at document_idle on claude.ai.
 */
async function init(): Promise<void> {
  console.log('[ClaudeWeaver] Content script loaded');

  // Listen for messages from background/sidebar
  onMessage(handleMessage);

  // TODO Phase 1: Initialize observer, inject checkpoint button
  // const settings = await getSettings();
  // await initObserver(currentSegmentId, settings.split_threshold);
  // injectCheckpointButton();
}

function handleMessage(msg: Message): void {
  switch (msg.type) {
    case 'NAVIGATE_SEGMENT':
      // TODO Phase 5: Navigate to segment URL, apply stitcher
      console.log('[ClaudeWeaver] Navigate to segment:', msg.segmentId);
      break;
    default:
      break;
  }
}

init().catch(err => console.error('[ClaudeWeaver] Init failed:', err));
