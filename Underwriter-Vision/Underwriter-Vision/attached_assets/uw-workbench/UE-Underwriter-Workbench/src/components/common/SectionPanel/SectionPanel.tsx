import type { ReactNode } from 'react';
import { sectionPanelStyles as s } from '@/theme/tokens';

interface SectionPanelProps {
  title:      string;
  badge?:     number;
  action?:    ReactNode;
  children:   ReactNode;
  className?: string;
}

export function SectionPanel({
  title,
  badge,
  action,
  children,
  className,
}: SectionPanelProps) {
  return (
    <section
      className={className}
      style={{
        backgroundColor: s.bodyBg,
        borderTop:       `${s.borderTopWidth}px solid ${s.borderColor}`,
        borderRight:     `${s.borderSideWidth}px solid ${s.borderColor}`,
        borderBottom:    `${s.borderBottomWidth}px solid ${s.borderColor}`,
        borderLeft:      `${s.borderSideWidth}px solid ${s.borderColor}`,
      }}
    >
      <header
        className="flex items-center justify-between"
        style={{
          backgroundColor: s.headerBg,
          borderBottom:    `${s.headerBorderBottomWidth}px solid ${s.headerBorderBottom}`,
          paddingLeft:     s.headerPaddingX,
          paddingRight:    s.headerPaddingX,
          paddingTop:      s.headerPaddingY,
          paddingBottom:   s.headerPaddingY,
        }}
      >
        <div className="flex items-center" style={{ gap: 8 }}>
          <h3
            className="m-0"
            style={{
              fontSize:      s.headerTitleSize,
              lineHeight:    `${s.headerTitleLineHeight}px`,
              fontWeight:    s.headerTitleWeight,
              letterSpacing: s.headerTitleLetterSpacing,
              textTransform: 'uppercase',
              color:         s.headerTitleColor,
            }}
          >
            {title}
          </h3>
          {typeof badge === 'number' && (
            <span
              style={{
                fontSize:   s.headerTitleSize,
                fontWeight: s.headerTitleWeight,
                color:      s.headerTitleColor,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </header>

      <div
        style={{
          paddingLeft:   s.bodyPaddingX,
          paddingRight:  s.bodyPaddingX,
          paddingTop:    s.bodyPaddingTop,
          paddingBottom: s.bodyPaddingBottom,
        }}
      >
        {children}
      </div>
    </section>
  );
}
