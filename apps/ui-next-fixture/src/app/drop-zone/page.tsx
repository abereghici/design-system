import { Button } from "@platform/ui/button";
import { DropZone } from "@platform/ui/drop-zone";
import { FileTrigger } from "@platform/ui/file-trigger";

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
