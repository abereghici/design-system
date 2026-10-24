import type { Locale } from "../locale.tsx";

export const enUS: Locale = {
  tag: "en-US",
  labels: {
    alert: { close: "Dismiss" },
    spinner: { loading: "Loading" },
    kbd: {
      command: "Command",
      control: "Control",
      shift: "Shift",
      option: "Option",
      enter: "Enter",
      backspace: "Backspace",
      arrowUp: "Up arrow",
      arrowDown: "Down arrow",
      arrowLeft: "Left arrow",
      arrowRight: "Right arrow",
    },
    skipLink: { label: "Skip to main content" },
    passwordField: { show: "Show password" },
    numberField: { increment: "Increase", decrement: "Decrease" },
    breadcrumbs: { root: "Breadcrumb" },
    pagination: { root: "Pagination", previous: "Previous page", next: "Next page" },
    toast: { close: "Dismiss" },
    toaster: { region: "Notifications" },
    dateField: {
      dayPlaceholder: "dd",
      monthPlaceholder: "mm",
      yearPlaceholder: "yyyy",
      empty: "Empty",
      incomplete: "Enter a complete date",
      unavailable: "This date is not available",
    },
  },
};
