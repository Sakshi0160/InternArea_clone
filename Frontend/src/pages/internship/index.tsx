import axios from "axios";

import {
  ArrowUpRight,
  Clock,
  DollarSign,
  Filter,
  Pin,
  PlayCircle,
  X,
} from "lucide-react";

import Link from "next/link";

import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  const [filteredInternships, setFilteredInternships] = useState<any[]>([]);

  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filter, setFilters] = useState({
    category: "",
    location: "",
    workFromHome: false,
    partTime: false,
    stipend: 100,
  });

  const [internshipData, setInternship] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch internships from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
  "http://localhost:5001/api/internship"
);

        const internships = Array.isArray(res.data) ? res.data : [];

        setInternship(internships);
        setFilteredInternships(internships);
      } catch (error) {
        console.log("Error fetching internships:", error);

        setInternship([]);
        setFilteredInternships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!internshipData.length) {
      setFilteredInternships([]);
      return;
    }

    const filtered = internshipData.filter((internship: any) => {
      // Category filter
      const category = String(internship.category || "").toLowerCase();

      const selectedCategory = filter.category.trim().toLowerCase();

      const matchesCategory =
        selectedCategory === "" ||
        category.includes(selectedCategory);

      // Location filter
      const location = String(internship.location || "").toLowerCase();

      const selectedLocation = filter.location.trim().toLowerCase();

      const matchesLocation =
        selectedLocation === "" ||
        location.includes(selectedLocation);

      // Work From Home filter
      const isWorkFromHome =
        internship.workFromHome === true ||
        internship.workFromHome === "true" ||
        internship.workFromHome === 1;

      const matchesWorkFromHome =
        !filter.workFromHome || isWorkFromHome;

      // Part-time filter
      const isPartTime =
        internship.partTime === true ||
        internship.partTime === "true" ||
        internship.partTime === 1;

      const matchesPartTime =
        !filter.partTime || isPartTime;

      // Stipend filter
      const stipendText = String(internship.stipend || "");

      const stipendValue =
        parseInt(stipendText.replace(/[^\d]/g, ""), 10) || 0;

      const matchesStipend =
        stipendValue <= filter.stipend * 1000;

      return (
        matchesCategory &&
        matchesLocation &&
        matchesWorkFromHome &&
        matchesPartTime &&
        matchesStipend
      );
    });

    setFilteredInternships(filtered);
  }, [filter, internshipData]);

  // Checkbox and stipend changes
  const handleFilterChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : Number(value),
    }));
  };

  // Category and location changes
  const handleTextFilterChange = (e: any) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: "",
      location: "",
      workFromHome: false,
      partTime: false,
      stipend: 100,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-col md:flex-row gap-8">

          {/* Filter */}
          <div className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-6 h-fit">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />

                <span className="font-medium text-black">
                  {t("filters")}
                </span>
              </div>

              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t("clearAll")}
              </button>

            </div>

            <div className="space-y-6">

              {/* Category */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("category")}
                </label>

                <input
                  type="text"
                  name="category"
                  value={filter.category}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                  placeholder={t("categoryPlaceholder")}
                />

              </div>

              {/* Location */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("location")}
                </label>

                <input
                  type="text"
                  name="location"
                  value={filter.location}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                  placeholder={t("locationPlaceholder")}
                />

              </div>

              {/* Checkboxes */}
              <div className="space-y-3">

                <label className="flex items-center space-x-2">

                  <input
                    type="checkbox"
                    name="workFromHome"
                    checked={filter.workFromHome}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 rounded"
                  />

                  <span className="text-gray-700">
                    {t("workFromHome")}
                  </span>

                </label>

                <label className="flex items-center space-x-2">

                  <input
                    type="checkbox"
                    name="partTime"
                    checked={filter.partTime}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 rounded"
                  />

                  <span className="text-gray-700">
                    {t("Parttime")}
                  </span>

                </label>

              </div>

              {/* Stipend */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("monthlyStipend")}
                </label>

                <input
                  type="range"
                  name="stipend"
                  min="0"
                  max="100"
                  value={filter.stipend}
                  onChange={handleFilterChange}
                  className="w-full"
                />

                <div className="flex justify-between text-sm text-gray-600">

                  <span>{t("salary0")}</span>
                  <span>{t("salary50")}</span>
                  <span>{t("salary100")}</span>

                </div>
              </div>

            </div>
          </div>

          {/* Internship List */}
          <div className="flex-1">

            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4">

              <button
                onClick={() =>
                  setIsFilterVisible(!isFilterVisible)
                }
                className="w-full flex items-center justify-center space-x-2 bg-white p-3 rounded-lg shadow-sm text-black"
              >

                <Filter className="h-5 w-5" />

                <span>
                  {t("changeFilters")}
                </span>

              </button>

            </div>

            {/* Result Count */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">

              <p className="text-center font-medium text-black">

                {loading
                  ? "Loading internships..."
                  : `${filteredInternships.length} ${t(
                      "internshipsFound"
                    )}`}

              </p>

            </div>

            {/* Internship Cards */}
            <div className="space-y-4">

              {loading ? (

                <div className="bg-white rounded-lg shadow-sm p-8 text-center">

                  <p className="text-gray-600">
                    Loading internships...
                  </p>

                </div>

              ) : filteredInternships.length === 0 ? (

                <div className="bg-white rounded-lg shadow-sm p-8 text-center">

                  <p className="text-gray-600">
                    No internships have been posted yet.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t("clearAll")}
                  </button>

                </div>

              ) : (

                filteredInternships.map(
                  (internship: any) => (

                    <div
                      key={internship._id}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >

                      {/* Actively Hiring */}
                      <div className="flex items-center space-x-2 text-blue-600 mb-4">

                        <ArrowUpRight className="h-5 w-5" />

                        <span className="font-medium">
                          {t("activelyHiring")}
                        </span>

                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {internship.title}
                      </h2>

                      {/* Company */}
                      <p className="text-gray-600 mb-4">
                        {internship.company}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                        {/* Start Date */}
                        <div className="flex items-center space-x-2 text-gray-600">

                          <PlayCircle className="h-5 w-5" />

                          <div>

                            <p className="text-sm font-medium">
                              {t("startDate")}
                            </p>

                            <p className="text-sm">
                              {internship.startDate}
                            </p>

                          </div>

                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-2 text-gray-600">

                          <Pin className="h-5 w-5" />

                          <div>

                            <p className="text-sm font-medium">
                              {t("location")}
                            </p>

                            <p className="text-sm">
                              {internship.location}
                            </p>

                          </div>

                        </div>

                        {/* Stipend */}
                        <div className="flex items-center space-x-2 text-gray-600">

                          <DollarSign className="h-5 w-5" />

                          <div>

                            <p className="text-sm font-medium">
                              {t("stipend")}
                            </p>

                            <p className="text-sm">
                              {internship.stipend}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* Bottom */}
                      <div className="flex items-center justify-between">

                        <div className="flex items-center space-x-2">

                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            {t("internships")}
                          </span>

                          <div className="flex items-center space-x-1 text-green-600">

                            <Clock className="h-4 w-4" />

                            <span className="text-sm">
                              {t("postedRecently")}
                            </span>

                          </div>

                        </div>

                        <Link
                          href={`/detailiternship/${internship._id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t("viewDetails")}
                        </Link>

                      </div>

                    </div>
                  )
                )
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isFilterVisible && (

        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">

          <div className="bg-white h-full w-full max-w-sm ml-auto p-6 overflow-y-auto">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-lg font-bold text-gray-900">
                {t("Filters")}
              </h2>

              <button
                onClick={() => setIsFilterVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>

            </div>

            <div className="space-y-6">

              {/* Category */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Category")}
                </label>

                <input
                  type="text"
                  name="category"
                  value={filter.category}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                  placeholder={t("e.g. Marketing Intern")}
                />

              </div>

              {/* Location */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Location")}
                </label>

                <input
                  type="text"
                  name="location"
                  value={filter.location}
                  onChange={handleTextFilterChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                  placeholder={t("c.g. Mumbai")}
                />

              </div>

              {/* Checkboxes */}
              <div className="space-y-3">

                <label className="flex items-center space-x-2">

                  <input
                    type="checkbox"
                    name="workFromHome"
                    checked={filter.workFromHome}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 rounded"
                  />

                  <span className="text-gray-700">
                    {t("Work from home")}
                  </span>

                </label>

                <label className="flex items-center space-x-2">

                  <input
                    type="checkbox"
                    name="partTime"
                    checked={filter.partTime}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 rounded"
                  />

                  <span className="text-gray-700">
                    {t("Part-time")}
                  </span>

                </label>

              </div>

              {/* Stipend */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Stipend
                </label>

                <input
                  type="range"
                  name="stipend"
                  min="0"
                  max="100"
                  value={filter.stipend}
                  onChange={handleFilterChange}
                  className="w-full"
                />

                <div className="flex justify-between text-sm text-gray-600">

                  <span>₹0</span>
                  <span>₹50K</span>
                  <span>₹100K</span>

                </div>
              </div>

              <button
                onClick={() => setIsFilterVisible(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;