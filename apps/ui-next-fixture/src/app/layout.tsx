import type { ReactNode } from "react";

import { getDirection } from "@platform/ui/direction";
import { UIProvider } from "@platform/ui/ui-provider";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir={getDirection("en")}>
      <body>
        <UIProvider>{children}</UIProvider>
      </body>
    </html>
  );
}
