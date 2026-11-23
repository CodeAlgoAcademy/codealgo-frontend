import { BillingProvider } from "@/components/billing/BillingContext";
import PaymentConfirmPage from "pages/parents/billing/payment/confirm";

const TeacherPaymentConfirm = () => (
   <BillingProvider role="teacher">
      <PaymentConfirmPage />
   </BillingProvider>
);

export default TeacherPaymentConfirm;
