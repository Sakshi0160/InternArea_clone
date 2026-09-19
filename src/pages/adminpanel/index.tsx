import React, { useEffect } from "react";

import {
  Briefcase,
  Mail,
  Send,
  Users,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";

import { toast } from "react-toastify";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

const Index = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    // Remove admin login session
    sessionStorage.removeItem("adminLoggedIn");

    toast.success(t("loggedOutSuccessfully"));

    router.push("/adminlogin");
  };

  useEffect(() => {
    if (!sessionStorage.getItem("adminLoggedIn")) {
      router.push("/adminlogin");
    }
  }, [router]);

  const stats = [
    {
      label: t("totalApplications"),
      value: "2,345",
      change: "+12%",
      changeType: "positive",
    },
    {
      label: t("activeJobs"),
      value: "45",
      change: "+3%",
      changeType: "positive",
    },
    {
      label: t("activeInternships"),
      value: "89",
      change: "+24%",
      changeType: "positive",
    },
    {
      label: t("conversionRate"),
      value: "5.25%",
      change: "-1.3%",
      changeType: "negative",
    },
  ];

  const menuItems = [
    {
      title: t("viewApplication"),
      description: t("manageApplicationsCandidates"),
      icon: Mail,
      link: "/applications",
      color: "bg-blue-600",
    },
    {
      title: t("postJob"),
      description: t("createPublishJobOpportunities"),
      icon: Briefcase,
      link: "/postJob",
      color: "bg-green-600",
    },
    {
      title: t("postInternships"),
      description: t("createManageInternshipPositions"),
      icon: Send,
      link: "/postInternship",
      color: "bg-purple-600",
    },
    {
      title: t("manageUsers"),
      description: t("viewManageUserAccounts"),
      icon: Users,
      link: "/users",
      color: "bg-orange-600",
    },
    {
      title: t("analytics"),
      description: t("viewReportsStatistics"),
      icon: BarChart,
      link: "/analytics",
      color: "bg-red-600",
    },
    {
      title: t("settings"),
      description: t("configureSystemPreferences"),
      icon: Settings,
      link: "/settings",
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-5 sm:py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {t("adminDashboard")}
              </h1>

              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                {t("manageJobsInternshipsApplications")}
              </p>
            </div>

            {/* Logout Button - Right Side */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap"
            >
              <LogOut className="h-5 w-5" />
              {t("logout")}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 break-words">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={index}
                href={item.link}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">

                    {/* Icon */}
                    <div
                      className={`${item.color} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-5 sm:leading-6 break-words">
                        {item.description}
                      </p>
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Index;
