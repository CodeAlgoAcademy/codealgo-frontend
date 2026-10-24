
import { Subscription } from "types/interfaces";

export const getActiveSubscription = (billing_history: Subscription[] | null): Subscription | null => {
  if (!billing_history || billing_history.length === 0) return null;
  
  return billing_history.find(
    (sub) => sub.is_active && sub.payment_status === "Paid"
  ) || null;
};

export const getActiveSubscriptionChildren = (billing_history: Subscription[] | null): (string | number)[] => {
  const activeSub = getActiveSubscription(billing_history);
  if (!activeSub) return [];
  
  return activeSub.children.map(child => child.id);
};

// Mirrors get_subscription_eligibility on the backend: one free trial per account,
// ever, so any past subscription that had a trial end date uses it up.
export const canStartTrial = (billing_history?: Subscription[] | null): boolean =>
  !(billing_history || []).some((sub) => !!sub.trial_ends_at);
