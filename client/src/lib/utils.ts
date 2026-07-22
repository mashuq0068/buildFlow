import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function isEmptyHtml(html: string) {
  return stripHtml(html).length === 0;
}

export function isIssueOverdue(dueDate: string | undefined, category: string) {
  if (!dueDate) return false;
  if (category === "completed" || category === "canceled") return false;
  return new Date(dueDate) < new Date();
}

export function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
