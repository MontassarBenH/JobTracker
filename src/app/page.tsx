"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Edit, Trash, Plus, ChevronDown, ChevronUp } from "lucide-react";

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
}

// Role templates for interview types
const ROLE_TEMPLATES: Record<string, string[]> = {
  software_engineer: ["Technical", "System Design", "Behavioral"],
  product_manager: ["Product Sense", "Behavioral", "Case Study"],
  designer: ["Portfolio Review", "Design Exercise", "Behavioral"],
  data_scientist: ["Technical", "Statistics", "Behavioral"],
  sales: ["Sales Pitch", "Role Play", "Behavioral"],
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">Job Application Tracker</h1>
          <p className="mt-2 text-gray-600">Organize your job search and track your applications</p>
        </header>

        {/* Stats Header */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {STATUS_ORDER.map((status) => {
                const apps = groupedApplications[status] || [];
                return (
                  <div key={status} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {STATUS_LABELS[status]} ({apps.length})
                      </h3>
                      <Badge className={STATUS_COLORS[status]}>
                        {apps.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {apps.map((app) => (
                        <Card key={app.id} className="flex flex-col">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{app.role}</CardTitle>
                                <p className="text-gray-600">{app.company}</p>
                              </div>
                              <Badge className={STATUS_COLORS[app.status]}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="mr-2 h-4 w-4" />
                              Applied: {new Date(app.dateApplied).toLocaleDateString()}
                            </div>
                            
                            {expandedCards[app.id] && (
                              <div className="mt-4 space-y-4">
                                {app.jobUrl && (
                                  <div>
                                    <h4 className="text-sm font-medium">Job URL</h4>
                                    <a 
                                      href={app.jobUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline"
                                    >
                                      {app.jobUrl}
                                    </a>
                                  </div>
                                )}
                                
                                {app.interviews.length > 0 && (
                                  <div>
                                    <h4 className="mb-2 flex items-center text-sm font-medium">
                                      <Users className="mr-2 h-4 w-4" />
                                      Interviews
                                    </h4>
                                    <div className="space-y-3">
                                      {app.interviews.map((interview) => (
                                        <div key={interview.id} className="rounded border border-gray-200 p-3 overflow-hidden">
                                          {/* Interview Type - Always on its own line */}
                                          <div className="font-medium text-gray-900 mb-2">
                                            {interview.type}
                                          </div>
                                          
                                          {/* Date and Time - On separate line */}
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
                                          
                                          {/* Notes */}
                                          {interview.notes && (
                                            <div className="mt-2 text-sm text-gray-600 break-words">{interview.notes}</div>
                                          )}
                                          
                                          {/* Calendar Links */}
                                          {interview.date && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                              <a
                                                href={generateGoogleCalendarUrl(interview, app.company, app.role)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                              >
                                                <Calendar className="mr-1 h-3 w-3" />
                                                Google
                                              </a>
                                              <a
                                                href={generateOutlookCalendarUrl(interview, app.company, app.role)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded bg-[#0072c6] px-2 py-1 text-xs text-white hover:bg-[#005a9e]"
                                              >
                                                <Calendar className="mr-1 h-3 w-3" />
                                                Outlook
                                              </a>
                                              <a
                                                href={generateAppleCalendarUrl(interview, app.company, app.role)}
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
                                
                                {(app.offerDetails.salary || app.offerDetails.equity || app.offerDetails.bonus) && (
                                  <div className="rounded bg-green-50 p-3">
                                    <h4 className="mb-1 text-sm font-medium text-green-800">Offer Details</h4>
                                    <div className="text-sm text-green-700">
                                      {app.offerDetails.salary && <div>Salary: {app.offerDetails.salary}</div>}
                                      {app.offerDetails.equity && <div>Equity: {app.offerDetails.equity}</div>}
                                      {app.offerDetails.bonus && <div>Bonus: {app.offerDetails.bonus}</div>}
                                      {app.offerDetails.location && <div>Location: {app.offerDetails.location}</div>}
                                      {app.offerDetails.startDate && <div>Start Date: {new Date(app.offerDetails.startDate).toLocaleDateString()}</div>}
                                      {app.offerDetails.deadline && <div>Deadline: {new Date(app.offerDetails.deadline).toLocaleDateString()}</div>}
                                    </div>
                                  </div>
                                )}
                                
                                {app.notes && (
                                  <div>
                                    <h4 className="text-sm font-medium">Notes</h4>
                                    <p className="text-sm text-gray-600">{app.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                          <div className="mt-auto border-t border-gray-100 p-2">
                            <div className="flex justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => toggleCardExpansion(app.id)}
                              >
                                {expandedCards[app.id] ? (
                                  <>
                                    <ChevronUp className="mr-1 h-4 w-4" />
                                    Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="mr-1 h-4 w-4" />
                                    Details
                                  </>
                                )}
                              </Button>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => startEditing(app)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
                                  onClick={() => deleteApplication(app.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}