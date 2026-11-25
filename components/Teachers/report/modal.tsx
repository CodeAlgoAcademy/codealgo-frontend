import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import teachersStudentServices from 'services/teachersStudentservices';

const ACTION_CONFIG: Record<string, { labelKey: string; color: string; bg: string; border: string; icon: string }> = {
    ready_to_accelerate: { labelKey: 'readyToAccelerate', color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', icon: '🚀' },
    needs_review:        { labelKey: 'needsReview',         color: '#92400e', bg: '#fffbeb', border: '#fcd34d', icon: '📝' },
    remediation_needed:  { labelKey: 'remediationNeeded',   color: '#991b1b', bg: '#fef2f2', border: '#fca5a5', icon: '🔄' },
    on_track:            { labelKey: 'onTrack',              color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd', icon: '✅' },
};

function ActionBadge({ action }: { action: string }) {
    const { t } = useTranslation("teacher");
    const key = action?.toLowerCase().replace(/\s+/g, '_');
    const cfg = ACTION_CONFIG[key];
    if (!cfg) return (
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 capitalize">
            {action?.replace(/_/g, ' ') || t("na")}
        </span>
    );
    return (
        <span style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg">
            <span>{cfg.icon}</span>
            {t(cfg.labelKey)}
        </span>
    );
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: string | number }) {
    return (
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-sm">
            <span className="text-base">{icon}</span>
            <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide leading-none">{label}</p>
                <p className="text-sm font-black text-slate-700 leading-snug">{value}</p>
            </div>
        </div>
    );
}

function LevelBadge({ name }: { name: string }) {
    const colors = ['#6366f1','#8b5cf6','#0ea5e9','#10b981','#f59e0b','#f43f5e'];
    const bg = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
    return (
        <span style={{ background: bg }}
            className="inline-block text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
            {name}
        </span>
    );
}

export default function DiagnosticDetailModal({
    studentId, onClose, fetchDetails = teachersStudentServices.getStudentDiagnosticDetail
}: {
    studentId: number; onClose: () => void;
    /** Where the history comes from. Defaults to the teacher endpoint. */
    fetchDetails?: (studentId: number) => Promise<any[]>;
}) {
    const { t } = useTranslation("teacher");
    const [details, setDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails(studentId)
            .then(res => setDetails(Array.isArray(res) ? res : []))
            .catch(() => setDetails([]))
            .finally(() => setLoading(false));
    }, [studentId, fetchDetails]);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>

            <div className="bg-[#f0f4f8] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200/80">
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400 mb-0.5">
                            {t("studentReport")}
                        </p>
                        <h2 className="text-lg font-black text-slate-800">{t("diagnosticLevelHistory")}</h2>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xl font-light">
                        &times;
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-sm text-slate-400 font-medium">{t("loadingDiagnosticData")}</p>
                        </div>
                    ) : details.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <p className="text-3xl mb-2">📊</p>
                            <p className="font-semibold">{t("noDiagnosticRecords")}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {details.map((record, i) => (
                                <div key={record.id ?? i}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

                                    <div className="px-5 py-3.5 flex items-center justify-between flex-wrap gap-3 border-b border-slate-50">
                                        <div className="flex items-center gap-2.5">
                                            <LevelBadge name={record.level_name} />
                                            <code className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {record.unit_level}
                                            </code>
                                        </div>
                                        <ActionBadge action={record.recommended_action} />
                                    </div>

                                    <div className="px-5 py-4">
                                        {record.summary && (
                                            <p className="text-sm text-slate-600 font-medium mb-4 leading-relaxed">
                                                {record.summary}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <StatPill
                                                icon="⏱"
                                                label={t("duration")}
                                                value={`${record.duration_seconds}s`}
                                            />
                                            <StatPill
                                                icon="❌"
                                                label={t("failCount")}
                                                value={record.fail_count}
                                            />
                                            <StatPill
                                                icon="💡"
                                                label={t("hintsUsed")}
                                                value={record.hint_uses}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center flex-shrink-0">
                    <p className="text-xs text-slate-400">
                        {t("levelsRecorded", { count: details.length })}
                    </p>
                    <button onClick={onClose}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
}