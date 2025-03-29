import { Link } from "react-router-dom";
import { auth } from "./firebase";
import { useState, useEffect } from "react";

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        alert("Logged out successfully!");
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Career Horizon</h1>
            <p>Your Gateway to Off-Campus Internships & Hackathons</p>

            <nav>
                <Link to="/internships">Opportunities</Link> | 
                <Link to="/login">Login</Link>
            </nav>

            {user ? (
                <div>
                    <p>Welcome, {user.displayName}!</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p><Link to="/login">Login to explore more!</Link></p>
            )}
        </div>
    );
};

export default App;
