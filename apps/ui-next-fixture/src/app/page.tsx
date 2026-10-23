import { Button } from "@platform/ui/button";

// Imports one subpath. Nothing else from @platform/ui may enter the module graph
// (test/build-output.test.ts).
export default function Page() {
  return (
    <main>
      <Button>Save changes</Button>
    </main>
  );
}
