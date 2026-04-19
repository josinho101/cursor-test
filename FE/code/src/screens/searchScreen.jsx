import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/authProvider.jsx";
import { SharedEmpty } from "../components/sharedEmpty.jsx";
import { SharedError } from "../components/sharedError.jsx";
import { SharedLoading } from "../components/sharedLoading.jsx";
import { searchBoardsAndCards } from "../services/searchService.js";

export function SearchScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const assignableMembers = useMemo(() => {
    if (!user) return [];
    return [
      { id: user.id, name: user.name },
      { id: "demo-member-1", name: "Alex Chen" },
      { id: "demo-member-2", name: "Sam Rivera" }
    ];
  }, [user]);

  const initialQ = searchParams.get("q") ?? "";
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [boardMatches, setBoardMatches] = useState([]);
  const [cardMatches, setCardMatches] = useState([]);
  const [ranQuery, setRanQuery] = useState("");

  const runSearch = useCallback(
    async (qRaw) => {
      if (!userId) {
        setBoardMatches([]);
        setCardMatches([]);
        setRanQuery("");
        return;
      }
      const q = String(qRaw ?? "").trim();
      setLoading(true);
      setError("");
      try {
        const res = await searchBoardsAndCards(userId, q, assignableMembers);
        setBoardMatches(res.boardMatches);
        setCardMatches(res.cardMatches);
        setRanQuery(res.query);
      } catch (err) {
        setError(err?.message ?? "Search failed.");
        setBoardMatches([]);
        setCardMatches([]);
        setRanQuery("");
      } finally {
        setLoading(false);
      }
    },
    [userId, assignableMembers]
  );

  useEffect(() => {
    setInput(initialQ);
  }, [initialQ]);

  useEffect(() => {
    void runSearch(initialQ);
  }, [initialQ, runSearch]);

  const hasQuery = Boolean(initialQ.trim());
  const noResults =
    hasQuery && !loading && !error && boardMatches.length === 0 && cardMatches.length === 0;

  const applyQueryToUrl = (q) => {
    const next = new URLSearchParams(searchParams);
    const trimmed = q.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} to="/app" underline="hover" color="inherit">
          Boards
        </Link>
        <Typography color="text.primary">Search</Typography>
      </Breadcrumbs>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          component="form"
          spacing={2}
          onSubmit={(e) => {
            e.preventDefault();
            applyQueryToUrl(input);
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Search boards and cards
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Matches titles, descriptions, labels, assignees, and due dates stored on your boards.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
            <TextField
              fullWidth
              label="Search query"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try a board name, label, or due date…"
              InputProps={{
                startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "action.active" }} />
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress color="inherit" size={18} /> : null}
              sx={{ alignSelf: { xs: "stretch", sm: "center" }, minWidth: 120 }}
            >
              Search
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? <SharedLoading label="Searching…" /> : null}

      {!loading && error ? (
        <SharedError title="Search could not complete" message={error} onRetry={() => void runSearch(initialQ)} />
      ) : null}

      {!loading && !error && !hasQuery ? (
        <Paper variant="outlined" sx={{ p: 0 }}>
          <SharedEmpty
            title="Enter a search term"
            description="Search looks across board names, card titles, descriptions, labels, members, and due dates."
          />
        </Paper>
      ) : null}

      {!loading && !error && hasQuery && noResults ? (
        <Paper variant="outlined" sx={{ p: 0 }}>
          <SharedEmpty
            title="No matches found"
            description={`Nothing matched “${ranQuery || initialQ.trim()}”. Try another keyword or check spelling.`}
            actionLabel="Clear search"
            onAction={() => {
              setInput("");
              applyQueryToUrl("");
            }}
          />
        </Paper>
      ) : null}

      {!loading && !error && hasQuery && boardMatches.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
            Boards ({boardMatches.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Matched board name or description.
          </Typography>
          <List dense disablePadding>
            {boardMatches.map((b) => (
              <ListItemButton
                key={b.id}
                component={RouterLink}
                to={`/app/boards/${b.id}`}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary={b.name} secondary={b.description?.trim() || "No description"} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      ) : null}

      {!loading && !error && hasQuery && cardMatches.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
            Cards ({cardMatches.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Matched title, description, labels, assignees, or due date.
          </Typography>
          <List dense disablePadding>
            {cardMatches.map(({ board, list, card }) => {
              const desc = card.description?.trim() ?? "";
              const snippet = desc
                ? `${desc.slice(0, 140)}${desc.length > 140 ? "…" : ""}`
                : "No description";
              return (
                <ListItemButton
                  key={`${board.id}-${card.id}`}
                  component={RouterLink}
                  to={`/app/boards/${board.id}?card=${encodeURIComponent(card.id)}`}
                  sx={{ borderRadius: 1, alignItems: "flex-start" }}
                >
                  <ListItemText
                    primary={card.title}
                    secondary={`${board.name} · ${list.name} — ${snippet}`}
                    secondaryTypographyProps={{ sx: { whiteSpace: "normal" } }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>
      ) : null}
    </Stack>
  );
}
