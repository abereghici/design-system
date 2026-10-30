import { EmptyState } from "@abereghici/ui/empty-state";
import { FilesIcon } from "@abereghici/ui/icons/files";

export default function Page() {
  return (
    <main>
      <EmptyState.Root>
        <EmptyState.Media>
          <FilesIcon />
        </EmptyState.Media>
        <EmptyState.Title>No files yet</EmptyState.Title>
      </EmptyState.Root>
    </main>
  );
}
