import { PRIORITY_LABEL, type Issue } from "@/lib/types";

function escapeCsvField(value: unknown) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function exportIssuesToCsv(issues: Issue[], filename = "issues.csv") {
  const headers = ["Identifier", "Title", "Status", "Priority", "Assignee", "Labels"];
  const rows = issues.map((issue) => [
    issue.identifier,
    issue.title,
    issue.status.name,
    PRIORITY_LABEL[issue.priority],
    issue.assignee?.name ?? "",
    (issue.labels ?? []).map((l) => l.name).join("; "),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsvField).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
