import { Slider } from "@abereghici/ui/slider";

export default function Page() {
  return (
    <main>
      <form>
        <Slider.Root name="volume" defaultValue={40}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb aria-label="Volume" />
          </Slider.Track>
          <Slider.Value />
        </Slider.Root>
        <button>Submit</button>
      </form>
    </main>
  );
}
