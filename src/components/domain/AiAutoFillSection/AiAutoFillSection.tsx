import { Check, Sparkles, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { SectionPanel } from '@/components/common/SectionPanel';
import { colors } from '@/theme/tokens';

type AiStatus = 'idle' | 'processing' | 'done';

const MOCK_EXTRACTED = [
  { label: 'Account Name',   value: 'Riverside Unified School District' },
  { label: 'Effective Date', value: '09/01/2025' },
  { label: 'Product(s)',     value: 'General Liability, Property' },
  { label: 'Need By Date',   value: '08/15/2025' },
];

export function AiAutoFillSection() {
  const [file, setFile]         = useState<File | null>(null);
  const [status, setStatus]     = useState<AiStatus>('idle');
  const [dragOver, setDragOver] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setStatus('processing');
    setTimeout(() => setStatus('done'), 2200);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
  };

  return (
    <SectionPanel title="AI Auto-Fill">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      {status === 'idle' && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          style={{
            border:      `2px dashed ${dragOver ? colors.brandBlue : colors.borderDefault}`,
            background:  dragOver ? colors.brandBlueAlpha03 : '#F8FAFC',
            padding:     '28px 20px',
            textAlign:   'center',
            cursor:      'pointer',
            transition:  'all 0.15s',
            outline:     'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div
              style={{
                width: 40, height: 40,
                background:  colors.brandBlueAlpha08,
                border:      `1px solid ${colors.brandBlueAlpha25}`,
                display:     'flex',
                alignItems:  'center',
                justifyContent: 'center',
              }}
            >
              <UploadCloud size={20} color={colors.brandBlue} />
            </div>
          </div>
          <p style={{ fontSize: '0.80rem', fontWeight: 700, color: colors.textHeading, marginBottom: 4 }}>
            Drop your submission document here
          </p>
          <p style={{ fontSize: '0.70rem', color: colors.textMuted, marginBottom: 12 }}>
            PDF, Word, Excel or CSV — the AI will extract and fill the form fields automatically
          </p>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              background:  colors.brandBlue,
              color:       colors.white,
              fontSize:    '0.72rem',
              fontWeight:  700,
            }}
          >
            <Sparkles size={12} />
            Choose File
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div
          style={{
            padding:    '28px 20px',
            textAlign:  'center',
            background: '#F8FAFC',
            border:     `1px solid ${colors.borderDefault}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div
              className="animate-spin"
              style={{
                width: 40, height: 40,
                background:     colors.brandBlueAlpha08,
                border:         `1px solid ${colors.brandBlueAlpha25}`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color={colors.brandBlue} />
            </div>
          </div>
          <p style={{ fontSize: '0.80rem', fontWeight: 700, color: colors.textHeading, marginBottom: 4 }}>
            Analysing document…
          </p>
          <p style={{ fontSize: '0.70rem', color: colors.textMuted }}>{file?.name}</p>
          <div
            style={{
              marginTop:  14,
              height:     4,
              background: colors.borderDefault,
              overflow:   'hidden',
            }}
          >
            <div
              className="animate-pulse"
              style={{ height: '100%', width: '60%', background: colors.brandBlue }}
            />
          </div>
        </div>
      )}

      {status === 'done' && (
        <div style={{ border: `1px solid ${colors.borderDefault}`, background: '#F8FAFC' }}>
          <div
            style={{
              padding:      '14px 16px',
              borderBottom: `1px solid ${colors.borderDefault}`,
              display:      'flex',
              alignItems:   'center',
              gap:           10,
            }}
          >
            <div
              style={{
                width:          28,
                height:         28,
                background:     colors.successGreenBg,
                border:         `1px solid ${colors.successGreenBorder}`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}
            >
              <Check size={14} color={colors.successGreen} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: colors.textHeading }}>
                Fields extracted from {file?.name}
              </p>
              <p style={{ fontSize: '0.65rem', color: colors.textMuted }}>
                Review the pre-filled values below before submitting
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 2 }}
              aria-label="Dismiss AI extraction"
            >
              <X size={14} />
            </button>
          </div>

          <div
            style={{
              padding:             '12px 16px 14px',
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 8,
            }}
          >
            {MOCK_EXTRACTED.map((row) => (
              <div
                key={row.label}
                style={{
                  padding:    '7px 10px',
                  background: colors.white,
                  border:     `1px solid ${colors.borderDefault}`,
                }}
              >
                <p
                  style={{
                    fontSize:      '0.60rem',
                    color:         colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom:  2,
                  }}
                >
                  {row.label}
                </p>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textHeading }}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ padding: '0 16px 14px' }}>
            <button
              type="button"
              style={{
                width:          '100%',
                padding:        '8px',
                background:     colors.brandBlue,
                color:          colors.white,
                border:         'none',
                fontSize:       '0.75rem',
                fontWeight:     700,
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            6,
              }}
            >
              <Sparkles size={12} />
              Apply to Form
            </button>
          </div>
        </div>
      )}
    </SectionPanel>
  );
}
