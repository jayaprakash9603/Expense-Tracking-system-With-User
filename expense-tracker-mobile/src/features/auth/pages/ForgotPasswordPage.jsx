import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormField } from "@/shared/components/form/FormField";
import { AppButton } from "@/shared/components/form/AppButton";
import { Button } from "@/shared/components/app-shadcn";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

const schema = Yup.object({
  email: Yup.string().email("auth.validation.emailInvalid").required("auth.validation.emailRequired"),
});

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (_values, { setSubmitting }) => {
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
            <Button
              type="button"
              variant="link"
              className="block h-auto w-full p-0 text-center text-sm font-normal text-primary"
              onClick={() => navigate("/login")}
            >
              {t("auth.forgotPassword.backToLogin")}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ForgotPasswordPage;
