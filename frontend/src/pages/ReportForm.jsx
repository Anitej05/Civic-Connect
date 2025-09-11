import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { submitReport, selectReportSubmission, resetSubmissionState } from "../features/reportSubmissionSlice";
import toast from "react-hot-toast";

export default function ReportForm() {
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector(selectReportSubmission);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const getLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocating(false);
          toast.success("Location captured!");
        },
        (error) => {
          let errorMessage = "Could not get your location.";
          // ... (error handling logic remains the same)
          toast.error(errorMessage);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      toast.error("Please provide your location.");
      return;
    }
    if (!image) { // The AI endpoint requires an image
      toast.error("Please provide an image for the AI to analyze.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    if (details) {
      formData.append("text", details);
    }
    
    dispatch(submitReport(formData));
  };

  useEffect(() => {
    if (success) {
      toast.success("Report submitted successfully!");
      dispatch(resetSubmissionState());
      navigate('/my-reports'); // Redirect after success
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch, navigate]);
  
  const canSubmit = image && location && !loading;

  return (
    <div className="page-container bg-gray-50 h-full flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl"> 
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Submit a New Report</h2>
          <p className="text-center text-gray-600 mb-6">Our AI will analyze your submission to categorize and assign it automatically.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label htmlFor="image">Upload Image (Required)</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
            </div>

            <div className="form-control mt-4">
              <label htmlFor="details">Description (Optional)</label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any extra details for the AI..."
                rows="4"
              />
            </div>

            <div className="form-control mt-6">
              <label>Location (Required)</label>
              {location ? (
                <p className="text-sm text-green-600 font-semibold">Location captured successfully!</p>
              ) : (
                <button type="button" onClick={getLocation} disabled={isLocating} className="btn-secondary w-full">
                  {isLocating ? 'Getting Location...' : 'Get Current Location'}
                </button>
              )}
            </div>

            <div className="mt-8">
              <button type="submit" disabled={!canSubmit} className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed">
                {loading ? 'Submitting to AI...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
