import axios from "axios";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const user = useSelector(selectuser);

  const [internshipData, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [availability, setAvailability] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subscription limit popup
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Fetch internship
  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const url = `http://localhost:5001/api/internship/${id}`;

        const res = await axios.get(url);

        setInternship(res.data);
      } catch (error) {
        console.error("Error fetching internship:", error);
        toast.error("Failed to load internship details");
        setInternship(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, id]);

  // Submit application
  const handleSubmitApplication = async () => {
    if (!coverLetter.trim()) {
      toast.error(t("pleaseWriteCoverLetter"));
      return;
    }

    if (!availability) {
      toast.error(t("pleaseSelectAvailability"));
      return;
    }

    try {
      const applicationdata = {
        category: internshipData.category,
        company: internshipData.company,
        coverLetter: coverLetter,
        user: user,
        Application: id,
        availability: availability,
      };

      const response = await axios.post(
        "http://localhost:5001/api/application",
        applicationdata
      );

      console.log("Application submitted:", response.data);

      // Successful application
      toast.success(t("applicationSubmitted"));

      setIsModalOpen(false);
      setCoverLetter("");
      setAvailability("");

      router.push("/job");
    } catch (error: unknown) {
      /*
       * IMPORTANT:
       * 403 means the subscription/application limit
       * was reached. This is expected and should show
       * our popup instead of an Axios error/toast.
       */
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403
      ) {
        setIsModalOpen(false);
        setIsLimitModalOpen(true);
        return;
      }

      // Other unexpected errors
      console.error("Application error:", error);
      toast.error(t("applicationFailed"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!internshipData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          {t("failedToLoadInternship")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2 text-blue-600 mb-4">
            <ArrowUpRight className="h-5 w-5" />

            <span className="font-medium">
              {t("activelyHiring")}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {internshipData.title}
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            {internshipData.company}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{internshipData.location}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="h-5 w-5" />

              <span>
                {t("CTC")}: {internshipData.stipend}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-5 w-5" />

              <span>
                {t("duration")}: {internshipData.duration}
              </span>
            </div>

          </div>

          <div className="mt-4 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />

            <span className="text-green-500 text-sm">
              {t("postedOn")}: {internshipData.createAt}
            </span>
          </div>
        </div>

        {/* Company Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t("about")}: {internshipData.company}
          </h2>

          <div className="flex items-center space-x-2 mb-4">
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>{t("visitCompanyWebsite")}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="text-gray-600">
            {internshipData.aboutCompany}
          </p>
        </div>

        {/* Internship Details */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t("aboutInternship")}
          </h2>

          <p className="text-gray-600 mb-6">
            {internshipData.aboutInternship}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("whoCanApply")}
          </h3>

          <p className="text-gray-600 mb-6">
            {internshipData.whoCanApply}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("perks")}
          </h3>

          <p className="text-gray-600 mb-6">
            {internshipData.perks}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("additionalInformation")}
          </h3>

          <p className="text-gray-600 mb-6">
            {internshipData.AdditionalInfo}
          </p>
        </div>

        {/* Apply Button */}
        <div className="p-6 flex justify-center">
          {user ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-150"
            >
              {t("applyNow")}
            </button>
          ) : (
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-150"
            >
              {t("signUpToApply")}
            </Link>
          )}
        </div>
      </div>

      {/* APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">

                <h2 className="text-2xl font-bold text-gray-900">
                  {t("applyTo")}: {internshipData.company}
                </h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>

              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Resume */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("yourResume")}
                </h3>

                <p className="text-gray-600">
                  {t("currentResume")}
                </p>
              </div>

              {/* Cover Letter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("Cover Letter")}
                </h3>

                <p className="text-gray-600 mb-2">
                  {t(
                    "Why should you be selected for this internship?"
                  )}
                </p>

                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder={t("writeCoverLetter")}
                />
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("Your Availability")}
                </h3>

                <div className="space-y-3">

                  {[
                    t("availableImmediately"),
                    t("currentlyNotice"),
                    t("serveNotice"),
                    t("other"),
                  ].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={option}
                        checked={availability === option}
                        onChange={(e) =>
                          setAvailability(e.target.value)
                        }
                        className="h-4 w-4 text-blue-600"
                      />

                      <span className="text-gray-700">
                        {option}
                      </span>
                    </label>
                  ))}

                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4">

                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  onClick={handleSubmitApplication}
                >
                  {t("submitApplication")}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION LIMIT POPUP */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">

          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Application Limit Reached
            </h2>

            <p className="text-gray-600 mb-6">
              Please upgrade your subscription plan to apply.
            </p>

            <div className="flex justify-end">

              <button
                onClick={() => setIsLimitModalOpen(false)}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700"
              >
                OK
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Index;