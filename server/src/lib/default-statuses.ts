export const DEFAULT_STATUS_TEMPLATE = [
  { name: "Backlog", color: "#8b8fa3", icon: "Circle", category: "BACKLOG" as const, isDefault: true },
  { name: "Todo", color: "#6e79d6", icon: "CircleDot", category: "UNSTARTED" as const },
  { name: "In Progress", color: "#e8a53f", icon: "Loader", category: "STARTED" as const },
  { name: "In Review", color: "#5e9bd6", icon: "Eye", category: "STARTED" as const },
  { name: "Done", color: "#4cb782", icon: "CheckCircle2", category: "COMPLETED" as const },
  { name: "Canceled", color: "#6b7280", icon: "XCircle", category: "CANCELED" as const },
];
