import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Login = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            alert("Login Successful!");
            navigate("/internships");
        } catch (err) {
            console.log("Login Failed", err);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        alert("Logged out!");
    };

    return (
        <div>
            <h2>LOGIN</h2>
            {user ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <button onClick={handleGoogleLogin}>Login with Google</button>
            )}
        </div>
    );
};

export default Login;
