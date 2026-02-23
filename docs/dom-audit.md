# DOM Audit — Claude.ai UI Selectors

**Step 0.3** — Run on live claude.ai with DevTools open.
For each action, find the actual selector and record fragility level.

**Fragility levels:**
- `stable` — data-attribute or semantic class, unlikely to change
- `moderate` — class-based but descriptive (e.g. `.conversation-title`)
- `fragile` — structural/positional (e.g. `div > div:nth-child(2)`), will break on layout changes
- `dynamic` — generated class names (CSS modules / Tailwind JIT), needs regex or structural fallback

## Selectors to Map

### Conversation Elements

| Action | Speculative Selector | Actual Selector | Fragility | Notes |
|--------|---------------------|-----------------|-----------|-------|
| user_message | `[data-testid='user-message']` | | | |
| assistant_message | `[data-testid='assistant-message']` | | | |
| artifact_block | `[data-testid='artifact-block']` | | | Is content lazy-loaded? |
| conversation_title | `h1, [data-testid='conversation-title']` | | | What element holds the title? |
| conversation_container | (parent of all messages) | | | What does MutationObserver attach to? |

### Input & Send

| Action | Speculative Selector | Actual Selector | Fragility | Notes |
|--------|---------------------|-----------------|-----------|-------|
| input_field | `[contenteditable='true']` | | | Is it ProseMirror, Slate, or raw contenteditable? |
| send_button | `[data-testid='send-button']` | | | |

### Project Management

| Action | Speculative Selector | Actual Selector | Fragility | Notes |
|--------|---------------------|-----------------|-----------|-------|
| new_project_button | `[data-testid='new-project']` | | | Where in the UI flow? |
| project_name_input | `[data-testid='project-name-input']` | | | Modal? Inline? |
| move_to_project | `[data-testid='move-conversation']` | | | Menu item? How to trigger? |
| rename_conversation | `[data-testid='rename-conversation']` | | | Click title to edit? |
| new_conversation_button | `[data-testid='new-conversation']` | | | Inside project view? |

### Model Picker

| Action | Speculative Selector | Actual Selector | Fragility | Notes |
|--------|---------------------|-----------------|-----------|-------|
| model_picker | `[data-testid='model-picker']` | | | Dropdown? How to select Sonnet? |

### Knowledge Upload

| Action | Speculative Selector | Actual Selector | Fragility | Notes |
|--------|---------------------|-----------------|-----------|-------|
| knowledge_upload_button | `[data-testid='knowledge-upload']` | | | Native file picker or custom? |

## Verification Script

Paste this in the browser console on a live Claude conversation to test selectors.
Update the selectors object with your findings first.

```js
const selectors = {
  user_message: "[data-testid='user-message']",
  assistant_message: "[data-testid='assistant-message']",
  artifact_block: "[data-testid='artifact-block']",
  input_field: "[contenteditable='true']",
  send_button: "[data-testid='send-button']",
  conversation_title: "h1",
  // ... add your discovered selectors
};

for (const [action, selector] of Object.entries(selectors)) {
  const els = document.querySelectorAll(selector);
  console.log(`${action}: ${els.length} match(es)`, els.length > 0 ? '✅' : '❌', selector);
}
```

## Input Field Investigation

The input field is the highest-risk automation point. Determine:

1. **Framework:** Is it ProseMirror, Slate, Lexical, or raw contenteditable?
   - Check: `document.querySelector('[contenteditable]').__lexicalEditor` or similar
   - Check: Look for `.ProseMirror` class on the editor
   - Check: Look for `data-slate-editor` attribute

2. **Event dispatch:** What events does the framework listen to?
   - Try: `execCommand('insertText', false, 'test')` — does text appear?
   - Try: Dispatch `InputEvent` with `inputType: 'insertText'`
   - Try: Direct `textContent` manipulation + `input` event

3. **Send trigger:** After text is in the field, how is send triggered?
   - Button click?
   - Enter key?
   - Does the framework need to "see" the input before send enables?

Record findings here:
- Framework: ___
- Working injection method: ___
- Send trigger: ___
