import TeacherLayout from "@/components/layouts/TeacherLayout";
import { BillingProvider } from "@/components/billing/BillingContext";
import { BillingContent } from "@/components/parents/billing";

const TeacherBilling = () => (
   <TeacherLayout>
      <BillingProvider role="teacher">
         <BillingContent />
      </BillingProvider>
   </TeacherLayout>
);

export default TeacherBilling;
