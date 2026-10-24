# Built-in labels: who names an element, and where the strings live

Question: (1) Does a built-in `aria-label` override a name the consumer gives an element from outside (`<label for>`, `aria-labelledby`, Field.Label)? (2) How should locales and components depend on each other while keeping per-component tree-shaking?

## Sources

### Name precedence

- **accname 1.2** (https://www.w3.org/TR/accname-1.2/). The steps are tried in order, and each one starts with "Otherwise". 2.2 LabelledBy: "if the current node has an aria-labelledby attribute that contains at least one valid IDREF". 2.4 AriaLabel: "if the current node … has an aria-label attribute whose value is not undefined". 2.5 Host Language Label: "if the current node's native markup provides an attribute (e.g. alt) or element".
- **HTML-AAM §4.1.1, text inputs** (https://w3c.github.io/html-aam/): "If the control has an aria-label or an aria-labelledby attribute the accessible name is to be calculated using the algorithm defined in Accessible Name and Description … If the accessible name is still empty: use the text equivalent computation of the associated label element's subtree - if more than one label is associated; concatenate their subtrees by DOM order".
- **APG, Providing Accessible Names** (https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/):
  - on `aria-label` with a native label: "then that becomes the accessible name, overriding the label element";
  - on `aria-labelledby`: "It has the highest precedence when browsers calculate accessible names";
  - the cardinal rules include "Prefer Visible Text" and "Prefer Native Techniques".
- **WCAG 2.5.3 Label in Name** (https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html): "For user interface components with labels that include text or images of text, the name contains the text that is presented visually."

### What the libraries do (source read at the versions shown)

- **React Aria 3.53.1** (`react-aria/dist/private`):
  - `useBreadcrumbs` uses `'aria-label': ariaLabel || strings.format('breadcrumbs')`, so a built-in name that a consumer prop overrides.
  - `useNumberField` names the steppers `stringFormatter.format('increase', {fieldLabel})`, and en-US is `` `Increase ${args.fieldLabel}` ``.
  - `useDialog` has no built-in name, and warns "A dialog must have a title for accessibility".
  - `useLabel` warns "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute".
  - Each hook imports an `intlStrings` module that statically imports every language. `numberfield/intlStrings.mjs` has 34 imports, so a component ships every locale. The docs say "React Aria includes localized strings for 30+ languages" (https://react-aria.adobe.com/quality).
- **React Spectrum 3.47.7** has a built-in Dialog dismiss button name, `stringFormatter.format('dismiss')`. `ProgressCircle` has no built-in name: "ProgressCircle requires an aria-label or aria-labelledby attribute".
- **MUI 9.5.0**:
  - The en-US defaults are written inline in each component (`Alert`: `closeText = 'Close'`), and `locale/enUS.mjs` is a commented-out object.
  - Other locales are pure data (`roRO.components.MuiPagination.defaultProps`), typed by `Localization`, which picks from component prop types. Every key is optional, so a missing translation isn't a type error.
- **Ant Design 6.6.7**:
  - `locale/en_US.js` imports `../calendar/locale/en_US` and `../date-picker/locale/en_US` (locale → component).
  - `useLocale(componentName, defaultLocale)` imports the whole `en_US` as its fallback, so every component ships every en-US string.
  - The `Locale` interface imports component types, and every key is optional.
- **Base UI 1.9.0** has no locale system. Strings are hardcoded and overridden by spread props (`'aria-label': isIncrement ? 'Increase' : 'Decrease'`, toast viewport `'aria-label': 'Notifications'`).
- **Mantine 9.7.3** has per-instance `labels`/`*Label` props with English defaults, and skips the default when it is labelled: `"aria-label": comboboxLabelId ? void 0 : others["aria-label"]`.
- **Carbon 1.119.0** has a per-instance `translateWithId` over component-local `defaultTranslations`.
- **Chakra 3.37.0** has hardcoded `"Close"` and `"breadcrumb"`.
- **Fluent** (`@fluentui/react-dialog` 9.18.6) ships no built-in names.

### Tree-shaking

- **esbuild**: "Within esbuild, this term specifically refers to declaration-level dead code removal" (https://esbuild.github.io/api/#tree-shaking).
- **Turbopack, Next 16.4.3** (`next/dist/docs/01-app/03-api-reference/08-turbopack.md`):
  - `turbopackRemoveUnusedExports`, "Enable removing unused exports", is `true` for build.
  - `turbopackModuleFragments`, "This splits modules into fragments and chunks only import the used fragments of the modules", is `false`.
- **oxlint `import/max-dependencies`** counts `import` declarations, not `export … from`. Observed: 12 re-exports pass, while 11 imports fail with "File has too many dependencies (11)".

## Experiment: one en-US module with named exports per namespace

- **esbuild 0.28.2 and Rolldown 1.2.15.** Bundling `spinner`, `skip-link`, `alert`, `dialog` and `toaster` kept only each one's own strings.
- **Turbopack.** The fixture's alert route shipped the en-US module with every namespace, including `dialog:"Command palette"`, and the route test failed.
- **Why Turbopack fails.** It removes an export only when no route in the app uses it. The module is then emitted whole, so every namespace used anywhere ships on every route that touches the module. Fragments, which would split the module, are off.

So the split must be by module: one module per namespace.

## Audit: every built-in string

| Namespace.key                                                                                                    | Lands on                                                 | Can a consumer name it from outside?                                                                                                  | Result           | Decision                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| alert.close, dialog.close, sheet.close, popover.close                                                            | `aria-label` on the icon-only Close `<button>`           | `aria-label` prop (spread after) or `aria-labelledby` (2.2 wins). The `asChild` path sets none, so the child's text names it (2.5.3). | Consumer wins    | Stay built-in (Spectrum `dismiss`, MUI `closeText`, Chakra)                                                                    |
| breadcrumbs.root                                                                                                 | `aria-label` on `<nav>`                                  | `aria-label` (spread after) or `aria-labelledby` (wins). Not labelable by `<label>`.                                                  | Consumer wins    | Stay built-in (React Aria `useBreadcrumbs`)                                                                                    |
| pagination.root / previous / next                                                                                | `aria-label` on `<nav>` / IconButtons                    | Same for the nav. The links are internal.                                                                                             | Consumer wins    | Stay built-in (MUI `MuiPagination` `aria-label`)                                                                               |
| spinner.loading                                                                                                  | `aria-label` on `role="status"` `<span>`                 | `aria-label` (spread after) or `aria-labelledby` (wins).                                                                              | Consumer wins    | Stay built-in. Spectrum requires a name instead; the default keeps a bare Spinner named (Button renders it `aria-hidden`).     |
| toaster.region / close                                                                                           | `aria-label` on the region `<section>` / the toast Close | `labels.region`; `aria-labelledby` wins                                                                                               | Consumer wins    | Stay built-in (Base UI `'Notifications'`)                                                                                      |
| command.dialog                                                                                                   | `aria-label` on the `<dialog>`                           | `aria-label` (spread after) or `aria-labelledby` to a title (wins)                                                                    | Consumer wins    | Stay built-in                                                                                                                  |
| **command.search**                                                                                               | `aria-label` on the `<input role="combobox">`            | **`<label for=id>`: HTML-AAM step 1 takes `aria-label` first, so the external label was silently ignored (proved red)**               | **Built-in won** | **Skipped when the consumer passes `id`.** `aria-labelledby` already wins. Precedent: Mantine skips its default when labelled. |
| numberField.increment / decrement, passwordField.show, datePicker.chooseDate, calendar.previousMonth / nextMonth | `aria-label` on internal IconButtons                     | No: the consumer doesn't render them. The field's own name comes from Field.Label.                                                    | n/a              | Stay built-in (Base UI `'Increase'`; React Aria adds the field label, a possible follow-up)                                    |
| kbd.*                                                                                                            | VisuallyHidden text                                      | It is content, not a name                                                                                                             | n/a              | Stay built-in                                                                                                                  |
| skipLink.label, combobox.noResults, command.placeholder / empty / navigate / open / close, dateField.*           | Visible text, placeholder or error                       | `children` / `labels` replace it                                                                                                      | n/a              | Stay built-in                                                                                                                  |

Elements a consumer names (TextField, Select, Progress, Meter, Navbar, Toolbar…) already have no built-in name: their types require `label`, `aria-label` or `aria-labelledby`.

## Decision

1. **Labelling.** Built-in names stay only on elements the component owns, or where `aria-labelledby` and a consumer `aria-label` still win. Command.Input drops its built-in `aria-label` when the consumer passes an `id`, so an external `<label for>` names it.
2. **Strings.** Dependencies run one way: components → locale data.
   - **Per-namespace en-US.** `src/provider/locales/en-US/<namespace>.ts` holds the en-US default, one module per namespace. Turbopack needs the module boundary.
   - **Barrel.** `en-US/index.ts` re-exports them.
   - **Composite.** `en-US.ts` is `{ tag, labels: { ...labels } }` over one namespace import. The spread makes it a plain object, which Server → Client props require.
   - **Type.** `Labels` is derived from `enUS`, so `roRO: Locale` missing a key is a type error.
   - **Component fallback.** Components import their own namespace module as the fallback. Server Components keep `locale` and `labels` props, and need no context.
   - **No lint override.** The `import/max-dependencies` override is gone.
   - **Rejected alternatives.** The MUI shape duplicates every default (drift). Ant Design's ships every string everywhere. React Aria's ships every language.
