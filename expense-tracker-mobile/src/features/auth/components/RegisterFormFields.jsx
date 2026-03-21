import React from "react";
import { Form } from "formik";
import { FormField } from "@/shared/components/FormField";
import { AppButton } from "@/shared/components/AppButton";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { Alert, AlertDescription } from "@/shared/components/app-shadcn";
import { Separator } from "@/shared/components/app-shadcn";
import { Label } from "@/shared/components/app-shadcn";
import { RadioGroup, RadioGroupItem } from "@/shared/components/app-shadcn";
import { AlertCircle } from "lucide-react";
import { resolveRegisterBannerError } from "../utils/registerBannerError";

export function RegisterFormFields({
  t,
  navigate,
  isSubmitting,
  values,
  errors,
  submitCount,
  setFieldValue,
  emailAvailabilityMessage,
  verifyEmailAvailable,
  clearEmailAvailability,
  serverError,
  setServerError,
}) {
  const bannerError = resolveRegisterBannerError({
    errors,
    values,
    submitCount,
    emailAvailabilityMessage,
    serverError,
    t,
  });

  return (
    <Form className="space-y-4" noValidate>
      {bannerError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{bannerError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <FormField
          name="firstName"
          placeholder={t("auth.register.firstNamePlaceholder")}
          autoComplete="given-name"
          onFocusExtra={() => serverError && setServerError("")}
          onChangeExtra={() => serverError && setServerError("")}
        />
        <FormField
          name="lastName"
          placeholder={t("auth.register.lastNamePlaceholder")}
          autoComplete="family-name"
          onFocusExtra={() => serverError && setServerError("")}
          onChangeExtra={() => serverError && setServerError("")}
        />
      </div>

      <FormField
        name="email"
        type="text"
        placeholder={t("auth.register.emailPlaceholder")}
        autoComplete="email"
        inputMode="email"
        onBlurExtra={() => verifyEmailAvailable(values.email)}
        onChangeExtra={() => {
          clearEmailAvailability();
          if (serverError) setServerError("");
        }}
        onFocusExtra={() => serverError && setServerError("")}
      />

      <div className="space-y-2">
        <FormField
          name="password"
          type="password"
          placeholder={t("auth.register.passwordPlaceholder")}
          autoComplete="new-password"
          onFocusExtra={() => serverError && setServerError("")}
          onChangeExtra={() => serverError && setServerError("")}
        />
        <PasswordStrengthMeter password={values.password} />
      </div>

      <FormField
        name="confirmPassword"
        type="password"
        placeholder={t("auth.register.confirmPasswordPlaceholder")}
        autoComplete="new-password"
        onFocusExtra={() => serverError && setServerError("")}
        onChangeExtra={() => serverError && setServerError("")}
      />

      <div className="space-y-2">
        <Label className="text-muted-foreground">{t("auth.register.genderOptional")}</Label>
        <RadioGroup
          value={values.gender || ""}
          onValueChange={(v) => setFieldValue("gender", v)}
          className="flex flex-row flex-wrap gap-4"
        >
          <label className="flex items-center gap-2 text-sm" htmlFor="reg-gender-female">
            <RadioGroupItem value="female" id="reg-gender-female" />
            <span>{t("auth.register.genderFemale")}</span>
          </label>
          <label className="flex items-center gap-2 text-sm" htmlFor="reg-gender-male">
            <RadioGroupItem value="male" id="reg-gender-male" />
            <span>{t("auth.register.genderMale")}</span>
          </label>
        </RadioGroup>
      </div>

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
        <span className="text-muted-foreground text-sm">{t("auth.register.hasAccount")}</span>
        <button
          type="button"
          className="text-sm text-primary font-medium hover:underline"
          onClick={() => navigate("/login")}
        >
          {t("auth.register.login")}
        </button>
      </div>
    </Form>
  );
}
