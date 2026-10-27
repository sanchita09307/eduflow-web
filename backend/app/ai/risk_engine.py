from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


def to_utc(dt: Any) -> Optional[datetime]:
    if dt is None:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except ValueError:
            return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    return None


class RuleBasedRiskEngine:
    """
    Explainable Rule-Based Heuristic Risk Engine for College Project Evaluation.
    Produces deterministic, transparent risk assessments for faculty viva preparation.
    """

    @staticmethod
    def evaluate_group_risk(
        group_id: str,
        group_name: str,
        milestones: List[Dict[str, Any]],
        tasks: List[Dict[str, Any]],
        submissions: List[Dict[str, Any]],
        current_time: datetime = None
    ) -> Dict[str, Any]:
        if current_time is None:
            current_time = datetime.now(timezone.utc)
        else:
            current_time = to_utc(current_time)

        factors = []
        risk_score = 15  # baseline healthy score
        overdue_milestones = 0

        # 1. Milestone deadline adherence
        for ms in milestones:
            ms_deadline = to_utc(ms.get("deadline"))
            if not ms_deadline:
                continue

            is_past = ms_deadline < current_time
            has_approved = any(
                s.get("milestone_id") == ms.get("id") and s.get("status") == "approved"
                for s in submissions
            )
            has_pending = any(
                s.get("milestone_id") == ms.get("id") and s.get("status") in ["submitted", "under_review"]
                for s in submissions
            )

            if is_past and not has_approved and not has_pending:
                overdue_milestones += 1
                days_over = max(1, (current_time - ms_deadline).days)
                risk_score += 25
                factors.append({
                    "factor": f"Overdue Milestone: {ms.get('title')}",
                    "description": f"Target deadline was breached {days_over} days ago with no submitted deliverable.",
                    "severity": "danger"
                })
            elif not is_past and not has_approved:
                days_left = max(0, (ms_deadline - current_time).days)
                if days_left <= 7:
                    risk_score += 10
                    factors.append({
                        "factor": f"Upcoming Milestone: {ms.get('title')}",
                        "description": f"Deliverable due in {days_left} days (Weightage: {ms.get('weightage', 20)}%).",
                        "severity": "warning"
                    })

        # 2. Incomplete task velocity & overdue tasks
        incomplete_tasks = [t for t in tasks if t.get("status") != "completed"]
        urgent_tasks = [t for t in incomplete_tasks if t.get("priority") == "urgent"]

        # Check overdue tasks
        overdue_tasks = []
        for t in incomplete_tasks:
            due = to_utc(t.get("due_date"))
            if due and due < current_time:
                overdue_tasks.append(t)

        if overdue_tasks:
            penalty = min(len(overdue_tasks) * 6, 24)
            risk_score += penalty
            factors.append({
                "factor": f"{len(overdue_tasks)} Overdue Task(s)",
                "description": f"{len(overdue_tasks)} incomplete task(s) have passed their scheduled due dates.",
                "severity": "danger" if len(overdue_tasks) >= 3 else "warning"
            })

        if urgent_tasks:
            risk_score += len(urgent_tasks) * 7
            factors.append({
                "factor": f"{len(urgent_tasks)} Critical Path Blockers",
                "description": "Urgent technical tasks remain unmerged or unverified.",
                "severity": "warning"
            })

        # 3. Submission recency
        days_since_submission = 999
        if submissions:
            subm_dates = []
            for s in submissions:
                dt = to_utc(s.get("submitted_at"))
                if dt:
                    subm_dates.append(dt)
            if subm_dates:
                latest = max(subm_dates)
                days_since_submission = max(0, (current_time - latest).days)

            if days_since_submission > 20:
                risk_score += 15
                factors.append({
                    "factor": "Extended Delivery Hiatus",
                    "description": f"No technical deliverable logged in the last {days_since_submission} days.",
                    "severity": "danger"
                })
        else:
            risk_score += 20
            factors.append({
                "factor": "Zero Deliverables Logged",
                "description": "No proposal, synopsis, or prototype document submitted.",
                "severity": "danger"
            })

        # Bounding score
        risk_score = min(100, max(0, risk_score))

        # Categorical risk level
        if risk_score >= 70 or overdue_milestones >= 2:
            level = "critical"
            rec = "Immediate teacher intervention required: convene an urgent viva check-in to review technical blockers."
        elif risk_score >= 45 or overdue_milestones == 1:
            level = "high"
            rec = "Schedule formal lab check-in with team leader; establish 7-day milestone recovery target."
        elif risk_score >= 28:
            level = "medium"
            rec = "Monitor task progress; send reminder for upcoming milestone deadline."
        else:
            level = "low"
            rec = "Team tracking normally on schedule. Standard weekly review recommended."

        return {
            "group_id": group_id,
            "group_name": group_name,
            "risk_level": level,
            "risk_score": risk_score,
            "overdue_milestones_count": overdue_milestones,
            "overdue_tasks_count": len(overdue_tasks),
            "pending_tasks_count": len(incomplete_tasks),
            "days_since_last_submission": days_since_submission,
            "factors": factors,
            "recommendation": rec,
            "assessed_at": current_time.isoformat()
        }
