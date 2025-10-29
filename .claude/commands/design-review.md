---
allowed-tools: Grep, LS, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, BashOutput, KillShell, mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__navigate_page_history, mcp__chrome-devtools__list_pages, mcp__chrome-devtools__select_page, mcp__chrome-devtools__new_page, mcp__chrome-devtools__close_page, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__click, mcp__chrome-devtools__fill, mcp__chrome-devtools__fill_form, mcp__chrome-devtools__hover, mcp__chrome-devtools__drag, mcp__chrome-devtools__wait_for, mcp__chrome-devtools__resize_page, mcp__chrome-devtools__list_console_messages, mcp__chrome-devtools__list_network_requests, mcp__chrome-devtools__get_network_request, mcp__chrome-devtools__handle_dialog, mcp__chrome-devtools__evaluate_script, mcp__chrome-devtools__upload_file, mcp__chrome-devtools__emulate_network, mcp__chrome-devtools__emulate_cpu, mcp__chrome-devtools__performance_start_trace, mcp__chrome-devtools__performance_stop_trace, mcp__chrome-devtools__performance_analyze_insight, Bash, Glob
description: Complete a design review of the pending changes on the current branch
---

# Design Review Workflow

You are conducting a comprehensive design review of UI changes on the current branch.

## Review Process

### 1. Understand the Changes
- Use `git diff` and `git status` to identify modified files
- Read changed component files to understand what was updated
- Focus on UI components, styles, and user-facing changes

### 2. Start the Development Server
- Check if the dev server is running
- If not, start it (typically `bun dev` or `npm run dev`)
- Note the local URL (e.g., http://localhost:5173)

### 3. Navigate to Changed Pages
- Use Chrome DevTools MCP to navigate to the application
- Identify pages/routes affected by the changes
- Navigate to each affected page

### 4. Design Evaluation Checklist

Evaluate against the design principles in `/context/design-principles.md`:

#### Visual Consistency
- [ ] Colors match design system (check against brand palette)
- [ ] Typography is consistent (font families, sizes, weights)
- [ ] Spacing follows a consistent scale (e.g., 4px/8px grid)
- [ ] Component styling matches existing patterns
- [ ] Icons are consistently sized and styled

#### Layout & Responsiveness
- [ ] Test at multiple viewport sizes (mobile: 375px, tablet: 768px, desktop: 1440px)
- [ ] Content is readable at all breakpoints
- [ ] No horizontal scrolling on small screens
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Layout doesn't break at intermediate sizes

#### Interaction & Accessibility
- [ ] All interactive elements respond to hover/focus/active states
- [ ] Loading states are shown for async operations
- [ ] Error states are handled gracefully
- [ ] Forms have proper validation feedback
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Interactive elements are keyboard accessible

#### Performance & Quality
- [ ] No console errors or warnings
- [ ] Images are optimized and load quickly
- [ ] Animations are smooth (60fps target)
- [ ] No layout shift during page load
- [ ] Network requests are efficient

#### UX & Functionality
- [ ] User flows are intuitive and complete
- [ ] Feedback is provided for all user actions
- [ ] Empty states are handled appropriately
- [ ] Error messages are helpful and actionable
- [ ] Navigation is clear and consistent

### 5. Capture Evidence
- Take screenshots of key states (desktop & mobile)
- Capture any visual issues or inconsistencies
- Screenshot console errors if present
- Document any accessibility issues

### 6. Generate Report
Create a comprehensive design review report including:
- **Summary**: Overall assessment and key findings
- **Visual Issues**: Screenshots and descriptions of visual problems
- **Accessibility Concerns**: Contrast issues, keyboard nav problems, etc.
- **Performance Notes**: Console errors, slow loads, network issues
- **Recommendations**: Specific actionable improvements
- **Approval Status**: Pass/Needs Revision/Fail with reasoning

## Example Usage

```
/design-review
```

After running, you'll receive a detailed report on the UI changes' design quality.
