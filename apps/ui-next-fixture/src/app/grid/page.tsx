import { Grid } from "@abereghici/ui/grid";

export default function Page() {
  return (
    <main>
      <Grid.Root min="container-xs" asChild>
        <ul>
          <li>Revenue</li>
          <li>Orders</li>
        </ul>
      </Grid.Root>
    </main>
  );
}
