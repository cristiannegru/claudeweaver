// ============================================================
// ClaudeWeaver — Brief Generator (Option C)
// Opens a Sonnet conversation, injects brief prompt, extracts result.
// Phase 3 implementation target.
// ============================================================

import type { ConversationTurn, ArtifactManifest } from '@shared/types';
import { BRIEF_GENERATION_PROMPT, buildContinuationPromptText } from '@shared/constants';

export interface BriefResult {
  briefText: string;
  model: string;
  generatedAt: string;
}

/**
 * Generate an intelligence brief using Option C (Sonnet in a separate tab).
 * Flow: open tab → select Sonnet → inject prompt + conversation → poll for response → extract → close.
 */
export async function generateBrief(conversationTurns: ConversationTurn[]): Promise<BriefResult> {
  // TODO Phase 3.3: Full Option C flow
  // dep: 3.1 (tab management), 3.2 (prompt template), 1.2 (text extraction), 2.5 (message injection)
  throw new Error('Not implemented — Phase 3.3');
}

/**
 * Open a new Claude tab and switch to Sonnet model.
 * Returns the tab ID for subsequent interaction.
 */
export async function openBriefTab(): Promise<number> {
  // TODO Phase 3.1: Open tab, switch model via DOM
  throw new Error('Not implemented — Phase 3.1');
}

/** Close a brief generation tab. */
export async function closeBriefTab(tabId: number): Promise<void> {
  // TODO Phase 3.1
  throw new Error('Not implemented — Phase 3.1');
}

/**
 * Build a continuation prompt from brief + artifact manifests.
 * This is a pure function — no DOM interaction.
 */
export function buildContinuationPrompt(
  briefText: string,
  manifests: ArtifactManifest[],
  threadId: string,
  segmentSequence: number,
  prefix: string,
): string {
  return buildContinuationPromptText(
    briefText,
    manifests.map(m => ({ title: m.title, type: m.type, estimated_tokens: m.estimated_tokens })),
    threadId,
    segmentSequence,
    prefix,
  );
}
