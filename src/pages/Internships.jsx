import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";  // Ensure correct import

const Internships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "internships"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log("Fetched internships:", data);  // Debugging console
                setInternships(data);
            } catch (error) {
                console.error("Error fetching internships:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInternships();
    }, []);

    if (loading) return <p>Loading internships...</p>;

    return (
        <div>
            <h1>Internships</h1>
            {internships.length === 0 ? (
                <p>No internships available.</p>
            ) : (
                internships.map((job) => (
                    <div key={job.id}>
                        <h2>{job.title} at {job.company}</h2>
                        <p>{job.location}</p>
                        <p>Duration: {job.duration}</p>
                        <p>Stipend: {job.stipend}</p>
                        <a href={job.applyLink} target="_blank">Apply Now</a>
                    </div>
                ))
            )}
        </div>
    );
};

export default Internships;
