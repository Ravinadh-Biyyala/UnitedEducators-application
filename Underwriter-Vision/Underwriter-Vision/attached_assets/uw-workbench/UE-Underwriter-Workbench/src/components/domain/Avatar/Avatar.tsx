import type { UnderwriterRole } from '@/shared/types/teamPerformance';
import { getInitials } from '@/shared/utils/getInitials';
import { fonts, underwriterRoleStyles, teamPerfDims } from '@/theme/tokens';

interface AvatarProps {
  name: string;
  role: UnderwriterRole;
  size?: number;
}

export function Avatar({ name, role, size = teamPerfDims.avatarSize }: AvatarProps) {
  const style = underwriterRoleStyles[role];
  return (
    <div
      style={{
        width:           size,
        height:          size,
        flexShrink:      0,
        backgroundColor: style.avatarBg,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        fontFamily:      fonts.sans,
        fontSize:        10,
        fontWeight:      700,
        color:           style.avatarText,
        userSelect:      'none',
      }}
    >
      {getInitials(name)}
    </div>
  );
}
