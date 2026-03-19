import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppButton } from "@/shared/components/AppButton";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { PageContainer } from "@/shared/components/PageContainer";
import { AppCard } from "@/shared/components/AppCard";

export function EntityFormPage({
  title,
  hook,
  renderFields,
  onBack,
  submitLabel = "Save",
  className,
}) {
  const { formData, errors, isSubmitting, isLoading, isDirty, handleSubmit } = hook;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner size="lg" className="mt-20" />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md" className={cn("pb-24", className)}>
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <AppButton variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </AppButton>
        )}
        <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
      </div>

      <AppCard>
        <div className="p-4 md:p-6 space-y-4">
          {renderFields({ formData, errors, handleChange: hook.handleChange, setFieldValues: hook.setFieldValues })}
        </div>
      </AppCard>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:static md:border-0 md:bg-transparent md:p-0 md:mt-6 z-30">
        <AppButton
          onClick={handleSubmit}
          disabled={isSubmitting || !isDirty}
          loading={isSubmitting}
          fullWidth
          responsive
        >
          <Save className="h-4 w-4 mr-2" />
          {submitLabel}
        </AppButton>
      </div>
    </PageContainer>
  );
}

export default EntityFormPage;
