import { format, addMonths, addDays, differenceInDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function currentPeriod(startDay) {
  const today = new Date();
  const day = today.getDate();
  const clamped = Math.min(startDay, 28);

  let periodStart;
  if (day >= clamped) {
    periodStart = new Date(today.getFullYear(), today.getMonth(), clamped);
  } else {
    const lastMonth = addMonths(today, -1);
    periodStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), clamped);
  }

  const nextPeriodStart = addMonths(periodStart, 1);
  const periodEnd = addDays(nextPeriodStart, -1);

  return { start: periodStart, end: periodEnd };
}

export function previousPeriod(startDay) {
  const curr = currentPeriod(startDay);
  const prevStart = addMonths(curr.start, -1);
  const prevEnd = addDays(curr.start, -1);
  return { start: prevStart, end: prevEnd };
}

export function formatPeriod(start, end) {
  const fmt = (d) => format(d, "d MMM", { locale: es });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function daysRemaining(startDay) {
  const period = currentPeriod(startDay);
  const today = startOfDay(new Date());
  const end = startOfDay(period.end);
  return Math.max(0, differenceInDays(end, today));
}

export function daysElapsed(startDay) {
  const period = currentPeriod(startDay);
  const today = startOfDay(new Date());
  const start = startOfDay(period.start);
  return Math.max(0, differenceInDays(today, start));
}

export function totalDays(startDay) {
  const period = currentPeriod(startDay);
  return differenceInDays(period.end, period.start);
}
