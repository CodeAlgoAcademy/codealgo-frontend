import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "store/store";
import { BiCheck } from "react-icons/bi";
import { fetchStudentBlockGameSkill, fetchStudentLineCodingSkillsNew } from "store/teacherStudentSlice";
import ContentBox from "@/components/parents/UI/ContentBox";

interface ISkillProps {
  size: "large" | "base";
  allProgressItems: any[];
}

const PROFICIENCY_LABEL_KEYS: Record<string, string> = {
  "No Evidence": "proficiencyNoEvidence",
  "Beginning": "proficiencyBeginning",
  "Developing": "proficiencyDeveloping",
  "Proficient": "proficiencyProficient",
  "Exceeds Expectations": "proficiencyExceeds",
};

const TeacherStudentSkills = ({ size, allProgressItems }: ISkillProps) => {
  const { t } = useTranslation("teacher");
  const { isLoading, currentStudent } = useSelector(
    (state: RootState) => state.teacherStudentSlice
  );
  const skills = useSelector(
    (state: RootState) => state.teacherStudentSlice.currentStudent?.skills
  );
  const { id: classId } = useSelector((state: RootState) => state.currentClass);

  const dispatch = useDispatch<AppDispatch>();

  // Age calculation helper
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

useEffect(() => {
  const studentId = currentStudent?.student_id || currentStudent?.id;
  const dob = currentStudent?.dob;

  if (classId && studentId) {
    // No dob falls through to line coding, same as the progress widget.
    const age = dob ? calculateAge(dob) : 99;

    if (age < 14) {
      dispatch(fetchStudentBlockGameSkill({ 
        classId: classId.toString(), 
        studentId: studentId.toString() 
      }));
    } else {
      dispatch(fetchStudentLineCodingSkillsNew({ 
        classId: classId.toString(), 
        studentId: studentId.toString() 
      }));
    }
  }
}, [classId, currentStudent?.id, currentStudent?.student_id, currentStudent?.dob]);

  const hasSkills = skills && skills.length > 0;

  const standardsWithProgress = allProgressItems.filter(item => 
    item.standard_code !== "default_standard" && (item.standard_name || item.name)
  );

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case "No Evidence": return "bg-gray-100 text-gray-800";
      case "Beginning": return "bg-yellow-100 text-yellow-800";
      case "Developing": return "bg-blue-100 text-blue-800";
      case "Proficient": return "bg-green-100 text-green-800";
      case "Exceeds Expectations": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ContentBox size={size} title={t("skillsAndProficiency")} padding="small" style={{ height: "400px" }}>
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          {t("loadingSkills")}
        </div>
      ) : (
        <div className="flex h-full flex-col">
          {/* Skills Section - Top */}
          <div className="flex-1 overflow-y-auto">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">{t("masteredSkills")}</h4>
            {hasSkills ? (
  <div className="grid grid-cols-2 gap-3">
    {skills.map((skill, index) => (
      <div key={index} className="flex items-start bg-blue-50/50 p-2 rounded-lg">
        <BiCheck
          color="#2073fa" // Blue check for Python
          className="mr-2 mt-0.5 flex-shrink-0 text-[1.2rem] font-bold"
        />
        <div>
          <p className="capitalize text-sm font-semibold">
            {skill.title}: {skill.level}
          </p>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="text-center text-gray-500 text-sm">
    No Python skills acquired yet.
  </div>
)}
          </div>

          {/* Proficiency Section - Bottom */}
          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">{t("proficiencyProgress")}</h4>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {standardsWithProgress.map((standard, index) => (
                <div key={index} className="flex items-center justify-between p-2 m-1 border rounded-lg">
                  <div className="flex-1">
                    {/* Line coding uses 'name', Block coding uses 'standard_name' */}
                    <p className="text-xs text-gray-500">{standard.standard_name || standard.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <>
                    {standard.progress !== null && standard.progress !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t("percentComplete", { pct: Math.round(standard.progress * 100) })}
                      </p>
                    )}
                    </>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(standard.proficiency)}`}>
                      {t(PROFICIENCY_LABEL_KEYS[standard.proficiency] ?? standard.proficiency)}
                    </span>
                  </div>

                  </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ContentBox>
  );
};

export default TeacherStudentSkills;