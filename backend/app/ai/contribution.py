from typing import List, Dict, Any

class ContributionCalculator:
    """
    Transparent, Non-Punitive Student Contribution Calculator.
    Computes an advisory continuous evaluation index from verifiable work items.
    """

    @staticmethod
    def calculate_member_contribution(
        user_id: str,
        name: str,
        roll_number: str,
        is_leader: bool,
        member_tasks: List[Dict[str, Any]],
        member_submissions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        total_assigned = len(member_tasks)
        completed_tasks = [t for t in member_tasks if t.get("status") == "completed"]
        completed_count = len(completed_tasks)

        completion_rate = round((completed_count / total_assigned) * 100) if total_assigned > 0 else 0

        # Advisory computation:
        # 60% task velocity, 25% fulfillment volume, 15% submissions authoring
        if total_assigned > 0:
            raw_score = (completion_rate * 0.6) + min(completed_count * 10, 25) + (15 if len(member_submissions) > 0 else 5)
        else:
            raw_score = 65 if is_leader else 45

        score = min(100, max(10, round(raw_score)))

        if score < 40:
            status = "needs_attention"
            notes = "Advisory: Fewer completed deliverables; recommend teacher review during viva."
        elif score < 70:
            status = "moderate"
            notes = "Consistent contribution, pending final sprint targets."
        else:
            status = "active"
            notes = "Strong verifiable participation across task board and deliverables."

        return {
            "user_id": user_id,
            "name": name,
            "roll_number": roll_number,
            "total_assigned_tasks": total_assigned,
            "completed_tasks": completed_count,
            "task_completion_rate": completion_rate,
            "submissions_made": len(member_submissions),
            "contribution_score": score,
            "status": status,
            "notes": notes
        }
