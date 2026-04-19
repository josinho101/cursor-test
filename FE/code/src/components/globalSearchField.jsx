import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { InputAdornment, Paper, TextField } from "@mui/material";

/**
 * Compact search field for the app header; navigates to `/app/search` with query.
 */
export function GlobalSearchField() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const submit = () => {
    const q = value.trim();
    if (!q) {
      navigate("/app/search");
      return;
    }
    navigate(`/app/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Paper
      component="form"
      variant="outlined"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      sx={{
        px: 1,
        py: 0.25,
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        flex: 1,
        maxWidth: 420,
        borderRadius: 2,
        bgcolor: "action.hover"
      }}
    >
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search boards and cards…"
        variant="standard"
        fullWidth
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" color="action" />
            </InputAdornment>
          )
        }}
        inputProps={{
          "aria-label": "Search boards and cards",
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }
        }}
        sx={{ mx: 0.5 }}
      />
    </Paper>
  );
}
