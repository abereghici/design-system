import { Button } from "@abereghici/ui/button";
import { FileTrigger } from "@abereghici/ui/file-trigger";

export default function Page() {
  return (
    <main>
      <FileTrigger accept="image/png" name="avatar">
        <Button>Choose image</Button>
      </FileTrigger>
    </main>
  );
}
