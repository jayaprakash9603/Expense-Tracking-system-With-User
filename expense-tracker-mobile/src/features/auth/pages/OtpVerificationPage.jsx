import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { verifyTwoFactorOtpAction } from "@/redux/auth/auth.actions";
import { FormField } from "@/shared/components/form/FormField";
import { AppButton } from "@/shared/components/form/AppButton";
import { Alert, AlertDescription } from "@/shared/components/app-shadcn";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function OtpVerificationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const schema = useMemo(
    () =>
      Yup.object({
        otp: Yup.string()
          .required(t("auth.validation.otpRequired"))
          .min(4, t("auth.validation.otpMinLength")),
      }),
    [t],
  );
  const [serverError, setServerError] = useState("");
  const email = searchParams.get("email") || "";

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError("");
    const result = await dispatch(
      verifyTwoFactorOtpAction({ email, otp: values.otp })
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      const err = result.error;
      setServerError(
        typeof err === "string" && err.startsWith("auth.errors.") ? t(err) : err,
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">{t("auth.otp.title")}</h2>
      <p className="text-sm text-muted-foreground text-center">
        {t("auth.otp.description")}
      </p>

      <Formik
        initialValues={{ otp: "" }}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            {serverError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField name="otp" placeholder={t("auth.otp.otpPlaceholder")} autoComplete="one-time-code" />

            <AppButton type="submit" isLoading={isSubmitting}>
              {t("auth.otp.verifyButton")}
            </AppButton>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default OtpVerificationPage;
