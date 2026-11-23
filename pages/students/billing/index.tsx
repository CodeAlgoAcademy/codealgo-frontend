import StudentLayout from "@/components/layouts/StudentLayout";
import { BillingProvider } from "@/components/billing/BillingContext";
import { BillingContent } from "@/components/parents/billing";

const StudentBilling = () => (
   <StudentLayout>
      <BillingProvider role="student">
         <BillingContent />
      </BillingProvider>
   </StudentLayout>
);

export default StudentBilling;
