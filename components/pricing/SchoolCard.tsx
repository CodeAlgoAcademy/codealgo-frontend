import React, { FC, FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { TFunction } from "i18next";
import { toast } from "sonner";
import { openSuccessModal } from "store/modalSlice";
import { submitInstituionInquiry } from "services/pricingService";

interface SchoolCardProps {
   t: TFunction;
}

const SchoolCard: FC<SchoolCardProps> = ({ t }) => {
   const dispatch = useDispatch();
   const [schoolForm, setSchoolForm] = useState({ name: "", email: "" });
   const [loading, setLoading] = useState(false);

   const handleSchoolSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!schoolForm.name.trim() || !schoolForm.email.trim()) return;

      setLoading(true);
      try {
         await dispatch(
            submitInstituionInquiry({
               name: schoolForm.name,
               email: schoolForm.email,
               category: "school",
               institution_name: "School Inquiry",
               student_count: 1,
               message: `School Plan Request from pricing page: Name: ${schoolForm.name}, Email: ${schoolForm.email}`,
            })
         );

         const mailtoUrl = `mailto:triumfia@codealgoacademy.com,info@codealgoacademy.com?subject=${encodeURIComponent(
            t("schoolInquiryMailSubject", { name: schoolForm.name })
         )}&body=${encodeURIComponent(
            t("schoolInquiryMailBody", { name: schoolForm.name, email: schoolForm.email })
         )}`;
         window.open(mailtoUrl, "_blank");

         toast.success(t("requestSubmitted"));
         dispatch(
            openSuccessModal({
               message: t("schoolPlanSuccess"),
            })
         );
         setSchoolForm({ name: "", email: "" });
      } catch (error) {
         toast.error(t("requestFailed"));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="relative flex flex-col rounded-lg border-2 border-gray-200 bg-white p-6 transition hover:border-mainColor hover:shadow-md">
         <div className="flex-grow">
            <div className="absolute -top-2 -right-2 rotate-12 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
               {t("school")}
            </div>

            <h3 className="mb-2 text-xl font-bold text-mainColor lg:text-2xl">
               {t("schoolPlan")}
            </h3>

            <div className="mt-2 flex items-baseline gap-1">
               <span className="text-3xl font-bold text-mainColor">{t("customPrice")}</span>
               <span className="text-sm text-mainColor">{t("perSchool")}</span>
            </div>

            <p className="mb-1 text-sm font-medium text-green-600">
               {t("schoolPlanDescription")}
            </p>
            <p className="text-xs text-gray-500 mb-4">
               {t("schoolPlanSubtitle")}
            </p>

            <form onSubmit={handleSchoolSubmit} className="mt-4 space-y-3">
               <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">
                     {t("name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                     type="text"
                     required
                     value={schoolForm.name}
                     onChange={(e) =>
                        setSchoolForm((prev) => ({ ...prev, name: e.target.value }))
                     }
                     placeholder={t("namePlaceholder")}
                     className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm outline-none transition focus:border-mainRed focus:ring-1 focus:ring-mainRed"
                  />
               </div>

               <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">
                     {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                     type="email"
                     required
                     value={schoolForm.email}
                     onChange={(e) =>
                        setSchoolForm((prev) => ({ ...prev, email: e.target.value }))
                     }
                     placeholder={t("schoolEmailPlaceholder")}
                     className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm outline-none transition focus:border-mainRed focus:ring-1 focus:ring-mainRed"
                  />
               </div>

               <div className="pt-3">
                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full rounded-lg bg-mainRed px-4 py-3 font-semibold text-white transition hover:bg-opacity-90 active:scale-95 disabled:opacity-60"
                  >
                     {loading ? t("submitting") : t("getAQuote")}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default SchoolCard;