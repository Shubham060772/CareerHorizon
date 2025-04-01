import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { user, signIn, logOut } = useAuth();
    const navigate = useNavigate();

    const handlesignin = async () => {
        try {
            await signIn();
            alert("Login Successful!");
            navigate("/");
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-96 text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Login to Your Account</h2>
                {user ? (
                    <button 
                        onClick={logOut} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300">
                        Logout
                    </button>
                ) : (
                    <button 
                        onClick={handlesignin} 
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                        Login with Google
                    </button>
                )}
            </div>
        </div>
    );
};

export default Login;
