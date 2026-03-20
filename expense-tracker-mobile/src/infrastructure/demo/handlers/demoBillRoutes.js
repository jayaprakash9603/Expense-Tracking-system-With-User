import { nextDemoId, saveDemoStore } from "@/infrastructure/demo/store/demoStore";
import { matchBillId } from "@/infrastructure/demo/handlers/demoEntityHelpers";

export async function tryDemoBillRoutes(ctx) {
  const { method, path, body, store, resolveDemoData, rejectDemoHttp } = ctx;

  if (method === "GET" && path === "/api/bills") {
    return resolveDemoData([...store.bills]);
  }

  if (method === "GET" && path === "/api/bills/upcoming") {
    return resolveDemoData([...store.bills]);
  }

  const billSeg = matchBillId(path);
  if (
    method === "GET" &&
    billSeg &&
    billSeg !== "upcoming" &&
    path === `/api/bills/${billSeg}` &&
    !path.includes("/pay")
  ) {
    const b = store.bills.find((x) => String(x.id) === String(billSeg));
    if (!b) return rejectDemoHttp(404, "Bill not found");
    return resolveDemoData(b);
  }

  if (method === "POST" && path === "/api/bills") {
    const id = nextDemoId(store);
    const row = {
      id,
      name: body.name || body.title || body.billName || "Bill",
      amount: Number(body.amount || 0),
      dueDate: body.dueDate || new Date().toISOString().split("T")[0],
      status: body.status || "PENDING",
      category: body.category || "",
      notes: body.notes || "",
      budgetId: body.budgetId || "",
    };
    store.bills = [row, ...store.bills];
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  const billId = matchBillId(path);
  if (
    method === "PUT" &&
    billId &&
    billId !== "upcoming" &&
    path.startsWith("/api/bills/")
  ) {
    const idx = store.bills.findIndex((x) => String(x.id) === String(billId));
    if (idx === -1) return rejectDemoHttp(404, "Bill not found");
    const row = { ...store.bills[idx], ...body, id: store.bills[idx].id };
    store.bills = [...store.bills.slice(0, idx), row, ...store.bills.slice(idx + 1)];
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  if (
    method === "DELETE" &&
    billId &&
    billId !== "upcoming" &&
    path.startsWith("/api/bills/")
  ) {
    store.bills = store.bills.filter((x) => String(x.id) !== String(billId));
    saveDemoStore(store);
    return resolveDemoData({ success: true });
  }

  if (method === "PATCH" && path.includes("/pay")) {
    const m = path.match(/^\/api\/bills\/([^/]+)\/pay$/);
    const id = m ? m[1] : null;
    if (!id) return rejectDemoHttp(400, "Bad request");
    const idx = store.bills.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) return rejectDemoHttp(404, "Bill not found");
    const row = { ...store.bills[idx], status: "PAID" };
    store.bills = [...store.bills.slice(0, idx), row, ...store.bills.slice(idx + 1)];
    saveDemoStore(store);
    return resolveDemoData(row);
  }

  return null;
}
