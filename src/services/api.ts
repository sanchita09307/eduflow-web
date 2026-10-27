import {
  User,
  Subject,
  Project,
  StudentGroup,
  Task,
  Submission,
  RiskAssessment,
  StudentContribution,
  UserRole,
  TaskStatus,
  Milestone
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// In-memory token storage with localStorage fallback
let inMemoryToken: string | null = localStorage.getItem('eduflow_token');

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('eduflow_token', token);
  } else {
    localStorage.removeItem('eduflow_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!inMemoryToken) {
    inMemoryToken = localStorage.getItem('eduflow_token');
  }
  return inMemoryToken;
};

// Listeners for 401 unauthorized
type UnauthorizedHandler = () => void;
const unauthorizedHandlers: UnauthorizedHandler[] = [];

export const onUnauthorized = (handler: UnauthorizedHandler) => {
  unauthorizedHandlers.push(handler);
  return () => {
    const idx = unauthorizedHandlers.indexOf(handler);
    if (idx !== -1) unauthorizedHandlers.splice(idx, 1);
  };
};

const notifyUnauthorized = () => {
  setAuthToken(null);
  unauthorizedHandlers.forEach((handler) => handler());
};

// Base Fetch Client
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type JSON
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    notifyUnauthorized();
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Request failed with status ${response.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return response.json();
}

// Model Mappers (Backend snake_case to Frontend camelCase)
export function mapUserFromApi(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    department: u.department,
    rollNumber: u.roll_number,
    collegeId: u.college_id,
    designation: u.designation,
    semester: u.semester,
    avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
    createdAt: u.created_at,
  };
}

export function mapSubjectFromApi(s: any): Subject {
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    semester: s.semester,
    department: s.department,
    teacherId: s.teacher_id,
    teacherName: s.teacher ? s.teacher.name : 'Faculty Coordinator',
    academicYear: s.academic_year || '2026-2027',
    description: s.description || '',
    createdAt: s.created_at,
  };
}

export function mapMilestoneFromApi(m: any): Milestone {
  return {
    id: m.id,
    projectId: m.project_id,
    title: m.title,
    description: m.description || '',
    deadline: m.deadline,
    weightage: m.weightage,
    orderIndex: m.order_index,
    requiresFile: m.requires_file ?? true,
  };
}

export function mapProjectFromApi(p: any): Project {
  return {
    id: p.id,
    subjectId: p.subject_id,
    subjectCode: '',
    subjectName: '',
    title: p.title,
    description: p.description || '',
    instructions: p.instructions || '',
    teacherId: p.teacher_id,
    milestones: (p.milestones || []).map(mapMilestoneFromApi),
    assignedGroupIds: [],
    weightageTotal: p.weightage_total || 100,
    createdAt: p.created_at,
    status: p.status || 'active',
  };
}

export function mapGroupFromApi(g: any): StudentGroup {
  return {
    id: g.id,
    projectId: g.project_id || '',
    projectTitle: '',
    subjectId: g.subject_id,
    subjectCode: '',
    name: g.name,
    leaderId: g.leader_id,
    leaderName: g.leader ? g.leader.name : 'Team Leader',
    progressPercentage: g.progress_percentage || 0,
    githubUrl: g.github_url || undefined,
    liveDemoUrl: g.live_demo_url || undefined,
    createdAt: g.created_at,
    members: (g.memberships || []).map((m: any) => ({
      userId: m.user_id,
      name: m.user ? m.user.name : 'Student Member',
      rollNumber: m.user ? (m.user.roll_number || m.user.college_id || '') : '',
      email: m.user ? m.user.email : '',
      roleInGroup: m.role_in_group,
    })),
  };
}

export function mapTaskFromApi(t: any): Task {
  return {
    id: t.id,
    groupId: t.group_id,
    milestoneId: t.milestone_id || undefined,
    title: t.title,
    description: t.description || '',
    assignedToId: t.assigned_to_id,
    assignedToName: t.assignee ? t.assignee.name : 'Assigned Member',
    assignedToRoll: t.assignee ? (t.assignee.roll_number || t.assignee.college_id) : undefined,
    status: t.status as TaskStatus,
    priority: t.priority,
    dueDate: t.due_date,
    completedAt: t.completed_at || undefined,
    createdAt: t.created_at,
  };
}

