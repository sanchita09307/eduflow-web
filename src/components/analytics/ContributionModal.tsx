import React from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  FileText,
  BarChart2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { StudentGroup, Task, Submission, User } from '../../types';
import { calculateStudentContributions } from '../../services/analyticsEngine';

interface ContributionModalProps {
  group: StudentGroup | null;
  tasks: Task[];
  submissions: Submission[];
  allUsers: User[];
  isOpen: boolean;
  onClose: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  group,
  tasks,
  submissions,
  allUsers,
  isOpen,
  onClose
}) => {
  if (!group) return null;

  const contributions = calculateStudentContributions(group, tasks, submissions, allUsers);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Individual Student Contribution Breakdown"
      subtitle={`${group.name} — Fair, Verifiable Activity & Viva Assessment Metric`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Advisory Header Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            <strong>Evaluation Principle:</strong> Contribution metrics synthesize completed Kanban tasks, versioned deliverable submissions, and leadership roles. Scores are non-punitive and serve as an advisory basis for internal continuous viva examination.
          </span>
        </div>

        {/* Member Cards */}
        <div className="space-y-3">
          {contributions.map((c) => (
            <div
              key={c.userId}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {c.rollNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.notes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">
                      Advisory Index
                    </span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {c.contributionScore} / 100
                    </span>
                  </div>
                  <Badge
                    variant={
                      c.status === 'active'
                        ? 'success'
                        : c.status === 'moderate'
                        ? 'primary'
                        : 'warning'
                    }
                  >
                    {c.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Progress and Stats Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Tasks Completed</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {c.completedTasks} of {c.totalAssignedTasks} ({c.taskCompletionRate}%)
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Submissions Authored</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {c.submissionsMade} files
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Viva Readiness</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {c.contributionScore >= 60 ? 'Strong' : 'Review Required'}
                  </span>
                </div>
              </div>

              {/* Visual Contribution Bar */}
              <div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.contributionScore >= 70
                        ? 'bg-emerald-500'
                        : c.contributionScore >= 50
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${c.contributionScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </Modal>
  );
};
