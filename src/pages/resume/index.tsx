import React from "react";
import axios from "axios";
import Script from "next/script";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import OtpModal from "@/Components/OtpModal";
import { useTranslation } from "react-i18next";


declare global {
  interface Window {
    Razorpay: any;
  }
}

const Resume = () => {
    const { t } = useTranslation();
    const user = useSelector(selectuser);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const router = useRouter();
    
    const [resumeData, setResumeData] = useState({
  email: "",
  fullName: "",
  phone: "",
  address: "",
  objective: "",

  skills: [""],

  education: [
    {
      degree: "",
      college: "",
      university: "",
      startYear: "",
      endYear: "",
      percentage: "",
    },
  ],

  experience: [
    {
      company: "",
      role: "",
      duration: "",
      description: "",
    },
  ],

  projects: [
    {
      title: "",
      description: "",
      technologies: "",
      github: "",
    },
  ],

  certifications: [
    {
      title: "",
      organization: "",
      year: "",
    },
  ],

  languages: [""],

  hobbies: [""],

  linkedin: "",
  github: "",

  profilePhoto: "",
   isPremium: false,
  paymentStatus: "Pending",
});

const fetchResume = async () => {
  try {
    if (!user?.email) return;

    const response = await axios.get(
      `http://localhost:5001/api/resume/${encodeURIComponent(
        user.email
      )}`
    );

    if (response.data.success) {
      let resume = response.data.data;

      if (
        !resume.profilePhoto ||
        resume.profilePhoto.startsWith(
          "https://lh3.googleusercontent.com"
        )
      ) {
        const saveResponse = await axios.post(
          "http://localhost:5001/api/resume/save-profile-photo",
          {
            email: user.email,
            photoURL: user.photo,
          }
        );

        resume.profilePhoto =
          saveResponse.data.profilePhoto;
      }

      setResumeData(resume);
    }
  } catch (err) {
    console.log("Fetch Resume Error:", err);
  }
};
useEffect(() => {
  if (!user?.email) return;

  fetchResume();
}, [user]);

useEffect(() => {
  console.log("showOtpModal:", showOtpModal);
}, [showOtpModal]);
useEffect(() => {
    console.log("Razorpay SDK:", window.Razorpay);
  if (user) {
    setResumeData((prev) => ({
      ...prev,
      email: user.email,
      fullName: user.name,
      profilePhoto: user.photo,
    }));
  }
}, [user]);
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;

  setResumeData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
const addSkill = () => {
  setResumeData({
    ...resumeData,
    skills: [...resumeData.skills, ""],
  });
};

const removeSkill = (index: number) => {
  const skills = [...resumeData.skills];
  skills.splice(index, 1);

  setResumeData({
    ...resumeData,
    skills,
  });
};

const handleSkillChange = (
  index: number,
  value: string
) => {
  const skills = [...resumeData.skills];
  skills[index] = value;

  setResumeData({
    ...resumeData,
    skills,
  });
};
const addEducation = () => {
  setResumeData({
    ...resumeData,
    education: [
      ...resumeData.education,
      {
        degree: "",
        college: "",
        university: "",
        startYear: "",
        endYear: "",
        percentage: "",
      },
    ],
  });
};

const removeEducation = (index: number) => {
  const education = [...resumeData.education];
  education.splice(index, 1);

  setResumeData({
    ...resumeData,
    education,
  });
};

const handleEducationChange = (
  index: number,
  field: string,
  value: string
) => {
  const education = [...resumeData.education];

  education[index] = {
    ...education[index],
    [field]: value,
  };

  setResumeData({
    ...resumeData,
    education,
  });
};
const addExperience = () => {
  setResumeData({
    ...resumeData,
    experience: [
      ...resumeData.experience,
      {
        company: "",
        role: "",
        duration: "",
        description: "",
      },
    ],
  });
};

const removeExperience = (index: number) => {
  const experience = [...resumeData.experience];
  experience.splice(index, 1);

  setResumeData({
    ...resumeData,
    experience,
  });
};

const handleExperienceChange = (
  index: number,
  field: string,
  value: string
) => {
  const experience = [...resumeData.experience];

  experience[index] = {
    ...experience[index],
    [field]: value,
  };

  setResumeData({
    ...resumeData,
    experience,
  });
};
const addProject = () => {
  setResumeData({
    ...resumeData,
    projects: [
      ...resumeData.projects,
      {
        title: "",
        description: "",
        technologies: "",
        github: "",
      },
    ],
  });
};

const removeProject = (index: number) => {
  const projects = [...resumeData.projects];
  projects.splice(index, 1);

  setResumeData({
    ...resumeData,
    projects,
  });
};

const handleProjectChange = (
  index: number,
  field: string,
  value: string
) => {
  const projects = [...resumeData.projects];

  projects[index] = {
    ...projects[index],
    [field]: value,
  };

  setResumeData({
    ...resumeData,
    projects,
  });
};
const addCertification = () => {
  setResumeData({
    ...resumeData,
    certifications: [
      ...resumeData.certifications,
      {
        title: "",
        organization: "",
        year: "",
      },
    ],
  });
};

const removeCertification = (index: number) => {
  const certifications = [...resumeData.certifications];
  certifications.splice(index, 1);

  setResumeData({
    ...resumeData,
    certifications,
  });
};

const handleCertificationChange = (
  index: number,
  field: string,
  value: string
) => {
  const certifications = [...resumeData.certifications];

  certifications[index] = {
    ...certifications[index],
    [field]: value,
  };

  setResumeData({
    ...resumeData,
    certifications,
  });
};
const addLanguage = () => {
  setResumeData({
    ...resumeData,
    languages: [...resumeData.languages, ""],
  });
};

const removeLanguage = (index: number) => {
  const languages = [...resumeData.languages];
  languages.splice(index, 1);

  setResumeData({
    ...resumeData,
    languages,
  });
};

const handleLanguageChange = (
  index: number,
  value: string
) => {
  const languages = [...resumeData.languages];
  languages[index] = value;

  setResumeData({
    ...resumeData,
    languages,
  });
};
const addHobby = () => {
  setResumeData({
    ...resumeData,
    hobbies: [...resumeData.hobbies, ""],
  });
};

const removeHobby = (index: number) => {
  const hobbies = [...resumeData.hobbies];
  hobbies.splice(index, 1);

  setResumeData({
    ...resumeData,
    hobbies,
  });
};

const handleHobbyChange = (
  index: number,
  value: string
) => {
  const hobbies = [...resumeData.hobbies];
  hobbies[index] = value;

  setResumeData({
    ...resumeData,
    hobbies,
  });
};

const sendOtp = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5001/api/otp/send-otp",
      {
        email: resumeData.email,
      }
    );
    console.log("Verify API Response:", response.data);

    if (response.data.success) {
      toast.success("OTP sent successfully");
      setShowOtpModal(true);
    } else {
      toast.error(t("unableToSendOtp"));
    }
  } catch (error: any) {

  alert(t("invalidOtp"));

  console.log(error);

}};

