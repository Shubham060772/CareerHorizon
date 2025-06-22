import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const EditHackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", organizer: "", mode: "Online", prize: "", deadline: "", link: "" });
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "hackathons"));
    setHackathons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleEdit = (h) => {
    setForm({ ...h });
    setEditId(h.id);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editId) return;
    await updateDoc(doc(db, "hackathons", editId), form);
    setSuccess("Hackathon updated!");
    setEditId(null);
    setForm({ title: "", organizer: "", mode: "Online", prize: "", deadline: "", link: "" });
    fetchHackathons();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "hackathons", id));
    setSuccess("Hackathon deleted!");
    setDeleteId(null);
    fetchHackathons();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Edit Hackathons</h2>
      <div className="grid gap-4 mb-6">
        {hackathons.length === 0 ? <p>No hackathons found.</p> : hackathons.map(h => (
          <React.Fragment key={h.id}>
            <div className={`card flex flex-col md:flex-row md:items-center justify-between ${deleteId === h.id ? 'bg-red-50' : ''}`}>
              <div>
                <h3 className="font-semibold">{h.title}</h3>
                <p className="text-sm text-gray-600">{h.organizer} | {h.mode} | Prize: {h.prize ? `₹${h.prize}` : 'N/A'} | Deadline: {h.deadline}</p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button className="button bg-yellow-500 text-white" onClick={() => handleEdit(h)}>Edit</button>
                {deleteId !== h.id && (
                  <button className="button bg-red-500 text-white" onClick={() => setDeleteId(h.id)}>Delete</button>
                )}
              </div>
            </div>
            {/* Inline Delete Confirmation */}
            {deleteId === h.id && (
              <div className="bg-red-50 p-3 border border-red-200 rounded-md m-2 shadow-md animate-bounce-once">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="alert" className="text-red-500">⚠️</span>
                    <h3 className="font-bold text-gray-800">Confirm Delete</h3>
                  </div>
                  <button onClick={() => setDeleteId(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to delete <span className="font-medium">{h.title}</span>?
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setDeleteId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 text-sm">Cancel</button>
                  <button onClick={() => handleDelete(h.id)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 text-sm flex items-center gap-1">Delete</button>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {editId && (
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="input-field" required />
          <input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" className="input-field" required />
          <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
          <input name="prize" value={form.prize} onChange={handleChange} placeholder="Prize (number)" className="input-field" type="number" min="0" />
          <input name="deadline" value={form.deadline} onChange={handleChange} placeholder="Deadline (YYYY-MM-DD)" className="input-field" type="date" />
          <input name="link" value={form.link} onChange={handleChange} placeholder="Details Link" className="input-field col-span-full" />
          <button type="submit" className="button bg-green-500 text-white col-span-full">Update Hackathon</button>
          <button type="button" className="button bg-gray-400 text-white col-span-full" onClick={() => { setEditId(null); setForm({ title: "", organizer: "", mode: "Online", prize: "", deadline: "", link: "" }); }}>Cancel</button>
          {success && <div className="col-span-full text-green-600 mt-2">{success}</div>}
        </form>
      )}
    </div>
  );
};

export default EditHackathons;
