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
}

interface Progress {
  readonly remaining?: number;
  readonly shown?: boolean;
  readonly announced?: boolean;
}

let toasts: readonly ToastRecord[] = [];
const progress = new Map<string, Progress>();
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

/** What must survive a remount of the Toaster without re-rendering it, kept out of the snapshot. */
export const progressOf = (id: string): Progress => progress.get(id) ?? {};

export const mark = (id: string, next: Progress) => {
  progress.set(id, { ...progressOf(id), ...next });
};

export const remove = (id: string) => {
  progress.delete(id);

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

/**
 * Shows a brief, non-blocking confirmation of something the user just did, such as "Link copied", in
 * the app's Toaster, and returns its id. It is announced without taking focus and leaves on its own,
 * so it must never be the only place information or an action lives. Show errors that need action inline
 * with an Alert or Field error, and a decision that must interrupt with an AlertDialog. Does nothing
 * on the server.
 */
export const toast = Object.assign(add, {
  /** Closes that toast as if it timed out. */
  dismiss: (id: string): void => {
    close(id);
  },
});
