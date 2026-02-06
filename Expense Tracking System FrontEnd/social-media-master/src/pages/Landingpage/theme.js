import { createTheme } from "@mui/material/styles";
import { keyframes } from "@mui/system";

const shimmerKeyframes = keyframes({
  "0%": { backgroundPosition: "1000px 0" },
  "100%": { backgroundPosition: "0 0" },
});

// Function to create theme based on mode
const createAppTheme = (mode = "dark") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: "#00dac6", // Teal for buttons, checkboxes, headers
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
        secondary: "#00dac6", // Secondary text (headers, accents)
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
            color: "#00dac6",
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
              color: "#00dac6",
            },
          },
          footerContainer: {
            backgroundColor: isDark ? "#1b1b1b" : "#f5f5f5",
            color: "#00dac6",
          },
          footerContainerTypography: {
            "& .MuiTypography-root": {
              color: "#00dac6",
            },
          },
          paginationItem: {
            "& .MuiPaginationItem-root": {
              color: "#00dac6",
              "&:hover": {
                backgroundColor: "rgba(0, 218, 198, 0.1)",
                color: "#00dac6",
              },
            },
          },
          iconButton: {
            "& .MuiIconButton-root": {
              color: "#00dac6",
              "&:hover": {
                backgroundColor: "rgba(0, 218, 198, 0.1)",
                color: "#00dac6",
              },
            },
          },
          select: {
            "& .MuiSelect-select": {
              color: "#00dac6",
            },
            "& .MuiSvgIcon-root": {
              color: "#00dac6",
            },
          },
          sortIcon: {
            "& .MuiDataGrid-sortIcon": {
              color: "#00dac6",
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
            color: "#00dac6",
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
            backgroundColor: "#00dac6",
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
            color: "#00dac6",
            "&:hover": {
              backgroundColor: "rgba(0, 218, 198, 0.1)",
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
              borderColor: "#00dac6",
              borderWidth: "1px",
              borderStyle: "solid",
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00dac6",
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
              color: "#00dac6",
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
              color: "#00dac6",
            },
          },
          outlined: {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00dac6",
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
              borderColor: "#00dac6",
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00dac6",
              borderWidth: "2px",
            },
            "& .MuiInputLabel-root": {
              color: isDark ? "#666666" : "#737373",
              fontSize: "1rem",
              top: "-6px",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#00dac6",
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
            scrollbarColor: isDark ? "#00dac6 #1b1b1b" : "#00dac6 #ffffff",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: isDark ? "#1b1b1b" : "#ffffff",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#00dac6",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#00b8a9",
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
              color: "#00dac6",
              backgroundColor: "rgba(0, 218, 198, 0.1)",
            },
          },
          popupIndicator: {
            color: isDark ? "#666666" : "#9e9e9e",
            padding: "4px",
            "&:hover": {
              color: "#00dac6",
              backgroundColor: "rgba(0, 218, 198, 0.1)",
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
              color: "#00dac6",
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#9e9e9e",
            "&.Mui-checked": {
              color: "#00dac6",
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
              backgroundColor: "#00dac6",
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
            color: "#00dac6",
            "& .MuiSlider-rail": {
              backgroundColor: isDark ? "#666666" : "#9e9e9e",
            },
            "& .MuiSlider-track": {
              backgroundColor: "#00dac6",
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
            backgroundColor: "#00dac6",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#737373",
            "&.Mui-selected": {
              color: "#00dac6",
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
              color: "#00dac6",
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
            color: "#00dac6",
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
            color: "#00dac6",
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
            color: "#00dac6",
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
            color: "#00dac6",
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: "#666666",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#00dac6",
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
              color: "#00dac6",
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
              color: "#00dac6",
            },
            "&.Mui-completed": {
              color: "#00dac6",
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            "& .MuiPaginationItem-root": {
              color: "#00dac6",
              "&:hover": {
                backgroundColor: "rgba(0, 218, 198, 0.1)",
              },
              "&.Mui-selected": {
                backgroundColor: "#00dac6",
                color: isDark ? "#1b1b1b" : "#ffffff",
              },
            },
          },
        },
      },
      MuiRating: {
        styleOverrides: {
          root: {
            color: "#00dac6",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: isDark ? "#666666" : "#737373",
            borderColor: isDark ? "#666666" : "#e0e0e0",
            "&.Mui-selected": {
              backgroundColor: "#00dac6",
              color: isDark ? "#1b1b1b" : "#ffffff",
            },
            "&:hover": {
              backgroundColor: "rgba(0, 218, 198, 0.1)",
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
