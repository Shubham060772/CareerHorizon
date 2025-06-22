import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const AddHackathon = () => {
  const [form, setForm] = useState({
    title: "",
    organizer: "",
    mode: "Online",
    prize: "",
    deadline: "",
    link: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "hackathons"), form);
      setSuccess("Hackathon added!");
      setForm({ title: "", organizer: "", mode: "Online", prize: "", deadline: "", link: "" });
    } catch (err) {
      setSuccess("Error adding hackathon");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="input-field" required />
      <input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" className="input-field" required />
      <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
      </select>
      <input name="prize" value={form.prize} onChange={handleChange} placeholder="Prize (number)" className="input-field" type="number" min="0" />
      <input name="deadline" value={form.deadline} onChange={handleChange} placeholder="Deadline (YYYY-MM-DD)" className="input-field" type="date" />
      <input name="link" value={form.link} onChange={handleChange} placeholder="Details Link" className="input-field col-span-full" />
      <button type="submit" className="button bg-blue-500 text-white col-span-full" disabled={loading}>
        {loading ? "Adding..." : "Add Hackathon"}
      </button>
      {success && <div className="col-span-full text-green-600 mt-2">{success}</div>}
    </form>
  );
};

export default AddHackathon;
