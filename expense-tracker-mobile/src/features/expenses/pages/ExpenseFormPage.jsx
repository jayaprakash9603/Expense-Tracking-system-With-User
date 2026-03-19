import { useParams, useNavigate } from "react-router-dom";
import { EntityFormPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FormField } from "@/shared/components/FormField";
import { AppInput } from "@/shared/components/AppInput";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { EXPENSE_FORM_FIELDS } from "../config/expenseConfig";
import { toast } from "sonner";

export function ExpenseFormPageView() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = id ? "edit" : "create";

  const formHook = useExpenseForm({
    mode,
    entityId: id,
    onSuccess: () => {
      toast.success(t(mode === "create" ? "expenses.created" : "expenses.updated"));
      navigate("/expenses");
    },
    onError: () => toast.error(t("common.error")),
  });

  const renderFields = ({ formData, errors, handleChange }) => (
    <div className="space-y-4">
      {EXPENSE_FORM_FIELDS.map((field) => {
        if (field.type === "switch") return null;
        return (
          <FormField key={field.name} label={t(field.label)} error={errors[field.name] ? t(errors[field.name]) : undefined} required={field.required}>
            <AppInput
              type={field.type === "textarea" ? "text" : field.type || "text"}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder ? t(field.placeholder) : ""}
            />
          </FormField>
        );
      })}
    </div>
  );

  return (
    <EntityFormPage
      title={t(mode === "create" ? "expenses.addTitle" : "expenses.editTitle")}
      hook={formHook}
      renderFields={renderFields}
      onBack={() => navigate(-1)}
      submitLabel={t(mode === "create" ? "common.create" : "common.save")}
    />
  );
}

export default ExpenseFormPageView;
