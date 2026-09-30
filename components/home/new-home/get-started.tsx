import { CustomButton } from "@/components/UI/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const GetStarted = () => {
   const { push } = useRouter();
   const { t } = useTranslation("home");

   const toSignUp = () => push("/signup");

   const cards = [
      {
         title: t("createYourAvatar"),
         image: "/assets/landing/images14.png",
         alt: "Customize and create your CodeAlgo avatar",
         fit: "object-contain",
         background: "bg-whiteToBlueGradient",
      },
      {
         title: t("learnByPlaying"),
         image: "/assets/landing/rename.png",
         alt: "Learn coding by playing in CodeAlgo",
         fit: "object-cover",
         background: "bg-mainColor/10",
      },
      {
         title: t("codeYourWorld"),
         image: "/assets/landing/image13.png",
         alt: "Practice coding with CodeAlgo",
         fit: "object-cover",
         background: "bg-mainPurple/10",
      },
   ];

   return (
      <section className="bg-white py-28">
         <button
            onClick={toSignUp}
            className="mx-auto mb-10 block rounded-3xl bg-mainRed px-6 py-2 font-tiltWarp text-[1.5rem] text-white md:text-[1.8rem]"
         >
            {t("signUpToday")}
         </button>

         <div className="grid grid-cols-1 gap-5 px-5 md:grid-cols-3 md:px-8">
            {cards.map((card) => (
               <article
                  key={card.title}
                  className={`relative h-[420px] overflow-hidden rounded-3xl md:h-[580px] ${card.background}`}
               >
                  <div className="absolute inset-5 bottom-24">
                     <Image
                        src={card.image}
                        alt={card.alt}
                        layout="fill"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={`${card.fit} object-center`}
                     />
                  </div>

                  <CustomButton
                     onClick={toSignUp}
                     className="!absolute bottom-8 left-1/2 !mx-auto min-w-[170px] -translate-x-1/2 justify-center !bg-white !text-black !shadow-md"
                     variant="filled"
                     size="medium"
                  >
                     {card.title}
                  </CustomButton>
               </article>
            ))}
         </div>
      </section>
   );
};

export default GetStarted;