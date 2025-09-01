import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axiosInstance"; // adjust path as needed

const LoginCodeVerification = () => {
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      alert("No email found. Please login again.");
      navigate("/login"); // or redirect to forgot password
    } else {
      setEmail(storedEmail);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/verify-code", { email, code });
      if (res.data.success) {
        localStorage.removeItem("email");
        navigate("/reset-password"); // or dashboard
      } else {
        alert("Invalid code");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await axiosInstance.post("/auth/resend-code", { email });
      alert("Code resent to your email");
    } catch (err) {
      console.error(err);
      alert("Could not resend code");
    }
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-6 text-center">Verify Your Email</h2>
        <form className="space-y-4" onSubmit={handleVerify}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter verification code"
            type="text"
          />
          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
          >
            Verify
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            className="text-sm text-purple-600 hover:underline"
            disabled={resendLoading}
          >
            {resendLoading ? "Resending..." : "Resend / Regenerate Code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginCodeVerification;
