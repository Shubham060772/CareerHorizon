import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Dashboard = () => {
  const { user, role, signIn, logOut } = useAuth();
  const navigate = useNavigate();
  const userRole = role || "student";

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100 px-4">
      <div className="dashboard bg-white shadow-lg rounded-lg p-8 w-full max-w-lg text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold text-blue-600">CAREER HORIZON</h1>
        
        {/* If user is not logged in */}
        {!user ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700">Welcome to Career Horizon</h2>
            <p className="text-gray-500">Find Internship or Placement opportunities here</p>  
            <button 
              onClick={() => navigate("/login")} 
              className="mt-6 w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
            >
              Login with Google
            </button>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-700">
              Welcome, <span className="font-semibold text-blue-600">{user.displayName}</span> ({userRole?.toUpperCase()})
            </p>
            <button 
              onClick={logOut} 
              className="mt-6 w-full bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition duration-200 shadow-md"
            >
              Logout
            </button>

            {/* Role-based rendering */}
            {userRole === "admin" ? (
              <div className="admin-panel mt-6">
                <h2 className="text-lg font-semibold text-gray-700">Admin Panel</h2>
                <button 
                  onClick={() => navigate("/manage-opportunities")} 
                  className="mt-4 w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
                >
                  Manage Opportunities
                </button>
              </div>
            ) : (
              <div className="student-dashboard mt-6">
                <h2 className="text-lg font-semibold text-gray-700">Student Dashboard</h2>
                <button 
                  onClick={() => navigate("/internships")} 
                  className="mt-4 w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
                >
                  View Internship Opportunities
                </button>
                <button 
                  onClick={() => navigate("/saved-internships")} 
                  className="mt-4 w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
                >
                  View Saved
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
