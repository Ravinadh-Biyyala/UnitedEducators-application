import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AiIcon from '@/assets/icons/ai-assistant.svg?react';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg?react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// ── AI Assistant Panel — structural right column (Figma 320:50566) ────────────
// 44px wide, full height, white, left border 0.8px neutral-200.
// Content is vertically centered with ~334px top+bottom padding.
function AiAssistantPanel() {
  return (
    <aside
      className="shrink-0 flex flex-col items-center justify-center bg-white"
      style={{ width: 44, borderLeft: '0.8px solid #DCE3EC' }}
      aria-label="AI Assistant"
    >
      <button
        type="button"
        className="flex flex-col items-center gap-0 hover:opacity-80 transition-opacity ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid rounded"
        aria-label="Open AI Assistant"
        title="Open AI Assistant"
      >
        {/* Icon container — 32×32, brand-vivid bg, rounded-lg (Figma 320:50568) */}
        <div className="relative mb-3">
          <div className="w-8 h-8 bg-brand-vivid rounded-lg flex items-center justify-center text-white">
            <AiIcon width={16} height={16} aria-hidden="true" />
          </div>
          {/* Gold dot badge — 6.83px circle, brand-accent, white border (Figma 320:50576) */}
          <span
            className="absolute bg-brand-accent rounded-full"
            style={{
              width: 6.83,
              height: 6.83,
              top: 4,
              right: 4,
              border: '0.78px solid #ffffff',
            }}
            aria-hidden="true"
          />
        </div>

        {/* "AI ASSISTANT" — 9.6px Bold, neutral-700, letterSpacing 0.768px, vertical (Figma 320:50578) */}
        <span
          className="text-neutral-700 font-bold uppercase select-none"
          style={{
            fontSize: 9.6,
            letterSpacing: 0.768,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            marginBottom: 8,
          }}
        >
          AI Assistant
        </span>

        {/* Chevron-left — 12×12, neutral-500 (Figma 320:50579) */}
        <ChevronLeftIcon
          width={12}
          height={12}
          className="text-neutral-500"
          aria-hidden="true"
        />
      </button>
    </aside>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip-to-content — visible only on keyboard focus. Lets keyboard users
          jump past the nav rail and topbar on every page load. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-brand-vivid focus:font-semibold focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-vivid"
      >
        Skip to main content
      </a>

      {/* Mobile backdrop — shown when sidebar slides in on small screens */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(15,23,42,0.45)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left: nav sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Center: header + scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar onMobileMenu={() => setMobileOpen(true)} />
        {/* bg neutral-100 (#EEF1F6), padding: top 28px · left/right 32px · bottom 0 */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-neutral-100 pt-7 px-8 pb-0 ring-custom focus-visible:outline-none"
        >
          <Outlet />
        </main>
      </div>

      {/* Right: AI Assistant structural column — 44px, full height */}
      <AiAssistantPanel />
    </div>
  );
}
