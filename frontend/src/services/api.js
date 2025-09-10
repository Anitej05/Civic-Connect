
// Mock API — replace with real axios calls when backend is ready
// Integrate Clerk's getToken() to attach Authorization header

export async function fetchAdminReports({ department = null } = {}) {
  const base = [
    {
      _id: "r1",
      title: "Pothole on Main St",
      category: "Pothole",
      urgency: "High",
      assigned_department: "Public Works",
      original_text: "Deep pothole near bus stop",
      location: { type: "Point", coordinates: [78.4013, 17.4458] },
      status: "Submitted",
      created_at: new Date().toISOString(),
    },
    {
      _id: "r2",
      title: "Streetlight flickering",
      category: "Streetlight",
      urgency: "Medium",
      assigned_department: "Electrical",
      original_text: "Light flickers at night",
      location: { type: "Point", coordinates: [78.4050, 17.4470] },
      status: "In Progress",
      created_at: new Date().toISOString(),
    },
  ];
  return base.filter((r) => (department ? r.assigned_department === department : true));
}

export async function fetchReportById(id) {
  const all = await fetchAdminReports({});
  return all.find((r) => r._id === id) || null;
}

export async function updateReportStatus(id, newStatus) {
  return { message: "Status updated", report: { _id: id, status: newStatus } };
}


// -------------------- USER APIs --------------------
export async function fetchFeedReports() {
  return [
    {
      id: "1",
      title: "Broken Streetlight",
      category: "Electrical",
      status: "In Progress",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Overflowing Garbage Bin",
      category: "Sanitation",
      status: "Submitted",
      created_at: new Date().toISOString(),
    },
  ];
}

export async function fetchUserReports(userId) {
  return [
    {
      id: "10",
      title: "Water leakage near home",
      category: "Water",
      status: "Submitted",
      created_at: new Date().toISOString(),
      userId,
    },
  ];
}

export async function submitUserReport(data) {
  return {
    id: Date.now().toString(),
    ...data,
    status: "Submitted",
    created_at: new Date().toISOString(),
  };
}
