import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Command as CmdK } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, FileText, Mail, Users, Building2, Compass,
  LayoutDashboard, BarChart3, ListChecks, Inbox as InboxIcon, Plus, ArrowRight,
} from "lucide-react";
import { SUBMISSIONS, INBOX, TEAM } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  group: "Submissions" | "Inbox" | "People" | "Brokers" | "Pages" | "Actions";
  label: string;
  sub?: string;
  icon: any;
  href: string;
  keywords: string;
};

const PAGES: Item[] = [
  { id: "p-home",        group: "Pages", label: "Workbench",   sub: "Today's overview",            icon: LayoutDashboard, href: "/",            keywords: "home today dashboard workbench" },
  { id: "p-submissions", group: "Pages", label: "Submissions", sub: "All accounts in pipeline",    icon: FileText,        href: "/submissions", keywords: "submissions pipeline accounts" },
  { id: "p-inbox",       group: "Pages", label: "Inbox",       sub: "Broker & system messages",    icon: InboxIcon,       href: "/inbox",       keywords: "inbox messages mail email" },
  { id: "p-tasks",       group: "Pages", label: "Tasks",       sub: "Your action queue",           icon: ListChecks,      href: "/tasks",       keywords: "tasks todo work queue" },
  { id: "p-portfolio",   group: "Pages", label: "Portfolio",   sub: "Book metrics & loss ratio",   icon: BarChart3,       href: "/portfolio",   keywords: "portfolio metrics loss ratio book" },
  { id: "p-appetite",    group: "Pages", label: "Appetite",    sub: "Underwriting bands by segment", icon: Compass,       href: "/appetite",    keywords: "appetite segment underwriting bands" },
];

const ACTIONS: Item[] = [
  { id: "a-new",     group: "Actions", label: "Start new submission", sub: "Drop broker packet", icon: Plus,  href: "/submissions/new", keywords: "new submission packet upload create" },
  { id: "a-inbox",   group: "Actions", label: "Triage inbox now",     sub: "Comprehend top thread", icon: Mail, href: "/inbox",       keywords: "triage inbox comprehend" },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  // Build the full searchable corpus once.
  const items = useMemo<Item[]>(() => {
    const subs: Item[] = SUBMISSIONS.map(s => ({
      id: `s-${s.id}`, group: "Submissions",
      label: s.member, sub: `${s.id} · ${s.broker} · ${s.stage}`,
      icon: Building2, href: `/submission/${s.id}`,
      keywords: `${s.id} ${s.member} ${s.shortName} ${s.broker} ${s.brokerContact} ${s.state} ${s.city} ${s.type} ${s.assignee} ${s.status}`.toLowerCase(),
    }));
    const mail: Item[] = INBOX.map(m => ({
      id: `m-${m.id}`, group: "Inbox",
      label: m.subject, sub: `${m.from} · ${m.fromOrg} · ${m.submissionShort}`,
      icon: Mail, href: `/inbox`,
      keywords: `${m.subject} ${m.from} ${m.fromOrg} ${m.submissionShort} ${m.preview}`.toLowerCase(),
    }));
    const brokerSet = new Map<string, Item>();
    for (const s of SUBMISSIONS) {
      const key = `${s.broker}|${s.brokerContact}`;
      if (!brokerSet.has(key)) brokerSet.set(key, {
        id: `b-${key}`, group: "Brokers",
        label: s.brokerContact, sub: `${s.broker}`,
        icon: Users, href: `/submission/${s.id}`,
        keywords: `${s.broker} ${s.brokerContact}`.toLowerCase(),
      });
    }
    const team: Item[] = TEAM.map((t: any) => ({
      id: `t-${t.name}`, group: "People",
      label: t.name, sub: t.role || t.title || "Team",
      icon: Users, href: "/portfolio",
      keywords: `${t.name} ${t.role ?? ""} ${t.title ?? ""}`.toLowerCase(),
    }));
    return [...PAGES, ...ACTIONS, ...subs, ...mail, ...team, ...Array.from(brokerSet.values())];
  }, []);

  useEffect(() => { if (!open) setQuery(""); }, [open]);

  function run(item: Item) {
    onOpenChange(false);
    setTimeout(() => navigate(item.href), 60);
  }

  const grouped = useMemo(() => {
    const order: Item["group"][] = ["Pages", "Actions", "Submissions", "Inbox", "Brokers", "People"];
    const map: Record<string, Item[]> = {};
    for (const i of items) (map[i.group] ||= []).push(i);
    return order.filter(g => map[g]?.length).map(g => [g, map[g]!] as const);
  }, [items]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] grid place-items-start justify-center pt-[14vh] px-4 bg-[#0B1A6E]/35 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-full max-w-[640px] rounded-2xl border border-white/40 bg-white/85 dark:bg-[#0B1230]/85 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(11,26,110,0.45)] overflow-hidden"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Workbench command palette"
          >
            <CmdK label="Workbench command palette" shouldFilter loop>
              <div className="flex items-center gap-3 px-4 h-14 border-b border-foreground/8">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <CmdK.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search submissions, members, brokers, inbox…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70"
                />
                <kbd className="text-[10px] font-medium text-muted-foreground border rounded-md px-1.5 py-0.5">esc</kbd>
              </div>
              <CmdK.List className="max-h-[60vh] overflow-y-auto scroll-thin px-2 py-2">
                <CmdK.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No matches. Try an account name, submission ID, or broker.
                </CmdK.Empty>
                {grouped.map(([group, list]) => (
                  <CmdK.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-muted-foreground/80">
                    {list.map(item => {
                      const Icon = item.icon;
                      return (
                        <CmdK.Item
                          key={item.id}
                          value={`${item.label} ${item.sub ?? ""} ${item.keywords}`}
                          onSelect={() => run(item)}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-2.5 py-2 cursor-pointer text-sm",
                            "data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground",
                          )}
                        >
                          <span className="size-8 rounded-lg border border-primary/15 bg-primary/8 grid place-items-center text-primary shrink-0">
                            <Icon className="size-4" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block font-medium truncate">{item.label}</span>
                            {item.sub && <span className="block text-[11px] text-muted-foreground truncate">{item.sub}</span>}
                          </span>
                          <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
                        </CmdK.Item>
                      );
                    })}
                  </CmdK.Group>
                ))}
              </CmdK.List>
              <div className="px-3 h-9 border-t border-foreground/8 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span><kbd className="border rounded px-1 py-0.5 mr-1">↑↓</kbd>navigate</span>
                <span><kbd className="border rounded px-1 py-0.5 mr-1">↵</kbd>open</span>
                <span className="ml-auto">United Educators · Workbench</span>
              </div>
            </CmdK>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
