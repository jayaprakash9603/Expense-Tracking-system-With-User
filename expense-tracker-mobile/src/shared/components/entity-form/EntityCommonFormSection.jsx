import React from "react";
import { Label } from "@/components/ui/label";
import { AppInput, AppSelect } from "@/shared/components/form";
import { cn } from "@/lib/utils";
import { DEFAULT_ENTITY_ICON_SYMBOL } from "./entityVisualConfig";
import { EntityColorPalettePicker } from "./EntityColorPalettePicker";
import { EntityIconSymbolPicker } from "./EntityIconSymbolPicker";

function FieldError({ error }) {
  if (!error) return null;
  return <p className="text-xs text-destructive">{error}</p>;
}

function FieldShell({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label className={cn(error && "text-destructive")}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      <FieldError error={error} />
    </div>
  );
}

export function EntityCommonFormSection({
  formData,
  errors,
  handleChange,
  labels,
  typeOptions,
  showAmount = false,
  amountDigitsOnly = false,
  iconFieldName = "icon",
}) {
  const selectedIcon = formData?.[iconFieldName] || DEFAULT_ENTITY_ICON_SYMBOL;
  const inputIntent = (fieldName) => (errors?.[fieldName] ? "danger" : "default");

  const handleAmountChange = (event) => {
    const nextValue = event.target.value;
    if (amountDigitsOnly && !/^\d*$/.test(nextValue)) return;
    handleChange("amount", nextValue);
  };

  const topFieldsGridClass = showAmount
    ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    : "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-2">
      <div className={topFieldsGridClass}>
        <FieldShell label={labels.name} required error={errors?.name}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-lg">
              {selectedIcon}
            </span>
            <AppInput
              value={formData?.name || ""}
              onChange={(event) => handleChange("name", event.target.value)}
              className="pl-11"
              intent={inputIntent("name")}
            />
          </div>
        </FieldShell>

        <FieldShell label={labels.description} error={errors?.description}>
          <AppInput
            value={formData?.description || ""}
            onChange={(event) => handleChange("description", event.target.value)}
            intent={inputIntent("description")}
          />
        </FieldShell>

        <FieldShell label={labels.type} required error={errors?.type}>
          <AppSelect
            value={formData?.type || ""}
            onChange={(value) => handleChange("type", value)}
            options={typeOptions}
            required
          />
        </FieldShell>

        {showAmount ? (
          <FieldShell label={labels.amount} required error={errors?.amount}>
            <AppInput
              type="text"
              inputMode="numeric"
              value={formData?.amount || ""}
              onChange={handleAmountChange}
              intent={inputIntent("amount")}
            />
          </FieldShell>
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
        <EntityColorPalettePicker
          className="w-full self-start"
          value={formData?.color}
          onChange={(value) => handleChange("color", value)}
          label={labels.color}
        />
        <EntityIconSymbolPicker
          className="w-full self-start"
          value={formData?.[iconFieldName]}
          onChange={(value) => handleChange(iconFieldName, value)}
          label={labels.icon}
          accentColor={formData?.color}
        />
      </div>
    </div>
  );
}

export default EntityCommonFormSection;
