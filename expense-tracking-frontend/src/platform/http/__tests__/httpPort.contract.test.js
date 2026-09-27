import { describe, it, expect, beforeEach } from "vitest";
import { createMockHttpAdapter } from "../adapters/mockHttpAdapter";
import { assertHttpPort } from "../httpPort";
import { createExpenseMockRepository } from "../../../features/expenses/adapters/expenseMockRepository";
import { createBillMockRepository } from "../../../features/bills/adapters/billMockRepository";
import { assertExpenseRepository } from "../../../features/expenses/ports/expenseRepository.port";
import { assertBillRepository } from "../../../features/bills/ports/billRepository.port";
import { listExpenses, createExpense } from "../../../features/expenses/usecases";
import { listBills } from "../../../features/bills/usecases";

describe("HttpPort contract (mock adapter)", () => {
  let http;

  beforeEach(() => {
    http = createMockHttpAdapter({
      handlers: {
        "expenses.list": async () => [{ id: 1, expenseName: "Coffee", amount: 5 }],
        "bills.list": async () => [{ id: 10, name: "Electric" }],
      },
    });
  });

  it("satisfies HttpPort shape", () => {
    expect(() => assertHttpPort(http)).not.toThrow();
  });

  it("supports request by endpointId", async () => {
    const res = await http.request({ endpointId: "expenses.list" });
    expect(res.status).toBe(200);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].expenseName).toBe("Coffee");
  });

  it("supports axios-compat get/post", async () => {
    http.register("GET /api/ping", async () => ({ ok: true }));
    const res = await http.get("/api/ping");
    expect(res.data.ok).toBe(true);
  });
});

describe("ExpenseRepository contract (mock)", () => {
  it("list / create round-trip", async () => {
    const repo = createExpenseMockRepository([]);
    assertExpenseRepository(repo);

    const created = await createExpense(repo, {
      expenseName: "Lunch",
      amount: 12,
    });
    expect(created.id).toBeDefined();

    const all = await listExpenses(repo);
    expect(all).toHaveLength(1);
    expect(all[0].expenseName).toBe("Lunch");
  });
});

describe("BillRepository contract (mock)", () => {
  it("list returns seed data", async () => {
    const repo = createBillMockRepository([{ id: 1, name: "Water" }]);
    assertBillRepository(repo);
    const data = await listBills(repo, {});
    expect(data[0].name).toBe("Water");
  });
});
