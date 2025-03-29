import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ roleRequired, children }) => {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (role !== roleRequired) return <Navigate to="/unauthorized" />;

  return children;
};

export default PrivateRoute;
