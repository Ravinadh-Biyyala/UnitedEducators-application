import { AlertCircle, Clock } from 'lucide-react';
import { colors, fonts, taskRowVariants } from '@/theme/tokens';
import type { Task } from '@/shared/types';
import { PriorityChip } from '@/components/domain/PriorityChip';

interface Props {
  task: Task;
  onClick?: (task: Task) => void;
}

export function TaskRow({ task, onClick }: Props) {
  const v = taskRowVariants[task.isOverdue ? 'overdue' : 'normal'];

  return (
    <div
      onClick={() => onClick?.(task)}
      style={{
        minHeight:    63,
        padding:      '12px 20px 1px 22px',
        background:   v.bg,
        borderBottom: `1px solid ${v.borderColor}`,
        display:      'flex',
        flexDirection:'column',
        gap:          4,
        cursor:       onClick ? 'pointer' : 'default',
        fontFamily:   fonts.sans,
      }}
    >
      {/* Top row: title + priority chip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span
          style={{
            fontSize:   12,
            fontWeight: 600,
            color:      v.titleColor,
            flex:       1,
            minWidth:   0,
            overflow:   'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {task.title}
        </span>
        <PriorityChip priority={task.priority} />
      </div>

      {/* Bottom row: SUB-id pill + due date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* SUB-id pill */}
        <span
          style={{
            display:    'inline-block',
            padding:    '1px 6px',
            background: colors.infoBlueBg,
            borderRadius: 0,
            fontFamily: fonts.mono,
            fontSize:   10,
            fontWeight: 700,
            color:      colors.brandBlueDeep,
          }}
        >
          {task.submissionId}
        </span>

        {/* Due date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {task.isOverdue ? (
            <>
              <AlertCircle size={10} style={{ color: colors.dangerRed, flexShrink: 0 }} aria-hidden />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.dangerRed }}>
                {task.dueDate}
              </span>
            </>
          ) : (
            <>
              <Clock size={10} style={{ color: colors.textMuted, flexShrink: 0 }} aria-hidden />
              <span style={{ fontSize: 10, fontWeight: 400, color: colors.textMuted }}>
                {task.dueDate}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
