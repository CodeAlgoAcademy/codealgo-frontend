import { BillingProvider } from "@/components/billing/BillingContext";
import PaymentConfirmPage from "pages/parents/billing/payment/confirm";

const StudentPaymentConfirm = () => (
   <BillingProvider role="student">
      <PaymentConfirmPage />
   </BillingProvider>
);

export default StudentPaymentConfirm;
