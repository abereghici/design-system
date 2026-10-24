import { IconButton } from "@platform/ui/icon-button";
import { CopyIcon } from "@platform/ui/icons/copy";
import { DownloadIcon } from "@platform/ui/icons/download";
import { PinIcon } from "@platform/ui/icons/pin";
import { Toolbar } from "@platform/ui/toolbar";

export default function Page() {
  return (
    <main>
      <Toolbar aria-label="Report">
        <IconButton aria-label="Pin">
          <PinIcon />
        </IconButton>
        <IconButton aria-label="Copy link">
          <CopyIcon />
        </IconButton>
        <IconButton aria-label="Download">
          <DownloadIcon />
        </IconButton>
      </Toolbar>
    </main>
  );
}
