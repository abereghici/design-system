import NextLink from "next/link";

import { Pagination } from "@platform/ui/pagination";

export default function Page() {
  return (
    <main>
      <Pagination
        aria-label="Pagination"
        previousLabel="Previous page"
        nextLabel="Next page"
        page={2}
        count={12}
        getPageUrl={(page) => `/pagination?page=${page}`}
        linkComponent={NextLink}
      />
    </main>
  );
}
