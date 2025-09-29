"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import KanbanBoard from "@/components/ui/KanbanBoard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Edit, Trash, Plus, ChevronDown, ChevronUp, Bell, Send, CheckCircle2 } from "lucide-react";
// Types
interface Interview {
  id: string;
  type: string;
  date: string;
  time: string;
  notes: string;
}

interface OfferDetails {
  salary: string;
  equity: string;
  bonus: string;
  location: string;
  startDate: string;
  deadline: string;
}

interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: "applied" | "interviewing" | "offer" | "rejected" | "accepted";
  dateApplied: string;
  jobUrl: string;
  notes: string;
  interviews: Interview[];
  offerDetails: OfferDetails;
  lastFollowUp?: string;
}

const INTERVIEW_PREP: Record<string, { checklist: string[]; links?: string[] }> = {
  Technical: {
    checklist: [
      "Identify weak patterns (graphs, DP, trees) and drill them first",
      "Practice aloud: restate, constraints, brute force, optimize, test",
      "Use pattern playbook: two-pointers, sliding window, prefix/suffix, union-find, heap, sweep line",
      "Track time/space and tradeoffs for each solution",
      "Write unit-style tests for edge cases (empty, single, dupes, extremes)",
      "Review language-specific pitfalls (overflow, mutability, references)",
      "Refresh core CS: complexity table, sorting, hashing, recursion vs iteration",
      "Do timed mocks and analyze misses (speed vs. accuracy vs. comms)",
      "Prepare 2–3 concise project deep dives with metrics and impact",
      "Verify dev setup for live coding (editor, runtime, tests)"
    ],
    links: [
      "https://www.techinterviewhandbook.org/",
      "https://leetcode.com/",
      "https://neetcode.io/roadmap",
      "https://www.hackerrank.com/",
      "https://github.com/jwasham/coding-interview-university",
      "https://interviewing.io/"
    ]
  },

  "Design Review": {
  checklist: [
    "Prepare 2-3 detailed engineering projects with design process, constraints, and outcomes",
    "Review engineering fundamentals: statics, dynamics, materials, thermodynamics",
    "Practice explaining technical concepts to non-technical stakeholders",
    "Prepare for design trade-off discussions (cost vs performance vs reliability)",
    "Review relevant codes, standards, and regulations (ASME, IEEE, OSHA, etc.)",
    "Bring portfolio with CAD drawings, schematics, or technical diagrams",
    "Practice failure analysis: root cause identification and prevention strategies",
    "Prepare examples of design optimization and iterative improvement",
    "Review project management experience: timeline, budget, team coordination",
    "Understand company's products, manufacturing processes, and engineering challenges"
  ],
  links: [
    "https://www.asme.org/career-education/early-career-engineers",
    "https://www.ieee.org/membership/students/index.html",
    "https://www.engineeringtoolbox.com/",
    "https://www.autodesk.com/education/home"
  ]
},

"Process Review": {
  checklist: [
    "Map out end-to-end processes you've designed, optimized, or managed",
    "Quantify improvements: efficiency gains, cost reduction, quality metrics",
    "Review process control fundamentals: PID controllers, feedback loops",
    "Prepare lean manufacturing and Six Sigma examples if applicable",
    "Review safety protocols: HAZOP, risk assessment, safety instrumentation",
    "Practice explaining process flow diagrams and P&IDs",
    "Prepare examples of troubleshooting and process optimization",
    "Review regulatory compliance: FDA, EPA, OSHA requirements",
    "Understand supply chain and logistics impact on processes",
    "Prepare for scale-up discussions: pilot to production challenges"
  ],
  links: [
    "https://www.aiche.org/resources/career/career-resources",
    "https://www.isixsigma.com/",
    "https://www.lean.org/",
    "https://www.nist.gov/manufacturing-extension-partnership"
  ]
},

"Project Review": {
  checklist: [
    "Prepare 2-3 major projects: scope, timeline, budget, deliverables, outcomes",
    "Review project management methodologies: waterfall, agile, critical path",
    "Practice stakeholder management examples: clients, contractors, regulators",
    "Quantify project success: on-time delivery, budget adherence, performance metrics",
    "Review risk management: identification, mitigation, contingency planning",
    "Prepare examples of problem-solving during project execution",
    "Review relevant engineering standards and building codes",
    "Practice presenting technical information to diverse audiences",
    "Prepare examples of cross-functional team leadership",
    "Review environmental impact and sustainability considerations"
  ],
  links: [
    "https://www.pmi.org/",
    "https://www.asce.org/career-and-growth/",
    "https://www.nspe.org/resources/career-center",
    "https://www.constructionexec.com/"
  ]
},

  "System Design": {
    checklist: [
      "Open with requirements: goals, non-goals, scale (QPS, storage, latency), SLA",
      "Propose high-level diagram: client, API, services, DBs, cache, queue, storage",
      "Choose data models (SQL vs NoSQL) and justify with access patterns",
      "Plan scaling: sharding/partitioning, replication, read/write paths",
      "Add reliability: retries, idempotency, circuit breakers, backpressure",
      "Latency plan: caching layers, indexes, CQRS, pagination, precompute",
      "State tradeoffs (CAP, consistency models, exactly-once vs at-least-once)",
      "Observability: metrics, logs, tracing, SLOs, alerts, dashboards",
      "Bottlenecks and growth: where it breaks first and how you’d evolve it",
      "Security & privacy basics: authn/z, secrets, PII handling, rate limits"
    ],
    links: [
      "https://github.com/donnemartin/system-design-primer",
      "https://hellointerview.com/learn/system-design/in-a-hurry/introduction",
      "https://www.pragmaticengineer.com/preparing-for-the-systems-design-and-coding-interviews/",
      "https://martin.kleppmann.com/ddia.html"
    ]
  },

  Behavioral: {
    checklist: [
      "Map 6–8 STAR stories to common themes (impact, conflict, failure, leadership, ownership, ambiguity)",
      "Attach numbers to results (revenue, latency, costs, adoption, uptime)",
      "Show learning loops: mistake → action → changed behavior",
      "Mirror company values with authentic examples, not buzzwords",
      "Prep 5 sharp questions for the team, product, and roadmap",
      "Practice concise delivery (2–3 minutes per story) and active listening",
      "Have a clear motivation narrative for the role and company",
      "Plan compensation and location constraints talking points"
    ],
    links: [
      "https://www.techinterviewhandbook.org/behavioral-interview/",
      "https://www.themuse.com/advice/star-interview-method"
    ]
  },

  "Product Sense": {
    checklist: [
      "Frame with a product method (e.g., CIRCLES): users, needs, goals, constraints",
      "Define target user and JTBD; map top pains and current alternatives",
      "Propose solutions with tradeoffs; prioritize by impact x effort",
      "Define success metrics (activation, retention, NPS, revenue) and guardrails",
      "Think go-to-market, risks, and ethical considerations",
      "Run one concrete example: user flow + edge cases",
      "Add v1, v2 roadmap and experiment ideas (A/Bs, surveys, usability tests)"
    ],
    links: [
      "https://www.tryexponent.com/product-management",
      "https://www.reforge.com/blog/product-sense",
      "https://www.amazon.com/Decode-Conquer-Answers-Product-Management/dp/0998120448"
    ]
  },

  "Case Study": {
    checklist: [
      "Clarify scope, objective, constraints, and timeline before solving",
      "Choose a fitting structure (profitability, growth, market entry) then adapt",
      "State assumptions with ranges; sanity-check with quick math",
      "Build a simple model; pressure-test sensitivity and risks",
      "Synthesize findings and clear recommendation with next steps",
      "Prepare slides that tell a story: problem → options → decision → impact"
    ],
    links: [
      "https://www.caseinterview.com/",
      "https://www.strategycase.com/",
      "https://www.firmsconsulting.com/"
    ]
  },

  "Portfolio Review": {
    checklist: [
      "Curate 3–5 strongest projects; each with problem, constraints, process, outcome",
      "Show iterations: early mocks → usability findings → final designs",
      "Explain tradeoffs and rejected alternatives",
      "Quantify impact (conversion, time-on-task, error rate, revenue)",
      "Prepare interactive prototypes and make links load fast",
      "Rehearse 10–12 minute walkthrough and a 2-minute TL;DR",
      "Add a ‘what I’d improve next’ slide for each project"
    ],
    links: [
      "https://www.nngroup.com/articles/ux-portfolio/",
      "https://www.coursera.org/specializations/ux-design",
      "https://dribbble.com/"
    ]
  },

  Statistics: {
    checklist: [
      "Recall core stats: distributions, CLT, CI, p-values, effect size, power",
      "Know A/B testing end-to-end: randomization, sample size, metrics, pitfalls",
      "Explain ML basics plainly: bias-variance, regularization, cross-validation",
      "SQL fluency: joins, GROUP BY, window functions, subqueries, CTEs",
      "Practice experiment debugging (peeking, novelty, seasonality, SRM)",
      "Prepare 2–3 analytics stories with business outcomes"
    ],
    links: [
      "https://www.stat.cmu.edu/~cshalizi/ADAfaEPoV/",
      "https://www.statquest.org/",
      "https://www.mode.com/sql-tutorial",
      "https://sqlbolt.com/",
      "https://www.statlearning.com/"
    ]
  },

  "Sales Pitch": {
    checklist: [
      "Research prospect: industry metrics, current stack, likely pains",
      "Discovery first: 5–7 probing questions to quantify pain and urgency",
      "Tailor demo to 2–3 critical pains; show outcomes, not features",
      "Handle top objections with proof (case studies, ROI math, social proof)",
      "Discuss pricing with value framing; anchor and present options",
      "Define clear next step: pilot scope, timeline, success criteria"
    ],
    links: [
      "https://www.hubspot.com/sales/sales-process",
      "https://www.gong.io/blog/",
      "https://meddicc.com/what-is-meddicc/"
    ]
  },

  "Role Play": {
    checklist: [
      "Stay in role; keep the conversation natural and goal-oriented",
      "Use active listening and summarize back to confirm understanding",
      "Ask layered questions (open → specific → confirm)",
      "Negotiate with interests, not positions; trade, don’t concede",
      "Manage time: discovery, solution, objections, close",
      "Close with a crisp recap and agreed next action"
    ],
    links: [
      "https://www.blackboxthinking.com/never-split-the-difference-chris-voss",
      "https://www.cruciallearning.com/books/crucial-conversations/",
      "https://hbr.org/2016/06/the-elements-of-good-judgment"
    ]
  }
};

