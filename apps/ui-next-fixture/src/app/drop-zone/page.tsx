import { Button } from "@abereghici/ui/button";
import { DropZone } from "@abereghici/ui/drop-zone";
import { FileTrigger } from "@abereghici/ui/file-trigger";

export default function Page() {
  return (
    <main>
      <DropZone name="files" accept=".csv" multiple>
        <span>Drop CSV files here, or</span>
        <FileTrigger>
          <Button>Choose files</Button>
        </FileTrigger>
      </DropZone>
    </main>
  );
}
