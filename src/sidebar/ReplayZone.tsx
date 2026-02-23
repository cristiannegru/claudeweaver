// ============================================================
// ClaudeWeaver — Replay Zone (Sidebar bottom 3/4)
// Shows checkpoint progress during generation, latest brief when idle.
// Read-only, no copy/paste, no interaction beyond scrolling.
// Phase 5 implementation target.
// ============================================================

import React from 'react';

export function ReplayZone(): React.JSX.Element {
  // TODO Phase 5.2:
  // - Listen for CHECKPOINT_PROGRESS messages → show stage labels
  // - When idle: display most recent brief (read-only)
  // - "Fast-played movie" replay animation is deferred polish

  return (
    <div
      style={{
        padding: '0.75rem',
        fontFamily: 'serif',
        fontSize: '0.85rem',
        color: '#8a8880',
        userSelect: 'none',
      }}
    >
      <div style={{ color: '#5c8ac4', fontFamily: 'monospace', fontSize: '0.72rem', marginBottom: '0.5rem' }}>
        REPLAY ZONE
      </div>
      <div>Waiting for first checkpoint…</div>
    </div>
  );
}
