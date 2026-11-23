import TeacherLayout from "@/components/layouts/TeacherLayout";
import { BillingProvider } from "@/components/billing/BillingContext";
import PaymentPage from "@/components/parents/billing/PaymentPage";

const TeacherPayment = () => (
   <TeacherLayout>
      <BillingProvider role="teacher">
         <PaymentPage />
      </BillingProvider>
   </TeacherLayout>
);

export default TeacherPayment;
