import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-500">Unauthorized Access</h1>
      <p className="mt-2">You do not have permission to view this page.</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => navigate("/")}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
