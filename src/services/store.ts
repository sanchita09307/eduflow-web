import {
  User,
  Subject,
  Project,
  StudentGroup,
  Task,
  Submission,
  RiskAssessment,
  StudentContribution,
  ActivityItem,
  NotificationItem,
  UserRole
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_t1',
    name: 'Prof. Rajeshwar Sharma',
    email: 'sharma.cse@engg.edu.in',
    role: 'teacher',
    collegeId: 'FAC-CSE-01',
    designation: 'Head of Department & Professor',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr_s1',
    name: 'Aditya Verma',
    email: 'aditya.21cs042@engg.edu.in',
    role: 'student',
    rollNumber: '21CS042',
    collegeId: '21CS042',
    semester: 'Semester VI',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr_s2',
    name: 'Priya Nair',
    email: 'priya.21cs054@engg.edu.in',
    role: 'student',
    rollNumber: '21CS054',
    collegeId: '21CS054',
    semester: 'Semester VI',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr_s3',
    name: 'Rohan Sen',
    email: 'rohan.21cs061@engg.edu.in',
    role: 'student',
    rollNumber: '21CS061',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr_s4',
    name: 'Tanvi Gupta',
    email: 'tanvi.21cs089@engg.edu.in',
    role: 'student',
    rollNumber: '21CS089',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr_s5',
    name: 'Kunal Deshmukh',
    email: 'kunal.21cs031@engg.edu.in',
    role: 'student',
    rollNumber: '21CS031',
    department: 'Computer Science & Engineering'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub_1',
    code: 'CS601',
    name: 'Major Capstone Project Phase-I',
    semester: 'Semester VI',
    department: 'Computer Science & Engineering',
    teacherId: 'usr_t1',
    teacherName: 'Prof. Rajeshwar Sharma',
    academicYear: '2026-2027',
    description: 'Final year comprehensive project encompassing architecture, prototyping, automated testing, and research documentation.',
    totalProjects: 3,
    totalStudents: 36,
    createdAt: '2026-08-01T09:00:00Z'
  },
  {
    id: 'sub_2',
    code: 'CS504',
    name: 'Database Engineering & Cloud Systems',
    semester: 'Semester V',
    department: 'Computer Science & Engineering',
    teacherId: 'usr_t1',
    teacherName: 'Prof. Rajeshwar Sharma',
    academicYear: '2026-2027',
    description: 'Relational database schema optimization, indexing strategies, distributed transactions, and cloud microservices.',
    totalProjects: 2,
    totalStudents: 42,
    createdAt: '2026-08-05T09:00:00Z'
  },
  {
    id: 'sub_3',
    code: 'AI402',
    name: 'Applied Machine Learning Laboratory',
    semester: 'Semester VII',
    department: 'Computer Science & Engineering',
    teacherId: 'usr_t1',
    teacherName: 'Prof. Rajeshwar Sharma',
    academicYear: '2026-2027',
    description: 'Implementation of supervised, unsupervised, and deep learning pipelines on real-world Indian socio-economic datasets.',
    totalProjects: 1,
    totalStudents: 28,
    createdAt: '2026-08-10T09:00:00Z'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    subjectId: 'sub_1',
    subjectCode: 'CS601',
    subjectName: 'Major Capstone Project Phase-I',
    title: 'Autonomous Hospital Triage & Vitals Telemetry (MedFlow IoT)',
    description: 'An integrated edge-computing & cloud telemetry system to capture emergency ward patient vitals and trigger priority triage alerts.',
    instructions: 'Follow IEEE format for documentation. Ensure all microservices have unit test coverage >= 80%. Submit working video demo with milestone 3.',
    teacherId: 'usr_t1',
    weightageTotal: 100,
    status: 'active',
    assignedGroupIds: ['grp_1', 'grp_2'],
    createdAt: '2026-08-12T10:00:00Z',
    milestones: [
      {
        id: 'ms_1',
        projectId: 'proj_1',
        title: 'Project Synopsis & Feasibility Proposal',
        description: 'Problem definition, literature survey of 10 IEEE papers, block diagram, and hardware BOM estimation.',
        deadline: '2026-08-25T23:59:59Z',
        weightage: 15,
        orderIndex: 1,
        requiresFile: true
      },
      {
        id: 'ms_2',
        projectId: 'proj_1',
        title: 'System Architecture & Database Design',
        description: 'Complete ER diagram, sequence diagrams, API schema specification, and telemetry protocol selection.',
        deadline: '2026-09-20T23:59:59Z',
        weightage: 20,
        orderIndex: 2,
        requiresFile: true
      },
      {
        id: 'ms_3',
        projectId: 'proj_1',
        title: 'Edge Sensor Driver & Core Backend Prototype',
        description: 'Working telemetry publisher, MQTT message broker, and real-time dashboard endpoint.',
        deadline: '2026-10-15T23:59:59Z',
        weightage: 35,
        orderIndex: 3,
        requiresFile: true
      },
      {
        id: 'ms_4',
        projectId: 'proj_1',
        title: 'Validation, Stress Testing & Security Audit',
        description: 'Latency benchmarks, sensor failure failover simulation, and HIPAA-compliant data masking.',
        deadline: '2026-11-05T23:59:59Z',
        weightage: 15,
        orderIndex: 4,
        requiresFile: true
      },
      {
        id: 'ms_5',
        projectId: 'proj_1',
        title: 'Final Project Report, Code Audit & External Viva',
        description: 'Spiral-bound report as per university guidelines, GitHub repository audit, and live viva demonstration.',
        deadline: '2026-11-28T23:59:59Z',
        weightage: 15,
        orderIndex: 5,
        requiresFile: true
      }
    ]
  },
  {
    id: 'proj_2',
    subjectId: 'sub_1',
    subjectCode: 'CS601',
    subjectName: 'Major Capstone Project Phase-I',
    title: 'Decentralized Academic Credential Verification (CredChain)',
    description: 'Tamper-proof verifiable digital degree and marksheet issuance using zero-knowledge proofs and IPFS storage.',
    instructions: 'Include smart contract audit report via Slither. Ensure smart contracts are deployed on Polygon Amoy Testnet.',
    teacherId: 'usr_t1',
    weightageTotal: 100,
    status: 'active',
    assignedGroupIds: ['grp_3'],
    createdAt: '2026-08-14T11:00:00Z',
    milestones: [
      {
        id: 'ms_201',
        projectId: 'proj_2',
        title: 'Problem Statement & Consensus Selection',
        description: 'Analysis of gas fees, chain finality, and university stakeholder workflows.',
        deadline: '2026-08-28T23:59:59Z',
        weightage: 20,
        orderIndex: 1,
        requiresFile: true
      },
      {
        id: 'ms_202',
        projectId: 'proj_2',
        title: 'Smart Contract Architecture & IPFS Node Setup',
        description: 'Solidity contract models, access control roles, and decentralized metadata schema.',
        deadline: '2026-09-30T23:59:59Z',
        weightage: 30,
        orderIndex: 2,
        requiresFile: true
      },
      {
        id: 'ms_203',
        projectId: 'proj_2',
        title: 'Verifier Web Portal & QR Code Verification',
        description: 'React frontend with QR scanner and instant cryptographic signature verification.',
        deadline: '2026-10-25T23:59:59Z',
        weightage: 30,
        orderIndex: 3,
        requiresFile: true
      },
      {
        id: 'ms_204',
        projectId: 'proj_2',
        title: 'Final Viva & University Deployment Report',
        description: 'Final viva submission with end-to-end demo and documentation.',
        deadline: '2026-11-25T23:59:59Z',
        weightage: 20,
        orderIndex: 4,
        requiresFile: true
      }
    ]
  }
];

