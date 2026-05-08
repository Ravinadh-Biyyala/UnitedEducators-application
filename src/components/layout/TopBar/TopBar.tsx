import { Link } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { useAuthUser } from '@/hooks/auth';
import SearchIcon    from '@/assets/icons/topbar/search.svg?react';
import BellIcon      from '@/assets/icons/topbar/bell.svg?react';
import ChevronIcon   from '@/assets/icons/topbar/chevron-down.svg?react';

// ── Dummy user shown when auth.user is null ───────────────────────────────────
// TODO: Wire to authSlice.user when login is implemented.
const DUMMY_USER = {
  name:     'Robert Chen',
  role:     'UW Director / Admin',
} as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();
}

export interface TopBarProps {
  onMobileMenu?: () => void;
}

// ── TopBar ────────────────────────────────────────────────────────────────────
export function TopBar({ onMobileMenu }: TopBarProps = {}) {
  // TODO: Wire to authSlice.user when login is implemented.
  const authUser = useAuthUser();
  const user = authUser ?? DUMMY_USER;
  const initials = getInitials(user.name);

  return (
    <header
      className="shrink-0 flex items-center px-8 gap-4 bg-white border-b border-neutral-200"
      style={{ height: '64px' }}
    >
      {/* Hamburger — mobile only, shows when sidebar is hidden */}
      <button
        type="button"
        onClick={onMobileMenu}
        aria-label="Open navigation"
        className="flex lg:hidden items-center justify-center shrink-0 bg-white border border-surface-border hover:bg-neutral-50 transition-colors"
        style={{ width: 36, height: 36 }}
      >
        <Menu size={18} className="text-neutral-600" aria-hidden="true" />
      </button>

      {/* Search — 448 px wide, bg fill_V8PE7P, border fill_MJ50ID 0.8 px, radius 8 px (Figma 320:50545) */}
      <div className="relative shrink-0" style={{ width: '448px' }}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
          <SearchIcon width={15} height={15} aria-hidden="true" />
        </span>
        <input
          type="search"
          placeholder="Search submissions, members, IDs…"
          className="
            w-full bg-surface-input border border-surface-border rounded-lg
            pl-[38px] pr-4
            text-[13.12px] text-neutral-900 placeholder:text-neutral-500 placeholder:opacity-50
            focus:outline-none focus:ring-2 focus:ring-brand-vivid focus:border-transparent
          "
          style={{ height: '39.26px' }}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* + New button — Figma: 69×35, white bg, 1px slate300 border, no radius, gap 6, padding 8/12 */}
      <Link
        to="/submissions/new"
        className="inline-flex items-center bg-white border border-surface-border hover:bg-neutral-50 transition-colors shrink-0 font-sans"
        style={{
          gap:            6,
          height:         35,
          paddingLeft:    12,
          paddingRight:   12,
          fontSize:       12,
          fontWeight:     600,
          color:          '#4A5D6E',
          textDecoration: 'none',
        }}
      >
        <Plus size={15} color="#4A5D6E" aria-hidden="true" />
        New
      </Link>

      {/* Notification bell — 38.6×38.6 px, border 0.8px #C4CDD8 (Figma 320:50550) */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex items-center justify-center bg-white border border-surface-border rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors shrink-0"
        style={{ width: '38.6px', height: '38.6px' }}
      >
        <BellIcon width={17} height={17} aria-hidden="true" />
        {/* Badge — 16×16, inside top-right corner at ~4.8px offset (Figma 320:50554) */}
        <span
          className="absolute flex items-center justify-center bg-semantic-notificationRed text-white rounded-full"
          style={{ width: '16px', height: '16px', top: '4.8px', right: '4.8px', fontSize: '8.8px', fontWeight: 800, lineHeight: 1 }}
          aria-label="2 notifications"
        >
          2
        </span>
      </button>

      {/* User profile — avatar + name + role + chevron (Figma 320:50556)
          197.85×49.6px, border 0.8px #C4CDD8, padding 8px top/bottom 16px left/right, gap 12px */}
      <button
        type="button"
        className="flex items-center gap-3 border border-surface-border hover:bg-neutral-50 transition-colors shrink-0 font-sans"
        style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px' }}
        aria-label="User menu"
      >
        {/* Avatar — 32×32 circle, bg #1A7A4A, ExtraBold 11.52px white initials (Figma 320:50557) */}
        <div
          className="flex items-center justify-center rounded-full bg-semantic-avatarGreen text-white shrink-0"
          style={{ width: '32px', height: '32px', fontSize: '11.52px', fontWeight: 800 }}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Name + role stack — vertical, 0px gap (Figma 320:50559) */}
        <div className="flex flex-col items-start gap-0">
          {/* Name — Bold 12.8px, lineHeight 15.36px, #1A2530 (Figma 320:50561) */}
          <span
            className="text-neutral-900 font-bold whitespace-nowrap"
            style={{ fontSize: '12.8px', lineHeight: '15.36px' }}
          >
            {user.name}
          </span>
          {/* Role — SemiBold 10.88px, lineHeight 16.32px, #1A7A4A (Figma 320:50563) */}
          <span
            className="text-semantic-avatarGreen font-semibold whitespace-nowrap"
            style={{ fontSize: '10.88px', lineHeight: '16.32px' }}
          >
            {user.role}
          </span>
        </div>

        {/* Chevron-down — 14×14, #7A8FA3 (Figma 320:50564) */}
        <span className="text-neutral-500">
          <ChevronIcon width={14} height={14} aria-hidden="true" />
        </span>
      </button>
    </header>
  );
}
