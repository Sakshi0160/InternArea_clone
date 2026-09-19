import axios from "axios";
import { User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  const [formadata, setformadata] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();
  const [isloading, setisloading] = useState(false);

  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setformadata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlesubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formadata.username || !formadata.password) {
    toast.error(t("fillDetails"));
    return;
  }

  try {
    setisloading(true);

    const response = await axios.post(
      "http://localhost:5001/api/admin/adminlogin",
      formadata
    );

    if (response.data.success) {
      // Create a fresh admin session every time they log in
      sessionStorage.setItem("adminLoggedIn", "true");

      toast.success(t("loginSuccess"));

      router.push("/adminpanel");
    }
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    toast.error(t("invalidCredentials"));
  } finally {
    setisloading(false);
  }
};
  

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      {/* ================================
          HEADER
      ================================= */}
      <div className="mx-auto w-full max-w-md text-center">

        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
          {t("adminLogin")}
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600 sm:text-base">
          {t("adminDescription")}
        </p>

      </div>

      {/* ================================
          LOGIN CARD
      ================================= */}
      <div className="mx-auto mt-6 w-full max-w-md sm:mt-8">

        <div className="rounded-xl bg-white px-4 py-6 shadow-md sm:rounded-lg sm:px-10 sm:py-8">

          <form
            className="space-y-5 sm:space-y-6"
            onSubmit={handlesubmit}
          >

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                {t("username")}
              </label>

              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={formadata.username}
                  onChange={handlechange}
                  placeholder={t("enterUsername")}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("password")}
              </label>

              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formadata.password}
                  onChange={handlechange}
                  placeholder={t("enterPassword")}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isloading}
                className="flex min-h-[46px] w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isloading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>

                    {t("signingIn")}
                  </div>
                ) : (
                  t("signIn")
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;