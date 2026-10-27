import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  BookOpen,
  Calendar,
  Users,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { CreateSubjectModal } from '../components/projects/CreateSubjectModal';

export const ProjectsPage: React.FC = () => {
  const {
    subjects,
    projects,
    groups,
    selectedSubjectId,
    setSelectedSubjectId,
    setActiveTab,
    setSelectedGroupId
  } = useApp();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects =
    selectedSubjectId === 'all'
      ? subjects
      : subjects.filter((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Curriculum Subjects & Projects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define project guidelines once, set milestone deadline rubrics, and map across student teams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Capstone Project</span>
          </button>
        </div>
      </div>

      {/* Subjects & Associated Projects List */}
      <div className="space-y-8">
        {filteredSubjects.map((subject) => {
          const subjectProjects = projects.filter(
            (p) =>
              p.subjectId === subject.id &&
              (searchQuery === '' ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          const subjectGroups = groups.filter((g) => g.subjectId === subject.id);

          return (
            <div
              key={subject.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6"
            >
              {/* Subject Title & Info Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {subject.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {subject.semester} • {subject.academicYear}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                    {subject.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <div>
                    <span className="block text-slate-400 text-[11px]">Projects</span>
                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                      {subjectProjects.length}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[11px]">Groups Mapped</span>
                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                      {subjectGroups.length} Teams
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 gap-5">
                {subjectProjects.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                    <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No Projects Configured Yet for {subject.code}
                    </p>
                    <p className="text-xs text-slate-500">
                      Create a project once and allocate multiple student teams to work on it.
                    </p>
                    <button
                      onClick={() => setIsProjectModalOpen(true)}
                      className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Project Now</span>
                    </button>
                  </div>
                ) : (
                  subjectProjects.map((project) => {
                    const assignedGroups = groups.filter((g) =>
                      project.assignedGroupIds.includes(g.id)
                    );

                    return (
                      <div
                        key={project.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                      >
                        {/* Project Title & Guidelines */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                              {project.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {project.description}
                            </p>
                            {project.instructions && (
                              <div className="text-[11px] text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800/80 mt-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  Instructions:
                                </span>{' '}
                                {project.instructions}
                              </div>
                            )}
                          </div>

                          <Badge variant="primary" size="md">
                            Weightage: {project.weightageTotal}%
                          </Badge>
                        </div>

                        {/* Interactive Milestone Timeline */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                            Milestone Evaluation Timeline ({project.milestones.length} Stages)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                            {project.milestones.map((ms, idx) => (
                              <div
                                key={ms.id}
                                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    Stage {idx + 1}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                    {ms.weightage}%
                                  </span>
                                </div>
                                <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                  {ms.title}
                                </p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{new Date(ms.deadline).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Assigned Student Groups */}
                        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-500">
                              Assigned Teams ({assignedGroups.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {assignedGroups.map((g) => (
                                <button
                                  key={g.id}
                                  onClick={() => {
                                    setSelectedGroupId(g.id);
                                    setActiveTab('kanban');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200/80 dark:border-indigo-800 transition-colors cursor-pointer"
                                >
                                  {g.name} ({g.progressPercentage}%)
                                </button>
                              ))}
                              {assignedGroups.length === 0 && (
                                <span className="text-slate-400 italic">
                                  No groups mapped yet
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (assignedGroups[0]) {
                                  setSelectedGroupId(assignedGroups[0].id);
                                  setActiveTab('kanban');
                                }
                              }}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Inspect Group Progress</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <CreateSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
      />
    </div>
  );
};
