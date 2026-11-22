
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

// Free trial is paused for the holiday ads. Set NEXT_PUBLIC_FREE_TRIAL_ENABLED=true
// (and FREE_TRIAL_ENABLED=True on the backend) to bring it back.
export const FREE_TRIAL_ENABLED = process.env.NEXT_PUBLIC_FREE_TRIAL_ENABLED === "true";

// Mirrors get_subscription_eligibility on the backend: one free trial per account,
// ever, so any past subscription that had a trial end date uses it up.
export const canStartTrial = (billing_history?: Subscription[] | null): boolean =>
  FREE_TRIAL_ENABLED && !(billing_history || []).some((sub) => !!sub.trial_ends_at);
