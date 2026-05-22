import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type NotificationCategory =
  | "Mention"
  | "Approval"
  | "Task"
  | "SLA"
  | "Submission"
  | "System";

export type NotificationSeverity = "info" | "warn" | "critical" | "success";

export interface Notification {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  actor?: string;
  actorInitials?: string;
  submission?: string;
  timestamp: string;
  minutesAgo: number;
  read: boolean;
}

// Actionable = the things a user must DO something about, not just be informed of.
// Critical severity OR Approvals/SLA/Mentions categories qualify. These are what
// surface in the global popover; the full page also shows informational items.
export const isActionable = (n: Notification): boolean =>
  n.severity === "critical" ||
  n.category === "Approval" ||
  n.category === "SLA" ||
  n.category === "Mention";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  criticalUnreadCount: number;
  actionableUnreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const SEED: Notification[] = [
  { id: "n1",  category: "SLA",        severity: "critical", title: "SLA breached on SUB-7835",            body: "Safety questionnaire request to Hub International is 4 hours past due.",                       actor: "System",         submission: "SUB-7835", timestamp: "4 min ago",   minutesAgo: 4,    read: false },
  { id: "n2",  category: "Approval",   severity: "warn",     title: "Approval required: Premium authority", body: "Sarah Mitchell requested approval on a $285,400 premium that exceeds your authority.",         actor: "Sarah Mitchell", actorInitials: "SM", submission: "SUB-7829", timestamp: "12 min ago",  minutesAgo: 12,   read: false },
  { id: "n3",  category: "Mention",    severity: "info",     title: "James mentioned you on SUB-7834",      body: "“@John can you take a look at the appetite override request? Director sign-off needed.”",      actor: "James Owens",    actorInitials: "JO", submission: "SUB-7834", timestamp: "28 min ago",  minutesAgo: 28,   read: false },
  { id: "n4",  category: "Task",       severity: "warn",     title: "Task due today: T-1038",               body: "Obtain updated open claims detail from broker — Gallagher Education.",                          actor: "System",         submission: "SUB-7829", timestamp: "1 hour ago",  minutesAgo: 60,   read: false },
  { id: "n5",  category: "Submission", severity: "success",  title: "Quote sent on SUB-7832",               body: "Indicative quote of $612,300 issued for Vanderbilt University (Property + GL).",                actor: "Tom Lee",        actorInitials: "TL", submission: "SUB-7832", timestamp: "2 hours ago", minutesAgo: 120,  read: true  },
  { id: "n6",  category: "Approval",   severity: "success",  title: "Your approval request was approved",   body: "Director approved the Cyber sublimit increase to $5M on SUB-7831.",                              actor: "Director",       actorInitials: "DR", submission: "SUB-7831", timestamp: "3 hours ago", minutesAgo: 180,  read: true  },
  { id: "n7",  category: "Submission", severity: "info",     title: "New submission assigned: SUB-7841",    body: "Stanford University renewal assigned to you — Aon Higher Ed. Need-by date: Jun 18.",            actor: "Lead UW",        actorInitials: "LU", submission: "SUB-7841", timestamp: "Today, 09:22", minutesAgo: 240, read: true  },
  { id: "n8",  category: "Mention",    severity: "info",     title: "Sarah mentioned you in Notes",         body: "“@John flagging this for your review before binding — loss ratio trend is climbing.”",          actor: "Sarah Mitchell", actorInitials: "SM", submission: "SUB-7829", timestamp: "Today, 08:48", minutesAgo: 280, read: true  },
  { id: "n9",  category: "System",     severity: "info",     title: "Daily portfolio brief is ready",       body: "Your morning portfolio summary for May 13, 2026 has been generated.",                            actor: "Companion",      actorInitials: "AI", timestamp: "Today, 07:00", minutesAgo: 380, read: true  },
  { id: "n10", category: "SLA",        severity: "warn",     title: "Renewal R-2049 expires in 1 day",      body: "Chicago Lab Schools (POL-44266) — quote not yet released. Loss ratio 134%.",                    actor: "System",         submission: "SUB-7838", timestamp: "Yesterday",    minutesAgo: 1440, read: true  },
  { id: "n11", category: "Submission", severity: "success",  title: "Bound: SUB-7833",                      body: "Denver Public Schools policy bound for $254,900 effective Jul 01.",                              actor: "Tom Lee",        actorInitials: "TL", submission: "SUB-7833", timestamp: "Yesterday",    minutesAgo: 1500, read: true  },
  { id: "n12", category: "System",     severity: "critical", title: "Appetite guideline updated",           body: "New restrictions on K-12 districts with prior shooter incidents took effect today.",             actor: "Admin",          actorInitials: "AD", timestamp: "May 11, 2026", minutesAgo: 2880, read: true  },
];

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(SEED);

  const value = useMemo<NotificationsContextValue>(() => {
    const unread = notifications.filter(n => !n.read);
    return {
      notifications,
      unreadCount: unread.length,
      criticalUnreadCount: unread.filter(n => n.severity === "critical").length,
      actionableUnreadCount: unread.filter(isActionable).length,
      markRead: (id) =>
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
      markAllRead: () =>
        setNotifications(prev => prev.map(n => ({ ...n, read: true }))),
    };
  }, [notifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
