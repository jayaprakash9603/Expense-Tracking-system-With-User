import React, { useState } from "react";
import { Formik, Form } from "formik";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUserAction } from "@/redux/auth/auth.actions";
import { loginSchema, loginInitialValues } from "../validation/loginSchema";
import { FormField } from "@/shared/components/FormField";
import { AppButton } from "@/shared/components/AppButton";
import { resolveGoogleSignInClientId } from "@/config/auth/googleOAuth";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { Alert, AlertDescription } from "@/shared/components/app-shadcn";
import { Separator } from "@/shared/components/app-shadcn";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const googleClientId = resolveGoogleSignInClientId();
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError("");
    const result = await dispatch(loginUserAction({ data: values }));

    if (!result.success) {
      const flow = result.data || {};
      if (flow.mfaRequired) {
        navigate("/mfa", {
          state: { mfaToken: flow.mfaToken, email: flow.email || values.email },
        });
        setSubmitting(false);
        return;
      }

      if (flow.twoFactorRequired) {
        navigate(
          `/otp-verification?mode=login&email=${encodeURIComponent(flow.email || values.email)}`,
        );
        setSubmitting(false);
        return;
      }

      if (result.error === "OAUTH_NO_PASSWORD") {
        navigate(`/create-password?email=${encodeURIComponent(values.email)}`);
        setSubmitting(false);
        return;
      }

      setServerError(result.error);
    } else {
      const payload = result.data || {};
      const isAdmin =
        payload.currentMode === "ADMIN" ||
        payload.role === "ADMIN" ||
        payload.user?.role === "ADMIN";
      navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
    }
    setSubmitting(false);
  };

  const getDisplayError = (errors, submitCount) => {
    if (submitCount > 0 && errors.email && errors.password) return t("auth.validation.allFieldsRequired");
    if (submitCount > 0 && errors.email) return t(errors.email);
    if (submitCount > 0 && errors.password) return t(errors.password);
    if (serverError) {
      return typeof serverError === "string" && serverError.startsWith("auth.errors.")
        ? t(serverError)
        : serverError;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">{t("auth.login.title")}</h2>
      <p className="text-center text-sm text-muted-foreground">{t("auth.login.subtitle")}</p>

      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, submitCount }) => {
          const displayError = getDisplayError(errors, submitCount);

          return (
            <Form className="space-y-4" noValidate>
              {displayError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              ) : null}

              <FormField
                name="email"
                type="text"
                placeholder={t("auth.login.emailPlaceholder")}
                autoComplete="email"
                onFocusExtra={() => serverError && setServerError("")}
                onChangeExtra={() => serverError && setServerError("")}
              />

              <FormField
                name="password"
                type="password"
                placeholder={t("auth.login.passwordPlaceholder")}
                autoComplete="current-password"
                onFocusExtra={() => serverError && setServerError("")}
                onChangeExtra={() => serverError && setServerError("")}
              />

              <AppButton type="submit" isLoading={isSubmitting}>
                {t("auth.login.loginButton")}
              </AppButton>

              {googleClientId ? (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <Separator className="flex-1" />
                    <span className="text-muted-foreground text-sm">{t("common.or")}</span>
                    <Separator className="flex-1" />
                  </div>
                  <GoogleLoginButton disabled={isSubmitting} />
                </>
              ) : null}

              <div className="flex flex-col items-center gap-3 pt-1">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  {t("auth.login.forgotPassword")}
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground text-sm">
                    {t("auth.login.noAccount")}
                  </span>
                  <button
                    type="button"
                    className="text-sm text-primary font-medium hover:underline"
                    onClick={() => navigate("/register")}
                  >
                    {t("auth.login.register")}
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default LoginForm;
