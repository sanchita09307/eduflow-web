import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.core.security import get_password_hash
from app.models.models import (
    Base,
    User,
    Subject,
    SubjectEnrollment,
    Project,
    ProjectMilestone,
    StudentGroup,
    GroupMembership,
    Task,
    Submission,
    SubmissionReview,
    Notification,
    ActivityLog
)

TEACHER_PASSWORD = "Teacher@2026!"
STUDENT_PASSWORD = "Student@2026!"


async def seed():
    print("Starting database seed...")
    # Ensure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(User).filter_by(id="usr_t1"))
        if result.scalar_one_or_none():
            print("Database already contains seed data. Skipping seed.")
            return

        print("Seeding Users...")
        teacher_hash = get_password_hash(TEACHER_PASSWORD)
        student_hash = get_password_hash(STUDENT_PASSWORD)

        users = [
            User(
                id="usr_t1",
                name="Prof. Rajeshwar Sharma",
                email="sharma.cse@engg.edu.in",
                hashed_password=teacher_hash,
                role="teacher",
                college_id="FAC-CSE-01",
                designation="Head of Department & Professor",
                department="Computer Science & Engineering",
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            ),
            User(
                id="usr_s1",
                name="Aditya Verma",
                email="aditya.21cs042@engg.edu.in",
                hashed_password=student_hash,
                role="student",
                roll_number="21CS042",
                college_id="21CS042",
                semester="Semester VI",
                department="Computer Science & Engineering",
                avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
            ),
            User(
                id="usr_s2",
                name="Priya Nair",
                email="priya.21cs054@engg.edu.in",
                hashed_password=student_hash,
                role="student",
                roll_number="21CS054",
                college_id="21CS054",
                semester="Semester VI",
                department="Computer Science & Engineering",
                avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
            ),
            User(
                id="usr_s3",
                name="Rohan Sen",
                email="rohan.21cs061@engg.edu.in",
                hashed_password=student_hash,
                role="student",
                roll_number="21CS061",
                college_id="21CS061",
                semester="Semester VI",
                department="Computer Science & Engineering",
                avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
            ),
            User(
                id="usr_s4",
                name="Tanvi Gupta",
                email="tanvi.21cs089@engg.edu.in",
                hashed_password=student_hash,
                role="student",
                roll_number="21CS089",
                college_id="21CS089",
                semester="Semester VI",
                department="Computer Science & Engineering",
                avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
            ),
            User(
                id="usr_s5",
                name="Kunal Deshmukh",
                email="kunal.21cs031@engg.edu.in",
                hashed_password=student_hash,
                role="student",
                roll_number="21CS031",
                college_id="21CS031",
                semester="Semester VI",
                department="Computer Science & Engineering"
            )
        ]
        session.add_all(users)
        await session.flush()

        print("Seeding Subjects...")
        subjects = [
            Subject(
                id="sub_1",
                code="CS601",
                name="Major Capstone Project Phase-I",
                semester="Semester VI",
                department="Computer Science & Engineering",
                teacher_id="usr_t1",
                academic_year="2026-2027",
                description="Final year comprehensive project encompassing architecture, prototyping, automated testing, and research documentation."
            ),
            Subject(
                id="sub_2",
                code="CS504",
                name="Database Engineering & Cloud Systems",
                semester="Semester V",
                department="Computer Science & Engineering",
                teacher_id="usr_t1",
                academic_year="2026-2027",
                description="Relational database schema optimization, indexing strategies, distributed transactions, and cloud microservices."
            ),
            Subject(
                id="sub_3",
                code="AI402",
                name="Applied Machine Learning Laboratory",
                semester="Semester VII",
                department="Computer Science & Engineering",
                teacher_id="usr_t1",
                academic_year="2026-2027",
                description="Implementation of supervised, unsupervised, and deep learning pipelines on real-world Indian socio-economic datasets."
            )
        ]
        session.add_all(subjects)
        await session.flush()

        print("Seeding Subject Enrollments...")
        enrollments = [
            SubjectEnrollment(id=f"enr_{i}", subject_id="sub_1", user_id=uid)
            for i, uid in enumerate(["usr_s1", "usr_s2", "usr_s3", "usr_s4", "usr_s5"], start=1)
        ]
        session.add_all(enrollments)
        await session.flush()

        print("Seeding Projects & Milestones...")
        project1 = Project(
            id="proj_1",
            subject_id="sub_1",
            title="Autonomous Hospital Triage & Vitals Telemetry (MedFlow IoT)",
            description="An integrated edge-computing & cloud telemetry system to capture emergency ward patient vitals and trigger priority triage alerts.",
            instructions="Follow IEEE format for documentation. Ensure all microservices have unit test coverage >= 80%. Submit working video demo with milestone 3.",
            teacher_id="usr_t1",
            weightage_total=100,
            status="active"
        )
        project2 = Project(
            id="proj_2",
            subject_id="sub_1",
            title="Decentralized Academic Credential Verification (CredChain)",
            description="Tamper-proof verifiable digital degree and marksheet issuance using zero-knowledge proofs and IPFS storage.",
            instructions="Include smart contract audit report via Slither. Ensure smart contracts are deployed on Polygon Amoy Testnet.",
            teacher_id="usr_t1",
            weightage_total=100,
            status="active"
        )
        session.add_all([project1, project2])
        await session.flush()

        milestones = [
            # MedFlow IoT Milestones (Total = 15+20+35+15+15 = 100)
            ProjectMilestone(
                id="ms_1",
                project_id="proj_1",
                title="Project Synopsis & Feasibility Proposal",
                description="Problem definition, literature survey of 10 IEEE papers, block diagram, and hardware BOM estimation.",
                deadline=datetime.fromisoformat("2026-08-25T23:59:59+00:00"),
                weightage=15,
                order_index=1,
                requires_file=True
            ),
            ProjectMilestone(
                id="ms_2",
                project_id="proj_1",
                title="System Architecture & Database Design",
                description="Complete ER diagram, sequence diagrams, API schema specification, and telemetry protocol selection.",
                deadline=datetime.fromisoformat("2026-09-20T23:59:59+00:00"),
                weightage=20,
                order_index=2,
                requires_file=True
            ),
            ProjectMilestone(
                id="ms_3",
                project_id="proj_1",
                title="Edge Sensor Driver & Core Backend Prototype",
                description="Working telemetry publisher, MQTT message broker, and real-time dashboard endpoint.",
                deadline=datetime.fromisoformat("2026-10-15T23:59:59+00:00"),
                weightage=35,
                order_index=3,
                requires_file=True
            ),
            ProjectMilestone(
                id="ms_4",
                project_id="proj_1",
                title="Validation, Stress Testing & Security Audit",
                description="Latency benchmarks, sensor failure failover simulation, and HIPAA-compliant data masking.",
                deadline=datetime.fromisoformat("2026-11-05T23:59:59+00:00"),
                weightage=15,
                order_index=4,
                requires_file=True
            ),
            ProjectMilestone(
                id="ms_5",
                project_id="proj_1",
                title="Final Project Report, Code Audit & External Viva",
                description="Spiral-bound report as per university guidelines, GitHub repository audit, and live viva demonstration.",
                deadline=datetime.fromisoformat("2026-11-28T23:59:59+00:00"),
                weightage=15,
                order_index=5,
                requires_file=True
            ),
            # CredChain Milestones (Total = 20+30+30+20 = 100)
            ProjectMilestone(
                id="ms_201",
                project_id="proj_2",
                title="Problem Statement & Consensus Selection",
                description="Analysis of gas fees, chain finality, and university stakeholder workflows.",
                deadline=datetime.fromisoformat("2026-08-28T23:59:59+00:00"),
                weightage=20,
                order_index=1,
                requires_file=True
            ),
            ProjectMilestone(
                id="ms_202",
                project_id="proj_2",
                title="Smart Contract Architecture & IPFS Node Setup",
                description="Solidity contract models, access control roles, and decentralized metadata schema.",
                deadline=datetime.fromisoformat("2026-09-30T23:59:59+00:00"),
                weightage=30,
                order_index=2,
                requires_file=True
            ),
            ProjectMilestone(
                id="ms_203",
                project_id="proj_2",
                title="Verifier Web Portal & QR Code Verification",
                description="React frontend with QR scanner and instant cryptographic signature verification.",
                deadline=datetime.fromisoformat("2026-10-25T23:59:59+00:00"),
                weightage=30,
                order_index=3,
                requires_file=True
            ),
            ProjectMilestone(
                id="ms_204",
                project_id="proj_2",
                title="Final Viva & University Deployment Report",
                description="Final viva submission with end-to-end demo and documentation.",
                deadline=datetime.fromisoformat("2026-11-25T23:59:59+00:00"),
                weightage=20,
                order_index=4,
                requires_file=True
            )
        ]
        session.add_all(milestones)
        await session.flush()

        print("Seeding Student Groups & Memberships...")
        groups = [
            StudentGroup(
                id="grp_1",
                project_id="proj_1",
                subject_id="sub_1",
                name="Group 04 — Team Synapse",
                leader_id="usr_s1",
                progress_percentage=68,
                github_url="https://github.com/synapse-lab/medflow-iot-core",
                live_demo_url="https://medflow-telemetry-demo.internal"
            ),
            StudentGroup(
                id="grp_2",
                project_id="proj_1",
                subject_id="sub_1",
                name="Group 09 — PulseGuard",
                leader_id="usr_s5",
                progress_percentage=35
            ),
            StudentGroup(
                id="grp_3",
                project_id="proj_2",
                subject_id="sub_1",
                name="Group 07 — BlockVeritas",
                leader_id="usr_s2",
                progress_percentage=55,
                github_url="https://github.com/blockveritas/credchain-contracts"
            )
        ]
        session.add_all(groups)
        await session.flush()

        memberships = [
            # Group 1
            GroupMembership(id="gm_1", group_id="grp_1", user_id="usr_s1", role_in_group="leader"),
            GroupMembership(id="gm_2", group_id="grp_1", user_id="usr_s2", role_in_group="member"),
            GroupMembership(id="gm_3", group_id="grp_1", user_id="usr_s3", role_in_group="member"),
            GroupMembership(id="gm_4", group_id="grp_1", user_id="usr_s4", role_in_group="member"),
            # Group 2
            GroupMembership(id="gm_5", group_id="grp_2", user_id="usr_s5", role_in_group="leader"),
            # Group 3
            GroupMembership(id="gm_6", group_id="grp_3", user_id="usr_s2", role_in_group="leader"),
            GroupMembership(id="gm_7", group_id="grp_3", user_id="usr_s4", role_in_group="member")
        ]
        session.add_all(memberships)
        await session.flush()

        print("Seeding Tasks...")
        tasks = [
            Task(
                id="tsk_101",
                group_id="grp_1",
                milestone_id="ms_3",
                title="Configure ESP32 MAX30102 pulse oximeter I2C interrupt routines",
                description="Implement buffer reading with 100Hz sampling rate and peak detection algorithm on edge MCU.",
                assigned_to_id="usr_s1",
                status="completed",
                priority="high",
                due_date=datetime.fromisoformat("2026-10-05T00:00:00+00:00"),
                completed_at=datetime.fromisoformat("2026-10-04T18:20:00+00:00")
            ),
            Task(
                id="tsk_102",
                group_id="grp_1",
                milestone_id="ms_3",
                title="Implement EMQX MQTT broker with TLS mutual authentication",
                description="Ensure edge nodes connect with x509 client certs and subscribe to telemetry topics.",
                assigned_to_id="usr_s1",
                status="in_review",
                priority="urgent",
                due_date=datetime.fromisoformat("2026-10-12T00:00:00+00:00")
            ),
            Task(
                id="tsk_103",
                group_id="grp_1",
                milestone_id="ms_3",
                title="Build real-time triage WebSocket listener in React dashboard",
                description="Display SPO2, Heart Rate, and Blood Pressure curves with alert sound threshold triggers.",
                assigned_to_id="usr_s2",
                status="in_progress",
                priority="high",
                due_date=datetime.fromisoformat("2026-10-14T00:00:00+00:00")
            ),
            Task(
                id="tsk_104",
                group_id="grp_1",
                milestone_id="ms_3",
                title="Dockerize FastAPI ingestion microservice & TimescaleDB setup",
                description="Define multi-stage Dockerfile and docker-compose orchestration for hospital on-prem cluster.",
                assigned_to_id="usr_s4",
                status="completed",
                priority="medium",
                due_date=datetime.fromisoformat("2026-10-08T00:00:00+00:00"),
                completed_at=datetime.fromisoformat("2026-10-07T14:10:00+00:00")
            ),
            Task(
                id="tsk_105",
                group_id="grp_1",
                milestone_id="ms_3",
                title="Write automated unit tests for vitals threshold classifier",
                description="Generate synthetic ECG/SPO2 waveforms and test high/low alarm trigger latency.",
                assigned_to_id="usr_s3",
                status="todo",
                priority="urgent",
                due_date=datetime.fromisoformat("2026-10-10T00:00:00+00:00")
            ),
            Task(
                id="tsk_106",
                group_id="grp_1",
                milestone_id="ms_4",
                title="Simulate 200 concurrent patient vitals streams with Locust",
                description="Stress-test broker ingestion throughput and verify 99th percentile response under 50ms.",
                assigned_to_id="usr_s3",
                status="todo",
                priority="medium",
                due_date=datetime.fromisoformat("2026-10-28T00:00:00+00:00")
            ),
            Task(
                id="tsk_201",
                group_id="grp_2",
                milestone_id="ms_2",
                title="Complete ER diagram and schema normalization to 3NF",
                description="Document database tables for sensor logs, patient records, and doctor on-call schedules.",
                assigned_to_id="usr_s5",
                status="todo",
                priority="urgent",
                due_date=datetime.fromisoformat("2026-09-18T00:00:00+00:00")
            )
        ]
        session.add_all(tasks)
        await session.flush()

        print("Seeding Submissions & Reviews...")
        submissions = [
            Submission(
                id="subm_1",
                group_id="grp_1",
                milestone_id="ms_1",
                version=2,
                file_name="MedFlow_Synopsis_IEEE_v2.pdf",
                file_size=3565158,
                file_type="application/pdf",
                file_url="/uploads/synopsis_v2.pdf",
                submission_notes="Revised as per Prof. Sharma comments: Added comparative survey table of 12 wireless vitals monitors and exact BOM costing under ₹4,500.",
                submitted_by_id="usr_s1",
                submitted_at=datetime.fromisoformat("2026-08-24T21:14:00+00:00"),
                status="approved"
            ),
            Submission(
                id="subm_2",
                group_id="grp_1",
                milestone_id="ms_2",
                version=1,
                file_name="MedFlow_System_Architecture_Doc.pdf",
                file_size=5347737,
                file_type="application/pdf",
                file_url="/uploads/architecture_v1.pdf",
                submission_notes="Contains UML 2.5 Sequence Diagrams, TimescaleDB Hypertables schema, and edge-to-cloud security handshake protocol.",
                submitted_by_id="usr_s1",
                submitted_at=datetime.fromisoformat("2026-09-19T22:45:00+00:00"),
                status="approved"
            ),
            Submission(
                id="subm_3",
                group_id="grp_1",
                milestone_id="ms_3",
                version=1,
                file_name="MedFlow_Prototype_Demo_Report_v1.pdf",
                file_size=9227468,
                file_type="application/pdf",
                file_url="/uploads/prototype_v1.pdf",
                submission_notes="Includes sensor circuit photos, logic analyzer waveforms, and link to GitHub repo release v0.3.0. Live video hosted on YouTube unlisted.",
                submitted_by_id="usr_s1",
                submitted_at=datetime.fromisoformat("2026-10-08T20:10:00+00:00"),
                status="under_review"
            ),
            Submission(
                id="subm_4",
                group_id="grp_2",
                milestone_id="ms_1",
                version=1,
                file_name="PulseGuard_Proposal.docx",
                file_size=1258291,
                file_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                file_url="/uploads/pulseguard_p1.docx",
                submission_notes="Preliminary synopsis.",
                submitted_by_id="usr_s5",
                submitted_at=datetime.fromisoformat("2026-09-02T12:00:00+00:00"),
                status="rework_requested"
            )
        ]
        session.add_all(submissions)
        await session.flush()

        reviews = [
            SubmissionReview(
                id="rev_1",
                submission_id="subm_1",
                reviewer_id="usr_t1",
                status="approved",
                score=14.0,
                max_score=15.0,
                feedback="Excellent literature review and budget plan. Feasibility verified with college IoT lab inventory. Approved to proceed with System Architecture.",
                reviewed_at=datetime.fromisoformat("2026-08-26T14:30:00+00:00")
            ),
            SubmissionReview(
                id="rev_2",
                submission_id="subm_2",
                reviewer_id="usr_t1",
                status="approved",
                score=19.0,
                max_score=20.0,
                feedback="Very thorough database schema. The time-series retention policy for vitals is well thought out. Keep up this momentum for the prototype.",
                reviewed_at=datetime.fromisoformat("2026-09-22T11:15:00+00:00")
            ),
            SubmissionReview(
                id="rev_4",
                submission_id="subm_4",
                reviewer_id="usr_t1",
                status="rework_requested",
                score=8.0,
                max_score=15.0,
                feedback="Incomplete literature survey. Did not specify microcontroller model or telemetry backend. Immediate revision required.",
                reviewed_at=datetime.fromisoformat("2026-09-05T16:00:00+00:00")
            )
        ]
        session.add_all(reviews)
        await session.flush()

        print("Seeding Activities & Notifications...")
        activities = [
            ActivityLog(
                id="act_1",
                group_id="grp_1",
                user_id="usr_s1",
                action="submitted milestone work",
                target="Milestone 3: Edge Sensor Driver Prototype",
                activity_type="submission",
                created_at=datetime.now(timezone.utc) - timedelta(hours=2)
            ),
            ActivityLog(
                id="act_2",
                group_id="grp_1",
                user_id="usr_s4",
                action="completed task",
                target="Dockerize FastAPI ingestion microservice",
                activity_type="task",
                created_at=datetime.now(timezone.utc) - timedelta(days=1)
            ),
            ActivityLog(
                id="act_3",
                group_id="grp_1",
                user_id="usr_t1",
                action="reviewed & approved",
                target="Milestone 2 (Score: 19/20)",
                activity_type="review",
                created_at=datetime.now(timezone.utc) - timedelta(days=14)
            ),
            ActivityLog(
                id="act_4",
                group_id="grp_2",
                user_id="usr_t1",
                action="flagged risk status",
                target="Milestone 2 overdue by 19 days",
                activity_type="alert",
                created_at=datetime.now(timezone.utc) - timedelta(days=3)
            )
        ]
        session.add_all(activities)

        notifications = [
            Notification(
                id="notif_1",
                user_id="usr_t1",
                title="New Milestone Submission",
                message="Group 04 submitted Edge Sensor Driver Prototype for review.",
                type="info",
                read=False,
                created_at=datetime.now(timezone.utc) - timedelta(hours=2)
            ),
            Notification(
                id="notif_2",
                user_id="usr_t1",
                title="High Risk Alert: Group 09",
                message="Group 09 is 19 days past Milestone 2 deadline with no submission recorded.",
                type="danger",
                read=False,
                created_at=datetime.now(timezone.utc) - timedelta(days=1)
            ),
            Notification(
                id="notif_3",
                user_id=None,
                title="Upcoming Internal Assessment Viva",
                message="CS601 Phase-I internal review schedule starts in 18 days.",
                type="warning",
                read=True,
                created_at=datetime.now(timezone.utc) - timedelta(days=3)
            )
        ]
        session.add_all(notifications)

        await session.commit()
        print("Database seeding completed successfully!")
        print("\nDemo Accounts:")
        print("  Teacher: sharma.cse@engg.edu.in / Teacher@2026!")
        print("  Student (Leader): aditya.21cs042@engg.edu.in / Student@2026!")
        print("  Student: priya.21cs054@engg.edu.in / Student@2026!")


if __name__ == "__main__":
    asyncio.run(seed())
