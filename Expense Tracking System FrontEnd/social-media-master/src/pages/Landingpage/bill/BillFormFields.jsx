import React from "react";
import NameInput from "./NameInput";
import DateInput from "./DateInput";
import TypeAutocomplete from "./TypeAutoComplete";
import PaymentMethodAutocomplete from "./PaymentMethodAutoComplete";
import CategoryAutocomplete from "./CategoryAutoComplete";
import DescriptionInput from "./DescriptionInput";

const BillFormFields = ({
  billData,
  setBillData,
  errors,
  setErrors,
  friendId,
}) => {
  const handleFieldChange = (field, value) => {
    setBillData((prev) => ({ ...prev, [field]: value }));
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile: Stack all fields vertically, Tablet+: 2 columns, Desktop: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <NameInput
          value={billData.name}
          onChange={(value) => handleFieldChange("name", value)}
          error={errors.name}
          onErrorClear={() => clearError("name")}
        />

        <DateInput
          value={billData.date}
          onChange={(value) => handleFieldChange("date", value)}
          error={errors.date}
          onErrorClear={() => clearError("date")}
          friendId={friendId}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TypeAutocomplete
          value={billData.type}
          onChange={(value) => handleFieldChange("type", value)}
          error={errors.type}
          onErrorClear={() => clearError("type")}
        />

        <PaymentMethodAutocomplete
          value={billData.paymentMethod}
          onChange={(value) => handleFieldChange("paymentMethod", value)}
          billType={billData.type}
          friendId={friendId}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryAutocomplete
          value={billData.category}
          onChange={(value) => handleFieldChange("category", value)}
          billType={billData.type}
          friendId={friendId}
        />

        {/* Description takes full width on mobile, half on larger screens */}
        <div className="lg:col-span-1">
          <DescriptionInput
            value={billData.description}
            onChange={(value) => handleFieldChange("description", value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BillFormFields;
