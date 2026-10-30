import { SkipLink } from "@abereghici/ui/skip-link";
import { VisuallyHidden } from "@abereghici/ui/visually-hidden";

export default function Page() {
  return (
    <>
      <SkipLink href="#main">Skip to main content</SkipLink>
      <main id="main" tabIndex={-1}>
        <VisuallyHidden asChild>
          <h1>Fixture</h1>
        </VisuallyHidden>
      </main>
    </>
  );
}
