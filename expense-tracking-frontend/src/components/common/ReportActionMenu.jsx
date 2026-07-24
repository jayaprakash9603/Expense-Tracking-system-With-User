import React, { useMemo } from "react";
import PropTypes from "prop-types";
import OverflowActionMenu, {
  buildReportOverflowItems,
} from "./OverflowActionMenu";

const ReportActionMenu = ({
  onExport,
  onCustomize,
  onRefresh,
  onDownloadPdf,
  onFilter,
  ariaLabel = "Report actions",
  buttonSize = "medium",
}) => {
  const items = useMemo(
    () =>
      buildReportOverflowItems({
        onRefresh,
        onExport,
        onDownloadPdf,
        onFilter,
        onCustomize,
      }),
    [onRefresh, onExport, onDownloadPdf, onFilter, onCustomize]
  );

  return (
    <OverflowActionMenu
      items={items}
      ariaLabel={ariaLabel}
      buttonSize={buttonSize}
      className="overflow-action-menu-trigger"
    />
  );
};

ReportActionMenu.propTypes = {
  onExport: PropTypes.func,
  onCustomize: PropTypes.func,
  onRefresh: PropTypes.func,
  onDownloadPdf: PropTypes.func,
  onFilter: PropTypes.func,
  ariaLabel: PropTypes.string,
  buttonSize: PropTypes.oneOf(["small", "medium"]),
};

export default ReportActionMenu;
