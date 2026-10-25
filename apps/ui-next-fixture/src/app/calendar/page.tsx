import { Calendar } from "@platform/ui/calendar";

export default function Page() {
  return (
    <main>
      <Calendar
        aria-label="Delivery date"
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
      />
    </main>
  );
}
