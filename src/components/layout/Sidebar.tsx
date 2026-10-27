import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Kanban,
  FileCheck2,
  Bot,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser, riskAssessments, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isTeacher = currentUser.role === 'teacher';
  const highRiskCount = riskAssessments.filter(
    (r) => r.riskLevel === 'high' || r.riskLevel === 'critical'
  ).length;

  interface NavItem {
    id: string;
    path: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', path: '/dashboard', label: 'Teacher Overview', icon: LayoutDashboard },
    { id: 'projects', path: '/projects', label: 'Subjects & Projects', icon: FolderGit2 },
    { id: 'kanban', path: '/kanban', label: 'Group Tasks & Kanban', icon: Kanban },
    { id: 'submissions', path: '/submissions', label: 'Submissions & Review', icon: FileCheck2 },
    {
      id: 'ai-assistant',
      path: '/ai-assistant',
      label: 'AI Risk & Assistant',
      icon: Bot,
      badge: highRiskCount > 0 ? `${highRiskCount} alerts` : undefined
    }
  ];

  const studentNavItems: NavItem[] = [
    { id: 'student-portal', path: '/student-portal', label: 'My Project Hub', icon: GraduationCap },
    { id: 'kanban', path: '/kanban', label: 'Team Kanban Board', icon: Kanban },
    { id: 'submissions', path: '/submissions', label: 'My Deliverables', icon: FileCheck2 },
    { id: 'ai-assistant', path: '/ai-assistant', label: 'AI Project Advisor', icon: Sparkles }
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-white dark:bg-[#0d1527] text-slate-700 dark:text-slate-300 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-4.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#090f1d]">
            <div
              className="flex items-center gap-3 cursor-pointer overflow-hidden"
              onClick={() => handleNavClick(isTeacher ? '/dashboard' : '/student-portal')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                      Edu<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                      SaaS
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    College Project Management
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Current Role Server Verification Badge */}
          {!collapsed ? (
            <div className="mx-3.5 my-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isTeacher ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {isTeacher ? 'Faculty Portal' : 'Student Portal'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800/80">
                Server Verified
              </span>
            </div>
          ) : (
            <div className="flex justify-center my-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isTeacher
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                }`}
                title={isTeacher ? 'Faculty Guide (Server Verified)' : 'Student Contributor (Server Verified)'}
              >
                {isTeacher ? 'T' : 'S'}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-2.5 space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#090f1d]/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isTeacher
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                }`}
              >
                {currentUser.name.charAt(0)}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.rollNumber || currentUser.collegeId || (isTeacher ? 'FACULTY' : 'STUDENT')}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
