import { useContext } from "react";
import { useAuth } from "../context/AuthContext";

const AdminPage = () => {
  const { logout } = useContext(useAuth);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={logout}>Logout</button>
      <p>Only admins can see this.</p>
    </div>
  );
};

export default AdminPage;
