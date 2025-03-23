import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: Date | string, pattern = 'MMM dd, yyyy'): string {
  return format(new Date(date), pattern);
}

export function getRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isSameDay(dateA: Date | string, dateB: Date | string): boolean {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}