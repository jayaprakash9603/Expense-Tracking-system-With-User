import React from "react";
import { useTranslation } from "../../../../hooks/useTranslation";
import { AppSelect } from "../../../../components/ui";
import { ACCESS_LEVEL_OPTIONS } from "../../constants/friendsConstants";

const AccessLevelPicker = ({ value, onChange, disabled = false }) => {
  const { t } = useTranslation();

  return (
    <AppSelect
      size="small"
      fullWidth
      disabled={disabled}
      value={value}
      onValueChange={onChange}
      options={ACCESS_LEVEL_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
      }))}
    />
  );
};

export default AccessLevelPicker;
