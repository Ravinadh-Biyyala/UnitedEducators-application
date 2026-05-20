export const allSubmissions = [
  { id: "SUB-10428", name: "Riverside Unified School District", premium: "$412,000", status: "Ready to Quote", segment: "K-12", date: "Oct 24", broker: "Gallagher", urgency: "High" },
  { id: "SUB-10429", name: "Westfield Community College", premium: "$850,000", status: "Underwriting", segment: "Higher Ed", date: "Oct 23", broker: "Aon", urgency: "Medium" },
  { id: "SUB-10430", name: "Lincoln High School", premium: "$112,000", status: "Triage", segment: "K-12", date: "Oct 23", broker: "Marsh", urgency: "Low" },
  { id: "SUB-10431", name: "Georgetown University", premium: "$1,200,000", status: "Pending Info", segment: "Higher Ed", date: "Oct 22", broker: "Willis Towers Watson", urgency: "Medium" },
  { id: "SUB-10432", name: "Brookfield Day School", premium: "$85,000", status: "Declined", segment: "K-12", date: "Oct 21", broker: "Gallagher", urgency: "Low" },
  { id: "SUB-10433", name: "University of Maryland", premium: "$2,100,000", status: "Bound", segment: "Higher Ed", date: "Oct 20", broker: "Aon", urgency: "Medium" },
];

export const activeSubmissions = allSubmissions.slice(0, 3);

export const copeData = [
  { label: "Construction", value: "Masonry Non-Combustible (MNC)", status: "good" },
  { label: "Occupancy", value: "Educational - K-12", status: "good" },
  { label: "Protection", value: "Fully Sprinklered (95%)", status: "good" },
  { label: "Exposure", value: "Adjacent to industrial park (East campus)", status: "warn" },
];

export const surveyFlags = [
  { question: "Any litigation pending or threatened?", answer: "Yes — 1 ELL claim CLM-2021-027 pending mediation", flag: true },
  { question: "Material changes to operations since last policy?", answer: "No material changes. New gymnasium added at Lincoln HS.", flag: false },
  { question: "Have you implemented active shooter protocols?", answer: "Yes — drills conducted bi-annually at all 34 campuses.", flag: false },
  { question: "Any known conditions that may give rise to a claim?", answer: "Aging HVAC at Jefferson Elem. — scheduled Q3 2024.", flag: true },
];

export const claims = [
  { year: "2023", type: "GL", amount: "$12,500", status: "Closed", desc: "Slip and fall on wet gym floor" },
  { year: "2022", type: "ELL", amount: "$145,000", status: "Open", desc: "Wrongful termination suit (pending mediation)" },
  { year: "2022", type: "Auto", amount: "$8,200", status: "Closed", desc: "Minor collision involving district van" },
  { year: "2021", type: "Property", amount: "$85,000", status: "Closed", desc: "Water damage from burst pipe at Central High" },
  { year: "2020", type: "GL", amount: "$4,100", status: "Closed", desc: "Playground injury" },
];

export const lineItems = [
  { cover: "General Liability", limit: "$5M / $10M", premium: "$145,200", change: "+4.2%" },
  { cover: "Educators Legal Liability", limit: "$5M / $5M", premium: "$182,500", change: "+12.5%" },
  { cover: "Property", limit: "$412.5M TIV", premium: "$215,000", change: "+8.1%" },
  { cover: "Auto", limit: "$1M CSL", premium: "$35,000", change: "Flat" },
];

export const inboxEmails = [
  { sender: "Michael Chang (Gallagher)", subject: "RE: Additional Info - Riverside Unified", preview: "Attached is the requested 5-year loss run update. Let me know if you need...", time: "10:42 AM", unread: true },
  { sender: "Sarah Jenkins (Aon)", subject: "New Submission: Georgetown University", preview: "Please find the application and supporting docs for the GU renewal...", time: "Yesterday", unread: false },
  { sender: "David Lee (Marsh)", subject: "Urgent: Quote Revision Request - Lincoln HS", preview: "The client is asking if we can look at the SIR options again. They want to see...", time: "Oct 24", unread: false },
];

export const notes = [
  { author: "Sarah Mitchell", role: "Senior Underwriter", date: "Oct 24, 2024", content: "Initial review complete. Account looks favorable — strong loss history and safety program. Main concern is policy complexity score (61/100)." },
  { author: "Patricia Hoffman", role: "UW Manager", date: "Oct 23, 2024", content: "Approved referral for TIV > $400M. The property values are concentrated in the new East Campus facility which is 100% sprinklered." }
];

export const tasks = [
  { id: 1, title: "Review Open Claims Detail from broker", sub: "SUB-10428", due: "Today", priority: "High", type: "Review" },
  { id: 2, title: "Verify background check policy docs", sub: "SUB-10429", due: "Tomorrow", priority: "High", type: "Compliance" },
  { id: 3, title: "Confirm earthquake zone rating", sub: "SUB-10430", due: "Oct 28", priority: "Medium", type: "Underwriting" },
  { id: 4, title: "Draft indicative quote", sub: "SUB-10431", due: "Oct 30", priority: "Low", type: "Quote" },
];

export const approvals = [
  { id: "AP-2241", title: "CGL limit increase from $1M/$3M → $2M/$5M", status: "Pending", approver: "Leo Tran" },
  { id: "AP-2237", title: "Sexual & Physical Abuse cover w/ $50K SIR", status: "Approved", approver: "Patricia Hoffman" },
];

export const auditEvents = [
  { time: "Today, 10:45 AM", user: "Sarah Mitchell", role: "Underwriter", action: "Status Changed", detail: "Submission status updated to Underwriting" },
  { time: "Today, 10:42 AM", user: "Michael Chang", role: "Broker", action: "Document Uploaded", detail: "Riverside_Loss_Runs_2024.pdf received via Email" },
  { time: "Yesterday, 4:30 PM", user: "System", role: "Automation", action: "Appetite Score Calculated", detail: "Appetite score computed at 87/100 based on 14 risk factors." },
  { time: "Yesterday, 4:28 PM", user: "System", role: "Automation", action: "Document AI Analysis", detail: "2024 Renewal Application parsed. TIV extracted: $412.5M" },
];

export const auditHistory = [
  { year: "2023", action: "Rate Cap Applied", detail: "Rate increase capped at 7% per account agreement.", premium: "$104,500" },
  { year: "2022", action: "SIR Increased", detail: "Per-occurrence SIR increased from $25,000 to $50,000 to improve loss ratio.", premium: "$97,600" },
  { year: "2021", action: "Liability Limit Decreased", detail: "GL per-occurrence limit reduced from $10M to $5M.", premium: "$93,400" },
];

export const portfolioMetrics = [
  { label: "Total Premium", value: "$42.5M", sub: "+5.2% YoY" },
  { label: "Loss Ratio", value: "48.2%", sub: "-2.1% YoY" },
  { label: "Active Policies", value: "342", sub: "+12 YoY" },
  { label: "Renewal Retention", value: "94%", sub: "Target: 90%" },
];