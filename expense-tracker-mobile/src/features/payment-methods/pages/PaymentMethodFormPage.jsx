import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import {
  EntityCommonFormSection,
  ExpenseFormShell,
  ExpenseSubmitArea,
} from "@/shared/components/entity-form";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { PAYMENT_METHOD_TYPES } from "@/domain/paymentMethods";
import { usePaymentMethodForm } from "../hooks/form/usePaymentMethodForm";

function translateFormErrors(errors, translate) {
  return Object.entries(errors || {}).reduce((acc, [key, value]) => {
    acc[key] = value ? translate(value) : value;
    return acc;
  }, {});
}

export function PaymentMethodFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const mode = id ? "edit" : "create";

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const formHook = usePaymentMethodForm({
    mode,
    entityId: id,
    onSuccess: () => {
      toast.success(t(mode === "create" ? "paymentMethods.created" : "paymentMethods.updated"));
      navigate("/payment-method");
    },
    onError: () => toast.error(t("common.error")),
  });

  const typeOptions = PAYMENT_METHOD_TYPES.map((typeValue) => ({
    value: typeValue,
    label: t(`categories.types.${typeValue.toLowerCase()}`),
  }));

  const renderFields = ({ formData, errors, handleChange }) => (
    <EntityCommonFormSection
      formData={formData}
      errors={translateFormErrors(errors, t)}
      handleChange={handleChange}
      typeOptions={typeOptions}
      showAmount
      amountDigitsOnly
      labels={{
        name: t("paymentMethods.form.name"),
        description: t("paymentMethods.form.description"),
        type: t("paymentMethods.form.type"),
        amount: t("paymentMethods.form.amount"),
        color: t("paymentMethods.form.color"),
        icon: t("paymentMethods.form.icon"),
      }}
    />
  );

  const pageTitle = t(mode === "create" ? "paymentMethods.addTitle" : "paymentMethods.editTitle");
  const submitLabel = t(mode === "create" ? "common.create" : "common.save");
  const { formData, errors, isSubmitting, isLoading, isDirty, handleSubmit, handleChange } =
    formHook;

  if (isLoading) {
    return (
      <ExpenseFormShell title={pageTitle} onClose={handleClose} className="entity-common-form">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </ExpenseFormShell>
    );
  }

  return (
    <ExpenseFormShell title={pageTitle} onClose={handleClose} className="entity-common-form">
      {renderFields({ formData, errors, handleChange })}
      <ExpenseSubmitArea
        isSubmitting={isSubmitting}
        disabled={isSubmitting || !isDirty}
        onSubmit={handleSubmit}
        label={submitLabel}
      />
    </ExpenseFormShell>
  );
}

export default PaymentMethodFormPage;