const verifyOtp = async (otp: string) => {
  try {
    const response = await axios.post(
      "http://localhost:5001/api/otp/verify-otp",
      {
        email: resumeData.email,
        otp,
      }
    );

    if (response.data.success) {
      toast.success(t("otpVerified"));

      setShowOtpModal(false);
    }
    await openRazorpay();

  } catch (error: any) {
  console.log("OTP ERROR:", error);
  // console.log("Response:", error.response);
  // console.log("Data:", error.response?.data);

  toast.error(
    error.response?.data?.message || t("verificationFailed")
  );
    // Don't close the modal here
  }
};
// setShowOtpModal(false);
const openRazorpay = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:5001/api/payment/create-order"
    );

    if (!data.success) {
      toast.error(t("unableToCreateOrder"));
      return;
    }

    const { order } = data;

    const options = {
    
      key: "rzp_test_TEaVrWvdfbDd7C", // <-- Use your actual Razorpay Key ID
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      name: "InternArea",
      description: "Premium Resume",

   handler: async function (response: any) {
  // alert("Payment Success Handler Called");

  console.log("SUCCESS:", response);
  console.log("Order ID:", response.razorpay_order_id);
  console.log("Payment ID:", response.razorpay_payment_id);
  console.log("Signature:", response.razorpay_signature);
  
  try {
    const verify = await axios.post(
      "http://localhost:5001/api/payment/verify-payment",
      {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        email: resumeData.email,
      }
    );

    console.log("Verify Response:", verify.data);

    if (verify.data.success) {
    toast.success(t("premiumResumeActivated"));
    router.push(`/resume/preview?email=${resumeData.email}`);
}else {
      toast.error(t("paymentVerificationFailed"));
    }
  } catch (error) {
    console.log("Verify Error:", error);
    // toast.error("Payment verification failed");
  }
},
      modal: {
    ondismiss: function () {
      console.log("Checkout closed");
    },
  },

  retry: {
    enabled: false,
  },

      prefill: {
        name: resumeData.fullName,
        email: resumeData.email,
        contact: resumeData.phone,
      },

      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    console.log(error);
    toast.error("Payment Failed");
  }
};
const cleanArray = (arr:any[]) => {
  return arr.filter((item) =>
    Object.values(item).some(
      (value) => value !== ""
    )
  );
};

