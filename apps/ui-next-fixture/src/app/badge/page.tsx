import { Badge } from "@platform/ui/badge";

export default function Page() {
  return (
    <main>
      <button type="button" aria-label="Inbox, 1280 unread">
        Inbox{" "}
        <Badge locale="de" max={9999}>
          {1280}
        </Badge>
      </button>
    </main>
  );
}
