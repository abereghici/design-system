import type { ReactNode } from "react";

import { getDirection } from "@platform/ui/direction";
import { Provider } from "@platform/ui/provider";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir={getDirection("en")}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
