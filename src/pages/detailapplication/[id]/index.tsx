import axios from "axios";
import {
  Building2,
    ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:5001/api/application/${id}`
        );

        console.log(res.data);
        setData(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-blue-600" />

          <span className="text-sm sm:text-base text-gray-600 text-center">
            {t("Loading application details...")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5 sm:py-8 lg:py-12">
      <section className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* ================= IMAGE SECTION ================= */}
            <div className="relative w-full bg-gray-100">

              <img
                src={data?.user?.photo || "/default-profile.png"}
                alt="Applicant photo"
                className="
                  w-full
                  h-64
                  xs:h-72
                  sm:h-80
                  md:h-96
                  lg:h-full
                  lg:min-h-[560px]
                  object-cover
                "
              />

              {/* Status */}
              {data?.status && (
                <div
                  className={`
                    absolute
                    top-3 right-3
                    sm:top-5 sm:right-5
                    px-3 py-1.5
                    sm:px-4 sm:py-2
                    rounded-full
                    text-xs sm:text-sm
                    shadow-sm
                    ${
                      data.status === "accepted"
                        ? "bg-green-100 text-green-600"
                        : data.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }
                  `}
                >
                  <span className="font-semibold capitalize">
                    {data.status}
                  </span>
                </div>
              )}
            </div>

            {/* ================= CONTENT SECTION ================= */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10">

              {/* Company */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />

                  <h2 className="text-xs sm:text-sm font-medium text-gray-500">
                    {t("Company")}
                  </h2>
                </div>

                <h1 className="
                  text-xl
                  sm:text-2xl
                  md:text-3xl
                  font-bold
                  text-gray-900
                  break-words
                ">
                  {data?.company || "-"}
                </h1>
              </div>

              {/* Cover Letter */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />

                  <h2 className="text-xs sm:text-sm font-medium text-gray-500">
                    {t("Cover Letter")}
                  </h2>
                </div>

                <div className="
                  bg-gray-50
                  rounded-lg
                  border border-gray-100
                  p-3
                  sm:p-4
                  md:p-5
                ">
                  <p className="
                    text-sm
                    sm:text-base
                    text-gray-600
                    leading-6
                    sm:leading-7
                    break-words
                    whitespace-pre-line
                  ">
                    {data?.coverLetter || "-"}
                  </p>
                </div>
              </div>

              {/* Application Information */}
              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-5
                sm:gap-6
              ">

                {/* Application Date */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />

                    <span className="
                      text-xs
                      sm:text-sm
                      font-medium
                      text-gray-500
                    ">
                      {t("Application Date")}
                    </span>
                  </div>

                  <p className="
                    text-sm
                    sm:text-base
                    text-gray-900
                    font-semibold
                    ml-7
                    break-words
                  ">
                    {data?.createdAt
                      ? new Date(data.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "-"}
                  </p>
                </div>

                {/* Applied By */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-blue-600 flex-shrink-0" />

                    <span className="
                      text-xs
                      sm:text-sm
                      font-medium
                      text-gray-500
                    ">
                      {t("Applied By")}
                    </span>
                  </div>

                  <p className="
                    text-sm
                    sm:text-base
                    text-gray-900
                    font-semibold
                    ml-7
                    break-words
                  ">
                    {data?.user?.name || "-"}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;