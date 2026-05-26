import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";

// ─── Submission shape & status type ──────────────────────────────────────────
// Status `Draft` was added so auto-created submissions that didn't pass intake
// validation can land here for human review without blocking the queue.
export type StatusType =
  | "In Review"
  | "Quoted"
  | "Bound"
  | "Declined"
  | "Pending Info"
  | "New"
  | "Draft";

export type SubmissionKindCol = "Individual" | "Group";

export interface Submission {
  id: string;
  subId: string;
  member: string;
  memberNumber: string;
  broker: string;
  state: string;
  status: StatusType;
  submissionType: "New Business" | "Cross-Sell";
  kind: SubmissionKindCol;
  memberCount?: number;
  products: string[];
  assignedTo: string;
  team: string;
  submitted: string;
  needByDate: string;
  effective: string;
  expiry: string;
  estimatedPremium: number;
  enrollmentCount: number;
  appetiteScore: number;
  priority: "High" | "Medium" | "Low";
  daysInQueue: number;
  lastActivity: string;
  // Draft-mode metadata. When a submission is auto-created from the Inbox but
  // didn't pass intake validation, these hold the source email + the list of
  // validation issues that landed it in the Draft pile.
  draftReason?: string;
  draftIssues?: string[];
  sourceEmailId?: string;
}

