export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  collegeId?: string;
  department: string;
  semester?: string;
  designation?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: string;
  department: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  description: string;
  totalProjects?: number;
  totalStudents?: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  weightage: number; // e.g. 20%
  orderIndex: number;
  requiresFile: boolean;
}

export interface Project {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  description: string;
  instructions: string;
  teacherId: string;
  milestones: Milestone[];
  assignedGroupIds: string[];
  weightageTotal: number;
  createdAt: string;
  status: 'active' | 'archived' | 'draft';
}

export interface StudentGroup {
  id: string;
  projectId: string;
  projectTitle: string;
  subjectId: string;
  subjectCode: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: GroupMember[];
  progressPercentage: number;
  currentMilestoneId?: string;
  currentMilestoneTitle?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  rollNumber: string;
  email: string;
  roleInGroup: 'leader' | 'member';
  assignedTasksCount?: number;
  completedTasksCount?: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  groupId: string;
  milestoneId?: string;
  milestoneTitle?: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRoll?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  commentsCount?: number;
}

export type SubmissionStatus = 'submitted' | 'under_review' | 'approved' | 'rework_requested' | 'rejected';

export interface Submission {
  id: string;
  groupId: string;
  groupName: string;
  milestoneId: string;
  milestoneTitle: string;
  projectId: string;
  version: number;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  submissionNotes: string;
  submittedById: string;
  submittedByName: string;
  submittedAt: string;
  status: SubmissionStatus;
  review?: SubmissionReview;
  history?: SubmissionHistoryItem[];
}

export interface SubmissionHistoryItem {
  version: number;
  submittedAt: string;
  submittedByName: string;
  fileName: string;
  notes: string;
  status: SubmissionStatus;
  feedback?: string;
  score?: number;
}

export interface SubmissionReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  status: SubmissionStatus;
  score: number; // e.g., 18 out of 20
  maxScore: number;
  feedback: string;
  reviewedAt: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAssessment {
  groupId: string;
  groupName: string;
  projectTitle: string;
  subjectCode: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  factors: {
    factor: string;
    description: string;
    severity: 'info' | 'warning' | 'danger';
  }[];
  recommendation: string;
  assessedAt: string;
  overdueMilestonesCount: number;
  pendingTasksCount: number;
  daysSinceLastSubmission: number;
}

export interface StudentContribution {
  userId: string;
  name: string;
  rollNumber: string;
  totalAssignedTasks: number;
  completedTasks: number;
  taskCompletionRate: number; // percentage
  submissionsMade: number;
  contributionScore: number; // calculated advisory score 0-100
  notes?: string;
  status: 'active' | 'moderate' | 'needs_attention';
}

export interface ActivityItem {
  id: string;
  groupId?: string;
  groupName?: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'submission' | 'task' | 'review' | 'project' | 'alert';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  timestamp: string;
  read: boolean;
  linkUrl?: string;
}
