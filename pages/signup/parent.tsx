import GoogleBtn from "@/components/UI/googleBtn";
import AppleBtn from "@/components/UI/appleBtn";
import Form1 from "@/components/stepForm/general/Form1";
import Form2 from "@/components/stepForm/general/Form2";
import Form3 from "@/components/stepForm/general/Form3";
import AuthLayout from "@/components/layouts/AuthLayout";
import useMultiForm from "utils/useMultiForm";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, signUpUser } from "services/authService";
import { addChild, addChildFriend, resetScreenTime } from "store/parentChildSlice";
import { FiCheckCircle } from "react-icons/fi";
import { RootState } from "store/store";
import { updateUser } from "store/authSlice";
import { checkEmail } from "utils/checkmail";
import Link from "next/link";
import { checkPolicy, unCheckPolicy } from "store/policySlice";
import { ILocalStorageItems } from "types/interfaces/localstorage.interface";

export default function Parent() {
   const dispatch = useDispatch();
   const router = useRouter();
   const credentials = useSelector((state: RootState) => state?.user?.auth);
   const policyChecked = useSelector((state: RootState) => state.policyCheck.checked);
   const parent = useSelector((state: RootState) => state.parentChild);
   const [modalOpen, setModalOpen] = useState(false);
   const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next, goTo } = useMultiForm([
      <Form1 key={1} />,
      <Form2 key={2} />,
      <Form3 key={3} />,
   ]);

   const toggleCheck = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) dispatch(checkPolicy());
      else dispatch(unCheckPolicy());
   };

   const signUp = async (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (currentStepIndex === 2) {
         const data = await dispatch(signUpUser());
         // Set this to the local storage to know whether to auto-close page after verification
         localStorage.setItem(ILocalStorageItems.parent_signup, JSON.stringify(true));
         if (!data?.error?.message) {
            setModalOpen(true);
         }
         // next();
      } else if (currentStepIndex === 9) {
         const data = await dispatch(addChild());
         if (!data?.error?.message) {
            router.push("/parents");
         }
      }
      // else if (currentStepIndex === 10) {
      //    const data = await dispatch(addChildFriend());
      //    if (!data?.error) {
      //       router.push("/parents");
      //    }
      // }
      else if (currentStepIndex === 0) {
         checkEmail(credentials?.email, next, dispatch);
      } else {
         next();
      }
   };

   useEffect(() => {
      dispatch(updateUser({ key: "accountType", value: "Parent" }));
   }, []);

   return (
      <>
         <AuthLayout>
            <form onSubmit={signUp}>
               <div className="">{step}</div>
               <div>
                  <div className="mt-4">
                     <input
                        type="checkbox"
                        onChange={toggleCheck}
                        checked={policyChecked}
                        name=""
                        className="inline-block scale-[120%] accent-mainRed"
                        id="privacy"
                        required={true}
                     />
                     <label htmlFor="privacy" className="ml-2 inline-block cursor-pointer underline">
                        <Link href={"/privacy-policy"}> I accept the terms and condition</Link>
                     </label>
                  </div>
                  <button className="mt-6 block  h-[2.5rem] w-full rounded-xl bg-mainRed text-center font-bold text-white" type="submit">
                     Continue
                  </button>
                  {!isFirstStep && (
                     <button className="mt-4 block w-full text-center" type="button" onClick={back}>
                        Back
                     </button>
                  )}
                  {isFirstStep && <GoogleBtn />}
                  {isFirstStep && <AppleBtn />}
               </div>
            </form>
         </AuthLayout>
         {modalOpen && (
            <div
               className="fixed top-0 left-0 z-[4] flex min-h-screen w-[100vw] items-center justify-center bg-[rgba(0,0,0,.5)]"
               data-testid="success-modal"
            >
               <div className="w-[90vw] max-w-[600px] rounded-md bg-white p-8 shadow-md">
                  <div className="py-6">
                     <span className="mb-2 flex w-full items-center justify-center text-center text-[70px] text-green-600">
                        <FiCheckCircle />
                     </span>
                     <p className="text-center text-[20px]">
                        An email verification link has been sent to your email address <span className="font-[800]">{credentials?.email}</span>
                        <span className="mt-2 block font-bold">Please check your email and verify before proceeding</span>
                     </p>
                  </div>
                  <button
                     className="mx-auto block max-w-fit rounded-md bg-mainRed px-6 py-3 font-bold text-white"
                     onClick={async () => {
                        const isNotVerified = localStorage.getItem(ILocalStorageItems.parent_signup);
                        if (!isNotVerified) {
                           const { data } = await dispatch(loginUser());
                        }
                        setModalOpen(false);
                        router.push("/login/parent?redirect=add-student");
                     }}
                  >
                     Got it!
                  </button>
               </div>
            </div>
         )}
      </>
   );
}
