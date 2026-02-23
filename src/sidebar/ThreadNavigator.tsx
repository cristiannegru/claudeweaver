// ============================================================
// ClaudeWeaver — Thread Navigator (Sidebar top 1/4)
// Lists threads + segments, shows status, handles navigation.
// Phase 5 implementation target.
// ============================================================

import React from 'react';

export function ThreadNavigator(): React.JSX.Element {
  // TODO Phase 5.1:
  // - Fetch thread state from background via GET_THREAD_STATE
  // - Display thread list with segment status badges
  // - Show interaction counter progress
  // - Click segment → send NAVIGATE_SEGMENT

  return (
    <div style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#8a8880' }}>
      <div style={{ color: '#c49a6c', fontWeight: 600, marginBottom: '0.5rem' }}>
        ClaudeWeaver
      </div>
      <div>No active thread</div>
    </div>
  );
}
