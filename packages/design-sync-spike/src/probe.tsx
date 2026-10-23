import { createContext, use, useEffect, useRef, useState, version, type Ref } from "react";

const Label = createContext("unlabelled");

// React 19: `ref` is a plain prop on a function component. React 18 strips it.
// React's `Ref` holds a `RefObject`, whose `current` is mutable by design.
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types
function Target({ ref }: Readonly<{ ref: Ref<HTMLButtonElement> }>) {
  return <button ref={ref}>target</button>;
}

function Report() {
  // React 19: `use` reads a context. React 18 has no `use` export.
  const label = use(Label);
  const ref = useRef<HTMLButtonElement>(null);
  const [reached, setReached] = useState("nothing");

  useEffect(() => {
    setReached(ref.current?.localName ?? "nothing");
  }, []);

  return (
    <>
      <output>{`${label} on React ${version}, ref as a prop reached <${reached}>`}</output>
      <Target ref={ref} />
    </>
  );
}

/** A component that only renders on React 19: it uses `use`, `<Context>` as a provider and `ref` as a prop. */
export function Probe() {
  return (
    <Label value="Probe">
      <Report />
    </Label>
  );
}
