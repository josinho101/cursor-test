import React, { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumbs,
  Button,
  Link,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useAuth } from "../auth/authProvider.jsx";
import { DeleteBoardDialog } from "../components/deleteBoardDialog.jsx";
import { EditBoardDialog } from "../components/editBoardDialog.jsx";
import { SharedEmpty } from "../components/sharedEmpty.jsx";
import { SharedError } from "../components/sharedError.jsx";
import { SharedLoading } from "../components/sharedLoading.jsx";
import { fetchBoardById } from "../services/boardService.js";

export function BoardDetailScreen() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const reloadBoard = useCallback(async () => {
    if (!userId || !boardId) {
      setBoard(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      const next = await fetchBoardById(userId, boardId);
      setBoard(next);
    } catch (err) {
      setLoadError(err?.message ?? "Could not load this board.");
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, [userId, boardId]);

  useEffect(() => {
    void reloadBoard();
  }, [reloadBoard]);

  const handleDeleted = () => {
    navigate("/app");
  };

  return (
    <Stack spacing={2}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} to="/app" underline="hover" color="inherit">
          Boards
        </Link>
        <Typography color="text.primary">{board?.name ?? "Board"}</Typography>
      </Breadcrumbs>

      {loading ? <SharedLoading label="Loading board..." /> : null}

      {!loading && loadError ? (
        <SharedError title="Could not load board" message={loadError} onRetry={reloadBoard} />
      ) : null}

      {!loading && !loadError && !board ? (
        <Paper variant="outlined" sx={{ p: 0 }}>
          <SharedEmpty
            title="Board not found"
            description="It may have been deleted or you may not have access."
            actionLabel="Back to boards"
            onAction={() => navigate("/app")}
          />
        </Paper>
      ) : null}

      {!loading && !loadError && board ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "flex-start" }}
              justifyContent="space-between"
            >
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={800}>
                  {board.name}
                </Typography>
                <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                  {board.description?.trim()
                    ? board.description
                    : "No description has been added for this board yet."}
                </Typography>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>

            <Button
              component={RouterLink}
              to="/app"
              variant="text"
              startIcon={<ArrowBackOutlinedIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Back to boards
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {board ? (
        <EditBoardDialog
          open={editOpen}
          userId={userId}
          boardId={board.id}
          initialName={board.name}
          initialDescription={board.description}
          onClose={() => setEditOpen(false)}
          onUpdated={reloadBoard}
        />
      ) : null}

      {board ? (
        <DeleteBoardDialog
          open={deleteOpen}
          userId={userId}
          boardId={board.id}
          boardName={board.name}
          onClose={() => setDeleteOpen(false)}
          onDeleted={handleDeleted}
        />
      ) : null}
    </Stack>
  );
}