// Role templates for interview types
const ROLE_TEMPLATES: Record<string, string[]> = {
  software_engineer: ["Technical", "System Design", "Behavioral"],
  product_manager: ["Product Sense", "Behavioral", "Case Study"],
  designer: ["Portfolio Review", "Design Exercise", "Behavioral"],
  data_scientist: ["Technical", "Statistics", "Behavioral"],
  sales: ["Sales Pitch", "Role Play", "Behavioral"],
  electrical_engineer: ["Technical", "Design Review", "Behavioral"],
  mechanical_engineer: ["Technical", "Design Review", "Behavioral"],
  civil_engineer: ["Technical", "Project Review", "Behavioral"],
  chemical_engineer: ["Technical", "Process Review", "Behavioral"],
  aerospace_engineer: ["Technical", "Design Review", "Behavioral"],
  biomedical_engineer: ["Technical", "Design Review", "Behavioral"],
  industrial_engineer: ["Technical", "Process Review", "Behavioral"],
  environmental_engineer: ["Technical", "Project Review", "Behavioral"],
};

const needsFollowUp = (app: JobApplication, days: number = 14): boolean => {
  if (app.status === 'rejected' || app.status === 'accepted') {
    return false;
  }
  
  const lastUpdate = app.lastFollowUp || app.dateApplied;
  const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceUpdate >= days;
};


