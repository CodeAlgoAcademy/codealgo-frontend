import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { useTranslation } from "react-i18next";

interface Step2ManageChildrenProps {
  selectedChildIds: number[];
  setSelectedChildIds: (ids: number[]) => void;
  goBack: () => void;
  goNext: () => void;
  submitLabel?: string;
  isProcessing?: boolean;
  // New plans need at least one kid picked when there are kids to pick.
  requireOne?: boolean;
}

const Step2ManageChildren: React.FC<Step2ManageChildrenProps> = ({
  selectedChildIds = [],
  setSelectedChildIds,
  goBack,
  goNext,
  submitLabel = "",
  isProcessing = false,
  requireOne = false,
}) => {
  const { t } = useTranslation("parent");
  const { children } = useSelector((state: RootState) => state.parentChild);
  
  const handleToggle = (childId: number) => {
    const currentIds = selectedChildIds || []; 
    
    if (currentIds.includes(childId)) {
      setSelectedChildIds(currentIds.filter((id) => id !== childId));
    } else {
      setSelectedChildIds([...currentIds, childId]);
    }
  };

  const hasChildren = children.length > 0;
  const safeSelectedIds = selectedChildIds || [];
  const needsPick = requireOne && hasChildren && safeSelectedIds.length === 0;

  return (
    <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="bg-mainColor px-4 py-5 text-white text-center">
        <h2 className="text-lg font-bold">{t("selectChildren")}</h2>
      </div>

      <div className="px-6 py-6">
        <div className="mb-4 text-sm text-gray-500">
          {t("selectWhichChildren")}
        </div>

        {!hasChildren ? (
           <div className="text-center py-8 text-gray-400">
             {t("noChildrenFound")}
             {requireOne && <p className="mt-2 text-sm text-gray-500">{t("kidsJoinPlanLater")}</p>}
           </div>
        ) : (
          <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {children.map((child) => {
              // ✅ FIX 1: Convert ID to Number for the check
              const childId = Number(child.id);
              const isSelected = safeSelectedIds.includes(childId);
              
              return (
                <li key={child.id}>
                  <button
                    type="button"
                    // ✅ FIX 2: Pass the converted number to the handler
                    onClick={() => handleToggle(childId)}
                    disabled={isProcessing}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 transition-all
                      ${isSelected ? "border-mainColor bg-mainColor/5" : "border-gray-200 hover:bg-gray-50"}
                      ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold
                        ${isSelected ? "bg-mainColor text-white" : "bg-gray-100 text-gray-500"}`}>
                        {child.fullName?.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900">{child.fullName}</span>
                    </div>
                    
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border 
                      ${isSelected ? "border-mainColor bg-mainColor text-white" : "border-gray-300 bg-white"}`}>
                      {isSelected && <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {needsPick && <p className="mt-4 text-sm text-red-600">{t("pickAtLeastOneChild")}</p>}

        <div className="mt-6 flex gap-3">
          <button 
            onClick={goBack} 
            disabled={isProcessing}
            className="w-1/3 rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={goNext}
            disabled={isProcessing || needsPick}
            className="flex-1 rounded-xl bg-mainColor px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isProcessing ? t("saving") : submitLabel || t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2ManageChildren;