export type ToastVariant = "neutral" | "success" | "warning" | "danger";

export interface ToastOptions {
  /** Names the outcome ("Moved to Archive", not "Success"). */
  readonly title: string;
  readonly description?: string | undefined;
  /** Sets the icon, the duration and the announcement (danger is assertive). */
  readonly variant?: ToastVariant | undefined;
  /** Runs `onClick`, then closes the toast. `shortcut` uses Kbd's `keys` grammar (`"mod+z"`). */
  readonly action?:
    | { readonly label: string; readonly shortcut?: string; readonly onClick: () => void }
    | undefined;
  /** Milliseconds before it closes; `Infinity` keeps it. Defaults to the `toast-duration` tokens. */
  readonly duration?: number | undefined;
}

export interface ToastRecord extends ToastOptions {
  readonly id: string;
  readonly exiting: boolean;
  readonly remaining?: number;
  readonly shown?: boolean;
  readonly announced?: boolean;
}

type Progress = Partial<Pick<ToastRecord, "remaining" | "shown" | "announced">>;

let toasts: readonly ToastRecord[] = [];
const listeners = new Set<() => void>();

const emit = (next: readonly ToastRecord[]) => {
  toasts = next;
  for (const listener of listeners) listener();
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const snapshot = () => toasts;

/** Records what must survive a remount of the Toaster without re-rendering it. */
export const mark = (id: string, progress: Progress) => {
  const record = toasts.find((entry) => entry.id === id);
  if (record !== undefined) Object.assign(record, progress);
};

export const remove = (id: string) => {
  if (toasts.some((record) => record.id === id)) emit(toasts.filter((record) => record.id !== id));
};

export const close = (id: string) => {
  if (toasts.some((record) => record.id === id && !record.exiting)) {
    emit(toasts.map((record) => (record.id === id ? { ...record, exiting: true } : record)));
  }
};

function add(options: ToastOptions): string {
  if (typeof document === "undefined") return "";
  const id = crypto.randomUUID();
  emit([{ ...options, id, exiting: false }, ...toasts]);
  return id;
}

/** Shows a toast in the app's Toaster and returns its id. Does nothing on the server. */
export const toast = Object.assign(add, {
  /** Closes that toast as if it timed out. */
  dismiss: (id: string): void => {
    close(id);
  },
});