const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  accepted: "Accepted",
};

// Define the order of statuses
const STATUS_ORDER: Array<keyof typeof STATUS_LABELS> = ["applied", "interviewing", "offer", "rejected", "accepted"];

// Calendar export functions
const generateGoogleCalendarUrl = (interview: Interview, company: string, role: string) => {
  const title = encodeURIComponent(`Interview: ${role} at ${company}`);
  const details = encodeURIComponent(`Interview Type: ${interview.type}\nNotes: ${interview.notes}`);
  
  // Combine date and time
  const dateTime = interview.time 
    ? new Date(`${interview.date}T${interview.time}`)
    : new Date(interview.date);
  
  const start = dateTime.toISOString().replace(/-|:|\.\d+/g, '');
  const end = new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
};

const generateOutlookCalendarUrl = (interview: Interview, company: string, role: string) => {
  const title = encodeURIComponent(`Interview: ${role} at ${company}`);
  const details = encodeURIComponent(`Interview Type: ${interview.type}\nNotes: ${interview.notes}`);
  
  // Combine date and time
  const dateTime = interview.time 
    ? new Date(`${interview.date}T${interview.time}`)
    : new Date(interview.date);
  
  const start = dateTime.toISOString();
  const end = new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString();
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${details}`;
};

const generateAppleCalendarUrl = (interview: Interview, company: string, role: string) => {
  const title = `Interview: ${role} at ${company}`;
  const details = `Interview Type: ${interview.type}\nNotes: ${interview.notes}`;
  
  // Combine date and time
  const dateTime = interview.time 
    ? new Date(`${interview.date}T${interview.time}`)
    : new Date(interview.date);
  
  const start = dateTime.toISOString().replace(/-|:|\.\d+/g, '');
  const end = new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
  
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${interview.id}@jobtracker`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
  
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
};

