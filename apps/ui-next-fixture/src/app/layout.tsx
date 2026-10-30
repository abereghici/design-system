import type { ReactNode } from "react";

import type { Metadata } from "next";

import { getDirection } from "@abereghici/ui/direction";
import { UIProvider } from "@abereghici/ui/ui-provider";

const lang = "ro-RO";

export const metadata: Metadata = { other: { "text-scale": "scale" } };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={lang} dir={getDirection(lang)}>
      <body>
        <UIProvider locale={lang}>{children}</UIProvider>
      </body>
    </html>
  );
}
