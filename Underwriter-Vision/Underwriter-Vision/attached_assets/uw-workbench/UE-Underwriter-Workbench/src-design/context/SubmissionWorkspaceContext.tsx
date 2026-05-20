import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { CorrespondenceThread, Channel } from "../components/tabs/CorrespondenceTab";

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

  threads: CorrespondenceThread[];
  setThreads: React.Dispatch<React.SetStateAction<CorrespondenceThread[]>>;

  pendingComposerDraft: ComposerDraft | null;
  setPendingComposerDraft: (d: ComposerDraft | null) => void;
  consumePendingComposerDraft: () => ComposerDraft | null;

  pendingRatingOption: PendingRatingOption | null;
  setPendingRatingOption: (d: PendingRatingOption | null) => void;
  consumePendingRatingOption: () => PendingRatingOption | null;

  requestTabChange: (tab: string) => void;
  registerTabChangeHandler: (fn: (tab: string) => void) => void;
}

const SubmissionWorkspaceContext = createContext<SubmissionWorkspaceValue | null>(null);

export function SubmissionWorkspaceProvider({
  children,
  initialThreads,
}: {
  children: ReactNode;
  initialThreads: CorrespondenceThread[];
}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [threads, setThreads] = useState<CorrespondenceThread[]>(initialThreads);
  const [pendingComposerDraft, setPendingComposerDraft] = useState<ComposerDraft | null>(null);
  const [pendingRatingOption, setPendingRatingOption] = useState<PendingRatingOption | null>(null);
  const [tabChangeHandler, setTabChangeHandler] = useState<((tab: string) => void) | null>(null);

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
        threads,
        setThreads,
        pendingComposerDraft,
        setPendingComposerDraft,
        consumePendingComposerDraft,
        pendingRatingOption,
        setPendingRatingOption,
        consumePendingRatingOption,
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
