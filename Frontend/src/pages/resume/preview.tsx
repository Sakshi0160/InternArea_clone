import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { Mail, Phone, MapPin } from "lucide-react";

const API_URL = "http://localhost:5001";

const Preview = () => {
  const router = useRouter();

  const [resume, setResume] = useState<any>(null);
  const [isAttaching, setIsAttaching] = useState(false);

  // =========================================================
  // FETCH RESUME
  // =========================================================
  useEffect(() => {
    if (!router.isReady) return;

    const fetchResume = async () => {
      try {
        let email = router.query.email;

        if (Array.isArray(email)) {
          email = email[0];
        }

        if (!email) return;

        const response = await axios.get(
          `${API_URL}/api/resume/${encodeURIComponent(email)}`
        );

        if (!response.data.success) {
          toast.error("Unable to load resume");
          return;
        }

        let resumeData = response.data.data;

        // =====================================================
        // SAVE GOOGLE PROFILE PHOTO LOCALLY
        // =====================================================
        if (
          resumeData.profilePhoto &&
          resumeData.profilePhoto.startsWith(
            "https://lh3.googleusercontent.com"
          )
        ) {
          try {
            const photoResponse = await axios.post(
              `${API_URL}/api/resume/save-profile-photo`,
              {
                email: resumeData.email,
                photoURL: resumeData.profilePhoto,
              }
            );

            if (photoResponse.data.success) {
              resumeData.profilePhoto =
                photoResponse.data.profilePhoto;
            }
          } catch (photoError) {
            console.log(
              "Could not save Google profile photo:",
              photoError
            );
          }
        }

        setResume(resumeData);
      } catch (error) {
        console.log("Fetch Resume Error:", error);
        toast.error("Unable to load resume");
      }
    };

    fetchResume();
  }, [router.isReady, router.query.email]);

  // =========================================================
  // AUTO ATTACH AFTER PAYMENT
  // =========================================================
  useEffect(() => {
    if (!resume) return;

    if (
      resume.isPremium &&
      router.query.attach === "true"
    ) {
      const timer = setTimeout(() => {
        attachResume();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [resume, router.query.attach]);

  // =========================================================
  // WAIT FOR ALL IMAGES
  // =========================================================
  const waitForImages = async (
    element: HTMLElement
  ) => {
    const images = Array.from(
      element.querySelectorAll("img")
    );

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  };

  // =========================================================
  // ATTACH RESUME
  // =========================================================
  const attachResume = async () => {
    if (isAttaching) return;

    try {
      setIsAttaching(true);

      const resumeElement =
        document.getElementById("resume-content");

      if (!resumeElement) {
        toast.error("Resume not found");
        setIsAttaching(false);
        return;
      }

      // -----------------------------------------------------
      // WAIT FOR IMAGES
      // -----------------------------------------------------
      await waitForImages(resumeElement);

      // -----------------------------------------------------
      // SMALL DELAY TO ALLOW LAYOUT TO FINISH
      // -----------------------------------------------------
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      // -----------------------------------------------------
      // GET ACTUAL RESUME SIZE
      // -----------------------------------------------------
      const rect =
        resumeElement.getBoundingClientRect();

      const fullWidth = Math.ceil(
        Math.max(
          resumeElement.scrollWidth,
          resumeElement.offsetWidth,
          rect.width
        )
      );

      const fullHeight = Math.ceil(
        Math.max(
          resumeElement.scrollHeight,
          resumeElement.offsetHeight,
          rect.height
        )
      );

      console.log("================================");
      console.log("RESUME PDF SIZE");
      console.log("Width:", fullWidth);
      console.log("Height:", fullHeight);
      console.log("================================");

      // -----------------------------------------------------
      // CREATE FULL RESUME CANVAS
      // -----------------------------------------------------
      const canvas = await toCanvas(
        resumeElement,
        {
          cacheBust: true,
          pixelRatio: 2,

          backgroundColor: "#ffffff",

          width: fullWidth,
          height: fullHeight,

          style: {
            width: `${fullWidth}px`,
            height: `${fullHeight}px`,
            maxWidth: "none",
            maxHeight: "none",
            margin: "0",
            padding: "40px",
            overflow: "visible",
            transform: "none",
          },

          filter: (node) => {
            // Don't capture anything marked as no-pdf
            if (
              node instanceof HTMLElement &&
              node.classList.contains("no-pdf")
            ) {
              return false;
            }

            return true;
          },
        }
      );

      // -----------------------------------------------------
      // CREATE A4 PDF
      // -----------------------------------------------------
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      // -----------------------------------------------------
      // IMPORTANT:
      // Calculate exact pixels corresponding to A4 height.
      // -----------------------------------------------------
      const pagePixelHeight = Math.floor(
        (canvas.width * pageHeight) /
          pageWidth
      );

      console.log(
        "A4 Page Pixel Height:",
        pagePixelHeight
      );

      let currentY = 0;
      let pageNumber = 0;

      // -----------------------------------------------------
      // SPLIT FULL CANVAS INTO A4 PAGES
      // -----------------------------------------------------
      while (currentY < canvas.height) {
        const remainingHeight =
          canvas.height - currentY;

        const currentPageHeight =
          Math.min(
            pagePixelHeight,
            remainingHeight
          );

        console.log(
          `Creating PDF page ${pageNumber + 1}`
        );

        console.log(
          "Current Y:",
          currentY
        );

        console.log(
          "Current Page Height:",
          currentPageHeight
        );

        // ---------------------------------------------------
        // CREATE PAGE CANVAS
        // ---------------------------------------------------
        const pageCanvas =
          document.createElement("canvas");

        pageCanvas.width = canvas.width;
        pageCanvas.height =
          currentPageHeight;

        const pageContext =
          pageCanvas.getContext("2d");

        if (!pageContext) {
          throw new Error(
            "Could not create canvas context"
          );
        }

        // ---------------------------------------------------
        // WHITE BACKGROUND
        // ---------------------------------------------------
        pageContext.fillStyle = "#ffffff";

        pageContext.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        // ---------------------------------------------------
        // COPY CORRECT SECTION OF RESUME
        // ---------------------------------------------------
        pageContext.drawImage(
          canvas,

          // Source
          0,
          currentY,
          canvas.width,
          currentPageHeight,

          // Destination
          0,
          0,
          canvas.width,
          currentPageHeight
        );

        // ---------------------------------------------------
        // CONVERT PAGE TO IMAGE
        // ---------------------------------------------------
        const pageImage =
          pageCanvas.toDataURL(
            "image/jpeg",
            0.95
          );

        // ---------------------------------------------------
        // ADD NEW PDF PAGE
        // ---------------------------------------------------
        if (pageNumber > 0) {
          pdf.addPage();
        }

        // ---------------------------------------------------
        // CALCULATE PAGE IMAGE HEIGHT
        // ---------------------------------------------------
        const pageImageHeight =
          (currentPageHeight *
            pageWidth) /
          canvas.width;

        // ---------------------------------------------------
        // ADD IMAGE
        // ---------------------------------------------------
        pdf.addImage(
          pageImage,
          "JPEG",
          0,
          0,
          pageWidth,
          pageImageHeight,
          undefined,
          "FAST"
        );

        // ---------------------------------------------------
        // MOVE TO NEXT SECTION
        // ---------------------------------------------------
        currentY += currentPageHeight;

        pageNumber++;
      }

      console.log(
        "Total PDF Pages:",
        pageNumber
      );

      // =====================================================
      // CREATE PDF BLOB
      // =====================================================
      const pdfBlob = pdf.output("blob");

      // =====================================================
      // SEND PDF TO BACKEND
      // =====================================================
      const formData = new FormData();

      formData.append(
        "resume",
        pdfBlob,
        `${resume.fullName || "resume"}.pdf`
      );

      formData.append(
        "email",
        resume.email
      );

      const response = await axios.post(
        `${API_URL}/api/resume/upload-pdf`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      // =====================================================
      // SUCCESS
      // =====================================================
      if (response.data.success) {
        toast.success(
          "Resume attached successfully!"
        );

        setTimeout(() => {
          router.push("/profile");
        }, 1000);
      } else {
        toast.error(
          response.data.message ||
            "Failed to attach resume"
        );

        setIsAttaching(false);
      }
    } catch (error) {
      console.log(
        "Attach Resume Error:",
        error
      );

      toast.error(
        "Something went wrong while attaching resume"
      );

      setIsAttaching(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold">
          Loading Resume...
        </h2>
      </div>
    );
  }

  // =========================================================
  // PROFILE PHOTO URL
  // =========================================================
  const profilePhoto =
    resume.profilePhoto
      ? resume.profilePhoto.startsWith(
          "/uploads/profile/"
        )
        ? `${API_URL}${resume.profilePhoto}`
        : resume.profilePhoto
      : "";

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      {/* =====================================================
          ACTION BUTTONS
          These are OUTSIDE the PDF capture area.
      ===================================================== */}
      <div className="no-pdf max-w-4xl mx-auto mb-6 flex items-center justify-between">

        <button
          onClick={() =>
            router.push(
              `/resume?email=${encodeURIComponent(
                resume.email
              )}`
            )
          }
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:shadow-md cursor-pointer"
        >
          ✏️ Edit Resume
        </button>

        <button
          onClick={attachResume}
          disabled={isAttaching}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-green-700 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAttaching
            ? "Attaching..."
            : "📎 Attach Resume to Profile"}
        </button>

      </div>

      {/* =====================================================
          IMPORTANT:
          Only this element is converted to PDF.
      ===================================================== */}
      <div
        id="resume-content"
        className="bg-white max-w-4xl mx-auto p-10"
        style={{
          boxSizing: "border-box",
          width: "100%",
          minHeight: "auto",
          height: "auto",
          overflow: "visible",
        }}
      >

        {/* ===================================================
            HEADER
        =================================================== */}
        <div className="text-center">

          {profilePhoto && (
            <img
              src={profilePhoto}
              alt="Profile"
              crossOrigin="anonymous"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
          )}

          <h1 className="text-4xl font-bold">
            {resume.fullName}
          </h1>

          <div className="mt-4 flex flex-col items-center gap-3 text-gray-700">

            {resume.email && (
              <div className="flex items-center gap-2">
                <Mail
                  size={18}
                  className="text-blue-600"
                />

                <span>
                  {resume.email}
                </span>
              </div>
            )}

            {resume.phone && (
              <div className="flex items-center gap-2">
                <Phone
                  size={18}
                  className="text-green-600"
                />

                <span>
                  {resume.phone}
                </span>
              </div>
            )}

            {resume.address && (
              <div className="flex items-center gap-2">
                <MapPin
                  size={18}
                  className="text-red-600"
                />

                <span>
                  {resume.address}
                </span>
              </div>
            )}

          </div>
        </div>

        <hr className="my-6" />

        {/* ===================================================
            OBJECTIVE
        =================================================== */}
        {resume.objective && (
          <section>
            <h2 className="text-2xl font-bold mb-2">
              Career Objective
            </h2>

            <p className="leading-relaxed">
              {resume.objective}
            </p>
          </section>
        )}

        {/* ===================================================
            SKILLS
        =================================================== */}
        {resume.skills?.some(
          (skill: string) => skill
        ) && (
          <section className="mt-6">

            <h2 className="text-2xl font-bold mb-2">
              Skills
            </h2>

            <ul className="list-disc ml-5">

              {resume.skills.map(
                (
                  skill: string,
                  index: number
                ) =>
                  skill && (
                    <li key={index}>
                      {skill}
                    </li>
                  )
              )}

            </ul>

          </section>
        )}

        {/* ===================================================
            EDUCATION
        =================================================== */}
        {resume.education?.some(
          (edu: any) =>
            edu.degree ||
            edu.college ||
            edu.university
        ) && (
          <section className="mt-6">

            <h2 className="text-2xl font-bold mb-3">
              Education
            </h2>

            {resume.education.map(
              (
                edu: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="mb-4"
                >

                  {edu.degree && (
                    <h3 className="font-semibold">
                      {edu.degree}
                    </h3>
                  )}

                  {edu.college && (
                    <p>
                      {edu.college}
                    </p>
                  )}

                  {edu.university && (
                    <p>
                      {edu.university}
                    </p>
                  )}

                  {(edu.startYear ||
                    edu.endYear) && (
                    <p>
                      {edu.startYear}{" "}
                      -{" "}
                      {edu.endYear}
                    </p>
                  )}

                  {edu.percentage && (
                    <p>
                      Percentage/CGPA:{" "}
                      {edu.percentage}
                    </p>
                  )}

                </div>
              )
            )}

          </section>
        )}

        {/* ===================================================
            EXPERIENCE
        =================================================== */}
        {resume.experience?.some(
          (exp: any) =>
            exp.company ||
            exp.role ||
            exp.description
        ) && (
          <section className="mt-6">

            <h2 className="text-2xl font-bold mb-3">
              Experience
            </h2>

            {resume.experience.map(
              (
                exp: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="mb-4"
                >

                  {exp.company && (
                    <h3 className="font-semibold">
                      {exp.company}
                    </h3>
                  )}

                  {exp.role && (
                    <p>
                      {exp.role}
                    </p>
                  )}

                  {exp.duration && (
                    <p>
                      {exp.duration}
                    </p>
                  )}

                  {exp.description && (
                    <p className="leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                </div>
              )
            )}

          </section>
        )}

        {/* ===================================================
            PROJECTS
        =================================================== */}
        {resume.projects?.some(
          (project: any) =>
            project.title
        ) && (
          <section className="mt-6">

            <h2 className="text-2xl font-bold mb-3">
              Projects
            </h2>

            {resume.projects.map(
              (
                project: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="mb-4"
                >

                  {project.title && (
                    <h3 className="font-semibold">
                      {project.title}
                    </h3>
                  )}

                  {project.description && (
                    <p className="leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {project.technologies && (
                    <p>
                      <strong>
                        Technologies:
                      </strong>{" "}
                      {project.technologies}
                    </p>
                  )}

                  {project.github && (
                    <p>
                      <strong>
                        GitHub:
                      </strong>{" "}
                      {project.github}
                    </p>
                  )}

                </div>
              )
            )}

          </section>
        )}

        {/* ===================================================
            CERTIFICATIONS
        =================================================== */}
        {resume.certifications?.some(
          (cert: any) =>
            cert.title ||
            cert.organization ||
            cert.year
        ) && (
          <section className="mt-6">

            <h2 className="text-2xl font-bold mb-3">
              Certifications
            </h2>

            {resume.certifications.map(
              (
                cert: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="mb-3"
                >

                  {cert.title && (
                    <p className="font-semibold">
                      {cert.title}
                    </p>
                  )}

                  {cert.organization && (
                    <p>
                      {cert.organization}
                    </p>
                  )}

                  {cert.year && (
                    <p>
                      {cert.year}
                    </p>
                  )}

                </div>
              )
            )}

          </section>
        )}

        {/* ===================================================
            LANGUAGES
        =================================================== */}
        {resume.languages?.some(
          (lang: string) => lang
        ) && (
          <section className="mt-6">

            <h2 className="text-2xl font-bold mb-2">
              Languages
            </h2>

            <p>
              {resume.languages
                .filter(
                  (lang: string) => lang
                )
                .join(", ")}
            </p>

          </section>
        )}

        {/* ===================================================
            HOBBIES
        =================================================== */}
        {resume.hobbies?.some(
          (hobby: string) => hobby
        ) && (
          <section className="mt-6">

            <h2 className="text-2xl font-bold mb-2">
              Hobbies
            </h2>

            <p>
              {resume.hobbies
                .filter(
                  (hobby: string) => hobby
                )
                .join(", ")}
            </p>

          </section>
        )}

      </div>
    </div>
  );
};

export default Preview;