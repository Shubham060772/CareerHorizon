import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";

// Create Auth Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student"); // Default: student
  // Fetch user role from Firestore or create new user
  const fetchUserRole = async (authUser) => {
    if (!authUser) {
      setRole("student");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", authUser.email.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setRole(userData.role || "student");
      } else {
        // Create new user document with default role
        const userDocRef = doc(usersRef);
        await setDoc(userDocRef, {
          email: authUser.email.trim(),
          role: "student",
          displayName: authUser.displayName,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        setRole("student");
      }
    } catch (error) {
      console.error("Error managing user role:", error);
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

  // Email/password login
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    await fetchUserRole(result.user);
    return result;
  };
  // Email/password signup
  const signupWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set displayName in Firebase Auth profile (modular syntax)
    if (result.user) {
      await updateProfile(result.user, { displayName });
    }
    setUser({ ...result.user, displayName });
    // Store user in Firestore with name
    const usersRef = collection(db, "users");
    const userDocRef = doc(usersRef);
    await setDoc(userDocRef, {
      email: email.trim(),
      role: "student",
      displayName,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    setRole("student");
    return result;
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
    <AuthContext.Provider value={{ user, role, signIn, logOut, loginWithEmail, signupWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
