import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Card, CardHeader, CardContent, Typography, TextField, Button, Divider, Alert } from '@mui/material';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { API_BASE } from '../api';

export default function ComparisonAI() {
  const [orgs, setOrgs] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [org1, setOrg1] = useState('');
  const [org2, setOrg2] = useState('');
  const [clauseId, setClauseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ai, setAi] = useState({ similarities: [], differences: [], summary: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [numericResults, setNumericResults] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/organizations`).then(r => r.json()).then(setOrgs);
    fetch(`${API_BASE}/clauses`).then(r => r.json()).then(setClauses);
  }, []);

  const selectedOrg1 = useMemo(() => orgs.find(o => o.id === Number(org1)), [orgs, org1]);
  const selectedOrg2 = useMemo(() => orgs.find(o => o.id === Number(org2)), [orgs, org2]);

  const normalizeList = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val
        .split(/\r?\n|•|\-|\d+\.|\*/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const handleCompare = async () => {
    setError('');
    setAi({ similarities: [], differences: [], summary: '' });
    setNumericResults([]);
    if (!org1 || !org2) { setError('Please select two organizations.'); return; }
    if (org1 === org2) { setError('Please select two different organizations.'); return; }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) { setError('End date must be after start date'); return; }

    const params = new URLSearchParams();
    params.set('org1_id', org1); params.set('org2_id', org2);
    if (clauseId) params.set('clause_id', clauseId);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    const numParams = new URLSearchParams();
    [org1, org2].forEach(id => numParams.append('organization_ids', id));
    if (clauseId) numParams.set('clause_id', clauseId);
    if (startDate) numParams.set('start_date', startDate);
    if (endDate) numParams.set('end_date', endDate);

    setLoading(true);
    try {
      const [aiRes, numRes] = await Promise.all([
        fetch(`${API_BASE}/ai/compare?${params.toString()}`),
        fetch(`${API_BASE}/compare?${numParams.toString()}`)
      ]);
      if (!aiRes.ok) {
        const d = await aiRes.json().catch(() => ({}));
        throw new Error(d.detail || 'AI compare failed');
      }
      const aiJson = await aiRes.json();
      setAi({
        similarities: normalizeList(aiJson.similarities),
        differences: normalizeList(aiJson.differences),
        summary: typeof aiJson.summary === 'string' ? aiJson.summary : ''
      });

      const data = await numRes.json().catch(() => []);
      setNumericResults(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const data = [];
    const questions = [...new Set(numericResults.map(r => r.question_id))];
    questions.forEach(qid => {
      const entry = { question_id: qid };
      numericResults.filter(r => r.question_id === qid).forEach(r => {
        entry[`org_${r.organization_id}`] = r.response_text;
      });
      data.push(entry);
    });
    return data;
  }, [numericResults]);

  return (
    <Box p={3}>
      <Typography variant="h5" sx={{ mb: 2 }}>Comparison</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Organization 1" subheader="Select an organization to compare." />
            <CardContent>
              <TextField label="Select Organization" select fullWidth value={org1} onChange={e => setOrg1(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 2 }}>
                <option value=""></option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </TextField>
              {selectedOrg1 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Key Details:</Typography>
                  <Typography variant="body2">Year: {selectedOrg1.year_of_association}</Typography>
                  <Typography variant="body2">Details: {selectedOrg1.details || '-'}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Organization 2" subheader="Select another organization to compare." />
            <CardContent>
              <TextField label="Select Organization" select fullWidth value={org2} onChange={e => setOrg2(e.target.value)} SelectProps={{ native: true }} sx={{ mb: 2 }}>
                <option value=""></option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </TextField>
              {selectedOrg2 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Key Details:</Typography>
                  <Typography variant="body2">Year: {selectedOrg2.year_of_association}</Typography>
                  <Typography variant="body2">Details: {selectedOrg2.details || '-'}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField label="Clause" select fullWidth value={clauseId} onChange={e => setClauseId(e.target.value)} SelectProps={{ native: true }}>
                    <option value=""></option>
                    {clauses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Start Date" type="date" fullWidth value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="End Date" type="date" fullWidth value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={handleCompare} disabled={loading}>{loading ? 'Comparing...' : 'Compare'}</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Summary" />
            <CardContent>
              {ai.summary ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{ai.summary}</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">Run a comparison to generate an AI summary.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Similarities" />
            <CardContent>
              {ai.similarities && ai.similarities.length > 0 ? ai.similarities.map((s, i) => (
                <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {s}</Typography>
              )) : <Typography variant="body2" color="text.secondary">No similarities found yet. Run a comparison.</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Differences" />
            <CardContent>
              {ai.differences && ai.differences.length > 0 ? ai.differences.map((s, i) => (
                <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {s}</Typography>
              )) : <Typography variant="body2" color="text.secondary">No differences found yet. Run a comparison.</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Graphical Analysis" subheader="Interactive charts appear here." />
            <CardContent>
              {chartData.length > 0 ? (
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="question_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {[org1, org2].filter(Boolean).map(id => (
                        <Line key={id} type="monotone" dataKey={`org_${id}`} name={orgs.find(o => o.id === Number(id))?.name || `Org ${id}`} stroke="#1976d2" />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Placeholder for interactive chart.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
