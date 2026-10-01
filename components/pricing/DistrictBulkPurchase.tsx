import React, { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { MenuItem, Select } from "@mui/material";
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
         const data = await dispatch(submitInstituionInquiry(requestBody));

         const mailtoUrl = `mailto:triumfia@codealgoacademy.com,info@codealgoacademy.com?subject=${encodeURIComponent(
            t("districtInquiryMailSubject", { name: requestBody.name })
         )}&body=${encodeURIComponent(
            t("districtInquiryMailBody", {
               name: requestBody.name,
               email: requestBody.email,
               category: requestBody.category,
               institutionName: requestBody.institution_name,
               studentCount: requestBody.student_count,
               message: requestBody.message,
            })
         )}`;
         window.open(mailtoUrl, "_blank");

         if (!data.error) {
            toast.success(t("requestSubmitted"));
            dispatch(
               openSuccessModal({
                  message: t("districtBulkSuccess"),
               })
            );
            setRequestBody(initialValues);
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
            <h1 className="text-center text-[1.5rem] font-bold">
               {t("institutionInquiry")}
            </h1>
            <p className="mt-2 text-center text-[1.1rem] text-gray-600">
               {t("institutionDescription")}
            </p>

            <form onSubmit={onSubmit} className="mt-14 space-y-5">
               <div className="flex items-center gap-12 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="max-w-fit font-bold md:min-w-[250px]">
                     <p>{t("name")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <input
                        value={requestBody.name}
                        onChange={(e) => updateRequestBody("name", e.target.value)}
                        required
                        className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-mainRed focus:ring-1 focus:ring-mainRed"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-12 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="max-w-fit font-bold md:min-w-[250px]">
                     <p>{t("email")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <input
                        value={requestBody.email}
                        onChange={(e) => updateRequestBody("email", e.target.value)}
                        type="email"
                        required
                        className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-mainRed focus:ring-1 focus:ring-mainRed"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-12 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="max-w-fit font-bold md:min-w-[250px]">
                     <p>{t("selectCategory")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <Select
                        value={requestBody.category || "unselected"}
                        fullWidth
                        sx={{
                           borderRadius: ".375rem",
                           border: "1px solid #d1d5db",
                           backgroundColor: "white",
                           height: 45,
                           outline: "none",
                           "& *": {
                              outline: "none",
                              border: "none !important",
                           },
                           "&:focus": {
                              borderColor: "#FF0D11",
                              boxShadow: "0 0 0 1px #FF0D11",
                           },
                        }}
                        MenuProps={{
                           PaperProps: {
                              sx: {
                                 "& .MuiMenuItem-root": {
                                    "&:hover": {
                                       backgroundColor: "#FF575A",
                                       color: "#FFFFFF",
                                    },
                                    "&.Mui-selected": {
                                       backgroundColor: "#FF0D11",
                                       color: "#FFFFFF",
                                       "&:hover": {
                                          backgroundColor: "#FF575A",
                                       },
                                    },
                                 },
                              },
                           },
                        }}
                        onChange={(e) => updateRequestBody("category", e.target.value)}
                     >
                        <MenuItem value={"unselected"}>
                           {t("pleaseSelectCategory")}
                        </MenuItem>
                        <MenuItem value={"organization"}>
                           {t("organization")}
                        </MenuItem>
                        <MenuItem value={"school"}>{t("school")}</MenuItem>
                        <MenuItem value={"district"}>{t("district")}</MenuItem>
                     </Select>
                  </div>
               </div>

               <div className="flex items-center gap-12 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="max-w-fit font-bold md:min-w-[250px]">
                     <p>{t("institutionName")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <input
                        required
                        value={requestBody.institution_name}
                        onChange={(e) =>
                           updateRequestBody("institution_name", e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-mainRed focus:ring-1 focus:ring-mainRed"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-12 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="max-w-fit font-bold md:min-w-[250px]">
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
                        className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-mainRed focus:ring-1 focus:ring-mainRed"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-12 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="max-w-fit font-bold md:min-w-[250px]">
                     <p>{t("anyOtherDetails")}</p>
                  </div>
                  <div className="w-full flex-1">
                     <textarea
                        required
                        value={requestBody.message}
                        onChange={(e) => updateRequestBody("message", e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-mainRed focus:ring-1 focus:ring-mainRed"
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