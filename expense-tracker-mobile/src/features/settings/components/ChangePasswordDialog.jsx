import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { AppDialog } from "@/shared/components/AppDialog";
import { FormField } from "@/shared/components/FormField";
import { AppButton } from "@/shared/components/AppButton";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { api } from "@/config/api";
import { safeApiCall } from "@/shared/utils/safeApiCall";
import { toast } from "sonner";

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Must contain at least one special character")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

export function ChangePasswordDialog({ open, onOpenChange }) {
  const { t } = useLanguage();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const { data, error } = await safeApiCall(() =>
      api.put("/api/user/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    );

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t("settings.passwordChanged"));
    resetForm();
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("settings.changePassword")}
      description={t("settings.changePasswordDesc")}
    >
      <Formik
        initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
        validationSchema={passwordSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4 pt-2">
            <FormField name="currentPassword" label={t("settings.currentPassword")} type="password" />
            <FormField name="newPassword" label={t("settings.newPassword")} type="password" />
            <FormField name="confirmPassword" label={t("settings.confirmPassword")} type="password" />
            <div className="flex gap-3 pt-2">
              <AppButton
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </AppButton>
              <AppButton type="submit" className="flex-1" loading={isSubmitting}>
                {t("common.save")}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}

export default ChangePasswordDialog;
