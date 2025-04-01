import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const EditInternshipForm = () => {
  const { id } = useParams(); // Get internship ID from URL
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const internshipRef = doc(db, "internships", id);
        const docSnap = await getDoc(internshipRef);
        if (docSnap.exists()) {
          setInternship(docSnap.data());
        } else {
          console.error("Internship not found");
        }
      } catch (error) {
        console.error("Error fetching internship:", error);
      }
      setLoading(false);
    };
    fetchInternship();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const internshipRef = doc(db, "internships", id);
      await updateDoc(internshipRef, internship);
      navigate("/edit-internships"); // Redirect to internship list after updating
    } catch (error) {
      console.error("Error updating internship:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!internship) return <p className="text-center text-red-500">Internship not found.</p>;

  const handleInputChange = (field) => (e) => {
    setInternship({ ...internship, [field]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Edit Internship</h2>
      
      <div className="space-y-4">
        <label className="block text-gray-700 font-medium">Title:</label>
        <input
          type="text"
          value={internship.title || ""}
          onChange={handleInputChange("title")}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-gray-700 font-medium">Company:</label>
        <input
          type="text"
          value={internship.company || ""}
          onChange={handleInputChange("company")}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-gray-700 font-medium">Location:</label>
        <input
          type="text"
          value={internship.location || ""}
          onChange={handleInputChange("location")}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-gray-700 font-medium">Stipend:</label>
        <input
          type="text"
          value={internship.stipend || ""}
          onChange={handleInputChange("stipend")}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-gray-700 font-medium">Description:</label>
        <textarea
          value={internship.description || ""}
          onChange={handleInputChange("description")}
          rows="4"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>

        <div className="flex justify-between mt-4">
          <button 
            onClick={() => navigate("/edit-internships")}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInternshipForm;
