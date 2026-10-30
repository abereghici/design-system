import NextLink from "next/link";

import { Navbar } from "@abereghici/ui/navbar";

export default function Page() {
  return (
    <header>
      <Navbar.Root aria-label="Main">
        <Navbar.Item>
          <Navbar.Link href="/navbar" aria-current="page">
            Navbar
          </Navbar.Link>
        </Navbar.Item>
        <Navbar.Item>
          <Navbar.Link asChild>
            <NextLink href="/">Home</NextLink>
          </Navbar.Link>
        </Navbar.Item>
      </Navbar.Root>
    </header>
  );
}
