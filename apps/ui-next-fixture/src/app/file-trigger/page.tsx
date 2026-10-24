import { Button } from "@platform/ui/button";
import { FileTrigger } from "@platform/ui/file-trigger";

export default function Page() {
  return (
    <main>
      <FileTrigger accept="image/png" name="avatar">
        <Button>Choose image</Button>
      </FileTrigger>
    </main>
  );
}
