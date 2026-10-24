import { Badge } from "@platform/ui/badge";
import { roRO } from "@platform/ui/locales/ro-RO";

export default function Page() {
  return (
    <main>
      <button type="button" aria-label="Inbox, 12 345 unread">
        Inbox{" "}
        <Badge locale={roRO} max={99_999}>
          {12_345}
        </Badge>
      </button>
    </main>
  );
}
