import { TRANSPORT } from "../../../platform/config/transportProfiles";
import { createExpenseHttpRepository } from "./expenseHttpRepository";
import { createExpenseMockRepository } from "./expenseMockRepository";
import { assertExpenseRepository } from "../ports/expenseRepository.port";

export const EXPENSE_REPOSITORY_KEY = "expenses";

/**
 * Register the expense repository on the platform container.
 * @param {ReturnType<import('../../../platform/container').createContainer>} container
 */
export const registerExpenseRepository = (container) => {
  const impl =
    container.config.transport === TRANSPORT.MOCK
      ? createExpenseMockRepository()
      : createExpenseHttpRepository(container.http);

  assertExpenseRepository(impl);
  container.registerRepository(EXPENSE_REPOSITORY_KEY, impl);
  return impl;
};

export { createExpenseHttpRepository, createExpenseMockRepository };
