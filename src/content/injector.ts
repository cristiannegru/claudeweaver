// ============================================================
// ClaudeWeaver — DOM Injector
// Text extraction, message injection, DOM automation for
// project creation, conversation management, and renaming.
// Phases 1 & 2 implementation target.
// ============================================================

import type { ConversationTurn, ExtractedArtifact } from '@shared/types';

// ------- Extraction (Phase 1) -------

/** Extract all conversation turns from the DOM. */
export async function extractConversationText(): Promise<ConversationTurn[]> {
  // TODO Phase 1.2: Walk conversation DOM, extract user/assistant turns
  throw new Error('Not implemented — Phase 1.2');
}

/** Extract artifacts (code blocks, documents, etc.) from the DOM. */
export async function extractArtifacts(): Promise<ExtractedArtifact[]> {
  // TODO Phase 1.3: Identify artifact blocks, extract title/type/content
  // Risk: artifacts may be lazily loaded — may need to expand panels first
  throw new Error('Not implemented — Phase 1.3');
}

// ------- Injection (Phase 1 & 2) -------

/** Inject the manual checkpoint button into Claude's toolbar area. */
export function injectCheckpointButton(): void {
  // TODO Phase 1.5: Add button to UI, send MANUAL_CHECKPOINT on click
  throw new Error('Not implemented — Phase 1.5');
}

/**
 * Programmatically type text into Claude's input field and submit.
 * Risk: contenteditable div managed by rich text framework (ProseMirror/Slate).
 * May need execCommand('insertText') or InputEvent dispatch.
 */
export async function injectMessage(text: string): Promise<void> {
  // TODO Phase 2.5: Set input value, dispatch events, click send
  throw new Error('Not implemented — Phase 2.5');
}

// ------- DOM Automation (Phase 2) -------

/** Automate Claude's "New Project" flow. Returns project URL. */
export async function createProject(name: string): Promise<string> {
  // TODO Phase 2.1: Click new project → enter name → confirm → return URL
  throw new Error('Not implemented — Phase 2.1');
}

/** Move the current conversation into an existing project. */
export async function moveConversation(projectUrl: string): Promise<void> {
  // TODO Phase 2.2: Automate "Move to project" menu option
  throw new Error('Not implemented — Phase 2.2');
}

/** Rename the current conversation. */
export async function renameConversation(name: string): Promise<void> {
  // TODO Phase 2.3: Click title → edit → type name → confirm
  throw new Error('Not implemented — Phase 2.3');
}

/** Open a new conversation within an existing Claude Project. */
export async function openNewConversation(projectUrl: string): Promise<void> {
  // TODO Phase 2.4: Navigate to project, trigger "New conversation"
  throw new Error('Not implemented — Phase 2.4');
}

// ------- Knowledge Upload (Phase 4) -------

/**
 * Upload a file to Project Knowledge.
 * Primary: DOM automation of upload UI.
 * Fallback: intercept upload API endpoint.
 */
export async function uploadToKnowledge(_projectUrl: string, _fileContent: string, _filename: string): Promise<boolean> {
  // TODO Phase 4.1: Highest risk step — see architecture warnings
  throw new Error('Not implemented — Phase 4.1');
}
