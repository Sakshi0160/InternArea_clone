import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "@/Feature/Userslice";
import { googleLogin } from "@/utils/googleLogin";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

import { auth, provider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";

const EmailAuth = () => {

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const router = useRouter();

  const [activeTab, setActiveTab] = useState("login");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");

const handleRegister = async () => {
  try {
    if (
      !registerData.name ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      toast.error(t("fillDetails"));
      // toast.error("Please fill all fields");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    const response = await axios.post(
      "http://localhost:5001/api/auth/register",
      {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      }
    );

    if (response.data.success) {
      toast.success("Registration Successful");

      setRegisterData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Switch to Login tab
      setActiveTab("login");
    }
  } catch (error) {
  console.log("========== REGISTER ERROR ==========");
  console.log("STATUS:", error?.response?.status);
  console.log("DATA:", error?.response?.data);
  console.log("ERROR:", error);

  toast.error(
    error?.response?.data?.message || "Registration Successful"
  );
}
};
const handleLogin = async () => {
  try {
    if (!loginData.emailOrPhone || !loginData.password) {
      toast.error(t("fillDetails"));
      return;
    }

    const response = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        emailOrPhone: loginData.emailOrPhone,
        password: loginData.password,
      }
    );

    console.log("LOGIN RESPONSE:", response.data);

    // ==========================================
    // CHROME → OTP REQUIRED
    // ==========================================
    if (response.data.otpRequired === true) {
      setOtpEmail(response.data.email);
      setOtp("");
      setShowOtpModal(true);

      return;
    }

    // ==========================================
    // NORMAL LOGIN
    // ==========================================
    if (response.data.success) {
      const userData = {
        id: response.data.user.id,
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

      toast.success(t("loginSuccess"));

      console.log(
        "Firebase Current User:",
        auth.currentUser
      );

      router.push("/");
    }

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    toast.error(
      error?.response?.data?.message ||
      "Login failed"
    );
  }
};

const verifyGoogleOtp = async () => {
  try {
    if (!otp) {
      toast.error(t("enterOtp"));
      return;
    }

    const response = await axios.post(
"http://localhost:5001/api/auth/verify-login-otp",   
   {
        email: otpEmail,
        otp,
      }
    );

    if (!response.data.success) {
      return;
    }

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

    localStorage.setItem(
      "token",
      response.data.token
    );

    setShowOtpModal(false);
    setOtp("");
    setOtpEmail("");

    toast.success(t("loginSuccess"));

    router.push("/");

  } catch (error) {
  console.log("OTP STATUS:", error?.response?.status);
  console.log("OTP RESPONSE:", error?.response?.data);
  console.log("OTP ERROR:", error);

  toast.error(
    error?.response?.data?.message || t("verificationFailed")
  );
}
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Back Button */}


        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
        <Link
          href="/"
          className="flex items-center text-gray-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-2 mt-1" />
          <p >{t("backToHome")}</p>
        </Link>
          {/* Blue Icon */}
          <div className="flex justify-center">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <Mail className="text-white" size={32} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-center mt-6">
            {activeTab === "login"
              ? t("welcomeBack")
              : t("createAccount")}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-center mt-2">
            {activeTab === "login"
              ? t("signInToAccount")
              : t("registerNewAccount")}
          </p>
          {/* Login/Register Toggle */}
<div className="mt-8 flex bg-gray-100 rounded-xl p-1">
  <button
    onClick={() => setActiveTab("login")}
    className={`w-1/2 py-3 rounded-lg font-medium transition-all duration-300 ${
      activeTab === "login"
        ? "bg-white shadow text-blue-600"
        : "text-gray-600"
    }`}
  >
    {t("login")}
  </button>

  <button
    onClick={() => setActiveTab("register")}
    className={`w-1/2 py-3 rounded-lg font-medium transition-all duration-300 ${
      activeTab === "register"
        ? "bg-white shadow text-blue-600"
        : "text-gray-600"
    }`}
  >
    {t("register")}
  </button>
</div>
{activeTab === "login" ? (

<div className="mt-8 space-y-5">

  {/* Email */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      {t("emailAddress")}
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4 py-3">
      <Mail className="text-gray-400 mr-3" size={20} />

<input
  type="text"
  placeholder={t("enterEmailOrPhone")}
  value={loginData.emailOrPhone}
  onChange={(e) =>
    setLoginData({
      ...loginData,
      emailOrPhone: e.target.value,
    })
  }
  className="w-full outline-none"
/>
    </div>
  </div>

  {/* Password */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      {t("password")}
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4 py-3">

      <Lock className="text-gray-400 mr-3" size={20} />

<input
  type={showPassword ? "text" : "password"}
  placeholder={t("enterPassword")}
  value={loginData.password}
  onChange={(e) =>
    setLoginData({
      ...loginData,
      password: e.target.value,
    })
  }
  className="w-full outline-none"
/>

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff size={20} className="text-gray-400" />
        ) : (
          <Eye size={20} className="text-gray-400" />
        )}
      </button>

    </div>
  </div>

  {/* Forgot Password */}
  <div className="text-right mt-2">
  <Link
    href="/forgot-password"
    className="text-sm text-blue-600 hover:underline"
  >
   {t("forgotPassword")}
    </Link>
</div>

  {/* Sign In */}
<button
  onClick={handleLogin}
  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
>
  {t("logIn")}
</button>

  {/* Divider */}
  <div className="flex items-center">
    <div className="flex-1 border-t"></div>

    <span className="mx-3 text-gray-400 text-sm">
      {t("or")}
    </span>

    <div className="flex-1 border-t"></div>
  </div>

  {/* Google Button */}
 <button
    className="w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
    onClick={() =>
  googleLogin(
    dispatch,
    login,
    toast,
    router,
    setOtpEmail,
    setShowOtpModal
  )
}
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>

    {t("google")}
  </button>


</div>

) : (

<div className="mt-8 space-y-5">

  {/* Full Name */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      {t("fullName")}
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4 py-3">
      <User className="text-gray-400 mr-3" size={20} />

<input
  type="text"
  placeholder={t("enterFullName")}
  value={registerData.name}
  onChange={(e) =>
    setRegisterData({
      ...registerData,
      name: e.target.value,
    })
  }
  className="w-full outline-none"
/>
    </div>
  </div>

  {/* Email */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      {t("emailAddress")}
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4 py-3">
      <Mail className="text-gray-400 mr-3" size={20} />

<input
  type="email"
  placeholder={t("enterYourEmail")}
  value={registerData.email}
  onChange={(e) =>
    setRegisterData({
      ...registerData,
      email: e.target.value,
    })
  }
  className="w-full outline-none"
/>
    </div>
  </div>

  {/* Phone */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      {t("phoneNumber")}
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4 py-3">
      <Phone className="text-gray-400 mr-3" size={20} />

<input
  type="text"
  placeholder="Enter your phone number"
  value={registerData.phone}
  onChange={(e) =>
    setRegisterData({
      ...registerData,
      phone: e.target.value,
    })
  }
  className="w-full outline-none"
/>
    </div>
  </div>

  {/* Password */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      {t("password")}
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4 py-3">
      <Lock className="text-gray-400 mr-3" size={20} />

<input
  type={showPassword ? "text" : "password"}
  placeholder={t("createPassword")}
  value={registerData.password}
  onChange={(e) =>
    setRegisterData({
      ...registerData,
      password: e.target.value,
    })
  }
  className="w-full outline-none"
/>

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
      </button>
    </div>
  </div>

  {/* Confirm Password */}
  <div>
    <label className="text-sm font-medium text-gray-700">
      {t("confirmPassword")}
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4 py-3">
      <Lock className="text-gray-400 mr-3" size={20} />

<input
  type={showConfirmPassword ? "text" : "password"}
  placeholder={t("confirmYourPassword")}
  value={registerData.confirmPassword}
  onChange={(e) =>
    setRegisterData({
      ...registerData,
      confirmPassword: e.target.value,
    })
  }
  className="w-full outline-none"
/>

      <button
        type="button"
        onClick={() =>
          setShowConfirmPassword(!showConfirmPassword)
        }
      >
        {showConfirmPassword ? (
          <EyeOff size={20} className="text-gray-400" />
        ) : (
          <Eye size={20} className="text-gray-400" />
        )}
      </button>
    </div>
  </div>

  {/* Register Button */}
<button
  onClick={handleRegister}
  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
>
  {t("createAccount")}
</button>

  {/* Divider */}
  <div className="flex items-center">
    <div className="flex-1 border-t"></div>

    <span className="mx-3 text-gray-400 text-sm">
      {t("or")}
    </span>

    <div className="flex-1 border-t"></div>
  </div>

  {/* Google Button */}
  <button
    className="w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
    onClick={() =>
  googleLogin(
    dispatch,
    login,
    toast,
    router,
    setOtpEmail,
    setShowOtpModal
  )
}
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>

    {t("google")}
  </button>

</div>

)}

        </div>

      </div>
      {showOtpModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

      <h2 className="text-2xl font-bold text-center">
        {t("verifyYourLogin")}
      </h2>

      <p className="text-gray-500 text-center mt-2">
        {t("enterOtpSentTo")}
      </p>

      <p className="text-blue-600 text-center font-medium mt-1">
        {otpEmail}
      </p>

      <input
        type="text"
        maxLength={6}
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value.replace(/\D/g, ""))
        }
        className="w-full border rounded-xl px-4 py-3 mt-6 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={verifyGoogleOtp}
        className="w-full bg-blue-600 text-white py-3 rounded-xl mt-5 hover:bg-blue-700 transition"
      >
        {t("verifyOtp")}
      </button>

      <button
        onClick={() => {
          setShowOtpModal(false);
          setOtp("");
        }}
        className="w-full text-gray-500 py-3 mt-2 hover:text-gray-700"
      >
       {t("cancel")}
      </button>

    </div>
  </div>
)}

    </div>
  );
};

export default EmailAuth;