import { useEntityForm } from "@/shared/patterns";
import {
  PAYMENT_METHOD_DEFAULTS,
  validatePaymentMethod,
  fromPaymentMethodApiResponse,
  toPaymentMethodApiPayload,
} from "@/domain/paymentMethods";
import {
  createPaymentMethodAction,
  fetchPaymentMethodByIdAction,
  updatePaymentMethodAction,
} from "@/redux/paymentMethods/paymentMethods.actions";

function updatePaymentMethodWithId(id, payload) {
  return updatePaymentMethodAction({ ...payload, id });
}

export function usePaymentMethodForm({
  mode = "create",
  entityId = null,
  onSuccess,
  onError,
} = {}) {
  return useEntityForm({
    mode,
    entityId,
    model: PAYMENT_METHOD_DEFAULTS,
    validator: validatePaymentMethod,
    transformer: {
      fromApi: fromPaymentMethodApiResponse,
      toApi: toPaymentMethodApiPayload,
    },
    createAction: createPaymentMethodAction,
    updateAction: updatePaymentMethodWithId,
    fetchAction: fetchPaymentMethodByIdAction,
    onSuccess,
    onError,
  });
}

export default usePaymentMethodForm;
