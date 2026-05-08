import { MessageSquare } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { SectionPanel } from '@/components/common/SectionPanel';
import { colors } from '@/theme/tokens';
import type { NewSubmissionFormValues } from '@/shared/types';

export function NotesSection() {
  const { register, watch } = useFormContext<NewSubmissionFormValues>();
  const notesValue = watch('notes') ?? '';

  return (
    <SectionPanel title="Notes">
      <div>
        <p
          style={{
            fontSize:     '0.70rem',
            fontWeight:   600,
            color:        colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom:  8,
          }}
        >
          Internal Notes
        </p>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position:      'absolute',
              left:           11,
              top:            11,
              pointerEvents: 'none',
              color:          colors.textMuted,
            }}
          >
            <MessageSquare size={13} />
          </div>
          <textarea
            {...register('notes')}
            placeholder="Add any internal notes, context, or observations for this submission…"
            rows={5}
            style={{
              width:          '100%',
              boxSizing:      'border-box',
              paddingLeft:    34,
              paddingRight:   11,
              paddingTop:     10,
              paddingBottom:  10,
              border:         `1px solid ${colors.borderDefault}`,
              background:     colors.white,
              color:          colors.textBody,
              fontSize:       '0.80rem',
              outline:        'none',
              resize:         'vertical',
              lineHeight:     1.55,
              transition:     'border-color 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = colors.brandBlue; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = colors.borderDefault; }}
          />
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <p style={{ fontSize: '0.60rem', color: colors.textMuted }}>
            Notes are visible to all underwriting team members
          </p>
          <p style={{ fontSize: '0.60rem', color: colors.textMuted }}>
            {notesValue.length} characters
          </p>
        </div>
      </div>
    </SectionPanel>
  );
}
