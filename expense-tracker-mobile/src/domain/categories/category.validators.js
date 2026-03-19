export function validateCategory(data) {
  const errors = {};
  if (!data.name?.trim()) errors.name = "validation.nameRequired";
  if (data.name && data.name.trim().length < 2) errors.name = "validation.nameTooShort";
  if (!data.type) errors.type = "validation.typeRequired";
  return { valid: Object.keys(errors).length === 0, errors };
}
