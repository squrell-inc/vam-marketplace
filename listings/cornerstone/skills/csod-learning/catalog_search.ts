import { csod, runTool, text, whole, query } from "./lib/csod.ts";

export function searchPath(args: Record<string, any>): string {
  const q = text(args, "query", false, 500);
  const page = whole(args, "page", 1, 1, 1000);
  const pageSize = whole(args, "pageSize", 20, 1, 100);
  return `/services/api/Catalog/GlobalSearch${query({ SearchText: q || undefined, Page: page, PageSize: pageSize })}`;
}

export function shape(json: any) {
  const raw = json?.data ?? json?.Data ?? json?.value ?? json;
  const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.Items ?? raw?.Trainings ?? []);
  return {
    results: (Array.isArray(items) ? items : []).slice(0, 100).map((t: any) => ({
      id: String(t.ObjectId ?? t.LoId ?? t.id ?? t.Id ?? ""),
      title: String(t.Title ?? t.title ?? t.Name ?? ""),
      type: String(t.TrainingType ?? t.Type ?? t.type ?? ""),
      provider: String(t.Provider ?? t.provider ?? ""),
    })),
  };
}

export async function catalogSearch(args: Record<string, any>) {
  const { json } = await csod("GET", searchPath(args));
  return shape(json);
}

if (import.meta.main) await runTool(catalogSearch);