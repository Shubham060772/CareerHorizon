import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Internships from "./pages/Internships"; // ✅ Added import
// import ManageOpp from "./pages/ManageOpp";
import PostInternship from "./pages/PostInternships";
import EditInternships from "./pages/EditInternships";
import EditInternshipForm from "./components/EditInternshipForm";
import ManageOpportunities from "./pages/ManageOpportunities";
import SavedInternships from "./pages/SavedInternships";
import Hackathons from "./pages/Hackathons";
import ManageHackathonsPanel from "./pages/ManageHackathonsPanel";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/manage-opportunities" element={<ManageOpportunities/>}/>
          <Route path="/post-internships" element={<PostInternship/>}/>
          <Route path="/edit-internships" element={<EditInternships/>}/>
          <Route path="/edit-internship/:id" element={<EditInternshipForm/>}/>
          <Route path="/saved-internships" element={<SavedInternships/>}/>
          <Route path="/hackathons" element={<Hackathons />} />
          <Route
            path="/manage-hackathons"
            element={
              <PrivateRoute roleRequired="admin">
                <ManageHackathonsPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute roleRequired="admin">
                <AdminPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
