import { ScrollArea } from "@platform/ui/scroll-area";

export default function Page() {
  return (
    <main>
      <ScrollArea asChild>
        <section aria-label="Terms">
          <p>These terms apply to every workspace on the plan.</p>
        </section>
      </ScrollArea>
    </main>
  );
}
