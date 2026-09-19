import React, { useState } from "react";
import Link from "next/link";
import { Search, House, Menu, X } from "lucide-react";

import { auth, provider } from "../firebase/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import { selectuser, login, logout } from "@/Feature/Userslice";

import { useTranslation } from "react-i18next";
import axios from "axios";
import { useRouter } from "next/router";

interface User {
  name: string;
  email: string;
  photo: string;
}

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectuser);
  const router = useRouter();
  const dispatch = useDispatch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================
  const handlelogin = async () => {
    console.log("Google button clicked");

    try {
      const result = await signInWithPopup(auth, provider);

      console.log("Calling backend...");

      const response = await axios.post(
        "http://localhost:5001/api/auth/google-login",
        {
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
          googleId: result.user.uid,
        }
      );

      console.log("Backend Response:", response.data);

      if (response.data.success) {
        dispatch(
          login({
            name: response.data.user.name,
            email: response.data.user.email,
            photo: response.data.user.photo,
          })
        );

        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        toast.success(t("loginSuccess"));
        router.push("/");
        setMobileMenuOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("loginFailed"));
    }
  };

  // ==========================================
  // LANGUAGE
  // ==========================================
  const changeLanguage = async (lang: string) => {
    console.log("Language selected:", lang);

    if (lang === "fr") {
      console.log("Inside French block");

      if (!user?.email) {
        toast.error(t("pleaseLoginFirst"));
        return;
      }

      try {
        console.log("Before sendOtp");

        const sendOtp = await fetch(
          "http://localhost:5001/api/otp/send-otp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
            }),
          }
        );

        console.log("After sendOtp");

        const result = await sendOtp.json();

        if (!result.success) {
          toast.error(t("unableToSendOtp"));
          return;
        }

        toast.success(t("otpSent"));

        const otp = prompt(t("enterOtp"));

        if (!otp) return;

        console.log("Before verifyOtp");

        const verifyOtp = await fetch(
          "http://localhost:5001/api/otp/verify-otp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              otp,
            }),
          }
        );

        console.log("After verifyOtp");

        const verifyResult = await verifyOtp.json();

        if (!verifyResult.success) {
          toast.error(t("invalidOtp"));
          return;
        }

        toast.success(t("frenchEnabled"));

        await i18n.changeLanguage("fr");
        localStorage.setItem("language", "fr");
      } catch (err) {
        console.error(err);
        toast.error(t("verificationFailed"));
      }

      return;
    }

    await i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handlelogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("user");

      dispatch(logout());

      router.push("/");

      setMobileMenuOpen(false);

      toast.success(t("loggedOutSuccessfully"));
    } catch (error) {
      console.log(error);
      toast.error(t("LogoutFailed"));
    }
  };

  // ==========================================
  // CLOSE MOBILE MENU WHEN NAVIGATING
  // ==========================================
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative z-50">
      <nav className="bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ==========================================
              DESKTOP / MAIN NAVBAR
          ========================================== */}
          <div className="flex min-h-16 items-center justify-between gap-3">
            {/* LOGO */}
            <div className="flex-shrink-0">
              <Link href="/" onClick={closeMobileMenu}>
                <img
                  src="/logo.png"
                  alt="Internarea"
                  className="h-12 w-auto sm:h-14 md:h-16"
                />
              </Link>
            </div>

            {/* ==========================================
                DESKTOP NAVIGATION
            ========================================== */}
            <div className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:gap-7">
              <Link
                href="/internship"
                className="whitespace-nowrap text-sm text-gray-700 transition hover:text-blue-600"
              >
                {t("internships")}
              </Link>

              <Link
                href="/job"
                className="whitespace-nowrap text-sm text-gray-700 transition hover:text-blue-600"
              >
                {t("jobs")}
              </Link>

              <Link
                href="/public-space"
                className="whitespace-nowrap text-sm text-gray-600 transition hover:text-blue-600"
              >
                {t("publicSpace")}
              </Link>

              {/* SEARCH */}
              <div className="flex w-40 items-center rounded-full bg-gray-100 px-3 py-2 xl:w-48">
                <Search
                  size={16}
                  className="flex-shrink-0 text-gray-600"
                />

                <input
                  type="text"
                  placeholder={t("search")}
                  className="ml-2 min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* ==========================================
                DESKTOP RIGHT SIDE
            ========================================== */}
            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <>
                  {/* PROFILE */}
                  <Link
                    href="/profile"
                    className="flex items-center"
                  >
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt="Profile"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>

                  {/* LOGOUT */}
                  <button
                    onClick={handlelogout}
                    className="rounded-lg px-2 py-2 text-sm text-gray-700 transition hover:text-blue-600"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/emailauth">
                    <button className="whitespace-nowrap rounded-lg border border-gray-500 px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-600">
                      {t("login")}
                    </button>
                  </Link>

                  <Link
                    href="/adminlogin"
                    className="whitespace-nowrap text-sm text-gray-600 transition hover:text-blue-600"
                  >
                    {t("admin")}
                  </Link>
                </>
              )}

              {/* LANGUAGE */}
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="rounded-md border border-gray-700 bg-white px-2 py-2 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="hi">Hindi</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="fr">French</option>
              </select>

              {/* HOME */}
              <button
                onClick={() => router.push("/")}
                className="flex items-center text-gray-600 transition hover:text-blue-600"
                aria-label="Home"
              >
                <House size={21} strokeWidth={2} />
              </button>
            </div>

            {/* ==========================================
                MOBILE RIGHT SIDE
            ========================================== */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* PROFILE ICON */}
              {user && (
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center"
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white sm:h-9 sm:w-9">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() =>
                  setMobileMenuOpen(!mobileMenuOpen)
                }
                className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={25} />
                ) : (
                  <Menu size={25} />
                )}
              </button>
            </div>
          </div>

          {/* ==========================================
              MOBILE MENU
          ========================================== */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-100 py-4 lg:hidden">
              <div className="flex flex-col gap-2">
                {/* SEARCH */}
                <div className="mb-2 flex items-center rounded-lg bg-gray-100 px-3 py-3">
                  <Search
                    size={18}
                    className="flex-shrink-0 text-gray-600"
                  />

                  <input
                    type="text"
                    placeholder={t("search")}
                    className="ml-2 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>

                {/* INTERNSHIPS */}
                <Link
                  href="/internship"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {t("internships")}
                </Link>

                {/* JOBS */}
                <Link
                  href="/job"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {t("jobs")}
                </Link>

                {/* PUBLIC SPACE */}
                <Link
                  href="/public-space"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {t("publicSpace")}
                </Link>

                {/* PROFILE */}
                {user && (
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="rounded-lg px-3 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    Profile
                  </Link>
                )}

                {/* LOGIN */}
                {!user && (
                  <>
                    <Link
                      href="/emailauth"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      {t("Login")}
                    </Link>

                    <Link
                      href="/adminlogin"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      {t("admin")}
                    </Link>
                  </>
                )}

                {/* LOGOUT */}
                {user && (
                  <button
                    onClick={handlelogout}
                    className="w-full rounded-lg px-3 py-3 text-left text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    {t("logout")}
                  </button>
                )}

                {/* LANGUAGE + HOME */}
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-4">
                  <select
                    value={i18n.language}
                    onChange={(e) =>
                      changeLanguage(e.target.value)
                    }
                    className="rounded-md border border-gray-700 bg-white px-3 py-2 text-sm text-gray-600"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="hi">Hindi</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="fr">French</option>
                  </select>

                  <button
                    onClick={() => {
                      router.push("/");
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <House size={21} />
                    <span className="text-sm"></span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;