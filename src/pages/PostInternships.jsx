import React, { useState, useContext } from "react";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; 

const PostInternship = () => {
  const { user, role } = useAuth(); // Get user & role
  const [internship, setInternship] = useState({
    title: "",
    company: "",
    location: "",
    applyLink: "",
    stipend: ""
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
      alert("Internship posted successfully!");
      setInternship({ title: "", company: "", location: "", applyLink: "" ,stipend: ""});
    } catch (error) {
      console.error("Error posting internship:", error);
      alert("Failed to post internship.");
    }
  };

  return (
    <div>
      <h2>Post Internship</h2>
      {role !== "admin" ? (
        <p>Access Denied. Only admins can post internships.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input name="title" placeholder="Internship Title" value={internship.title} onChange={handleChange} required />
          <input name="company" placeholder="Company Name" value={internship.company} onChange={handleChange} required />
          <input name="location" placeholder="Location (Remote/City)" value={internship.location} onChange={handleChange} required />
          <input name="applyLink" placeholder="Application Link" value={internship.applyLink} onChange={handleChange} required />
          <input name="stipend" placeholder="Stipend" value={internship.stipend} onChange={handleChange} required />
          <button type="submit">Post Internship</button>
        </form>
      )}
    </div>
  );
};

export default PostInternship;
