import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, GraduationCap, User } from 'lucide-react';
import DashboardIcon    from '@/assets/icons/sidebar/dashboard.svg?react';
import SubmissionsIcon  from '@/assets/icons/sidebar/submissions.svg?react';
import TasksIcon        from '@/assets/icons/sidebar/tasks.svg?react';
import InboxIcon        from '@/assets/icons/sidebar/inbox.svg?react';
import PortfolioIcon    from '@/assets/icons/sidebar/portfolio.svg?react';
import AppetiteIcon     from '@/assets/icons/sidebar/appetite-rules.svg?react';
import { useSidebarCollapsed } from '@/hooks/common';
import { useAuthUser }         from '@/hooks/auth';
import { sidebarStyles as ss } from '@/theme/tokens';

// ── Nav item definitions ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',      Icon: DashboardIcon,   end: true  },
  { to: '/submissions',    label: 'Submissions',    Icon: SubmissionsIcon, end: false },
  { to: '/tasks',          label: 'Task Queue',     Icon: TasksIcon,       end: false },
  { to: '/inbox',          label: 'Inbox',          Icon: InboxIcon,       end: false },
  { to: '/portfolio',      label: 'Portfolio',      Icon: PortfolioIcon,   end: false },
  { to: '/appetite-rules', label: 'Appetite Rules', Icon: AppetiteIcon,    end: false },
] as const;

// ── Logo tile (shared between collapsed + expanded) ────────────────────────────
function LogoTile() {
  return (
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
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
export function Sidebar() {
  const [collapsed, toggle] = useSidebarCollapsed();
  const user = useAuthUser();

  const width = collapsed ? ss.widthCollapsed : ss.widthExpanded;

  return (
    <aside
      className="shrink-0 h-full flex flex-col bg-white border-r border-neutral-200 overflow-hidden"
      style={{
        width,
        transitionProperty:       'width',
        transitionDuration:       ss.transitionDuration,
        transitionTimingFunction: ss.transitionEasing,
      }}
    >
      {/* ── Logo / toggle header ───────────────────────────────────────────── */}
      <div
        className="flex items-center shrink-0 border-b border-neutral-200"
        style={{
          height:       ss.logoHeight,
          paddingLeft:  collapsed ? 0 : '1.25rem',
          paddingRight: collapsed ? 0 : '0.75rem',
          paddingTop:   collapsed ? ss.headerPaddingTop : 0,
        }}
      >
        {collapsed ? (
          /* Collapsed: tile centered, toggle below handled by tile acting as button area */
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <LogoTile />
            <button
              type="button"
              onClick={toggle}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
              style={{
                width:        ss.toggleButtonSize,
                height:       ss.toggleButtonSize,
                border:       `1px solid ${ss.toggleCollapsedBorderColor}`,
              }}
            >
              <ChevronsRight size={ss.toggleIconSize} />
            </button>
          </div>
        ) : (
          /* Expanded: tile + text + collapse button */
          <>
            <div className="flex items-center flex-1 min-w-0" style={{ gap: ss.logoGap }}>
              <LogoTile />
              <span
                style={{
                  color:      ss.logoTextColor,
                  fontSize:   ss.logoTextSize,
                  fontWeight: ss.logoTextWeight,
                  lineHeight: ss.logoTextLineHeight,
                  whiteSpace: 'pre-line',
                }}
              >
                {'United\nEducators'}
              </span>
            </div>
            <button
              type="button"
              onClick={toggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
              style={{ width: ss.toggleButtonSize, height: ss.toggleButtonSize, border:`1px solid ${ss.toggleCollapsedBorderColor}`,
              }} 
            >
              <ChevronsLeft size={ss.toggleIconSize} />
            </button>

            
          </>
        )}
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <div
                title={collapsed ? label : undefined}
                className={`flex items-center transition-colors duration-100 ${
                  isActive ? 'bg-brand-vivid' : 'hover:bg-neutral-50'
                }`}
                style={{
                  height:      ss.navItemHeight,
                  paddingLeft:  collapsed ? 0 : ss.navPaddingLeft,
                  paddingRight: collapsed ? 0 : '1rem',
                  gap:          collapsed ? 0 : ss.navGap,
                  paddingTop:   collapsed ? 0 : '0.25rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <span className={isActive ? 'text-white' : 'text-neutral-700 opacity-65'}>
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

      {/* ── Role badge ────────────────────────────────────────────────────── */}
      {user && (
        <div
          className="shrink-0 flex items-center border-t border-neutral-200"
          style={{
            backgroundColor: ss.roleBadgeBg,
            paddingLeft:     collapsed ? 0 : ss.roleBadgePaddingX,
            paddingRight:    collapsed ? 0 : ss.roleBadgePaddingX,
            paddingTop:      ss.roleBadgePaddingY,
            paddingBottom:   ss.roleBadgePaddingY,
            justifyContent:  collapsed ? 'center' : 'flex-start',
            gap:             collapsed ? 0 : '0.5rem',
          }}
        >
          <span title={collapsed ? user.role : undefined} style={{ flexShrink: 0, display: 'flex' }}>
            <User size={14} color={ss.roleBadgeIconColor} aria-hidden="true" />
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
                letterSpacing: '0.06em',
              }}
            >
              {user.role}
            </span>
          )}
        </div>
      )}
    </aside>
  );
}
