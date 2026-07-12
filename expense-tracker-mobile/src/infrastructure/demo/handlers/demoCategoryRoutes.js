import { nextDemoId, saveDemoStore } from "@/infrastructure/demo/store/demoStore";
import { matchCategoryId } from "@/infrastructure/demo/handlers/demoEntityHelpers";

export async function tryDemoCategoryRoutes(ctx) {
  const { method, path, body, store, resolveDemoData, rejectDemoHttp } = ctx;

  if (method === "GET" && path === "/api/categories") {
    return resolveDemoData([...store.categories]);
  }

  if (method === "POST" && path === "/api/categories") {
    const id = nextDemoId(store);
    const row = {
      id,
      name: body.name || "Category",
      color: body.color || "#64748b",
      type: body.type || "NEED",
    };
    store.categories = [...store.categories, row];
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  const catId = matchCategoryId(path);
  if (method === "PUT" && catId) {
    const idx = store.categories.findIndex((x) => String(x.id) === String(catId));
    if (idx === -1) return rejectDemoHttp(404, "Category not found");
    const row = { ...store.categories[idx], ...body, id: store.categories[idx].id };
    store.categories = [
      ...store.categories.slice(0, idx),
      row,
      ...store.categories.slice(idx + 1),
    ];
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  if (method === "DELETE" && catId) {
    store.categories = store.categories.filter((x) => String(x.id) !== String(catId));
    saveDemoStore(store);
    return resolveDemoData({ success: true });
  }

  return null;
}
