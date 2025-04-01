import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import EditInternshipForm from "./EditInternshipForm";

const EditInternships = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [editingInternship, setEditingInternship] = useState(null); // Track selected internship

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
    if (window.confirm("Are you sure you want to delete this internship?")) {
      await deleteDoc(doc(db, "internships", id));
      setInternships(internships.filter(internship => internship.id !== id));
    }
  };

  return (
    <div className="edit-internships">
      <h1>{editingInternship ? "Edit Internship" : "Manage Internships"}</h1>

      {editingInternship ? (
        // Show Edit Form
        <div>
          <EditInternshipForm internship={editingInternship} />
          <button onClick={() => setEditingInternship(null)}>Back</button>
        </div>
      ) : (
        // Show Internship List
        internships.length === 0 ? (
          <p>No internships available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map(internship => (
                <tr key={internship.id}>
                  <td>{internship.title}</td>
                  <td>{internship.company}</td>
                  <td>{internship.location}</td>
                  <td>
                    <button onClick={() => setEditingInternship(internship)}>Edit</button>
                    <button onClick={() => handleDelete(internship.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};

export default EditInternships;
