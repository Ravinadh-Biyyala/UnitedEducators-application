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
        className="flex flex-col items-center gap-0 hover:opacity-80 transition-opacity focus:outline-none"
        aria-label="Open AI Assistant"
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
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: nav sidebar — 220 px */}
      <Sidebar />

      {/* Center: header + scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        {/* bg neutral-100 (#EEF1F6), padding: top 28px · left/right 32px · bottom 0 */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 pt-7 px-8 pb-0">
          <Outlet />
        </main>
      </div>

      {/* Right: AI Assistant structural column — 44px, full height */}
      <AiAssistantPanel />
    </div>
  );
}
