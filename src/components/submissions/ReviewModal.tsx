import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText,
  Clock,
  User,
  History,
  CheckCircle,
  RotateCcw,
  XCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Submission } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReviewModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  submission,
  isOpen,
  onClose
}) => {
  const { reviewSubmission } = useApp();

  const [status, setStatus] = useState<'approved' | 'rework_requested' | 'rejected'>('approved');
  const [score, setScore] = useState<number>(submission?.review?.score || 18);
  const [feedback, setFeedback] = useState(
    submission?.review?.feedback ||
      'Good work on the system architecture diagrams. Code repository structure is compliant with departmental lab standards.'
  );

  if (!submission) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    reviewSubmission({
      submissionId: submission.id,
      status,
      score: Number(score),
      feedback
    });

    if (status === 'approved') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluate & Review Milestone Deliverable"
      subtitle={`${submission.groupName} — ${submission.milestoneTitle} (Version ${submission.version})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Deliverable Metadata Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {submission.fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {submission.fileSize} • Submitted by {submission.submittedByName}
                </p>
              </div>
            </div>

            <Badge
              variant={
                submission.status === 'approved'
                  ? 'success'
                  : submission.status === 'rework_requested'
                  ? 'warning'
                  : 'primary'
              }
            >
              {submission.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {submission.submissionNotes && (
            <div className="text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                Student Notes / Submission Summary:
              </span>
              {submission.submissionNotes}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Submitted {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
              {new Date(submission.submittedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <button
              type="button"
              onClick={() => alert(`Simulating viewing file: ${submission.fileName}`)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect Deliverable</span>
            </button>
          </div>
        </div>

        {/* Multi-Version Audit History */}
        {submission.history && submission.history.length > 0 && (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Submission Version Changelog</span>
            </h5>
            <div className="space-y-2 text-xs">
              {submission.history.map((hist, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Version {hist.version}: {hist.fileName}
                    </span>
                    <p className="text-[11px] text-slate-500">{hist.notes}</p>
                    {hist.feedback && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                        Teacher remark: "{hist.feedback}"
                      </p>
                    )}
                  </div>
                  <Badge size="sm" variant={hist.status === 'approved' ? 'success' : 'warning'}>
                    v{hist.version} • {hist.score !== undefined ? `${hist.score}/20` : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Controls */}
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Evaluation Outcome *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('approved')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  status === 'approved'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Approve Work</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('rework_requested')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  status === 'rework_requested'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <span>Request Rework</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('rejected')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  status === 'rejected'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Viva & Rubric Score (out of 20 marks) *</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-extrabold">
                {score} / 20
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Teacher Feedback & Viva Observations *
            </label>
            <textarea
              rows={3}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback, corrections, or viva preparation notes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Submit Evaluation & Grade</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
