import React, { useState } from "react";
import { Formik, Form } from "formik";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUserAction } from "@/redux/auth/auth.actions";
import { registerSchema, registerInitialValues } from "../validation/registerSchema";
import { FormField } from "@/shared/components/FormField";
import { AppButton } from "@/shared/components/AppButton";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { toast } from "@/shared/components/AppToast";

export function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError("");
    const result = await dispatch(registerUserAction({ data: values }));

    if (result.success) {
      toast.success(t("auth.register.success"));
      navigate("/login");
    } else {
      setServerError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">{t("auth.register.title")}</h2>

      <Formik
        initialValues={registerInitialValues}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-4" noValidate>
            {serverError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <FormField
                name="firstName"
                placeholder={t("auth.register.firstNamePlaceholder")}
                autoComplete="given-name"
              />
              <FormField
                name="lastName"
                placeholder={t("auth.register.lastNamePlaceholder")}
                autoComplete="family-name"
              />
            </div>

            <FormField
              name="email"
              type="email"
              placeholder={t("auth.register.emailPlaceholder")}
              autoComplete="email"
            />

            <div className="space-y-2">
              <FormField
                name="password"
                type="password"
                placeholder={t("auth.register.passwordPlaceholder")}
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={values.password} />
            </div>

            <FormField
              name="confirmPassword"
              type="password"
              placeholder={t("auth.register.confirmPasswordPlaceholder")}
              autoComplete="new-password"
            />

            <AppButton type="submit" isLoading={isSubmitting}>
              {t("auth.register.registerButton")}
            </AppButton>

            <div className="flex items-center gap-2 py-1">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">{t("common.or")}</span>
              <Separator className="flex-1" />
            </div>

            <GoogleLoginButton disabled={isSubmitting} />

            <div className="flex items-center justify-center gap-1 pt-1">
              <span className="text-muted-foreground text-sm">
                {t("auth.register.hasAccount")}
              </span>
              <button
                type="button"
                className="text-sm text-primary font-medium hover:underline"
                onClick={() => navigate("/login")}
              >
                {t("auth.register.login")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default RegisterForm;
