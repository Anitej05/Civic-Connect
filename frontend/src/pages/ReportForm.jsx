import { useState } from "react";
import { useDispatch } from "react-redux";
import { addReport } from "../features/userReportsSlice";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

export default function ReportForm() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("General");
  const dispatch = useDispatch();
  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(
      addReport({
        title,
        details,
        category,
        userId: user.id,
      })
    );
    toast.success("Report submitted!");
    setTitle("");
    setDetails("");
    setCategory("General");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Submit a Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe the issue"
          className="w-full border p-2 rounded"
          rows="4"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option>General</option>
          <option>Pothole</option>
          <option>Streetlight</option>
          <option>Sanitation</option>
          <option>Water Supply</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
