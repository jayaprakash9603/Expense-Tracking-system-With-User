/**
 * StoryCTA Component
 * Call-to-action buttons at the bottom of story viewer
 */
import React from "react";
import { Box, Button, Chip } from "@mui/material";
import {
  ArrowForward,
  Visibility,
  Payment,
  Settings,
  Assessment,
  Add,
} from "@mui/icons-material";

// Map CTA types to icons
const ctaIcons = {
  GO_TO_BUDGET: ArrowForward,
  VIEW_BUDGET: Visibility,
  MANAGE_BUDGETS: Settings,
  VIEW_BILL: Visibility,
  PAY_BILL: Payment,
  VIEW_REPORT: Assessment,
  VIEW_EXPENSE: Visibility,
  ADD_EXPENSE: Add,
  DISMISS: null,
  EXTERNAL_LINK: ArrowForward,
  CUSTOM: ArrowForward,
};

const StoryCTA = ({ ctaButtons, onCtaClick }) => {
  if (!ctaButtons || ctaButtons.length === 0) {
    return null;
  }

  // Sort by displayOrder
  const sortedButtons = [...ctaButtons].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: 3,
        pt: 2,
        pb: 4,
        zIndex: 10,
        position: "relative",
      }}
    >
      {sortedButtons.map((cta) => {
        const IconComponent = ctaIcons[cta.ctaType] || ArrowForward;
        const isPrimary = cta.isPrimary;

        return (
          <Button
            key={cta.id}
            variant={isPrimary ? "contained" : "outlined"}
            onClick={(e) => {
              e.stopPropagation();
              onCtaClick(cta);
            }}
            startIcon={IconComponent && <IconComponent />}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1rem",
              py: 1.5,
              boxShadow: isPrimary ? "0 4px 14px rgba(0,0,0,0.4)" : "none",
              ...(isPrimary
                ? {
                    backgroundColor: cta.buttonColor || "#fff",
                    color: cta.textColor || "#000",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.9)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
                    },
                    transition: "all 0.2s ease",
                  }
                : {
                    borderColor: "rgba(255,255,255,0.7)",
                    color: "#fff",
                    borderWidth: 2,
                    backdropFilter: "blur(4px)",
                    "&:hover": {
                      borderColor: "#fff",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderWidth: 2,
                    },
                  }),
            }}
          >
            {cta.label}
          </Button>
        );
      })}
    </Box>
  );
};

export default StoryCTA;
