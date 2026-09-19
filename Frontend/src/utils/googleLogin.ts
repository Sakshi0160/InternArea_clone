import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/firebase/firebase";
import axios from "axios";

export const googleLogin = async (
  dispatch: any,
  login: any,
  toast: any,
  router: any,
  setOtpEmail: any,
  setShowOtpModal: any
) => {
  try {
    const result = await signInWithPopup(auth, provider);

    const googleUser = {
      name: result.user.displayName,
      email: result.user.email,
      photo: result.user.photoURL,
      googleId: result.user.uid,
    };

    // Firebase authentication is only used to get Google user information
    await signOut(auth);

    // Send Google login information to backend
    const response = await axios.post(
      "http://localhost:5001/api/auth/google-login",
      googleUser
    );

    console.log("GOOGLE LOGIN RESPONSE:", response.data);

    // ==========================================
    // CHROME → OTP REQUIRED
    // ==========================================
    if (response.data.otpRequired === true) {
      setOtpEmail(response.data.email || googleUser.email);
      setShowOtpModal(true);

      return;
    }

    // ==========================================
    // NON-CHROME → NO OTP
    // ==========================================

    setShowOtpModal(false);
    setOtpEmail("");

    if (response.data.success) {
      const userData = {
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        photo: response.data.user.photo,
      };

      dispatch(login(userData));

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      if (response.data.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }

      toast.success("Logged in successfully");

      router.push("/");
    }

  } catch (error: any) {
  try {
    await signOut(auth);
  } catch (signOutError) {
    // Ignore Firebase signout error
  }

  setShowOtpModal(false);
  setOtpEmail("");

  toast.error(
    error?.response?.data?.message ||
      "Login failed"
  );
}
};