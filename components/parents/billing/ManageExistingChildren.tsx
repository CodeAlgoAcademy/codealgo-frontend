import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "store/hooks";
import { RootState } from "store/store";
import { updateSubscriptionChild, getActiveSubscription } from "services/pricingService";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Step2ManageChildren from "./Stepper/Step2managechildren";
import { useTranslation } from "react-i18next";
import { useBilling } from "@/components/billing/BillingContext";

interface ManageExistingChildrenProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const ManageExistingChildren: React.FC<ManageExistingChildrenProps> = ({ onCancel, onSuccess }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation("parent");
  const { basePath, role } = useBilling();
  const { current_subscription } = useSelector((state: RootState) => state.pricing);
  
  const [selectedChildIds, setSelectedChildIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (current_subscription?.children) {
      setSelectedChildIds(current_subscription.children.map(c => c.id));
    }
  }, [current_subscription]);

  const isLocked = current_subscription?.status === "PAST_DUE" || current_subscription?.status === "INCOMPLETE";

  const handlePayNow = () => {
    if (current_subscription?.id) {
       router.push(`${basePath}/payment?subscription_id=${current_subscription.id}`);
    }
  };

  const handleSaveChanges = async () => {
    if (!current_subscription) return;
    setIsProcessing(true);
    
    const currentIds = current_subscription.children?.map(c => c.id) || [];
    const childrenToRemove = currentIds.filter(id => !selectedChildIds.includes(id));
    const childrenToAdd = selectedChildIds.filter(id => !currentIds.includes(id));

    if (childrenToRemove.length === 0 && childrenToAdd.length === 0) {
      toast.info(t("noChangesMade"));
      setIsProcessing(false);
      onSuccess();
      return;
    }

    try {
      await Promise.all(childrenToRemove.map(id => 
        dispatch(updateSubscriptionChild({ subscriptionId: current_subscription.id, childId: id, active: false }))
      ));

      for (const id of childrenToAdd) {
        const result = await dispatch(updateSubscriptionChild({
          subscriptionId: current_subscription.id,
          childId: id,
          active: true
        }));

        if (updateSubscriptionChild.fulfilled.match(result)) {
           const payload = result.payload as any;
           if ((payload.status === 'requires_payment' || payload.status === 'requires_payment_action') && payload.client_secret) {
             toast.message(t("paymentRequired"), { description: t("completePaymentToActivateChild", { context: role }) });
             router.push(`${basePath}/payment?subscription_id=${current_subscription.id}&client_secret=${payload.client_secret}`);
             return; 
           }
        } else {
           toast.error(t("couldNotAddChild", { context: role }));
           return;
        }
      }

      toast.success(t("subscriptionUpdated"));
      await dispatch(getActiveSubscription());
      onSuccess();
    } catch (error) {
      toast.error(t("errorOccurredUpdating"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLocked) {
    return (
      <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <h3 className="text-lg font-bold text-red-900">{t("paymentRequired")}</h3>
        <p className="mt-1 text-sm text-red-700">
          {t("pleasePayToContinue")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={onCancel} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700">{t("cancel")}</button>
          <button onClick={handlePayNow} className="rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold text-white">{t("payOutstandingBalance")}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
       <Step2ManageChildren 
          selectedChildIds={selectedChildIds}
          setSelectedChildIds={setSelectedChildIds}
          goBack={onCancel}
          goNext={handleSaveChanges}
          submitLabel={t("saveChanges")}
          isProcessing={isProcessing}
       />
    </div>
  );
};

export default ManageExistingChildren;