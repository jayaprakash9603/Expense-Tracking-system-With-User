import { createTheme } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import { getExpandedPalette, getSurfaceColors } from "../../config/colorPalettes";
import { alpha as alphaUtil } from "../../utils/colorUtils";

const shimmerKeyframes = keyframes({
  "0%": { backgroundPosition: "1000px 0" },
  "100%": { backgroundPosition: "0 0" },
});

const createAppTheme = (mode = "dark", paletteId = "teal") => {
  const isDark = mode === "dark";

  const palette = getExpandedPalette(paletteId);
  const surfaces = getSurfaceColors(palette, mode);
  const accentColor = palette.primaryShades[500] || palette.primary;
  const accentLight = palette.primaryShades[400] || palette.primary;
  const accentDark = palette.primaryShades[600] || palette.primary;
  const accentHover = alphaUtil(accentColor, 0.1);

  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: accentColor, // Dynamic accent for buttons, checkboxes, headers
        light: accentLight,
        dark: accentDark,
      },
      secondary: {
        main: surfaces.text.primary,
      },
      background: {
        default: surfaces.background.default,
        paper: surfaces.background.paper,
      },
      text: {
        primary: surfaces.text.primary,
        secondary: accentColor,
        disabled: isDark ? "#666666" : "#9e9e9e",
      },
      error: {
        main: "#f44336", // Red for errors
      },
      warning: {
        main: "#ff9800", // Orange for warnings
      },
      info: {
        main: "#2196f3", // Blue for info
      },
      success: {
        main: "#4caf50", // Green for success
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      allVariants: {
        color: surfaces.text.primary,
      },
      h1: { fontSize: "2.5rem", fontWeight: 500 },
      h2: { fontSize: "2rem", fontWeight: 500 },
      h3: { fontSize: "1.75rem", fontWeight: 500 },
      h4: { fontSize: "1.5rem", fontWeight: 500 },
      h5: { fontSize: "1.25rem", fontWeight: 500 },
      h6: { fontSize: "1rem", fontWeight: 500 },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.875rem" },
      caption: { fontSize: "0.75rem", color: isDark ? "#666666" : "#737373" },
      subtitle1: { fontSize: "1rem", fontWeight: 500 },
      subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
    },
    components: {
      // Layout Components
      MuiBox: {
        styleOverrides: {
          root: {
            backgroundColor: surfaces.background.default,
            padding: "10px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: surfaces.background.paper,
            padding: "10px",
            borderRadius: "8px",
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.5)"
              : "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            backgroundColor: surfaces.background.default,
            padding: "16px",
          },
        },
      },

      // Data Display Components
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 0,
          },
          columnHeaders: {
            backgroundColor: isDark ? "#0b0b0b" : surfaces.surface.level2,
            color: accentColor,
            fontWeight: "bold",
          },
          cell: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
          },
          row: {
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
            },
          },
          checkbox: {
            "& .MuiSvgIcon-root": {
              fill: isDark ? "#666666" : "#9e9e9e",
            },
            "&.Mui-checked .MuiSvgIcon-root": {
              color: accentColor,
            },
          },
          footerContainer: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.background.paper,
            color: accentColor,
          },
          footerContainerTypography: {
            "& .MuiTypography-root": {
              color: accentColor,
            },
          },
          paginationItem: {
            "& .MuiPaginationItem-root": {
              color: accentColor,
              "&:hover": {
                backgroundColor: accentHover,
                color: accentColor,
              },
            },
          },
          iconButton: {
            "& .MuiIconButton-root": {
              color: accentColor,
              "&:hover": {
                backgroundColor: accentHover,
                color: accentColor,
              },
            },
          },
          select: {
            "& .MuiSelect-select": {
              color: accentColor,
            },
            "& .MuiSvgIcon-root": {
              color: accentColor,
            },
          },
          sortIcon: {
            "& .MuiDataGrid-sortIcon": {
              color: accentColor,
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: surfaces.text.primary,
            borderBottom: `1px solid ${surfaces.border.light}`,
          },
          head: {
            backgroundColor: isDark ? "#0b0b0b" : surfaces.surface.level2,
            color: accentColor,
            fontWeight: "bold",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: surfaces.text.primary,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: accentColor,
            color: isDark ? "#1b1b1b" : "#ffffff",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#28282a" : surfaces.surface.level3,
            color: surfaces.text.primary,
            "&:hover": {
              backgroundColor: isDark ? "#333333" : surfaces.border.default,
            },
          },
          deleteIcon: {
            color: isDark ? "#666666" : "#9e9e9e",
            "&:hover": {
              color: isDark ? "#ffffff" : "#1a1a1a",
            },
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            backgroundColor: "#f44336",
            color: "#ffffff",
          },
        },
      },

      // Input Components
      // MuiButton: {
      //   styleOverrides: {
      //     root: {
      //       backgroundColor: "#00dac6",
      //       color: "white",
      //       textTransform: "none",
      //       borderRadius: "8px",
      //       // &:hover removed
      //     },
      //     outlined: {
      //       borderColor: "#00dac6",
      //       color: "white",
      //       // &:hover removed
      //     },
      //     text: {
      //       color: "white",
      //       // &:hover removed
      //     },
      //   },
      // },

      MuiIconButton: {
        styleOverrides: {
          root: {
            color: accentColor,
            "&:hover": {
              backgroundColor: accentHover,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
              color: surfaces.text.primary,
              borderRadius: "8px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#666666" : surfaces.border.default,
              borderWidth: "1px",
              borderStyle: "solid",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: accentColor,
              borderWidth: "1px",
              borderStyle: "solid",
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: accentColor,
              borderWidth: "2px",
              borderStyle: "solid",
            },
            "& .Mui-error .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f44336",
              borderWidth: "2px",
              borderStyle: "solid",
            },
            "& .MuiInputLabel-root": {
              color: isDark ? "#666666" : "#737373",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: accentColor,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            "& .MuiSvgIcon-root": {
              color: accentColor,
            },
          },
          outlined: {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: accentColor,
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            display: "flex",
            width: "100%",
            maxWidth: "350px",
            "& .MuiInputBase-root": {
              backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
              color: surfaces.text.primary,
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "1rem",
              lineHeight: "1.5",
              transition: "border-color 0.2s ease-in-out",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#666666" : surfaces.border.default,
              borderWidth: "1px",
              borderStyle: "solid",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: accentColor,
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: accentColor,
              borderWidth: "2px",
            },
            "& .MuiInputLabel-root": {
              color: isDark ? "#666666" : "#737373",
              fontSize: "1rem",
              top: "-6px",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: accentColor,
            },
            "& .MuiAutocomplete-endAdornment": {
              display: "flex",
              alignItems: "center",
              gap: "4px",
            },
          },
          paper: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            borderRadius: "8px",
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.5)"
              : "0px 4px 12px rgba(0, 0, 0, 0.1)",
            marginTop: "4px",
            marginBottom: "4px",
          },
          listbox: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            padding: "8px 0",
            maxHeight: "200px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: `${accentColor} ${isDark ? "#1b1b1b" : surfaces.surface.level0}`,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: isDark ? "#1b1b1b" : surfaces.surface.level0,
            },
            "&::-webkit-scrollbar-thumb": {
              background: accentColor,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: accentDark,
            },
          },
          option: {
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "40px",
            padding: "8px 16px",
            fontSize: "1rem",
            lineHeight: "1.5",
            color: surfaces.text.primary,
            backgroundColor: "transparent",
            transition:
              "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
              color: surfaces.text.primary,
            },
            '&[aria-selected="true"]': {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
              color: surfaces.text.primary,
              fontWeight: 600,
            },
            "&:active": {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
            },
          },
          noOptions: {
            padding: "8px 16px",
            fontSize: "1rem",
            lineHeight: "1.5",
            color: surfaces.text.primary,
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
          },
          clearIndicator: {
            color: isDark ? "#666666" : "#9e9e9e",
            padding: "4px",
            "&:hover": {
              color: accentColor,
              backgroundColor: accentHover,
            },
          },
          popupIndicator: {
            color: isDark ? "#666666" : "#9e9e9e",
            padding: "4px",
            "&:hover": {
              color: accentColor,
              backgroundColor: accentHover,
            },
          },
          loading: {
            padding: "8px 16px",
            fontSize: "1rem",
            lineHeight: "1.5",
            color: surfaces.text.primary,
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
          },
          input: {
            color: surfaces.text.primary,
            fontSize: "1rem",
            lineHeight: "1.5",
            "&::placeholder": {
              color: isDark ? "#666666" : "#737373",
              opacity: 1,
            },
          },
          endAdornment: {
            display: "flex",
            alignItems: "center",
            gap: "4px",
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#9e9e9e",
            "&.Mui-checked": {
              color: accentColor,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#9e9e9e",
            "&.Mui-checked": {
              color: accentColor,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            "& .MuiSwitch-track": {
              backgroundColor: isDark ? "#666666" : "#9e9e9e",
            },
            "& .MuiSwitch-thumb": {
              backgroundColor: "#ffffff",
            },
            "&.Mui-checked .MuiSwitch-track": {
              backgroundColor: accentColor,
            },
            "&.Mui-checked .MuiSwitch-thumb": {
              backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: accentColor,
            "& .MuiSlider-rail": {
              backgroundColor: isDark ? "#666666" : "#9e9e9e",
            },
            "& .MuiSlider-track": {
              backgroundColor: accentColor,
            },
            "& .MuiSlider-thumb": {
              backgroundColor: "#ffffff",
            },
          },
        },
      },

      // Navigation Components
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            borderRadius: "8px",
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.5)"
              : "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: surfaces.text.primary,
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
            },
            "&.Mui-selected": {
              backgroundColor: isDark ? "#333333" : surfaces.surface.level3,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.background.paper,
          },
          indicator: {
            backgroundColor: accentColor,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#737373",
            "&.Mui-selected": {
              color: accentColor,
            },
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#737373",
          },
          li: {
            "& .MuiTypography-root": {
              color: surfaces.text.primary,
            },
            "&:hover .MuiTypography-root": {
              color: accentColor,
            },
          },
        },
      },

      // Surface Components
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            borderRadius: "8px",
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.5)"
              : "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0b0b0b" : surfaces.surface.level2,
            color: accentColor,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            padding: "8px",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            "&:before": {
              backgroundColor: isDark ? "#28282a" : surfaces.border.default,
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0b0b0b" : surfaces.surface.level2,
            color: accentColor,
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
          },
        },
      },

      // Feedback Components
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            borderRadius: "8px",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0b0b0b" : surfaces.surface.level2,
            color: accentColor,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            padding: "8px",
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            borderRadius: "8px",
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.5)"
              : "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            borderRadius: "8px",
          },
          standardSuccess: {
            backgroundColor: "#4caf50",
            color: "#ffffff",
          },
          standardError: {
            backgroundColor: "#f44336",
            color: "#ffffff",
          },
          standardWarning: {
            backgroundColor: "#ff9800",
            color: "#ffffff",
          },
          standardInfo: {
            backgroundColor: "#2196f3",
            color: "#ffffff",
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: accentColor,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: "#666666",
            "& .MuiLinearProgress-bar": {
              backgroundColor: accentColor,
            },
          },
        },
      },

      // Other Components
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? "rgb(27, 27, 27) !important"
              : `${surfaces.surface.level3} !important`,
            backgroundImage: isDark
              ? "linear-gradient(90deg, rgb(27, 27, 27) 0%, rgb(51, 51, 51) 50%, rgb(27, 27, 27) 100%) !important"
              : `linear-gradient(90deg, ${surfaces.surface.level3} 0%, ${surfaces.surface.hover} 50%, ${surfaces.surface.level3} 100%) !important`,
            backgroundSize: "1000px 100%",
            animation: `${shimmerKeyframes} 2s infinite linear`,
            borderRadius: "8px",
          },
        },
      },
      MuiModal: {
        styleOverrides: {
          root: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            zIndex: 1300,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? "#1b1b1b" : "#616161",
            color: "#ffffff",
            borderRadius: "4px",
          },
          arrow: {
            color: isDark ? "#1b1b1b" : "#616161",
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
            borderRadius: "8px",
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.5)"
              : "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#28282a" : surfaces.border.default,
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            color: surfaces.text.primary,
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: surfaces.text.primary,
          },
          secondary: {
            color: isDark ? "#666666" : "#737373",
          },
        },
      },
      MuiStep: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#9e9e9e",
          },
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          label: {
            color: isDark ? "#666666" : "#737373",
            "&.Mui-active": {
              color: accentColor,
            },
            "&.Mui-completed": {
              color: surfaces.text.primary,
            },
          },
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#9e9e9e",
            "&.Mui-active": {
              color: accentColor,
            },
            "&.Mui-completed": {
              color: accentColor,
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            "& .MuiPaginationItem-root": {
              color: accentColor,
              "&:hover": {
                backgroundColor: accentHover,
              },
              "&.Mui-selected": {
                backgroundColor: accentColor,
                color: isDark ? "#1b1b1b" : "#ffffff",
              },
            },
          },
        },
      },
      MuiRating: {
        styleOverrides: {
          root: {
            color: accentColor,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#737373",
            borderColor: isDark ? "#666666" : surfaces.border.default,
            "&.Mui-selected": {
              backgroundColor: accentColor,
              color: isDark ? "#1b1b1b" : "#ffffff",
            },
            "&:hover": {
              backgroundColor: accentHover,
            },
          },
        },
      },
      MuiTreeView: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : surfaces.surface.level0,
            color: surfaces.text.primary,
          },
        },
      },
      MuiTreeItem: {
        styleOverrides: {
          root: {
            color: surfaces.text.primary,
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : surfaces.surface.hover,
            },
          },
        },
      },
    },
  });
};

export default createAppTheme;
