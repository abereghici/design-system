import NextLink from "next/link";

import { Stepper } from "@abereghici/ui/stepper";

export default function Page() {
  return (
    <main>
      <Stepper.Root aria-label="Checkout">
        <Stepper.Step status="complete" completedLabel="Completed" asChild>
          <NextLink href="/">Account</NextLink>
        </Stepper.Step>
        <Stepper.Step status="current">Shipping</Stepper.Step>
        <Stepper.Step>Payment</Stepper.Step>
      </Stepper.Root>
    </main>
  );
}
