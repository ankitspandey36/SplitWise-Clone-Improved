import { apiError } from "./apiError.js";
import transporter from "./nodeMailer.js"


const verificationEmail = async (email, code) => {
    try {
        const info = await transporter.sendMail({
            from: '"Splitit" <chadcam132@gmail.com>',
            to: email,
            subject: "Verification code for Splitit",
            text: "Verify Your email",
            html: code,
        });

        console.log("Message sent:", info.messageId);
    } catch (error) {
        console.log(process.env.GMAIL_PASS);
        console.log(email);
        console.log(code);

        console.error("Mail sending failed:", error);
        throw new apiError(500, "Unable to send Verification Code");
    }
};

export { verificationEmail };