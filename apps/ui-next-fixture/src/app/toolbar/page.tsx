import { IconButton } from "@abereghici/ui/icon-button";
import { CopyIcon } from "@abereghici/ui/icons/copy";
import { DownloadIcon } from "@abereghici/ui/icons/download";
import { PinIcon } from "@abereghici/ui/icons/pin";
import { Toolbar } from "@abereghici/ui/toolbar";

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
