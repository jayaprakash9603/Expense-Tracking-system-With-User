/**
 * Register feature repositories on the platform container.
 * Called once at app boot (from config/api.js shim).
 */

import { getContainer } from "./container";
import { registerExpenseRepository } from "../features/expenses/adapters";
import { registerBillRepository } from "../features/bills/adapters";

let bootstrapped = false;

export const bootstrapPlatform = () => {
  if (bootstrapped) {
    return getContainer();
  }
  const container = getContainer();
  registerExpenseRepository(container);
  registerBillRepository(container);
  bootstrapped = true;
  return container;
};

export const resetBootstrap = () => {
  bootstrapped = false;
};
