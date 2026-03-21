import { useParams, useNavigate } from "react-router-dom";
import { EntityFormPage } from "@/shared/patterns";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { FormField } from "@/shared/components/form/FormField";
import { AppInput } from "@/shared/components/form/AppInput";
import { useCategoryForm } from "../hooks/useCategoryForm";
import { CATEGORY_FORM_FIELDS } from "../config/categoryConfig";
import { toast } from "sonner";

export function CategoryFormPageView() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = id ? "edit" : "create";

  const formHook = useCategoryForm({
    mode,
    entityId: id,
    onSuccess: () => {
      toast.success(t(mode === "create" ? "categories.created" : "categories.updated"));
      navigate("/categories");
    },
    onError: () => toast.error(t("common.error")),
  });

  const renderFields = ({ formData, errors, handleChange }) => (
    <div className="space-y-4">
      {CATEGORY_FORM_FIELDS.map((field) => (
        <FormField key={field.name} label={t(field.label)} error={errors[field.name] ? t(errors[field.name]) : undefined} required={field.required}>
          <AppInput
            type={field.type || "text"}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        </FormField>
      ))}
    </div>
  );

  return (
    <EntityFormPage
      title={t(mode === "create" ? "categories.addTitle" : "categories.editTitle")}
      hook={formHook}
      renderFields={renderFields}
      onBack={() => navigate(-1)}
      submitLabel={t(mode === "create" ? "common.create" : "common.save")}
    />
  );
}

export default CategoryFormPageView;
