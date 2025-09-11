import axios from "axios";

const API_BASE = "/api";

// Helper function to create authorization headers
function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- ADMIN APIs (Unchanged) ---
export async function fetchAdminReports({ department = null, category = null, status = null, page = 1, page_size = 50 } = {}, token = null) {
  const params = {};
  if (department) params.department = department;
  if (category) params.category = category;
  if (status) params.status_filter = status;
  params.page = page;
  params.page_size = page_size;
  const headers = getAuthHeaders(token);
  const res = await axios.get(`${API_BASE}/admin/reports`, { params, headers });
  return res.data.data;
}

export async function fetchReportById(id, token = null) {
  const reports = await fetchAdminReports({}, token);
  return reports.find((r) => r.id === id || r._id === id) || null;
}

export async function updateReportStatus(id, newStatus, notes = "", progress_image_url = "", resolved_image_url = "", token = null) {
  const payload = { status: newStatus, notes, progress_image_url, resolved_image_url };
  const headers = getAuthHeaders(token);
  const res = await axios.put(`${API_BASE}/admin/report/${id}/status`, payload, { headers });
  return res.data;
}

// --- USER APIs (Corrected) ---

// Fix: This function now correctly passes the auth token for both nearby and general feeds.
export async function fetchFeedReports(lat = null, lng = null, token = null) {
  const headers = getAuthHeaders(token);
  // The primary way to get a feed is with location data.
  if (lat && lng) {
    const res = await axios.get(`${API_BASE}/nearby`, { params: { lat, lng }, headers });
    return res.data.data;
  }
  // Fallback for when location is not available; fetches a general, non-admin list of reports.
  // Note: This assumes a general, non-admin endpoint exists. If not, this might need adjustment based on backend capabilities.
  const res = await axios.get(`${API_BASE}/reports`, { headers });
  return res.data.data;
}

// Fix: This function was missing headers entirely. Now it correctly authenticates.
export async function fetchUserReports(token = null) {
  const headers = getAuthHeaders(token);
  const res = await axios.get(`${API_BASE}/my-reports`, { headers });
  return res.data.data;
}

// Fix: This function now correctly sends the auth token when creating a report.
export async function submitUserReport(data, token = null) {
  const headers = { ...getAuthHeaders(token), 'Content-Type': 'multipart/form-data' };
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const res = await axios.post(`${API_BASE}/smart-create`, formData, { headers });
  return res.data;
}

// Fix: This function now correctly sends the auth token for upvoting.
export async function upvoteReport(id, token = null) {
  const headers = getAuthHeaders(token);
  const res = await axios.post(`${API_BASE}/report/${id}/upvote`, {}, { headers });
  return res.data;
}

// Fix: This function now correctly sends the auth token for fetching notifications.
export async function fetchNotifications(token = null) {
  const headers = getAuthHeaders(token);
  const res = await axios.get(`${API_BASE}/notifications`, { headers });
  return res.data.notifications;
}