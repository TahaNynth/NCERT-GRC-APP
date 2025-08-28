import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, useTheme, Divider, Collapse, Avatar, ListSubheader } from '@mui/material';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import GavelIcon from '@mui/icons-material/Gavel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import OrganizationsPage from './pages/OrganizationsPage';
import { API_BASE } from './api';
import ComparisonAI from './pages/ComparisonAI';

function Home() { return <Box p={3}><Typography variant="h4">Welcome to NCERT Survey</Typography><Typography sx={{mt:2}}>A modern survey management and analytics platform.</Typography></Box>; }

function Organization() {
  const [orgs, setOrgs] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/organizations`)
      .then(res => res.json())
      .then(setOrgs);
  }, []);
  return (
    <Box p={3}>
      <Typography variant="h5">Organizations</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Year of Association</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orgs.map(org => (
              <TableRow key={org.id}>
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.year_of_association}</TableCell>
                <TableCell>{org.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
function AddOrganization() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [details, setDetails] = useState('');
  const [success, setSuccess] = useState(false);
  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, year_of_association: Number(year), details })
    })
      .then(res => res.json())
      .then(() => setSuccess(true));
  };
  return (
    <Box p={3}>
      <Typography variant="h5">Add Organization</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField label="Organization Name" value={name} onChange={e => setName(e.target.value)} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Year of Association" value={year} onChange={e => setYear(e.target.value)} type="number" fullWidth required sx={{ mb: 2 }} />
        <TextField label="Details" value={details} onChange={e => setDetails(e.target.value)} fullWidth multiline rows={3} sx={{ mb: 2 }} />
        <Button type="submit" variant="contained">Add</Button>
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Organization added successfully!</Typography>}
      </Box>
    </Box>
  );
}
function Clauses() {
  const [clauses, setClauses] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/clauses`)
      .then(res => res.json())
      .then(setClauses);
  }, []);
  return (
    <Box p={3}>
      <Typography variant="h5">Clauses</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clauses.map(clause => (
              <TableRow key={clause.id}>
                <TableCell>{clause.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
function AddClause() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [success, setSuccess] = useState(false);
  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${API_BASE}/clauses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, title })
    })
      .then(res => res.json())
      .then(() => setSuccess(true));
  };
  return (
    <Box p={3}>
      <Typography variant="h5">Add Clause</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField label="Clause Name" value={name} onChange={e => setName(e.target.value)} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Clause Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required sx={{ mb: 2 }} />
        <Button type="submit" variant="contained">Add</Button>
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Clause added successfully!</Typography>}
      </Box>
    </Box>
  );
}
function AddQuestion() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [clauseId, setClauseId] = useState('');
  const [clauses, setClauses] = useState([]);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    fetch(`${API_BASE}/clauses`)
      .then(res => res.json())
      .then(setClauses);
  }, []);
  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, clause_id: Number(clauseId) })
    })
      .then(res => res.json())
      .then(() => setSuccess(true));
  };
  return (
    <Box p={3}>
      <Typography variant="h5">Add Question</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField label="Question Text" value={text} onChange={e => setText(e.target.value)} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Question Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Clause" select value={clauseId} onChange={e => setClauseId(e.target.value)} fullWidth required sx={{ mb: 2 }} SelectProps={{ native: true }}>
          <option value=""></option>
          {clauses.map(clause => (
            <option key={clause.id} value={clause.id}>{clause.title || clause.name}</option>
          ))}
        </TextField>
        <Button type="submit" variant="contained">Add</Button>
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Question added successfully!</Typography>}
      </Box>
    </Box>
  );
}
function Responses() {
  const [orgs, setOrgs] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [responses, setResponses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingRemarksId, setEditingRemarksId] = useState(null);
  const [editRemarksValue, setEditRemarksValue] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/organizations`).then(res => res.json()).then(setOrgs);
    fetch(`${API_BASE}/clauses`).then(res => res.json()).then(setClauses);
    fetch(`${API_BASE}/questions`).then(res => res.json()).then(setQuestions);
  }, []);

  const handleShow = () => {
    if (!selectedOrg) return;
    fetch(`${API_BASE}/responses?organization_id=${selectedOrg}`)
      .then(res => res.json())
      .then(setResponses);
  };

  const handleEdit = (response) => {
    setEditingId(response.id);
    setEditValue(response.response_type);
  };

  const handleEditRemarks = (response) => {
    setEditingRemarksId(response.id);
    setEditRemarksValue(response.comment || '');
  };

  const handleSave = async (responseId) => {
    try {
      const response = await fetch(`${API_BASE}/responses/${responseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: selectedOrg,
          clause_id: responses.find(r => r.id === responseId).clause_id,
          question_id: responses.find(r => r.id === responseId).question_id,
          response_type: editValue,
          comment: responses.find(r => r.id === responseId).comment,
          date: responses.find(r => r.id === responseId).date
        })
      });
      
      if (response.ok) {
        // Update local state
        setResponses(prev => prev.map(r => 
          r.id === responseId ? { ...r, response_type: editValue } : r
        ));
        setEditingId(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Failed to update response:', error);
    }
  };

  const handleSaveRemarks = async (responseId) => {
    try {
      const response = await fetch(`${API_BASE}/responses/${responseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: selectedOrg,
          clause_id: responses.find(r => r.id === responseId).clause_id,
          question_id: responses.find(r => r.id === responseId).question_id,
          response_type: responses.find(r => r.id === responseId).response_type,
          comment: editRemarksValue,
          date: responses.find(r => r.id === responseId).date
        })
      });
      
      if (response.ok) {
        // Update local state
        setResponses(prev => prev.map(r => 
          r.id === responseId ? { ...r, comment: editRemarksValue } : r
        ));
        setEditingRemarksId(null);
        setEditRemarksValue('');
      }
    } catch (error) {
      console.error('Failed to update remarks:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelRemarks = () => {
    setEditingRemarksId(null);
    setEditRemarksValue('');
  };

  // Helper to get readable names
  const getClauseName = id => clauses.find(c => c.id === id)?.name || id;
  const getQuestionText = id => questions.find(q => q.id === id)?.text || id;

  // Helper for color-coded answers
  const renderResponse = (text) => {
    if (!text || typeof text !== 'string') {
      return <Typography sx={{ color: 'grey.600', fontStyle: 'italic' }}>No response</Typography>;
    }

    const lower = text.trim().toLowerCase();
    if (lower === 'yes') {
      return <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Yes</Typography>;
    }
    if (lower === 'no') {
      return <Typography sx={{ color: 'red', fontWeight: 'bold' }}>No</Typography>;
    }
    if (lower === 'not applicable') {
      return <Typography sx={{ color: 'orange', fontWeight: 'bold' }}>Not Applicable</Typography>;
    }
    return text;
  };

  // Render editable response cell
  const renderEditableResponse = (response) => {
    if (editingId === response.id) {
      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
            SelectProps={{ native: true }}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Not applicable">Not Applicable</option>
          </TextField>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleSave(response.id)}
            sx={{ minWidth: 60 }}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCancel}
            sx={{ minWidth: 60 }}
          >
            Cancel
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {renderResponse(response.response_type)}
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleEdit(response)}
          sx={{ ml: 1 }}
        >
          Edit
        </Button>
      </Box>
    );
  };

  // Render editable remarks cell
  const renderEditableRemarks = (response) => {
    if (editingRemarksId === response.id) {
      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            value={editRemarksValue}
            onChange={(e) => setEditRemarksValue(e.target.value)}
            size="small"
            multiline
            rows={2}
            sx={{ minWidth: 200 }}
            placeholder="Enter remarks..."
          />
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleSaveRemarks(response.id)}
            sx={{ minWidth: 60 }}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCancelRemarks}
            sx={{ minWidth: 60 }}
          >
            Cancel
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography sx={{ flex: 1 }}>
          {response.comment || 'No remarks'}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleEditRemarks(response)}
          sx={{ ml: 1 }}
        >
          Edit
        </Button>
      </Box>
    );
  };

  return (
    <Box p={3}>
      
      <TextField
        label="Select Organization"
        select
        value={selectedOrg}
        onChange={e => setSelectedOrg(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
        SelectProps={{ native: true }}
      >
        <option value=""></option>
        {orgs.map(org => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </TextField>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleShow}
        disabled={!selectedOrg}
      >
        Show Responses
      </Button>

      {responses.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><b>Clause</b></TableCell>
                <TableCell><b>Question</b></TableCell>
                <TableCell><b>Response</b></TableCell>
                <TableCell><b>Remarks</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map((resp, idx) => (
                <TableRow key={idx}>
                  <TableCell>{getClauseName(resp.clause_id)}</TableCell>
                  <TableCell>{getQuestionText(resp.question_id)}</TableCell>
                  <TableCell>{renderEditableResponse(resp)}</TableCell>
                  <TableCell>{renderEditableRemarks(resp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

function AddResponse() {
  const [orgs, setOrgs] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedClause, setSelectedClause] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [responseType, setResponseType] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState('');
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    fetch(`${API_BASE}/organizations`).then(res => res.json()).then(setOrgs);
    fetch(`${API_BASE}/clauses`).then(res => res.json()).then(setClauses);
    fetch(`${API_BASE}/questions`).then(res => res.json()).then(setQuestions);
  }, []);
  
  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${API_BASE}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: Number(selectedOrg),
        clause_id: Number(selectedClause),
        question_id: Number(selectedQuestion),
        response_type: responseType,
        comment: comment,
        date
      })
    }).then(res => res.json()).then(() => setSuccess(true));
  };
  
  return (
    <Box p={3}>
      <Typography variant="h5">Add Response</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField 
          label="Organization" 
          select 
          value={selectedOrg} 
          onChange={e => setSelectedOrg(e.target.value)} 
          fullWidth 
          required 
          sx={{ mb: 2 }} 
          SelectProps={{ native: true }}
        >
          <option value=""></option>
          {orgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
        </TextField>
        
        <TextField 
          label="Clause" 
          select 
          value={selectedClause} 
          onChange={e => setSelectedClause(e.target.value)} 
          fullWidth 
          required 
          sx={{ mb: 2 }} 
          SelectProps={{ native: true }}
        >
          <option value=""></option>
          {clauses.map(clause => <option key={clause.id} value={clause.id}>{clause.title || clause.name}</option>)}
        </TextField>
        
        <TextField 
          label="Question" 
          select 
          value={selectedQuestion} 
          onChange={e => setSelectedQuestion(e.target.value)} 
          fullWidth 
          required 
          sx={{ mb: 2 }} 
          SelectProps={{ native: true }}
        >
          <option value=""></option>
          {questions.filter(q => q.clause_id === Number(selectedClause)).map(q => <option key={q.id} value={q.id}>{q.title || q.text}</option>)}
        </TextField>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Response Type *</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="responseType"
                value="Yes"
                checked={responseType === 'Yes'}
                onChange={(e) => setResponseType(e.target.value)}
                required
              />
              <Typography>Yes</Typography>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="responseType"
                value="No"
                checked={responseType === 'No'}
                onChange={(e) => setResponseType(e.target.value)}
                required
              />
              <Typography>No</Typography>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="responseType"
                value="Not applicable"
                checked={responseType === 'Not applicable'}
                onChange={(e) => setResponseType(e.target.value)}
                required
              />
              <Typography>Not applicable</Typography>
            </label>
          </Box>
        </Box>
        
        <TextField 
          label="Comment (Optional)" 
          value={comment} 
          onChange={e => setComment(e.target.value)} 
          fullWidth 
          multiline
          rows={3}
          sx={{ mb: 2 }} 
        />
        
        <TextField 
          label="Date" 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          fullWidth 
          required 
          sx={{ mb: 2 }} 
          InputLabelProps={{ shrink: true }} 
        />
        
        <Button type="submit" variant="contained">Add Response</Button>
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Response added successfully!</Typography>}
      </Box>
    </Box>
  );
}
function EditResponse() {
  return (
    <Box p={3}>
      <Typography variant="h5">Edit Response</Typography>
      <Typography sx={{ mt: 2 }}>Edit functionality coming soon.</Typography>
    </Box>
  );
}


const drawerWidth = 250;

function Sidebar({ open, setOpen }) {
  const [orgOpen, setOrgOpen] = useState(false);
  const [clauseOpen, setClauseOpen] = useState(false);
  const [respOpen, setRespOpen] = useState(false);
  const location = useLocation();
  // Add top margin to avoid overlap with AppBar
  return (
    <Drawer variant="persistent" anchor="left" open={open} sx={{
      width: drawerWidth,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #e3f2fd 0%, #ffffff 100%)',
        pt: 8, // Add padding top to push content below AppBar
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, flexDirection: 'column', gap: 1 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: '#1976d2', mb: 1 }}>N</Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>NCERT Survey</Typography>
        <IconButton onClick={() => setOpen(false)} sx={{ alignSelf: 'flex-end', mt: 1 }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem button component={Link} to="/" selected={location.pathname === '/'} onClick={() => setOpen(false)}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
      </List>
      <Divider sx={{ my: 1 }} />
      <List
        subheader={<ListSubheader component="div" disableSticky>Organizations</ListSubheader>}
      >
        <ListItem button onClick={() => setOrgOpen(!orgOpen)}>
          <ListItemIcon><BusinessIcon /></ListItemIcon>
          <ListItemText primary="Organizations" />
          {orgOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={orgOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/organization" selected={location.pathname === '/organization'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><BusinessIcon /></ListItemIcon>
              <ListItemText primary="Current" />
            </ListItem>
            <ListItem button component={Link} to="/organization/add" selected={location.pathname === '/organization/add'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><AddBusinessIcon /></ListItemIcon>
              <ListItemText primary="Add New" />
            </ListItem>
          </List>
        </Collapse>
      </List>
      <Divider sx={{ my: 1 }} />
      <List
        subheader={<ListSubheader component="div" disableSticky>Clauses</ListSubheader>}
      >
        <ListItem button onClick={() => setClauseOpen(!clauseOpen)}>
          <ListItemIcon><GavelIcon /></ListItemIcon>
          <ListItemText primary="Clauses" />
          {clauseOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={clauseOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/clauses" selected={location.pathname === '/clauses'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><GavelIcon /></ListItemIcon>
              <ListItemText primary="All Clauses" />
            </ListItem>
            <ListItem button component={Link} to="/clauses/add" selected={location.pathname === '/clauses/add'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><AddCircleIcon /></ListItemIcon>
              <ListItemText primary="Add Clause" />
            </ListItem>
            <ListItem button component={Link} to="/questions/add" selected={location.pathname === '/questions/add'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><QuizIcon /></ListItemIcon>
              <ListItemText primary="Add Question" />
            </ListItem>
          </List>
        </Collapse>
      </List>
      <Divider sx={{ my: 1 }} />
      <List
        subheader={<ListSubheader component="div" disableSticky>Responses</ListSubheader>}
      >
        <ListItem button onClick={() => setRespOpen(!respOpen)}>
          <ListItemIcon><AssignmentIcon /></ListItemIcon>
          <ListItemText primary="Responses" />
          {respOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={respOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/responses" selected={location.pathname === '/responses'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><AssignmentIcon /></ListItemIcon>
              <ListItemText primary="Show Response" />
            </ListItem>
            <ListItem button component={Link} to="/responses/add" selected={location.pathname === '/responses/add'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><AddCircleIcon /></ListItemIcon>
              <ListItemText primary="Add Response" />
            </ListItem>
            <ListItem button component={Link} to="/responses/edit" selected={location.pathname === '/responses/edit'} sx={{ pl: 4 }} onClick={() => setOpen(false)}>
              <ListItemIcon><AssignmentIcon /></ListItemIcon>
              <ListItemText primary="Edit Response" />
            </ListItem>
          </List>
        </Collapse>
      </List>
      <Divider sx={{ my: 1 }} />
      <List>
        <ListItem button component={Link} to="/comparison" selected={location.pathname === '/comparison'} onClick={() => setOpen(false)}>
          <ListItemIcon><CompareArrowsIcon /></ListItemIcon>
          <ListItemText primary="Comparison" />
        </ListItem>
      </List>
    </Drawer>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <Router>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            NCERT Survey
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar open={open} setOpen={setOpen} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: open ? `${drawerWidth}px` : 0, transition: theme.transitions.create('margin', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }) }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/organization" element={<OrganizationsPage />} />
          <Route path="/organization/add" element={<AddOrganization />} />
          <Route path="/clauses" element={<Clauses />} />
          <Route path="/clauses/add" element={<AddClause />} />
          <Route path="/questions/add" element={<AddQuestion />} />
          <Route path="/responses" element={<Responses />} />
          <Route path="/responses/add" element={<AddResponse />} />
          <Route path="/responses/edit" element={<EditResponse />} />
          <Route path="/comparison" element={<ComparisonAI />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;