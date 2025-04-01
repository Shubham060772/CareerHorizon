import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Trash2, AlertTriangle, X } from "lucide-react"; // Import icons

const EditInternships = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/"); // Redirect non-admin users
      return;
    }

    const fetchInternships = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "internships"));
        const internshipsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInternships(internshipsData);
      } catch (error) {
        console.error("Error fetching internships:", error);
      }
    };

    fetchInternships();
  }, [role, navigate]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "internships", id));
      // Find the deleted internship title for the success message
      const deletedInternship = internships.find(item => item.id === id);
      setSuccessMessage(`${deletedInternship.title} was deleted successfully`);
      // Remove from state
      setInternships(internships.filter(internship => internship.id !== id));
      // Clear delete id
      setDeleteId(null);
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error deleting internship:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Edit Internships</h1>

      {internships.length === 0 ? (
        <p className="text-center text-gray-500">No internships available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border border-gray-300 p-3 text-left">Title</th>
                <th className="border border-gray-300 p-3 text-left">Company</th>
                <th className="border border-gray-300 p-3 text-left">Location</th>
                <th className="border border-gray-300 p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map(internship => (
                <>
                  <tr key={internship.id} className={`hover:bg-gray-50 ${deleteId === internship.id ? 'bg-red-50' : ''}`}>
                    <td className="border border-gray-300 p-3">{internship.title}</td>
                    <td className="border border-gray-300 p-3">{internship.company}</td>
                    <td className="border border-gray-300 p-3">{internship.location}</td>
                    <td className="border border-gray-300 p-3 flex gap-2">
                      <button 
                        onClick={() => navigate(`/edit-internship/${internship.id}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                      >
                        Edit
                      </button>
                      {deleteId !== internship.id && (
                        <button 
                          onClick={() => setDeleteId(internship.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  
                  {/* Inline Delete Confirmation */}
                  {deleteId === internship.id && (
                    <tr className="animate-bounce-once">
                      <td colSpan="4" className="p-0 border-0">
                        <div className="bg-red-50 p-3 border border-red-200 rounded-md m-2 shadow-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="text-red-500 h-5 w-5" />
                              <h3 className="font-bold text-gray-800">Confirm Delete</h3>
                            </div>
                            <button 
                              onClick={() => setDeleteId(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            Are you sure you want to delete <span className="font-medium">{internship.title}</span>?
                          </p>
                          
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setDeleteId(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleDelete(internship.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 text-sm flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 bg-green-50 border-l-4 border-green-500 p-3 rounded shadow-lg flex items-center gap-3 animate-slide-in">
          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-800">{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default EditInternships;