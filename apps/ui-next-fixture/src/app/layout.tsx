import type { ReactNode } from "react";

import { getDirection } from "@platform/ui/direction";
import { UIProvider } from "@platform/ui/ui-provider";

const lang = "ro-RO";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={lang} dir={getDirection(lang)}>
      <body>
        <UIProvider locale={lang}>{children}</UIProvider>
      </body>
    </html>
  );
}
