import { Link } from "react-router-dom";
import { axiosInstance } from '../../features/axios.js'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../layout/Loading.jsx";
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      await axiosInstance.post("/user/login", { email, password });
      navigate("/splitwise/dashboard");
    } catch (error) {
      console.log(error)
      alert("Unable to login. Please try again later.")
    }
    finally {
      setLoading(false);
    }

  };

  if(loading) return <Loading/>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value) }}
            required
          />
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value) }}
            required
          />
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-2 text-center">
          <Link to="/forgotpassword" className="text-sm text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          New? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
