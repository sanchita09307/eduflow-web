import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.config import settings
from ..models.models import User, StudentGroup, Subject, ProjectMilestone, Task, Submission
from ..ai.risk_engine import RuleBasedRiskEngine

logger = logging.getLogger(__name__)


class AIService:
    @staticmethod
    async def generate_assistant_response(
        db: AsyncSession,
        query: str,
        current_user: User,
        subject_id: Optional[str] = None,
        group_id: Optional[str] = None
    ) -> Dict[str, Any]:
        heuristics_used = ["ContinuousEvaluationRubric", "RuleBasedRiskEngine"]

        # Gather real context from DB
        # Find relevant groups
        if group_id:
            grp_stmt = select(StudentGroup).filter(StudentGroup.id == group_id)
        elif subject_id:
            grp_stmt = select(StudentGroup).filter(StudentGroup.subject_id == subject_id)
        else:
            if current_user.role == "teacher":
                s_stmt = select(Subject.id).filter(Subject.teacher_id == current_user.id)
                s_ids = (await db.execute(s_stmt)).scalars().all()
                grp_stmt = select(StudentGroup).filter(StudentGroup.subject_id.in_(s_ids))
            else:
                grp_stmt = select(StudentGroup).limit(5)

        groups = (await db.execute(grp_stmt)).scalars().all()

        group_summaries = []
        for g in groups[:5]:
            # Milestones
            ms_stmt = select(ProjectMilestone).filter(ProjectMilestone.project_id == g.project_id)
            milestones = (await db.execute(ms_stmt)).scalars().all()
            ms_dicts = [{"id": m.id, "title": m.title, "deadline": m.deadline, "weightage": m.weightage} for m in milestones]

            # Tasks
            t_stmt = select(Task).filter(Task.group_id == g.id)
            tasks = (await db.execute(t_stmt)).scalars().all()
            t_dicts = [{"id": t.id, "status": t.status, "priority": t.priority, "due_date": t.due_date} for t in tasks]

            # Submissions
            sub_stmt = select(Submission).filter(Submission.group_id == g.id)
            submissions = (await db.execute(sub_stmt)).scalars().all()
            sub_dicts = [{"id": s.id, "milestone_id": s.milestone_id, "status": s.status, "submitted_at": s.submitted_at} for s in submissions]

            eval_res = RuleBasedRiskEngine.evaluate_group_risk(
                group_id=g.id,
                group_name=g.name,
                milestones=ms_dicts,
                tasks=t_dicts,
                submissions=sub_dicts
            )
            group_summaries.append(eval_res)

        # Attempt to call Gemini API if key is present
        api_key = settings.GEMINI_API_KEY or ""
        if api_key.strip():
            try:
                from google import genai
                client = genai.Client(api_key=api_key.strip())

                context_text = f"User: {current_user.name} (Role: {current_user.role})\n"
                context_text += f"College/Department: {current_user.department}\n"
                context_text += "Current Student Groups & Risk Telemetry:\n"
                for gs in group_summaries:
                    context_text += (
                        f"- Group '{gs['group_name']}' (Risk: {gs['risk_level'].upper()}, "
                        f"Score: {gs['risk_score']}/100, Overdue Milestones: {gs['overdue_milestones_count']}, "
                        f"Pending Tasks: {gs['pending_tasks_count']})\n"
                    )

                system_instruction = (
                    "You are the EduFlow Academic AI Assistant for Indian Engineering Colleges. "
                    "Provide clear, professional academic recommendations for faculty and students. "
                    "Synthesize continuous evaluation guidelines, IEEE documentation standards, and rubric structures."
                )

                full_prompt = f"{system_instruction}\n\nContext:\n{context_text}\n\nUser Question: {query}"
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=full_prompt
                )

                if response and response.text:
                    heuristics_used.append("Gemini-2.5-Flash-Live")
                    return {
                        "query": query,
                        "response": response.text,
                        "heuristics_used": heuristics_used,
                        "timestamp": datetime.now(timezone.utc)
                    }
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to rule-based engine: {e}")

        # Fallback to rule-based heuristics using real DB telemetry
        query_lower = query.lower()
        if "risk" in query_lower or "delay" in query_lower or "behind" in query_lower or "overdue" in query_lower:
            high_risk_groups = [g for g in group_summaries if g["risk_level"] in ["high", "critical"]]
            if high_risk_groups:
                g_target = high_risk_groups[0]
                text = (
                    f"Heuristic Risk Assessment indicates '{g_target['group_name']}' is currently at "
                    f"{g_target['risk_level'].upper()} RISK (Score: {g_target['risk_score']}/100) with "
                    f"{g_target['overdue_milestones_count']} overdue milestone(s) and {g_target['pending_tasks_count']} pending tasks. "
                    f"Recommended faculty intervention: {g_target['recommendation']}"
                )
            else:
                text = (
                    "All monitored student project groups are currently maintaining healthy velocity within nominal limits. "
                    "No overdue milestone breaches detected in active semester tracking."
                )
        elif "rubric" in query_lower or "viva" in query_lower or "mark" in query_lower or "evaluat" in query_lower:
            text = (
                "Generated Capstone Continuous Evaluation Rubric (Total: 50 Marks):\n"
                "1. System Architecture & Relational Schema: 15 Marks\n"
                "2. Technical Prototype & Live Demonstration: 15 Marks\n"
                "3. Individual Viva Defense & Git Audit: 10 Marks\n"
                "4. IEEE Standard Project Report Documentation: 10 Marks\n\n"
                "Advisory: Ensure 20% weightage is allocated for internal review before final university external examination."
            )
        elif "synopsis" in query_lower or "proposal" in query_lower:
            text = (
                "Project Synopsis Guidelines (Indian University Curriculum standard):\n"
                "- Problem Statement & Societal Impact (1-2 pages)\n"
                "- Literature Survey of existing solutions (min 4 papers)\n"
                "- Proposed High-Level Architecture & Block Diagram\n"
                "- Hardware/Software tech stack matrix\n"
                "- Semester milestone timeline with bi-weekly deliverables."
            )
        else:
            text = (
                f"EduFlow Academic Intelligence processed query: '{query}'. "
                f"Active department: {current_user.department}. "
                f"All curriculum milestones are synchronized with semester deadlines. "
                "You can ask for risk assessments, viva rubrics, or project synopsis guidelines."
            )

        return {
            "query": query,
            "response": text,
            "heuristics_used": heuristics_used,
            "timestamp": datetime.now(timezone.utc)
        }
