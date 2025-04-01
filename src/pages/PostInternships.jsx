import React, { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import SuccessPopup from "../components/SuccessPopup"; // Import the new component

const PostInternship = () => {
  const { user, role } = useAuth();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [internship, setInternship] = useState({
    title: "",
    company: "",
    location: "",
    applyLink: "",
    stipend: "",
  });

  const handleChange = (e) => {
    setInternship({ ...internship, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== "admin") {
      alert("Only admins can post internships!");
      return;
    }
    try {
      await addDoc(collection(db, "internships"), {
        ...internship,
        postedBy: user.email,
        timestamp: serverTimestamp(),
      });
      // Show success popup instead of alert
      setShowSuccessPopup(true);
      setInternship({ title: "", company: "", location: "", applyLink: "", stipend: "" });
    } catch (error) {
      console.error("Error posting internship:", error);
      alert("Failed to post internship.");
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        Post Internship
      </h2>

      {role !== "admin" ? (
        <p className="text-center text-red-500 font-semibold">
          ❌ Access Denied. Only admins can post internships.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Internship Title"
            value={internship.title}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="company"
            placeholder="Company Name"
            value={internship.company}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="location"
            placeholder="Location (Remote/City)"
            value={internship.location}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="applyLink"
            placeholder="Application Link"
            value={internship.applyLink}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="stipend"
            placeholder="Stipend"
            value={internship.stipend}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-3 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Post Internship
          </button>
        </form>
      )}

      {/* Success Popup */}
      <SuccessPopup 
        isVisible={showSuccessPopup}
        onClose={closeSuccessPopup}
        message="Your internship opportunity has been posted successfully! Students can now apply."
      />
    </div>
  );
};

export default PostInternship;