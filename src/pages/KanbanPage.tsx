import React, { useState } from 'react';
import {
  Kanban as KanbanIcon,
  Plus,
  ExternalLink,
  Users,
  Award,
  Sparkles,
  Box,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { ContributionModal } from '../components/analytics/ContributionModal';
import { KanbanCard } from '../components/tasks/KanbanCard';
import { ProjectNexus3D } from '../components/3d/ProjectNexus3D';
import { TaskStatus, Task, StudentGroup } from '../types';

export const KanbanPage: React.FC = () => {
  const {
    groups,
    projects,
    tasks,
    submissions,
    allUsers,
    currentUser,
    selectedGroupId,
    setSelectedGroupId,
    updateTaskStatus,
    deleteTask,
    riskAssessments
  } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [show3DHelix, setShow3DHelix] = useState(false);

  // Identify active group
  const activeGroupId = selectedGroupId || groups[0]?.id;
  const currentGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const currentProject = projects.find((p) => p.id === currentGroup?.projectId);

  if (!currentGroup) {
    return (
      <div className="p-8 text-center text-slate-500">
        No student groups found. Please form or allocate groups first.
      </div>
    );
  }

  // Filter tasks for this group
  const groupTasks = tasks.filter(
    (t) =>
      t.groupId === currentGroup.id &&
      (priorityFilter === 'all' || t.priority === priorityFilter)
  );

  const columns: { id: TaskStatus; label: string; color: string; count: number }[] = [
    {
      id: 'todo',
      label: 'To Do / Backlog',
      color: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50',
      count: groupTasks.filter((t) => t.status === 'todo').length
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      color: 'border-blue-300 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20',
      count: groupTasks.filter((t) => t.status === 'in_progress').length
    },
    {
      id: 'in_review',
      label: 'In Peer / Faculty Review',
      color: 'border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20',
      count: groupTasks.filter((t) => t.status === 'in_review').length
    },
    {
      id: 'completed',
      label: 'Completed & Verified',
      color: 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20',
      count: groupTasks.filter((t) => t.status === 'completed').length
    }
  ];

  const now = new Date('2026-10-09T07:00:00Z');

  const currentGroupRisk = riskAssessments?.find((r) => r.groupId === currentGroup.id);
  const overdueCount = groupTasks.filter(
    (t) => t.status !== 'completed' && new Date(t.dueDate) < now
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls: Group Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Team:
          </label>
          <select
            value={currentGroup.id}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="text-sm font-extrabold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-xs cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} — {g.projectTitle.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShow3DHelix(!show3DHelix)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Box className="w-3.5 h-3.5 text-indigo-500" />
            <span>{show3DHelix ? 'Hide 3D Velocity' : '3D Velocity Helix'}</span>
          </button>

          <button
            onClick={() => setIsContributionModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Contribution Analytics</span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Kanban Task</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Velocity Helix Telemetry */}
      {show3DHelix && (
        <div className="animate-in fade-in">
          <ProjectNexus3D
            height="340px"
            initialMode="velocity"
            title={`${currentGroup.name} • 3D Sprint Velocity Helix`}
            subtitle="DNA spiral of code commits, milestone tasks, and verifiable student velocity"
          />
        </div>
      )}

      {/* Group Information & Team Roster Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {currentGroup.subjectCode}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {currentGroup.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Project: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentGroup.projectTitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {currentGroup.githubUrl && (
              <a
                href={currentGroup.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>GitHub Repo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Milestones Completed</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {currentGroup.progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Members Roster Pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Team Members ({currentGroup.members.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {currentGroup.members.map((m) => (
              <div
                key={m.userId}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center">
                  {m.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {m.name}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  ({m.rollNumber})
                </span>
                {m.roleInGroup === 'leader' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Leader
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Intelligence & Priority Filter Control Strip */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-medium">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-bold block sm:inline">Interactive Card Tooltips Active: </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              Hover over any card to view detailed project scope, assigned student velocity & AI-predicted risk radar. Click the info icon on any card to pin the tooltip.
            </span>
          </div>
        </div>

        {/* Priority Filter Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Filter:
          </span>
          {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setPriorityFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                priorityFilter === lvl
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = groupTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-3.5 flex flex-col min-h-[520px] transition-all`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {col.label}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {col.count}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                    No tasks in this lane
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      group={currentGroup}
                      project={currentProject}
                      allUsers={allUsers}
                      submissions={submissions}
                      allTasks={tasks}
                      riskAssessment={currentGroupRisk}
                      currentUser={currentUser}
                      columnId={col.id}
                      onUpdateStatus={updateTaskStatus}
                      onDeleteTask={deleteTask}
                      onOpenAnalytics={() => setIsContributionModalOpen(true)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        groupId={currentGroup.id}
      />

      <ContributionModal
        group={currentGroup}
        tasks={tasks}
        submissions={submissions}
        allUsers={allUsers}
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
      />
    </div>
  );
};
