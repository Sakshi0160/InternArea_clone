import axios from "axios";
import {
  Building2,
    ArrowLeft,
  Calendar,
  CheckCircle2,
  Mail,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const getStatusColor = (status: any) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/application"
        );

        setData(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const filteredApplications = data.filter((application: any) => {
    const searchMatch =
      application.company
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.category
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (filter === "all") return searchMatch;

    return (
      searchMatch &&
      application.status?.toLowerCase() === filter
    );
  });

  const handleAcceptAndReject = async (
    id: any,
    action: any
  ) => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/application/${id}`,
        { action }
      );

      const updatedApplication = data.map((app: any) =>
        app._id === id ? res.data.data : app
      );

      setData(updatedApplication);

      toast.success("updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("error updating");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">

          {/* Header */}
          <div className="border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5">
            <button
                 onClick={() => router.push("/adminpanel")}
                className="mb-5 flex items-center gap-2  bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg gray-50">
                 <ArrowLeft className="h-5 w-5"/>
                 Back
              </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("Applications")}
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {t("Manage and review all applications")}
            </p>
          </div>
          

          {/* Filters and Search */}
          <div className="p-4 sm:p-6 border-b border-gray-200">

            <div className="flex flex-col gap-4">

              {/* Search */}
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder={t(
                      "Search by company, category, or applicant..."
                    )}
                    className="text-black w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <Mail className="absolute top-2.5 sm:top-3 left-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Filters */}
              <div className="w-full overflow-x-auto">
                <div className="flex gap-2 min-w-max">

                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                      filter === "all"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t("All")}
                  </button>

                  <button
                    onClick={() => setFilter("pending")}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                      filter === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t("Pending")}
                  </button>

                  <button
                    onClick={() => setFilter("accepted")}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                      filter === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t("Accepted")}
                  </button>

                  <button
                    onClick={() => setFilter("rejected")}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                      filter === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t("Rejected")}
                  </button>

                </div>
              </div>

            </div>
          </div>

          {/* Applications Table */}
          <div className="w-full overflow-x-auto">

            <table className="min-w-[900px] w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("Company & Category")}
                  </th>

                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("Applicant")}
                  </th>

                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("Applied Date")}
                  </th>

                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("Status")}
                  </th>

                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("Actions")}
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">

                {filteredApplications.map(
                  (application: any) => (
                    <tr
                      key={application._id}
                      className="hover:bg-gray-50"
                    >

                      {/* Company */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">

                          <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-blue-100 rounded-full">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>

                          <div className="ml-3 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.company}
                            </div>

                            <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              {application.category}
                            </div>
                          </div>

                        </div>
                      </td>

                      {/* Applicant */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">

                          <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-gray-100 rounded-full">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                          </div>

                          <div className="ml-3 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.user?.name}
                            </div>

                            <div className="text-xs sm:text-sm text-gray-500">
                              {application.user?.email}
                            </div>
                          </div>

                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />

                          {new Date(application.createdAt)
                            .toISOString()
                            .split("T")[0]}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-4">

                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-4">

                        <div className="flex items-center gap-3">

                          <Link
                            href={`/detailapplication/${application._id}`}
                            className="text-blue-600 hover:text-blue-900 text-sm whitespace-nowrap"
                          >
                            {t("viewDetails")}
                          </Link>

                          <button
                            onClick={() =>
                              handleAcceptAndReject(
                                application._id,
                                "accepted"
                              )
                            }
                            className="text-green-600 hover:text-green-900 p-1"
                            aria-label="Approve application"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() =>
                              handleAcceptAndReject(
                                application._id,
                                "rejected"
                              )
                            }
                            className="text-red-600 hover:text-red-900 p-1"
                            aria-label="Reject application"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <div className="py-10 sm:py-12 text-center px-4">
              <p className="text-sm text-gray-500">
                No applications found.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Index;