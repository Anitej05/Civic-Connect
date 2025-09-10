
import React from "react";

const departments = [
  "All",
  "Sanitation",
  "Public Works",
  "Electrical",
  "Water Board",
  "General",
];

export default function DepartmentFilter({ value, onChange }) {
  return (
    <div className="form-control flex items-center gap-3">
      <label className="!mb-0">Department</label>
      <select
        value={value || "All"}
        onChange={(e) =>
          onChange(e.target.value === "All" ? null : e.target.value)
        }
        className="!w-auto"
      >
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
