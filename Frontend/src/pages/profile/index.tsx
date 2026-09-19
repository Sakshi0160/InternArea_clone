import { selectuser } from "@/Feature/Userslice";

import {
  ExternalLink,
  Mail,
  User,
  ShieldCheck,
  Clock,
  Globe,
  Monitor,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Eye,
  CreditCard,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import router from "next/router";

interface LoginHistory {
  _id?: string;
  browser?: string;
  operatingSystem?: string;
  deviceType?: string;
  ipAddress?: string;
  loginMethod?: string;
  status?: string;
  loginAt?: string;
}

const API = "http://localhost:5001/api";

const Index = () => {
  const { t } = useTranslation();
  const user = useSelector(selectuser);

  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [resume, setResume] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // ==========================================
  // SUBSCRIPTION STATE
  // ==========================================

  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] =
    useState(false);

  // ==========================================
  // FETCH LOGIN HISTORY
  // ==========================================

  useEffect(() => {
    if (!user?.email) return;

    const fetchLoginHistory = async () => {
      try {
        const response = await axios.get(
          `${API}/auth/login-history/${encodeURIComponent(
            user.email
          )}`
        );

        if (response.data.success) {
          setLoginHistory(response.data.loginHistory || []);
        } else {
          setLoginHistory([]);
        }
      } catch (error) {
        console.error("LOGIN HISTORY ERROR:", error);
        setLoginHistory([]);
      }
    };

    fetchLoginHistory();
  }, [user?.email]);

  // ==========================================
  // FETCH RESUME
  // ==========================================

  useEffect(() => {
    if (!user?.email) return;

    fetchResume();
  }, [user?.email]);

  const fetchResume = async () => {
    try {
      setResumeLoading(true);

      const response = await axios.get(
        `${API}/resume/${encodeURIComponent(user.email)}`
      );

      if (response.data.success) {
        setResume(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setResume(null);
      } else {
        console.error("RESUME ERROR:", error);
      }
    } finally {
      setResumeLoading(false);
    }
  };

  // ==========================================
  // FETCH SUBSCRIPTION
  // ==========================================

  useEffect(() => {
    if (!user?.email) return;

    fetchSubscription();
  }, [user?.email]);

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true);

      const response = await axios.get(
        `${API}/subscription/${encodeURIComponent(user.email)}`
      );

      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error("SUBSCRIPTION ERROR:", error);

      // If something goes wrong, show Free plan
      setSubscription({
        plan: "Free",
        applicationLimit: 1,
        applicationsUsed: 0,
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // ==========================================
  // DELETE RESUME
  // ==========================================

  const handleDeleteResume = async () => {
    if (!user?.email) return;

    const confirmDelete = window.confirm(
      t("confirmDeleteResume")
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API}/resume/${encodeURIComponent(user.email)}`
      );

      if (response.data.success) {
        toast.success(t("resumeDeletedSuccessfully"));
        setResume(null);
      } else {
        toast.error(t("failedToDeleteResume"));
      }
    } catch (error) {
      console.error("DELETE RESUME ERROR:", error);
      toast.error(t("failedToDeleteResume"));
    }
  };

  // ==========================================
  // LOGIN STATUS
  // ==========================================

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700";

      case "blocked":
        return "bg-red-100 text-red-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "otp_pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "success":
        return t("successful");

      case "blocked":
        return t("blocked");

      case "failed":
        return t("failed");

      case "otp_pending":
        return t("otpPending");

      default:
        return t("unknown");
    }
  };

  // ==========================================
  // SUBSCRIPTION HELPERS
  // ==========================================

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Gold":
        return "bg-yellow-100 text-yellow-700";

      case "Silver":
        return "bg-slate-200 text-slate-700";

      case "Bronze":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-indigo-100 text-indigo-700";
    }
  };

  // NEW:
  // Only controls the background of the complete plan card
  const getPlanBackground = (plan: string) => {
    switch (plan) {
      case "Gold":
        return "bg-yellow-50";

      case "Silver":
        return "bg-slate-100";

      case "Bronze":
        return "bg-orange-50";

      default:
        return "bg-indigo-50";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "Gold":
        return "🥇";

      case "Silver":
        return "🥈";

      case "Bronze":
        return "🥉";

      default:
        return "🆓";
    }
  };

  const getRemainingApplications = () => {
    if (!subscription) return 1;

    if (subscription.applicationLimit === -1) {
      return "Unlimited";
    }

    return Math.max(
      0,
      (subscription.applicationLimit || 0) -
        (subscription.applicationsUsed || 0)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">

          {/* ==========================================
              PROFILE HEADER
          ========================================== */}

          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 transform">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-lg">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* ==========================================
              PROFILE CONTENT
          ========================================== */}

          <div className="px-6 pb-8 pt-16">

            {/* PROFILE INFORMATION */}

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name}
              </h1>

              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="mr-2 h-4 w-4" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* ==========================================
                QUICK STATS
            ========================================== */}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <span className="text-2xl font-semibold text-blue-600">
                  0
                </span>

                <p className="mt-1 text-sm text-blue-600">
                  {t("totalApplications")}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4 text-center">
                <span className="text-2xl font-semibold text-green-600">
                  0
                </span>

                <p className="mt-1 text-sm text-green-600">
                  {t("acceptedApplications")}
                </p>
              </div>
            </div>

            {/* ==========================================
                APPLICATIONS
            ========================================== */}

            <div className="flex justify-center pt-6">
              <Link
                href="/userapplication"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                {t("viewApplication")}

                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* ==========================================
                SUBSCRIPTION
            ========================================== */}

            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              {/* HEADER */}

              <div className="border-b border-gray-200 bg-slate-800 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {t("subscription")}
                      </h2>

                      <p className="text-sm text-slate-300">
                        {t("manageInternshipApplicationPlan")}
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-6">
                {subscriptionLoading ? (
                  <div className="py-8 text-center text-gray-500">
                    {t("checkingSubscription")}
                  </div>
                ) : (
                  <>
                    {/* PLAN */}

                    <div
                      className={`flex flex-col gap-5 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between ${getPlanBackground(
                        subscription?.plan || "Free"
                      )}`}
                    >
                      <div>
                        <div className="flex items-center gap-3">

                          <span className="text-3xl">
                            {getPlanIcon(
                              subscription?.plan || "Free"
                            )}
                          </span>

                          <div>
                            <p className="text-sm text-gray-500">
                              {t("currentPlan")}
                            </p>

                            {/* PLAN NAME TRANSLATION */}
                            <h3 className="text-2xl font-bold text-gray-900">
                              {t(
                                (
                                  subscription?.plan || "Free"
                                ).toLowerCase()
                              )}
                            </h3>
                          </div>

                        </div>
                      </div>

                      {/* PLAN STATUS BADGE */}

                      <span
                        className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getPlanColor(
                          subscription?.plan || "Free"
                        )}`}
                      >
                        {subscription?.plan === "Free"
                          ? t("freePlan")
                          : t("activePlan")}
                      </span>
                    </div>

                    {/* ==========================================
                        PLAN DETAILS
                    ========================================== */}

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-400">
                          {t("applications")}
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-900">
                          {subscription?.applicationLimit === -1
                            ? "Unlimited"
                            : `${subscription?.applicationsUsed || 0} / ${
                                subscription?.applicationLimit || 1
                              }`}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-400">
                          {t("remaining")}
                        </p>

                        <p className="mt-1 text-lg font-bold text-green-600">
                          {getRemainingApplications()}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-400">
                          {t("validUntil")}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-lg font-bold text-gray-900">
                          <CalendarDays className="h-4 w-4" />

                          {subscription?.endDate
                            ? new Date(
                                subscription.endDate
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : t("noExpiry")}
                        </p>
                      </div>

                    </div>

                    {/* ==========================================
                        CHANGE PLAN
                    ========================================== */}

                    <div className="mt-5">
                      <button
                        onClick={() =>
                          router.push("/subscription")
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                      >
                        {subscription?.plan === "Free"
                          ? t("viewPlans")
                          : t("changePlan")}

                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ==========================================
                RESUME
            ========================================== */}

            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              {/* RESUME HEADER */}

              <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {t("resume")}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {t("createManageProfessionalResume")}
                  </p>
                </div>

              </div>

              {/* RESUME CONTENT */}

              <div className="p-6">
                {resumeLoading ? (
                  <div className="py-6 text-center">
                    <p className="text-gray-500">
                     {t("checkingResume")}
                    </p>
                  </div>
                ) : resume?.resumePdf ? (
                  <div>

                    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-green-700">
                            {t("resumeAttached")}
                          </p>

                          <p className="text-sm text-green-600">
                            {t("yourResumeAttached")}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                      <a
                        href={`http://localhost:5001${resume.resumePdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />

                        {t("viewResume")}
                      </a>

                      <button
                        type="button"
                        onClick={handleDeleteResume}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-5 py-3 font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />

                        {t("deleteResume")}
                      </button>

                    </div>
                  </div>
                ) : (
                  <div className="py-5 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      {t("createManageProfessionalResume")}
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                      {t("buildProfessionalResume")}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/resume?email=${encodeURIComponent(
                            user.email
                          )}`
                        )
                      }
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />

                      {t("createResume")}

                      <span className="ml-1 rounded-md bg-white/20 px-2 py-0.5 text-sm">
                        ₹50
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ==========================================
                LOGIN HISTORY
            ========================================== */}

            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

              {/* HEADER */}

              <div className="flex items-center justify-between bg-slate-800 px-6 py-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-600">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {t("loginHistory")}
                    </h2>

                    <p className="text-sm text-slate-300">
                      {t("securityAccessActivity")}
                    </p>
                  </div>

                </div>

                <span className="rounded-full bg-slate-600 px-4 py-1.5 text-sm font-semibold text-white">
                  {loginHistory.length} {t("records")}
                </span>

              </div>

              {/* LOGIN RECORDS */}

              <div className="space-y-4 p-6">

                {loginHistory.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">

                    <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-gray-400" />

                    <p className="font-medium">
                      {t("noLoginActivityFound")}
                    </p>

                  </div>
                ) : (
                  loginHistory.map((login, index) => (
                    <div
                      key={login._id || index}
                      className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
                    >

                      {/* DATE + STATUS */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-2">

                          <Clock className="h-4 w-4 text-gray-500" />

                          <span className="font-medium text-gray-700">
                            {login.loginAt
                              ? new Date(
                                  login.loginAt
                                ).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Unknown date"}
                          </span>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            login.status
                          )}`}
                        >
                          {getStatusText(login.status)}
                        </span>

                      </div>

                      {/* DETAILS */}

                      <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">

                        <div className="flex items-center gap-2">

                          <Globe className="h-4 w-4 text-gray-500" />

                          <div>
                            <p className="text-xs text-gray-400">
                              {t("browser")}
                            </p>

                            <p className="font-medium text-gray-700">
                              {login.browser ||
                                "Unknown Browser"}
                            </p>
                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <Monitor className="h-4 w-4 text-gray-500" />

                          <div>
                            <p className="text-xs text-gray-400">
                              {t("operatingSystem")}
                            </p>

                            <p className="font-medium text-gray-700">
                              {login.operatingSystem ||
                                "Unknown OS"}
                            </p>
                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <Monitor className="h-4 w-4 text-gray-500" />

                          <div>
                            <p className="text-xs text-gray-400">
                              {t("device")}
                            </p>

                            <p className="font-medium capitalize text-gray-700">
                              {login.deviceType ||
                                "Unknown Device"}
                            </p>
                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <MapPin className="h-4 w-4 text-gray-500" />

                          <div>
                            <p className="text-xs text-gray-400">
                              {t("ipAddress")}
                            </p>

                            <p className="font-medium text-gray-700">
                              {login.ipAddress ||
                                "Unknown IP"}
                            </p>
                          </div>

                        </div>

                      </div>

                      {/* LOGIN METHOD */}

                      <div className="mt-5">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {login.loginMethod === "google"
                            ? t("googleLogin")
                            : t("emailLogin")}
                        </span>
                      </div>

                    </div>
                  ))
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;