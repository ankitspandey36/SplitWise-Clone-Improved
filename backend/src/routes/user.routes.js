import { Router } from "express";
import {
  signUp,
  login,
  logout,
  getCurrentUser,
  refresh,
  verification,
  resendCode,
  getUserId,
  verifyForgotCode,
  forgotpasswordchange,
  forgotpasswordVerification,
  addFriend,
  getFriend,
  getUserUpi,
  updateUpiId
} from "../controllers/user.controller.js";
import { setSuggestion } from "../controllers/suggestion.controller.js";
import { verifyjwt } from "../middlewares/verifyjwt.middleware.js";

const router = Router();


router.post("/signup", signUp);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/verify-email", verification);
router.post("/resend-code", resendCode);

router.post("/forgot-password", forgotpasswordVerification);
router.post("/verify-forgot-code", verifyForgotCode);
router.post("/reset-password", forgotpasswordchange);

router.get("/get-friend",verifyjwt,getFriend)
router.post("/add-friend", verifyjwt, addFriend);
router.get("/get-user", verifyjwt, getUserId)
router.get("/me", verifyjwt, getCurrentUser);
router.post("/logout", verifyjwt, logout);

router.post("/setSuggestion", verifyjwt, setSuggestion);

router.get("/upi", verifyjwt, getUserUpi)
router.post("/updateupi", verifyjwt, updateUpiId);

export default router;
