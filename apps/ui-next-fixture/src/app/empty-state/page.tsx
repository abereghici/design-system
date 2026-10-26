import { EmptyState } from "@platform/ui/empty-state";
import { FilesIcon } from "@platform/ui/icons/files";

export default function Page() {
  return (
    <main>
      <EmptyState.Root>
        <EmptyState.Indicator>
          <FilesIcon />
        </EmptyState.Indicator>
        <EmptyState.Title>No files yet</EmptyState.Title>
      </EmptyState.Root>
    </main>
  );
}
