import { createTheme } from "@mui/material/styles";

export function buildAppTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#90caf9" : "#1976d2"
      },
      secondary: {
        main: mode === "dark" ? "#ce93d8" : "#9c27b0"
      },
      background: {
        default: mode === "dark" ? "#0f1216" : "#f6f7fb",
        paper: mode === "dark" ? "#141a21" : "#ffffff"
      }
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: [
        "Inter",
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Arial",
        "sans-serif"
      ].join(",")
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true
        }
      }
    }
  });
}

