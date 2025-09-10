

import axios from "axios";

const API_BASE = "/api";

function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
  // If you have a dedicated endpoint, use it:
  // const headers = getAuthHeaders(token);
  // const res = await axios.get(`${API_BASE}/report/${id}`, { headers });
  // return res.data;
  // Otherwise, filter from all:
  const reports = await fetchAdminReports({}, token);
  return reports.find((r) => r.id === id || r._id === id) || null;
}

export async function updateReportStatus(id, newStatus, notes = "", progress_image_url = "", resolved_image_url = "", token = null) {
  const payload = { status: newStatus, notes, progress_image_url, resolved_image_url };
  const headers = getAuthHeaders(token);
  const res = await axios.put(`${API_BASE}/admin/report/${id}/status`, payload, { headers });
  return res.data;
}

// -------------------- USER APIs --------------------
export async function fetchFeedReports(lat = null, lng = null, token = null) {
  const headers = getAuthHeaders(token);
  if (lat && lng) {
    const res = await axios.get(`${API_BASE}/nearby`, { params: { lat, lng }, headers });
    return res.data.data;
  }
  return await fetchAdminReports({}, token);
}

export async function fetchUserReports(token = null) {
  const headers = getAuthHeaders(token);
  const res = await axios.get(`${API_BASE}/my-reports`, { headers });
  return res.data.data;
}

export async function submitUserReport(data, token = null) {
  const headers = getAuthHeaders(token);
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await axios.post(`${API_BASE}/smart-create`, formData, { headers });
  return res.data;
}

export async function upvoteReport(id, token = null) {
  const headers = getAuthHeaders(token);
  const res = await axios.post(`${API_BASE}/report/${id}/upvote`, {}, { headers });
  return res.data;
}

export async function fetchNotifications(token = null) {
  const headers = getAuthHeaders(token);
  const res = await axios.get(`${API_BASE}/notifications`, { headers });
  return res.data.notifications;
}
