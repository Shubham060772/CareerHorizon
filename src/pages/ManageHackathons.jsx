import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const emptyForm = { title: "", organizer: "", mode: "Online", prize: "", deadline: "", link: "" };

const ManageHackathons = () => {
    const { user, role } = useAuth();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchHackathons();
    }, []);

    const fetchHackathons = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "hackathons"));
        setHackathons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.organizer) return alert("Title and Organizer are required");
        if (editId) {
            await updateDoc(doc(db, "hackathons", editId), form);
        } else {
            await addDoc(collection(db, "hackathons"), form);
        }
        setForm(emptyForm);
        setEditId(null);
        fetchHackathons();
    };

    const handleEdit = (h) => {
        setForm({ ...h });
        setEditId(h.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this hackathon?")) return;
        await deleteDoc(doc(db, "hackathons", id));
        fetchHackathons();
    };

    if (!user || role !== "admin") return <p>Unauthorized</p>;
    if (loading) return <p>Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Hackathons</h1>
            <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="input-field" required />
                <input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" className="input-field" required />
                <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                </select>
                <input name="prize" value={form.prize} onChange={handleChange} placeholder="Prize (number)" className="input-field" type="number" min="0" />
                <input name="deadline" value={form.deadline} onChange={handleChange} placeholder="Deadline (YYYY-MM-DD)" className="input-field" type="date" />
                <input name="link" value={form.link} onChange={handleChange} placeholder="Details Link" className="input-field col-span-full" />
                <button type="submit" className="button bg-blue-500 text-white col-span-full">{editId ? "Update" : "Add"} Hackathon</button>
                {editId && <button type="button" className="button bg-gray-400 text-white col-span-full" onClick={() => { setForm(emptyForm); setEditId(null); }}>Cancel Edit</button>}
            </form>
            <div className="grid gap-4">
                {hackathons.length === 0 ? <p>No hackathons found.</p> : hackathons.map(h => (
                    <div key={h.id} className="card flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h2 className="font-semibold">{h.title}</h2>
                            <p className="text-sm text-gray-600">{h.organizer} | {h.mode} | Prize: {h.prize ? `₹${h.prize}` : 'N/A'} | Deadline: {h.deadline}</p>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                            <button className="button bg-yellow-500 text-white" onClick={() => handleEdit(h)}>Edit</button>
                            <button className="button bg-red-500 text-white" onClick={() => handleDelete(h.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageHackathons;
