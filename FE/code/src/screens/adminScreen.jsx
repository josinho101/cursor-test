import React, { useState } from "react";
import { Paper, Stack, Typography, Tabs, Tab, Box } from "@mui/material";
import { AdminUsersTable } from "../components/adminUsersTable.jsx";
import { AdminWorkspacesTable } from "../components/adminWorkspacesTable.jsx";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function AdminScreen() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Stack spacing={2} sx={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography color="text.secondary">
          Manage application users and workspaces.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="admin sections"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Users" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab label="Workspaces" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
        </Tabs>
        
        <TabPanel value={tabIndex} index={0}>
          <AdminUsersTable />
        </TabPanel>
        
        <TabPanel value={tabIndex} index={1}>
          <AdminWorkspacesTable />
        </TabPanel>
      </Paper>
    </Stack>
  );
}
