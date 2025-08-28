import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getOrganizations,
  getClauses,
  compareSurveys,
  aiCompareSurveys,
  getYesNoChartData,
  getYesNoComparisonChartData,
} from '../api';

function ComparisonAI() {
  const [organizations, setOrganizations] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [selectedOrg1, setSelectedOrg1] = useState('');
  const [selectedOrg2, setSelectedOrg2] = useState('');
  const [selectedClause, setSelectedClause] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [chartResults, setChartResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [yesNoChartData, setYesNoChartData] = useState([]);
  const [showYesNoChart, setShowYesNoChart] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [comparisonYesNoData, setComparisonYesNoData] = useState([]);
  const [showComparisonChart, setShowComparisonChart] = useState(false);

  useEffect(() => {
    fetchOrganizations();
    fetchClauses();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const data = await getOrganizations();
      setOrganizations(data);
    } catch {
      setError('Failed to fetch organizations');
    }
  };

  const fetchClauses = async () => {
    try {
      const data = await getClauses();
      setClauses(data);
    } catch {
      setError('Failed to fetch clauses');
    }
  };

  const handleCompare = async () => {
    if (!selectedOrg1 || !selectedOrg2) {
      setError('Please select two organizations');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError('');
    setShowComparisonChart(false);

    try {
      console.log('Fetching comparison for:', { selectedOrg1, selectedOrg2, selectedClause, startDate, endDate });
      const aiResponse = await aiCompareSurveys(selectedOrg1, selectedOrg2, selectedClause, startDate, endDate);
      setAiResults(aiResponse);

      const chartResponse = await compareSurveys(
        [selectedOrg1, selectedOrg2],
        selectedClause,
        startDate,
        endDate
      );
      setChartResults(Array.isArray(chartResponse) ? chartResponse : []);

      const comparisonData = await getYesNoComparisonChartData(selectedOrg1, selectedOrg2, selectedClause, startDate, endDate);
      console.log('Comparison data received:', comparisonData);
      if (comparisonData && comparisonData.length > 0) {
        setComparisonYesNoData(comparisonData);
        setShowComparisonChart(true);
      } else {
        setError('No response data available. Please add some responses first.');
        setShowComparisonChart(false);
      }
    } catch (err) {
      console.error('Error in handleCompare:', err);
      setError(err.message || 'Failed to fetch comparison data.');
    } finally {
      setLoading(false);
    }
  };

  const generateYesNoChart = async () => {
    setChartLoading(true);
    setError('');
    try {
      console.log('Fetching Yes/No chart data...');
      const data = await getYesNoChartData();
      console.log('Yes/No data received:', data);
      if (data && data.length > 0) {
        setYesNoChartData(data);
        setShowYesNoChart(true);
      } else {
        setError('No response data available. Please add some responses first.');
        setShowYesNoChart(false);
      }
    } catch (err) {
      console.error('Error fetching Yes/No chart data:', err);
      setError('Failed to fetch chart data: ' + err.message);
      setShowYesNoChart(false);
    } finally {
      setChartLoading(false);
    }
  };

  const COLORS = ['#4caf50', '#f44336', '#ffeb3b', '#ffc658']; // Yes, No, Not applicable, No Response

  const org1Name = organizations.find(org => org.id === Number(selectedOrg1))?.name || 'Org 1';
  const org2Name = organizations.find(org => org.id === Number(selectedOrg2))?.name || 'Org 2';

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        AI-Powered Survey Comparison
      </Typography>

      {/* Controls */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Organization 1"
              value={selectedOrg1}
              onChange={(e) => setSelectedOrg1(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">Select...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Organization 2"
              value={selectedOrg2}
              onChange={(e) => setSelectedOrg2(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">Select...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Clause (Optional)"
              value={selectedClause}
              onChange={(e) => setSelectedClause(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">All Clauses</option>
              {clauses.map((clause) => (
                <option key={clause.id} value={clause.id}>
                  {clause.title || clause.name}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              fullWidth
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              fullWidth
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleCompare}
            disabled={loading || !selectedOrg1 || !selectedOrg2}
          >
            {loading ? <CircularProgress size={20} /> : 'Compare Organizations'}
          </Button>
          <Button
            variant="outlined"
            onClick={generateYesNoChart}
            color="secondary"
            disabled={chartLoading}
          >
            {chartLoading ? <CircularProgress size={20} /> : 'Generate Yes/No Chart'}
          </Button>
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* AI Results */}
      {aiResults && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Summary
                </Typography>
                <Typography variant="body1">{aiResults.summary}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Similarities
                </Typography>
                <List dense>
                  {aiResults.similarities?.length > 0 ? (
                    aiResults.similarities.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No specific similarities identified." />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Differences
                </Typography>
                <List dense>
                  {aiResults.differences?.length > 0 ? (
                    aiResults.differences.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${item}`} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No specific differences identified." />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Yes/No/Not applicable Chart */}
      {showYesNoChart && yesNoChartData.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
              📊 Yes/No/Not applicable Response Comparison (All Organizations)
            </Typography>
            <Box sx={{ height: 600, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={yesNoChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  barGap={4}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11, fill: '#666' }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    formatter={(value, name) => [`${value} responses`, name]}
                    labelStyle={{ fontWeight: 'bold', color: '#1976d2' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={12} />
                  <Bar dataKey="Yes" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="No" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Not applicable" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Yes/No/Not applicable/No Response Comparison Chart */}
      {showComparisonChart && comparisonYesNoData.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
              📊 Yes/No/Not applicable/No Response Comparison (Selected Organizations)
            </Typography>
            {comparisonYesNoData.length > 0 ? (
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart
                    data={comparisonYesNoData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#666' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                      formatter={(value, name) => [
                        `${value} responses`,
                        name === org1Name ? org1Name : name === org2Name ? org2Name : name,
                      ]}
                      labelStyle={{ fontWeight: 'bold', color: '#1976d2' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={12} />
                    <Bar dataKey={org1Name} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey={org2Name} fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Alert severity="info">No data available for the selected comparison.</Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Line Chart */}
      {chartResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Numerical Response Comparison
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={chartResults}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="org1_responses" fill="#8884d8" name="Organization 1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="org2_responses" fill="#82ca9d" name="Organization 2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ComparisonAI;