export function mapSubmissionFromApi(s: any): Submission {
  return {
    id: s.id,
    groupId: s.group_id,
    groupName: '',
    milestoneId: s.milestone_id,
    milestoneTitle: '',
    projectId: '',
    version: s.version || 1,
    fileName: s.file_name,
    fileSize: s.file_size ? `${(s.file_size / (1024 * 1024)).toFixed(2)} MB` : '1.2 MB',
    fileType: s.file_type || 'PDF',
    fileUrl: s.file_url,
    submissionNotes: s.submission_notes || '',
    submittedById: s.submitted_by_id,
    submittedByName: s.submitter ? s.submitter.name : 'Group Contributor',
    submittedAt: s.submitted_at,
    status: s.status,
    review: s.review
      ? {
          id: s.review.id,
          submissionId: s.id,
          reviewerId: s.review.reviewer_id,
          reviewerName: s.review.reviewer ? s.review.reviewer.name : 'Faculty Evaluator',
          status: s.review.status,
          score: s.review.score,
          maxScore: s.review.max_score,
          feedback: s.review.feedback,
          reviewedAt: s.review.reviewed_at,
        }
      : undefined,
  };
}

export function mapRiskAssessmentFromApi(r: any): RiskAssessment {
  return {
    groupId: r.group_id,
    groupName: r.group_name,
    projectTitle: '',
    subjectCode: '',
    riskLevel: r.risk_level,
    riskScore: r.risk_score,
    factors: r.factors || [],
    recommendation: r.recommendation,
    assessedAt: r.assessed_at,
    overdueMilestonesCount: r.overdue_milestones_count || 0,
    pendingTasksCount: r.pending_tasks_count || 0,
    daysSinceLastSubmission: r.days_since_last_submission || 0,
  };
}

