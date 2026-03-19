import { useEntityForm } from "@/shared/patterns";
import { BILL_DEFAULTS } from "@/domain/bills/bill.model";
import { validateBill } from "@/domain/bills/bill.validators";
import { fromApiResponse, toApiPayload } from "@/domain/bills/bill.transformers";
import { createBillAction, updateBillAction } from "@/redux/bills/bills.actions";

export function useBillForm({ mode = "create", entityId = null, onSuccess, onError } = {}) {
  return useEntityForm({
    mode,
    entityId,
    model: BILL_DEFAULTS,
    validator: validateBill,
    transformer: { fromApi: fromApiResponse, toApi: toApiPayload },
    createAction: createBillAction,
    updateAction: updateBillAction,
    onSuccess,
    onError,
  });
}

export default useBillForm;
