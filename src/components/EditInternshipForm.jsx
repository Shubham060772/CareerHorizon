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

  if (loading) return <p>Loading...</p>;
  if (!internship) return <p>Internship not found.</p>;
  const handleInputChange = (field) => (e) => {
    setInternship({ ...internship, [field]: e.target.value });
  };
  return (
    <div>
      <h2 className="text-xl font-medium text-black dark:text-white">Edit Internship</h2>
      <label>Title:</label>
      <input
        type="text"
        value={internship.title || ""}
        onChange={handleInputChange("title")}
        />
    <label>Company:</label>
      <input
        type="text"
        value={internship.company || ""}
        onChange={handleInputChange("company")}
        />
    <label>Location:</label>
      <input
        type="text"
        value={internship.location || ""}
        onChange={handleInputChange("location")}
      />
    <label>Stipend:</label>
      <input
        type="text"
        value={internship.stipend || ""}
        onChange={handleInputChange("stipend")}
      />
      <label>Description:</label>
      <textarea
        value={internship.description || ""}
        onChange={handleInputChange("description")}
      />
      <button onClick={handleUpdate}>Save Changes</button>
    </div>
  );
};

export default EditInternshipForm;
