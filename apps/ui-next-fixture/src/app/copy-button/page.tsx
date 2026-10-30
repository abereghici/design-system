import { CopyButton } from "@abereghici/ui/copy-button";

export default function Page() {
  return (
    <main>
      <CopyButton value="INV-2026-0042" copiedLabel="Copied" failedLabel="Copying failed">
        Copy invoice number
      </CopyButton>
    </main>
  );
}
