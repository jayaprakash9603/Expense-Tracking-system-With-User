import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { isFeatureEnabledInState } from "../../config/featureCatalog";
import OverflowActionMenu, {
  createDefaultReportMenuItems,
} from "./OverflowActionMenu";

export { createDefaultReportMenuItems };

export default function ReportActionsMenu({
  menuItems = [],
  ariaLabel = "More actions",
  exportFeatureKey = "reports.export",
  buttonSize = "medium",
}) {
  const featureFlags = useSelector((state) => state.featureFlags);
  const exportEnabled = isFeatureEnabledInState(featureFlags, exportFeatureKey);

  const visibleItems = useMemo(
    () =>
      exportEnabled
        ? menuItems
        : menuItems.filter((item) => item.id !== "export"),
    [exportEnabled, menuItems]
  );

  return (
    <OverflowActionMenu
      items={visibleItems}
      ariaLabel={ariaLabel}
      buttonSize={buttonSize}
    />
  );
}

ReportActionsMenu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
        PropTypes.string,
      ]),
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      dividerBefore: PropTypes.bool,
    })
  ),
  ariaLabel: PropTypes.string,
  exportFeatureKey: PropTypes.string,
  buttonSize: PropTypes.oneOf(["small", "medium"]),
};
