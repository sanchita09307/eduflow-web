import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  FileText,
  Users,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tags?: string[];
}

export const AIAssistantPage: React.FC = () => {
  const { groups, projects, tasks, submissions, riskAssessments, subjects, currentUser, selectedSubjectId } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am your **EduFlow Project Intelligence Assistant** (ID Session: ${currentUser.rollNumber || currentUser.collegeId || 'Active'}). I continuously evaluate milestone timelines, Kanban velocity, and delivery recency across all academic project groups.\n\nAsk me anything about group risks, overdue milestones, student workload, or viva rubrics.`,
      timestamp: 'Just now',
      tags: ['Heuristic Risk Engine', 'Viva Readiness']
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    'Which groups are currently at high risk and why?',
    'Summarize CS601 Capstone Phase-I batch progress',
    'Which students have pending or overdue tasks?',
    'Generate an internal viva evaluation rubric for capstone defense'
  ];

  const generateAssistantResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. High risk inquiry
    if (q.includes('risk') || q.includes('delayed') || q.includes('behind')) {
      const highRisk = riskAssessments.filter(
        (r) => r.riskLevel === 'high' || r.riskLevel === 'critical'
      );
      if (highRisk.length === 0) {
        return `✅ **Batch Risk Assessment:** All student teams are currently tracking within acceptable velocity limits. No critical milestone breaches detected.`;
      }
      return `⚠️ **Heuristic Risk Diagnosis Report:**\n\n${highRisk
        .map(
          (r, idx) =>
            `**${idx + 1}. ${r.groupName} (${r.subjectCode})**\n- **Risk Status:** ${r.riskLevel.toUpperCase()} (Score: ${r.riskScore}/100)\n- **Primary Bottlenecks:** ${r.factors.map((f) => f.factor).join('; ')}\n- **Faculty Intervention:** ${r.recommendation}\n- **Inactivity:** ${r.daysSinceLastSubmission} days since last artifact.`
        )
        .join('\n\n')}`;
    }

    // 2. Batch summary
    if (q.includes('summarize') || q.includes('summary') || q.includes('cs601') || q.includes('progress')) {
      const totalGroups = groups.length;
      const avgProgress = Math.round(
        groups.reduce((acc, g) => acc + g.progressPercentage, 0) / totalGroups
      );
      const pendingSubms = submissions.filter((s) => s.status === 'under_review').length;

      return `📊 **Curriculum Progress Summary (CS601 & Active Labs):**\n\n- **Total Active Teams:** ${totalGroups} Groups (${groups.reduce((acc, g) => acc + g.members.length, 0)} Students)\n- **Batch Milestone Completion Rate:** ${avgProgress}%\n- **Deliverables Pending Faculty Grading:** ${pendingSubms} files\n- **Highest Performing Team:** Team Synapse (Group 04) at 68% milestone completion with verified edge hardware.\n- **Action Required:** Group 09 (PulseGuard) requires milestone 1 rework re-check.`;
    }

    // 3. Overdue or pending student tasks
    if (q.includes('task') || q.includes('student') || q.includes('overdue')) {
      const overdueTasks = tasks.filter((t) => t.status !== 'completed');
      return `📋 **Active Kanban Workload & Student Assignment Audit:**\n\nCurrently, **${overdueTasks.length} open tasks** are being tracked across teams:\n\n${overdueTasks
        .slice(0, 5)
        .map(
          (t) =>
            `- **${t.assignedToName}** (${t.assignedToRoll || 'Student'}): "${t.title}" — *Status: ${t.status.toUpperCase()}* (Due: ${t.dueDate})`
        )
        .join('\n')}\n\n*Advisory: Rohan Sen (21CS061) has 2 pending tasks on the critical path for Group 04.*`;
    }

    // 4. Viva Rubric Generation
    if (q.includes('rubric') || q.includes('viva') || q.includes('defense') || q.includes('evaluation')) {
      return `🎯 **Standardized Internal Viva Voce Rubric (50 Marks Total):**\n\n1. **Technical Soundness & Architecture (15 Marks)**\n   - System modularity, database normalization, protocol selection, and edge hardware design.\n\n2. **Live Implementation & Working Prototype (15 Marks)**\n   - Live terminal / hardware execution, test coverage >= 80%, zero crash during demo.\n\n3. **Individual Contribution & Q&A Defense (10 Marks)**\n   - Student-specific explanation of code authored, Git commit history audit.\n\n4. **Documentation & University Compliance (10 Marks)**\n   - IEEE format, plagiarism report under 15%, comprehensive test validation charts.`;
    }

    // Default intelligent pedagogical assistant response
    return `💡 **EduFlow Heuristic Analysis for "${query}":**\n\nBased on current continuous evaluation records for the 2026-2027 academic session:\n- All project assignments enforce IEEE documentation requirements.\n- Individual student advisory index is calculated from verified task velocity and submission authoring.\n\nWould you like me to draft an intervention email for team leaders or prepare an internal marks tabulation sheet?`;
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      // Call real backend API
      const response = await api.ai.query(
        text.trim(),
        selectedSubjectId !== 'all' ? selectedSubjectId : undefined
      );

      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: response.response,
        timestamp: 'Just now',
        tags: response.heuristics_used || ['Rule Engine', 'Verified Database Context']
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      // Fallback to local heuristic engine if backend query fails
      const fallbackText = generateAssistantResponse(text);
      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: 'Just now',
        tags: ['Rule Engine Fallback']
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Bot className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-400">
              Autonomous Academic Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            AI Teacher Assistant & Risk Advisor
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Query real-time project state, identify students falling behind, generate viva examination rubrics, and formulate pedagogical interventions.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Continuous Heuristic Engine Active
        </Badge>
      </div>

      {/* Suggested Quick Query Chips */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Recommended Faculty Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[480px] flex flex-col justify-between space-y-6">
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
          {messages.map((m) => {
            const isAI = m.sender === 'assistant';

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAI
                      ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 shadow-xs'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] opacity-70">
                    <span>{m.timestamp}</span>

                    {isAI && (
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="hover:opacity-100 flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    T
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Synthesizing heuristic project metrics & rubric factors...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about team risks, overdue milestones, student workload, or viva defense rubrics..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
