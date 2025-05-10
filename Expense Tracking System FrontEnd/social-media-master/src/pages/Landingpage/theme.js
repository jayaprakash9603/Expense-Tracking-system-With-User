import { createTheme } from "@mui/material/styles";
import { keyframes } from "@mui/system";

const shimmerKeyframes = keyframes({
  "0%": { backgroundPosition: "1000px 0" },
  "100%": { backgroundPosition: "0 0" },
});

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00dac6", // Teal for buttons, checkboxes, headers
    },
    secondary: {
      main: "#ffffff", // White for text, pagination buttons
    },
    background: {
      default: "#121212", // Main container background
      paper: "#1b1b1b", // Paper, cards, menus
    },
    text: {
      primary: "#ffffff", // Primary text (cells, labels)
      secondary: "#00dac6", // Secondary text (headers, accents)
      disabled: "#666666", // Disabled text
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
      color: "#ffffff",
    },
    h1: { fontSize: "2.5rem", fontWeight: 500 },
    h2: { fontSize: "2rem", fontWeight: 500 },
    h3: { fontSize: "1.75rem", fontWeight: 500 },
    h4: { fontSize: "1.5rem", fontWeight: 500 },
    h5: { fontSize: "1.25rem", fontWeight: 500 },
    h6: { fontSize: "1rem", fontWeight: 500 },
    body1: { fontSize: "1rem" },
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem", color: "#666666" },
    subtitle1: { fontSize: "1rem", fontWeight: 500 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
  },
  components: {
    // Layout Components
    MuiBox: {
      styleOverrides: {
        root: {
          backgroundColor: "#121212",
          padding: "10px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: "#121212",
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
          backgroundColor: "#0b0b0b",
          color: "#00dac6",
          fontWeight: "bold",
        },
        cell: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
        },
        row: {
          "&:hover": {
            backgroundColor: "#28282a",
          },
        },
        checkbox: {
          "& .MuiSvgIcon-root": {
            fill: "#666666",
          },
          "&.Mui-checked .MuiSvgIcon-root": {
            color: "#00dac6",
          },
        },
        footerContainer: {
          backgroundColor: "#1b1b1b",
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
          backgroundColor: "#1b1b1b",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          borderBottom: "1px solid #28282a",
        },
        head: {
          backgroundColor: "#0b0b0b",
          color: "#00dac6",
          fontWeight: "bold",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#28282a",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#ffffff",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#00dac6",
          color: "#1b1b1b",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#28282a",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
        deleteIcon: {
          color: "#666666",
          "&:hover": {
            color: "#ffffff",
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
            backgroundColor: "#1b1b1b",
            color: "#ffffff",
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#666666",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00dac6",
          },
          "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00dac6",
          },
          "& .MuiInputLabel-root": {
            color: "#666666",
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
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
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
            backgroundColor: "#1b1b1b",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "1rem",
            lineHeight: "1.5",
            transition: "border-color 0.2s ease-in-out",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#666666",
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
            color: "#666666",
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
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
          marginTop: "4px",
          marginBottom: "4px",
        },
        listbox: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          padding: "8px 0",
          maxHeight: "200px",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#00dac6 #1b1b1b",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#1b1b1b",
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
          color: "#ffffff",
          backgroundColor: "transparent",
          transition:
            "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "#28282a",
            color: "#ffffff",
          },
          '&[aria-selected="true"]': {
            backgroundColor: "#00dac6",
            color: "#1b1b1b",
            fontWeight: 600,
          },
          "&:active": {
            backgroundColor: "#00b8a9",
          },
        },
        noOptions: {
          padding: "8px 16px",
          fontSize: "1rem",
          lineHeight: "1.5",
          color: "#ffffff",
          backgroundColor: "#1b1b1b",
        },
        clearIndicator: {
          color: "#666666",
          padding: "4px",
          "&:hover": {
            color: "#00dac6",
            backgroundColor: "rgba(0, 218, 198, 0.1)",
          },
        },
        popupIndicator: {
          color: "#666666",
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
          color: "#ffffff",
          backgroundColor: "#1b1b1b",
        },
        input: {
          color: "#ffffff",
          fontSize: "1rem",
          lineHeight: "1.5",
          "&::placeholder": {
            color: "#666666",
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
          color: "#666666",
          "&.Mui-checked": {
            color: "#00dac6",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#666666",
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
            backgroundColor: "#666666",
          },
          "& .MuiSwitch-thumb": {
            backgroundColor: "#ffffff",
          },
          "&.Mui-checked .MuiSwitch-track": {
            backgroundColor: "#00dac6",
          },
          "&.Mui-checked .MuiSwitch-thumb": {
            backgroundColor: "#1b1b1b",
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#00dac6",
          "& .MuiSlider-rail": {
            backgroundColor: "#666666",
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
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#28282a",
          },
          "&.Mui-selected": {
            backgroundColor: "#333333",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
        },
        indicator: {
          backgroundColor: "#00dac6",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#666666",
          "&.Mui-selected": {
            color: "#00dac6",
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          color: "#666666",
        },
        li: {
          "& .MuiTypography-root": {
            color: "#ffffff",
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
          backgroundColor: "#1b1b1b",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: "#0b0b0b",
          color: "#00dac6",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          padding: "8px",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          "&:before": {
            backgroundColor: "#28282a",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: "#0b0b0b",
          color: "#00dac6",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
        },
      },
    },

    // Feedback Components
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          borderRadius: "8px",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#0b0b0b",
          color: "#00dac6",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          padding: "8px",
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
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
          backgroundColor: "rgb(27, 27, 27) !important", // Dark gray base for shimmer effect
          backgroundImage:
            "linear-gradient(90deg, rgb(27, 27, 27) 0%, rgb(51, 51, 51) 50%, rgb(27, 27, 27) 100%) !important", // Shimmer gradient
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
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          borderRadius: "4px",
        },
        arrow: {
          color: "#1b1b1b",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "#28282a",
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#28282a",
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: "#ffffff",
        },
        secondary: {
          color: "#666666",
        },
      },
    },
    MuiStep: {
      styleOverrides: {
        root: {
          color: "#666666",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: "#666666",
          "&.Mui-active": {
            color: "#00dac6",
          },
          "&.Mui-completed": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "#666666",
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
              color: "#1b1b1b",
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
          color: "#666666",
          borderColor: "#666666",
          "&.Mui-selected": {
            backgroundColor: "#00dac6",
            color: "#1b1b1b",
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
          backgroundColor: "#1b1b1b",
          color: "#ffffff",
        },
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#28282a",
          },
        },
      },
    },
  },
});

export default theme;
