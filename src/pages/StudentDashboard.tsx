import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  FolderGit2,
  Users,
  CheckCircle2,
  Clock,
  UploadCloud,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Award,
  Sparkles,
  IdCard,
  Box
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { StudentSubmitModal } from '../components/submissions/StudentSubmitModal';
import { ContributionModal } from '../components/analytics/ContributionModal';
import { ProjectNexus3D } from '../components/3d/ProjectNexus3D';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    groups,
    projects,
    tasks,
    submissions,
    allUsers,
    updateTaskStatus,
    setActiveTab,
    setSelectedGroupId
  } = useApp();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [show3DNavigator, setShow3DNavigator] = useState(true);

  // Find group where student belongs
  const myGroup =
    groups.find((g) => g.members.some((m) => m.userId === currentUser.id)) || groups[0];

  const myProject = projects.find((p) => p.id === myGroup?.projectId);

  // Find tasks assigned specifically to this student
  const personalTasks = tasks.filter((t) => t.assignedToId === currentUser.id);

  // Find submissions for this group
  const groupSubmissions = submissions.filter((s) => s.groupId === myGroup?.id);

  const completedPersonalTasks = personalTasks.filter((t) => t.status === 'completed').length;

  const displayStudentId =
    currentUser.rollNumber || currentUser.collegeId || '21CS042';

  const handleTaskComplete = (taskId: string) => {
    updateTaskStatus(taskId, 'completed');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Student Welcome Banner - Bright, Modern, Premium */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white shadow-xl shadow-indigo-600/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-black text-indigo-100 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Student Workspace • {currentUser.department}
            </span>
            <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-md font-bold text-white flex items-center gap-1">
              <IdCard className="w-3 h-3" />
              <span>Verified Roll No: {displayStudentId}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {currentUser.name}!
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
            Assigned Capstone Team: <span className="font-bold text-white">{myGroup?.name}</span> •{' '}
            Project: <span className="font-bold text-white">{myProject?.title || 'Autonomous IoT Framework'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShow3DNavigator(!show3DNavigator)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
          >
            <Box className="w-4 h-4 text-indigo-200" />
            <span>{show3DNavigator ? 'Hide 3D View' : 'Inspect 3D Milestones'}</span>
          </button>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-black/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Turn In Deliverable</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Milestone Telemetry Navigator */}
      {show3DNavigator && (
        <div className="transition-all">
          <ProjectNexus3D
            height="340px"
            initialMode="architecture"
            title="My Capstone 3D Milestone Navigator"
            subtitle="Explore project nodes in 3D • Switch between Architecture, Velocity, and Risk Radar"
          />
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Enrolled Project
          </span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
            {myProject?.title || 'Capstone Project'}
          </p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
            {myGroup?.subjectCode} ({currentUser.semester || 'Sem VI'})
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Team Milestones
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {myGroup?.progressPercentage}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${myGroup?.progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            My Tasks Velocity
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completedPersonalTasks} / {personalTasks.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {personalTasks.length > 0
              ? `${Math.round((completedPersonalTasks / personalTasks.length) * 100)}% completed`
              : 'All caught up'}
          </span>
        </div>

        <div
          onClick={() => setIsContributionModalOpen(true)}
          className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 shadow-xs cursor-pointer hover:border-indigo-400 transition-all"
        >
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">
            My Viva Readiness Index
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            85 / 100
          </div>
          <span className="text-[11px] text-indigo-700/80 dark:text-indigo-300 mt-1 block flex items-center gap-1 font-semibold">
            <span>Inspect Verified Metrics</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Main Grid: My Tasks & Project Milestones Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 Cols): Personal Kanban Tasks Assigned to Student */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <span>My Assigned Sprint Tasks ({personalTasks.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tasks assigned to ID: {displayStudentId}. Updates sync in real-time.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedGroupId(myGroup.id);
                setActiveTab('kanban');
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Group Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {personalTasks.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  No Pending Individual Tasks!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You are all caught up with your sprint deliverables.
                </p>
              </div>
            ) : (
              personalTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {task.title}
                        </span>
                        <Badge
                          variant={
                            task.status === 'completed'
                              ? 'success'
                              : task.status === 'in_progress'
                              ? 'primary'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>

                  {/* Student Status Toggle Action */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Milestone: {task.milestoneTitle}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {task.status !== 'in_progress' && task.status !== 'completed' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] cursor-pointer"
                        >
                          Mark In Progress
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_review')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[11px] cursor-pointer"
                        >
                          Ready for Review
                        </button>
                      )}

                      {task.status === 'in_review' && (
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] cursor-pointer"
                        >
                          Mark Complete ✓
                        </button>
                      )}

                      {task.status === 'completed' && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right (5 Cols): Deliverables & Teacher Feedback */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Our Deliverables & Reviews</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official marks and feedback from project guides.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {groupSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {sub.milestoneTitle}
                      </span>
                      <Badge variant="neutral" size="sm">
                        v{sub.version}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      File: {sub.fileName} ({sub.fileSize})
                    </p>
                  </div>

                  <Badge
                    variant={
                      sub.status === 'approved'
                        ? 'success'
                        : sub.status === 'rework_requested'
                        ? 'warning'
                        : 'primary'
                    }
                    size="sm"
                  >
                    {sub.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {sub.review && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Evaluated by {sub.review.reviewerName}
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        Score: {sub.review.score} / {sub.review.maxScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      "{sub.review.feedback}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {myGroup && (
        <StudentSubmitModal
          group={myGroup}
          project={myProject}
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      )}

      {myGroup && (
        <ContributionModal
          group={myGroup}
          tasks={tasks}
          submissions={submissions}
          allUsers={allUsers}
          isOpen={isContributionModalOpen}
          onClose={() => setIsContributionModalOpen(false)}
        />
      )}
    </div>
  );
};
