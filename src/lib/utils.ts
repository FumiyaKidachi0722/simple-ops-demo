import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { AttendanceRecord } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJst(
  iso?: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!iso) return "";
  const date = iso instanceof Date ? iso : new Date(iso);
  return date
    .toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      ...options,
    })
    .replace(/\//g, "-");
}

export const formatJstDate = (iso?: string | number | Date): string =>
  formatJst(iso, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const formatJstTime = (iso?: string | number | Date): string =>
  formatJst(iso, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export function workDuration(rec: AttendanceRecord): string {
  const startIso = rec.manualStart ?? rec.start;
  const endIso = rec.manualEnd ?? rec.end;
  if (!startIso || !endIso) return "-";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const breaks =
    rec.manualBreaks && rec.manualBreaks.length > 0
      ? rec.manualBreaks
      : rec.breaks;
  const breakMs = breaks.reduce((sum, b) => {
    if (!b.end || !b.start) return sum;
    return sum + (new Date(b.end).getTime() - new Date(b.start).getTime());
  }, 0);
  const ms = end - start - breakMs;
  return Math.round(ms / 60000) + "分";
}

export function breakDuration(rec: AttendanceRecord): string {
  const breaks =
    rec.manualBreaks && rec.manualBreaks.length > 0
      ? rec.manualBreaks
      : rec.breaks;
  if (breaks.length === 0) return "-";
  const ms = breaks.reduce((sum, b) => {
    if (!b.end || !b.start) return sum;
    return sum + (new Date(b.end).getTime() - new Date(b.start).getTime());
  }, 0);
  return ms > 0 ? Math.round(ms / 60000) + "分" : "-";
}
