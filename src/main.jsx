import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Internships from "./pages/Internships"; // ✅ Added import

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/internships" element={<Internships />} /> {/* ✅ Fixed */}
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
