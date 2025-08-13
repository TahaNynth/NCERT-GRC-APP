import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, CircularProgress, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { API_BASE } from '../api';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({ name: '', year_of_association: '', details: '' });
  const [saving, setSaving] = useState(false);

  const fetchOrgs = () => {
    setLoading(true);
    fetch(`${API_BASE}/organizations`)
      .then(res => res.json())
      .then(data => setOrgs(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrgs(); }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => { setOpenDialog(false); setForm({ name: '', year_of_association: '', details: '' }); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = () => {
    setSaving(true);
    fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, year_of_association: Number(form.year_of_association) })
    })
      .then(res => res.json())
      .then(() => {
        setSnackbar({ open: true, message: 'Organization added!', severity: 'success' });
        fetchOrgs();
        handleCloseDialog();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to add organization', severity: 'error' }))
      .finally(() => setSaving(false));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Organizations</Typography>
      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2 }}>Add Organization</Button>
      <Paper sx={{ height: 400, width: '100%' }}>
        {loading ? <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box> :
          <DataGrid
            rows={orgs}
            columns={[
              { field: 'name', headerName: 'Name', flex: 1 },
              { field: 'year_of_association', headerName: 'Year', width: 120 },
              { field: 'details', headerName: 'Details', flex: 2 },
            ]}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            getRowId={row => row.id}
          />
        }
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add Organization</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Year of Association" name="year_of_association" value={form.year_of_association} onChange={handleChange} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="Details" name="details" value={form.details} onChange={handleChange} fullWidth multiline rows={3} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={saving}>{saving ? <CircularProgress size={24} /> : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} message={snackbar.message} />
    </Box>
  );
}