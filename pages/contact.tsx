import Head from "next/head";
import Banner from "@/components/home/new-home/banner";
import Footer, { socials } from "@/components/home/new-home/footer";
import ContactModal from "@/components/modals/contactUsModal";
import Navbar from "@/components/navbar/home/Navbar";
import { CustomButton } from "@/components/UI/Button";
import http from "axios.config";
import Image from "next/image";
import TawkToWidget from "public/TawkToWidget";
import { ChangeEvent, useState } from "react";
import { BiEnvelopeOpen, BiMapPin } from "react-icons/bi";
import { TbThumbUp } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { closePreloader, openErrorModal, openPreloader } from "store/fetchSlice";
import { useTranslation } from "react-i18next";

const Contact = () => {
   const [email, setEmail] = useState("");
   const [subject, setSubject] = useState("");
   const [message, setMessage] = useState("");
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [modalOpened, setModalOpened] = useState(false);
   const dispatch = useDispatch();
   const { t } = useTranslation("pages");

   const sendAMessage = async (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch(openPreloader({ loadingText: t("sendingMessage") }));
      try {
         const { data } = await http.post("/contact/message/", {
            email,
            subject,
            message,
            name: `${firstName} ${lastName}`,
         });
         setModalOpened(true);
         dispatch(closePreloader());
      } catch (error: any) {
         console.log(error);
         dispatch(openErrorModal({ errorText: [error.message] }));
         dispatch(closePreloader());
      }
   };

   const jsonLd = {
   "@context": "https://schema.org",
   "@type": "ContactPage",
   name: "Contact CodeAlgo Academy",
   description:
      "Contact CodeAlgo Academy for questions about coding education, accounts, schools, and our learning platform.",
   url: "https://codealgoacademy.com/contact",
   isPartOf: {
      "@type": "WebSite",
      name: "CodeAlgo Academy",
      url: "https://codealgoacademy.com",
   },
};
   return (
      <>
      <Head>
  <title>Contact Us | CodeAlgo Academy</title>
   <link
      rel="canonical"
      href="https://codealgoacademy.com/contact"
   />
   <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
         __html: JSON.stringify(jsonLd),
      }}
   />
  <meta name="description" content="Get in touch with the CodeAlgo Academy team. We're here to help with questions about our kids coding courses, pricing, and more." />
</Head>
         <Navbar />

         <div className="relative overflow-x-hidden bg-white font-thabit">
            <Banner />

            <div className="mx-auto max-w-[1200px] p-6">
               {modalOpened && <ContactModal />}

               <h1 className="mt-20 text-center font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">{t("weAreHereToHelp")}</h1>

               <div className="mt-40 mb-12 flex items-start gap-8 max-md:flex-col">
                  <div className="flex-1">
                     <ul className="space-y-8">
                        <li className="flex items-center gap-3 font-thabit">
                           <span>
                              <BiMapPin className="text-mainBlack" size={30} />
                           </span>
                           {t("kansasCityAddress")}
                        </li>

                        <li className="flex items-center gap-3 font-thabit">
                           <span>
                              <BiEnvelopeOpen className="text-mainBlack" size={30} />
                           </span>
                           <a className="underline" href="mailto:info@codealgoacademy.com">
                              info@codealgoacademy.com
                           </a>
                        </li>

                        <li className="flex items-center gap-5">
                           <span>
                              <TbThumbUp className="text-mainBlack" size={30} />
                           </span>
                           <div className="flex items-end gap-2">
                              {socials.map((social, index) => {
                                 return (
                                    <a href={social.link} target="_blank" rel="noopener noreferrer" key={index} className="text-[15px]">
                                       {social.icon}
                                    </a>
                                 );
                              })}
                           </div>
                        </li>
                     </ul>
                  </div>

                  <div className="relative flex-1">
                     <img src={"/assets/0013_1.png"} className="absolute -top-[112px] -left-[60px] z-[1] w-[150px] max-md:hidden" />

                     <form onSubmit={sendAMessage} className="relative z-[2] bg-white">
                        <div className="flex items-center gap-2">
                           <div className="mb-2 flex-1">
                            <label htmlFor="" className="mb-1 block font-thabit text-[.85rem]">
                                  {t("firstName")}
                               </label>
                              <input
                                 type="text"
                                 value={firstName}
                                 onChange={(e) => {
                                    setFirstName(e.target.value);
                                 }}
                                 className="w-full rounded-md border-[1.5px] p-2 outline-none focus:border-mainRed"
                              />
                           </div>

                           <div className="mb-2 flex-1">
                            <label htmlFor="" className="mb-1 block font-thabit text-[.85rem]">
                                  {t("lastName")}
                               </label>
                              <input
                                 type="text"
                                 value={lastName}
                                 onChange={(e) => {
                                    setLastName(e.target.value);
                                 }}
                                 className="w-full rounded-md border-[1.5px] p-2 outline-none focus:border-mainRed"
                              />
                           </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor="" className="mb-1 block font-thabit text-[.85rem]">
                               {t("email")}<sup>*</sup>
                           </label>
                           <input
                              required
                              type="email"
                              value={email}
                              onChange={(e) => {
                                 setEmail(e.target.value);
                              }}
                              className="w-full rounded-md border-[1.5px] p-2 outline-none focus:border-mainRed"
                           />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="" className="mb-1 block font-thabit text-[.85rem]">
                               {t("subject")}<sup>*</sup>
                           </label>
                           <input
                              required
                              type="text"
                              value={subject}
                              onChange={(e) => {
                                 setSubject(e.target.value);
                              }}
                              className="w-full rounded-md border-[1.5px] p-2 outline-none focus:border-mainRed"
                           />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="" className="mb-1 block font-thabit text-[.85rem]">
                               {t("message")}<sup>*</sup>
                           </label>
                           <textarea
                              required
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="h-[150px] w-full resize-none rounded-md border-[1.5px] p-2 outline-none focus:border-mainRed"
                           />{" "}
                        </div>
                        <CustomButton
                           type="submit"
                           variant="filled"
                           className="ml-auto min-w-[120px] justify-center text-center font-thabit font-bold text-white"
                         >
                            {t("sendMessage")}
                         </CustomButton>
                     </form>
                  </div>
               </div>
            </div>

             <TawkToWidget />

            <Footer />
         </div>
      </>
   );
};

export default Contact;
