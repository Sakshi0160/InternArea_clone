import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";

const PremiumResume = () => {
  const user = useSelector(selectuser);

  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchResume();
    }
  }, [user]);

  const fetchResume = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/resume/${user.email}`
      );

      setResume(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl font-semibold">Loading Resume...</h2>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl text-red-600">Resume Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">

      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-10">

        <h1 className="text-4xl font-bold text-center">
          {resume.fullName}
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Premium ATS Resume
        </p>

        <hr className="my-8" />

        <div className="grid grid-cols-2 gap-6">

          <div>
            <h3 className="font-semibold">Email</h3>
            <p>{resume.email}</p>
          </div>

          <div>
            <h3 className="font-semibold">Phone</h3>
            <p>{resume.phone}</p>
          </div>

          <div>
            <h3 className="font-semibold">Address</h3>
            <p>{resume.address}</p>
          </div>

          <div>
            <h3 className="font-semibold">LinkedIn</h3>
            <p>{resume.linkedin}</p>
          </div>

          <div>
            <h3 className="font-semibold">GitHub</h3>
            <p>{resume.github}</p>
          </div>

        </div>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-3">
          Career Objective
        </h2>

        <p>{resume.objective}</p>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          Skills
        </h2>

        <div className="flex flex-wrap gap-3">

          {resume.skills?.map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full"
            >
              {skill}
            </span>
          ))}

        </div>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          Education
        </h2>

        {resume.education?.map((edu: any, index: number) => (
          <div key={index} className="mb-5 border-l-4 border-blue-600 pl-4">

            <h3 className="font-bold">{edu.degree}</h3>

            <p>{edu.college}</p>

            <p>{edu.university}</p>

            <p>
              {edu.startYear} - {edu.endYear}
            </p>

            <p>{edu.percentage}</p>

          </div>
        ))}

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          Experience
        </h2>

        {resume.experience?.map((exp: any, index: number) => (
          <div key={index} className="mb-5">

            <h3 className="font-bold">{exp.company}</h3>

            <p>{exp.role}</p>

            <p>{exp.duration}</p>

            <p>{exp.description}</p>

          </div>
        ))}

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          Projects
        </h2>

        {resume.projects?.map((project: any, index: number) => (
          <div key={index} className="mb-5">

            <h3 className="font-bold">{project.title}</h3>

            <p>{project.description}</p>

            <p>{project.technologies}</p>

            <p>{project.github}</p>

          </div>
        ))}

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          Certifications
        </h2>

        {resume.certifications?.map((cert: any, index: number) => (
          <div key={index} className="mb-5">

            <h3 className="font-bold">{cert.title}</h3>

            <p>{cert.organization}</p>

            <p>{cert.year}</p>

          </div>
        ))}

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          Languages
        </h2>

        <div className="flex flex-wrap gap-3">

          {resume.languages?.map((language: string, index: number) => (
            <span
              key={index}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-full"
            >
              {language}
            </span>
          ))}

        </div>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          Hobbies
        </h2>

        <div className="flex flex-wrap gap-3">

          {resume.hobbies?.map((hobby: string, index: number) => (
            <span
              key={index}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full"
            >
              {hobby}
            </span>
          ))}

        </div>

      </div>

    </div>
  );
};

export default PremiumResume;