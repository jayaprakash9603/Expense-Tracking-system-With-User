import { describe, it, expect } from "vitest";
import { createExpenseMockRepository } from "../adapters/expenseMockRepository";
import { listExpenses, createExpense } from "../usecases";

describe("expenses feature smoke (mock transport)", () => {
  it("use-cases work without React or network", async () => {
    const repo = createExpenseMockRepository();
    await createExpense(repo, { expenseName: "Taxi", amount: 20 });
    const list = await listExpenses(repo);
    expect(list).toHaveLength(1);
    expect(list[0].amount).toBe(20);
  });
});
