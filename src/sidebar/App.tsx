// ============================================================
// ClaudeWeaver — Sidebar App
// Top 1/4: Thread navigator. Bottom 3/4: Replay zone.
// Phase 5 implementation target.
// ============================================================

import React from 'react';
import { ThreadNavigator } from './ThreadNavigator';
import { ReplayZone } from './ReplayZone';

export function App(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: '0 0 25%', overflow: 'auto', borderBottom: '1px solid #3a3a42' }}>
        <ThreadNavigator />
      </div>
      <div style={{ flex: '1', overflow: 'auto' }}>
        <ReplayZone />
      </div>
    </div>
  );
}
