import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TrialExpiryCardProps {
  daysLeft: number;
  expiryDate: string; 
  onUpdatePayment: () => void;
  onChangePlan: () => void;
  onClose?: () => void;
}

const TrialExpiryCard: React.FC<TrialExpiryCardProps> = ({
  daysLeft,
  expiryDate,
  onUpdatePayment,
  onChangePlan,
  onClose,
}) => {
  const { t } = useTranslation('parent');
  return (
    <div className="relative bg-mainColor/10 border-[3px] border-[#8EDFFF] rounded-[10px] p-6 mb-8 mt-5 w-full mx-auto shadow-sm">

      <div className="mt-4 text-center">
        <h2 className="text-lg font-semibold mb-5">{t('updateYourPaymentInfo')}</h2>
        <div className="flex bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6 items-center">
          <div className="bg-[#EF4444]/50 text-white p-4 px-6 flex flex-col items-center justify-center leading-none">
            <span className="text-5xl font-black">{daysLeft}</span>
            <span className="text-xs font-bold uppercase mt-1">{t('daysLeft')}</span>
          </div>
          
          <div className="flex-1 text-left px-5">
            <h3 className="text-lg font-semibold border-b-2 border-gray-100 pb-1 inline-block">
              {t('subscriptionExpiresSoon')}
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              {t('trialExpireBy', { date: expiryDate })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={onChangePlan}
            className="flex-1 bg-white border border-gray-200 py-2.5 px-4 rounded-xl  text-gray-800 hover:bg-gray-50 transition-all shadow-sm"
          >
            {t('changeYourPlan')}
          </button>
          <button 
            onClick={onUpdatePayment}
            className="flex-1 bg-mainColor hover:bg-mainColor py-2.5 px-4 rounded-xl text-white transition-all shadow-md"
          >
            {t('updateYourPaymentInfoButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiryCard;