import { roRO } from "@platform/ui/locales/ro-RO";
import { UIProvider } from "@platform/ui/provider";

import { ShowLocale } from "./show-locale.tsx";

export default function Page() {
  return (
    <UIProvider locale={roRO}>
      <ShowLocale />
    </UIProvider>
  );
}
