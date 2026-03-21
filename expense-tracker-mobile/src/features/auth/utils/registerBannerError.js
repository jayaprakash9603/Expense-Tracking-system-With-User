const REQUIRED_FIELD_NAMES = ["firstName", "lastName", "email", "password", "confirmPassword"];

export function resolveRegisterBannerError({
  errors,
  values,
  submitCount,
  emailAvailabilityMessage,
  serverError,
  t,
}) {
  if (serverError) {
    if (
      typeof serverError === "string" &&
      (serverError.startsWith("auth.errors.") || serverError.startsWith("demo."))
    ) {
      return t(serverError);
    }
    return serverError;
  }
  if (submitCount === 0) return emailAvailabilityMessage || null;

  const emptyWithErrors = REQUIRED_FIELD_NAMES.filter((name) => !values[name] && errors[name]);
  if (emptyWithErrors.length >= 2) return t("auth.validation.allFieldsRequired");
  if (errors.firstName) return t(errors.firstName);
  if (errors.lastName) return t(errors.lastName);
  if (errors.email) return t(errors.email);
  if (emailAvailabilityMessage) return emailAvailabilityMessage;
  if (errors.password) return t(errors.password);
  if (errors.confirmPassword) return t(errors.confirmPassword);
  return null;
}
