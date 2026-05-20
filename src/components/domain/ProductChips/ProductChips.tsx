import * as Lucide from 'lucide-react';
import {
  productChipStyles as cs,
  productLineIcons,
  productLineLabels,
  SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER,
} from '@/theme/tokens';
import type { ProductLine } from '@/shared/types';

export interface ProductChipsProps {
  products: ProductLine[];
}

type LucideIcon = React.ComponentType<{ size?: number; color?: string }>;

/**
 * Renders product-line chips in DISPLAY_ORDER even if input is shuffled.
 * Per-product icon glyphs come from `productLineIcons` (best-guess
 * semantic mapping; Figma JSON did not expose vector data). Chip is
 * translucent blue with brand-blue text + faint blue border. NO border
 * radius — Figma node has no `cornerRadius`.
 */
export function ProductChips({ products }: ProductChipsProps) {
  const ordered = SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER.filter((p) =>
    products.includes(p),
  );

  return (
    <div
      className="flex flex-wrap"
      style={{ gap: cs.gap, rowGap: cs.rowGap }}
    >
      {ordered.map((p) => {
        const iconName = productLineIcons[p];
        const Icon     = (Lucide as unknown as Record<string, LucideIcon | undefined>)[iconName];
        return (
          <span
            key={p}
            className="inline-flex items-center"
            style={{
              height:        cs.height,
              paddingLeft:   cs.paddingX,
              paddingRight:  cs.paddingX,
              paddingTop:    cs.paddingY,
              paddingBottom: cs.paddingY,
              backgroundColor: cs.bg,
              border:        `${cs.borderWidth}px solid ${cs.borderColor}`,
              color:         cs.textColor,
              fontSize:      cs.fontSize,
              fontWeight:    cs.fontWeight,
              gap:           cs.gap,
              lineHeight:    1,
            }}
          >
            {Icon && <Icon size={cs.iconSize} color={cs.iconColor} />}
            {productLineLabels[p]}
          </span>
        );
      })}
    </div>
  );
}
