import React, { useState, ChangeEvent } from "react";
import { generateUsername } from "utils/generateUsername";
import { useDispatch, useSelector } from "react-redux";
import { addStudent, getStudents } from "store/studentSlice";
import { IInputFields, ISingleStudent, screentimeTypes } from "types/interfaces";
import style from "styles/styles";
import { FaTimes, FaChevronLeft, FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/router";
import { getAllClasses } from "services/classesService";
import BulkImportModal from "@/components/Teachers/addClass/bulkImportModal";
import { openSuccessModal, openGeneratingModal, closeGeneratingModal } from "store/modalSlice";
import { RootState } from "store/store";
import GeneratingModal from "./generatingModal";
import ImportStudentsModal from "./ImportStudentsModal";
import { useTranslation } from "react-i18next";

export const defaultTimeLimits: screentimeTypes[] = [
   {dayOfTheWeek: "Monday", timeLimit: "No Limit"},
   {dayOfTheWeek: "Tuesday", timeLimit: "No Limit"},
   {dayOfTheWeek: "Wednesday", timeLimit: "No Limit"},
   {dayOfTheWeek: "Thursday", timeLimit: "No Limit"},
   {dayOfTheWeek: "Friday", timeLimit: "No Limit"},
   {dayOfTheWeek: "Saturday", timeLimit: "No Limit"},
   {dayOfTheWeek: "Sunday", timeLimit: "No Limit"},
];

const AddStudentModal = ({ setIsOpen }: { setIsOpen: any }) => {
   const { t } = useTranslation("teacher");
   const dispatch = useDispatch();
   const router = useRouter();
   const [formData, setFormData] = useState<ISingleStudent>({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      dob: "",
      id:"",
      password:"",
   });
   const [importOpen, setImportOpen] = useState<boolean>(false);
   const [bulkImportModalOpen, setBulkImportModalOpen] = useState<boolean>(false);
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const { email, firstName, lastName, username, dob, password } = formData;
   const { generatingModal: generatingPDFModal } = useSelector((state: RootState) => state.modal);

   const onChange = (e: any) => {
      setFormData((prevState) => ({
         ...prevState,
         [e.target.name]: e.target.value,
      }));
   };

   const inputFields: IInputFields[] = [
      {
         type: "text",
         name: "firstName",
         placeholder: t("enterStudentFirstName"),
         value: firstName,
      },
      {
         type: "text",
         name: "lastName",
         placeholder: t("enterStudentLastNameInitial"),
         value: lastName,
      },
      {
         type: "email",
         name: "email",
         placeholder: t("enterStudentEmailPlaceholder"),
         value: email,
      },
      {
         type: "date",
         name: "dob",
         placeholder: t("enterDob"),
         value: dob,
      },
      {
         type: "password",
         name: "password",
         placeholder: t("enterPasswordPlaceholder"),
         value: password,
      },
      {
         type: "text",
         name: "username",
         placeholder: t("enterUsernamePlaceholder"),
         value: username,
      },
   ];

   const onSubmit = async (e: any) => {
      e.preventDefault();
      
      if (firstName && lastName) {
         const data: ISingleStudent = {
            firstName,
            lastName,
            email,
            username,
            dob,
            password,
            timeLimits: defaultTimeLimits,
            id: ""
         };
         dispatch(openGeneratingModal(t("generating")));

         try {
            const result = await dispatch(addStudent(data)).unwrap();
            
            setIsOpen(false);
            dispatch(openSuccessModal({
               message: t("credentialsEmailSent"),
               studentId: result.id,
               type: "studentAdded"
            }));
            dispatch(getStudents());
            
            if (router.pathname === "/teachers/addClass") {
               dispatch(getAllClasses());
            }
         } catch (error) {
            console.error("Failed to add student:", error);
         }
      }
   };

   const refreshAfterImport = () => {
      dispatch(getStudents());
      if (router.pathname === "/addClass" || router.pathname === "/teachers/addClass") {
         dispatch(getAllClasses());
      }
   };

   return (
      <>
         <section className={`${style.modalOverlay} bg-[rgba(0,0,0,.25)]`} data-testid="add-student-modal">
            {bulkImportModalOpen && <BulkImportModal setBulkImportModalOpen={setBulkImportModalOpen} />}
            {importOpen && (
               <ImportStudentsModal
                  onImported={refreshAfterImport}
                  onClose={() => {
                     setImportOpen(false);
                     setIsOpen(false);
                  }}
               />
            )}
            <main className="relative mx-auto flex h-fit max-h-[95vh] w-[90vw] max-w-[900px] overflow-hidden overflow-y-scroll rounded-md bg-white shadow-lg">
               <span
                  onClick={() => {
                     setIsOpen(false);
                     if (router.pathname === "/addClass") {
                        dispatch(getAllClasses());
                     }
                  }}
                  className="absolute top-[30px] right-[30px] z-10 text-[30px] font-thin text-red-600"
               >
                  <FaTimes />
               </span>
               <aside className={`min-h-full flex-[0.075] rounded-tl-md rounded-bl-md`} style={{ backgroundColor: "#FFE977" }}></aside>

               <form className="h-full flex-[0.9] py-8" onSubmit={onSubmit}>
                  <header className="mb-6 flex w-full items-center gap-x-2 px-8 text-mainColor">
                     <span
                        className="text-[20px] font-bold"
                        onClick={() => {
                           setIsOpen(false);
                        }}
                     >
                        <FaChevronLeft />
                     </span>
                     <h1 className="text-[20px] font-bold md:text-[30px]">{t("addNewStudentTitle")}</h1>
                  </header>
                  <section className="grid gap-[1rem] px-8 md:grid-cols-2">
                     {inputFields?.map((inputField: IInputFields, index: number) => {
                        const { name, type, placeholder, value } = inputField;

                        if (name === "password") {
                           return (
                              <div key={index} className="relative flex items-center">
                                 <input
                                    type={showPassword ? "text" : "password"}
                                    name={name}
                                    placeholder={placeholder}
                                    value={value}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e)}
                                    className={`${style.input} w-full pr-10`}
                                    required
                                 />
                                 <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 text-gray-500 hover:text-gray-700"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                 >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                 </button>
                              </div>
                           );
                        }

                        return (
                           <input
                              key={index}
                              type={type}
                              name={name}
                              placeholder={placeholder}
                              value={value}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                 onChange(e);
                              }}
                              className={style.input}
                              required={type !== "email"}
                           />
                        );
                     })}
                     <button
                        type="button"
                        className=" rounded-md bg-mainColor px-2 py-3 text-white shadow-md active:scale-[0.91]"
                        onClick={() => {
                           if (firstName || lastName) {
                              const randomName = generateUsername(firstName, lastName);
                              setFormData({ ...formData, username: randomName });
                           }
                        }}
                     >
                         {t("generateUsername")}
                      </button>
                  </section>
                  <section className="mt-8 border-t-2 px-8 pt-5">
                     <button
                        type="button"
                        className="max-w-fit p-3 hover:bg-gray-100"
                        onClick={() => {
                           setBulkImportModalOpen(true);
                        }}
                     >
                        {t("viewBulkImport")}
                     </button>
                  </section>
                  <section className="flex w-full flex-col items-end justify-between gap-y-4 px-8 pt-2 md:flex-row md:items-center md:gap-y-0">
                     <button
                        type="button"
                        onClick={() => setImportOpen(true)}
                        className="flex w-full cursor-pointer flex-row items-center gap-x-2 md:w-auto"
                     >
                        <span className="font-lighter flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-black text-[20px] text-black">
                           <FaPlus />
                        </span>
                        <h3 className="text-[16px] font-bold">{t("importClassList")}</h3>
                     </button>
                     <button
                        type="submit"
                        className="min-w-[150px] rounded-[30px] bg-mainColor py-3 px-4 text-[16px] text-white hover:shadow-md"
                        disabled={generatingPDFModal.isOpen}
                     >
                        {generatingPDFModal.isOpen ? t("processing") : t("addStudentBtn")}
                     </button>
                  </section>
               </form>
            </main>
         </section>
         <GeneratingModal 
            isOpen={generatingPDFModal.isOpen} 
            message={generatingPDFModal.message} 
         />
      </>
   );
};

export default AddStudentModal;

const styles = {
   bgBlack: "bg-black bg-opacity-60 w-[100vw] min-h-[100vh] fixed z-0 top-0 left-0 grid place-items-center",
   centered: " place-items-center fixed",
   modal: "border-l-[40px] border-l-yellow-500 relative w-4/5 bg-[#f4f4f4] z-10 rounded-xl shadow-lg",
   modalHeader: "h-14 bg-[#f4f4f4] overflow-hidden rounded-tl-2xl rounded-tr-2xl",
   heading: "m-0 p-3 text-[#2c3e50] font-medium text-2xl text-center",
   closeBtn: "absolute top-0 right-0 text-[#f4f4f4] hover:bg-opacity-50 -mt-2 -mr-2 text-lg cursor-pointer p-1 rounded-full bg-red-500",
   modalBody: "p-3 text-sm text-[#2c3e50] text-center",
   addBtn: "bg-[royalblue] p-3 rounded-3xl text-white hover:bg-opacity-90 transition-all duration-500",
   bulkBtn: "flex space-x-3 text-center items-center hover:bg-slate-200 p-3",
   plusIcon: "border border-slate-700 rounded-full",
};