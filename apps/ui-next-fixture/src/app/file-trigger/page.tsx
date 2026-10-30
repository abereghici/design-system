import { Button } from "@abereghici/ui/button";
import { FileTrigger } from "@abereghici/ui/file-trigger";

export default function Page() {
  return (
    <main>
      <form>
        <FileTrigger accept="image/png" name="avatar">
          <Button>Choose image</Button>
        </FileTrigger>
        <button>Submit</button>
      </form>
    </main>
  );
}
