import StudentLayout from "@/components/layouts/StudentLayout";
import { BillingProvider } from "@/components/billing/BillingContext";
import PaymentPage from "@/components/parents/billing/PaymentPage";

const StudentPayment = () => (
   <StudentLayout>
      <BillingProvider role="student">
         <PaymentPage />
      </BillingProvider>
   </StudentLayout>
);

export default StudentPayment;
