import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { getWorkspaces, updateWorkspace, deleteWorkspace } from "../services/adminService.js";
import { SharedLoading } from "./sharedLoading.jsx";
import { SharedError } from "./sharedError.jsx";

export function AdminWorkspacesTable() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editWorkspace, setEditWorkspace] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaces();
      setWorkspaces(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (workspace) => {
    setEditWorkspace(workspace);
    setNewName(workspace.name);
  };

  const handleEditSave = async () => {
    if (!editWorkspace || !newName.trim()) return;
    try {
      const updated = await updateWorkspace(editWorkspace.id, newName.trim());
      setWorkspaces(updated);
      setEditWorkspace(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (workspaceId) => {
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;
    try {
      const updated = await deleteWorkspace(workspaceId);
      setWorkspaces(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <SharedLoading />;
  if (error) return <SharedError message={error} onRetry={loadWorkspaces} />;

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Manage Workspaces</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workspaces.map((workspace) => (
              <TableRow key={workspace.id}>
                <TableCell>{workspace.name}</TableCell>
                <TableCell>{workspace.memberCount}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleEditClick(workspace)}
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDelete(workspace.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {workspaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography color="text.secondary">No workspaces found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editWorkspace} onClose={() => setEditWorkspace(null)}>
        <DialogTitle>Edit Workspace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workspace Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditWorkspace(null)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
