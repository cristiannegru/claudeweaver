// ============================================================
// ClaudeWeaver — Constants & Defaults
// Updated: 2026-02-23 — v4 brief verified selectors
// ============================================================

import type { UserSettings, SelectorMap } from './types';

// ------- Split & naming defaults -------

export const DEFAULT_SPLIT_THRESHOLD = 2;
export const DEFAULT_PREFIX = 'CW';
export const DEFAULT_LOCAL_ROOT = 'Claude-Threads';
export const ADAPTIVE_CHAR_THRESHOLD = 2000; // chars in assistant response to trigger early split

// ------- Naming -------

/** Format a segment display name. Sequence is zero-padded to 3 digits. */
export function formatSegmentName(prefix: string, sequence: number, autoTitle: string): string {
  const seq = String(sequence).padStart(3, '0');
  return `${prefix}-${seq}-${autoTitle}`;
}

// ------- Storage keys (namespaced) -------

export const STORAGE_KEYS = {
  THREADS: 'cw:threads',
  SEGMENTS: 'cw:segments',
  ACTIVE_THREAD: 'cw:active_thread',
  SETTINGS: 'cw:settings',
  SELECTOR_CONFIG: 'cw:selector_config',
} as const;

// ------- Default settings -------

export const DEFAULT_SETTINGS: UserSettings = {
  split_threshold: DEFAULT_SPLIT_THRESHOLD,
  default_prefix: DEFAULT_PREFIX,
  local_root: DEFAULT_LOCAL_ROOT,
  api_key: null,
  first_run_complete: false,
};

// ------- API endpoints -------

export const API = {
  /** Extract full conversation tree. Org ID from Performance API, conv ID from URL. */
  CONVERSATION_TREE: '/api/organizations/{orgId}/chat_conversations/{convId}?tree=True&rendering_mode=messages&render_all_tools=true&consistency=strong',
  /** Rename a conversation. PUT with { title: string }. */
  RENAME: '/api/organizations/{orgId}/chat_conversations/{convId}/title',
  /** Move conversations to a project. POST with { conversation_ids: string[], project_uuid: string }. */
  MOVE_MANY: '/api/organizations/{orgId}/chat_conversations/move_many',
  /** List projects. */
  PROJECTS: '/api/organizations/{orgId}/projects',
  /** Create a project. POST. */
  CREATE_PROJECT: '/api/organizations/{orgId}/projects',
  /** Upload to project knowledge. */
  PROJECT_DOCS: '/api/organizations/{orgId}/projects/{projectId}/docs',
} as const;

// ------- Verified DOM selector map (from v4 brief — DOM audit 2026-02-23) -------
// Fragility: low = data-testid/aria-label, medium = class-based, high = structural
// 26 selectors verified against live claude.ai

export const DEFAULT_SELECTORS: SelectorMap = {
  // --- Messages & turns ---
  user_message:         '[data-testid="user-message"]',
  assistant_action_bar: '[role="group"][aria-label="Message actions"]',
  assistant_content:    'div.group.relative.inline-flex.gap-2.bg-bg-300', // medium — use API for reliable extraction
  turn_list_parent:     'div.flex-1.flex.flex-col.px-4.max-w-3xl',       // medium — contains all turns as direct children
  conversation_turn:    'div[data-test-render-count]',                    // medium — React dev marker, may vanish in prod
  single_turn:          'div.mb-1.mt-6.group',                           // medium — wraps one assistant response block
  turn_content:         'div.flex.flex-col.items-end.gap-1',             // medium — holds assistant_content + action_bar
  scroll_container:     'div.overflow-y-scroll.overflow-x-hidden',       // medium — MutationObserver target

  // --- Input ---
  chat_input:           '[data-testid="chat-input"]',          // Tiptap/ProseMirror. __reactFiber$ on PARENT, not this element.
  chat_input_ssr:       '[data-testid="chat-input-ssr"]',      // SSR textarea fallback
  prompt_fieldset:      '[data-testid="prompt-input-ssr-interactive"]',
  send_button:          'button[aria-label="Send message"]',   // Only visible when input has content

  // --- Model selection ---
  model_selector:       '[data-testid="model-selector-dropdown"]',
  model_menu:           '[role="menu"]',                       // medium — appears after model_selector click
  model_menu_item:      '[role="menu"] [role="menuitem"]',     // medium — 3 items: Opus, Extended thinking toggle, More models

  // --- Header & title ---
  chat_title:           '[data-testid="chat-title-button"]',
  chat_menu_trigger:    '[data-testid="chat-menu-trigger"]',   // Menu NOT openable programmatically — use API (D10)
  page_header:          '[data-testid="page-header"]',

  // --- Per-message actions ---
  action_copy:          '[data-testid="action-bar-copy"]',     // Also serves as anchor for assistant turn detection
  action_retry:         '[data-testid="action-bar-retry"]',

  // --- Artifacts ---
  artifact_block:       '.artifact-block-cell',                // medium — class-based

  // --- Sidebar & navigation ---
  sidebar:              'nav[aria-label="Sidebar"]',
  new_chat:             'a[aria-label="New chat"]',
  sidebar_toggle:       '[data-testid="pin-sidebar-toggle"]',

  // --- Misc ---
  file_upload:          '[data-testid="file-upload"]',         // Hidden file input for attachments
  scroll_bottom:        'button[aria-label="Scroll to bottom"]',
  user_menu:            '[data-testid="user-menu-button"]',
  wiggle_controls:      '[data-testid="wiggle-controls-actions"]', // Computer-use controls
};

