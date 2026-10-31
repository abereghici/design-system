import { DateRangePicker } from "@abereghici/ui/date-range-picker";
import { RangeCalendar } from "@abereghici/ui/range-calendar";

export default function Page() {
  return (
    <main>
      <form>
        <DateRangePicker.Root
          label="Trip dates"
          startName="checkIn"
          endName="checkOut"
          startLabel="Start date"
          endLabel="End date"
          triggerLabel="Choose dates"
          incompleteMessage="Enter a complete date"
          reversedMessage="The end date is before the start date"
        >
          <DateRangePicker.Content>
            <RangeCalendar previousMonthLabel="Previous month" nextMonthLabel="Next month" />
          </DateRangePicker.Content>
        </DateRangePicker.Root>
        <button>Submit</button>
      </form>
    </main>
  );
}
