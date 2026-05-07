import { Inbox, DollarSign, ShieldCheck, Award, AlertCircle } from 'lucide-react';
import type { PortfolioStat, PortfolioStatKey } from '@/shared/types/portfolio';
import { formatStatValue } from '@/shared/utils/formatStatValue';
import { colors, fonts, portfolioStatStyles, statRowDims } from '@/theme/tokens';

function SlaCheckIcon({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#sla-check-clip)">
        <path
          d="M6.49992 11.9168C9.49146 11.9168 11.9166 9.49171 11.9166 6.50016C11.9166 3.50862 9.49146 1.0835 6.49992 1.0835C3.50838 1.0835 1.08325 3.50862 1.08325 6.50016C1.08325 9.49171 3.50838 11.9168 6.49992 11.9168Z"
          stroke={color} strokeWidth="1.08333" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M4.875 6.49984L5.95833 7.58317L8.125 5.4165"
          stroke={color} strokeWidth="1.08333" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="sla-check-clip">
          <rect width="13" height="13" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

const ICON_MAP = { Inbox, DollarSign, ShieldCheck, Award, SlaCheck: SlaCheckIcon, AlertCircle } as const;
type IconName = keyof typeof ICON_MAP;

interface StatRowProps {
  stat:    PortfolioStat;
  isLast?: boolean;
  onClick?: (key: PortfolioStatKey) => void;
}

export function StatRow({ stat, isLast, onClick }: StatRowProps) {
  const style    = portfolioStatStyles[stat.key];
  const IconComp = ICON_MAP[style.icon as IconName];

  return (
    <div
      onClick={onClick ? () => onClick(stat.key) : undefined}
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        height:         statRowDims.height,
        padding:        statRowDims.padding,
        borderBottom:   isLast ? 'none' : `1px solid ${colors.borderDefault}`,
        cursor:         onClick ? 'pointer' : undefined,
        fontFamily:     fonts.sans,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: statRowDims.gap }}>
        {IconComp && <IconComp size={statRowDims.iconSize} color={style.iconColor} />}
        <span style={{ fontSize: 12, fontWeight: 400, color: colors.textBody }}>
          {stat.label}
        </span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: colors.textHeading }}>
        {formatStatValue(stat)}
      </span>
    </div>
  );
}
