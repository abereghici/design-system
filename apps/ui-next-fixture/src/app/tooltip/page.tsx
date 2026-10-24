import { IconButton } from "@platform/ui/icon-button";
import { CopyIcon } from "@platform/ui/icons/copy";
import { Tooltip } from "@platform/ui/tooltip";

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
