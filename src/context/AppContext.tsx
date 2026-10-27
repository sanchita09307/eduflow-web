import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Subject,
  Project,
  StudentGroup,
  Task,
  Submission,
  RiskAssessment,
  ActivityItem,
  NotificationItem,
  UserRole,
  SubmissionReview,
  TaskStatus,
  Milestone
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_PROJECTS,
  INITIAL_GROUPS,
  INITIAL_TASKS,
  INITIAL_SUBMISSIONS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS
} from '../services/store';
import { calculateGroupRisk } from '../services/analyticsEngine';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { QuickSearchModal } from '../components/common/QuickSearchModal';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  selectUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  allUsers: User[];
  registerUser: (userData: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    rollNumber?: string;
    collegeId?: string;
    semester?: string;
    designation?: string;
  }) => User;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  logout: () => void;

  // Data
  subjects: Subject[];
  projects: Project[];
  groups: StudentGroup[];
  tasks: Task[];
  submissions: Submission[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  riskAssessments: RiskAssessment[];

  // Actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => Subject;
  addProject: (
    project: Omit<Project, 'id' | 'createdAt' | 'teacherId' | 'status'>,
    assignedGroupIds: string[]
  ) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  addGroup: (group: Omit<StudentGroup, 'id' | 'createdAt' | 'progressPercentage'>) => StudentGroup;
  updateGroup: (group: StudentGroup) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  deleteTask: (taskId: string) => void;

  addSubmission: (
    submission: Omit<Submission, 'id' | 'version' | 'submittedAt' | 'status' | 'history'>
  ) => Submission;
  reviewSubmission: (reviewData: {
    submissionId: string;
    status: 'approved' | 'rework_requested' | 'rejected';
    score: number;
    feedback: string;
  }) => void;

  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSubjectId: string | 'all';
  setSelectedSubjectId: (id: string | 'all') => void;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Interactivity
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Utility
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'eduflow_users_v1',
  CURRENT_USER_ID: 'eduflow_current_user_id_v1',
  SUBJECTS: 'eduflow_subjects_v1',
  PROJECTS: 'eduflow_projects_v1',
  GROUPS: 'eduflow_groups_v1',
  TASKS: 'eduflow_tasks_v1',
  SUBMISSIONS: 'eduflow_submissions_v1',
  ACTIVITIES: 'eduflow_activities_v1',
  NOTIFICATIONS: 'eduflow_notifications_v1',
  THEME: 'eduflow_theme_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved or fallback
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return (
      (savedId ? JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]').find((u: User) => u.id === savedId) : null) ||
      INITIAL_USERS.find((u) => u.id === savedId) ||
      INITIAL_USERS[0]
    );
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [groups, setGroups] = useState<StudentGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('eduflow_authenticated_v1');
    return saved ? saved === 'true' : true;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const addToast = (toastData: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { ...toastData, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('eduflow_authenticated_v1', 'false');
    addToast({
      title: 'Session Terminated',
      message: 'You have been safely signed out.',
      type: 'info'
    });
  };

  useEffect(() => {
    localStorage.setItem('eduflow_authenticated_v1', String(isAuthenticated));
  }, [isAuthenticated]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'all'>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    if (user.role === 'student') {
      setActiveTab('student-portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const selectUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (!found) return;
    setCurrentUserState(found);
    setIsAuthenticated(true);
    if (found.role === 'student') {
      setActiveTab('student-portal');
    } else {
      setActiveTab('dashboard');
    }
    addToast({
      title: `Active Account: ${found.name}`,
      message: `${found.role === 'teacher' ? 'Faculty In-Charge' : 'Student'} • ID: ${found.rollNumber || found.collegeId || 'Verified'}`,
      type: 'success'
    });
  };

  const switchRole = (role: UserRole) => {
    // If authenticated student attempts to switch to faculty, prevent privilege escalation!
    if (currentUser.role === 'student' && role === 'teacher') {
      addToast({
        title: 'Faculty Escalation Blocked',
        message: 'Security Policy: Student accounts cannot elevate to Faculty. Please log out and sign in with faculty credentials.',
        type: 'danger'
      });
      return;
    }

    if (role === 'teacher') {
      const teacherUser = allUsers.find((u) => u.role === 'teacher') || INITIAL_USERS[0];
      setCurrentUserState(teacherUser);
      setActiveTab('dashboard');
      addToast({
        title: 'Faculty Mode Active',
        message: `Authenticated as ${teacherUser.name} (${teacherUser.collegeId || 'Faculty In-Charge'}).`,
        type: 'info'
      });
    } else {
      const studentUser = allUsers.find((u) => u.role === 'student') || INITIAL_USERS[1];
      setCurrentUserState(studentUser);
      setActiveTab('student-portal');
      addToast({
        title: 'Student Perspective',
        message: `Viewing as ${studentUser.name} (${studentUser.rollNumber || studentUser.collegeId || 'Student'}).`,
        type: 'info'
      });
    }
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    rollNumber?: string;
    collegeId?: string;
    semester?: string;
    designation?: string;
  }): User => {
    const assignedId = userData.collegeId || userData.rollNumber || (userData.role === 'teacher' ? 'FAC-CSE-09' : '21CS105');
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      rollNumber: userData.role === 'student' ? assignedId : undefined,
      collegeId: assignedId,
      semester: userData.semester || (userData.role === 'student' ? 'Semester VI' : undefined),
      designation: userData.designation || (userData.role === 'teacher' ? 'Faculty Guide & Evaluator' : undefined),
      avatar:
        userData.role === 'teacher'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString()
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUserState(newUser);
    setIsAuthenticated(true);

    // If student, automatically enroll them into the active capstone group!
    if (userData.role === 'student') {
      setGroups((prevGroups) => {
        if (prevGroups.length === 0) return prevGroups;
        const targetGroup = prevGroups[0];
        const newMember = {
          userId: newUser.id,
          name: newUser.name,
          rollNumber: newUser.rollNumber || assignedId,
          email: newUser.email,
          roleInGroup: 'member' as const,
          assignedTasksCount: 2,
          completedTasksCount: 0
        };

        return prevGroups.map((g, idx) =>
          idx === 0
            ? {
                ...g,
                members: [...g.members, newMember]
              }
            : g
        );
      });

      // Add a starter onboarding task for this new student
      const targetProj = projects[0];
      const starterTask: Task = {
        id: `tsk_${Date.now()}_start`,
        groupId: groups[0]?.id || 'grp_1',
        milestoneId: targetProj?.milestones[1]?.id || 'ms_2',
        milestoneTitle: targetProj?.milestones[1]?.title || 'System Architecture',
        title: `Onboard to ${newUser.department} project repository`,
        description: `Review system architecture diagrams and setup development environment for ${assignedId}.`,
        assignedToId: newUser.id,
        assignedToName: newUser.name,
        assignedToRoll: newUser.rollNumber || assignedId,
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 1000 * 3600 * 24 * 7).toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      };
      setTasks((prev) => [starterTask, ...prev]);

      setActiveTab('student-portal');
    } else {
      // Teacher: assign as faculty coordinator on the primary subject/project
      setSubjects((prevSubs) =>
        prevSubs.map((sub, idx) =>
          idx === 0
            ? {
                ...sub,
                teacherId: newUser.id,
                teacherName: newUser.name
              }
            : sub
        )
      );
      setProjects((prevProjs) =>
        prevProjs.map((proj, idx) =>
          idx === 0
            ? {
                ...proj,
                teacherId: newUser.id
              }
            : proj
        )
      );
      setActiveTab('dashboard');
    }

    addToast({
      title: `Account Activated: ${newUser.name}`,
      message: `${newUser.role.toUpperCase()} • ID: ${assignedId} • Welcome to EduFlow!`,
      type: 'success'
    });

    return newUser;
  };

  // Dynamically compute risk assessments for every group
  const riskAssessments = useMemo(() => {
    return groups.map((g) => {
      const proj = projects.find((p) => p.id === g.projectId);
      return calculateGroupRisk(g, proj, tasks, submissions);
    });
  }, [groups, projects, tasks, submissions]);

  // Subject Actions
  const addSubject = (data: Omit<Subject, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>): Subject => {
    const newSubject: Subject = {
      ...data,
      id: `sub_${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      createdAt: new Date().toISOString(),
      totalProjects: 0,
      totalStudents: 0
    };
    setSubjects((prev) => [newSubject, ...prev]);

    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'created new subject',
        target: `${newSubject.code} - ${newSubject.name}`,
        timestamp: 'Just now',
        type: 'project'
      },
      ...prev
    ]);

    return newSubject;
  };

  // Project Actions
  const addProject = (
    data: Omit<Project, 'id' | 'createdAt' | 'teacherId' | 'status'>,
    assignedGroupIds: string[]
  ): Project => {
    const newProject: Project = {
      ...data,
      id: `proj_${Date.now()}`,
      teacherId: currentUser.id,
      status: 'active',
      assignedGroupIds,
      createdAt: new Date().toISOString()
    };

    setProjects((prev) => [newProject, ...prev]);

    // Update subjects project count
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === data.subjectId ? { ...s, totalProjects: (s.totalProjects || 0) + 1 } : s
      )
    );

    // If groups were assigned, associate them
    if (assignedGroupIds.length > 0) {
      setGroups((prev) =>
        prev.map((g) =>
          assignedGroupIds.includes(g.id)
            ? {
                ...g,
                projectId: newProject.id,
                projectTitle: newProject.title,
                subjectId: newProject.subjectId,
                subjectCode: newProject.subjectCode
              }
            : g
        )
      );
    }

    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'published project',
        target: newProject.title,
        timestamp: 'Just now',
        type: 'project'
      },
      ...prev
    ]);

    return newProject;
  };

  const updateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Group Actions
  const addGroup = (data: Omit<StudentGroup, 'id' | 'createdAt' | 'progressPercentage'>): StudentGroup => {
    const newGroup: StudentGroup = {
      ...data,
      id: `grp_${Date.now()}`,
      progressPercentage: 10,
      createdAt: new Date().toISOString()
    };
    setGroups((prev) => [...prev, newGroup]);

    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'formed student group',
        target: newGroup.name,
        timestamp: 'Just now',
        type: 'project'
      },
      ...prev
    ]);

    return newGroup;
  };

  const updateGroup = (updated: StudentGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  // Task Actions
  const addTask = (data: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...data,
      id: `tsk_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [...prev, newTask]);

    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        groupId: newTask.groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'created task',
        target: newTask.title,
        timestamp: 'Just now',
        type: 'task'
      },
      ...prev
    ]);

    return newTask;
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isCompleted = newStatus === 'completed';
          return {
            ...t,
            status: newStatus,
            completedAt: isCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActivities((prev) => [
        {
          id: `act_${Date.now()}`,
          groupId: task.groupId,
          userId: currentUser.id,
          userName: currentUser.name,
          action: `moved task to ${newStatus.replace('_', ' ')}`,
          target: task.title,
          timestamp: 'Just now',
          type: 'task'
        },
        ...prev
      ]);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Submission Actions
  const addSubmission = (
    data: Omit<Submission, 'id' | 'version' | 'submittedAt' | 'status' | 'history'>
  ): Submission => {
    // Check if previous versions exist for this group and milestone
    const existingForMilestone = submissions.filter(
      (s) => s.groupId === data.groupId && s.milestoneId === data.milestoneId
    );
    const nextVersion = existingForMilestone.length + 1;

    const newSubm: Submission = {
      ...data,
      id: `subm_${Date.now()}`,
      version: nextVersion,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      history: existingForMilestone.map((prevSub) => ({
        version: prevSub.version,
        submittedAt: prevSub.submittedAt,
        submittedByName: prevSub.submittedByName,
        fileName: prevSub.fileName,
        notes: prevSub.submissionNotes,
        status: prevSub.status,
        feedback: prevSub.review?.feedback,
        score: prevSub.review?.score
      }))
    };

    setSubmissions((prev) => [newSubm, ...prev]);

    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        groupId: data.groupId,
        groupName: data.groupName,
        userId: currentUser.id,
        userName: currentUser.name,
        action: `submitted deliverable (v${nextVersion})`,
        target: `${data.milestoneTitle}: ${data.fileName}`,
        timestamp: 'Just now',
        type: 'submission'
      },
      ...prev
    ]);

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `New Submission (v${nextVersion})`,
        message: `${data.groupName} submitted ${data.fileName} for ${data.milestoneTitle}`,
        type: 'info',
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);

    return newSubm;
  };

  // Review & Grading Action
  const reviewSubmission = ({
    submissionId,
    status,
    score,
    feedback
  }: {
    submissionId: string;
    status: 'approved' | 'rework_requested' | 'rejected';
    score: number;
    feedback: string;
  }) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          const review: SubmissionReview = {
            id: `rev_${Date.now()}`,
            submissionId,
            reviewerId: currentUser.id,
            reviewerName: currentUser.name,
            status,
            score,
            maxScore: 20, // default milestone cap or looked up
            feedback,
            reviewedAt: new Date().toISOString()
          };

          return {
            ...sub,
            status,
            review
          };
        }
        return sub;
      })
    );

    const targetSub = submissions.find((s) => s.id === submissionId);
    if (targetSub) {
      setActivities((prev) => [
        {
          id: `act_${Date.now()}`,
          groupId: targetSub.groupId,
          groupName: targetSub.groupName,
          userId: currentUser.id,
          userName: currentUser.name,
          action: `${status.replace('_', ' ')} deliverable`,
          target: `${targetSub.milestoneTitle} (Score: ${score}/20)`,
          timestamp: 'Just now',
          type: 'review'
        },
        ...prev
      ]);

      // If approved, recalculate group overall progress
      if (status === 'approved') {
        setGroups((prevGroups) =>
          prevGroups.map((g) => {
            if (g.id === targetSub.groupId) {
              const newProgress = Math.min(100, (g.progressPercentage || 0) + 20);
              return { ...g, progressPercentage: newProgress };
            }
            return g;
          })
        );
      }
    }
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setSubjects(INITIAL_SUBJECTS);
    setProjects(INITIAL_PROJECTS);
    setGroups(INITIAL_GROUPS);
    setTasks(INITIAL_TASKS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUserState(INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        selectUser,
        switchRole,
        allUsers,
        registerUser,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        subjects,
        projects,
        groups,
        tasks,
        submissions,
        activities,
        notifications,
        riskAssessments,
        addSubject,
        addProject,
        updateProject,
        deleteProject,
        addGroup,
        updateGroup,
        addTask,
        updateTaskStatus,
        deleteTask,
        addSubmission,
        reviewSubmission,
        activeTab,
        setActiveTab,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedGroupId,
        setSelectedGroupId,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        resetToDefaultData
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
