import { expect } from "storybook/test";

import { Link } from "@abereghici/ui/link";

import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Stepper from "./stepper.tsx";

const meta = preview.meta({
  title: "Components/Stepper",
  component: Stepper.Root,
  subcomponents: partsOf(Stepper),
  args: {
    "aria-label": "Checkout",
    children: (
      <>
        <Stepper.Step status="complete" completedLabel="Completed">
          Account
        </Stepper.Step>
        <Stepper.Step status="current">Shipping</Stepper.Step>
        <Stepper.Step>Payment</Stepper.Step>
        <Stepper.Step>Review</Stepper.Step>
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test("announces the current step and each completed step", async ({ canvas }) => {
  const [account, shipping, payment] = canvas.getAllByRole("listitem");

  await expect(canvas.getByRole("listitem", { current: "step" })).toBe(shipping);
  await expect(account).toHaveTextContent("Account Completed");
  await expect(payment).toHaveTextContent(/^Payment$/v);
});

export const Linked = meta.story({
  args: {
    orientation: "vertical",
    children: (
      <>
        <Stepper.Step status="complete" completedLabel="Completed" asChild>
          <Link href="#account">Account</Link>
        </Stepper.Step>
        <Stepper.Step status="complete" completedLabel="Completed" asChild>
          <Link href="#shipping">Shipping</Link>
        </Stepper.Step>
        <Stepper.Step status="current">Payment</Stepper.Step>
        <Stepper.Step>Review</Stepper.Step>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Completed steps link back with `asChild`, stacked vertically as in a sidebar.",
      },
    },
  },
});

Linked.test("names each completed step's link with its completed label", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "Shipping Completed" })).toHaveAttribute(
    "href",
    "#shipping",
  );
  await expect(canvas.getByRole("listitem", { current: "step" })).toHaveTextContent("Payment");
});
