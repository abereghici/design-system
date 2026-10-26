import { Slider } from "@platform/ui/slider";

export default function Page() {
  return (
    <main>
      <Slider.Root defaultValue={40}>
        <Slider.Track>
          <Slider.Range />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
        <Slider.Value />
      </Slider.Root>
    </main>
  );
}
