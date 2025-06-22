import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { signIn: loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isSignup) {
        await signupWithEmail(email, password, name);
        setSuccess("Signup successful! Redirecting...");
      } else {
        await loginWithEmail(email, password);
        setSuccess("Login successful! Redirecting...");
      }
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(
        err.message
          .replace("Firebase:", "")
          .replace("auth/", "")
          .replace(/-/g, " ")
      );
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError("Google sign-in failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isSignup ? "Sign Up" : "Login"}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {isSignup && (
            <input
              type="text"
              placeholder="Name"
              className="input-field"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading
              ? isSignup
                ? "Signing Up..."
                : "Logging In..."
              : isSignup
              ? "Sign Up"
              : "Login"}
          </button>
        </form>
        <div className="my-4 text-center text-gray-500">or</div>
        <button
          className="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition mb-2"
          onClick={handleGoogle}
          disabled={loading}
        >
          Sign in with Google
        </button>
        <div className="mt-4 text-center">
          {isSignup ? (
            <span>
              Already have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsSignup(false)}
              >
                Login
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
