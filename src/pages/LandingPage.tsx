import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Kanban,
  FileCheck2,
  TrendingUp,
  Award,
  Bot,
  Users,
  CheckCircle2,
  Building2,
  ChevronRight,
  LogIn,
  Box,
  Sun,
  Moon,
  UserPlus,
  IdCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectNexus3D } from '../components/3d/ProjectNexus3D';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenLogin }) => {
  const {
    currentUser,
    isAuthenticated,
    switchRole,
    setActiveTab,
    setIsAuthenticated,
    theme,
    toggleTheme
  } = useApp();

  const handleEnterCurrentSession = () => {
    setIsAuthenticated(true);
    if (currentUser.role === 'teacher') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('student-portal');
    }
    onEnterApp();
  };

  const handleEnterAsTeacher = () => {
    switchRole('teacher');
    setActiveTab('dashboard');
    setIsAuthenticated(true);
    onEnterApp();
  };

  const handleEnterAsStudent = () => {
    switchRole('student');
    setActiveTab('student-portal');
    setIsAuthenticated(true);
    onEnterApp();
  };

  const currentDisplayId =
    currentUser.rollNumber ||
    currentUser.collegeId ||
    (currentUser.role === 'teacher' ? 'FAC-CSE-01' : '21CS042');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-18 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Edu<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                SaaS
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Indian College Project Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}

          <button
            onClick={handleEnterCurrentSession}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-14 pb-18 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Tailored for NAAC & NBA Accredited Engineering Colleges</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Teacher-First College Project Management &{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
            Continuous Viva Evaluation
          </span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Say goodbye to fragmented WhatsApp updates and unverified spreadsheets. EduFlow unites Google Classroom assignments, Trello Kanban boards, and 3D interactive telemetry.
        </p>

        {/* Dynamic CTA Banner: Shows current registered user and their ID */}
        <div className="max-w-xl mx-auto p-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  ID: {currentDisplayId}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {currentUser.role === 'teacher' ? 'Faculty In-Charge' : 'Enrolled Student'} • {currentUser.department}
              </p>
            </div>
          </div>

          <button
            onClick={handleEnterCurrentSession}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Launch This Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Student / Teacher Account</span>
            </button>
          )}

          <button
            onClick={handleEnterAsTeacher}
            className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Switch to Faculty (Prof. Sharma)</span>
          </button>

          <button
            onClick={handleEnterAsStudent}
            className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Switch to Student (Aditya Verma)</span>
          </button>
        </div>

        {/* Interactive 3D Model Telemetry Showcase in Hero */}
        <div className="pt-8 max-w-4xl mx-auto">
          <ProjectNexus3D
            height="380px"
            initialMode="architecture"
            title="Interactive 3D Capstone Architecture Nexus"
            subtitle="Switch between Architecture, Sprint Velocity Helix, and AI Risk Radar • Drag to inspect"
          />
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-6 lg:px-12 py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Built for the Specific Challenges of College Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Engineered for final-year Capstone (Phase I & II), Mini-Projects, and distributed lab courses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kanban Velocity & Student Accountability
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Break milestones into student-assigned backlog tasks with priority deadlines. Prevent free-riding with verified individual activity tracking.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Explainable AI Heuristic Risk Alerts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detect delayed teams weeks before semester viva. Algorithmic factor breakdowns pinpoint overdue milestones and prolonged inactivity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Version Deliverable Audit & Feedback
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Track v1 drafts, faculty rework requests, and v2 revisions with complete timestamp history. Never lose a student paper or git link again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 lg:px-12 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 EduFlow SaaS Platform. Designed for Indian University College Systems.</p>
      </footer>
    </div>
  );
};
