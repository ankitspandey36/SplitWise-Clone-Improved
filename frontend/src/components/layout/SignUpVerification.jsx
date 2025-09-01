import { useEffect, useState } from "react";
import { axiosInstance } from "../../features/axios";
import Loading from "../layout/Loading";
import { useNavigate } from "react-router-dom";

const VerificationCode = () => {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();




    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const email = localStorage.getItem("email");
            await axiosInstance.post("/user/verify-email", { email, code });
            localStorage.removeItem("email")
            navigate("/login");
        } catch (err) {
            alert("Invalid code or verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        const email = localStorage.getItem("email");
        if (!email) return;
        try {
            setLoading(true);
            await axiosInstance.post("/user/resend-code", { email });

        } catch (err) {
            alert("Failed to resend code.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
                <h2 className="text-2xl font-semibold mb-6 text-center">Enter Verification Code</h2>
                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter code"
                        value={code}
                        required
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                    >
                        Verify
                    </button>
                </form>

                <div className="text-sm text-center mt-4">
                    Didn’t get the code?{" "}

                    <button
                        onClick={handleResendCode}
                        className="text-blue-500 hover:underline font-medium"
                    >
                        Resend Code
                    </button>

                </div>
            </div>
        </div>
    );
};

export default VerificationCode;
