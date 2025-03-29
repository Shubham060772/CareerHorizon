import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <button
        className="px-6 py-3 bg-blue-500 text-white rounded-lg"
        onClick={loginWithGoogle}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default LoginPage;
