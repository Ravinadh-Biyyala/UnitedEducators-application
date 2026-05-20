import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FileStack, Inbox as InboxIcon, ListChecks, BarChart3,
  Compass, Search, Bell, Sun, Moon, ChevronRight, Command, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES } from "@/lib/mockData";
import ueLogo from "@/assets/ue-logo.png";
import { useRole } from "@/hooks/useRole";
import { useCompanion } from "@/components/companion/CompanionContext";
import { CompanionPanel, CompanionBackgroundTray } from "@/components/companion/CompanionPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/", label: "Workbench", icon: LayoutDashboard },
  { to: "/submissions", label: "Submissions", icon: FileStack, badge: "47" },
  { to: "/inbox", label: "Inbox", icon: InboxIcon, badge: "3" },
  { to: "/tasks", label: "Tasks", icon: ListChecks, badge: "10" },
  { to: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { to: "/appetite", label: "Appetite", icon: Compass },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [dark, setDark] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { roleId } = useRole();
  const { sidebarCollapsed, setSidebarCollapsed } = useCompanion();
  const role = ROLES[roleId];

  // Global ⌘K / Ctrl+K opens the command palette. Suppressed while the user
  // is typing into another input/textarea/contenteditable so we don't hijack
  // their keystrokes — except when the palette itself is open (esc to close).
  useEffect(() => {
    function isTypingTarget(t: EventTarget | null) {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(p => !p);
        return;
      }
      if (e.key === "Escape" && paletteOpen) { setPaletteOpen(false); return; }
      if (paletteOpen) return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  function toggleDark() {
    setDark(d => { document.documentElement.classList.toggle("dark", !d); return !d; });
  }

  // Auto-collapse the sidebar whenever the user clicks anywhere in the main area.
  function onMainPointerDown() {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          "shrink-0 transition-[width] duration-300 ease-out hero-mesh text-sidebar-foreground flex flex-col sticky top-0 h-screen z-30",
          sidebarCollapsed ? "w-[72px]" : "w-[252px]",
        )}
      >
        <Link
          href="/"
          aria-label="Go to Workbench home"
          className="flex items-center gap-3 px-4 py-5 border-b border-white/5 transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-inset"
        >
          <div className="size-9 rounded-xl bg-primary grid place-items-center shadow-lg shadow-primary/30 shrink-0 overflow-hidden ring-1 ring-white/10 transition-transform hover:scale-[1.04]">
            <img src={ueLogo} alt="United Educators" className="size-full object-cover" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="font-display font-bold text-white leading-none">United Educators</div>
              <div className="text-[11px] text-white/60 mt-1 tracking-wide uppercase">Underwriter Workbench</div>
            </div>
          )}
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => {
            const active = item.to === "/" ? location === "/" : location.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all relative",
                  active ? "bg-white/10 text-white shadow-inner"
                         : "text-white/70 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={2} />
                {!sidebarCollapsed && <span className="text-sm font-medium flex-1">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className={cn("text-[10px] font-semibold rounded-full px-1.5 py-0.5",
                    active ? "bg-accent/90 text-[#0B1230]" : "bg-white/10 text-white/80")}>{item.badge}</span>
                )}
                {active && (
                  <motion.div layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-white/5">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors text-xs"
          >
            {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main column — clicks here auto-collapse the sidebar */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col" onPointerDown={onMainPointerDown}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="h-16 px-6 flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Workbench</span>
              <ChevronRight className="size-3.5" />
              <span className="capitalize">{location === "/" ? "Today" : location.replace(/^\//, "").split("/")[0].replace(/-/g, " ")}</span>
            </div>

            <div className="flex-1 max-w-xl ml-auto">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="relative group w-full h-10 pl-10 pr-16 rounded-full bg-muted/60 border border-transparent hover:border-primary/20 hover:bg-background focus:border-primary/30 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm text-left text-muted-foreground"
                aria-label="Open command palette"
              >
                <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                Search submissions, members, brokers, claims…
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-background border rounded-md px-1.5 py-0.5">
                  <Command className="size-3" /> K
                </kbd>
              </button>
            </div>

            <button onClick={toggleDark} className="size-10 rounded-full grid place-items-center hover:bg-muted transition-colors">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button className="relative size-10 rounded-full grid place-items-center hover:bg-muted transition-colors">
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-accent ring-2 ring-background" />
            </button>

            <Link href="/login" className="flex items-center gap-2.5 pl-3 border-l hover:bg-muted/50 rounded-r-full pr-3 -mr-3 py-1.5 transition-colors group" title="Switch role / sign out">
              <Avatar className="size-9 ring-2 ring-primary/15 group-hover:ring-primary/40 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-primary to-[#1E40AF] text-white text-xs font-bold">{role.initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-xs leading-tight text-left">
                <div className="font-semibold text-foreground">{role.name}</div>
                <div className="text-muted-foreground">{role.label} · {role.title}</div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Static, page-aware companion panel */}
      <CompanionPanel />
      <CompanionBackgroundTray />

      {/* Global ⌘K command palette */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

