import Form1 from "@/components/stepForm/general/Form1";
import Form2 from "@/components/stepForm/general/Form2";
import TeacherInfo from "@/components/stepForm/teachers/TeacherInfo";
import useMultiForm from "utils/useMultiForm";
import { ChangeEvent, useEffect } from "react";
import { signUpUser } from "services/authService";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearFields, updateUser } from "store/authSlice";
import { RootState } from "store/store";
import AuthLayout from "@/components/layouts/AuthLayout";
import GoogleBtn from "@/components/UI/googleBtn";
import AppleBtn from "@/components/UI/appleBtn";
import Form3 from "@/components/stepForm/general/Form3";
import { checkEmail } from "utils/checkmail";
import Link from "next/link";
import { checkPolicy, unCheckPolicy } from "store/policySlice";

export default function Teacher() {
   const dispatch = useDispatch();
   const router = useRouter();
   const { email } = useSelector((state: RootState) => state.user.auth);
   const policyChecked = useSelector((state: RootState) => state.policyCheck.checked);
   const { steps, currentStepIndex, step, teacherSignUpStep, isFirstStep, isLastStep, back, next } = useMultiForm([
      <Form1 key={1} />,
      <Form2 key={2} />,
      <Form3 key={3} />,
      <TeacherInfo key={4} />,
   ]);

   const toggleCheck = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) dispatch(checkPolicy());
      else dispatch(unCheckPolicy());
   };

   const signup = async (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!teacherSignUpStep) {
         if (currentStepIndex === 0) {
            checkEmail(email, next, dispatch);
         } else {
            next();
         }
      } else {
         const data = await dispatch(signUpUser());
         localStorage.removeItem("parent-signup");
         if (!data?.error?.message) {
            dispatch(clearFields());
            router.push("/verify-email");
         }
      }
   };

   useEffect(() => {
      dispatch(updateUser({ key: "accountType", value: "Teacher" }));
   }, []);

   return (
      <AuthLayout>
         <form onSubmit={signup}>
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
               {!teacherSignUpStep && (
                  <button className="mt-6 block  h-[2.5rem] w-full rounded-xl bg-mainRed text-center font-bold text-white" type="submit">
                     Continue
                  </button>
               )}
               {teacherSignUpStep && (
                  <button className="mt-6 block  h-[2.5rem] w-full rounded-xl bg-mainRed text-center font-bold text-white" type="submit">
                     Sign up
                  </button>
               )}
               {!isFirstStep && (
                  <button className="mt-4 block w-full text-center " type="button" onClick={back}>
                     Back
                  </button>
               )}
               {isFirstStep && <GoogleBtn />}
               {isFirstStep && <AppleBtn />}
            </div>
         </form>
      </AuthLayout>
   );
}