// API Services Client
export const api = {
  // Authentication
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const data = await apiRequest<{ access_token: string; token_type: string; user: any }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );
      setAuthToken(data.access_token);
      return {
        token: data.access_token,
        user: mapUserFromApi(data.user),
      };
    },

    register: async (payload: {
      email: string;
      password: string;
      name: string;
      department: string;
      rollNumber?: string;
      collegeId?: string;
      semester?: string;
    }) => {
      const data = await apiRequest<{ access_token: string; token_type: string; user: any }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            name: payload.name,
            department: payload.department,
            roll_number: payload.rollNumber,
            college_id: payload.collegeId,
            semester: payload.semester,
          }),
        }
      );
      setAuthToken(data.access_token);
      return {
        token: data.access_token,
        user: mapUserFromApi(data.user),
      };
    },

    me: async (): Promise<User> => {
      const data = await apiRequest<any>('/auth/me');
      return mapUserFromApi(data);
    },

    logout: () => {
      setAuthToken(null);
    },
  },

  // Health
  health: {
    check: () => apiRequest<{ status: string; database: string }>('/health'),
  },

  // Subjects
  subjects: {
    list: async (): Promise<Subject[]> => {
      const rows = await apiRequest<any[]>('/subjects');
      return rows.map(mapSubjectFromApi);
    },
    create: async (data: {
      code: string;
      name: string;
      semester: string;
      department: string;
      academicYear?: string;
      description?: string;
    }): Promise<Subject> => {
      const res = await apiRequest<any>('/subjects', {
        method: 'POST',
        body: JSON.stringify({
          code: data.code,
          name: data.name,
          semester: data.semester,
          department: data.department,
          academic_year: data.academicYear || '2026-2027',
          description: data.description,
        }),
      });
      return mapSubjectFromApi(res);
    },
  },

  // Projects
  projects: {
    list: async (subjectId?: string): Promise<Project[]> => {
      const endpoint = subjectId ? `/projects?subject_id=${encodeURIComponent(subjectId)}` : '/projects';
      const rows = await apiRequest<any[]>(endpoint);
      return rows.map(mapProjectFromApi);
    },
    create: async (data: {
      subjectId: string;
      title: string;
      description?: string;
      instructions?: string;
      weightageTotal?: number;
      milestones: Array<{
        title: string;
        description?: string;
        deadline: string;
        weightage: number;
        orderIndex: number;
        requiresFile?: boolean;
      }>;
      assignedGroupIds?: string[];
    }): Promise<Project> => {
      const res = await apiRequest<any>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          subject_id: data.subjectId,
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          weightage_total: data.weightageTotal || 100,
          milestones: data.milestones.map((m) => ({
            title: m.title,
            description: m.description,
            deadline: m.deadline,
            weightage: m.weightage,
            order_index: m.orderIndex,
            requires_file: m.requiresFile ?? true,
          })),
          assigned_group_ids: data.assignedGroupIds || [],
        }),
      });
      return mapProjectFromApi(res);
    },
  },

  // Groups
  groups: {
    list: async (subjectId?: string, projectId?: string): Promise<StudentGroup[]> => {
      const params = new URLSearchParams();
      if (subjectId) params.append('subject_id', subjectId);
      if (projectId) params.append('project_id', projectId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const rows = await apiRequest<any[]>(`/groups${query}`);
      return rows.map(mapGroupFromApi);
    },
    get: async (groupId: string): Promise<StudentGroup> => {
      const res = await apiRequest<any>(`/groups/${encodeURIComponent(groupId)}`);
      return mapGroupFromApi(res);
    },
    create: async (data: {
      name: string;
      subjectId: string;
      projectId?: string;
      leaderId: string;
      memberIds?: string[];
      githubUrl?: string;
      liveDemoUrl?: string;
    }): Promise<StudentGroup> => {
      const res = await apiRequest<any>('/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          subject_id: data.subjectId,
          project_id: data.projectId,
          leader_id: data.leaderId,
          member_ids: data.memberIds || [],
          github_url: data.githubUrl,
          live_demo_url: data.liveDemoUrl,
        }),
      });
      return mapGroupFromApi(res);
    },
  },

  // Tasks
  tasks: {
    list: async (groupId?: string, status?: string): Promise<Task[]> => {
      const params = new URLSearchParams();
      if (groupId) params.append('group_id', groupId);
      if (status) params.append('status', status);
      const query = params.toString() ? `?${params.toString()}` : '';
      const rows = await apiRequest<any[]>(`/tasks${query}`);
      return rows.map(mapTaskFromApi);
    },
    create: async (data: {
      groupId: string;
      milestoneId?: string;
      title: string;
      description?: string;
      assignedToId: string;
      priority?: string;
      dueDate: string;
    }): Promise<Task> => {
      const res = await apiRequest<any>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          group_id: data.groupId,
          milestone_id: data.milestoneId,
          title: data.title,
          description: data.description,
          assigned_to_id: data.assignedToId,
          priority: data.priority || 'medium',
          due_date: data.dueDate,
        }),
      });
      return mapTaskFromApi(res);
    },
    updateStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
      const res = await apiRequest<any>(`/tasks/${encodeURIComponent(taskId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return mapTaskFromApi(res);
    },
  },

  // Submissions
  submissions: {
    list: async (groupId?: string, milestoneId?: string): Promise<Submission[]> => {
      const params = new URLSearchParams();
      if (groupId) params.append('group_id', groupId);
      if (milestoneId) params.append('milestone_id', milestoneId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const rows = await apiRequest<any[]>(`/submissions${query}`);
      return rows.map(mapSubmissionFromApi);
    },
    upload: async (
      data: {
        groupId: string;
        milestoneId: string;
        notes?: string;
        file: File;
      },
      onProgress?: (percent: number) => void
    ): Promise<Submission> => {
      const formData = new FormData();
      formData.append('group_id', data.groupId);
      formData.append('milestone_id', data.milestoneId);
      if (data.notes) formData.append('notes', data.notes);
      formData.append('file', data.file);

      // Support progress telemetry using XMLHttpRequest
      return new Promise<Submission>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/submissions`);

        const token = getAuthToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.setRequestHeader('Accept', 'application/json');

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status === 401) {
            notifyUnauthorized();
            reject(new Error('Session expired. Please log in again.'));
            return;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(mapSubmissionFromApi(res));
            } catch (err) {
              reject(err);
            }
          } else {
            try {
              const errJson = JSON.parse(xhr.responseText);
              reject(new Error(errJson.detail || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload'));
        xhr.send(formData);
      });
    },
  },

  // Reviews
  reviews: {
    create: async (data: {
      submissionId: string;
      status: 'approved' | 'rework_requested' | 'rejected';
      score: number;
      maxScore?: number;
      feedback: string;
    }) => {
      return apiRequest<any>(`/submissions/${encodeURIComponent(data.submissionId)}/review`, {
        method: 'POST',
        body: JSON.stringify({
          submission_id: data.submissionId,
          status: data.status,
          score: data.score,
          max_score: data.maxScore || 20.0,
          feedback: data.feedback,
        }),
      });
    },
  },

  // Analytics
  analytics: {
    getRisk: async (): Promise<RiskAssessment[]> => {
      const rows = await apiRequest<any[]>('/analytics/risk');
      return rows.map(mapRiskAssessmentFromApi);
    },
    getContribution: async (groupId: string): Promise<StudentContribution[]> => {
      const rows = await apiRequest<any[]>(`/analytics/contribution/${encodeURIComponent(groupId)}`);
      return rows.map((r: any) => ({
        userId: r.user_id,
        name: r.name,
        rollNumber: r.roll_number,
        totalAssignedTasks: r.total_assigned_tasks,
        completedTasks: r.completed_tasks,
        taskCompletionRate: r.task_completion_rate,
        submissionsMade: r.submissions_made,
        contributionScore: r.contribution_score,
        status: r.status,
        notes: r.notes,
      }));
    },
  },

  // AI Assistant
  ai: {
    query: async (queryText: string, subjectId?: string, groupId?: string) => {
      return apiRequest<{
        query: string;
        response: string;
        heuristics_used: string[];
        timestamp: string;
      }>('/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({
          query: queryText,
          subject_id: subjectId,
          group_id: groupId,
        }),
      });
    },
  },
};
