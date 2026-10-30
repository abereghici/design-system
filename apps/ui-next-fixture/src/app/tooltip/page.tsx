import { IconButton } from "@abereghici/ui/icon-button";
import { CopyIcon } from "@abereghici/ui/icons/copy";
import { Tooltip } from "@abereghici/ui/tooltip";

export default function Page() {
  return (
    <main>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <IconButton aria-label="Copy link">
            <CopyIcon />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Content>Copy link</Tooltip.Content>
      </Tooltip.Root>
    </main>
  );
}
