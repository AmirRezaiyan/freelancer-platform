import assert from "node:assert/strict";
import test from "node:test";
import { formatActivityAction } from "../src/utils/formatters.js";

test("formats employer activity entries in Persian while preserving project titles and emails", () => {
  assert.equal(
    formatActivityAction("Created new project: ربات تلگرام"),
    "پروژهٔ «ربات تلگرام» را ایجاد کردید",
  );
  assert.equal(
    formatActivityAction("Rated ezio.rzn80@gmail.com for project ربات تلگرام: 5"),
    "به ezio.rzn80@gmail.com برای پروژهٔ «ربات تلگرام» امتیاز ۵ دادید",
  );
  assert.equal(
    formatActivityAction("Marked project completed: ربات تلگرام"),
    "پروژهٔ «ربات تلگرام» را تکمیل‌شده اعلام کردید",
  );
  assert.equal(
    formatActivityAction("Hired ezio.rzn80@gmail.com for project ربات تلگرام"),
    "فریلنسر ezio.rzn80@gmail.com را برای پروژهٔ «ربات تلگرام» استخدام کردید",
  );
});

test("formats other activity types and keeps unknown actions unchanged", () => {
  assert.equal(formatActivityAction("Project completed: ربات تلگرام"), "پروژهٔ «ربات تلگرام» تکمیل شد");
  assert.equal(formatActivityAction("Was hired for project ربات تلگرام"), "برای پروژهٔ «ربات تلگرام» استخدام شدید");
  assert.equal(formatActivityAction("Sent proposal to project: ربات تلگرام"), "برای پروژهٔ «ربات تلگرام» پیشنهاد ارسال کردید");
  assert.equal(formatActivityAction("Rejected proposal 12 for project ربات تلگرام"), "پیشنهاد شمارهٔ ۱۲ را برای پروژهٔ «ربات تلگرام» رد کردید");
  assert.equal(formatActivityAction("unknown action"), "unknown action");
});