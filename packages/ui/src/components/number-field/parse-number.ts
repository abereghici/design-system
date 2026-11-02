/**
 * Reads text typed in the formatter's locale back into a number: its digits, decimal separator and
 * minus sign, ignoring grouping and symbols. `null` for empty text, `NaN` for text with no digit.
 */
export function parseNumber(text: string, formatter: Intl.NumberFormat) {
  const { locale, numberingSystem, style } = formatter.resolvedOptions();
  const parts = formatter.formatToParts(-1234567.89);
  const symbol = (type: Intl.NumberFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const [decimal, minus] = [symbol("decimal"), symbol("minusSign")];
  const digitFormat = new Intl.NumberFormat(locale, { numberingSystem, useGrouping: false });
  const digits = Array.from({ length: 10 }, (_, digit) => digitFormat.format(digit));
  let raw = "";

  for (const char of text) {
    const digit = digits.indexOf(char);

    if (digit !== -1) raw += String(digit);
    else if (char === decimal) raw += ".";
    else if (char === "-" || char === minus) raw += "-";
  }

  if (raw === "") return text.trim() === "" ? null : Number.NaN;

  const value = Number(raw);

  return style === "percent" ? value / 100 : value;
}
