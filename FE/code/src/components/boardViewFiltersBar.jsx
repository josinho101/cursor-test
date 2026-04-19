import React from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  Stack,
  TextField,
  Typography
} from "@mui/material";

/**
 * @param {{
 *   assignableMembers: { id: string, name: string }[],
 *   lists: import("../services/listStorage.js").StoredList[],
 *   selectedMemberIds: string[],
 *   onChangeMemberIds: (ids: string[]) => void,
 *   selectedListIds: string[],
 *   onChangeListIds: (ids: string[]) => void,
 *   onClearAll: () => void
 * }} props
 */
export function BoardViewFiltersBar({
  assignableMembers,
  lists,
  selectedMemberIds,
  onChangeMemberIds,
  selectedListIds,
  onChangeListIds,
  onClearAll
}) {
  const selectedMembers = (assignableMembers ?? []).filter((m) => selectedMemberIds.includes(m.id));
  const selectedLists = (lists ?? []).filter((l) => selectedListIds.includes(l.id));
  const active = selectedMemberIds.length > 0 || selectedListIds.length > 0;

  return (
    <Stack spacing={1.5}>
      {active ? (
        <Alert
          severity="info"
          icon={<FilterAltOutlinedIcon fontSize="inherit" />}
          action={
            <Button color="inherit" size="small" onClick={onClearAll}>
              Clear all
            </Button>
          }
        >
          <Typography variant="body2" component="span" fontWeight={700}>
            Filters active.
          </Typography>{" "}
          <Typography variant="body2" component="span" color="inherit">
            Card drag-and-drop is paused while filters are on so positions stay accurate.
          </Typography>
        </Alert>
      ) : null}

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "flex-start" }}>
        <Autocomplete
          multiple
          options={assignableMembers ?? []}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={selectedMembers}
          onChange={(_, v) => onChangeMemberIds(v.map((m) => m.id))}
          renderInput={(params) => (
            <TextField {...params} label="Filter by assignee" placeholder="Select members" />
          )}
          sx={{ flex: 1, minWidth: { md: 240 } }}
        />
        <Autocomplete
          multiple
          options={lists ?? []}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={selectedLists}
          onChange={(_, v) => onChangeListIds(v.map((l) => l.id))}
          renderInput={(params) => (
            <TextField {...params} label="Filter by list (status)" placeholder="Select lists" />
          )}
          sx={{ flex: 1, minWidth: { md: 240 } }}
        />
      </Stack>

      {active ? (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {selectedMembers.map((m) => (
            <Chip
              key={m.id}
              label={`Assignee: ${m.name}`}
              size="small"
              onDelete={() => onChangeMemberIds(selectedMemberIds.filter((id) => id !== m.id))}
            />
          ))}
          {selectedLists.map((l) => (
            <Chip
              key={l.id}
              label={`List: ${l.name}`}
              size="small"
              onDelete={() => onChangeListIds(selectedListIds.filter((id) => id !== l.id))}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
