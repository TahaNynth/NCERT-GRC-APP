export const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${url}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API call failed:", error);
        throw error;
    }
}

// Organization API functions
export const getOrganizations = () => fetchData('/organizations');
export const getOrganizationById = (id) => fetchData(`/organizations/${id}`);
export const createOrganization = (org) => fetchData('/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(org)
});
export const updateOrganization = (id, org) => fetchData(`/organizations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(org)
});
export const deleteOrganization = (id) => fetchData(`/organizations/${id}`, {
    method: 'DELETE'
});

// Clause API functions
export const getClauses = () => fetchData('/clauses');
export const createClause = (clause) => fetchData('/clauses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clause)
});

// Question API functions
export const getQuestions = () => fetchData('/questions');
export const createQuestion = (question) => fetchData('/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question)
});

// Response API functions
export const getResponses = (organizationId = null) => {
    const url = organizationId ? `/responses?organization_id=${organizationId}` : '/responses';
    return fetchData(url);
};
export const createResponse = (response) => fetchData('/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response)
});
export const updateResponse = (id, response) => fetchData(`/responses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response)
});
export const deleteResponse = (id) => fetchData(`/responses/${id}`, {
    method: 'DELETE'
});

// Comparison API functions
export const compareSurveys = (organization_ids, clause_id, start_date, end_date) => {
    const params = new URLSearchParams();
    if (organization_ids) {
        organization_ids.forEach(id => params.append('organization_ids', id));
    }
    if (clause_id) params.set('clause_id', clause_id);
    if (start_date) params.set('start_date', start_date);
    if (end_date) params.set('end_date', end_date);
    
    return fetchData(`/compare?${params.toString()}`);
};

export const aiCompareSurveys = (org1_id, org2_id, clause_id, start_date, end_date) => {
    const params = new URLSearchParams();
    params.set('org1_id', org1_id);
    params.set('org2_id', org2_id);
    if (clause_id) params.set('clause_id', clause_id);
    if (start_date) params.set('start_date', start_date);
    if (end_date) params.set('end_date', end_date);
    
    return fetchData(`/ai/compare?${params.toString()}`);
};

// Chart data API functions
export const getYesNoChartData = () => fetchData('/chart-data/yes-no');

export const getYesNoComparisonChartData = (org1_id, org2_id, clause_id, start_date, end_date) => {
    const params = new URLSearchParams();
    params.set('org1_id', org1_id);
    params.set('org2_id', org2_id);
    if (clause_id) params.set('clause_id', clause_id);
    if (start_date) params.set('start_date', start_date);
    if (end_date) params.set('end_date', end_date);
    
    return fetchData(`/chart-data/yes-no-comparison?${params.toString()}`);
};