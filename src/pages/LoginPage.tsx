import React, { useState, Suspense, useEffect } from 'react';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  IdCard,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

// Lazy load heavy 3D Nexus scene
const ProjectNexus3D = React.lazy(() =>
  import('../components/3d/ProjectNexus3D').then((m) => ({ default: m.ProjectNexus3D }))
);

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onGoToLanding }) => {
  const { setCurrentUser, setIsAuthenticated, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regId, setRegId] = useState('');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regSemester, setRegSemester] = useState('Semester VI');

  // Check client motion preference and viewport
  const [disable3D, setDisable3D] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setDisable3D(isMobile || prefersReducedMotion);
  }, []);

  // Password validation checks
  const isLengthValid = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasDigit = /\d/.test(regPassword);
  const isPasswordStrong = isLengthValid && hasUpper && hasLower && hasDigit;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your college email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await api.auth.login({
        email: email.trim(),
        password: password,
      });

      setCurrentUser(user);
      setIsAuthenticated(true);
      addToast({
        title: `Welcome back, ${user.name}`,
        message: `Authenticated as ${user.role === 'teacher' ? 'Faculty In-Charge' : 'Student'} (${user.department}).`,
        type: 'success',
      });
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (!isPasswordStrong) {
      setErrorMessage('Password must be at least 8 characters and include uppercase, lowercase, and numbers.');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await api.auth.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        department: regDept,
        rollNumber: regId.trim() || undefined,
        collegeId: regId.trim() || undefined,
        semester: regSemester,
      });

      setCurrentUser(user);
      setIsAuthenticated(true);
      addToast({
        title: `Registration Complete`,
        message: `Student account created for ${user.name}. Welcome to EduFlow!`,
        type: 'success',
      });
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      setEmail('sharma.cse@engg.edu.in');
      setPassword('Teacher@2026!');
    } else {
      setEmail('aditya.21cs042@engg.edu.in');
      setPassword('Student@2026!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden select-none">
      {/* Left Column: 3D Visualization / Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 border-r border-slate-800/80">
        {!disable3D ? (
          <Suspense fallback={<div className="absolute inset-0 bg-slate-950" />}>
            <div className="absolute inset-0 z-0 opacity-70">
              <ProjectNexus3D />
            </div>
          </Suspense>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />
        )}

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={onGoToLanding}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight flex items-center gap-2">
                <span>Edu<span className="text-indigo-400">Flow</span></span>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400">College Project Evaluation System</p>
            </div>
          </div>

          <button
            onClick={onGoToLanding}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md transition-colors"
          >
            ← View Product Landing
          </button>
        </div>

        {/* Hero Pitch */}
        <div className="relative z-10 max-w-md space-y-4 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Session 2026–2027</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Teacher-First Engineering Capstone Governance.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Continuous milestone evaluation, individual student Git audit trail, explainable heuristic risk telemetry, and automated IEEE project viva rubrics.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="text-lg font-extrabold text-indigo-400">100%</div>
              <div className="text-xs text-slate-400">Rubric Adherence</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="text-lg font-extrabold text-emerald-400">Argon2id</div>
              <div className="text-xs text-slate-400">Enterprise Security</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-4">
          <span>Engineered for Indian Engineering Colleges</span>
          <span>FastAPI + PyJWT Backend Active</span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 relative z-10 bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="flex md:hidden items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Edu<span className="text-indigo-400">Flow</span>
              </span>
            </div>
            <button
              onClick={onGoToLanding}
              className="text-xs text-slate-400 hover:text-white"
            >
              Landing →
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'signin' ? 'Sign in to EduFlow' : 'Create Student Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {activeTab === 'signin'
                ? 'Enter your college email to access your project dashboard.'
                : 'Register as an engineering student to submit deliverables.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Register
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  College Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sharma.cse@engg.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password *
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Verified Demo Credential Shortcuts */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block text-center">
                  Prefill Verified Test Credentials
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('teacher')}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-left text-xs transition-colors"
                  >
                    <div className="font-bold text-indigo-400">Teacher Account</div>
                    <div className="text-[10px] text-slate-400 font-mono">Prof. Sharma</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('student')}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-left text-xs transition-colors"
                  >
                    <div className="font-bold text-emerald-400">Student Leader</div>
                    <div className="text-[10px] text-slate-400 font-mono">Aditya (21CS042)</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Sneha Kulkarni"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  College Email *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. sneha.21cs088@engg.edu.in"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Roll No / Student ID
                  </label>
                  <input
                    type="text"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="e.g. 21CS088"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Semester
                  </label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Semester VI">Semester VI</option>
                    <option value="Semester VII">Semester VII</option>
                    <option value="Semester VIII">Semester VIII</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Engineering Department *
                </label>
                <input
                  type="text"
                  required
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Account Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 8 characters with upper, lower & digit"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />

                {/* Password strength ticks */}
                {regPassword.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                    <span className={isLengthValid ? 'text-emerald-400' : 'text-slate-500'}>
                      {isLengthValid ? '✓' : '•'} 8+ characters
                    </span>
                    <span className={hasUpper ? 'text-emerald-400' : 'text-slate-500'}>
                      {hasUpper ? '✓' : '•'} Uppercase letter
                    </span>
                    <span className={hasLower ? 'text-emerald-400' : 'text-slate-500'}>
                      {hasLower ? '✓' : '•'} Lowercase letter
                    </span>
                    <span className={hasDigit ? 'text-emerald-400' : 'text-slate-500'}>
                      {hasDigit ? '✓' : '•'} Number (0-9)
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Notice: Teachers and coordinators are created strictly by college seed data or university administrators.
              </p>

              <button
                type="submit"
                disabled={isLoading || !isPasswordStrong}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isLoading ? <span>Registering...</span> : <span>Create Student Account</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