export default function JobApplicationTracker() {
  // State
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [newApplication, setNewApplication] = useState<Omit<JobApplication, "id">>({
    company: "",
    role: "",
    status: "applied",
    dateApplied: new Date().toISOString().split("T")[0],
    jobUrl: "",
    notes: "",
    interviews: [],
    offerDetails: {
      salary: "",
      equity: "",
      bonus: "",
      location: "",
      startDate: "",
      deadline: "",
    },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [hoveredApplication, setHoveredApplication] = useState<JobApplication | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);



  // Load data from localStorage on mount
  useEffect(() => {
    const savedApplications = localStorage.getItem("jobApplications");
    const savedCompanies = localStorage.getItem("companies");
    
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    }
    
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("jobApplications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("companies", JSON.stringify(companies));
  }, [companies]);

  // Handle paste event for URL detection
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    
    // Common job posting URL patterns
    const linkedInPattern = /linkedin\.com\/jobs\/view\/([^-\s]+)-(\d+)/;
    const indeedPattern = /indeed\.com\/.*jobtitle=([^&]+).*company=([^&]+)/;
    const glassdoorPattern = /glassdoor\.com\/.*jobListing.*jobTitle=([^&]+).*employer=([^&]+)/;
    
    let company = "";
    let role = "";
    
    if (linkedInPattern.test(pastedText)) {
      const match = pastedText.match(linkedInPattern);
      if (match) {
        role = match[1].replace(/-/g, " ");
        // Company would need to be extracted differently for LinkedIn
      }
    } else if (indeedPattern.test(pastedText)) {
      const match = pastedText.match(indeedPattern);
      if (match) {
        role = decodeURIComponent(match[1]);
        company = decodeURIComponent(match[2]);
      }
    } else if (glassdoorPattern.test(pastedText)) {
      const match = pastedText.match(glassdoorPattern);
      if (match) {
        role = decodeURIComponent(match[1]);
        company = decodeURIComponent(match[2]);
      }
    }
    
    if (company || role) {
      setNewApplication(prev => ({
        ...prev,
        company: company || prev.company,
        role: role || prev.role,
        jobUrl: pastedText
      }));
    }
  };

  const openApplicationOverlay = (app: JobApplication) => {
  setSelectedApplication(app);
};

const closeApplicationOverlay = () => {
  setSelectedApplication(null);
};

const handleMouseEnter = (app: JobApplication) => {
  const timeout = setTimeout(() => {
    setHoveredApplication(app);
  }, 500);
  setHoverTimeout(timeout);
};

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
  setHoverTimeout(null);
  setHoveredApplication(null);
};

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("offerDetails.")) {
      const field = name.split(".")[1] as keyof OfferDetails;
      setNewApplication(prev => ({
        ...prev,
        offerDetails: {
          ...prev.offerDetails,
          [field]: value
        }
      }));
    } else {
      setNewApplication(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle role selection for templates
  const handleRoleSelect = (value: string) => {
  setSelectedRole(value);
  if (ROLE_TEMPLATES[value]) {
    setNewApplication(prev => ({
      ...prev,
      interviews: ROLE_TEMPLATES[value].map((type, index) => ({
        id: `interview-${index}`,
        type,
        date: "",
        time: "", // ADD THIS LINE
        notes: ""
      }))
    }));
  }
};

  // Add new application
  const addApplication = () => {
    const application: JobApplication = {
      ...newApplication,
      id: Date.now().toString()
    };
    
    setApplications([...applications, application]);
    
    // Add company to autocomplete list if not exists
    if (newApplication.company && !companies.includes(newApplication.company)) {
      setCompanies([...companies, newApplication.company]);
    }
    
    // Reset form
    setNewApplication({
      company: "",
      role: "",
      status: "applied",
      dateApplied: new Date().toISOString().split("T")[0],
      jobUrl: "",
      notes: "",
      interviews: [], 
      offerDetails: {
        salary: "",
        equity: "",
        bonus: "",
        location: "",
        startDate: "",
        deadline: "",
      },
    });
    setSelectedRole("");
    setIsFormExpanded(false);
  };

  // Update application
  const updateApplication = () => {
    if (!editingId) return;
    
    setApplications(applications.map(app => 
      app.id === editingId ? { ...newApplication, id: editingId } as JobApplication : app
    ));
    
    // Add company to autocomplete list if not exists
    if (newApplication.company && !companies.includes(newApplication.company)) {
      setCompanies([...companies, newApplication.company]);
    }
    
    setEditingId(null);
    setNewApplication({
      company: "",
      role: "",
      status: "applied",
      dateApplied: new Date().toISOString().split("T")[0],
      jobUrl: "",
      notes: "",
      interviews: [],
      offerDetails: {
        salary: "",
        equity: "",
        bonus: "",
        location: "",
        startDate: "",
        deadline: "",
      },
    });
    setSelectedRole("");
    setIsFormExpanded(false);
  };

  // Delete application
  const deleteApplication = (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
    setExpandedCards(prev => {
      const newExpanded = { ...prev };
      delete newExpanded[id];
      return newExpanded;
    });
  };

  const handleFollowUp = (app: JobApplication) => {
  const subject = encodeURIComponent(`Following up on ${app.role} application`);
  const body = encodeURIComponent(`Hi,

I wanted to follow up on my application for the ${app.role} position that I submitted on ${new Date(app.dateApplied).toLocaleDateString()}. 

I'm very interested in this opportunity and would love to discuss how my skills and experience align with your team's needs.

Thank you for your time and consideration.

Best regards,
[Your Name]`);
  
  // Open Outlook with pre-filled email
  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  
  // Mark as followed up
  setApplications(applications.map(application => 
    application.id === app.id ? { ...application, lastFollowUp: new Date().toISOString().split("T")[0] } : application
  ));
};

  // Start editing
  const startEditing = (app: JobApplication) => {
    setNewApplication({
      company: app.company,
      role: app.role,
      status: app.status,
      dateApplied: app.dateApplied,
      jobUrl: app.jobUrl,
      notes: app.notes,
      interviews: [...app.interviews],
      offerDetails: app.offerDetails,
    });
    setEditingId(app.id);
    setIsFormExpanded(true);
    
    // Find role template if exists
    const templateKey = Object.keys(ROLE_TEMPLATES).find(key => 
      ROLE_TEMPLATES[key].join(",") === app.interviews.map(i => i.type).join(",")
    );
    setSelectedRole(templateKey || "");
  };

  // Add interview
  const addInterview = () => {
  setNewApplication(prev => ({
    ...prev,
    interviews: [
      ...prev.interviews,
      {
        id: `interview-${Date.now()}`,
        type: "",
        date: "",
        time: "", // ADD THIS LINE
        notes: ""
      }
    ]
  }));
};

  // Update interview
  const updateInterview = (id: string, field: keyof Interview, value: string) => {
    setNewApplication(prev => {
      const updatedInterviews = prev.interviews.map(interview => 
        interview.id === id ? { ...interview, [field]: value } : interview
      );
      return {
        ...prev,
        interviews: updatedInterviews
      };
    });
  };

  // Delete interview
  const deleteInterview = (id: string) => {
    setNewApplication(prev => ({
      ...prev,
      interviews: prev.interviews.filter(interview => interview.id !== id)
    }));
  };

  // Toggle card expansion
  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group applications by status
  const groupedApplications = applications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = [];
    }
    acc[app.status].push(app);
    return acc;
  }, {} as Record<string, JobApplication[]>);

  // Calculate statistics
  const totalApplications = applications.length;
  const interviewingCount = groupedApplications.interviewing?.length || 0;
  const rejectedCount = groupedApplications.rejected?.length || 0;
  const followUpCount = applications.filter(app => needsFollowUp(app, 14)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">Job Application Tracker</h1>
          <p className="mt-2 text-gray-600">Organize your job search and track your applications</p>
        </header>

        {/* Stats Header */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Interviews</p>
                <p className="text-2xl font-bold">{interviewingCount}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Rejections</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Need Follow-up</p>
                <p className="text-2xl font-bold">{followUpCount}</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Application Form */}
        <Card className="mb-8">
          <CardHeader 
            className="cursor-pointer" 
            onClick={() => !editingId && setIsFormExpanded(!isFormExpanded)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit className="h-5 w-5" />
                    Edit Application
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Add New Application
                  </>
                )}
              </div>
              {!editingId && (
                <Button variant="ghost" size="icon">
                  {isFormExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          
          {(isFormExpanded || editingId) && (
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      name="company"
                      value={newApplication.company}
                      onChange={handleInputChange}
                      onPaste={handlePaste}
                      list="companies"
                      placeholder="Enter company name"
                      ref={companyInputRef}
                      required
                    />
                    <datalist id="companies">
                      {companies.map((company, index) => (
                        <option key={index} value={company} />
                      ))}
                    </datalist>
                    <p className="mt-1 text-sm text-gray-500">
                      Paste a job URL to auto-fill company and role
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      name="role"
                      value={newApplication.role}
                      onChange={handleInputChange}
                      placeholder="Enter job role"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      name="status"
                      value={newApplication.status}
                      onValueChange={(value) => 
                        setNewApplication(prev => ({ ...prev, status: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateApplied">Date Applied</Label>
                    <Input
                      id="dateApplied"
                      name="dateApplied"
                      type="date"
                      value={newApplication.dateApplied}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobUrl">Job URL</Label>
                    <Input
                      id="jobUrl"
                      name="jobUrl"
                      value={newApplication.jobUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roleTemplate">Role Template</Label>
                    <Select value={selectedRole} onValueChange={handleRoleSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role template" />
                      </SelectTrigger>
                     <SelectContent>
                      <SelectItem value="software_engineer">Software Engineer</SelectItem>
                      <SelectItem value="product_manager">Product Manager</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="data_scientist">Data Scientist</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="electrical_engineer">Electrical Engineer</SelectItem>
                      <SelectItem value="mechanical_engineer">Mechanical Engineer</SelectItem>
                      <SelectItem value="civil_engineer">Civil Engineer</SelectItem>
                      <SelectItem value="chemical_engineer">Chemical Engineer</SelectItem>
                      <SelectItem value="aerospace_engineer">Aerospace Engineer</SelectItem>
                      <SelectItem value="biomedical_engineer">Biomedical Engineer</SelectItem>
                      <SelectItem value="industrial_engineer">Industrial Engineer</SelectItem>
                      <SelectItem value="environmental_engineer">Environmental Engineer</SelectItem>
                    </SelectContent>
                    </Select>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a role to auto-populate interview types
                    </p>
                  </div>

                  <div>
                    <Label>Interviews</Label>
                    <div className="space-y-3">
                      {newApplication.interviews.map((interview, index) => (
                        <div key={interview.id} className="grid grid-cols-12 gap-2 items-center">
                          <Input
                            className="col-span-4"
                            placeholder="Interview type"
                            value={interview.type}
                            onChange={(e) => updateInterview(interview.id, "type", e.target.value)}
                          />
                          <Input
                            className="col-span-3"
                            type="date"
                            value={interview.date}
                            onChange={(e) => updateInterview(interview.id, "date", e.target.value)}
                          />
                          <Input
                            className="col-span-3"
                            type="time"
                            value={interview.time}
                            onChange={(e) => updateInterview(interview.id, "time", e.target.value)}
                            placeholder="HH:MM"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="col-span-2"
                            onClick={() => deleteInterview(interview.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addInterview}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Interview
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={newApplication.notes}
                      onChange={handleInputChange}
                      placeholder="Additional notes about this application..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Offer Details Section */}
              <div className="mt-6 rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 text-lg font-medium">Offer Details</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      name="offerDetails.salary"
                      value={newApplication.offerDetails.salary}
                      onChange={handleInputChange}
                      placeholder="$0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="equity">Equity</Label>
                    <Input
                      id="equity"
                      name="offerDetails.equity"
                      value={newApplication.offerDetails.equity}
                      onChange={handleInputChange}
                      placeholder="0%"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bonus">Bonus</Label>
                    <Input
                      id="bonus"
                      name="offerDetails.bonus"
                      value={newApplication.offerDetails.bonus}
                      onChange={handleInputChange}
                      placeholder="$0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="offerDetails.location"
                      value={newApplication.offerDetails.location}
                      onChange={handleInputChange}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="offerDetails.startDate"
                      type="date"
                      value={newApplication.offerDetails.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="offerDetails.deadline"
                      type="date"
                      value={newApplication.offerDetails.deadline}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setNewApplication({
                        company: "",
                        role: "",
                        status: "applied",
                        dateApplied: new Date().toISOString().split("T")[0],
                        jobUrl: "",
                        notes: "",
                        interviews: [],
                        offerDetails: {
                          salary: "",
                          equity: "",
                          bonus: "",
                          location: "",
                          startDate: "",
                          deadline: "",
                        },
                      });
                      setSelectedRole("");
                      setIsFormExpanded(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button onClick={editingId ? updateApplication : addApplication}>
                  {editingId ? "Update Application" : "Add Application"}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {applications.filter(app => needsFollowUp(app, 14)).length > 0 && (
  <Card className="mb-8 border-orange-200 bg-orange-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-orange-800">
        <Bell className="h-5 w-5" />
        Follow-up Queue ({applications.filter(app => needsFollowUp(app, 14)).length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {applications
          .filter(app => needsFollowUp(app, 14))
          .map(app => {
            const lastUpdate = app.lastFollowUp || app.dateApplied;
            const daysSince = Math.floor((new Date().getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={app.id} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                <div>
                  <div className="font-medium">{app.role} at {app.company}</div>
                  <div className="text-sm text-gray-600">
                    {daysSince} days since {app.lastFollowUp ? 'last follow-up' : 'application'}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleFollowUp(app)}  // Change this line
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Follow-up
                </Button>
              </div>
            );
          })}
      </div>
    </CardContent>
  </Card>
)}

        {/* Applications List */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-800">My Applications</h2>
          
          {applications.length === 0 ? (
            <Card className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-gray-500">Add your first job application to get started</p>
            </Card>
          ) : (
             <KanbanBoard
                applications={applications}
                onEdit={(app) => startEditing(app)}
                onDelete={(id) => deleteApplication(id)}
                onStatusChange={(id, newStatus) => {
                  setApplications(prev =>
                    prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
                  );
                }}
                onOpen={(app) => openApplicationOverlay(app)}
                onHoverEnter={(app) => handleMouseEnter(app)}
                onHoverLeave={() => handleMouseLeave()}
              />
            )}

           {/* Hover Preview Tooltip */}
              {hoveredApplication && (
                <div className="fixed inset-0 pointer-events-none z-40">
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl border p-4 max-w-sm">
                    <div className="font-medium">{hoveredApplication.role}</div>
                    <div className="text-sm text-gray-600">{hoveredApplication.company}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {hoveredApplication.interviews.length} interviews • Applied {new Date(hoveredApplication.dateApplied).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
          
           {/* Full Application Overlay */}
            {selectedApplication && (
              <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedApplication.role}</h2>
                      <p className="text-gray-600">{selectedApplication.company}</p>
                    </div>
                    <Button variant="ghost" onClick={closeApplicationOverlay}>
                      ×
                    </Button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* Basic application info */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        Applied: {new Date(selectedApplication.dateApplied).toLocaleDateString()}
                      </div>

                      {/* Job URL */}
                      {selectedApplication.jobUrl && (
                        <div>
                          <h4 className="text-sm font-medium">Job URL</h4>
                          <a 
                            href={selectedApplication.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all block"
                            title={selectedApplication.jobUrl}
                          >
                            {selectedApplication.jobUrl}
                          </a>
                        </div>
                      )}
                      
                      {/* Interviews */}
                      {selectedApplication.interviews.length > 0 && (
                        <div>
                          <h4 className="mb-2 flex items-center text-sm font-medium">
                            <Users className="mr-2 h-4 w-4" />
                            Interviews
                          </h4>
                          <div className="space-y-3">
                            {selectedApplication.interviews.map((interview) => (
                              <div key={interview.id} className="rounded border border-gray-200 p-3 overflow-hidden">
                                {/* Interview Type */}
                                <div className="font-medium text-gray-900 mb-2">
                                  {interview.type}
                                </div>
                                
                                {/* Date and Time */}
                                {interview.date && (
                                  <div className="flex items-center text-gray-500 text-sm mb-2">
                                    <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                                    <span>
                                      {new Date(interview.date).toLocaleDateString()}
                                      {interview.time && (
                                        <span className="ml-2">
                                          at {new Date(`2000-01-01T${interview.time}`).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}

                                {/* Prep Checklist Section */}
                                {INTERVIEW_PREP[interview.type] && (
                                  <div className="mt-3 mb-3 rounded bg-blue-50 p-3">
                                    <div className="flex items-center mb-2">
                                      <CheckCircle2 className="mr-1 h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-blue-800 text-sm">Prep Checklist</span>
                                    </div>
                                    <ul className="space-y-1 text-sm text-blue-700">
                                      {INTERVIEW_PREP[interview.type].checklist.map((item, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <span className="mr-2 text-blue-400">•</span>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                    {INTERVIEW_PREP[interview.type].links && (
                                      <div className="mt-2 pt-2 border-t border-blue-200">
                                        <div className="text-xs text-blue-600 mb-1">Helpful Resources:</div>
                                        {INTERVIEW_PREP[interview.type].links?.map((link, idx) => (
                                          <a
                                            key={idx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-xs text-blue-600 hover:text-blue-800 underline mb-1"
                                          >
                                            {link}
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Notes */}
                                {interview.notes && (
                                  <div className="mt-2 text-sm text-gray-600 break-words">{interview.notes}</div>
                                )}
                                
                                {/* Calendar Links */}
                                          {interview.date && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                              <a
                                                href={generateGoogleCalendarUrl(interview, selectedApplication.company, selectedApplication.role)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                              >
                                                <Calendar className="mr-1 h-3 w-3" />
                                                Google
                                              </a>
                                              <a
                                                href={generateOutlookCalendarUrl(interview, selectedApplication.company, selectedApplication.role)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded bg-[#0072c6] px-2 py-1 text-xs text-white hover:bg-[#005a9e]"
                                              >
                                                <Calendar className="mr-1 h-3 w-3" />
                                                Outlook
                                              </a>
                                              <a
                                                href={generateAppleCalendarUrl(interview, selectedApplication.company, selectedApplication.role)}
                                                download={`interview-${interview.id}.ics`}
                                                className="inline-flex items-center rounded bg-black px-2 py-1 text-xs text-white hover:bg-gray-800"
                                              >
                                                <Calendar className="mr-1 h-3 w-3" />
                                                Apple
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                      
                      {/* Offer Details */}
                      {(selectedApplication.offerDetails.salary || selectedApplication.offerDetails.equity || selectedApplication.offerDetails.bonus) && (
                        <div className="rounded bg-green-50 p-3">
                          <h4 className="mb-1 text-sm font-medium text-green-800">Offer Details</h4>
                          <div className="text-sm text-green-700">
                            {selectedApplication.offerDetails.salary && <div>Salary: {selectedApplication.offerDetails.salary}</div>}
                            {selectedApplication.offerDetails.equity && <div>Equity: {selectedApplication.offerDetails.equity}</div>}
                            {selectedApplication.offerDetails.bonus && <div>Bonus: {selectedApplication.offerDetails.bonus}</div>}
                            {selectedApplication.offerDetails.location && <div>Location: {selectedApplication.offerDetails.location}</div>}
                            {selectedApplication.offerDetails.startDate && <div>Start Date: {new Date(selectedApplication.offerDetails.startDate).toLocaleDateString()}</div>}
                            {selectedApplication.offerDetails.deadline && <div>Deadline: {new Date(selectedApplication.offerDetails.deadline).toLocaleDateString()}</div>}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {selectedApplication.notes && (
                        <div>
                          <h4 className="text-sm font-medium">Notes</h4>
                          <p className="text-sm text-gray-600">{selectedApplication.notes}</p>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}