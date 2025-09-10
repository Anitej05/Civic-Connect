
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
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Department</label>
      <select
        value={value || "All"}
        onChange={(e) =>
          onChange(e.target.value === "All" ? null : e.target.value)
        }
        className="px-3 py-2 border rounded-md bg-white"
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
