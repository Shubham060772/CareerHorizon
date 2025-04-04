import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
import { BookmarkIcon,BookmarkFilledIcon } from "../components/BookmarkIcon";


const Internships = () => {
    const { user } = useAuth();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        paid: "all",
        remote: "all",
        duration: "all",
    });
    const [sortOption, setSortOption] = useState("none");
    const [currentPage, setCurrentPage] = useState(1);
    const [savedInternships, setSavedInternships] = useState({});
    const internshipsPerPage = 5;

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "internships"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setInternships(data);
            } catch (error) {
                console.error("Error fetching internships:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInternships();
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchSavedInternships = async () => {
            const q = query(collection(db, "bookmarks"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const saved = {};
            querySnapshot.forEach(doc => {
                saved[doc.data().internshipId] = true;
            });
            setSavedInternships(saved);
        };
        fetchSavedInternships();
    }, [user]);

    const handleSearch = (e) => setSearchQuery(e.target.value);
    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleSortChange = (e) => setSortOption(e.target.value);
    const handlePageChange = (newPage) => setCurrentPage(newPage);

    const toggleBookmark = async (internshipId) => {
        if (!user) {
            alert("You need to log in to save internships.");
            return;
        }

        const bookmarkRef = doc(db, "bookmarks", `${user.uid}_${internshipId}`);

        if (savedInternships[internshipId]) {
            await deleteDoc(bookmarkRef);
            setSavedInternships(prev => ({ ...prev, [internshipId]: false }));
        } else {
            await setDoc(bookmarkRef, { userId: user.uid, internshipId });
            setSavedInternships(prev => ({ ...prev, [internshipId]: true }));
        }
    };

    // **🔍 Corrected Filtering Logic**
    let filteredInternships = internships.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              job.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPaid = filters.paid === "all" || 
                            (filters.paid === "paid" && job.paid === true) || 
                            (filters.paid === "unpaid" && job.paid === false);

        const matchesRemote = filters.remote === "all" ||
                              (filters.remote === "remote" && job.remote === true) ||
                              (filters.remote === "onsite" && job.remote === false);

        const matchesDuration = filters.duration === "all" ||
                               (filters.duration === "<3" && job.duration < 3) ||
                               (filters.duration === "3-6" && job.duration >= 3 && job.duration <= 6) ||
                               (filters.duration === ">6" && job.duration > 6);

        return matchesSearch && matchesPaid && matchesRemote && matchesDuration;
    });

    // **✅ Fixed Sorting (No Direct Mutation)**
    let sortedInternships = [...filteredInternships];
    if (sortOption === "stipend") {
        sortedInternships.sort((a, b) => b.stipend - a.stipend);
    } else if (sortOption === "duration") {
        sortedInternships.sort((a, b) => b.duration - a.duration);
    }

    const indexOfLastInternship = currentPage * internshipsPerPage;
    const indexOfFirstInternship = indexOfLastInternship - internshipsPerPage;
    const currentInternships = sortedInternships.slice(indexOfFirstInternship, indexOfLastInternship);

    if (loading) return <p>Loading internships...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Internships</h1>

            {/* 🔍 Search & Filters */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">

            <input type="text" placeholder="Search by title, company, or location" value={searchQuery} onChange={handleSearch} className="input-field" />
            
            <select name="paid" value={filters.paid} onChange={handleFilterChange} className="filter-select">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
            </select>

            {/* <select name="remote" value={filters.remote} onChange={handleFilterChange}>
                <option value="all">All</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-Site</option>
                </select>

                <select name="duration" value={filters.duration} onChange={handleFilterChange}>
                <option value="all">All</option>
                <option value="<3">Less than 3 months</option>
                <option value="3-6">3-6 months</option>
                <option value=">6">More than 6 months</option>
                </select> */}

            {/* ✅ Sorting Dropdown */}
            <select value={sortOption} onChange={handleSortChange} className="filter-select">
                <option value="none">Sort by</option>
                <option value="stipend">Stipend (High to Low)</option>
                <option value="duration">Duration (Long to Short)</option>
            </select>

            </div>
            {/* 🔥 Displaying Internships */}
            <div className="grid md:grid-cols-2 gap-6">
            {currentInternships.length === 0 ? (
                <p>No internships available.</p>
            ) : (currentInternships.map((job) => (
                    <div key={job.id} className="card">
                        <h2 className="text-xl font-semibold text-gray-700">{job.title} at {job.company}</h2>
                        <p className="text-gray-500">{job.location}</p>
                        <p className="text-gray-600">Duration: <span className="font-semibold">{job.duration} months</span></p>
                        <p className="text-gray-600">Stipend: <span className="font-semibold">{job.stipend}</span></p>
                        
                        <div className="flex justify-between items-center mt-4">
                            <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                               className="button bg-blue-500 text-white">Apply Now</a>

                            <button onClick={() => toggleBookmark(job.id)}
                                    className={`button ${savedInternships[job.id] ? "bg-red-500" : "bg-yellow-500"} text-white`}>
                                {savedInternships[job.id] ?<BookmarkFilledIcon/>: <BookmarkIcon/>}
                            </button>
                        </div>

                    </div>
                        
                ))
            )}
                    <div>
                        <button className="save-button" onClick={()=>navigate("/saved-internships")}>Saved Internships</button>
                    </div>
            </div>
        </div>
    );
};

export default Internships;
