import {
  StudentGroup,
  Project,
  Task,
  Submission,
  RiskAssessment,
  RiskLevel,
  StudentContribution,
  User
} from '../types';

/**
 * Explainable Rule-Based Risk Engine
 * Computes risk metrics and actionable pedagogical recommendations based on:
 * 1. Milestone overdue status vs current date
 * 2. Unfinished critical / urgent tasks
 * 3. Days elapsed since the group's last submission
 * 4. Milestone completion progress vs project timeline expectation
 */
export function calculateGroupRisk(
  group: StudentGroup,
  project: Project | undefined,
  tasks: Task[],
  submissions: Submission[]
): RiskAssessment {
  const now = new Date('2026-10-09T07:00:00Z'); // normalized reference date
  const groupTasks = tasks.filter((t) => t.groupId === group.id);
  const groupSubmissions = submissions.filter((s) => s.groupId === group.id);

  const factors: {
    factor: string;
    description: string;
    severity: 'info' | 'warning' | 'danger';
  }[] = [];

  let riskScore = 15; // baseline healthy score
  let overdueMilestonesCount = 0;

  // 1. Check milestone deadlines if project exists
  if (project && project.milestones) {
    project.milestones.forEach((ms) => {
      const deadline = new Date(ms.deadline);
      const isPast = deadline < now;
      const approvedSubmission = groupSubmissions.find(
        (s) => s.milestoneId === ms.id && s.status === 'approved'
      );
      const pendingSubmission = groupSubmissions.find(
        (s) => s.milestoneId === ms.id && (s.status === 'under_review' || s.status === 'submitted')
      );

      if (isPast && !approvedSubmission && !pendingSubmission) {
        overdueMilestonesCount++;
        const daysOver = Math.round((now.getTime() - deadline.getTime()) / (1000 * 3600 * 24));
        riskScore += 25;
        factors.push({
          factor: `Milestone Overdue: "${ms.title}"`,
          description: `Deadline was ${daysOver} days ago with no submitted or approved deliverables.`,
          severity: 'danger'
        });
      } else if (!isPast && !approvedSubmission) {
        const daysRemaining = Math.round((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysRemaining <= 7) {
          riskScore += 10;
          factors.push({
            factor: `Upcoming Deadline: "${ms.title}"`,
            description: `Only ${daysRemaining} days remaining for delivery (Weightage: ${ms.weightage}%).`,
            severity: 'warning'
          });
        }
      }
    });
  }

  // 2. Analyze incomplete tasks, especially urgent/overdue
  const incompleteTasks = groupTasks.filter((t) => t.status !== 'completed');
  const urgentIncomplete = incompleteTasks.filter((t) => t.priority === 'urgent');
  const overdueTasks = incompleteTasks.filter((t) => new Date(t.dueDate) < now);

  if (overdueTasks.length > 0) {
    riskScore += overdueTasks.length * 8;
    factors.push({
      factor: `${overdueTasks.length} Overdue Kanban Tasks`,
      description: `Tasks assigned to team members have breached their internal target due dates.`,
      severity: overdueTasks.length > 2 ? 'danger' : 'warning'
    });
  }

  if (urgentIncomplete.length > 0) {
    riskScore += urgentIncomplete.length * 6;
    factors.push({
      factor: `${urgentIncomplete.length} High-Priority Blockers`,
      description: `Critical path tasks remain in To-Do or In-Progress state.`,
      severity: 'warning'
    });
  }

  // 3. Last submission recency
  let daysSinceLastSubmission = 999;
  if (groupSubmissions.length > 0) {
    const latestSubmissionDate = new Date(
      Math.max(...groupSubmissions.map((s) => new Date(s.submittedAt).getTime()))
    );
    daysSinceLastSubmission = Math.max(
      0,
      Math.round((now.getTime() - latestSubmissionDate.getTime()) / (1000 * 3600 * 24))
    );

    if (daysSinceLastSubmission > 20) {
      riskScore += 15;
      factors.push({
        factor: 'Extended Inactivity',
        description: `No deliverable submitted in the last ${daysSinceLastSubmission} days.`,
        severity: 'danger'
      });
    } else {
      factors.push({
        factor: 'Recent Activity Recorded',
        description: `Last submission registered ${daysSinceLastSubmission} days ago.`,
        severity: 'info'
      });
    }
  } else {
    riskScore += 20;
    factors.push({
      factor: 'Zero Deliverables Logged',
      description: `The group has not submitted any milestone draft or final artifact yet.`,
      severity: 'danger'
    });
  }

  // Bound score between 0 and 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine categorical risk level
  let riskLevel: RiskLevel = 'low';
  let recommendation = 'Group is tracking on schedule. Normal weekly sync recommended.';

  if (riskScore >= 70 || overdueMilestonesCount >= 2) {
    riskLevel = 'critical';
    recommendation =
      'Immediate teacher intervention required: convene an urgent viva check-in to review technical blockers and re-scope milestones before semester grade lockdown.';
  } else if (riskScore >= 45 || overdueMilestonesCount === 1) {
    riskLevel = 'high';
    recommendation =
      'Schedule a formal lab check-in with the team leader. Identify task bottlenecks and assign deadline recovery targets.';
  } else if (riskScore >= 28) {
    riskLevel = 'medium';
    recommendation =
      'Monitor milestone deliverable pace. Send gentle reminder for upcoming deadlines and review open pull requests.';
  }

  return {
    groupId: group.id,
    groupName: group.name,
    projectTitle: project?.title || group.projectTitle,
    subjectCode: group.subjectCode,
    riskLevel,
    riskScore,
    factors,
    recommendation,
    assessedAt: new Date().toISOString(),
    overdueMilestonesCount,
    pendingTasksCount: incompleteTasks.length,
    daysSinceLastSubmission
  };
}

/**
 * Transparent, Non-Punitive Student Contribution Calculator
 * Analyzes assigned vs completed tasks, submitted deliverables, and collaboration activity
 * Advisory metric designed to empower fair teacher evaluation during internal viva.
 */
export function calculateStudentContributions(
  group: StudentGroup,
  tasks: Task[],
  submissions: Submission[],
  allUsers: User[]
): StudentContribution[] {
  const groupTasks = tasks.filter((t) => t.groupId === group.id);
  const groupSubmissions = submissions.filter((s) => s.groupId === group.id);

  return group.members.map((member) => {
    const memberTasks = groupTasks.filter((t) => t.assignedToId === member.userId);
    const completedTasks = memberTasks.filter((t) => t.status === 'completed');
    const totalAssigned = memberTasks.length;

    const memberSubmissions = groupSubmissions.filter(
      (s) => s.submittedById === member.userId
    );

    const taskCompletionRate =
      totalAssigned > 0 ? Math.round((completedTasks.length / totalAssigned) * 100) : 0;

    // Advisory calculation:
    // 60% based on task completion velocity
    // 25% based on active task assignments fulfilled
    // 15% based on deliverable authoring / lead responsibilities
    let contributionScore = 50; // base score

    if (totalAssigned > 0) {
      contributionScore = Math.round(
        taskCompletionRate * 0.6 +
          Math.min(completedTasks.length * 10, 25) +
          (memberSubmissions.length > 0 ? 15 : 5)
      );
    } else {
      contributionScore = member.roleInGroup === 'leader' ? 65 : 45;
    }

    contributionScore = Math.min(100, Math.max(10, contributionScore));

    let status: 'active' | 'moderate' | 'needs_attention' = 'active';
    let notes = 'Active contributor fulfilling assigned responsibilities.';

    if (contributionScore < 40) {
      status = 'needs_attention';
      notes = 'Advisory: Fewer completed tasks logged; teacher review suggested during viva.';
    } else if (contributionScore < 70) {
      status = 'moderate';
      notes = 'Consistent progress, pending remaining sprint deliverables.';
    }

    return {
      userId: member.userId,
      name: member.name,
      rollNumber: member.rollNumber,
      totalAssignedTasks: totalAssigned,
      completedTasks: completedTasks.length,
      taskCompletionRate,
      submissionsMade: memberSubmissions.length,
      contributionScore,
      notes,
      status
    };
  });
}
