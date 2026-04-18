import { createTheme } from "@mui/material/styles";

export function buildAppTheme(mode) {
  const scrollbarThumb = mode === "dark" ? "rgba(144, 202, 249, 0.45)" : "rgba(25, 118, 210, 0.4)";
  const scrollbarThumbHover = mode === "dark" ? "rgba(144, 202, 249, 0.62)" : "rgba(25, 118, 210, 0.55)";
  const scrollbarTrack = mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 18, 22, 0.08)";

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
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            scrollbarColor: `${scrollbarThumb} ${scrollbarTrack}`
          },
          "*::-webkit-scrollbar": {
            width: 10,
            height: 10
          },
          "*::-webkit-scrollbar-track": {
            backgroundColor: scrollbarTrack,
            borderRadius: 10
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: scrollbarThumb,
            borderRadius: 10,
            border: "2px solid transparent",
            backgroundClip: "content-box"
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: scrollbarThumbHover
          }
        }
      }
    }
  });
}

