import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, GraduationCap, User } from 'lucide-react';
import DashboardIcon    from '@/assets/icons/sidebar/dashboard.svg?react';
import SubmissionsIcon  from '@/assets/icons/sidebar/submissions.svg?react';
import TasksIcon        from '@/assets/icons/sidebar/tasks.svg?react';
import InboxIcon        from '@/assets/icons/sidebar/inbox.svg?react';
import PortfolioIcon    from '@/assets/icons/sidebar/portfolio.svg?react';
import { useSidebarCollapsed } from '@/hooks/common';
import { useAuthUser }         from '@/hooks/auth';
import { sidebarStyles as ss } from '@/theme/tokens';

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',   Icon: DashboardIcon,   end: true  },
  { to: '/submissions', label: 'Submissions', Icon: SubmissionsIcon, end: false },
  { to: '/tasks',       label: 'Task Queue',  Icon: TasksIcon,       end: false },
  { to: '/inbox',       label: 'Inbox',       Icon: InboxIcon,       end: false },
  { to: '/portfolio',   label: 'Portfolio',   Icon: PortfolioIcon,   end: false },
] as const;

export interface SidebarProps {
  mobileOpen?: boolean;
  onClose?:    () => void;
}

const DUMMY_USER = { name: 'Robert Chen', role: 'UW Director / Admin' } as const;

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const [collapsed, toggle] = useSidebarCollapsed();
  const user = useAuthUser() ?? DUMMY_USER;

  const width = collapsed ? ss.widthCollapsed : ss.widthExpanded;

  return (
    <aside
      className={[
        'flex flex-col shrink-0 bg-white border-r border-neutral-200 overflow-hidden',
        'fixed top-0 left-0 bottom-0 z-50',
        'lg:relative lg:top-auto lg:left-auto lg:bottom-auto lg:z-auto',
        'transition-all duration-200 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{ width, minWidth: width, height: '100vh' }}
    >
      {/* ── Logo / toggle header ─────────────────────────────────────────── */}
      <div
        className="flex shrink-0 border-b border-neutral-200"
        style={{
          minHeight:      ss.logoHeight,
          flexDirection:  collapsed ? 'column' : 'row',
          alignItems:     'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding:        collapsed ? `${ss.headerPaddingTop} 0` : `0 0.75rem 0 1.25rem`,
          gap:            collapsed ? '0.5rem' : ss.logoGap,
        }}
      >
        {/* Logo tile — always visible */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width:           ss.logoTileSize,
            height:          ss.logoTileSize,
            backgroundColor: ss.logoTileBg,
          }}
        >
          <GraduationCap size={20} color={ss.logoTileIconColor} aria-hidden="true" />
        </div>

        {/* Brand name — hidden when collapsed */}
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span
              style={{
                display:    'block',
                color:      ss.logoTextColor,
                fontSize:   ss.logoTextSize,
                fontWeight: ss.logoTextWeight,
                lineHeight: ss.logoTextLineHeight,
              }}
            >
              United
            </span>
            <span
              style={{
                display:    'block',
                color:      ss.logoTextColor,
                fontSize:   ss.logoTextSize,
                fontWeight: ss.logoTextWeight,
                lineHeight: ss.logoTextLineHeight,
              }}
            >
              Educators
            </span>
          </div>
        )}

        {/* Single collapse/expand toggle — desktop only, always rendered */}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex items-center justify-center shrink-0 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
          style={{
            width:      ss.toggleButtonSize,
            height:     ss.toggleButtonSize,
            border:     `1px solid ${ss.toggleCollapsedBorderColor}`,
            background: 'white',
            cursor:     'pointer',
          }}
        >
          {collapsed
            ? <ChevronsRight size={ss.toggleIconSize} />
            : <ChevronsLeft  size={ss.toggleIconSize} />
          }
        </button>

        {/* Close button — mobile only, only in expanded state */}
        {!collapsed && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex lg:hidden items-center justify-center shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
            style={{
              width:  ss.toggleButtonSize,
              height: ss.toggleButtonSize,
              border: `1px solid ${ss.toggleCollapsedBorderColor}`,
            }}
          >
            <ChevronsLeft size={ss.toggleIconSize} />
          </button>
        )}
      </div>

      {/* ── Role badge — above nav, matches src-design position ─────────── */}
      <div
        className="shrink-0 pt-4 pb-2"
        style={{ paddingLeft: collapsed ? 0 : '1rem', paddingRight: collapsed ? 0 : '1rem' }}
      >
        <div
          className="flex items-center min-w-0"
          style={{
            background:     ss.roleBadgeBg,
            border:         `1px solid ${ss.roleBadgeIconColor}30`,
            gap:            '0.375rem',
            padding:        '0.375rem 0.625rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <span title={collapsed ? user.role : undefined} style={{ flexShrink: 0, display: 'flex' }}>
            <User size={10} color={ss.roleBadgeIconColor} aria-hidden="true" />
          </span>
          {!collapsed && (
            <span
              style={{
                fontSize:      ss.roleBadgeFontSize,
                fontWeight:    ss.roleBadgeFontWeight,
                color:         ss.roleBadgeTextColor,
                whiteSpace:    'nowrap',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {user.role}
            </span>
          )}
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col overflow-y-auto py-2" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={mobileOpen ? onClose : undefined}>
            {({ isActive }) => (
              <div
                title={collapsed ? label : undefined}
                className={`flex items-center w-full transition-colors duration-100 ${
                  isActive ? 'bg-brand-vivid' : 'hover:bg-neutral-50'
                }`}
                style={{
                  padding:        collapsed ? `12px 0` : `12px ${ss.navPaddingLeft}`,
                  gap:            collapsed ? 0 : ss.navGap,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderLeft:     isActive
                    ? `${ss.navActiveBorderWidth}px solid ${ss.navActiveBorderColor}`
                    : `${ss.navActiveBorderWidth}px solid transparent`,
                }}
              >
                <span
                  style={{ opacity: isActive ? 1 : 0.65 }}
                  className={isActive ? 'text-white' : 'text-neutral-700'}
                >
                  <Icon width={ss.navIconSize} height={ss.navIconSize} aria-hidden="true" />
                </span>
                {!collapsed && (
                  <span
                    style={{
                      fontSize:   ss.navLabelFontSize,
                      fontWeight: isActive ? 700 : 400,
                      color:      isActive ? 'white' : undefined,
                      whiteSpace: 'nowrap',
                    }}
                    className={isActive ? '' : 'text-neutral-700'}
                  >
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
