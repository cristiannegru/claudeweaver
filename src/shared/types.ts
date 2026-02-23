// ============================================================
// ClaudeWeaver — Core Type Definitions
// Updated: 2026-02-23 — v4 brief verified selectors + API types
// Architecture Ref: Data Model section
// ============================================================

/** A Thread is a single logical conversation spanning multiple Claude segments. Maps 1:1 to a Claude Project. */
export interface Thread {
  id: string;
  title: string;
  project_name: string;
  project_url: string | null;
  prefix: string;
  segment_count: number;
  active_segment_id: string;
  split_threshold: number;
  local_root: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/** A Segment is one Claude conversation within a Thread. */
export interface Segment {
  id: string;
  thread_id: string;
  sequence: number; // 1-indexed
  conversation_url: string;
  conversation_id: string;
  display_name: string; // {Prefix}-{Seq}-{AutoTitle}
  status: SegmentStatus;
  interaction_count: number;
  brief: BriefMetadata | null;
  continuation_prompt: string | null;
  artifacts: ArtifactManifest[];
  started_at: string; // ISO 8601
  checkpointed_at: string | null; // ISO 8601
}

export type SegmentStatus = 'active' | 'checkpointed' | 'archived';

export interface ArtifactManifest {
  id: string;
  title: string;
  type: ArtifactType;
  language: string | null;
  estimated_tokens: number;
  local_path: string;
  knowledge_uploaded: boolean;
}

export type ArtifactType = 'code' | 'document' | 'html' | 'svg' | 'react' | 'mermaid';

export interface BriefMetadata {
  generated_at: string; // ISO 8601
  generator: BriefGenerator;
  model: string;
  local_path: string;
  knowledge_uploaded: boolean;
}

export type BriefGenerator = 'option-c' | 'option-b-api';

/** User-configurable settings. */
export interface UserSettings {
  split_threshold: number;
  default_prefix: string;
  local_root: string; // Download directory prefix, e.g. "Claude-Threads"
  api_key: string | null; // Option B (Pro) — null = use Option C
  first_run_complete: boolean;
}

/**
 * Maps semantic DOM actions to CSS selectors. Updatable without code changes.
 * 26 verified selectors from DOM audit v4 (2026-02-23).
 * Fragility: low = data-testid/aria-label, medium = class-based.
 */
export interface SelectorMap {
  // Messages & turns
  user_message: string;
  assistant_action_bar: string;
  assistant_content: string;       // medium — use API for reliable text extraction
  turn_list_parent: string;        // medium — container of all turns
  conversation_turn: string;       // medium — React dev marker, may vanish in prod
  single_turn: string;             // medium — wraps one assistant response block
  turn_content: string;            // medium — holds content + action bar
  scroll_container: string;        // medium — MutationObserver target

  // Input
  chat_input: string;              // Tiptap/ProseMirror. __reactFiber$ on PARENT wrapper.
  chat_input_ssr: string;          // SSR textarea fallback
  prompt_fieldset: string;
  send_button: string;             // Only visible when input has content

  // Model selection
  model_selector: string;
  model_menu: string;              // medium — appears after model_selector click
  model_menu_item: string;         // medium

  // Header & title
  chat_title: string;
  chat_menu_trigger: string;       // NOT openable programmatically — use API (D10)
  page_header: string;

  // Per-message actions
  action_copy: string;             // Also anchor for assistant turn detection
  action_retry: string;

  // Artifacts
  artifact_block: string;          // medium — class-based

  // Sidebar & navigation
  sidebar: string;
  new_chat: string;
  sidebar_toggle: string;

  // Misc
  file_upload: string;
  scroll_bottom: string;
  user_menu: string;
  wiggle_controls: string;

  // Extensible
  [key: string]: string;
}

/** Extracted conversation turn. */
export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

/** Artifact with transient content attached (for extraction, not persisted in storage). */
export interface ExtractedArtifact extends ArtifactManifest {
  content: string;
}

/** Checkpoint stage for progress reporting. */
export type CheckpointStage =
  | 'extracting'
  | 'saving_artifacts'
  | 'generating_brief'
  | 'uploading_knowledge'
  | 'building_continuation'
  | 'opening_segment'
  | 'renaming';
