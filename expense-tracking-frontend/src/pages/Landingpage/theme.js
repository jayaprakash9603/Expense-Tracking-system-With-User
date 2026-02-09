import { createTheme } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import { getExpandedPalette, COLOR_PALETTES } from "../../config/colorPalettes";
import { alpha as alphaUtil } from "../../utils/colorUtils";

const shimmerKeyframes = keyframes({
  "0%": { backgroundPosition: "1000px 0" },
  "100%": { backgroundPosition: "0 0" },
});

// Function to create theme based on mode and color palette
const createAppTheme = (mode = "dark", paletteId = "teal") => {
  const isDark = mode === "dark";

  // Get expanded palette colors based on palette ID
  const palette = getExpandedPalette(paletteId);
  const accentColor = palette.primaryShades[500] || palette.primary; // Main accent color (e.g., #00dac6 for teal)
  const accentLight = palette.primaryShades[400] || palette.primary;
  const accentDark = palette.primaryShades[600] || palette.primary;
  const accentHover = alphaUtil(accentColor, 0.1); // For hover backgrounds

  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: accentColor, // Dynamic accent for buttons, checkboxes, headers
        light: accentLight,
        dark: accentDark,
      },
      secondary: {
        main: isDark ? "#ffffff" : "#1a1a1a", // White for dark mode, dark for light mode
      },
      background: {
        default: isDark ? "#121212" : "#ffffff", // Main container background
        paper: isDark ? "#1b1b1b" : "#f5f5f5", // Paper, cards, menus
      },
      text: {
        primary: isDark ? "#ffffff" : "#1a1a1a", // Primary text
        secondary: accentColor, // Secondary text (headers, accents)
        disabled: isDark ? "#666666" : "#9e9e9e", // Disabled text
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
        color: isDark ? "#ffffff" : "#1a1a1a",
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
            backgroundColor: isDark ? "#121212" : "#ffffff",
            padding: "10px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#f5f5f5",
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
            backgroundColor: isDark ? "#121212" : "#ffffff",
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
            backgroundColor: isDark ? "#0b0b0b" : "#e6e6e6",
            color: accentColor,
            fontWeight: "bold",
          },
          cell: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
          },
          row: {
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
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
            backgroundColor: isDark ? "#1b1b1b" : "#f5f5f5",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: isDark ? "#ffffff" : "#1a1a1a",
            borderBottom: isDark ? "1px solid #28282a" : "1px solid #e0e0e0",
          },
          head: {
            backgroundColor: isDark ? "#0b0b0b" : "#e6e6e6",
            color: accentColor,
            fontWeight: "bold",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: isDark ? "#ffffff" : "#1a1a1a",
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
            backgroundColor: isDark ? "#28282a" : "#e0e0e0",
            color: isDark ? "#ffffff" : "#1a1a1a",
            "&:hover": {
              backgroundColor: isDark ? "#333333" : "#d0d0d0",
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
              backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
              color: isDark ? "#ffffff" : "#1a1a1a",
              borderRadius: "8px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#666666" : "#e0e0e0",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
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
              backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
              color: isDark ? "#ffffff" : "#1a1a1a",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "1rem",
              lineHeight: "1.5",
              transition: "border-color 0.2s ease-in-out",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#666666" : "#e0e0e0",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
            borderRadius: "8px",
            boxShadow: isDark
              ? "0px 4px 12px rgba(0, 0, 0, 0.5)"
              : "0px 4px 12px rgba(0, 0, 0, 0.1)",
            marginTop: "4px",
            marginBottom: "4px",
          },
          listbox: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
            padding: "8px 0",
            maxHeight: "200px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: isDark
              ? `${accentColor} #1b1b1b`
              : `${accentColor} #ffffff`,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: isDark ? "#1b1b1b" : "#ffffff",
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
            color: isDark ? "#ffffff" : "#1a1a1a",
            backgroundColor: "transparent",
            transition:
              "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
              color: isDark ? "#ffffff" : "#1a1a1a",
            },
            '&[aria-selected="true"]': {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
              color: isDark ? "#ffffff" : "#1a1a1a",
              fontWeight: 600,
            },
            "&:active": {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
            },
          },
          noOptions: {
            padding: "8px 16px",
            fontSize: "1rem",
            lineHeight: "1.5",
            color: isDark ? "#ffffff" : "#1a1a1a",
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
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
            color: isDark ? "#ffffff" : "#1a1a1a",
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
          },
          input: {
            color: isDark ? "#ffffff" : "#1a1a1a",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
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
            color: isDark ? "#ffffff" : "#1a1a1a",
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
            },
            "&.Mui-selected": {
              backgroundColor: isDark ? "#333333" : "#e0e0e0",
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#f5f5f5",
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
              color: isDark ? "#ffffff" : "#1a1a1a",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
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
            backgroundColor: isDark ? "#0b0b0b" : "#e6e6e6",
            color: accentColor,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            padding: "8px",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
            "&:before": {
              backgroundColor: isDark ? "#28282a" : "#e0e0e0",
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0b0b0b" : "#e6e6e6",
            color: accentColor,
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
          },
        },
      },

      // Feedback Components
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
            borderRadius: "8px",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0b0b0b" : "#e6e6e6",
            color: accentColor,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            padding: "8px",
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
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
              : "rgb(224, 224, 224) !important",
            backgroundImage: isDark
              ? "linear-gradient(90deg, rgb(27, 27, 27) 0%, rgb(51, 51, 51) 50%, rgb(27, 27, 27) 100%) !important"
              : "linear-gradient(90deg, rgb(224, 224, 224) 0%, rgb(245, 245, 245) 50%, rgb(224, 224, 224) 100%) !important",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
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
            backgroundColor: isDark ? "#28282a" : "#e0e0e0",
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            color: isDark ? "#ffffff" : "#1a1a1a",
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: isDark ? "#ffffff" : "#1a1a1a",
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
              color: isDark ? "#ffffff" : "#1a1a1a",
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
            borderColor: isDark ? "#666666" : "#e0e0e0",
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
            backgroundColor: isDark ? "#1b1b1b" : "#ffffff",
            color: isDark ? "#ffffff" : "#1a1a1a",
          },
        },
      },
      MuiTreeItem: {
        styleOverrides: {
          root: {
            color: isDark ? "#ffffff" : "#1a1a1a",
            "&:hover": {
              backgroundColor: isDark ? "#28282a" : "#f0f0f0",
            },
          },
        },
      },
    },
  });
};

export default createAppTheme;
