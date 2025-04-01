import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from "firebase/firestore";

const SavedInternships = () => {
  const { user } = useAuth();
  const [savedInternships, setSavedInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedInternships = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, "bookmarks"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const internshipIds = querySnapshot.docs.map(doc => ({
          id: doc.id, // Bookmark document ID
          internshipId: doc.data().internshipId
        }));

        const internshipPromises = internshipIds.map(({ internshipId }) =>
          getDoc(doc(db, "internships", internshipId))
        );
        const internshipDocs = await Promise.all(internshipPromises);

        const internshipData = internshipDocs
          .filter(doc => doc.exists()) // Filter out missing internships
          .map((doc, index) => ({
            id: internshipIds[index].id, // Bookmark ID for removal
            internshipId: doc.id, // Actual internship ID
            ...doc.data(),
          }));

        setSavedInternships(internshipData);
      } catch (error) {
        console.error("Error fetching saved internships:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedInternships();
  }, [user]);

  const handleRemove = async (bookmarkId) => {
    if (!window.confirm("Are you sure you want to remove this internship from saved?")) return;

    try {
      await deleteDoc(doc(db, "bookmarks", bookmarkId));
      setSavedInternships(savedInternships.filter(internship => internship.id !== bookmarkId));
    } catch (error) {
      console.error("Error removing saved internship:", error);
    }
  };

  if (loading) return <p>Loading saved internships...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Saved Internships</h1>
      {savedInternships.length === 0 ? (
        <p className="text-center text-gray-500">No saved internships.</p>
      ) : (
        savedInternships.map(job => (
          <div key={job.id} className="card">
            <h2 className="text-xl font-semibold text-gray-700">{job.title} at {job.company}</h2>
            <p className="text-gray-500">{job.location}</p>
            <p className="text-gray-600">Duration: <span className="font-semibold">{job.duration} months</span></p>
            <p className="text-gray-600">Stipend: <span className="font-semibold">{job.stipend}</span></p>
            
            <div className="flex justify-between items-center mt-4">
              <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                className="button bg-blue-500 text-white">Apply Now</a>

              <button onClick={() => handleRemove(job.id)}
                className="button bg-red-500 text-white">
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SavedInternships;
