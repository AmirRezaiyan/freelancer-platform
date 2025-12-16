export function formatCurrencyToToman(value) {
  if (value == null || isNaN(value)) return "-";
  const n = Number(value);
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

export function formatDateIran(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tehran",
    }).format(d);
  } catch {
    return isoString;
  }
}
