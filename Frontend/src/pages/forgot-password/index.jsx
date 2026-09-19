import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail, ArrowLeft,Eye,
  EyeOff, Zap,KeyRound } from "lucide-react";
  import { useRouter } from "next/router";
  import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const { t, i18n } = useTranslation();
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
  value: "",
  newPassword: "",
  confirmPassword: "",
});
const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
    
    const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const generatePassword = () => {
  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let password = "";

  for (let i = 0; i < 10; i++) {
    password += letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
  }

  setFormData({
    ...formData,
    newPassword: password,
    confirmPassword: password,
  });
};

  const handleResetPassword = async () => {
  try {
    if (!formData.value) {
      toast.error(t("enterYourEmail"));
      return;
    }

    if (!formData.newPassword) {
      toast.error(t("enterNewPassword"));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    const response = await axios.post(
      "http://localhost:5001/api/auth/forgot-password",
      {
        value: formData.value,
        newPassword: formData.newPassword,
      }
    );

    if (response.data.success) {
      toast.success(response.data.message);
setResetSuccess(true);

      setFormData({
  value: formData.value,
  newPassword: formData.newPassword,
  confirmPassword: formData.confirmPassword,
});
    }
  } catch (error) {
    console.log(error);

    toast.error(
      error?.response?.data?.message ||
      t("failedToResetPassword")
    );
  }
};
if (resetSuccess) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-green-600">✓</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {t("passwordResetSuccessfully")}
        </h2>

        <p className="text-gray-500 mb-6">
          {t("passwordUpdatedSuccessfully")}
          {t("pleaseLoginNewPassword")}
        </p>

        <button
          onClick={() => router.push("/emailauth")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          {t("backToLogin")}
        </button>

      </div>
    </div>
  );
}

  return (
    
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 w-full max-w-md">
        <Link
          href="/emailauth"
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-1.5" />
         {t("backToLogin")}
        </Link>
          <div className="flex justify-center">
            
            <div className="bg-blue-600 p-4 rounded-2xl">
              <KeyRound className="text-white" size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mt-6">
            {t("forgotPassword")}
          </h1>

          <p className="text-gray-500 text-center mt-2 mb-6">
            {t("enterRegisteredEmailOrPhone")}
          </p>
                   <label className="text-sm font-medium text-gray-700">
    {t("emailIdOrPhoneNumber")}
  </label>
          <div className="border border-gray-300 rounded-lg px-4 py-3 flex items-center mt-0.5 mb-4">
            <Mail className="text-gray-400 mr-3" />
            <input
  type="text"
  name="value"
  placeholder={t("emailIdOrPhoneNumber")}
  value={formData.value}
  onChange={handleChange}
  className="w-full outline-none"
/>
          </div>
<div className="flex items-center justify-between">
  <label className="text-sm font-medium text-gray-700">
    {t("newPassword")}
  </label>

  <button
    type="button"
    onClick={generatePassword}
    className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
  >
     <Zap size={15} />
     {t("autoGenerate")}
  </button>
</div>
          <div className="border border-gray-300 rounded-lg px-4 py-3 flex items-center mt-1 mb-2">
           <input
  type={showPassword ? "text" : "password"}
  name="newPassword"
  value={formData.newPassword}
  onChange={handleChange}
  placeholder={t("min6Letters")}
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
            <label className="text-sm font-medium text-gray-700">
    {t("confirmPassword")}
  </label>
          <div className="border border-gray-300 rounded-lg px-4 py-3 flex items-center mt-1">
          <input
  type={showConfirmPassword ? "text" : "password"}
  name="confirmPassword"
  value={formData.confirmPassword}
  onChange={handleChange}
  placeholder={t("min6Letters")}
  className="w-full outline-none"
/>
<button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
        {showConfirmPassword ? (
          <EyeOff size={20} className="text-gray-400" />
        ) : (
          <Eye size={20} className="text-gray-400" />
        )}
      </button>
          </div>
<button
type="submit"
  onClick={handleResetPassword}
  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
>
  {t("resetPassword")}
</button>
<div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
  <div className="text-blue-600 text-lg">ℹ️</div>

  <p className="text-xs text-blue-700 leading-5">
   {t("resetPasswordOncePerDay")}
    <strong> {t("autoGenerate")}</strong>
    {t("securePasswordInstantly")}
  </p>
</div>

        </div>
        

      </div>
    </div>
    
  );
};

export default ForgotPassword;