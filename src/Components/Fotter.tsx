import { Facebook, Twitter, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        
        {/* ================================
            FIRST SECTION
        ================================= */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-10">
          
          <FooterSection
            title={t("internshipPlaces")}
            items={[
              t("India"),
              t("NewYork"),
              t("China"),
              t("Italy"),
              t("Dubai"),
              t("Canada"),
            ]}
          />

          <FooterSection
            title={t("internshipStreams")}
            items={[
              t("about"),
              t("careers"),
              t("press"),
              t("news"),
              t("mediaKit"),
              t("contact"),
            ]}
          />

          <FooterSection
            title={t("jobPlaces")}
            items={[
              t("blog"),
              t("newsletter"),
              t("events"),
              t("helpCenter"),
              t("tutorials"),
              t("supports"),
            ]}
            links
          />

          <FooterSection
            title={t("jobStreams")}
            items={[
              t("Startups"),
              t("Enterprise"),
              t("Government"),
              t("SaaS"),
              t("Marketplaces"),
              t("Ecommerce"),
            ]}
            links
          />
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-600 sm:my-10" />

        {/* ================================
            SECOND SECTION
        ================================= */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-10">
          
          <FooterSection
            title={t("about")}
            items={[t("Startups"), t("Enterprise")]}
            links
          />

          <FooterSection
            title={t("teamDiary")}
            items={[t("Startups"), t("Enterprise")]}
            links
          />

          <FooterSection
            title={t("terms")}
            items={[t("Startups"), t("Enterprise")]}
            links
          />

          <FooterSection
            title={t("sitemap")}
            items={[t("Startups")]}
            links
          />
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-600 sm:my-10" />

        {/* ================================
            BOTTOM SECTION
        ================================= */}
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
          
          {/* Google Play */}
          <p className="flex items-center gap-2 rounded-lg border border-white px-4 py-2 text-sm transition hover:bg-gray-700">
            <i className="bi bi-google-play"></i>
            <span>{t("android")}</span>
          </p>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-5">
            <Facebook
              className="h-5 w-5 cursor-pointer transition hover:text-blue-400 sm:h-6 sm:w-6"
            />

            <Twitter
              className="h-5 w-5 cursor-pointer transition hover:text-blue-400 sm:h-6 sm:w-6"
            />

            <Instagram
              className="h-5 w-5 cursor-pointer transition hover:text-pink-400 sm:h-6 sm:w-6"
            />
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 sm:text-sm">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================
   FOOTER SECTION COMPONENT
========================================== */

function FooterSection({
  title,
  items,
  links,
}: {
  title: string;
  items: string[];
  links?: boolean;
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-bold text-gray-300">
        {title}
      </h3>

      <div className="mt-4 flex flex-col items-start space-y-2.5">
        {items.map((item, index) =>
          links ? (
            <a
              key={index}
              href="/"
              className="break-words text-sm text-gray-400 transition hover:text-blue-400 hover:underline"
            >
              {item}
            </a>
          ) : (
            <p
              key={index}
              className="break-words text-sm text-gray-400 transition hover:text-blue-400 hover:underline"
            >
              {item}
            </p>
          )
        )}
      </div>
    </div>
  );
}