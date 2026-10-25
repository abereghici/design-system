import type { Locale } from "../locale.tsx";

export const roRO: Locale = {
  tag: "ro-RO",
  labels: {
    kbd: {
      command: "Comandă",
      control: "Control",
      shift: "Shift",
      option: "Option",
      enter: "Enter",
      backspace: "Backspace",
      arrowUp: "Săgeată în sus",
      arrowDown: "Săgeată în jos",
      arrowLeft: "Săgeată la stânga",
      arrowRight: "Săgeată la dreapta",
    },
    passwordField: { show: "Afișează parola" },
    numberField: { increment: "Mărește", decrement: "Micșorează" },
    fileTrigger: { clear: "Golește fișierele" },
    dateField: {
      dayPlaceholder: "zz",
      monthPlaceholder: "ll",
      yearPlaceholder: "aaaa",
      empty: "Necompletat",
      incomplete: "Introduceți o dată completă",
      unavailable: "Această dată nu este disponibilă",
    },
    calendar: { previousMonth: "Luna anterioară", nextMonth: "Luna următoare" },
    datePicker: { chooseDate: "Alegeți data" },
  },
};
