import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../features/axios";
import { useState } from "react";
import Loading from "../layout/Loading";

const SignUp = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);
            localStorage.setItem("email", email);
            await axiosInstance.post("/user/signup", { email, password });
            navigate("/codeverification")
        } catch (error) {
            alert("Failed to SignUp try again later.")
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
                <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
                <form className="space-y-4" onSubmit={handleSignUp}>
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
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }}
                    />
                    <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;