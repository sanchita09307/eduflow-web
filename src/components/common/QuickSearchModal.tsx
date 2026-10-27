import React, { useState, useEffect } from 'react';
import { Search, FolderGit2, Users, FileCheck2, Kanban, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const { projects, groups, subjects, tasks, setActiveTab, setSelectedGroupId } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingSubjects = subjects.filter(
    (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );

  const matchingProjects = projects.filter(
    (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );

  const matchingGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.members.some((m) => m.name.toLowerCase().includes(q) || m.rollNumber.toLowerCase().includes(q))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, roll numbers (21CS042), teams, or syllabus codes..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {matchingGroups.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                Student Teams & Roster
              </span>
              {matchingGroups.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setSelectedGroupId(g.id);
                    setActiveTab('kanban');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{g.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">
                        {g.members.map((m) => m.name.split(' ')[0]).join(', ')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {matchingProjects.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                Capstone Projects
              </span>
              {matchingProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveTab('projects');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {p.title}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {matchingSubjects.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                Subjects & Syllabus
              </span>
              {matchingSubjects.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveTab('projects');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {s.code}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {s.name}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {matchingGroups.length === 0 && matchingProjects.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              No matching records found for "{query}". Try searching "MedFlow" or "21CS042".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate using click or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