// console.log("Creating new resume...");

const saveResume = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log("Resume saved successfully");
  console.log("Saving:", resumeData);
console.log("isPremium:", resumeData.isPremium);
console.log("paymentStatus:", resumeData.paymentStatus);

  console.log("1. Save button clicked");
 const cleanedResumeData = {
  ...resumeData,

  // paymentStatus:
  //   resumeData.paymentStatus || "Pending",

  // isPremium:
  //   resumeData.isPremium || false,

  education: cleanArray(resumeData.education),
  experience: cleanArray(resumeData.experience),
  projects: cleanArray(resumeData.projects),
  certifications: cleanArray(resumeData.certifications),

  skills: resumeData.skills.filter((s: string) => s),
  languages: resumeData.languages.filter((l: string) => l),
  hobbies: resumeData.hobbies.filter((h: string) => h),
};

  try {
    console.log("2. Trying POST...");

    const response = await axios.post(
      "http://localhost:5001/api/resume",
      cleanedResumeData
    );
// toast.error("TEST ERROR");
    console.log("3. POST Success", response.data);

    toast.success(response.data.message);
    if (resumeData.isPremium) {

  // toast.success("Resume Updated Successfully");

 router.push(
  `/resume/preview?email=${resumeData.email}`
);

} else {

  await sendOtp();

}

  } catch (error: any) {
//     console.log("4. POST Failed", error.response?.data);
//     console.log("POST ERROR:", error);
// console.log("STATUS:", error.response?.status);
// console.log("DATA:", error.response?.data);
// console.log("MESSAGE:", error.message);

    if (error.response?.status === 400) {
      console.log("5. Trying UPDATE...");

      try {
        console.log("UPDATE DATA");
console.log(cleanedResumeData);
console.log("paymentStatus:", cleanedResumeData.paymentStatus);
console.log("isPremium:", cleanedResumeData.isPremium);
        const updateResponse = await axios.put(
          `http://localhost:5001/api/resume/${resumeData.email}`,
          cleanedResumeData
        );
        

        console.log("6. UPDATE Success", updateResponse.data);
        console.log(updateResponse.data.data);

       toast.success(updateResponse.data.message);

const updatedResume = updateResponse.data.data;

if (
  updatedResume.isPremium &&
  updatedResume.paymentStatus === "Paid"
) {
  router.push(`/resume/preview?email=${updatedResume.email}`);
} else {
  await sendOtp();
}
      } catch (updateError: any) {
        console.log("7. UPDATE Failed", updateError.response?.data);
        toast.error("Update failed");
      }

      // return;
    }
    // toast.error("Something went wrong");
  }
};
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          {t("resumeBuilder")}
        </h1>

        <form onSubmit={saveResume}>

          <div>
<img
  src={resumeData?.profilePhoto}
  alt="Profile"
  className="w-32 h-32 rounded-full border-4 border-blue-600 object-cover mx-auto"
