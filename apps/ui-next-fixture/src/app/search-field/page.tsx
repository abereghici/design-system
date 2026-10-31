import { SearchField } from "@abereghici/ui/search-field";

export default function Page() {
  return (
    <main>
      <search>
        <form>
          <SearchField
            label="Search invoices"
            name="q"
            defaultValue="march"
            clearLabel="Clear search"
          />
          <button>Submit</button>
        </form>
      </search>
    </main>
  );
}
