// ============================================================
// ClaudeWeaver — Internal Message Protocol
// Content scripts ↔ background ↔ sidebar communication
// ============================================================

import type {
  Thread,
  Segment,
  ArtifactManifest,
  CheckpointStage,
} from './types';
import browser from 'webextension-polyfill';

// ------- Message type union -------

export type Message =
  | { type: 'INTERACTION_DETECTED'; count: number; segmentId: string }
  | { type: 'SPLIT_TRIGGERED'; segmentId: string }
  | { type: 'CHECKPOINT_START'; segmentId: string }
  | { type: 'CHECKPOINT_PROGRESS'; stage: CheckpointStage; detail?: string }
  | { type: 'CHECKPOINT_COMPLETE'; segmentId: string; newSegmentId: string }
  | { type: 'CHECKPOINT_ERROR'; stage: CheckpointStage; error: string }
  | { type: 'BRIEF_READY'; segmentId: string; brief: string }
  | { type: 'ARTIFACT_EXTRACTED'; segmentId: string; manifest: ArtifactManifest }
  | { type: 'PROJECT_CREATED'; threadId: string; projectUrl: string }
  | { type: 'MANUAL_CHECKPOINT' }
  | { type: 'GET_THREAD_STATE' }
  | { type: 'THREAD_STATE'; thread: Thread | null; segments: Segment[] }
  | { type: 'NAVIGATE_SEGMENT'; segmentId: string }
  | { type: 'TITLE_DETECTED'; title: string };

// ------- Helpers -------

/** Send a message to the background service worker. */
export function sendToBackground(msg: Message): Promise<unknown> {
  return browser.runtime.sendMessage(msg);
}

/** Send a message to a specific tab's content script. */
export function sendToTab(tabId: number, msg: Message): Promise<unknown> {
  return browser.tabs.sendMessage(tabId, msg);
}

/**
 * Register a message listener with type narrowing.
 * Returns a cleanup function to remove the listener.
 */
export function onMessage(
  handler: (msg: Message, sender: browser.Runtime.MessageSender) => void | Promise<unknown>
): () => void {
  const wrapped = (
    msg: unknown,
    sender: browser.Runtime.MessageSender
  ): void | Promise<unknown> => {
    if (isMessage(msg)) {
      return handler(msg, sender);
    }
  };
  browser.runtime.onMessage.addListener(wrapped);
  return () => browser.runtime.onMessage.removeListener(wrapped);
}

/** Type guard for Message. */
function isMessage(val: unknown): val is Message {
  return (
    typeof val === 'object' &&
    val !== null &&
    'type' in val &&
    typeof (val as Record<string, unknown>)['type'] === 'string'
  );
}