// ------- HTML root metadata (useful for version detection & feature gating) -------

export const HTML_ROOT_ATTRS = {
  BUILD_ID: 'data-build-id',
  ORG_PLAN: 'data-org-plan',
  COUNTRY: 'data-cf-country',
  THEME: 'data-theme',
  MODE: 'data-mode',
} as const;

// ------- Brief generation prompt template -------
// Used by Option C: injected into a Sonnet conversation to produce a structured brief.

export const BRIEF_GENERATION_PROMPT = `You are generating an intelligence brief for a conversation thread management system. Your job is to produce a structured summary that allows a future Claude instance to continue this work with full context.

Read the conversation below and produce a brief with these sections:

1. IDENTITY & CORRECTIONS
- What this project IS (one sentence)
- What it is NOT (common misconceptions or things discussed and rejected)
- Any corrections to earlier assumptions

2. KEY DECISIONS (with WHY)
- Each major decision made, with the rationale behind it
- Format: "Decision: [what]. Why: [reasoning]"

3. CURRENT STATE
- What has been completed
- What is in progress
- What the immediate next step is

4. ANTI-DRIFT WARNINGS
- Decisions most likely to be forgotten or contradicted
- Tag each as [observed] (actually happened in conversation) or [predicted] (likely to recur)
- Format: "Do not [wrong thing]. Instead: [correct thing]. (Reference: [decision])"

5. ARTIFACT MANIFEST
- List any code, documents, or other artifacts produced
- For each: title, type, brief description

Keep the brief concise but complete. Prioritize information that would be lost if someone started fresh without this context. Write in direct, declarative sentences. No filler.

--- CONVERSATION TO SUMMARIZE ---
`;

// ------- Continuation prompt template -------

export function buildContinuationPromptText(
  briefText: string,
  artifactManifests: Array<{ title: string; type: string; estimated_tokens: number }>,
  threadId: string,
  segmentSequence: number,
  prefix: string,
): string {
  const manifestSection = artifactManifests.length > 0
    ? artifactManifests
        .map(a => `  - "${a.title}" (${a.type}, ~${a.estimated_tokens} tokens) — available in Project Knowledge`)
        .join('\n')
    : '  (none)';

  return `[ClaudeWeaver Thread Continuation — Segment ${String(segmentSequence + 1).padStart(3, '0')}]
Thread: ${threadId} | Previous segment: ${prefix}-${String(segmentSequence).padStart(3, '0')}

--- INTELLIGENCE BRIEF FROM PREVIOUS SEGMENT ---
${briefText}
--- END BRIEF ---

ARTIFACT MANIFEST (content available in Project Knowledge, not repeated here):
${manifestSection}

Please confirm you have access to the Project Knowledge files and understand the thread context. Then continue from where we left off.`;
}
