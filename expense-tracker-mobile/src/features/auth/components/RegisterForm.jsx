import React, { useState } from "react";
import { Formik } from "formik";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUserAction } from "@/redux/auth/auth.actions";
import { registerSchema, registerInitialValues } from "../validation/registerSchema";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { toast } from "@/shared/components/AppToast";
import { useRegisterEmailAvailability } from "../hooks/useRegisterEmailAvailability";
import { RegisterFormFields } from "./RegisterFormFields";

const sanitizeName = (s) => s?.replace(/[<>]/g, "").trim();

export function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [serverError, setServerError] = useState("");
  const { emailAvailabilityMessage, clearEmailAvailability, verifyEmailAvailable } =
    useRegisterEmailAvailability(t);

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError("");
    const emailOk = await verifyEmailAvailable(values.email);
    if (!emailOk) {
      setSubmitting(false);
      return;
    }
    const payload = {
      firstName: sanitizeName(values.firstName),
      lastName: sanitizeName(values.lastName),
      email: values.email?.trim(),
      password: values.password?.trim(),
    };
    if (values.gender) payload.gender = values.gender;
    const result = await dispatch(registerUserAction({ data: payload }));
    if (result.success) {
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      toast.success(
        redirectUrl ? t("auth.register.successWithRedirect") : t("auth.register.success"),
      );
      navigate("/login");
    } else {
      setServerError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">{t("auth.register.title")}</h2>
      <p className="text-center text-sm text-muted-foreground">{t("auth.register.subtitle")}</p>

      <Formik
        initialValues={registerInitialValues}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, errors, submitCount, setFieldValue }) => (
          <RegisterFormFields
            t={t}
            navigate={navigate}
            isSubmitting={isSubmitting}
            values={values}
            errors={errors}
            submitCount={submitCount}
            setFieldValue={setFieldValue}
            emailAvailabilityMessage={emailAvailabilityMessage}
            verifyEmailAvailable={verifyEmailAvailable}
            clearEmailAvailability={clearEmailAvailability}
            serverError={serverError}
            setServerError={setServerError}
          />
        )}
      </Formik>
    </div>
  );
}

export default RegisterForm;
