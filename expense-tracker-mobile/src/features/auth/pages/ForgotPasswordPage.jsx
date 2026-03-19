import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormField } from "@/shared/components/FormField";
import { AppButton } from "@/shared/components/AppButton";
import { useLanguage } from "@/shared/hooks/useLanguage";

const schema = Yup.object({
  email: Yup.string().email("auth.validation.emailInvalid").required("auth.validation.emailRequired"),
});

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (values, { setSubmitting }) => {
    // Placeholder — will be wired to backend later
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">
        {t("auth.forgotPassword.title")}
      </h2>
      <p className="text-sm text-muted-foreground text-center">
        {t("auth.forgotPassword.description")}
      </p>

      <Formik
        initialValues={{ email: "" }}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            <FormField
              name="email"
              type="email"
              placeholder={t("auth.forgotPassword.emailPlaceholder")}
            />
            <AppButton type="submit" isLoading={isSubmitting}>
              {t("auth.forgotPassword.sendButton")}
            </AppButton>
            <button
              type="button"
              className="block w-full text-center text-sm text-primary hover:underline"
              onClick={() => navigate("/login")}
            >
              {t("auth.forgotPassword.backToLogin")}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ForgotPasswordPage;
