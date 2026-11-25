import { FREE_TRIAL_ENABLED } from "@/components/utils/subscriptionUtils";

// The site's frequently asked questions. Rendered on /faq (as accordions and as
// FAQPage JSON-LD, so the structured data always matches what visitors see)
// and in the FAQ section at the bottom of the homepage.
export const faqSections: { title: string; items: { question: string; answer: string }[] }[] = [
   {
      title: "Account",
      items: [
         {
            question: "How do I create an account?",
            answer: "To create an account, visit the CodeAlgo Academy website, click on \"Sign Up,\" and follow the prompts to complete the registration process.",
         },
         {
            question: "What information is required to create an account?",
            answer: "You will need to provide a valid email address and some basic details to complete the registration form. Once submitted, your account will be activated.",
         },
         {
            question: "Can I create an account for my child?",
            answer: "Yes, parents can create accounts for their children. This feature ensures a secure and enjoyable learning experience while allowing parents to manage and monitor their child's progress.",
         },
         {
            question: "How do I log in to my account?",
            answer: "Visit the CodeAlgo Academy homepage, click on \"Log In,\" and enter your registered email address and password to access your account.",
         },
         {
            question: "What should I do if I forget my password?",
            answer: "If you forget your password, select the \"Forgot Password?\" option on the login page. Follow the instructions to reset your password and regain access to your account.",
         },
      ],
   },
   {
      title: "Features",
      items: [
         {
            question: "How do I get started?",
            answer: "Getting started with CodeAlgo Academy is as easy as signing up on the website. Create an account, and you'll unlock access to engaging coding lessons. Dive into the platform and start exploring its 3D game-based learning experience right away",
         },
         {
            question: "What devices can I use to play?",
            answer: "CodeAlgo Academy is designed for convenience! You can access the platform through any device with a modern web browser, such as desktops, laptops, tablets, or even smartphones. Start learning wherever you are.",
         },
         {
            question: "How long does it take to learn coding concepts?",
            answer: "The platform is built to teach coding concepts interactively, letting learners absorb knowledge at their own pace. With its engaging 3D approach, learning becomes intuitive and fun, helping you master coding faster than traditional methods",
         },
         {
            question: "Can I save my progress and resume later?",
            answer: "Yes, CodeAlgo Academy ensures that your progress is saved! You can log out and resume right where you left off, making it easy to learn at your own pace.",
         },
         {
            question: "Are there different difficulty levels?",
            answer: "Absolutely! The platform is crafted to cater to learners of all levels. Whether you're a beginner or looking for more advanced challenges, CodeAlgo Academy adjusts to your skill level to keep you engaged.",
         },
         {
            question: "What kind of feedback and support is available?",
            answer: "Feedback is built right into the platform! You'll receive interactive responses as you progress through activities, helping you learn and improve. If you have questions or need assistance, their support team is ready to help.",
         },
         {
            question: "How do I track my child's progress?",
            answer: "CodeAlgo Academy provides a parent-friendly dashboard that keeps you informed about your child's learning journey. Check their progress, achievements, and areas they're mastering—all in one place.",
         },
      ],
   },
   {
      title: "General Pricing",
      items: [
         {
            question: "How much does a subscription cost?",
            answer: "CodeAlgo Academy provides subscription options designed to accommodate different budgets. Visit their website for up-to-date pricing information and select the plan that best meets your requirements.",
         },
         {
            question: "What are the different subscription plans available?",
            answer: "CodeAlgo Academy offers a range of subscription plans, including monthly and annual options. These plans are tailored to suit various preferences and provide flexibility. For detailed information, please explore the subscription section on their website.",
         },
         ...(FREE_TRIAL_ENABLED
            ? [
                 {
                    question: "Is there a free trial?",
                    answer: "Yes, a free trial is available, allowing you to explore the platform and evaluate its suitability for your or your child's needs. This trial offers an excellent opportunity to experience CodeAlgo Academy before committing to a subscription.",
                 },
              ]
            : []),
         {
            question: "Can I cancel my subscription at any time?",
            answer: "Yes, subscriptions can be canceled at any time. You retain full control over your subscription, ensuring a flexible and user-friendly experience.",
         },
      ],
   },
   {
      title: "Feedback",
      items: [
         {
            question: "How can I provide feedback or report a bug?",
            answer: "You can provide feedback or report a bug by emailing the CodeAlgo Academy support team at support@codealgoacademy.com.",
         },
         {
            question: "How does the platform use user feedback?",
            answer: "CodeAlgo Academy uses user feedback to improve the platform and its courses.",
         },
      ],
   },
   {
      title: "Legal & Compliance",
      items: [
         {
            question: "What is your privacy policy?",
            answer: "CodeAlgo Academy is dedicated to safeguarding your privacy. Their privacy policy details the collection, use, and protection of personal information, ensuring compliance with industry standards. You can access the complete privacy policy directly on their website.",
         },
         {
            question: "What are your terms of service?",
            answer: "The terms of service outline the guidelines and conditions for using the CodeAlgo Academy platform. These terms are designed to provide clarity and set expectations for users. For a comprehensive overview, visit the terms of service section on their website.",
         },
         {
            question: "How do you comply with child safety regulations?",
            answer: "CodeAlgo Academy prioritizes the safety and security of children on its platform. They strictly adhere to child safety regulations, including robust parental controls and secure systems to ensure a safe learning environment. Detailed information on compliance practices can be found on their website.",
         },
      ],
   },
];
