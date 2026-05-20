import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, CheckSquare, BarChart2, BookOpen, Inbox, LogOut, Settings, Bell, Search } from "lucide-react";
import { UnderwritingChat } from "../components/chat/UnderwritingChat";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Command Center", href: "/" },
    { icon: FileText, label: "Submissions", href: "/submissions" },
    { icon: Inbox, label: "Inbox", href: "/inbox" },
    { icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { icon: BarChart2, label: "Portfolio", href: "/portfolio" },
    { icon: BookOpen, label: "Appetite", href: "/appetite" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <aside className="w-64 bg-[#011B9E] text-white flex flex-col relative z-20 shadow-2xl shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded bg-brand-gold flex items-center justify-center shadow-[0_0_15px_rgba(201,162,39,0.5)]">
              <span className="font-display font-bold text-brand-blue-dark text-lg leading-none">UE</span>
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-white/90">Underwriter</span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className="block">
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      active
                        ? "bg-white/10 text-white font-medium shadow-inner backdrop-blur-sm"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={18} className={active ? "text-brand-gold" : ""} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue-light border border-white/20 flex items-center justify-center">
                <span className="font-bold text-sm">SM</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sarah Mitchell</p>
                <p className="text-xs text-brand-gold">Senior Underwriter</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-white/50 px-2">
            <Settings size={16} className="hover:text-white cursor-pointer transition-colors" />
            <Link href="/login">
              <LogOut size={16} className="hover:text-white cursor-pointer transition-colors inline-block" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden min-w-0">
        <header className="h-16 flex items-center justify-between px-8 bg-white/50 backdrop-blur-xl border-b border-border/50 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-blue" size={16} />
              <input 
                type="text" 
                placeholder="Search submissions, members, or policies..." 
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-transparent rounded-full text-sm focus:outline-none focus:border-brand-blue/20 focus:ring-2 focus:ring-brand-blue/20 transition-all placeholder:text-muted-foreground/70"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
            </button>
            <div className="h-5 w-px bg-border"></div>
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10 transition-colors font-medium text-sm border border-brand-blue/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
              </span>
              Ask Agent
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      <AnimatePresence>
        {chatOpen && (
          <UnderwritingChat onClose={() => setChatOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}