import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import {
  Clock,
  User as UserIcon,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Trash2,
  ExternalLink,
  Users,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  FolderGit2,
  Target,
  Copy,
  Check,
  Pin,
  PinOff,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Task, StudentGroup, Project, User, Submission, RiskAssessment, TaskPriority, TaskStatus } from '../../types';
import { Badge } from '../common/Badge';
import { calculateStudentContributions } from '../../services/analyticsEngine';

interface KanbanCardProps {
  task: Task;
  group: StudentGroup;
  project?: Project;
  allUsers: User[];
  submissions: Submission[];
  allTasks: Task[];
  riskAssessment?: RiskAssessment;
  currentUser: User;
  columnId: TaskStatus;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAnalytics?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  group,
  project,
  allUsers,
  submissions,
  allTasks,
  riskAssessment,
  currentUser,
  columnId,
  onUpdateStatus,
  onDeleteTask,
  onOpenAnalytics
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    placement: 'left' | 'right' | 'top' | 'bottom';
  }>({ top: 0, left: 0, placement: 'right' });

  const cardRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const now = new Date('2026-10-09T07:00:00Z');
  const taskDueDate = new Date(task.dueDate);
  const isOverdue = task.status !== 'completed' && taskDueDate < now;
  const daysDiff = Math.round((taskDueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

  // Determine Milestone Details
  const matchedMilestone = project?.milestones.find(
    (m) => m.id === task.milestoneId || m.title === task.milestoneTitle
  );
  const milestoneDueDate = matchedMilestone ? new Date(matchedMilestone.deadline) : null;
  const isMilestoneOverdue = milestoneDueDate ? milestoneDueDate < now : false;

  // Student analytics
  const studentContributions = calculateStudentContributions(group, allTasks, submissions, allUsers);
  const assignedStudentStats = studentContributions.find((s) => s.userId === task.assignedToId);
  const assignedStudentUser = allUsers.find((u) => u.id === task.assignedToId);
  const isLeader = group.leaderId === task.assignedToId;

  // AI Risk Prediction for this specific Task
  const calculateTaskRisk = () => {
    let score = riskAssessment ? Math.round(riskAssessment.riskScore * 0.4) : 15;
    const reasons: { text: string; severity: 'danger' | 'warning' | 'info' }[] = [];

    // Overdue condition
    if (isOverdue) {
      const daysOver = Math.abs(daysDiff);
      score += Math.min(45, 20 + daysOver * 5);
      reasons.push({
        text: `Task breached due date by ${daysOver} day${daysOver > 1 ? 's' : ''}`,
        severity: 'danger'
      });
    } else if (daysDiff <= 2 && task.status !== 'completed') {
      score += 15;
      reasons.push({
        text: `Urgent deadline: due in ${daysDiff <= 0 ? 'today' : `${daysDiff} day${daysDiff > 1 ? 's' : ''}`}`,
        severity: 'warning'
      });
    }

    // Priority weighting
    if (task.priority === 'urgent' && task.status !== 'completed') {
      score += 20;
      reasons.push({
        text: 'Urgent critical-path blocker flag enabled',
        severity: 'danger'
      });
    } else if (task.priority === 'high' && task.status !== 'completed') {
      score += 10;
      reasons.push({
        text: 'High-priority deliverable requires prompt completion',
        severity: 'warning'
      });
    }

    // Milestone dependency
    if (matchedMilestone) {
      if (isMilestoneOverdue && task.status !== 'completed') {
        score += 25;
        reasons.push({
          text: `Parent milestone "${matchedMilestone.title}" deadline has already elapsed`,
          severity: 'danger'
        });
      } else if (milestoneDueDate) {
        const daysToMilestone = Math.round((milestoneDueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysToMilestone <= 5 && task.status !== 'completed') {
          score += 12;
          reasons.push({
            text: `Milestone deliverable due in ${daysToMilestone} days (${matchedMilestone.weightage}% weightage)`,
            severity: 'warning'
          });
        }
      }
    }

    // Student workload check
    if (assignedStudentStats && assignedStudentStats.status === 'needs_attention') {
      score += 12;
      reasons.push({
        text: `Assignee velocity alert: ${assignedStudentStats.taskCompletionRate}% completion rate across sprint`,
        severity: 'warning'
      });
    }

    // If completed, risk drops to minimal
    if (task.status === 'completed') {
      score = 5;
    }

    score = Math.min(100, Math.max(5, score));

    let level: 'critical' | 'high' | 'medium' | 'low' = 'low';
    let recommendation = 'Deliverable on schedule. Maintain normal weekly cadence.';

    if (task.status === 'completed') {
      level = 'low';
      recommendation = 'Deliverable successfully executed and archived in sprint registry.';
    } else if (score >= 65 || isOverdue) {
      level = 'critical';
      recommendation = `High risk of milestone bottleneck. Convene pair-review with team lead ${group.leaderName} to unblock before faculty evaluation.`;
    } else if (score >= 40) {
      level = 'high';
      recommendation = 'Elevated delay risk. Prioritize this task in today’s standup to protect sprint milestones.';
    } else if (score >= 25) {
      level = 'medium';
      recommendation = 'Monitor completion rate over the next 48 hours to prevent deadline slippage.';
    }

    return {
      score,
      level,
      reasons,
      recommendation
    };
  };

  const taskRisk = calculateTaskRisk();

  // Position calculation for floating tooltip
  const updateTooltipPosition = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const tooltipWidth = 380;
    const tooltipHeight = 440;
    const padding = 14;

    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;

    let placement: 'left' | 'right' | 'top' | 'bottom' = 'right';
    let left = rect.right + 12;
    let top = rect.top;

    // If there's not enough space on the right, place on the left
    if (spaceRight < tooltipWidth + padding && spaceLeft > tooltipWidth + padding) {
      placement = 'left';
      left = rect.left - tooltipWidth - 12;
    } else if (spaceRight < tooltipWidth + padding && spaceLeft < tooltipWidth + padding) {
      // Fallback: place above or below
      placement = 'bottom';
      left = Math.max(padding, Math.min(rect.left, window.innerWidth - tooltipWidth - padding));
      top = rect.bottom + 10;
    }

    // Constrain top/bottom within viewport
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = Math.max(padding, window.innerHeight - tooltipHeight - padding);
    }
    if (top < padding) {
      top = padding;
    }

    setTooltipPos({ top, left, placement });
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    updateTooltipPosition();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    if (isPinned) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
    if (!isHovered) {
      updateTooltipPosition();
      setIsHovered(true);
    }
  };

  const handleCopyTaskInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `Task: ${task.title}\nAssignee: ${task.assignedToName} (${task.assignedToRoll || 'Student'})\nProject: ${group.projectTitle}\nStatus: ${task.status}\nPriority: ${task.priority}\nDue Date: ${task.dueDate}\nAI Risk: ${taskRisk.level.toUpperCase()} (Index: ${taskRisk.score}/100)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isHovered || isPinned)) {
        setIsHovered(false);
        setIsPinned(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, isPinned]);

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
      default:
        return 'neutral';
    }
  };

  const getRiskColor = (level: 'critical' | 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'critical':
        return {
          pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
          dot: 'bg-rose-500 animate-pulse',
          border: 'hover:border-rose-400 dark:hover:border-rose-700 hover:shadow-rose-500/10',
          badge: 'bg-rose-500 text-white'
        };
      case 'high':
        return {
          pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          dot: 'bg-amber-500 animate-pulse',
          border: 'hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-amber-500/10',
          badge: 'bg-amber-500 text-white'
        };
      case 'medium':
        return {
          pill: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
          dot: 'bg-blue-500',
          border: 'hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-blue-500/10',
          badge: 'bg-blue-500 text-white'
        };
      case 'low':
      default:
        return {
          pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
          dot: 'bg-emerald-500',
          border: 'hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-indigo-500/10',
          badge: 'bg-emerald-600 text-white'
        };
    }
  };

  const riskStyle = getRiskColor(taskRisk.level);
  const showTooltip = isHovered || isPinned;

  return (
    <>
      {/* Kanban Board Card Element */}
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`group relative p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 space-y-2.5 ${
          riskStyle.border
        } ${isPinned ? 'ring-2 ring-indigo-500 shadow-md' : ''}`}
      >
        {/* Top Header: Priority Badge & AI Risk Chip & Actions */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
              {task.priority.toUpperCase()}
            </Badge>

            {/* AI Risk Quick Micro-Pill */}
            <button
              onClick={togglePin}
              title={`AI Risk: ${taskRisk.level.toUpperCase()} (${taskRisk.score}/100) • Click to pin details`}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border transition-all cursor-pointer ${
                riskStyle.pill
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot}`} />
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI {taskRisk.level}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Tooltip info / Pin button */}
            <button
              onClick={togglePin}
              className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                isPinned
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isPinned ? 'Unpin interactive tooltip' : 'Pin interactive tooltip'}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
            </button>

            {currentUser.role === 'teacher' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Milestone Tag */}
        {task.milestoneTitle && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg truncate border border-indigo-100 dark:border-indigo-900/50">
            <Target className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{task.milestoneTitle}</span>
          </div>
        )}

        {/* Assignee & Due Date Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium min-w-0">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
              {task.assignedToName.charAt(0)}
            </div>
            <span className="truncate max-w-[85px] font-bold">
              {task.assignedToName.split(' ')[0]}
            </span>
            {task.assignedToRoll && (
              <span className="text-[10px] text-slate-400 font-mono">
                ({task.assignedToRoll})
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 font-semibold shrink-0 ${
              isOverdue
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>
              {new Date(task.dueDate).toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
              })}
            </span>
            {isOverdue && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                Late
              </span>
            )}
          </div>
        </div>

        {/* Status Movement Controls */}
        <div className="flex items-center justify-between pt-1 gap-1">
          {columnId !== 'todo' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const prevStatus: Record<TaskStatus, TaskStatus> = {
                  todo: 'todo',
                  in_progress: 'todo',
                  in_review: 'in_progress',
                  completed: 'in_review'
                };
                onUpdateStatus(task.id, prevStatus[columnId]);
              }}
              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Move back"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          )}

          <div className="flex-1" />

          {columnId !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextStatus: Record<TaskStatus, TaskStatus> = {
                  todo: 'in_progress',
                  in_progress: 'in_review',
                  in_review: 'completed',
                  completed: 'completed'
                };
                const targetNext = nextStatus[columnId];
                onUpdateStatus(task.id, targetNext);
                if (targetNext === 'completed') {
                  confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.6 }
                  });
                }
              }}
              className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Advance task"
            >
              <span>Advance</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Interactive Tooltip Portal */}
      {showTooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            style={{
              position: 'fixed',
              top: `${tooltipPos.top}px`,
              left: `${tooltipPos.left}px`,
              zIndex: 9999
            }}
            className="w-[380px] max-w-[94vw] max-h-[88vh] overflow-y-auto rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 p-4 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header: AI Risk & Interactive Pin/Copy Actions */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>AI Telemetry</span>
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ${riskStyle.pill}`}
                  >
                    {taskRisk.level.toUpperCase()} RISK
                  </span>
                </div>
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight line-clamp-1">
                  {task.title}
                </h5>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCopyTaskInfo}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy task info to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={togglePin}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isPinned
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isPinned ? 'Unpin tooltip' : 'Pin tooltip open'}
                >
                  {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* SECTION 1: AI-PREDICTED RISKS */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                  <span>AI Risk Prediction</span>
                </span>
                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                  Index: <span className="text-indigo-600 dark:text-indigo-400">{taskRisk.score}</span>/100
                </span>
              </div>

              {/* Risk Score Progress Meter */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    taskRisk.level === 'critical'
                      ? 'bg-rose-500'
                      : taskRisk.level === 'high'
                      ? 'bg-amber-500'
                      : taskRisk.level === 'medium'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${taskRisk.score}%` }}
                />
              </div>

              {/* Risk Reasons Checklist */}
              {taskRisk.reasons.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {taskRisk.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      {r.severity === 'danger' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {r.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pedagogical AI Recommendation */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 italic flex items-start gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>AI Suggestion:</strong> {taskRisk.recommendation}</span>
              </div>
            </div>

            {/* SECTION 2: PROJECT & MILESTONE DETAILS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <FolderGit2 className="w-3 h-3 text-indigo-500" />
                <span>Project & Milestone Context</span>
              </span>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {group.subjectCode}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {group.projectTitle}
                    </span>
                  </div>
                  {project?.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Milestone Details */}
                {matchedMilestone ? (
                  <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-indigo-900 dark:text-indigo-200">
                        {matchedMilestone.title}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {matchedMilestone.weightage}% Weight
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        <span>Deadline: {new Date(matchedMilestone.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                      {isMilestoneOverdue ? (
                        <span className="font-bold text-rose-500">Overdue</span>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">On Schedule</span>
                      )}
                    </div>
                  </div>
                ) : (
                  task.milestoneTitle && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Milestone: <span className="font-bold">{task.milestoneTitle}</span>
                    </div>
                  )
                )}

                {/* Team Progress & Repo */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-slate-500">Team: </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{group.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {group.progressPercentage}% done
                    </span>
                    {group.githubUrl && (
                      <a
                        href={group.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ASSIGNED STUDENT & COLLABORATORS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-500" />
                <span>Assigned Student & Team Velocity</span>
              </span>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                {/* Primary Student Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {task.assignedToName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {task.assignedToName}
                        </span>
                        {isLeader && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Leader
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Roll: {task.assignedToRoll || assignedStudentUser?.rollNumber || 'Enrolled'} • {assignedStudentUser?.department || group.subjectCode}
                      </span>
                    </div>
                  </div>

                  {assignedStudentStats && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Score</span>
                      <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                        {assignedStudentStats.contributionScore}/100
                      </span>
                    </div>
                  )}
                </div>

                {/* Velocity Stats Grid */}
                {assignedStudentStats && (
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                      <span className="text-[9px] text-slate-400 block font-bold">Done Tasks</span>
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                        {assignedStudentStats.completedTasks}/{assignedStudentStats.totalAssignedTasks}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                      <span className="text-[9px] text-slate-400 block font-bold">Velocity</span>
                      <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                        {assignedStudentStats.taskCompletionRate}%
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                      <span className="text-[9px] text-slate-400 block font-bold">Status</span>
                      <span className="font-extrabold text-[10px] capitalize text-slate-800 dark:text-slate-200">
                        {assignedStudentStats.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Team Collaborators Pills */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Team Co-Authors ({group.members.length - 1} peers):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.members
                      .filter((m) => m.userId !== task.assignedToId)
                      .map((m) => (
                        <div
                          key={m.userId}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-700 text-[8px] font-bold flex items-center justify-center">
                            {m.name.charAt(0)}
                          </div>
                          <span>{m.name.split(' ')[0]}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer inside Tooltip */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {onOpenAnalytics && (
                <button
                  onClick={() => {
                    setIsHovered(false);
                    setIsPinned(false);
                    onOpenAnalytics();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Activity className="w-3 h-3 text-indigo-500" />
                  <span>Team Contribution Analytics</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsHovered(false);
                  setIsPinned(false);
                }}
                className="ml-auto text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
