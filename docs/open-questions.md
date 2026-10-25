# Open questions

Decisions the design-system owner made for spec #1. On 2026-10-25 the owner accepted every recommendation below; each item records the decision and its status.

1. **Selected-state contrast, and approval of the phase 1–6 specs (#15, #22, #31, #40, #45, #49).** IconButton's selected state and SegmentedControl's indicator measure 1.08–2.03:1 against their surroundings. WCAG 2.2 SC 1.4.11 (Non-text Contrast) requires 3:1. Fixing it changes the reference visuals. Recommendation: always show the existing `border-selected` inset ring. Everything else left in the specs is a matter of taste. **Decided:** ring added (IconButton 13.40:1 / 15.07:1, SegmentedControl 11.16:1 / 13.23:1); specs approved as built.
2. **Italic fonts.** We currently ship roman files only, and browsers synthesize an oblique for italic text. Recommendation: ship the upstream Figtree and Noto Serif italic files. A browser downloads an `@font-face` file only when text using that face renders, so pages without italic text pay nothing. **Decided:** ship the italics.
3. **PasswordField eye icon.** The brand icon set has no `eye` or `eye-off` glyph, so the show/hide toggle has no icon. Recommendation: draft both in the set's stroke grammar for approval. **Decided:** draft them; the owner reviews the drawing.
4. **Screenshot baselines.** No baselines are committed yet. They are generated in the CI Playwright image (`mcr.microsoft.com/playwright:v1.64.1-noble`) and stored in Git LFS next to each component, in `src/<component>/__screenshots__/`. Choose where they come from:
   - generated locally in that image and committed (git-lfs is installed);
   - or created by the "Update screenshots" GitHub workflow.

   **Decided:** generate them locally in that image and commit them through Git LFS, once the story renames land.

5. **Manual screen-reader and device pass.** Only a person can do this check. It covers:
   - each component's VoiceOver and NVDA announcements;
   - ContextMenu's touch long press;
   - Toast pausing while the tab is hidden;
   - Toast's Option+T shortcut on macOS.

   Recommendation: one combined pass before the first release, with the results recorded in each spec's Accessibility section. **Decided:** the owner runs one combined pass before the first release.
