import React from "react";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { useTranslation } from "../../../../hooks/useTranslation";
import NoDataPlaceholder from "../../../../components/NoDataPlaceholder";

const FriendsEmptyState = ({ section, icon, compact = false }) => {
  const { t } = useTranslation();
  const title = t(`friends.empty.${section}`);
  const subtitle = t(`friends.empty.${section}Desc`);
  const iconEl = icon || <PersonOffIcon />;

  return (
    <NoDataPlaceholder
      message={title}
      subMessage={subtitle}
      icon={React.cloneElement(iconEl, { sx: { fontSize: compact ? 36 : 52 } })}
      iconSize={compact ? 36 : 52}
      size={compact ? "sm" : "lg"}
      height={compact ? 140 : 280}
      fullWidth
      style={{ borderRadius: "12px" }}
    />
  );
};

export default FriendsEmptyState;
