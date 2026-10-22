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

export function formatActivityAction(action) {
  if (typeof action !== "string") return "";

  let match = action.match(/^Created new project: (.+)$/);
  if (match) return `پروژهٔ «${match[1]}» را ایجاد کردید`;

  match = action.match(/^Hired (\S+) for project (.+)$/);
  if (match) return `فریلنسر ${match[1]} را برای پروژهٔ «${match[2]}» استخدام کردید`;

  match = action.match(/^Rated (\S+) for project (.+): (\d+)$/);
  if (match) return `به ${match[1]} برای پروژهٔ «${match[2]}» امتیاز ${Number(match[3]).toLocaleString("fa-IR")} دادید`;

  match = action.match(/^Marked project completed: (.+)$/);
  if (match) return `پروژهٔ «${match[1]}» را تکمیل‌شده اعلام کردید`;

  match = action.match(/^Project completed: (.+)$/);
  if (match) return `پروژهٔ «${match[1]}» تکمیل شد`;

  match = action.match(/^Was hired for project (.+)$/);
  if (match) return `برای پروژهٔ «${match[1]}» استخدام شدید`;

  match = action.match(/^Sent proposal to project: (.+)$/);
  if (match) return `برای پروژهٔ «${match[1]}» پیشنهاد ارسال کردید`;

  match = action.match(/^Rejected proposal (\d+) for project (.+)$/);
  if (match) return `پیشنهاد شمارهٔ ${Number(match[1]).toLocaleString("fa-IR")} را برای پروژهٔ «${match[2]}» رد کردید`;

  return action;
}

const PROJECT_CATEGORIES = {
  web: "توسعه وب",
  mobile: "توسعه موبایل",
  design: "طراحی",
  other: "سایر",
};

export function formatProjectCategory(category) {
  return PROJECT_CATEGORIES[category] || category || "نامشخص";
}
