// ============================================================
// ClaudeWeaver — Background Service Worker
// Thread state machine, checkpoint orchestrator, message hub.
// Phases 1–5 progressive implementation.
// ============================================================

import { onMessage, sendToTab } from '@shared/messages';
import type { Message } from '@shared/messages';
import {
  getThread,
  getSegmentsByThread,
  getActiveThreadId,
  getSettings,
} from '@shared/storage';
import type { CheckpointStage } from '@shared/types';

console.log('[ClaudeWeaver] Background service worker started');

// ------- Message router -------

onMessage(async (msg, sender) => {
  switch (msg.type) {
    case 'INTERACTION_DETECTED':
      console.log(`[ClaudeWeaver] Interaction ${msg.count} on segment ${msg.segmentId}`);
      break;

    case 'SPLIT_TRIGGERED':
      console.log(`[ClaudeWeaver] Split triggered for segment ${msg.segmentId}`);
      // TODO Phase 4.3: Run full checkpoint orchestration
      await runCheckpoint(msg.segmentId);
      break;

    case 'MANUAL_CHECKPOINT':
      console.log('[ClaudeWeaver] Manual checkpoint requested');
      // TODO Phase 4.3: Get active segment, run checkpoint
      break;

    case 'GET_THREAD_STATE': {
      const threadId = await getActiveThreadId();
      if (!threadId) return { type: 'THREAD_STATE', thread: null, segments: [] };
      const thread = await getThread(threadId);
      const segments = thread ? await getSegmentsByThread(threadId) : [];
      return { type: 'THREAD_STATE', thread, segments };
    }

    case 'TITLE_DETECTED':
      console.log(`[ClaudeWeaver] Title detected: ${msg.title}`);
      // TODO Phase 2: Update segment display_name
      break;

    default:
      break;
  }
});

// ------- Checkpoint orchestrator -------

async function runCheckpoint(segmentId: string): Promise<void> {
  // TODO Phase 4.3: Full 9-step checkpoint sequence
  // 1. Create project (if first checkpoint)
  // 2. Extract conversation text + artifacts
  // 3. Save artifacts to local disk
  // 4. Generate brief (Option C)
  // 5. Upload to Project Knowledge
  // 6. Build continuation prompt
  // 7. Open new segment
  // 8. Inject continuation prompt
  // 9. Rename + finalize

  const stages: CheckpointStage[] = [
    'extracting',
    'saving_artifacts',
    'generating_brief',
    'uploading_knowledge',
    'building_continuation',
    'opening_segment',
    'renaming',
  ];

  console.log(`[ClaudeWeaver] Checkpoint stub — would run ${stages.length} stages for segment ${segmentId}`);
}

// ------- MV3 service worker lifecycle -------
// Chrome can kill the service worker at any time.
// Each checkpoint stage must persist progress to storage
// so it can resume if the worker restarts mid-checkpoint.
// TODO Phase 5.3: Implement checkpoint resume logic.
