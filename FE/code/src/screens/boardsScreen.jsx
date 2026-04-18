import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { useAuth } from "../auth/authProvider.jsx";
import { BoardTile } from "../components/boardTile.jsx";
import { CreateBoardDialog } from "../components/createBoardDialog.jsx";
import { SharedEmpty } from "../components/sharedEmpty.jsx";
import { SharedError } from "../components/sharedError.jsx";
import { SharedLoading } from "../components/sharedLoading.jsx";
import { fetchBoardsForUser } from "../services/boardService.js";

export function BoardsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const reloadBoards = useCallback(async () => {
    if (!userId) {
      setBoards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      const next = await fetchBoardsForUser(userId);
      setBoards(next);
    } catch (err) {
      setLoadError(err?.message ?? "Could not load boards.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reloadBoards();
  }, [reloadBoards]);

  const openBoard = (boardId) => {
    navigate(`/app/boards/${boardId}`);
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Boards
            </Typography>
            <Typography color="text.secondary">
              Open a board to work on lists and cards, or create a new board to get started.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
          >
            Create board
          </Button>
        </Stack>
      </Paper>

      {loading ? <SharedLoading label="Loading boards..." /> : null}

      {!loading && loadError ? (
        <SharedError title="Could not load boards" message={loadError} onRetry={reloadBoards} />
      ) : null}

      {!loading && !loadError && boards.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 0 }}>
          <SharedEmpty
            title="No boards yet"
            description="Create your first board to organize work with lists and cards."
            actionLabel="Create board"
            onAction={() => setCreateOpen(true)}
          />
        </Paper>
      ) : null}

      {!loading && !loadError && boards.length > 0 ? (
        <Grid container spacing={2}>
          {boards.map((board) => (
            <Grid key={board.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <BoardTile
                title={board.name}
                description={board.description}
                onOpen={() => openBoard(board.id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}

      <CreateBoardDialog
        open={createOpen}
        userId={userId}
        onClose={() => setCreateOpen(false)}
        onCreated={reloadBoards}
      />
    </Stack>
  );
}
