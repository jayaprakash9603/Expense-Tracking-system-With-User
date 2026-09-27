import { TRANSPORT } from "../../../platform/config/transportProfiles";
import { createBillHttpRepository } from "./billHttpRepository";
import { createBillMockRepository } from "./billMockRepository";
import { assertBillRepository } from "../ports/billRepository.port";

export const BILL_REPOSITORY_KEY = "bills";

export const registerBillRepository = (container) => {
  const impl =
    container.config.transport === TRANSPORT.MOCK
      ? createBillMockRepository()
      : createBillHttpRepository(container.http);

  assertBillRepository(impl);
  container.registerRepository(BILL_REPOSITORY_KEY, impl);
  return impl;
};

export { createBillHttpRepository, createBillMockRepository };
