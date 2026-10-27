from datetime import datetime, timezone, timedelta
from app.ai.risk_engine import RuleBasedRiskEngine
from app.ai.contribution import ContributionCalculator

def test_risk_engine_healthy_group():
    now = datetime.now(timezone.utc)
    milestones = [
        {"id": "ms_1", "title": "Proposal", "deadline": (now + timedelta(days=10)).isoformat(), "weightage": 20}
    ]
    tasks = [
        {"id": "tsk_1", "status": "completed", "priority": "medium"}
    ]
    submissions = [
        {"id": "sub_1", "milestone_id": "ms_1", "status": "approved", "submitted_at": (now - timedelta(days=2)).isoformat()}
    ]

    assessment = RuleBasedRiskEngine.evaluate_group_risk("grp_1", "Team Alpha", milestones, tasks, submissions, now)
    assert assessment["risk_level"] in ["low", "medium"]
    assert assessment["overdue_milestones_count"] == 0

def test_risk_engine_overdue_milestone_flags_high_risk():
    now = datetime.now(timezone.utc)
    milestones = [
        {"id": "ms_1", "title": "Synopsis", "deadline": (now - timedelta(days=15)).isoformat(), "weightage": 20}
    ]
    tasks = [
        {"id": "tsk_1", "status": "todo", "priority": "urgent"}
    ]
    submissions = []

    assessment = RuleBasedRiskEngine.evaluate_group_risk("grp_2", "Team Beta", milestones, tasks, submissions, now)
    assert assessment["risk_level"] in ["high", "critical"]
    assert assessment["overdue_milestones_count"] == 1
    assert assessment["risk_score"] > 40

def test_contribution_calculator():
    tasks = [
        {"id": "t1", "status": "completed"},
        {"id": "t2", "status": "completed"},
        {"id": "t3", "status": "todo"}
    ]
    submissions = [{"id": "s1"}]

    res = ContributionCalculator.calculate_member_contribution(
        user_id="usr_1",
        name="Aditya Verma",
        roll_number="21CS042",
        is_leader=True,
        member_tasks=tasks,
        member_submissions=submissions
    )

    assert res["completed_tasks"] == 2
    assert res["total_assigned_tasks"] == 3
    assert res["task_completion_rate"] == 67
    assert res["contribution_score"] > 60
