import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role, signIn, logOut } = useAuth();
  const navigate = useNavigate();
  const userRole = role || "student";
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Show login button if no user is logged in */}
      {!user ? (
        <button onClick={signIn}>Login with Google</button>
      ) : (
        <div>
          <p>Welcome, {user.displayName} ({userRole?.toUpperCase()})</p>
          <button onClick={logOut}>Logout</button>

          {/* Role-based rendering */}
          {userRole === "admin" ? (
            <div className="admin-panel">
              <h2>Admin Panel</h2>
              <button onClick={() => navigate("/manage-opportunities")}>
                Manage Opportunities
              </button>
            </div>
          ) : (
            <div className="student-dashboard">
              <h2>Student Dashboard</h2>
              <button onClick={() => navigate("/internships")}>
                View Internship Opportunities
              </button>
              <button onClick={() => navigate("/profile")}>
                View Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
