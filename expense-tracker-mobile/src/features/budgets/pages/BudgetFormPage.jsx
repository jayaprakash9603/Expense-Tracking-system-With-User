import { useParams, useNavigate } from "react-router-dom";
import { EntityFormPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FormField } from "@/shared/components/FormField";
import { AppInput } from "@/shared/components/AppInput";
import { useBudgetForm } from "../hooks/useBudgetForm";
import { BUDGET_FORM_FIELDS } from "../config/budgetConfig";
import { toast } from "sonner";

export function BudgetFormPageView() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = id ? "edit" : "create";

  const formHook = useBudgetForm({
    mode,
    entityId: id,
    onSuccess: () => {
      toast.success(t(mode === "create" ? "budgets.created" : "budgets.updated"));
      navigate("/budgets");
    },
    onError: () => toast.error(t("common.error")),
  });

  const renderFields = ({ formData, errors, handleChange }) => (
    <div className="space-y-4">
      {BUDGET_FORM_FIELDS.map((field) => (
        <FormField key={field.name} label={t(field.label)} error={errors[field.name] ? t(errors[field.name]) : undefined} required={field.required}>
          <AppInput
            type={field.type || "text"}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ""}
          />
        </FormField>
      ))}
    </div>
  );

  return (
    <EntityFormPage
      title={t(mode === "create" ? "budgets.addTitle" : "budgets.editTitle")}
      hook={formHook}
      renderFields={renderFields}
      onBack={() => navigate(-1)}
      submitLabel={t(mode === "create" ? "common.create" : "common.save")}
    />
  );
}

export default BudgetFormPageView;
