import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const Hackathons = () => {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ mode: "all", prize: "all" });
    const [sortOption, setSortOption] = useState("none");
    const [currentPage, setCurrentPage] = useState(1);
    const hackathonsPerPage = 12;

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "hackathons"));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHackathons(data);
            } catch (error) {
                console.error("Error fetching hackathons:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHackathons();
    }, []);

    const handleSearch = (e) => setSearchQuery(e.target.value);
    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleSortChange = (e) => setSortOption(e.target.value);
    const handlePageChange = (newPage) => setCurrentPage(newPage);

    let filtered = hackathons.filter(h => {
        const matchesSearch = h.title?.toLowerCase().includes(searchQuery.toLowerCase()) || h.organizer?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMode = filters.mode === "all" || (filters.mode === "online" && h.mode === "Online") || (filters.mode === "offline" && h.mode === "Offline");
        const matchesPrize = filters.prize === "all" || (filters.prize === ">50000" && h.prize && h.prize > 50000) || (filters.prize === "<50000" && h.prize && h.prize <= 50000);
        return matchesSearch && matchesMode && matchesPrize;
    });

    let sorted = [...filtered];
    if (sortOption === "prize") sorted.sort((a, b) => (b.prize || 0) - (a.prize || 0));
    if (sortOption === "deadline") sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    const indexOfLast = currentPage * hackathonsPerPage;
    const indexOfFirst = indexOfLast - hackathonsPerPage;
    const current = sorted.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(sorted.length / hackathonsPerPage);

    if (loading) return <p>Loading hackathons...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Hackathons</h1>
            {/* 🔍 Search & Filters */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <input type="text" placeholder="Search by title or organizer" value={searchQuery} onChange={handleSearch} className="input-field col-span-full md:col-span-2 lg:col-span-3" />
                <select name="mode" value={filters.mode} onChange={handleFilterChange} className="filter-select">
                    <option value="all">Mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                </select>
                <select name="prize" value={filters.prize} onChange={handleFilterChange} className="filter-select">
                    <option value="all">Prize</option>
                    <option value=">50000">Above ₹50,000</option>
                    <option value="<50000">Up to ₹50,000</option>
                </select>
                <select value={sortOption} onChange={handleSortChange} className="filter-select">
                    <option value="none">Sort by</option>
                    <option value="prize">Prize (High to Low)</option>
                    <option value="deadline">Deadline (Soonest First)</option>
                </select>
            </div>
            {/* 🔥 Displaying Hackathons */}
            <div className="relative min-h-[400px] pb-16">
                <div className="grid md:grid-cols-2 gap-6">
                    {current.length === 0 ? <p>No hackathons available.</p> : current.map(h => (
                        <div key={h.id} className="card">
                            <h2 className="text-xl font-semibold text-gray-700">{h.title}</h2>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-500">{h.organizer}</p>
                                {h.mode && (
                                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                        {h.mode}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600">Prize: <span className="font-semibold">{h.prize ? `₹ ${h.prize.toLocaleString('en-IN')}` : 'N/A'}</span></p>
                            <p className="text-gray-600">Deadline: <span className="font-semibold text-red-600">{h.deadline ? new Date(h.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span></p>
                            <div className="flex justify-between items-center mt-4">
                                {h.link && <a href={h.link} target="_blank" rel="noopener noreferrer" className="button bg-blue-500 text-white">View Details</a>}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i + 1} className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hackathons;
