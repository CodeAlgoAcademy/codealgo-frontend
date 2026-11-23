import React, { useState, useMemo } from "react";
import { BiChevronDown } from "react-icons/bi";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { useAppDispatch } from "store/hooks";
import { cn } from "utils";
import { useRouter } from "next/router";
import { sortBillingHistory } from "./components/billingSort";
import { useBillingHistory } from "./components/useBillingHistory";
import BillingTableHeader from "./components/BillingTableHeader";
import BillingTableRow from "./components/BillingTableRow";
import ConfirmationModal from "./components/ConfirmationModal";
import HistorySkeleton from "./components/HistorySkeleton";
import { useTranslation } from "react-i18next";
import { useBilling } from "@/components/billing/BillingContext";

const BillingHistory = () => {
   const { handlers, billing_history } = useSelector((state: RootState) => state.pricing);
   const { t } = useTranslation("parent");
   const { basePath } = useBilling();
   const [showBill, setShowBill] = useState(true);
   const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
   
   const router = useRouter();
   
   const isLoading = handlers.billing_history_loading;

   const {
      reactivatingId,
      cancelModalOpen,
      reactivateModalOpen,
      openCancelModal,
      openReactivateModal,
      closeCancelModal,
      closeReactivateModal,
      handleCancel,
      handleReactivate
   } = useBillingHistory();

   const handleAddPayment = (subscriptionId: number) => {
      setOpenDropdownId(null);
      router.push(`${basePath}/payment?subscription_id=${subscriptionId}`);
   };

   const handleToggleDropdown = (id: number) => {
      setOpenDropdownId(openDropdownId === id ? null : id);
   };

   const displayHistory = useMemo(() => 
      sortBillingHistory(billing_history || []), 
   [billing_history]);

   return (
      <div className="mb-10">
         {/* Modals */}
          <ConfirmationModal
            isOpen={cancelModalOpen}
            onClose={closeCancelModal}
            onConfirm={handleCancel}
            title={t("cancelSubscription")}
            message={t("confirmCancelMessage")}
            confirmText={t("yesCancel")}
            cancelText={t("noKeepIt")}
            type="cancel"
         />

         <ConfirmationModal
            isOpen={reactivateModalOpen}
            onClose={closeReactivateModal}
            onConfirm={handleReactivate}
            title={t("reactivateSubscription")}
            message={t("confirmReactivateMessage")}
            confirmText={t("yesReactivate")}
            cancelText={t("noGoBack")}
            type="reactivate"
         />

         <div className="mt-8 flex items-end justify-between">
            <button 
               onClick={() => setShowBill(!showBill)} 
               className="flex items-center gap-2 text-lg font-semibold text-gray-800 focus:outline-none"
            >
               {t("billingHistory")}
               <BiChevronDown 
                  className={cn("h-5 w-5 text-gray-500 transition-transform duration-200", showBill && "rotate-180")} 
               />
            </button>
         </div>

         {/* Content Area */}
         {showBill && (
            <div className="mt-4">
               <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                     <div className="min-w-[800px]">
                        <BillingTableHeader />
                        
                        {isLoading ? (
                           <div className="divide-y divide-gray-100 bg-white">
                              {[...Array(3)].map((_, i) => (
                                 <HistorySkeleton key={i} />
                              ))}
                           </div>
                        ) : (
                           <div className="divide-y divide-gray-100 bg-white">
                              {displayHistory.length === 0 ? (
                                 <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                       <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                       </svg>
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-gray-900">{t("noBillingHistory")}</p>
                                    <p className="text-xs text-gray-500">{t("pastInvoicesAppearHere")}</p>
                                 </div>
                              ) : (
                                 displayHistory.map((data) => (
                                    <BillingTableRow
                                       key={data.id}
                                       data={data}
                                       isReactivating={reactivatingId === data.id}
                                       openDropdownId={openDropdownId}
                                       onToggleDropdown={handleToggleDropdown}
                                       onAddPayment={handleAddPayment}
                                       onCancel={openCancelModal}
                                       onReactivate={openReactivateModal}
                                    />
                                 ))
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default BillingHistory;