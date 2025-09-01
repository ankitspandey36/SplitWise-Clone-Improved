import React from "react";
import { axiosInstance } from "../../features/axios.js";

export default function PayButton({ friendUpiId, amount, isId, confirmFunction }) {

    

    const handlePayment = async () => {
        try {
            const { data: user } = await axiosInstance.get("/user/me");  // destructure data here

            const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

            console.log("Amount:", amount);
            const { data: order } = await axiosInstance.post("/create-order", { amount });
            console.log("Order created:", order);
            console.log(user);
            

            const options = {
                key: RAZORPAY_KEY,
                amount: order.amount,
                currency: order.currency,
                name: "Splitwise Payment",
                description: `Pay to ${friendUpiId}`,
                order_id: order.id,
                prefill: {
                    name: user.data.email.split('@')[0],
                    email: user.data.email,
                    contact: "",  
                    method: "upi",
                    upi: {
                        vpa: friendUpiId,
                    },
                },
                handler: async function (response) {
                    console.log("Payment success:", response);
                    try {
                        const verifyRes = await axiosInstance.post("/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if (verifyRes.data.success) {
                            await confirmFunction();
                        } else {
                            console.error("Payment verification failed");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                    }
                },
                theme: { color: "#3399cc" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Payment error", error);
        }
    };


    return (
        <button
            onClick={handlePayment}
            disabled={!isId}
            className={`px-6 py-2 rounded-2xl font-semibold shadow-md transition-colors duration-200
        ${isId
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
        >
            Pay ₹{amount}
        </button>
    );
}
