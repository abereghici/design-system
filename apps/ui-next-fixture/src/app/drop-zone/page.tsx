import { Button } from "@abereghici/ui/button";
import { DropZone } from "@abereghici/ui/drop-zone";
import { FileTrigger } from "@abereghici/ui/file-trigger";

export default function Page() {
  return (
    <main>
      <form>
        <DropZone name="files" accept=".csv" multiple>
          <span>Drop CSV files here, or</span>
          <FileTrigger>
            <Button>Choose files</Button>
          </FileTrigger>
        </DropZone>
        <button>Submit</button>
      </form>
    </main>
  );
}
