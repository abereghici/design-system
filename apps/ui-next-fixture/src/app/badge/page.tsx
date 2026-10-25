import { Badge } from "@platform/ui/badge";

export default function Page() {
  return (
    <main>
      <button type="button" aria-label="Inbox, 12 345 unread">
        Inbox{" "}
        <Badge locale="ro-RO" max={99_999}>
          {12_345}
        </Badge>
      </button>
    </main>
  );
}