// ─── Seed data ──────────────────────────────────────────────────────────────
const SEED: Submission[] = [
  { id:"1",  subId:"SUB-7829", member:"Riverside Unified School District",  memberNumber:"1184", broker:"Gallagher Education, Inc.",   state:"CA", status:"In Review",   submissionType:"New Business", kind:"Individual",                  products:["EPL","ELL","GL","Cyber"],       assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-15", needByDate:"2024-05-15", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:102400, enrollmentCount:14200, appetiteScore:92, priority:"High",   daysInQueue:18, lastActivity:"2 hours ago"   },
  { id:"2",  subId:"SUB-7830", member:"San Diego City Unified SD",          memberNumber:"1207", broker:"Lockton Companies",           state:"CA", status:"Quoted",       submissionType:"Cross-Sell",   kind:"Group",      memberCount:14,  products:["EPL","GL","ML","Property"],     assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-03-12", needByDate:"2024-05-10", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:148200, enrollmentCount:22400, appetiteScore:88, priority:"High",   daysInQueue:21, lastActivity:"1 day ago"     },
  { id:"3",  subId:"SUB-7831", member:"Central Texas Schools Consortium",   memberNumber:"1318", broker:"Marsh McLennan Education",    state:"TX", status:"In Review",   submissionType:"New Business", kind:"Group",      memberCount:7,   products:["EPL","ELL","GL","Auto"],        assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-08", needByDate:"2024-06-05", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:87600,  enrollmentCount:11800, appetiteScore:79, priority:"Medium", daysInQueue:25, lastActivity:"3 days ago"    },
  { id:"4",  subId:"SUB-7832", member:"Denver Public Schools",              memberNumber:"1042", broker:"Willis Towers Watson",        state:"CO", status:"Bound",        submissionType:"Cross-Sell",   kind:"Individual",                  products:["EPL","ELL","GL","Cyber","SA"],  assignedTo:"Patricia Hoffman", team:"Team Beta",  submitted:"2024-02-28", needByDate:"2024-05-01", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:134500, enrollmentCount:18600, appetiteScore:95, priority:"Low",    daysInQueue:0,  lastActivity:"5 days ago"    },
  { id:"5",  subId:"SUB-7833", member:"Seattle Public Schools",             memberNumber:"1129", broker:"Alliant Insurance Services",  state:"WA", status:"Pending Info", submissionType:"New Business", kind:"Individual",                  products:["EPL","ML","Cyber"],             assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-03-10", needByDate:"2024-06-20", effective:"2024-09-01", expiry:"2025-09-01", estimatedPremium:64800,  enrollmentCount:8200,  appetiteScore:71, priority:"Medium", daysInQueue:23, lastActivity:"Today"         },
  { id:"6",  subId:"SUB-7834", member:"Houston ISD",                        memberNumber:"0986", broker:"Arthur J. Gallagher & Co.",   state:"TX", status:"New",          submissionType:"New Business", kind:"Individual",                  products:["EPL","ELL","GL"],               assignedTo:"Unassigned",       team:"Team Beta",  submitted:"2024-03-18", needByDate:"2024-06-10", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:92100,  enrollmentCount:13500, appetiteScore:84, priority:"High",   daysInQueue:5,  lastActivity:"Today"         },
  { id:"7",  subId:"SUB-7835", member:"Minneapolis Public Schools",         memberNumber:"1156", broker:"Gallagher Education, Inc.",   state:"MN", status:"In Review",   submissionType:"Cross-Sell",   kind:"Individual",                  products:["EPL","GL","Crime"],             assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-05", needByDate:"2024-05-12", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:54200,  enrollmentCount:7100,  appetiteScore:81, priority:"Medium", daysInQueue:28, lastActivity:"6 hours ago"   },
  { id:"8",  subId:"SUB-7836", member:"Brookfield Day School",              memberNumber:"0473", broker:"Lockton Companies",           state:"NC", status:"Quoted",       submissionType:"New Business", kind:"Individual",                  products:["EPL","ELL","GL","ML","Property"],   assignedTo:"Patricia Hoffman", team:"Team Beta",  submitted:"2024-03-01", needByDate:"2024-06-01", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:178900, enrollmentCount:28400, appetiteScore:91, priority:"High",   daysInQueue:32, lastActivity:"2 days ago"    },
  { id:"9",  subId:"SUB-7837", member:"Clark County School District",       memberNumber:"1273", broker:"Marsh McLennan Education",    state:"NV", status:"Declined",     submissionType:"New Business", kind:"Individual",                  products:["EPL","GL"],                     assignedTo:"Robert Chen",      team:"Team Beta",  submitted:"2024-02-20", needByDate:"2024-04-30", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:0,      enrollmentCount:6400,  appetiteScore:38, priority:"Low",    daysInQueue:0,  lastActivity:"2 weeks ago"   },
  { id:"10", subId:"SUB-7838", member:"Broward County Public Schools",      memberNumber:"1098", broker:"Willis Towers Watson",        state:"FL", status:"Bound",        submissionType:"Cross-Sell",   kind:"Individual",                  products:["EPL","ELL","GL","Auto","SA"],   assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-02-15", needByDate:"2024-04-15", effective:"2024-06-01", expiry:"2025-06-01", estimatedPremium:221300, enrollmentCount:31200, appetiteScore:89, priority:"Low",    daysInQueue:0,  lastActivity:"3 days ago"    },
  { id:"11", subId:"SUB-7839", member:"Fairfax County Public Schools",      memberNumber:"1241", broker:"Alliant Insurance Services",  state:"VA", status:"In Review",   submissionType:"New Business", kind:"Individual",                  products:["EPL","ELL","ML","Cyber"],       assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-14", needByDate:"2024-06-25", effective:"2024-09-01", expiry:"2025-09-01", estimatedPremium:96700,  enrollmentCount:12900, appetiteScore:87, priority:"High",   daysInQueue:19, lastActivity:"Yesterday"     },
  { id:"12", subId:"SUB-7840", member:"Wake County Public School System",   memberNumber:"1304", broker:"Arthur J. Gallagher & Co.",   state:"NC", status:"New",          submissionType:"New Business", kind:"Individual",                  products:["EPL","GL","Cyber"],             assignedTo:"Unassigned",       team:"Team Beta",  submitted:"2024-03-19", needByDate:"2024-06-08", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:72400,  enrollmentCount:9800,  appetiteScore:83, priority:"Medium", daysInQueue:4,  lastActivity:"Today"         },
  { id:"13", subId:"SUB-7841", member:"Mountain West Charter Network",      memberNumber:"1382", broker:"Gallagher Education, Inc.",   state:"GA", status:"Quoted",       submissionType:"Cross-Sell",   kind:"Group",      memberCount:11,  products:["EPL","ELL","GL","ML"],          assignedTo:"Patricia Hoffman", team:"Team Beta",  submitted:"2024-03-03", needByDate:"2024-05-20", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:112800, enrollmentCount:15600, appetiteScore:90, priority:"Medium", daysInQueue:30, lastActivity:"4 days ago"    },
  { id:"14", subId:"SUB-7842", member:"Montgomery County Public Schools",   memberNumber:"1219", broker:"Lockton Companies",           state:"MD", status:"Pending Info", submissionType:"New Business", kind:"Individual",                  products:["EPL","ELL","ML","Crime"],       assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-11", needByDate:"2024-06-30", effective:"2024-09-01", expiry:"2025-09-01", estimatedPremium:88300,  enrollmentCount:11200, appetiteScore:76, priority:"Medium", daysInQueue:22, lastActivity:"Today"         },
  { id:"15", subId:"SUB-7843", member:"Palm Beach County School District",  memberNumber:"1167", broker:"Marsh McLennan Education",    state:"FL", status:"In Review",   submissionType:"Cross-Sell",   kind:"Individual",                  products:["EPL","GL","SA"],                assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-03-09", needByDate:"2024-06-02", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:58900,  enrollmentCount:7600,  appetiteScore:82, priority:"Low",    daysInQueue:24, lastActivity:"Yesterday"     },
  { id:"16", subId:"SUB-7844", member:"Jefferson County Public Schools",    memberNumber:"1051", broker:"Willis Towers Watson",        state:"KY", status:"New",          submissionType:"New Business", kind:"Individual",                  products:["EPL","ELL","GL"],               assignedTo:"Unassigned",       team:"Team Beta",  submitted:"2024-03-20", needByDate:"2024-05-25", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:67200,  enrollmentCount:9100,  appetiteScore:80, priority:"Low",    daysInQueue:3,  lastActivity:"Today"         },
  { id:"17", subId:"SUB-7845", member:"Pacific Coast Higher-Ed Pool",       memberNumber:"1411", broker:"Alliant Insurance Services",  state:"FL", status:"Bound",        submissionType:"Cross-Sell",   kind:"Group",      memberCount:6,   products:["EPL","ELL","GL","Auto","Cyber"], assignedTo:"Robert Chen",      team:"Team Beta",  submitted:"2024-02-10", needByDate:"2024-04-10", effective:"2024-06-01", expiry:"2025-06-01", estimatedPremium:196400, enrollmentCount:26800, appetiteScore:94, priority:"Low",    daysInQueue:0,  lastActivity:"1 week ago"    },
  { id:"18", subId:"SUB-7846", member:"Orange County Public Schools",       memberNumber:"1029", broker:"Arthur J. Gallagher & Co.",   state:"FL", status:"Declined",     submissionType:"New Business", kind:"Individual",                  products:["EPL","ML"],                     assignedTo:"Robert Chen",      team:"Team Beta",  submitted:"2024-02-25", needByDate:"2024-04-20", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:0,      enrollmentCount:5200,  appetiteScore:42, priority:"Low",    daysInQueue:0,  lastActivity:"3 weeks ago"   },
];

// ─── Context shape ───────────────────────────────────────────────────────────
interface SubmissionsListValue {
  submissions: Submission[];
  /** Add a submission. Returns the persisted record (with assigned id / subId). */
  addSubmission: (partial: Partial<Submission> & { member: string }) => Submission;
}

const SubmissionsListContext = createContext<SubmissionsListValue | null>(null);

// Pick the next numeric id and SUB-#### ticker from the live list — keeps new
// records unique even if the seed list grew or shrank.
function nextIds(list: Submission[]): { id: string; subId: string } {
  const nextIdNum = (list.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0)) + 1;
  const lastSubNum = list.reduce((max, s) => {
    const m = /SUB-(\d+)/.exec(s.subId);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);
  return { id: String(nextIdNum), subId: `SUB-${lastSubNum + 1}` };
}

export function SubmissionsListProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>(SEED);

  const addSubmission = useCallback<SubmissionsListValue["addSubmission"]>((partial) => {
    let created: Submission | null = null;
    setSubmissions(prev => {
      const { id, subId } = nextIds(prev);
      const today = new Date().toISOString().split("T")[0];
      const record: Submission = {
        id,
        subId,
        member: partial.member,
        memberNumber: partial.memberNumber ?? String(2000 + prev.length).padStart(4, "0"),
        broker: partial.broker ?? "Unassigned",
        state: partial.state ?? "—",
        status: partial.status ?? "New",
        submissionType: partial.submissionType ?? "New Business",
        kind: partial.kind ?? "Individual",
        memberCount: partial.memberCount,
        products: partial.products ?? [],
        assignedTo: partial.assignedTo ?? "Unassigned",
        team: partial.team ?? "Team Alpha",
        submitted: partial.submitted ?? today,
        needByDate: partial.needByDate ?? "",
        effective: partial.effective ?? "",
        expiry: partial.expiry ?? "",
        estimatedPremium: partial.estimatedPremium ?? 0,
        enrollmentCount: partial.enrollmentCount ?? 0,
        appetiteScore: partial.appetiteScore ?? 0,
        priority: partial.priority ?? "Medium",
        daysInQueue: partial.daysInQueue ?? 0,
        lastActivity: partial.lastActivity ?? "Just now",
        draftReason: partial.draftReason,
        draftIssues: partial.draftIssues,
        sourceEmailId: partial.sourceEmailId,
      };
      created = record;
      return [record, ...prev];
    });
    return created!;
  }, []);

  const value = useMemo<SubmissionsListValue>(
    () => ({ submissions, addSubmission }),
    [submissions, addSubmission]
  );

  return (
    <SubmissionsListContext.Provider value={value}>
      {children}
    </SubmissionsListContext.Provider>
  );
}

export function useSubmissionsList(): SubmissionsListValue {
  const ctx = useContext(SubmissionsListContext);
  if (!ctx) {
    throw new Error("useSubmissionsList must be used within SubmissionsListProvider");
  }
  return ctx;
}
