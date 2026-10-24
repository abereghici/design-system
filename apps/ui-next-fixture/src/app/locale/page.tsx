import { roRO } from "@platform/ui/locales/ro-RO";
import { Provider } from "@platform/ui/provider";

import { ShowLocale } from "./show-locale.tsx";

export default function Page() {
  return (
    <Provider locale={roRO}>
      <ShowLocale />
    </Provider>
  );
}
