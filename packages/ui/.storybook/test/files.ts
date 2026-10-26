/** Stands in for the system file picker, which no test can reach: sets the files on the native input. */
export function pick(root: HTMLElement, ...files: File[]) {
  const input = root.querySelector<HTMLInputElement>("input[type=file]");

  if (input === null) throw new Error("No file input");

  const transfer = new DataTransfer();

  for (const file of files) transfer.items.add(file);

  input.files = transfer.files;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
