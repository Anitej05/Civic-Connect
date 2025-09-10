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
    <div className="page-container bg-gray-50">
      <div className="container-sm">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Submit a Report</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="details">Description</label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the issue in detail"
                rows="4"
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>General</option>
                <option>Pothole</option>
                <option>Streetlight</option>
                <option>Sanitation</option>
                <option>Water Supply</option>
              </select>
            </div>
            <div className="mt-6">
              <button type="submit" className="btn-primary w-full">
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
