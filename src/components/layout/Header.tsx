import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Info,
  X,
  LogOut,
  ChevronDown,
  UserPlus,
  BadgeCheck,
  Sparkles,
  IdCard,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    currentUser,
    allUsers,
    selectUser,
    switchRole,
    activeTab,
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    notifications,
    theme,
    toggleTheme,
    resetToDefaultData,
    setIsSearchOpen,
    logout
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Teacher Command Center',
      subtitle: 'Monitor student milestones, risk indicators, and review deliverables.'
    },
    projects: {
      title: 'Subjects & Capstone Projects',
      subtitle: 'Manage curriculum, assign projects to multiple groups, and configure rubrics.'
    },
    kanban: {
      title: 'Group Tasks & Kanban Board',
      subtitle: 'Live task velocity, blockers, and individual student responsibility.'
    },
    submissions: {
      title: 'Milestone Deliverables & Review',
      subtitle: 'Audit multi-version files, provide line feedback, and assign viva marks.'
    },
    'ai-assistant': {
      title: 'AI Project Advisor & Risk Engine',
      subtitle: 'Explainable heuristic risk assessments and natural language assistance.'
    },
    'student-portal': {
      title: 'Student Project Hub',
      subtitle: 'Track your assigned group milestones, upload deliverables, and view reviews.'
    }
  };

  const currentMeta = titles[activeTab] || {
    title: 'EduFlow Portal',
    subtitle: 'Indian College Project Evaluation & Monitoring'
  };

  const unreadNotifs = notifications.filter((n) => !n.read);

  const currentDisplayId =
    currentUser.rollNumber ||
    currentUser.collegeId ||
    (currentUser.role === 'teacher' ? 'FAC-CSE-01' : '21CS042');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg md:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right: Subject Filter & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Subject Filter (Teacher view) */}
        {currentUser.role === 'teacher' && (
          <div className="hidden lg:flex items-center">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Subjects (3 Active)</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Search Shortcut */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Quick Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] text-slate-500 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* ACTIVE ACCOUNT PILL WITH EXPLICIT ID & QUICK SWITCHER */}
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-indigo-50/80 dark:bg-slate-800/90 hover:bg-indigo-100/70 dark:hover:bg-slate-750 border border-indigo-200/90 dark:border-indigo-900/60 transition-all cursor-pointer group shadow-2xs"
            title="Active Account & Verified ID • Click to Switch"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-300 dark:ring-indigo-700 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            )}

            <div className="text-left hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[130px] leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 leading-tight">
                <IdCard className="w-2.5 h-2.5 text-indigo-500" />
                <span>ID: {currentDisplayId}</span>
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Authenticated Account Dropdown */}
          {showAccountDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Verified College Profile
                </span>
                <button
                  onClick={() => setShowAccountDropdown(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      currentUser.role === 'teacher'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                    }`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded font-bold uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {currentUser.role === 'teacher' ? 'Faculty Guide' : 'Enrolled Student'}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ID: {currentDisplayId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate">
                    {currentUser.department}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of EduFlow</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Notifications ({notifications.length})
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start gap-3">
                    {n.type === 'danger' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    ) : n.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all demo records back to initial college state?')) {
              resetToDefaultData();
            }
          }}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Reset sample data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
          title="Sign Out / Switch Profile"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
