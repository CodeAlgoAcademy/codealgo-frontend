import React, { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CustomButton } from "@/components/UI/Button";
import { submitInstituionInquiry } from "services/pricingService";
import { openSuccessModal } from "store/modalSlice";
import { InstitutionInquiryDto } from "types/interfaces";

const initialValues: InstitutionInquiryDto = {
   category: "",
   email: "",
   name: "",
   institution_name: "",
   student_count: 0,
   message: "",
};

const DistrictBulkPurchase = () => {
   const dispatch = useDispatch();
   const { t } = useTranslation("pages");

   const [requestBody, setRequestBody] = useState<InstitutionInquiryDto>(initialValues);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const updateRequestBody = (
      key: keyof InstitutionInquiryDto,
      value: string | number
   ) => {
      setRequestBody((prev) => ({ ...prev, [key]: value }));
   };

 const onSubmit = async (e: FormEvent) => {
   e.preventDefault();
   setIsSubmitting(true);

   try {
      const data = await dispatch(
         submitInstituionInquiry(requestBody)
      );

      if (!data.error) {
         toast.success(t("requestSubmitted"), {
            description: t("districtBulkSuccess"),
            duration: 5000,
         });

         setRequestBody(initialValues);
      } else {
         toast.error(t("requestFailed"));
      }
   } catch (error) {
      toast.error(t("requestFailed"));
   } finally {
      setIsSubmitting(false);
   }
};

   return (
      <div className="mx-auto mb-24 max-w-[1200px] md:mt-12">
         <div className="w-full bg-gray-50 p-7 md:rounded-[2rem] md:p-20">
            <h2 className="text-center text-[1.5rem] font-bold">
               {t("institutionInquiry")}
            </h2>
            <p className="mt-2 text-center text-[1.1rem] text-gray-600">
               {t("institutionDescription")}
            </p>

            <form onSubmit={onSubmit} className="mt-14 space-y-5">
               <div className="form-row">
                  <div className="form-label">
                     <p>{t("name")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <input
                        value={requestBody.name}
                        onChange={(e) => updateRequestBody("name", e.target.value)}
                        required
                        className="form-input"
                     />
                  </div>
               </div>

               <div className="form-row">
                  <div className="form-label">
                     <p>{t("email")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <input
                        value={requestBody.email}
                        onChange={(e) => updateRequestBody("email", e.target.value)}
                        type="email"
                        required
                        className="form-input"
                     />
                  </div>
               </div>

               <div className="form-row">
                  <div className="form-label">
                     <p>{t("selectCategory")}</p>
                  </div>
                  <div className="w-full flex-1">
                     {/* A native <select>: MUI's Select server-renders about 8 KB of
                         inline <style> into the page for this one control. */}
                     <select
                        value={requestBody.category || "unselected"}
                        onChange={(e) => updateRequestBody("category", e.target.value)}
                        className="h-[45px] w-full rounded-md border border-gray-300 bg-white px-3 outline-none focus:border-mainRed focus:ring-1 focus:ring-mainRed"
                     >
                        <option value="unselected">{t("pleaseSelectCategory")}</option>
                        <option value="organization">{t("organization")}</option>
                        <option value="school">{t("school")}</option>
                        <option value="district">{t("district")}</option>
                     </select>
                  </div>
               </div>

               <div className="form-row">
                  <div className="form-label">
                     <p>{t("institutionName")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <input
                        required
                        value={requestBody.institution_name}
                        onChange={(e) =>
                           updateRequestBody("institution_name", e.target.value)
                        }
                        className="form-input"
                     />
                  </div>
               </div>

               <div className="form-row">
                  <div className="form-label">
                     <p>{t("numberOfClassrooms")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <input
                        required
                        type="number"
                        value={requestBody.student_count}
                        onChange={(e) =>
                           updateRequestBody("student_count", e.target.value)
                        }
                        className="form-input"
                     />
                  </div>
               </div>

               <div className="form-row">
                  <div className="form-label">
                     <p>{t("anyOtherDetails")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <textarea
                        required
                        value={requestBody.message}
                        onChange={(e) => updateRequestBody("message", e.target.value)}
                        rows={3}
                        className="form-input"
                     />
                  </div>
               </div>

               <CustomButton
                  size="medium"
                  variant="filled"
                  disabled={isSubmitting}
                  className="mx-auto !mt-10 justify-center !px-2 font-thabit text-[1.1rem] font-bold text-white max-md:w-full md:min-w-[250px]"
               >
                  {isSubmitting ? t("submitting") : t("getAQuote")}
               </CustomButton>
            </form>
         </div>
      </div>
   );
};

export default DistrictBulkPurchase;