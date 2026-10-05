import Link from "next/link";
import React from "react";
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter, BsTwitterX, BsYoutube } from "react-icons/bs";
import { useTranslation } from "react-i18next";

const Footer = () => {
   const { t } = useTranslation("home");

   const links = [
      {
         header: t("resourcesHeader"),
         sublinks: [
            {
               title: t("parentsResource"),
               href: "/parents-resources",
            },
            {
               title: t("teachersResource"),
               href: "/teachers-resources",
            },
            {
               title: t("corporatePartnership"),
               href: "https://forms.monday.com/forms/ef8bc548d5f5846d9f5c23baa615b924?r=use1",
            },
            {
               title: t("professionalDevelopment"),
               href: "/dev-forum",
            },
            {
               title: t("pricing"),
               href: "/pricing",
            },
         ],
      },

      {
         header: t("support"),
         sublinks: [
            {
               title: t("supportCenter"),
               href: "/contact",
            },
            {
               title: t("faqs"),
               href: "/faq",
            },
            {
               title: t("gettingSetUp"),
               href: "/signup",
            },
         ],
      },

      {
         header: t("legal"),
         sublinks: [
            {
               title: t("terms"),
               href: "/privacy-policy",
            },
            {
               title: t("privacy"),
               href: "/privacy-policy",
            },
            {
               title: t("kidsOnlineSafety"),
               href: "/privacy-policy",
            },
         ],
      },

      {
         header: t("codealgo"),
         sublinks: [
            {
               title: t("aboutUs"),
               href: "/about-us",
            },
            {
               title: t("press"),
               href: "/press",
            },
            {
               title: t("blog"),
               href: "http://blog.codealgoacademy.com/",
            },
            {
               title: t("contactUs"),
               href: "/contact",
            },
         ],
      },
   ];

   return (
      <footer className="min-h-[150px] bg-mainBlack p-12 font-thabit text-white max-md:px-6">
         <div className="grid grid-cols-1 gap-8 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {links.map((link, index) => {
               return (
                  <div key={index}>
                     <p className="mb-2 font-thabit text-[.9rem] md:mb-8">{link.header}</p>

                     <ul className="space-y-2">
                        {link.sublinks.map((sublink, index) => {
                           return (
                              <li key={index} className="text-white">
                                 <Link href={sublink.href}>{sublink.title}</Link>
                              </li>
                           );
                        })}
                     </ul>
                  </div>
               );
            })}
         </div>

         <div className="mt-20 flex items-center justify-between gap-4 max-md:flex-col-reverse max-md:items-start">
            <div className="flex items-end gap-2">
               {socials.map((social, index) => {
                  return (
                     <a
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[17px] text-black"
                        key={index}
                     >
                        {social.icon}
                     </a>
                  );
               })}
            </div>

            <p className="text-[.9rem]">{t("copyright", { year: new Date().getFullYear() })}</p>

            <p className="text-[.9rem] font-semibold">800 E 18th St, Kansas City, MO 64108</p>
         </div>
      </footer>
   );
};

export const socials = [
   { link: "https://www.youtube.com/@codealgoacademy6800", icon: <BsYoutube /> },
   { link: "https://linkedin.com/company/codealgo", icon: <BsLinkedin /> },
   { link: "https://facebook.com/stcodealgo", icon: <BsFacebook /> },
   { link: "https://instagram.com/stcodealgo", icon: <BsInstagram /> },
   { link: "https://twitter.com/stcodealgo", icon: <BsTwitterX /> },
];

export default Footer;
