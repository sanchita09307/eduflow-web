import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { RiskAssessment } from '../../types';

interface RiskDetailsModalProps {
  assessment: RiskAssessment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({
  assessment,
  isOpen,
  onClose
}) => {
  if (!assessment) return null;

  const isHigh = assessment.riskLevel === 'high' || assessment.riskLevel === 'critical';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explainable Risk Diagnosis & Heuristics"
      subtitle={`${assessment.groupName} — ${assessment.projectTitle}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Risk Score Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            assessment.riskLevel === 'critical'
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-rose-900 dark:text-rose-200'
              : assessment.riskLevel === 'high'
              ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900 text-orange-900 dark:text-orange-200'
              : assessment.riskLevel === 'medium'
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base capitalize">
                  {assessment.riskLevel} Project Risk
                </span>
                <Badge
                  variant={
                    assessment.riskLevel === 'critical' || assessment.riskLevel === 'high'
                      ? 'danger'
                      : assessment.riskLevel === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                >
                  Score: {assessment.riskScore}/100
                </Badge>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                Computed via Rule-Based Heuristic Evaluation
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostic Factors List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            Contributing Diagnostic Factors ({assessment.factors.length})
          </h4>
          <div className="space-y-2">
            {assessment.factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start gap-3"
              >
                {factor.severity === 'danger' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                ) : factor.severity === 'warning' ? (
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {factor.factor}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Recommended Intervention */}
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Recommended Faculty Action</span>
          </div>
          <p className="text-xs text-indigo-950 dark:text-indigo-200 font-medium leading-relaxed">
            {assessment.recommendation}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
          >
            Acknowledge Diagnosis
          </button>
        </div>
      </div>
    </Modal>
  );
};
