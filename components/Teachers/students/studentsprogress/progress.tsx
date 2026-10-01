import ContentBox from "@/components/parents/UI/ContentBox";
import ProgressBar from "@/components/parents/UI/ProgressBar";
import React from "react";
import { useTranslation } from "react-i18next";
import { IChildProgress } from "types/interfaces/parent.interface";

interface ILevelProps {
  size: "large" | "base";
  level?: number;
  progressItems?: IChildProgress[];
  completedItems?: IChildProgress[];
  isLoading?: boolean;
  isBlockProgress?: boolean
}

const questCaption = (item: IChildProgress, t: (key: string, opts?: any) => any): string | undefined => {
  if (item.source !== "quest") return undefined;
  const count: string = t("questCount", { done: item.completed_quests ?? 0, total: item.total_quests ?? 0 });
  const next = item.current_quest ? ` - ${t("questNext", { quest: item.current_quest })}` : "";
  const codes = item.standards?.length ? ` (${item.standards.join(", ")})` : "";
  return `${count}${next}${codes}`;
};

// No level means a standard row. Its name is what a teacher reads, the code
// alone (k.ap.a.01) means nothing to most of them.
const rowCaption = (item: IChildProgress, t: (key: string, opts?: any) => any): string | undefined => {
  const quest = questCaption(item, t);
  if (quest) return quest;
  if (item.unit_level || item.level) return undefined;
  return item.standard_name || undefined;
};

// Started work first, then the untouched 0% rows.
const byProgress = (a: IChildProgress, b: IChildProgress) => (b.progress || 0) - (a.progress || 0);

const TeacherStudentProgress = ({
  size,
  level,
  progressItems,
  isLoading,
  completedItems,
  isBlockProgress,
}: ILevelProps) => {
  const { t } = useTranslation("teacher");
  const hasProgressData = progressItems && progressItems.length > 0;
  const hasCompletedData = completedItems && completedItems.length > 0;

  return (
    <ContentBox
      size="large"
      title={t("progress")}
      padding="small"
      style={{
        minWidth: "100%",
        maxWidth: "100%",
        height: "400px",
        overflowY: "auto",
      }}
    >
      <div className="flex flex-col gap-6 pr-4">
        <div className="ml-4">
          {isLoading ? (
            <>
              <h3 className="font-semibold">{t("comprehensionTracking")}</h3>
              <div className="mt-3 flex flex-col gap-5">
                <p className="text-sm text-gray-400 animate-pulse">
                  {t("loadingProgress")}
                </p>
              </div>

              <h3 className="font-semibold mt-6">{t("completed")}</h3>
              <div className="mt-3 flex flex-col gap-5">
                <p className="text-sm text-gray-400 animate-pulse">
                  {t("loadingCompletedItems")}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* In Progress Section */}
              <h3 className="font-semibold">{t("comprehensionTracking")}</h3>
              <div className="mt-3 flex flex-col gap-5">
                {hasProgressData ? (
                  [...progressItems].sort(byProgress).map((lesson, index) => (
                    <ProgressBar
                    key={`inprogress-${index}`}
                    color="red"
                    percentage={lesson.progress}
                    // Fallback: Line coding might use standard_name or name
                    title={lesson.standard_code || lesson.name || lesson.title || "Lesson"} 
                    level={lesson.unit_level || lesson.level}
                    caption={rowCaption(lesson, t)}
                    titleSize="base"
                    containerSize={size} 
                  />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    {t("noInProgressItems")}
                  </p>
                )}
              </div>

              {hasCompletedData && (
                <>
                  <h3 className="font-semibold mt-6">{t("completed")}</h3>
                  <div className="mt-3 flex flex-col gap-5">
                    {completedItems.map((lesson, index) => (
                      <ProgressBar
                        key={`completed-${index}`}
                        color="green"
                        percentage={lesson.progress}
                        title={lesson.standard_code}
                        titleSize="base"
                        containerSize={size} 
                    level={lesson.unit_level || lesson.level}
                        caption={rowCaption(lesson, t)}
                        // grade={lesson.grade}
                  />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </ContentBox>
  );
};

export default TeacherStudentProgress;