export const INITIAL_GROUPS: StudentGroup[] = [
  {
    id: 'grp_1',
    projectId: 'proj_1',
    projectTitle: 'Autonomous Hospital Triage & Vitals Telemetry (MedFlow IoT)',
    subjectId: 'sub_1',
    subjectCode: 'CS601',
    name: 'Group 04 — Team Synapse',
    leaderId: 'usr_s1',
    leaderName: 'Aditya Verma (21CS042)',
    progressPercentage: 68,
    currentMilestoneId: 'ms_3',
    currentMilestoneTitle: 'Edge Sensor Driver & Core Backend Prototype',
    githubUrl: 'https://github.com/synapse-lab/medflow-iot-core',
    liveDemoUrl: 'https://medflow-telemetry-demo.internal',
    createdAt: '2026-08-15T10:00:00Z',
    members: [
      {
        userId: 'usr_s1',
        name: 'Aditya Verma',
        rollNumber: '21CS042',
        email: 'aditya.21cs042@engg.edu.in',
        roleInGroup: 'leader',
        assignedTasksCount: 5,
        completedTasksCount: 4
      },
      {
        userId: 'usr_s2',
        name: 'Priya Nair',
        rollNumber: '21CS054',
        email: 'priya.21cs054@engg.edu.in',
        roleInGroup: 'member',
        assignedTasksCount: 4,
        completedTasksCount: 3
      },
      {
        userId: 'usr_s3',
        name: 'Rohan Sen',
        rollNumber: '21CS061',
        email: 'rohan.21cs061@engg.edu.in',
        roleInGroup: 'member',
        assignedTasksCount: 3,
        completedTasksCount: 1
      },
      {
        userId: 'usr_s4',
        name: 'Tanvi Gupta',
        rollNumber: '21CS089',
        email: 'tanvi.21cs089@engg.edu.in',
        roleInGroup: 'member',
        assignedTasksCount: 3,
        completedTasksCount: 2
      }
    ]
  },
  {
    id: 'grp_2',
    projectId: 'proj_1',
    projectTitle: 'Autonomous Hospital Triage & Vitals Telemetry (MedFlow IoT)',
    subjectId: 'sub_1',
    subjectCode: 'CS601',
    name: 'Group 09 — PulseGuard',
    leaderId: 'usr_s5',
    leaderName: 'Kunal Deshmukh (21CS031)',
    progressPercentage: 35,
    currentMilestoneId: 'ms_2',
    currentMilestoneTitle: 'System Architecture & Database Design',
    createdAt: '2026-08-15T11:00:00Z',
    members: [
      {
        userId: 'usr_s5',
        name: 'Kunal Deshmukh',
        rollNumber: '21CS031',
        email: 'kunal.21cs031@engg.edu.in',
        roleInGroup: 'leader',
        assignedTasksCount: 4,
        completedTasksCount: 1
      }
    ]
  },
  {
    id: 'grp_3',
    projectId: 'proj_2',
    projectTitle: 'Decentralized Academic Credential Verification (CredChain)',
    subjectId: 'sub_1',
    subjectCode: 'CS601',
    name: 'Group 07 — BlockVeritas',
    leaderId: 'usr_s2',
    leaderName: 'Priya Nair (21CS054)',
    progressPercentage: 55,
    currentMilestoneId: 'ms_202',
    currentMilestoneTitle: 'Smart Contract Architecture & IPFS Node Setup',
    githubUrl: 'https://github.com/blockveritas/credchain-contracts',
    createdAt: '2026-08-16T12:00:00Z',
    members: [
      {
        userId: 'usr_s2',
        name: 'Priya Nair',
        rollNumber: '21CS054',
        email: 'priya.21cs054@engg.edu.in',
        roleInGroup: 'leader',
        assignedTasksCount: 4,
        completedTasksCount: 3
      },
      {
        userId: 'usr_s4',
        name: 'Tanvi Gupta',
        rollNumber: '21CS089',
        email: 'tanvi.21cs089@engg.edu.in',
        roleInGroup: 'member',
        assignedTasksCount: 3,
        completedTasksCount: 2
      }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk_101',
    groupId: 'grp_1',
    milestoneId: 'ms_3',
    milestoneTitle: 'Edge Sensor Driver & Core Backend Prototype',
    title: 'Configure ESP32 MAX30102 pulse oximeter I2C interrupt routines',
    description: 'Implement buffer reading with 100Hz sampling rate and peak detection algorithm on edge MCU.',
    assignedToId: 'usr_s1',
    assignedToName: 'Aditya Verma',
    assignedToRoll: '21CS042',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-10-05',
    completedAt: '2026-10-04T18:20:00Z',
    createdAt: '2026-09-25T10:00:00Z'
  },
  {
    id: 'tsk_102',
    groupId: 'grp_1',
    milestoneId: 'ms_3',
    milestoneTitle: 'Edge Sensor Driver & Core Backend Prototype',
    title: 'Implement EMQX MQTT broker with TLS mutual authentication',
    description: 'Ensure edge nodes connect with x509 client certs and subscribe to telemetry topics.',
    assignedToId: 'usr_s1',
    assignedToName: 'Aditya Verma',
    assignedToRoll: '21CS042',
    status: 'in_review',
    priority: 'urgent',
    dueDate: '2026-10-12',
    createdAt: '2026-09-28T11:00:00Z'
  },
  {
    id: 'tsk_103',
    groupId: 'grp_1',
    milestoneId: 'ms_3',
    milestoneTitle: 'Edge Sensor Driver & Core Backend Prototype',
    title: 'Build real-time triage WebSocket listener in React dashboard',
    description: 'Display SPO2, Heart Rate, and Blood Pressure curves with alert sound threshold triggers.',
    assignedToId: 'usr_s2',
    assignedToName: 'Priya Nair',
    assignedToRoll: '21CS054',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-10-14',
    createdAt: '2026-10-01T09:30:00Z'
  },
  {
    id: 'tsk_104',
    groupId: 'grp_1',
    milestoneId: 'ms_3',
    milestoneTitle: 'Edge Sensor Driver & Core Backend Prototype',
    title: 'Dockerize FastAPI ingestion microservice & TimescaleDB setup',
    description: 'Define multi-stage Dockerfile and docker-compose orchestration for hospital on-prem cluster.',
    assignedToId: 'usr_s4',
    assignedToName: 'Tanvi Gupta',
    assignedToRoll: '21CS089',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-10-08',
    completedAt: '2026-10-07T14:10:00Z',
    createdAt: '2026-10-02T14:00:00Z'
  },
  {
    id: 'tsk_105',
    groupId: 'grp_1',
    milestoneId: 'ms_3',
    milestoneTitle: 'Edge Sensor Driver & Core Backend Prototype',
    title: 'Write automated unit tests for vitals threshold classifier',
    description: 'Generate synthetic ECG/SPO2 waveforms and test high/low alarm trigger latency.',
    assignedToId: 'usr_s3',
    assignedToName: 'Rohan Sen',
    assignedToRoll: '21CS061',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-10-10', // Overdue relative to current context!
    createdAt: '2026-10-01T15:00:00Z'
  },
  {
    id: 'tsk_106',
    groupId: 'grp_1',
    milestoneId: 'ms_4',
    milestoneTitle: 'Validation, Stress Testing & Security Audit',
    title: 'Simulate 200 concurrent patient vitals streams with Locust',
    description: 'Stress-test broker ingestion throughput and verify 99th percentile response under 50ms.',
    assignedToId: 'usr_s3',
    assignedToName: 'Rohan Sen',
    assignedToRoll: '21CS061',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-28',
    createdAt: '2026-10-05T10:00:00Z'
  },
  {
    id: 'tsk_201',
    groupId: 'grp_2',
    milestoneId: 'ms_2',
    milestoneTitle: 'System Architecture & Database Design',
    title: 'Complete ER diagram and schema normalization to 3NF',
    description: 'Document database tables for sensor logs, patient records, and doctor on-call schedules.',
    assignedToId: 'usr_s5',
    assignedToName: 'Kunal Deshmukh',
    assignedToRoll: '21CS031',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-09-18', // Very overdue!
    createdAt: '2026-09-01T10:00:00Z'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'subm_1',
    groupId: 'grp_1',
    groupName: 'Group 04 — Team Synapse',
    milestoneId: 'ms_1',
    milestoneTitle: 'Project Synopsis & Feasibility Proposal',
    projectId: 'proj_1',
    version: 2,
    fileName: 'MedFlow_Synopsis_IEEE_v2.pdf',
    fileSize: '3.4 MB',
    fileType: 'application/pdf',
    fileUrl: '/uploads/synopsis_v2.pdf',
    submissionNotes: 'Revised as per Prof. Sharma comments: Added comparative survey table of 12 wireless vitals monitors and exact BOM costing under ₹4,500.',
    submittedById: 'usr_s1',
    submittedByName: 'Aditya Verma (Leader)',
    submittedAt: '2026-08-24T21:14:00Z',
    status: 'approved',
    review: {
      id: 'rev_1',
      submissionId: 'subm_1',
      reviewerId: 'usr_t1',
      reviewerName: 'Prof. Rajeshwar Sharma',
      status: 'approved',
      score: 14,
      maxScore: 15,
      feedback: 'Excellent literature review and budget plan. Feasibility verified with college IoT lab inventory. Approved to proceed with System Architecture.',
      reviewedAt: '2026-08-26T14:30:00Z'
    },
    history: [
      {
        version: 1,
        submittedAt: '2026-08-21T18:00:00Z',
        submittedByName: 'Aditya Verma',
        fileName: 'MedFlow_Synopsis_Draft.pdf',
        notes: 'Initial draft proposal.',
        status: 'rework_requested',
        feedback: 'Hardware BOM lacked current Indian market distributor quotes. Please revise.',
        score: 10
      },
      {
        version: 2,
        submittedAt: '2026-08-24T21:14:00Z',
        submittedByName: 'Aditya Verma',
        fileName: 'MedFlow_Synopsis_IEEE_v2.pdf',
        notes: 'Revised with distributor quotes and updated architecture block diagram.',
        status: 'approved',
        feedback: 'Approved.',
        score: 14
      }
    ]
  },
  {
    id: 'subm_2',
    groupId: 'grp_1',
    groupName: 'Group 04 — Team Synapse',
    milestoneId: 'ms_2',
    milestoneTitle: 'System Architecture & Database Design',
    projectId: 'proj_1',
    version: 1,
    fileName: 'MedFlow_System_Architecture_Doc.pdf',
    fileSize: '5.1 MB',
    fileType: 'application/pdf',
    fileUrl: '/uploads/architecture_v1.pdf',
    submissionNotes: 'Contains UML 2.5 Sequence Diagrams, TimescaleDB Hypertables schema, and edge-to-cloud security handshake protocol.',
    submittedById: 'usr_s1',
    submittedByName: 'Aditya Verma (Leader)',
    submittedAt: '2026-09-19T22:45:00Z',
    status: 'approved',
    review: {
      id: 'rev_2',
      submissionId: 'subm_2',
      reviewerId: 'usr_t1',
      reviewerName: 'Prof. Rajeshwar Sharma',
      status: 'approved',
      score: 19,
      maxScore: 20,
      feedback: 'Very thorough database schema. The time-series retention policy for vitals is well thought out. Keep up this momentum for the prototype.',
      reviewedAt: '2026-09-22T11:15:00Z'
    }
  },
  {
    id: 'subm_3',
    groupId: 'grp_1',
    groupName: 'Group 04 — Team Synapse',
    milestoneId: 'ms_3',
    milestoneTitle: 'Edge Sensor Driver & Core Backend Prototype',
    projectId: 'proj_1',
    version: 1,
    fileName: 'MedFlow_Prototype_Demo_Report_v1.pdf',
    fileSize: '8.8 MB',
    fileType: 'application/pdf',
    fileUrl: '/uploads/prototype_v1.pdf',
    submissionNotes: 'Includes sensor circuit photos, logic analyzer waveforms, and link to GitHub repo release v0.3.0. Live video hosted on YouTube unlisted.',
    submittedById: 'usr_s1',
    submittedByName: 'Aditya Verma (Leader)',
    submittedAt: '2026-10-08T20:10:00Z',
    status: 'under_review'
  },
  {
    id: 'subm_4',
    groupId: 'grp_2',
    groupName: 'Group 09 — PulseGuard',
    milestoneId: 'ms_1',
    milestoneTitle: 'Project Synopsis & Feasibility Proposal',
    projectId: 'proj_1',
    version: 1,
    fileName: 'PulseGuard_Proposal.docx',
    fileSize: '1.2 MB',
    fileType: 'application/docx',
    fileUrl: '/uploads/pulseguard_p1.docx',
    submissionNotes: 'Preliminary synopsis.',
    submittedById: 'usr_s5',
    submittedByName: 'Kunal Deshmukh',
    submittedAt: '2026-09-02T12:00:00Z',
    status: 'rework_requested',
    review: {
      id: 'rev_4',
      submissionId: 'subm_4',
      reviewerId: 'usr_t1',
      reviewerName: 'Prof. Rajeshwar Sharma',
      status: 'rework_requested',
      score: 8,
      maxScore: 15,
      feedback: 'Incomplete literature survey. Did not specify microcontroller model or telemetry backend. Immediate revision required.',
      reviewedAt: '2026-09-05T16:00:00Z'
    }
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    groupId: 'grp_1',
    groupName: 'Group 04 — Team Synapse',
    userId: 'usr_s1',
    userName: 'Aditya Verma',
    action: 'submitted milestone work',
    target: 'Milestone 3: Edge Sensor Driver Prototype',
    timestamp: '2 hours ago',
    type: 'submission'
  },
  {
    id: 'act_2',
    groupId: 'grp_1',
    groupName: 'Group 04 — Team Synapse',
    userId: 'usr_s4',
    userName: 'Tanvi Gupta',
    action: 'completed task',
    target: 'Dockerize FastAPI ingestion microservice',
    timestamp: '1 day ago',
    type: 'task'
  },
  {
    id: 'act_3',
    groupId: 'grp_1',
    groupName: 'Group 04 — Team Synapse',
    userId: 'usr_t1',
    userName: 'Prof. Rajeshwar Sharma',
    action: 'reviewed & approved',
    target: 'Milestone 2 (Score: 19/20)',
    timestamp: '2 weeks ago',
    type: 'review'
  },
  {
    id: 'act_4',
    groupId: 'grp_2',
    groupName: 'Group 09 — PulseGuard',
    userId: 'usr_t1',
    userName: 'Prof. Rajeshwar Sharma',
    action: 'flagged risk status',
    target: 'Milestone 2 overdue by 19 days',
    timestamp: '3 days ago',
    type: 'alert'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'New Milestone Submission',
    message: 'Group 04 submitted Edge Sensor Driver Prototype for review.',
    type: 'info',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif_2',
    title: 'High Risk Alert: Group 09',
    message: 'Group 09 is 19 days past Milestone 2 deadline with no submission recorded.',
    type: 'danger',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: 'notif_3',
    title: 'Upcoming Internal Assessment Viva',
    message: 'CS601 Phase-I internal review schedule starts in 18 days.',
    type: 'warning',
    timestamp: '3 days ago',
    read: true
  }
];
