import React, { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "store/authSlice";
import GoogleBtn from "@/components/UI/googleBtn";
import Form1 from "@/components/stepForm/general/Form1";
import Form2 from "@/components/stepForm/general/Form2";
import Form3 from "@/components/stepForm/general/Form3";
import AuthLayout from "@/components/layouts/AuthLayout";
import useMultiForm from "utils/useMultiForm";
import { signUpUser } from "services/authService";
import { useRouter } from "next/router";
import { RootState } from "store/store";
import { checkEmail } from "utils/checkmail";
import Link from "next/link";
import { checkPolicy, unCheckPolicy } from "store/policySlice";

const Organizer = () => {
   const dispatch = useDispatch();
   const router = useRouter();
   const { email } = useSelector((state: RootState) => state.user.auth);
   const policyChecked = useSelector((state: RootState) => state.policyCheck.checked);

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
      if (currentStepIndex === 0) {
         checkEmail(email, next, dispatch);
      } else if (currentStepIndex === 2) {
         const data = await dispatch(signUpUser());

         if (!data?.error) {
            router.push("/verify-email");
         }
      } else {
         next();
      }
   };

   React.useEffect(() => {
      dispatch(updateUser({ key: "accountType", value: "Organizer" }));
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
                        checked={policyChecked}
                        onChange={toggleCheck}
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
               </div>
            </form>
         </AuthLayout>
      </>
   );
};

export default Organizer;
