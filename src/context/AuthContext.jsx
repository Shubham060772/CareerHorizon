import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

// Create Auth Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student"); // Default: student

  // Fetch user role from Firestore
  const fetchUserRole = async (authUser) => {
    if (!authUser) {
      console.log("No authenticated user found. Assigning default role: student");
      setRole("student");
      return;
    }

    console.log("Fetching role for:", authUser.email);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", authUser.email.trim())); // Trim email to avoid spaces
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("User Data from Firestore:", userData);

        setRole(userData.role || "student"); // Assign role, default: student
      } else {
        console.warn("User not found in Firestore. Assigning default role: student.");
        setRole("student");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setRole("student");
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        await fetchUserRole(authUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign-in function
  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      await fetchUserRole(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Logout function
  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole("student"); // Reset role
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
