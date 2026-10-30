import NextLink from "next/link";

import { Link } from "@abereghici/ui/link";

export default function Page() {
  return (
    <main>
      <Link asChild>
        <NextLink href="/">Home</NextLink>
      </Link>
    </main>
  );
}
