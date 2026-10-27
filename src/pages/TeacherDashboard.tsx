import React, { useState } from 'react';
import {
  BookOpen,
  FolderGit2,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  FileCheck2,
  Bot,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { CreateSubjectModal } from '../components/projects/CreateSubjectModal';
import { ReviewModal } from '../components/submissions/ReviewModal';
import { RiskDetailsModal } from '../components/analytics/RiskDetailsModal';
import { ContributionModal } from '../components/analytics/ContributionModal';
import { VivaCalculatorModal } from '../components/analytics/VivaCalculatorModal';
import { ProjectNexus3D } from '../components/3d/ProjectNexus3D';
import { Submission, RiskAssessment, StudentGroup } from '../types';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    subjects,
    projects,
    groups,
    tasks,
    submissions,
    riskAssessments,
    selectedSubjectId,
    setSelectedSubjectId,
    setActiveTab,
    setSelectedGroupId,
    allUsers,
    addToast
  } = useApp();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<Submission | null>(null);
  const [selectedRiskForModal, setSelectedRiskForModal] = useState<RiskAssessment | null>(null);
  const [selectedGroupForContribution, setSelectedGroupForContribution] = useState<StudentGroup | null>(null);
  const [selectedGroupForViva, setSelectedGroupForViva] = useState<StudentGroup | null>(null);
  const [show3DTelemetry, setShow3DTelemetry] = useState(true);

  const displayFacultyId =
    currentUser.rollNumber || currentUser.collegeId || 'FAC-CSE-01';

  // Filter based on subject dropdown
  const filteredProjects =
    selectedSubjectId === 'all'
      ? projects
      : projects.filter((p) => p.subjectId === selectedSubjectId);

  const filteredGroups =
    selectedSubjectId === 'all'
      ? groups
      : groups.filter((g) => g.subjectId === selectedSubjectId);

  // Compute metrics
  const totalSubjectsCount = subjects.length;
  const totalProjectsCount = filteredProjects.length;
  const totalGroupsCount = filteredGroups.length;

  const highRiskGroups = riskAssessments.filter(
    (r) =>
      (r.riskLevel === 'high' || r.riskLevel === 'critical') &&
      (selectedSubjectId === 'all' ||
        groups.find((g) => g.id === r.groupId)?.subjectId === selectedSubjectId)
  );

  const avgProgress =
    filteredGroups.length > 0
      ? Math.round(
          filteredGroups.reduce((acc, g) => acc + (g.progressPercentage || 0), 0) /
            filteredGroups.length
        )
      : 0;

  const pendingSubmissions = submissions.filter(
    (s) => s.status === 'under_review' || s.status === 'submitted'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-600/15">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-black text-indigo-100 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              {currentUser.department}
            </span>
            <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-md font-bold text-white flex items-center gap-1">
              <span>Verified Faculty ID: {displayFacultyId}</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {currentUser.name}!
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
            {currentUser.designation || 'Faculty In-Charge & Evaluator'} • Continuous project telemetry, milestone progress tracking, and non-punitive viva readiness metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSelectedGroupForViva(filteredGroups[0] || groups[0])}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
          >
            <Award className="w-4 h-4 text-indigo-200" />
            <span>Viva Marks Calculator</span>
          </button>
          <button
            onClick={() => setShow3DTelemetry(!show3DTelemetry)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            title="Toggle 3D Telemetry View"
          >
            <span>{show3DTelemetry ? 'Hide 3D View' : 'Show 3D View'}</span>
          </button>
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
          >
            <Plus className="w-4 h-4 text-indigo-200" />
            <span>New Subject</span>
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-black/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Capstone Project</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Model Telemetry Widget in Teacher Dashboard */}
      {show3DTelemetry && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                3D
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Real-Time 3D Capstone Architecture & Telemetry Nexus
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Interactive WebGL spatial model mapping active microservices, sensor nodes, and milestone satellites.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedGroupForViva(filteredGroups[0] || groups[0])}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Calculate Viva Score</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ProjectNexus3D height="300px" />
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Subjects */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Subjects</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalSubjectsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across 3 Semesters
          </span>
        </div>

        {/* Total Projects */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalProjectsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Multi-group assignments
          </span>
        </div>

        {/* Student Groups */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Student Groups</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalGroupsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {filteredGroups.reduce((acc, g) => acc + g.members.length, 0)} Students enrolled
          </span>
        </div>

        {/* High Risk Alerts */}
        <div
          onClick={() => setActiveTab('ai-assistant')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            highRiskGroups.length > 0
              ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">High Risk Alerts</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {highRiskGroups.length}
          </div>
          <span className="text-[11px] text-rose-700/80 dark:text-rose-400 mt-1 block">
            {highRiskGroups.length > 0 ? 'Requires faculty check-in' : 'All groups on track'}
          </span>
        </div>

        {/* Average Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Batch Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {avgProgress}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Heuristic AI Risk Alerts Banner */}
      {highRiskGroups.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-orange-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                Heuristic Milestone Risk Detector ({highRiskGroups.length} Teams Flagged)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ask AI Assistant for Intervention Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highRiskGroups.map((risk) => (
              <div
                key={risk.groupId}
                className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-200/80 dark:border-rose-900/40 shadow-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {risk.groupName}
                    </span>
                    <Badge variant="danger" size="sm">
                      {risk.riskLevel.toUpperCase()} ({risk.riskScore}/100)
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {risk.factors[0]?.description || 'Multiple overdue milestone deliverables.'}
                  </p>
                  <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 mt-1">
                    Recommended: {risk.recommendation.slice(0, 90)}...
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRiskForModal(risk)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 hover:bg-rose-200 shrink-0 cursor-pointer"
                >
                  Diagnose
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Pending Submissions & Groups Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 Cols): Milestone Submissions Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-500" />
                <span>Deliverables Pending Faculty Review</span>
              </h3>
              <p className="text-xs text-slate-500">
                Turned in files requiring rubric grading, line feedback, or rework requests.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('submissions')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Submissions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  All Submissions Evaluated!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  No deliverables currently waiting in faculty grading queue.
                </p>
              </div>
            ) : (
              pendingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {sub.groupName}
                        </span>
                        <Badge variant="primary" size="sm">
                          Version {sub.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sub.milestoneTitle}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedSubmissionForReview(sub)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Review & Grade</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-medium text-slate-900 dark:text-white">
                      File: {sub.fileName} ({sub.fileSize})
                    </p>
                    {sub.submissionNotes && (
                      <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        "{sub.submissionNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Submitted by {sub.submittedByName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right (5 Cols): Groups Progress & Viva Roster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <span>Capstone Project Groups</span>
              </h3>
              <p className="text-xs text-slate-500">
                Team rosters, leader contacts, and individual contribution index.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('kanban')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {filteredGroups.map((group) => {
              const risk = riskAssessments.find((r) => r.groupId === group.id);
              return (
                <div
                  key={group.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {group.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {group.projectTitle}
                      </p>
                    </div>

                    {risk && (
                      <Badge
                        variant={
                          risk.riskLevel === 'critical' || risk.riskLevel === 'high'
                            ? 'danger'
                            : risk.riskLevel === 'medium'
                            ? 'warning'
                            : 'success'
                        }
                        size="sm"
                      >
                        {risk.riskLevel.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Milestone Progress</span>
                      <span className="text-slate-900 dark:text-white">
                        {group.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          group.progressPercentage >= 60
                            ? 'bg-emerald-500'
                            : group.progressPercentage >= 35
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${group.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions & Member Roster link */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 font-medium">
                      Leader: {group.leaderName.split(' ')[0]} ({group.members.length} members)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedGroupForContribution(group)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Contributions
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setActiveTab('kanban');
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        Task Board
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <CreateSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
      />

      <ReviewModal
        submission={selectedSubmissionForReview}
        isOpen={!!selectedSubmissionForReview}
        onClose={() => setSelectedSubmissionForReview(null)}
      />

      <RiskDetailsModal
        assessment={selectedRiskForModal}
        isOpen={!!selectedRiskForModal}
        onClose={() => setSelectedRiskForModal(null)}
      />

      <ContributionModal
        group={selectedGroupForContribution}
        tasks={tasks}
        submissions={submissions}
        allUsers={allUsers}
        isOpen={!!selectedGroupForContribution}
        onClose={() => setSelectedGroupForContribution(null)}
      />

      <VivaCalculatorModal
        group={selectedGroupForViva}
        isOpen={!!selectedGroupForViva}
        onClose={() => setSelectedGroupForViva(null)}
      />
    </div>
  );
};
