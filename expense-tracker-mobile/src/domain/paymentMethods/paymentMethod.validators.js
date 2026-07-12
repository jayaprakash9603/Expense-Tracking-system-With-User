export function validatePaymentMethod(data) {
  const errors = {};

  const trimmedName = data?.name?.trim();
  if (!trimmedName) errors.name = "validation.nameRequired";
  if (trimmedName && trimmedName.length < 2) errors.name = "validation.nameTooShort";
  if (!data?.type) errors.type = "validation.typeRequired";

  const rawAmount = String(data?.amount ?? "").trim();
  if (!rawAmount) {
    errors.amount = "validation.amountRequired";
  } else if (Number.isNaN(Number(rawAmount))) {
    errors.amount = "validation.amountInvalid";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export default validatePaymentMethod;
