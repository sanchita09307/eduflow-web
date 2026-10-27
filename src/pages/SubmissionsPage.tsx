import React, { useState } from 'react';
import {
  FileCheck2,
  FileText,
  Clock,
  User,
  Award,
  Filter,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Plus,
  History,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { ReviewModal } from '../components/submissions/ReviewModal';
import { StudentSubmitModal } from '../components/submissions/StudentSubmitModal';
import { Submission, SubmissionStatus } from '../types';

export const SubmissionsPage: React.FC = () => {
  const { submissions, groups, projects, currentUser } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<Submission | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchGroup = selectedGroupFilter === 'all' || sub.groupId === selectedGroupFilter;
    return matchStatus && matchGroup;
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">APPROVED</Badge>;
      case 'rework_requested':
        return <Badge variant="warning">REWORK REQUESTED</Badge>;
      case 'rejected':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'under_review':
      case 'submitted':
      default:
        return <Badge variant="primary">UNDER FACULTY REVIEW</Badge>;
    }
  };

  const studentGroup = groups[0];
  const studentProject = projects.find((p) => p.id === studentGroup?.projectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Milestone Deliverables & Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit timestamped version artifacts, conduct anti-plagiarism checks, and assign continuous viva scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Turn In Deliverable (vNext)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {['all', 'under_review', 'approved', 'rework_requested'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Group:</span>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Student Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Submissions Found
            </p>
            <p className="text-xs text-slate-500">
              No milestone deliverables match your current filter selection.
            </p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {sub.groupName}
                    </span>
                    <Badge variant="neutral" size="sm">
                      v{sub.version} Release
                    </Badge>
                    {getStatusBadge(sub.status)}
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {sub.milestoneTitle}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {sub.review && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Assigned Marks
                      </span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {sub.review.score} / {sub.review.maxScore}
                      </span>
                    </div>
                  )}

                  {currentUser.role === 'teacher' ? (
                    <button
                      onClick={() => setSelectedSubmissionForReview(sub)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{sub.review ? 'Update Evaluation' : 'Evaluate Work'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedSubmissionForReview(sub)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>View Rubric Marks</span>
                    </button>
                  )}
                </div>
              </div>

              {/* File Attachment & Notes Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {sub.fileName}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {sub.fileSize} • Submitted by {sub.submittedByName}
                    </p>
                    {sub.submissionNotes && (
                      <p className="text-slate-700 dark:text-slate-300 mt-2 text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                        "{sub.submissionNotes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Faculty Feedback Section */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/60 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-xs text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                      Faculty Observation & Viva Remarks:
                    </span>
                    {sub.review ? (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{sub.review.feedback}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Deliverable is in queue. Faculty review remarks will appear here after viva grading.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Turned in: {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                    {sub.history && sub.history.length > 0 && (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                        <History className="w-3 h-3" />
                        {sub.history.length} Prior Versions
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ReviewModal
        submission={selectedSubmissionForReview}
        isOpen={!!selectedSubmissionForReview}
        onClose={() => setSelectedSubmissionForReview(null)}
      />

      {studentGroup && (
        <StudentSubmitModal
          group={studentGroup}
          project={studentProject}
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      )}
    </div>
  );
};
