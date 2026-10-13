import React, { useState } from "react";
import Head from "next/head";
import { FileText, Shield, Users, CheckCircle, Info } from "lucide-react";
import Navbar from "@/components/navbar/home/Navbar";

interface IType {
   privacy: boolean;
   terms: boolean;
   eula: boolean;
   coppa: boolean;
   dpa: boolean;
   parental: boolean;
}
interface ISection {
   children: React.ReactElement | React.ReactElement[];
   title: string;
   isSubsection?: boolean;
}
interface IAcceptButton {
   docType?: string;
   onAccept: () => void;
   accepted: boolean;
}

type DocType = "privacy" | "terms" | "eula" | "coppa" | "dpa" | "parental";

const CodeAlgoLegalDocs = () => {
   const [activeTab, setActiveTab] = useState<DocType>("privacy");
   const [acceptedDocs, setAcceptedDocs] = useState<IType>({
      privacy: false,
      terms: false,
      eula: false,
      coppa: false,
      dpa: false,
      parental: false,
   });

   const tabs: { id: DocType; label: string; icon: any }[] = [
      { id: "privacy", label: "Privacy Policy", icon: Shield },
      { id: "terms", label: "Terms of Service", icon: FileText },
      { id: "eula", label: "EULA", icon: FileText },
      { id: "coppa", label: "COPPA Compliance", icon: Users },
      { id: "dpa", label: "Data Privacy Agreement", icon: Shield },
      { id: "parental", label: "Parental Consent", icon: CheckCircle },
   ];

   const handleAccept = (docType: DocType) => {
      setAcceptedDocs((prev) => ({ ...prev, [docType]: true }));
   };

   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Privacy Policy | CodeAlgo Academy",
      description:
         "CodeAlgo Academy's privacy policy, terms of service, EULA, COPPA compliance, data privacy agreement, and parental consent.",
      url: "https://codealgoacademy.com/privacy-policy",
      isPartOf: {
         "@type": "WebSite",
         name: "CodeAlgo Academy",
         url: "https://codealgoacademy.com",
      },
   };

   return (
      <div className="min-h-screen bg-gray-50 ">
         <Head>
            <title>Privacy Policy | CodeAlgo Academy</title>
            <meta
               name="description"
               content="Read how CodeAlgo Academy protects children's data, including our privacy policy, terms of service, COPPA compliance, and parental consent."
            />
            <link rel="canonical" href="https://codealgoacademy.com/privacy-policy" />
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify(jsonLd),
               }}
            />
         </Head>
         <Navbar />
         <div className="sticky top-0 z-10 border-b bg-white">
            <div className="mx-auto max-w-7xl">
               <div className="flex overflow-x-auto">
                  {tabs.map((tab) => {
                     const Icon = tab.icon;
                     return (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 transition-colors ${
                              activeTab === tab.id
                                 ? "border-red-600 bg-red-50 text-red-600"
                                 : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                           }`}
                        >
                           <Icon className="h-4 w-4" />
                           {tab.label}
                           {acceptedDocs[tab.id] && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>
         <div className="mx-auto max-w-7xl p-6">
            <div className="rounded-lg bg-white p-8 shadow-sm">
               {activeTab === "privacy" && <PrivacyPolicy onAccept={() => handleAccept("privacy")} accepted={acceptedDocs.privacy} />}
               {activeTab === "terms" && <TermsOfService onAccept={() => handleAccept("terms")} accepted={acceptedDocs.terms} />}
               {activeTab === "eula" && <EULA onAccept={() => handleAccept("eula")} accepted={acceptedDocs.eula} />}
               {activeTab === "coppa" && <COPPACompliance onAccept={() => handleAccept("coppa")} accepted={acceptedDocs.coppa} />}
               {activeTab === "dpa" && <DataPrivacyAgreement onAccept={() => handleAccept("dpa")} accepted={acceptedDocs.dpa} />}
               {activeTab === "parental" && <ParentalConsent onAccept={() => handleAccept("parental")} accepted={acceptedDocs.parental} />}
            </div>
              <div className="mt-16 border-t border-gray-100 pt-10 text-center">
                  <div className="mx-auto max-w-2xl">
                     <Info className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                     <h4 className="text-lg font-bold text-gray-900 mb-2">Legal Acknowledgement</h4>
                     <p className="text-gray-600 leading-relaxed">
                        By using our site and accessing CodeAlgo Academy services, you acknowledge that you have read, 
                        understood, and agree to be bound by our 
                        <span className="font-semibold text-gray-900"> Terms of Service</span>, 
                        <span className="font-semibold text-gray-900"> Privacy Policy</span>, and 
                        <span className="font-semibold text-gray-900"> COPPA Compliance Statement</span>. 
                        Formal consent for student data collection is required during the account registration process.
                     </p>
                     <div className="mt-6">
                        <a href="/signup" className="inline-block rounded-full bg-red-600 px-8 py-3 font-semibold text-white hover:bg-red-700 transition-colors">
                           Get Started with CodeAlgo
                        </a>
                     </div>
                  </div>
               </div>
         </div>
      </div>
   );
};

const Section = ({ title, children, isSubsection = false }: ISection) => (
   <div className={`${isSubsection ? "ml-6" : ""} mb-6`}>
      <h3 className={`${isSubsection ? "text-lg" : "text-xl"} mb-3 font-bold text-mainRed`}>{title}</h3>
      <div className="space-y-3 text-gray-700">{children}</div>
   </div>
);


const PrivacyPolicy = ({ onAccept, accepted }: IAcceptButton) => (
   <div>
      <h2 className="mb-2 text-2xl font-bold text-mainRed">CodeAlgo Privacy Policy</h2>
      <p className="mb-6 text-sm text-gray-600">Last Updated: January 10, 2026</p>

      <Section title="Introduction">
         <p>
            This Privacy Policy describes how CodeAlgo, Inc. d/b/a CodeAlgo Academy, and our subsidiaries and affiliated companies (collectively,
            "CodeAlgo," "we," or "us") collect, use, and disclose information about you. This Privacy Policy applies to information we collect when
            you access or use our website, mobile applications, and other online products and services that link to this Privacy Policy (collectively,
            our "Services"), or when you otherwise interact with us.
         </p>
         <p>
            We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of this
            policy. We may also provide you with additional notice (such as by adding a statement to the Services or sending you a notification). We
            encourage you to review the Privacy Policy regularly to stay informed about our information practices and the choices available to you.
         </p>
      </Section>

      <Section title="Children's Information and COPPA Compliance">
         <div className="mb-4 border-l-4 border-mainColor bg-blue-50 p-4">
            <p className="font-semibold text-mainColor">Important: COPPA Compliance Statement</p>
            <p className="mt-2 text-mainColor">
               CodeAlgo does not knowingly collect any personally identifiable information from children under 13. While our games and lessons are
               used by children, they do not collect any personally identifiable information, and our website (www.codealgoacademy.com), and teacher
               dashboard (https://codealgoacademy.com/login/teacher and https://codealgoacademy.com/login/parent ) are intended for use solely by
               adults (parents and teachers).
            </p>
         </div>

         <p>
            Students who participate in games or lessons through the Service do not directly provide us with any information. For parents, teachers,
            website visitors, and representatives of schools, we collect information you provide directly to us. For example, we collect information
            when you create or edit a teacher or parent account, sign up students, invite teachers, make an appointment, fill out a form, make a
            purchase or order, apply for a job, request information or customer support, subscribe to a newsletter, respond to a survey, enter a
            contest, or otherwise communicate with us. The types of information we may collect in connection with parent and teacher accounts include
            your name, email address, postal address, phone number, student information, teacher, class, or administrator information, school
            information, payment information, and other information you choose to provide. Additionally, if you make a purchase, we work with a
            third-party payment processor to collect and process your payment information
         </p>
      </Section>
      <Section title="">
         <p>
            <strong>
               Information We Collect: Automatically When you access or use our Service, we automatically collect information
               about you, including:
            </strong>
         </p>
         <ul className="ml-6 list-disc space-y-2">
            <li>
               Log Information: We log information about your use of the Service, including the type of browser you use, access times, pages viewed,
               your IP address and the page you visited before navigating to our Service.3
            </li>
            <li>
               Device Information: We collect information about the computer or mobile device you use to access our Service, including the hardware
               model, operating system and version, unique device identifiers, app version.
            </li>
            <li>Progress Information: We automatically collect information about student progress on games and lessons.</li>
            <li>
               Information Collected by Cookies and Other Tracking Technologies: We use various technologies to collect information, and this may
               include sending cookies to your computer or mobile device. Cookies are small data files stored on your hard drive or in device memory
               that helps us to improve our Service and your experience, see which areas and features of our Service are popular and count visits. We
               may also collect information using web beacons (also known as “tracking pixels”). Web beacons are electronic images that may be used in
               our Service or emails and help deliver cookies, count visits, understand usage and campaign effectiveness and determine whether an
               email has been opened and acted upon. For more information about cookies, and how to disable them, please see “Your Choices” below
            </li>
            <li>
               Information We Collect From Other Sources We may also obtain information from other sources. For example, we may collect information
               from Student Information Systems vendors (“SIS”) and other education partners, such as Google Classroom. Additionally, if you create or
               log into your CodeAlgo account through a third-party platform (such as Google or Apple), we will have access to certain information
               from that platform, such as email address, in accordance with the authorization procedures determined by such platform
            </li>
         </ul>
      </Section>

      <Section title="">
         <p className="mt-4">
            <strong>Information We Derive:</strong> We may derive information or draw inferences about you based on the information we collect. For
            example, we may make inferences about your approximate location based on your IP address.
         </p>
         <p>Use of Information We may use information about you for various purposes, including to:</p>
         <ul className="ml-6 list-disc">
            <li>Provide, maintain, and improve our Service and provide customer support;</li>
            <li>
               Provide and deliver the products and services you request, process transactions, and send you related information, including
               confirmations and invoices;
            </li>
            <li>Send you technical notices, updates, security alerts, and support and administrative messages;</li>
            <li>Respond to your comments, questions, and requests and provide customer service;</li>
            <li>
               Communicate with you about products, services, offers, promotions, rewards, and events offered by CodeAlgo and others, and provide news
               and information we think will be of interest to you;
            </li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Service;</li>
            <li>
               Personalize the advertisements you see for CodeAlgo Services on third party platforms (for more information, see the Advertising and
               Analytics section below)
            </li>
            <li>
               Detect, investigate, and prevent fraudulent transactions and other illegal activities, and protect the rights and property of CodeAlgo
               and others;
            </li>
            <li>Personalize and improve the Service and provide content or features that match your interests;</li>
            <li>Link or combine with information we get from others to help understand your needs and provide you with better service; and</li>
            <li>Carry out any other purpose for which the information was collected.</li>
            <li>Device information (type, operating system)</li>
         </ul>
      </Section>

      <Section title="">
         <p>
            CodeAlgo is based in the United States and the information we collect is governed by U.S. law. By accessing or using the Service or
            otherwise providing information to us, you consent to the processing and transfer of information in and to the U.S. and other countries
         </p>
         <p className="mt-4">
            <strong>Sharing of Information: We may share information about you as follows or as otherwise described in this Privacy Policy:</strong>
         </p>
         <ul className="ml-6 list-disc">
            <li>
               With vendors, consultants and other service providers (including SIS vendors and education partners) who assist us in providing the
               Service and who are given access to such information for the purpose of carrying out such work on our behalf
            </li>
            <li>
               With teachers, administrators, or other school staff at your school (for teacher/school related accounts), including to alert users if
               there are other users at their school, to transfer user accounts to a new teacher or school contact at your school, to share student
               progress information and other dashboard information, or if you link your account;
            </li>
            <li>
               In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation or legal
               process, or as otherwise required by any applicable law, rule or regulation;
            </li>
            <li>
               If we believe your actions are inconsistent with the spirit or language of our user agreements or policies, or to protect the rights,
               property and safety of CodeAlgo or others;
            </li>
            <li>
               connection with, or during negotiations of, any merger, sale of company assets, financing or acquisition of all or a portion of our
               business to another company; and With your consent or at your direction, including if we notify you through our Sites that the
               information you provide will be shared in a particular manner and you provide such information
            </li>
         </ul>
      </Section>

      <Section title="">
         <p>We may also share aggregated or anonymized information that does not directly identify you.</p>
         <p>
            Advertising and Analytics Services Provided by Others: We may allow third parties to provide analytics services, and to serve
            advertisements on their platforms for the CodeAlgo Services. These entities may use cookies, web beacons, device identifiers and other
            technologies to collect information about your use of the Service and other websites, including your IP address, web browser, pages
            viewed, time spent on pages or in mobile apps, links clicked and conversion information. This information may be used by CodeAlgo and
            others to, among other things, analyze and track data, determine the popularity of certain content, deliver advertising for the CodeAlgo
            Services and better understand your online activity. Note that with respect to ads for CodeAlgo Services you may see on third party
            platforms, the third-party platforms may offer you choices about whether you see these types of customized ads
         </p>
         <p>
            {" "}
            Security: CodeAlgo takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access,
            disclosure, alteration and destruction.
         </p>
      </Section>

      <Section title="Your Choices: Account Information">
         <p>
            You may update, correct or delete information about you at any time by logging into your online account and editing your account
            information (under the View Account button). If you wish to delete your account, you may do so by logging into your online account and
            clicking on the Delete Account button (under the View Account button). Please note that we may retain certain information as required by
            law or for legitimate business purposes. We may also retain cached or archived copies of information about you for a certain period of
            time.
         </p>

         <p>
            Cookies Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or
            reject browser cookies. Please note that if you choose to remove or reject cookies, this could affect the availability and functionality
            of our Service. Promotional Communications You may opt out of receiving promotional emails from CodeAlgo by following the instructions in
            those emails. If you opt out, we may still send you non promotional communications, such as those about your account or our ongoing
            business relations.
         </p>

         <p>
            CodeAlgo does not sell your personal information. We do not knowingly sell personal information about consumers under the age of 16.
            Subject to certain limitations, you have the right to (1) request to know more about the categories and specific pieces of personal
            information we collect, use, and disclose, (2) request deletion of your personal information, (3) opt out of any “sales” of your personal
            information that may be occurring, and (4) not be discriminated against for exercising these rights. You may make these requests by
            emailing our designated email address at info@codealgoacademy.com. We will verify your request by asking you to provide information
            related to your recent interactions with us, such as confirming the email address associated with your profile or confirming your profile
            username. If we receive your request from an authorized agent and they do not provide a valid power of attorney, we may ask the authorized
            agent to provide proof that you gave the agent signed permission to submit the request to exercise rights on your behalf. In the absence
            of a valid power of attorney, we may also require you to verify your own identity directly with us or confirm to us that you otherwise
            provided the authorized agent permission to submit the request. If you are an authorized agent seeking to make a request, please email us
            at info@codealgoacademy.com.
         </p>
      </Section>

      <Section title="">
         <p>Contact Us If you have any questions about this Privacy Policy, please contact us at info@codealgoacademy.com.</p>
      </Section>
   </div>
);

const COPPACompliance = ({ onAccept, accepted }: IAcceptButton) => (
   <div>
      <h2 className="mb-6 text-2xl font-bold text-mainRed">COPPA Compliance Statement</h2>

      <div className="mb-6 border-l-4 border-blue-600 bg-blue-50 p-6">
         <h3 className="mb-2 text-lg font-bold text-blue-900">Our Commitment to Children's Privacy</h3>
         <p className="text-blue-800">
            At CodeAlgo, we take children's privacy very seriously. While our game is designed for children, our website
            (https://www.codealgoacademy.com) and teacher dashboard (https://codealgoacademy.com/login/teacher and
            https://codealgoacademy.com/login/parent) is just for adults (parents and teachers) over the age of 18. Our game does not collect any
            personally identifiable information from children.
         </p>
      </div>

      <Section title="What is COPPA?">
         <p>
            COPPA is a federal law that protects the privacy of children under 13 years of age. It requires operators of websites and online services
            to obtain verifiable parental consent before collecting, using, or disclosing personal information from children under 13.
         </p>
         <p className="">
            For more information about COPPA, visit{" "}
            <a href="https://www.coppa.org" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
               www.coppa.org
            </a>
         </p>
      </Section>

      <Section title="Data Deletion">
         <p>
            If we learn, we have collected personal information beyond what is permitted (such as a child's full name or contact details), we will
            delete it promptly upon discovery or notification.
         </p>
         <p className="mt-2">
            Parents may request deletion of their child's information at any time by contacting us at{" "}
            <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
               info@codealgoacademy.com
            </a>
         </p>
      </Section>

      <Section title="">
         <div className="border-l-4 border-amber-600 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">
               If you believe we have inadvertently collected personal information from a child under 13 without proper parental consent, please
               contact us immediately:
            </p>
            <p className="mt-2 text-amber-800">
               Email:{" "}
               <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
                  info@codealgoacademy.com
               </a>
            </p>
            <p className="text-amber-800">We will investigate and delete such data as soon as possible.</p>
         </div>
      </Section>

      <Section title="Contact Us">
         <div className="rounded bg-gray-50 p-4">
            <p>
               <strong>CodeAlgo, Inc.</strong>
            </p>
            <p>800 E 18th St</p>
            <p>Kansas City, MO 64108</p>
            <p>United States</p>
            <p>
               Email:{" "}
               <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
                  info@codealgoacademy.com
               </a>
            </p>
         </div>
      </Section>
   </div>
);

const DataPrivacyAgreement = ({ onAccept, accepted }: IAcceptButton) => (
   <div>
      <h2 className="mb-2 text-2xl font-bold text-mainRed">Data Privacy Agreement (DPA)</h2>
      <p className="mb-6 text-sm text-gray-600">For Educational Institutions</p>

      <div className="mb-6 border-l-4 border-mainRed bg-mainRed/10 p-6">
         <h3 className="mb-2 text-lg font-bold text-mainRed">DPA Review Process</h3>
         <p className="text-mainRed">
            Many school districts require a Data Privacy Agreement (DPA) before approving new products for student use. If you have a DPA to submit
            for review, please complete our review form or contact us directly.
         </p>
      </div>

      <Section title="Agreement Overview">
         <p>
            This Data Privacy Agreement ("DPA") is entered into between CodeAlgo, Inc. ("Provider" or "CodeAlgo") and the educational institution or
            organization ("Educational Institution" or "School") that accesses CodeAlgo's services.
         </p>
         <p className="mt-2">
            This DPA supplements and is incorporated into the Terms of Service and governs the Provider's access to, collection, use, maintenance, and
            sharing of student data.
         </p>
      </Section>

      <Section title="1. Definitions">
         <p>
            <strong>Student Data:</strong> Any information that is directly related to an identifiable current or former student that is maintained by
            the School or acquired by the Provider from the School or its students.
         </p>

         <p className="mt-2">
            <strong>De-Identified Data:</strong> Data from which all personally identifiable information has been removed and cannot reasonably be
            used to identify a specific individual.
         </p>

         <p className="mt-2">
            <strong>Authorized Purpose:</strong> Educational purposes as defined by applicable laws including FERPA, COPPA, and state privacy laws.
         </p>
      </Section>

      <Section title="2. Provider's Responsibilities">
         <p>The Provider agrees to:</p>
         <ul className="ml-6 list-disc space-y-2">
            <li>Collect and process Student Data only for Authorized Purposes</li>
            <li>Not sell Student Data to any third party</li>
            <li>Not use Student Data for targeted advertising</li>
            <li>Not build advertising profiles based on Student Data</li>
            <li>Implement and maintain reasonable security measures to protect Student Data</li>
            <li>Comply with FERPA, COPPA, and all applicable state student privacy laws</li>
            <li>Delete or return Student Data upon request or termination of services</li>
            <li>Provide transparency about data collection and use practices</li>
         </ul>
      </Section>

      <Section title="3. Student Data We Collect">
         <p>
            <strong>Directly from Schools:</strong>
         </p>
         <ul className="ml-6 list-disc">
            <li>Student first names, initial, or usernames (NOT full names)</li>
            <li>Grade level or class assignment</li>
            <li>School and teacher information</li>
            <li>Teacher can provide student's school email</li>
         </ul>

         <p className="mt-3">
            <strong>Automatically During Use:</strong>
         </p>
         <ul className="ml-6 list-disc">
            <li>Learning progress and performance data</li>
            <li>Time spent on activities</li>
            <li>Device type and operating system</li>
         </ul>

         <p className="mt-3 font-semibold">We do NOT collect:</p>
         <ul className="ml-6 list-disc">
            <li>Student phone numbers, or home addresses</li>
            <li>Social security numbers or government identifiers</li>
            <li>Biometric data</li>
            <li>Precise geolocation</li>
         </ul>
      </Section>

      <Section title="4. Use of Student Data">
         <p>Student Data will be used only to:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Provide educational services to students</li>
            <li>Track learning progress and provide feedback</li>
            <li>Improve educational content and user experience</li>
            <li>Support teachers in monitoring student achievement</li>
            <li>Comply with legal obligations</li>
            <li>Protect the safety and security of our services</li>
         </ul>
      </Section>

      <Section title="5. Disclosure of Student Data">
         <p>The Provider will not disclose Student Data except:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>To authorized school personnel (teachers, administrators)</li>
            <li>To parents/guardians (for their own child's data)</li>
            <li>To service providers under confidentiality agreements</li>
            <li>As required by law or court order</li>
            <li>With explicit consent from the School</li>
         </ul>
      </Section>

      <Section title="6. Data Security">
         <p>The Provider implements security measures including:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication systems</li>
            <li>Regular security audits and assessments</li>
            <li>Employee training on data privacy</li>
            <li>Incident response procedures</li>
         </ul>
      </Section>

      <Section title="7. Data Breach Notification">
         <p>
            In the event of a security breach that compromises Student Data, the Provider will notify the School within 72 hours of discovery and
            provide:
         </p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Description of the breach</li>
            <li>Type of data affected</li>
            <li>Steps taken to secure data</li>
            <li>Recommended actions for the School</li>
         </ul>
      </Section>

      <Section title="8. Data Retention and Deletion">
         <p>
            Student Data will be retained only as long as necessary to provide services or as required by law. The School may request deletion of
            Student Data at any time, and the Provider will comply within 30 days.
         </p>
         <p className="mt-2">
            Upon termination of services, the Provider will delete or return all Student Data within 90 days unless required by law to retain longer.
         </p>
      </Section>

      <Section title="9. Parental Rights">
         <p>Parents have the right to:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Access their child's Student Data</li>
            <li>Request corrections to inaccurate data</li>
            <li>Request deletion of their child's data</li>
            <li>Receive copies of their child's data</li>
         </ul>
         <p className="mt-2">
            Requests should be directed through the School or to{" "}
            <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
               info@codealgoacademy.com
            </a>
         </p>
      </Section>

      <Section title="10. Compliance with Laws">
         <p>This DPA ensures compliance with:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Family Educational Rights and Privacy Act (FERPA)</li>
            <li>Children's Online Privacy Protection Act (COPPA)</li>
            <li>Protection of Pupil Rights Amendment (PPRA)</li>
            <li>State student privacy laws</li>
            <li>General Data Protection Regulation (GDPR) where applicable</li>
         </ul>
      </Section>

      <Section title="11. Submitting Your DPA for Review">
         <p>
            If your school district has specific DPA requirements, we welcome the opportunity to review and sign your agreement. Please submit your
            DPA to:
         </p>
         <div className="mt-2 rounded bg-gray-50 p-4">
            <p>
               <strong>Email:</strong>{" "}
               <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
                  info@codealgoacademy.com
               </a>
            </p>
            <p className="mt-1">
               <strong>Subject Line:</strong> DPA Review Request - [Your School District Name]
            </p>
         </div>
         <p className="mt-3">Our team will review and respond within 5-10 business days.</p>
      </Section>

      <Section title="Contact Information">
         <div className="rounded bg-gray-50 p-4">
            <p>
               <strong>CodeAlgo, Inc.</strong>
            </p>
            <p>800 E 18th St</p>
            <p>Kansas City, MO 64108</p>
            <p>United States</p>
            <p>
               Email:{" "}
               <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
                  info@codealgoacademy.com
               </a>
            </p>
         </div>
      </Section>

   </div>
);

const ParentalConsent = ({ onAccept, accepted }: IAcceptButton) => (
   <div>
      <h2 className="mb-6 text-2xl font-bold text-mainRed">Parental Consent Form</h2>

      <div className="mb-6 border-l-4 border-mainColor bg-mainColor/10 p-6">
         <h3 className="mb-2 text-lg font-bold text-mainColor">Important Information for Parents</h3>
         <p className="text-mainColor">
            Before your child uses CodeAlgo Academy, please read this consent form carefully. Your consent confirms that you understand how we protect
            your child's privacy and what information we collect.
         </p>
      </div>

      <Section title="Introduction">
         <p>
            CodeAlgo Academy provides educational coding games and lessons for children. We are committed to protecting your child's privacy and
            complying with the Children's Online Privacy Protection Act (COPPA).
         </p>
         <p className="mt-2">This form explains what information we collect, how we use it, and your rights as a parent.</p>
      </Section>

      <Section title="Information We Collect">
         <p>
            <strong>Parent/Guardian Account Information:</strong>
         </p>
         <p>When you create an account, we collect:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Your name and email address</li>
            <li>Payment information (if subscribing)</li>
            <li>Your child's full name with first name and last initials or nickname</li>
         </ul>

         <p className="mt-4">
            <strong>Your Child's Learning Information:</strong>
         </p>
         <p>As your child uses our games, we automatically collect:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Progress through lessons and games</li>
            <li>Scores and completion status</li>
            <li>Time spent on activities</li>
         </ul>

         <p className="mt-4 font-semibold">We DO NOT collect from your child:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Home address</li>
            <li>School name (unless provided by you)</li>
            <li>Photographs or videos</li>
            <li>Location information</li>
         </ul>
      </Section>

      <Section title="How We Use This Information">
         <p>We use your child's learning information to:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Show you your child's progress</li>
            <li>Customize learning experiences</li>
            <li>Improve our educational content</li>
            <li>Provide customer support</li>
         </ul>
      </Section>

      <Section title="Your Rights as a Parent">
         <p>As a parent or legal guardian, you have the right to:</p>
         <ul className="ml-6 list-disc space-y-2">
            <li>
               <strong>Review</strong> your child's information at any time through your parent dashboard
            </li>
            <li>
               <strong>Request changes</strong> to any incorrect information
            </li>
            <li>
               <strong>Delete</strong> your child's account and all associated information
            </li>
            <li>
               <strong>Refuse</strong> to allow further collection of your child's information
            </li>
            <li>
               <strong>Download</strong> a copy of your child's learning data
            </li>
         </ul>
         <p className="mt-3">
            To exercise any of these rights, log into your parent account or email us at{" "}
            <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
               info@codealgoacademy.com
            </a>
         </p>
      </Section>

      <Section title="">
         <p>
            When we provide services on behalf of a school, CodeAlgo acts as a data processor and, under FERPA, as a "school official." The school
            provides consent for us to collect and process information from students under the age of 13, as permitted by the Children's Online
            Privacy Protection Act (COPPA). We collect, maintain, use, and share student records only for authorized educational purposes
         </p>
         <p className="mt-2">
            If we learn we have collected information beyond what is permitted (such as a child’s full name or contact details), we will delete it
            promptly.
         </p>
      </Section>

      <Section title="Data Security">
         <p>We take your child's privacy seriously and implement strong security measures including:</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>Encrypted data storage and transmission</li>
            <li>Secure login systems</li>
            <li>Regular security audits</li>
            <li>Limited employee access to student data</li>
            <li>No third-party advertising or tracking</li>
         </ul>
      </Section>

      <Section title="Questions or Concerns">
         <p>If you have questions about your child's privacy or how we handle information, please contact us:</p>
         <div className="mt-2 rounded bg-gray-50 p-4">
            <p>
               <strong>CodeAlgo, Inc.</strong>
            </p>
            <p>800 E 18th St</p>
            <p>Kansas City, MO 64108</p>
            <p>United States</p>
            <p>
               Email:{" "}
               <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
                  info@codealgoacademy.com
               </a>
            </p>
            <p className="mt-2 text-sm text-gray-600">We will respond to all inquiries within 2 business days.</p>
         </div>
      </Section>

      <Section title="Parental Consent Statement">
         <div className="rounded-lg border-2 border-gray-300 bg-gray-100 p-6">
            <p className="mb-3 font-semibold">By accepting this consent form, I confirm that:</p>
            <ul className="space-y-2">
               <li>☐ I am the parent or legal guardian of the child who will use CodeAlgo Academy</li>
               <li>☐ I have read and understood this Parental Consent Form</li>
               <li>☐ I have reviewed the Privacy Policy and COPPA Compliance Statement</li>
               <li>☐ I understand what information will be collected from my child</li>
               <li>☐ I understand how this information will be used</li>
               <li>☐ I consent to the collection and use of my child's information as described</li>
               <li>☐ I understand my rights and how to exercise them</li>
               <li>☐ I understand I can withdraw this consent at any time by deleting my child's account</li>
            </ul>
         </div>
      </Section>
   </div>
);

const TermsOfService = ({ onAccept, accepted }: IAcceptButton) => (
   <div>
      <h2 className="mb-2 text-2xl font-bold text-mainRed">Terms of Service</h2>
      <p className="mb-6 text-sm text-gray-600">Last Updated: January 10, 2026</p>

      <Section title="Introduction">
         <p>
            CodeAlgo,Inc. d/b/a CodeAlgo Academy (“CodeAlgo,” “we,” “us,” or “our”) welcomes you. We invite you to access and use our online platform
            (the “Platform”), which is made available to you through our website located at https://codealgoacademy.com/ (the “Website”).
         </p>
         <p>
            We provide Teachers and Parents (all as defined below) access to our Platform subject to the following Terms of Service. Please read these
            Terms of Service carefully. By clicking “I ACCEPT,” signing up for an account, or accessing the Platform, you acknowledge that you have
            read, understood, and agree to be legally bound by these Terms of Service and our Privacy Policy, which is hereby incorporated by
            reference (collectively, this “Agreement”). If you do not agree to any of these terms, then please do not use the Platform
         </p>
         <p>
            We may modify this Agreement from time to time in which case we will notify you of the changes (e.g., via the Platform or e-mail). Your
            continued use of the Platform after receiving notice will constitute your acceptance of the changes.
         </p>
         <p className="mt-2">
            You consent and agree that your clicking of the “I Accept” button constitutes your electronic signature, acceptance, and agreement under
            the United States federal E-SIGN legislation and that such electronic signature will meet the requirements of an original signature as if
            actually signed by you in writing. Further, you agree that no certification authority or other third-party verification is necessary to
            the enforceability of your signature. At our request, any electronically signed document must be re-executed in original form by you. No
            party hereto may raise the use of an electronic signature as a defense to the enforcement of this Agreement or any amendment or other
            document executed in compliance with this Agreement.
         </p>
         <p>Capitalized terms not defined in these Terms of Service shall have the meaning set forth in our Privacy Policy.</p>
      </Section>

      <Section title="DESCRIPTION AND USE OF THE PLATFORM">
         <p>We provide Teachers and Parents access to the Platform as described below</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>
               <strong>Administrators:</strong>Login is required for all Administrators. Administrators can create and manage their Teachers’ accounts
               and access the student accounts associated with those Teachers.
            </li>
            <li>
               <strong>Teachers:</strong>Login is required for all Teachers. Teachers can: (a) create, access, manage, and update their own personal
               account; (b) create a class and add students to the class; (c) keep track of the students’ progress (track what students are learning,
               how many lessons they have completed, where they need help); and (d) access and use the curriculum provided by CodeAlgo, including but
               not limited to, the basic programming concepts, lesson plans, and vocabulary and learning guides (collectively, “CodeAlgo Curriculum”)
               for which they have subscribed
            </li>
            <li>
               <strong>Parents:</strong>Login is required for all Parents. Parents can: (a) create, access, manage, and update their own personal
               account; (b) add children to the account; (c) keep track of the child’s progress (track what the child is learning, how many lessons
               the child has completed, where the child needs help); and (d) access and use the CodeAlgo Curriculum for which they have subscribed
            </li>
         </ul>
         <p>
            CodeAlgo is under no obligation to accept any individual as a Teacher or Parent, and may accept or reject any registration in its sole and
            complete discretion. In addition, CodeAlgo may deactivate any account at any time, including, without limitation, if it determines that a
            Teacher or Parent has violated these Terms of Service.
         </p>
      </Section>

      <Section title="GUIDELINES">
         <p>By accessing and/or using the Platform, you agree to comply with the following guidelines (the “Guidelines”):</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>
               The Platform is available only for individuals aged 18 years or older. If you are under 18, please do not use the Platform. By access
               and using the Platform, you represent and warrant that you are at least 18. For the sake of clarity, there is no age restriction
               regarding the use of any CodeAlgo games
            </li>
            <li>You will comply with all applicable laws in your use of the Platform and will not use the Platform for any unlawful purpose</li>
            <li>
               You will not upload, post, e-mail, transmit, or otherwise make available any content that:
               <li>infringes any copyright, trademark, right of publicity, or other proprietary rights of any person or entity; or</li>
               <li>
                  is defamatory, libelous, indecent, obscene, pornographic, sexually explicit, invasive of another’s privacy, promotes violence, or
                  contains hate speech (i.e., speech that attacks or demeans a group based on race or ethnic origin, religion, disability, gender,
                  age, veteran status, and/or sexual orientation/gender identity; o
               </li>
               <li>
                  discloses any sensitive information about another person, including that person’s e-mail address, postal address, phone number,
                  credit card information, or any similar information
               </li>
            </li>
            <li>
               You will not impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity;
            </li>
            <li>
               You will not interfere with or attempt to interrupt the proper operation of the Platform through the use of any virus, device,
               information collection or transmission mechanism, software or routine, or access or attempt to gain access to any data, files, or
               passwords related to the Platform through hacking, password or data mining, or any other means
            </li>
            <li>
               You will not use any robot, spider, scraper, or other automated means to access the Platform for any purpose without our express
               written permission; provided, however, we grant the operators of public search engines permission to use spiders to copy materials from
               the public portions of the Website for the sole purpose of and solely to the extent necessary for creating publicly-available
               searchable indices of the materials, but not caches or archives of such materials;
            </li>
            <li>
               You will not take any action that imposes or may impose (in our sole discretion) an unreasonable or disproportionately large load on
               our technical infrastructure; and
            </li>
            <li>
               You will let us know about inappropriate content of which you become aware. If you find something that violates our Guidelines, please
               let us know, and we’ll review it. We reserve the right, in our sole and absolute discretion, to deny you access to the Platform without
               notice, and to remove any content that does not adhere to these Guidelines.
            </li>
         </ul>
      </Section>

      <Section title="SIGN-IN NAME; PASSWORD">
         <p>
            During the registration process for Teachers and Parents, we will ask you to create an account, which includes your name, an email address
            (“Sign-In Name”), and a password (“Password”). When creating your account, you must provide true, accurate, current, and complete
            information. Each Sign-In Name and corresponding Password can be used by only one Teacher or Parent. You are solely responsible for the
            confidentiality and use of your Sign-In Name, and Password, as well as for any use, misuse, or communications entered through the Platform
            using one or more of them. You will promptly inform us of any need to deactivate a Password or Sign-In Name. We reserve the right to
            delete or change your Password, or Sign-In Name at any time and for any reason and shall have no liability to you for any loss or damage
            caused by such action. CodeAlgo will not be liable for any loss or damage caused by any unauthorized use of your account.
         </p>
      </Section>

      <Section title="FEES; PAYMENT">
         <p>
            If you elect to upgrade from a free account to a paid account, you agree to pay all the applicable fees made known to you (“Fees”). We may
            use a third party service provider (“Third Party Service Provider”) to process payment of such Fees. You warrant and represent that you
            are the valid owner or an authorized user, of the credit card you provide to process your payment, and that all information is accurate.
            We reserve the right to change any of the Fees that we charge, or to institute new or additional Fees, at any time upon notice to you. No
            refunds or credits for Subscription Charges or other fees or payments will be provided to the Client if the Client elects to downgrade the
            Platform plan. Downgrading the plan may cause loss of content, features, or capacity of the Platform as available to the Client under your
            account, and CodeAlgo does not accept any liability for such loss
         </p>
      </Section>

      <Section title="SCHOOL SUBSCRIPTION LICENSES AND USAGE">
         <p>
            A "Subscription License" refers specifically to our paid Premium subscriptions, which grant the right to use CodeAlgo's paid features for
            a defined group of students at a single physical campus or site of an educational institution or organization. The use of CodeAlgo's free
            version in schools is not subject to these Subscription License terms but remains governed by all other applicable sections of these Terms
            of Service.
         </p>
         <p>
            Subscription License and Site Requirements: Customers must purchase separate Subscription Licenses for each distinct physical campus or
            site, even if these are part of the same educational institution or organization. CodeAlgo reserves the right to determine what
            constitutes a separate physical campus or site requiring its own Subscription License. Factors may include, but are not limited to,
            geographic distance between locations, separate administration or management, and whether the locations operate as distinct units
         </p>
         <p>
            Online and Virtual School Usage: Customers using CodeAlgo's paid features in an online or virtual school setting must purchase a Premium
            Subscription License and notify us in writing of their intended enrollment, unless the online program is administered from and exclusively
            serves students at a single physical campus already covered by a Premium Subscription License
         </p>
         <p>
            Subscription License Restrictions: Each Subscription License is specific to the physical campus or site for which it was purchased and may
            not be shared or transferred between campuses, sites, or settings without prior written consent from CodeAlgo. Customers are responsible
            for ensuring they have the appropriate number and type of Subscription Licenses for their usage of CodeAlgo's paid features across all
            their physical campuses or sites. Failure to comply with these Subscription License terms may result in termination of paid services or
            additional fees.
         </p>
         <p>
            Audits: CodeAlgo reserves the right to audit customer usage to ensure compliance with these Subscription License terms. Customers agree to
            cooperate with any such audit and provide necessary information upon request, including details about their physical campuses or sites.
         </p>
         <p>
            Subscription License Modifications: CodeAlgo reserves the right to modify the terms of its Subscription Licensing structure upon notice to
            customers. Continued use of the paid services after such notice constitutes acceptance of the new terms
         </p>
         <p>
            rohibition of Resale and Unauthorized Distribution: Subscription Licenses may not be resold, sublicensed, or distributed to third parties
            without explicit written permission from CodeAlgo. This includes, but is not limited to: 1. Purchasing a single license for use by
            multiple unaffiliated educational institutions or organizations. 2. Using a single license to provide CodeAlgo as curriculum or content
            for large-scale online education platforms or programs serving students beyond the scope of the licensed institution or organization. 3.
            Sharing access to CodeAlgo's paid features with individuals or groups not covered by the purchased Subscription License. Any use of
            CodeAlgo's services that exceeds the scope of the purchased Subscription License or attempts to circumvent licensing requirements is
            strictly prohibited. CodeAlgo reserves the right to terminate services and pursue legal action in cases of unauthorized distribution or
            misuse of its products.
         </p>
         <p>
            Special Circumstances: Customers with unique organizational structures (including non-school organizations) or special circumstances that
            may affect licensing requirements are encouraged to contact CodeAlgo for clarification. CodeAlgo reserves the right to make final
            determinations on licensing requirements for such cases
         </p>
      </Section>

      <Section title="INTELLECTUAL PROPERTY">
         <p>
            The Platform contains material, such as photographs, videos, software, text, graphics, images, sound recordings, CodeAlgo Curriculum, and
            other material provided by or on behalf of CodeAlgo (collectively referred to as the “Content”). The Content may be owned by us, or other
            third parties. The Content is protected under both United States and foreign laws. Unauthorized use of the Content may violate copyright,
            trademark, and other laws. You have no rights in or to the Content, and you will not use the Content except as permitted under this
            Agreement and the functionality of the Platform. No other use is permitted without prior written consent from us. You must retain all
            copyright and other proprietary notices contained in the original Content. You may not sell, transfer, assign, license, sublicense, or
            modify the Content or reproduce, display, publicly perform, make a derivative version of, distribute, or otherwise use the Content in any
            way for any public or commercial purpose. The use or posting of the Content on any other website or in a networked computer environment
            for any purpose is expressly prohibited.
         </p>
         <p>
            If you violate any part of this Agreement, your permission to access and/or use the Content and the Platform automatically terminates and
            you must immediately destroy any copies you have made of the Content
         </p>

         <p>
            The trademarks, service marks, and logos of CodeAlgo (“CodeAlgo Trademarks”) used and displayed on the Platform are registered and
            unregistered trademarks or service marks of CodeAlgo. Other company, product, and service names located on the Platform may be trademarks
            or service marks owned by others (the “ThirdParty Trademarks,” and, collectively with CodeAlgo Trademarks, the “Trademarks”). Nothing on
            the Platform should be construed as granting, by implication, estoppel, or otherwise, any license or right to use the Trademarks, without
            our prior written permission specific for each such use. Use of the Trademarks as part of a link to or from any site is prohibited unless
            establishment of such a link is approved in advance by us in writing. All goodwill generated from the use of CodeAlgo Trademarks inures to
            our benefit
         </p>

         <p>
            Elements of the Platform are protected by trade dress, trademark, unfair competition, and other state and federal laws and may not be
            copied or imitated in whole or in part, by any means, including, but not limited to, the use of framing or mirrors. None of the Content
            may be retransmitted without our express, written consent for each and every instance.
         </p>
      </Section>

      <Section title="COMMUNICATIONS WITH US">
         <p>
            Although we encourage you to e-mail us, we do not want you to, and you should not, e-mail us any content that contains confidential
            information. With respect to all e-mails and communications you send to us, including, but not limited to, feedback, questions, comments,
            suggestions, and the like, we shall be free to use any ideas, concepts, know-how, or techniques contained in your communications for any
            purpose whatsoever, including but not limited to, the development, production, and marketing of products and services that incorporate
            such information without compensation or attribution to you.
         </p>
      </Section>

      <Section title="NO WARRANTIES; LIMITATION OF LIABILITY">
         <p>
            THE PLATFORM, THE WEBSITE, AND THE CONTENT ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT ANY WARRANTIES OF ANY KIND. TO THE
            MAXIMUM EXTENT PERMITTED BY APPLICABLE LAWS, WE DISCLAIM ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE WARRANTY OF TITLE,
            MERCHANTABILITY, NONINFRINGEMENT OF THIRD PARTIES’ RIGHTS, AND FITNESS FOR PARTICULAR PURPOSE. YOU AGREE THAT YOU USE THE WEBSITE, THE
            PLATFORM, AND THE CONTENT AT YOUR OWN RISK
         </p>
         <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAWS, IN NO EVENT SHALL WE BE LIABLE FOR ANY DAMAGES WHATSOEVER (INCLUDING, WITHOUT
            LIMITATION, INCIDENTAL AND CONSEQUENTIAL DAMAGES, LOST PROFITS, OR DAMAGES RESULTING FROM LOST DATA OR BUSINESS INTERRUPTION) RESULTING
            FROM THE USE, INABILITY TO USE, DISCLOSURE, DISPLAY, OR MAINTENANCE OF THE PLATFORM, THE WEBSITE, OR THE CONTENT, WHETHER BASED ON
            WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH
            DAMAGES.
         </p>
      </Section>

      <Section title="EXTERNAL SITES">
         <p>
            The Platform may contain links to third-party websites (“External Sites”). These links are provided solely as a convenience to you and not
            as an endorsement by us of the content on such External Sites. The content of such External Sites is developed and provided by others. You
            should contact the site administrator or webmaster for those External Sites if you have any concerns regarding such links or any content
            located on such External Sites. We are not responsible for the content of any linked External Sites and do not make any representations
            regarding the content or accuracy of materials on such External Sites. You should take precautions when downloading files from all
            websites to protect your computer from viruses and other destructive programs. If you decide to access linked External Sites, you do so at
            your own risk.
         </p>
      </Section>

      <Section title="REPRESENTATIONS; WARRANTIES; AND INDEMNIFICATION">
         <div>
            (a) If you are a Teacher, you hereby represent, warrant, and covenant that:
            <ul>
               <li>
                  You are authorized by the school in which the student is enrolled or by the parent of the student to add the student to your class
               </li>
               <li>
                  You are authorized by the school in which the student is enrolled or by the parent of the student to permit CodeAlgo to create a
                  student profile on behalf of the student;
               </li>
               <li>
                  You will not enroll your students using their full names and will use only first names, nicknames, or some other identifiers that do
                  not constitute personal information under the Children’s Online Privacy and Protection Act (“COPPA”); and
               </li>
               <li>
                  You have the authorization and permission from your school to use the Platform as part of your curriculum, and you represent and
                  warrant that you are accepting this Agreement on behalf of your school
               </li>
            </ul>
         </div>
         <div>
            (b) You agree to defend, indemnify, and hold us and our officers, directors, employees, agents, successors, licensees, and assigns
            harmless from and against any claims, actions, or demands, including, without limitation, reasonable legal and accounting fees, arising or
            resulting from:
            <ul>
               <li>your breach of this Agreement;</li>
               <li>your access to, use or misuse of the Content, or the Platform, and</li>
               <li>
                  your violation of any third-party right, including without limitation any copyright, trademark, property, or privacy right. We shall
                  provide notice to you of any such claim, suit, or proceeding and shall assist you, at your expense, in defending any such claim,
                  suit, or proceeding. We reserve the right to assume the exclusive defense and control of any matter that is subject to
                  indemnification under this section. In such case, you agree to cooperate with any reasonable requests assisting our defense of such
                  matter.
               </li>
            </ul>
         </div>
      </Section>

      <Section title="COMPLIANCE WITH APPLICABLE LAWS">
         <p>
            The Website and the Platform are based in the United States. We make no claims concerning whether the Content may be downloaded, viewed,
            or be appropriate for use outside of the United States. If you access the Website, the Platform, or the Content from outside of the United
            States, you do so at your own risk. Whether inside or outside of the United States, you are solely responsible for ensuring compliance
            with the laws of your specific jurisdiction.
         </p>
      </Section>
      <Section title="TERMINATION OF THE AGREEMENT">
         <p>
            We reserve the right, in our sole discretion, to restrict, suspend, or terminate this Agreement and your access to all or any part of the
            Platform, at any time and for any reason without prior notice or liability. We reserve the right to change, suspend, or discontinue all or
            any part of the Platform at any time without prior notice or liability.
         </p>
      </Section>
      <Section title="MISCELLANEOUS">
         <p>
            This Agreement is governed by the internal substantive laws of the State of Missouri, without respect to its conflict of laws provisions.
            You expressly agree to submit to the exclusive personal jurisdiction of the state and federal courts sitting in the State of Missouri. YOU
            AGREE THAT, UNLESS CONTRARY TO ANY APPLICABLE LAW, ANY CAUSE OF ACTION ARISING OUT OF OR RELATED TO THE PLATFORM, THE WEBSITE, OR THIS
            AGREEMENT MUST BE COMMENCED BY YOU WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ACCRUES, OTHERWISE SUCH CAUSE OF ACTION IS PERMANENTLY
            BARRED. If any provision of this Agreement is found to be invalid by any court having competent jurisdiction or terminated in accordance
            with the Termination provision above, the invalidity or termination of such provision shall not affect the validity of the following
            provisions of this Agreement, which shall remain in full force and effect: “Intellectual Property,” “Communications with Us,” “No
            Warranties; Limitation of Liability,” “Representations; Warranties; and Indemnification,” “Termination of the Agreement,” and
            “Miscellaneous.” Our failure to act on or enforce any provision of the Agreement shall not be construed as a waiver of that provision or
            any other provision in this Agreement. No waiver shall be effective against us unless made in writing, and no such waiver shall be
            construed as a waiver in any other or subsequent instance. Except as expressly agreed by us and you in writing, this Agreement constitutes
            the entire Agreement between you and us with respect to the subject matter, and supersedes all previous or contemporaneous agreements,
            whether written or oral, between the parties with respect to the subject matter. The section headings are provided merely for convenience
            and shall not be given any legal import. This Agreement will inure to the benefit of our successors, assigns, licensees, and sublicensees.
         </p>
      </Section>

      <Section title="Contact Information">
         <div className="rounded bg-gray-50 p-4">
            <p>
               <strong>CodeAlgo, Inc.</strong>
            </p>
            <p>800 E 18th St</p>
            <p>Kansas City, MO 64108</p>
            <p>United States</p>
            <p>
               Email:{" "}
               <a href="mailto:info@codealgoacademy.com" className="text-red-600 hover:underline">
                  info@codealgoacademy.com
               </a>
            </p>
         </div>
      </Section>
   </div>
);

const EULA = ({ onAccept, accepted }: IAcceptButton) => (
   <div>
      <h2 className="mb-6 text-2xl font-bold text-mainRed">End-User License Agreement (EULA)</h2>

      <div className="mb-6 border-l-4 border-red-600 bg-red-50 p-4">
         <p className="font-semibold text-red-900">IMPORTANT! PLEASE READ CAREFULLY.</p>
         <p className="mt-2 text-red-800">
            This End-User License Agreement (“EULA”) is a legal agreement between you (“You”) and CodeAlgo,Inc. d/b/a CodeAlgo Academy (“CodeAlgo”).
            Please read this EULA carefully before installing, accessing or utilizing the CodeAlgo game (“CodeAlgo Game”), because by installing it,
            clicking “I Agree,” or otherwise manifesting your assent to this EULA, You agree to be bound by the terms of this EULA. If you are under
            age 18, please: (i) have your parent or legal guardian review this EULA; and (ii) do not install or play the CodeAlgo Game without the
            permission of your parent, legal guardian, or teacher
         </p>
      </div>

      <Section title="">
         <p>
            For the purposes of this EULA, the CodeAlgo Game is defined to include the object code for the CodeAlgo Game; the data, databases, and
            data structures incorporated into the CodeAlgo Game; all associated media and printed materials; online or electronic documentation; and
            any updates and upgrades that replace or supplement the CodeAlgo Game that are not distributed with a separate license
         </p>
      </Section>

      <Section title="License Grant.">
         <p>
            The CodeAlgo Game is licensed, not sold. CodeAlgo grants you a personal, non-transferable, and non-exclusive limited license to install
            and use the CodeAlgo Game for your personal use.
            This license does not give you any title or ownership in the CodeAlgo Game, and should
            not be construed as a sale or transfer of any intellectual property or other rights to the CodeAlgo Game. All rights not specifically
            granted under this EULA are hereby reserved by CodeAlgo and, as applicable, by its licensors
         </p>
      </Section>

      <Section title="Intellectual Property">
         <p>
            CodeAlgo owns all right, title, and interest in and to, or is duly licensed under or otherwise authorized to use by its suppliers, the
            CodeAlgo Game and all intellectual property rights in and to the CodeAlgo Game. No license or other right is granted herein except for the
            rights specifically set forth herein. By using the CodeAlgo Game, You (i) acknowledge, and agree not to contest, CodeAlgo’s proprietary
            rights in the CodeAlgo Game; and (ii) agree not to disclose any confidential information of CodeAlgo regarding the CodeAlgo Game
            (including the CodeAlgo Game itself) or that is otherwise disclosed to You in connection with this EULA, unless such disclosure is
            expressly allowed by this EULA.
         </p>
      </Section>

      <Section title="Restrictions">
         <p>You may not (and you may not permit any third party to):</p>
         <ul className="ml-6 list-disc space-y-1">
            <li>
               Reverse engineer, decompile, disassemble, or otherwise attempt to discern the source code, underlying ideas, algorithms, file formats,
               or interface protocols of the CodeAlgo Game or of any files contained in or generated by the CodeAlgo Game, except and only to the
               extent that such activity is expressly permitted by applicable law notwithstanding this limitation.
            </li>
            <li>Rent, lease, license, sell, or lend the CodeAlgo Game.</li>
            <li>
               modify, adapt, or translate the CodeAlgo Game, incorporate the CodeAlgo Game into or with other software, or create derivative works
               based upon any part of the CodeAlgo Game, including, but not limited to, any database or other content contained in the CodeAlgo Game
               without the prior written permission of CodeAlgo in each instance.
            </li>
            <li>Remove or alter any copyright notices, product identification, or other notices on any copies of the CodeAlgo Game.</li>
         </ul>
         <p>
            Any failure to comply with the above or any other terms and conditions contained herein will result in the automatic termination of this
            license and the reversion of the rights granted to You hereunder to CodeAlgo
         </p>
      </Section>

      <Section title="Disclaimer of Warranty">
         <p>
            THE CodeAlgo GAME IS PROVIDED “AS IS” WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STATUTORY OR
            OTHERWISE, CodeAlgo AND ITS SUPPLIERS DISCLAIM ALL REPRESENTATIONS, WARRANTIES, AND CONDITIONS WITH REGARD TO THE CodeAlgo GAME, EITHER
            EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE WARRANTY OF NONINFRINGEMENT OF THIRD PARTY RIGHTS AND THE IMPLIED REPRESENTATIONS,
            WARRANTIES, AND CONDITIONS OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF
            THE CodeAlgo GAME IS WITH YOU. NEITHER CodeAlgo NOR ITS SUPPLIERS WARRANT THAT THE FUNCTIONS CONTAINED IN THE CodeAlgo GAME WILL MEET YOUR
            REQUIREMENTS OR THAT THE OPERATION OF THE CodeAlgo GAME WILL BE UNINTERRUPTED OR ERROR-FREE.
         </p>
      </Section>

      <Section title="Limitation of Liability">
         <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STATUTORY OR OTHERWISE, IN NO EVENT SHALL CodeAlgo OR ITS SUPPLIERS BE LIABLE TO YOU
            FOR ANY SPECIAL, INCIDENTAL, EXEMPLARY, CONSEQUENTIAL, OR INDIRECT DAMAGES FOR PERSONAL INJURY, LOSS OF BUSINESS PROFITS, BUSINESS
            INTERRUPTION, LOSS OF BUSINESS INFORMATION/DATA, OR ANY OTHER PECUNIARY LOSS OF ANY KIND ARISING OUT OF THE USE OR INABILITY TO USE THE
            CodeAlgo GAME, EVEN IF CodeAlgo OR ITS SUPPLIER HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL CodeAlgo OR ITS
            SUPPLIERS BE LIABLE FOR ANY CLAIM BY A THIRD PARTY. IN NO EVENT SHALL CodeAlgo’S TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED TEN U.S.
            DOLLARS (US$10.00).
         </p>
      </Section>

      <Section title="Export Laws">
         <p>
            You may not use or otherwise export or re-export the CodeAlgo Game except as authorized by United States law and the laws of the
            jurisdiction in which the CodeAlgo Game was obtained. In particular, but without limitation, the CodeAlgo Game may not be exported or
            re-exported, without proper authorization pursuant to U.S. law, (i) into (or to a national or resident of) any country, or to a person,
            subject to U.S. economic sanctions or other trade controls applicable to the CodeAlgo Game; or (ii) to anyone on the U.S. Treasury
            Department's list of Specially Designated Nationals, the U.S. Commerce Department's Denied Persons List, Unverified Parties List, Entities
            List, or the U.S. State Department's list of Debarred Parties; or (iii) otherwise in violation of or as prohibited by the laws, rules,
            regulations or administrative orders of the U.S., or any unit, agency or department thereof. By using the CodeAlgo Game, You represent and
            warrant that You are not located in, under control of, or a national or resident of any such country or on any such list or order, or
            subject to any such prohibition
         </p>
      </Section>

      <Section title="Governing Law">
         <ul>
            <li>
               {" "}
               <strong>Governing Law and Jurisdiction:</strong> This EULA shall be governed by the laws of the State of Missouri without regard to
               principles of conflicts of laws. Any disputes relating hereto shall be adjudicated only in the state or federal courts in Missouri, and
               You hereby consent to the exclusive jurisdiction of said courts. This EULA shall not be governed by the United Nations Convention on
               Contracts for the International Sale of Goods, the application of which is expressly excluded
            </li>
            <li>
               {" "}
               <strong>Modifications:</strong> No modification or waiver of any provision of this EULA, nor consent to any departure herefrom shall in
               any event be effective unless the same shall be in writing and signed by an authorized representative of CodeAlgo.
            </li>
            <li>
               <strong> Severability:</strong>If for any reason a court of competent jurisdiction finds any provision of this EULA, or portion
               thereof, to be unenforceable, that provision of the EULA shall be enforced to the maximum extent permissible so as to effect the intent
               of the parties, and the remainder of this EULA shall continue in full force and effect.{" "}
            </li>
            <li>
               <strong>No Waiver:</strong> Unless otherwise agreed herein, no delay or failure on the part of any party in exercising any right
               hereunder shall impair any such right or any remedy of such party nor shall it be construed to be a waiver of any continuing breach or
               default hereunder or any acquiescence therein or of any similar breach or default thereafter occurring, nor shall any waiver of any
               single breach or default hereunder be deemed a waiver of any other breach theretofore or thereafter occurring{" "}
            </li>
            <li>
               <strong> Headings: </strong> . The headings of the paragraphs herein are for convenience of reference only and are not to be considered
               in construing this EULA.{" "}
            </li>
         </ul>
      </Section>

      <Section title="Complete Agreement">
         <p>
            This EULA contains the entire agreement of the parties with respect to the subject matter hereof and supersedes all agreements and
            understandings between the parties concerning the subject matter hereof.
         </p>
      </Section>

      <div className="mt-6 rounded border-2 border-gray-300 bg-gray-100 p-4">
         <p className="font-semibold">
            YOU ACKNOWLEDGE THAT YOU HAVE READ THIS AGREEMENT, UNDERSTAND IT, AND AGREE TO BE BOUND BY ITS TERMS AND CONDITIONS. YOU FURTHER AGREE
            THAT THIS IS THE COMPLETE AND EXCLUSIVE AGREEMENT BETWEEN THE PARTIES
         </p>
      </div>

   </div>
);

export default CodeAlgoLegalDocs;
