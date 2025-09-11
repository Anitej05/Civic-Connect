import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addReport } from "../features/userReportsSlice";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

export default function ReportForm() {
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const dispatch = useDispatch();
  const { user } = useUser();

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
        // Fix 2: Add detailed error handling for geolocation
        (error) => {
          let errorMessage = "Could not get your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied. Please enable it in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Try again from a different spot.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get your location timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred while getting your location.";
              break;
          }
          toast.error(errorMessage);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
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
    if (!details && !image) {
      toast.error("Please provide either a description or an image.");
      return;
    }

    const reportData = {
      text: details,
      latitude: location.latitude,
      longitude: location.longitude,
      image,
      userId: user.id,
    };
    
    await dispatch(addReport(reportData));
    
    toast.success("Report submitted!");
    setDetails("");
    setImage(null);
    setLocation(null);
  };
  
  const canSubmit = (details || image) && location;

  return (
    // Fix 1: Changed to items-start and added padding to move the form up
    <div className="page-container bg-gray-50 h-full flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl"> 
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Submit a Report</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label htmlFor="details">Description (Optional)</label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the issue you see..."
                rows="4"
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="image">Upload Image (Optional)</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
            </div>

            <div className="form-control mt-6">
              <label>Location</label>
              {location ? (
                <p className="text-sm text-green-600">Location captured successfully!</p>
              ) : (
                <button type="button" onClick={getLocation} disabled={isLocating} className="btn-secondary w-full">
                  {isLocating ? 'Getting Location...' : 'Get Current Location'}
                </button>
              )}
            </div>

            <div className="mt-8">
              <button type="submit" disabled={!canSubmit} className="btn-primary w-full disabled:bg-gray-400">
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}