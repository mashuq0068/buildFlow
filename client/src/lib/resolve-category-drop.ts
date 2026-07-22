import { useStatusesStore } from "@/lib/stores/statuses-store";
import type { StatusCategory } from "@/lib/types";

/** Cross-project boards group issues by shared status category, but a drop
 * target needs a real per-project status id. Resolve it to that project's
 * first (by position) status within the dropped category, if one exists. */
export async function resolveStatusIdForCategory(
  projectId: string,
  category: StatusCategory
): Promise<string | null> {
  let statuses = useStatusesStore.getState().byProject[projectId];
  if (!statuses) {
    await useStatusesStore.getState().fetchStatuses(projectId);
    statuses = useStatusesStore.getState().byProject[projectId];
  }
  const match = (statuses ?? [])
    .filter((s) => s.category === category)
    .sort((a, b) => a.position - b.position)[0];
  return match?.id ?? null;
}
