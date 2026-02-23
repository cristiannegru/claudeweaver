// ============================================================
// ClaudeWeaver — Sidebar Platform Adapter
// Handles Firefox sidebar_action vs Chrome side_panel API delta.
// ============================================================

declare const __PLATFORM__: 'firefox' | 'chrome';

/**
 * Open the extension sidebar.
 * Firefox: browser.sidebarAction (always available)
 * Chrome: chrome.sidePanel.open (Chrome 114+)
 */
export async function openSidebar(): Promise<void> {
  if (__PLATFORM__ === 'firefox') {
    // Firefox: sidebar_action is declared in manifest, opens automatically
    // or can be toggled via browser.sidebarAction.toggle() (Fx 57+)
    // Note: toggle() is not available in all contexts
    console.log('[ClaudeWeaver] Firefox sidebar — toggle via browser.sidebarAction');
  } else {
    // Chrome: side_panel API
    try {
      // @ts-expect-error — chrome.sidePanel types may not be in polyfill
      await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
    } catch (err) {
      console.warn('[ClaudeWeaver] Could not open side panel:', err);
    }
  }
}
