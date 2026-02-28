import React from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import CopyExportActions from "../../common/CopyExportActions";

const DrawerHeader = ({
  title,
  subtitle,
  colors,
  onClose,
  getCopyText,
  getExportText,
  getExportFilename,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", p: 2, gap: 1 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 14 }}>{title}</Typography>
        <Typography sx={{ opacity: 0.75, fontSize: 12 }}>{subtitle}</Typography>
      </Box>

      <CopyExportActions
        getCopyText={getCopyText}
        getExportText={getExportText}
        getExportFilename={getExportFilename}
      />

      <IconButton onClick={onClose} sx={{ color: colors?.primary_text }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

DrawerHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  colors: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  getCopyText: PropTypes.func.isRequired,
  getExportText: PropTypes.func.isRequired,
  getExportFilename: PropTypes.func.isRequired,
};

export default DrawerHeader;
