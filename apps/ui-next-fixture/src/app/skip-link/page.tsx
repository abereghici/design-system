import { SkipLink } from "@platform/ui/skip-link";
import { VisuallyHidden } from "@platform/ui/visually-hidden";

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
