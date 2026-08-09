import { describe, it, expect } from "vitest";
import { createBillMockRepository } from "../adapters/billMockRepository";
import { listBills } from "../usecases";

describe("bills feature smoke (mock transport)", () => {
  it("use-cases work without React or network", async () => {
    const repo = createBillMockRepository([
      { id: 1, name: "Internet", amount: 50 },
    ]);
    const list = await listBills(repo);
    expect(list[0].name).toBe("Internet");
  });
});
