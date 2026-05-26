import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { CorrespondenceThread, Channel } from "../components/tabs/CorrespondenceTab";
import type { Task } from "../components/tabs/TasksTab";

/* ──────────────────────────────────────────────────────────────────────────────
   SubmissionWorkspaceContext
   ──────────────────────────────────────────────────────────────────────────────
   Lightweight per-submission state shared across the SubmissionDetail tabs:
     • correspondence threads (so the tab strip can show an unread badge)
     • pendingComposerDraft   — set by the chatbot's "Draft missing-docs email"
                                action; consumed by the Correspondence composer.
     • requestTabChange       — lets the chatbot navigate to a sibling tab.
   ────────────────────────────────────────────────────────────────────────── */

export interface ComposerDraft {
  channel: Channel;
  to: string;
  subject: string;
  body: string;
}

/** Note pushed to the Notes tab from elsewhere (e.g. the UW Review approve modal). */
export interface PendingNote {
  content: string;
  tags: string[];
  author: string;
  initials: string;
  avatarColor: string;
}

/** Recommended values pushed from the chatbot for a NEW rating option. */
export interface PendingRatingOption {
  productId: string;
  optionName: string;
  limit: string;
  aggregate: string;
  retention: string;
  premium: number;
  endorsements: string[];
  rationale: string;
}

interface SubmissionWorkspaceValue {
  // Active tab — kept in sync by SubmissionDetailInner so other components (chatbot) can read it.
  activeTab: string;
  setActiveTab: (t: string) => void;

  // Active Underwriting-Review checklist item id (null = list view / not in review detail).
  // Surfaced so the chatbot can show suggestions specific to the open analytics page.
  activeReviewId: string | null;
  setActiveReviewId: (id: string | null) => void;

  // ── Account-level cascade ───────────────────────────────────────────────
  // Lifted out of RatingTab's product sub-forms so the toggle in the
  // AccountOverviewHeader applies globally across every product configured
  // under this submission. memberBenefitsChecked initializes `true`
  // (representing the ~99% baseline). Mutating either value here cascades
  // into every product's Member Benefits / Notifications sub-tab.
  memberBenefitsChecked: boolean;
  setMemberBenefitsChecked: (v: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;

  threads: CorrespondenceThread[];
  setThreads: React.Dispatch<React.SetStateAction<CorrespondenceThread[]>>;

  // Shared task list — read by TasksTab, written by anything (e.g. Refer button in Review tab).
  tasks: Task[];
  addTask: (partial: Omit<Task, "id" | "status" | "completedAt">) => void;
  completeTask: (id: number) => void;
  reopenTask: (id: number) => void;

  pendingComposerDraft: ComposerDraft | null;
  setPendingComposerDraft: (d: ComposerDraft | null) => void;
  consumePendingComposerDraft: () => ComposerDraft | null;

  pendingRatingOption: PendingRatingOption | null;
  setPendingRatingOption: (d: PendingRatingOption | null) => void;
  consumePendingRatingOption: () => PendingRatingOption | null;

  // Queue of notes pushed from other tabs (e.g. UW Review approve modal).
  // NotesTab drains this queue on mount + whenever a new entry arrives.
  pendingNotes: PendingNote[];
  pushPendingNote: (note: PendingNote) => void;
  drainPendingNotes: () => PendingNote[];

  requestTabChange: (tab: string) => void;
  registerTabChangeHandler: (fn: (tab: string) => void) => void;
}

const SubmissionWorkspaceContext = createContext<SubmissionWorkspaceValue | null>(null);

export function SubmissionWorkspaceProvider({
  children,
  initialThreads,
  initialTasks,
}: {
  children: ReactNode;
  initialThreads: CorrespondenceThread[];
  initialTasks: Task[];
}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  // Account-level cascade — see SubmissionWorkspaceValue for rationale.
  const [memberBenefitsChecked, setMemberBenefitsChecked] = useState<boolean>(true);
  const [notificationsEnabled,  setNotificationsEnabled]  = useState<boolean>(true);
  const [threads, setThreads] = useState<CorrespondenceThread[]>(initialThreads);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const nextTaskId = useRef(initialTasks.length + 1);
  const [pendingComposerDraft, setPendingComposerDraft] = useState<ComposerDraft | null>(null);
  const [pendingRatingOption, setPendingRatingOption] = useState<PendingRatingOption | null>(null);
  const [pendingNotes, setPendingNotes] = useState<PendingNote[]>([]);
  const [tabChangeHandler, setTabChangeHandler] = useState<((tab: string) => void) | null>(null);

  const addTask = useCallback((partial: Omit<Task, "id" | "status" | "completedAt">) => {
    setTasks(prev => [{ ...partial, id: nextTaskId.current++, status: "Open" }, ...prev]);
  }, []);

  const completeTask = useCallback((id: number) => {
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Done", completedAt: now } : t));
  }, []);

  const reopenTask = useCallback((id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Open", completedAt: undefined } : t));
  }, []);

  const consumePendingComposerDraft = useCallback(() => {
    const draft = pendingComposerDraft;
    setPendingComposerDraft(null);
    return draft;
  }, [pendingComposerDraft]);

  const consumePendingRatingOption = useCallback(() => {
    const opt = pendingRatingOption;
    setPendingRatingOption(null);
    return opt;
  }, [pendingRatingOption]);

  const pushPendingNote = useCallback((note: PendingNote) => {
    setPendingNotes(prev => [...prev, note]);
  }, []);

  const drainPendingNotes = useCallback(() => {
    let drained: PendingNote[] = [];
    setPendingNotes(prev => {
      drained = prev;
      return [];
    });
    return drained;
  }, []);

  const requestTabChange = useCallback(
    (tab: string) => {
      tabChangeHandler?.(tab);
    },
    [tabChangeHandler]
  );

  const registerTabChangeHandler = useCallback((fn: (tab: string) => void) => {
    setTabChangeHandler(() => fn);
  }, []);

  return (
    <SubmissionWorkspaceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeReviewId,
        setActiveReviewId,
        memberBenefitsChecked,
        setMemberBenefitsChecked,
        notificationsEnabled,
        setNotificationsEnabled,
        threads,
        setThreads,
        tasks,
        addTask,
        completeTask,
        reopenTask,
        pendingComposerDraft,
        setPendingComposerDraft,
        consumePendingComposerDraft,
        pendingRatingOption,
        setPendingRatingOption,
        consumePendingRatingOption,
        pendingNotes,
        pushPendingNote,
        drainPendingNotes,
        requestTabChange,
        registerTabChangeHandler,
      }}>
      {children}
    </SubmissionWorkspaceContext.Provider>
  );
}

export function useSubmissionWorkspace(): SubmissionWorkspaceValue {
  const v = useContext(SubmissionWorkspaceContext);
  if (!v) {
    throw new Error("useSubmissionWorkspace must be used inside <SubmissionWorkspaceProvider>");
  }
  return v;
}

/** Safe variant for components that may render outside a submission shell. */
export function useSubmissionWorkspaceOptional(): SubmissionWorkspaceValue | null {
  return useContext(SubmissionWorkspaceContext);
}