/>

            <div>
              <label>{t("enterFullName")}</label>
              <input
                 type="text"
                 name="fullName"
                 value={resumeData.fullName}
                 onChange={handleChange}
                 className="w-full border rounded p-1 mt-1"/>
            </div>

            <div>
              <label>{t("enterYourEmail")}</label>
              <input
                type="email"
                name="email"
                value={resumeData.email}
                onChange={handleChange}
                className="w-full border rounded p-1 mt-1"/>
            </div>

            <div>
              <label>{t("phoneNumber")}</label>
              <input
                type="text"
                name="phone"
                value={resumeData.phone}
                onChange={handleChange}
                className="w-full border rounded p-1 mt-1"/>
            </div>

            <div>
              <label>{t("address")}</label>
              <input
                type="text"
                name="address"
                value={resumeData.address}
                onChange={handleChange}
                className="w-full border rounded p-1 mt-1"/>
            </div>

          </div>

          <div className="mt-6">
            <label>{t("careerObjective")}</label>

            <textarea
                name="objective"
                value={resumeData.objective}
                onChange={handleChange}
                rows={5}
                className="w-full border rounded p-1 mt-1"/>
          </div>
<div className="mt-8">

<h2 className="text-2xl font-bold mb-5">
{t("skills")}
</h2>

{resumeData.skills.map((skill, index) => (

<div
key={index}
className="flex gap-3 mb-3"
>

<input
type="text"
placeholder={t("enterSkill")}
value={skill}
onChange={(e)=>handleSkillChange(index,e.target.value)}
className="flex-1 border rounded-lg p-2"
/>

<button
type="button"
onClick={()=>removeSkill(index)}
className="rounded-md border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
>
{t("remove")}
</button>

</div>

))}

<button
  type="button"
  onClick={addSkill}
  className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
>
  {t("addSkill")}
</button>

