import { createContext, use } from "react";

export const LocaleContext = createContext<string | undefined>(undefined);

/** The app's BCP 47 tag from UIProvider; `undefined` lets `Intl` use the runtime's default. */
export const useLocale = () => use(LocaleContext);