</div>
 
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-6">
    {t("education")}
  </h2>

  {resumeData.education.map((edu, index) => (

    <div
      key={index}
      className="border rounded-xl p-5 mb-6 shadow-sm"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> 

        <input
          type="text"
          placeholder={t("degree")}
          value={edu.degree}
          onChange={(e) =>
            handleEducationChange(index, "degree", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("college")}
          value={edu.college}
          onChange={(e) =>
            handleEducationChange(index, "college", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("university")}
          value={edu.university}
          onChange={(e) =>
            handleEducationChange(index, "university", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("startYear")}
          value={edu.startYear}
          onChange={(e) =>
            handleEducationChange(index, "startYear", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("endYear")}
          value={edu.endYear}
          onChange={(e) =>
            handleEducationChange(index, "endYear", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("percentageCgpa")}
          value={edu.percentage}
          onChange={(e) =>
            handleEducationChange(index, "percentage", e.target.value)
          }
          className="border rounded-lg p-2"
        />

      </div>

      <button
        type="button"
        onClick={() => removeEducation(index)}
        className="mt-5 rounded-md border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
      >
       {t("removeEducation")}
      </button>

    </div>

  ))}

  <button
    type="button"
    onClick={addEducation}
    className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
    {t("addEducation")}
  </button>
</div>
<div className="mt-10">

  <h2 className="text-2xl font-bold mb-6">
    {t("experience")}
  </h2>

  {resumeData.experience.map((exp, index) => (

    <div
      key={index}
      className="border rounded-xl p-5 mb-6 shadow-sm"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <input
          type="text"
          placeholder={t("companyName")}
          value={exp.company}
          onChange={(e) =>
            handleExperienceChange(index, "company", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("jobRole")}
          value={exp.role}
          onChange={(e) =>
            handleExperienceChange(index, "role", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("Duration")}
          value={exp.duration}
          onChange={(e) =>
            handleExperienceChange(index, "duration", e.target.value)
          }
          className="border rounded-lg p-2 md:col-span-2"
        />

        <textarea
          placeholder={t("describeResponsibilities")}
          value={exp.description}
          onChange={(e) =>
            handleExperienceChange(index, "description", e.target.value)
          }
          rows={4}
          className="border rounded-lg p-2 md:col-span-2"
        />

      </div>

      <button
        type="button"
        onClick={() => removeExperience(index)}
  className="mt-5 rounded-md border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
      >
        {t("removeExperience")}
      </button>

    </div>

  ))}

  <button
    type="button"
    onClick={addExperience}
className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"  >
    {t("addExperience")}
  </button>

</div>

<div className="mt-10">

  <h2 className="text-2xl font-bold mb-6">
    {t("projects")}
  </h2>

  {resumeData.projects.map((project, index) => (

    <div
      key={index}
      className="border rounded-xl p-5 mb-6 shadow-sm"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <input
          type="text"
          placeholder={t("projectTitle")}
          value={project.title}
          onChange={(e) =>
            handleProjectChange(index, "title", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("technologies")}
          value={project.technologies}
          onChange={(e) =>
            handleProjectChange(index, "technologies", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <textarea
          placeholder={t("projectDescription")}
          value={project.description}
          onChange={(e) =>
            handleProjectChange(index, "description", e.target.value)
          }
          rows={4}
          className="border rounded-lg p-2 md:col-span-2"
        />

        <input
          type="text"
          placeholder={t("githubRepositoryLink")}
          value={project.github}
          onChange={(e) =>
            handleProjectChange(index, "github", e.target.value)
          }
          className="border rounded-lg p-2 md:col-span-2"
        />

      </div>

      <button
        type="button"
        onClick={() => removeProject(index)}
  className="mt-5 rounded-md border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
      >
        {t("removeProject")}
      </button>

    </div>

  ))}

  <button
    type="button"
    onClick={addProject}
className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"  >
    {t("addProject")}
  </button>

</div>
<div className="mt-10">

  <h2 className="text-2xl font-bold mb-6">
    {t("certifications")}
  </h2>

  {resumeData.certifications.map((cert, index) => (

    <div
      key={index}
      className="border rounded-xl p-5 mb-6 shadow-sm"
    >

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <input
          type="text"
          placeholder={t("certificateTitle")}
          value={cert.title}
          onChange={(e) =>
            handleCertificationChange(index, "title", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("organization")}
          value={cert.organization}
          onChange={(e) =>
            handleCertificationChange(index, "organization", e.target.value)
          }
          className="border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder={t("year")}
          value={cert.year}
          onChange={(e) =>
            handleCertificationChange(index, "year", e.target.value)
          }
          className="border rounded-lg p-2"
        />

      </div>

      <button
        type="button"
        onClick={() => removeCertification(index)}
  className="mt-5 rounded-md border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
      >
       {t("removeCertification")}
      </button>

    </div>

  ))}

  <button
    type="button"
    onClick={addCertification}
className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"  >
   {t("addCertification")}
  </button>
</div>
<div className="mt-10">

<h2 className="text-2xl font-bold mb-6">
{t("languages")}
</h2>

{resumeData.languages.map((language, index) => (

<div key={index} className="flex gap-3 mb-3">

<input
type="text"
placeholder={t("language")}
value={language}
onChange={(e)=>handleLanguageChange(index,e.target.value)}
className="flex-1 border rounded-lg p-2"
/>

<button
type="button"
onClick={()=>removeLanguage(index)}
  className="rounded-md border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
>
{t("remove")}
</button>

</div>

))}

<button
type="button"
onClick={addLanguage}
className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
{t("addLanguage")}
</button>

</div>
<div className="mt-10">

<h2 className="text-2xl font-bold mb-6">
{t("hobbies")}
</h2>

{resumeData.hobbies.map((hobby, index) => (

<div key={index} className="flex gap-3 mb-3">

<input
type="text"
placeholder={t("hobby")}
value={hobby}
onChange={(e)=>handleHobbyChange(index,e.target.value)}
className="flex-1 border rounded-lg p-2"
/>

<button
type="button"
onClick={()=>removeHobby(index)}
className="rounded-md border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
>
{t("remove")}
</button>

</div>

))}

<button
type="button"
onClick={addHobby}
className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
>
{t("addHobby")}
</button>

  </div>

          <button
            type="submit"
            className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
            {t("saveResume")}
          </button>

        </form>

      </div>
  <OtpModal
  isOpen={showOtpModal}
  onClose={() => setShowOtpModal(false)}
  onVerify={verifyOtp}
/>
<Script
  id="razorpay-script"
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="afterInteractive"
/>
    </div>
  );
};
export default Resume;