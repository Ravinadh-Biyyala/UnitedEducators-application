import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { submissionsFiltersDrawerStyles as ds, colors } from '@/theme/tokens';
import { cn } from '@/lib/cn';

/**
 * Generic right-anchored drawer built on Radix Dialog.
 *
 * A11y guarantees inherited from Radix: focus trap, scroll lock,
 * Escape-to-close, backdrop click-to-close, ARIA modal semantics.
 *
 * Shape: <Drawer open onOpenChange><DrawerHeader>…</DrawerHeader>
 *        <DrawerBody>…</DrawerBody><DrawerFooter>…</DrawerFooter></Drawer>
 *
 * The wrapper is intentionally generic. Submissions-specific filter
 * content lives in `components/domain/SubmissionsFiltersDrawer/`.
 */

export interface DrawerProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  side?:        'left' | 'right';
  /** Override the default `widthClamp` style. */
  widthStyle?:  React.CSSProperties['width'];
  /** Accessible label — read by screen readers as the dialog name. */
  ariaLabel?:   string;
  children:     React.ReactNode;
}

export function Drawer({
  open,
  onOpenChange,
  side = 'right',
  widthStyle,
  ariaLabel,
  children,
}: DrawerProps) {
  const sideClass = side === 'right'
    ? 'right-0 data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right'
    : 'left-0  data-[state=open]:animate-slide-in-left  data-[state=closed]:animate-slide-out-left';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-label={ariaLabel}
          className={cn(
            'fixed top-0 z-50 h-full bg-white shadow-xl flex flex-col outline-none',
            sideClass,
          )}
          style={{ width: widthStyle ?? ds.widthClamp, maxWidth: '100vw' }}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Composition pieces ──────────────────────────────────────────────────────

export function DrawerHeader({
  children,
  className,
  style,
}: {
  children:  React.ReactNode;
  className?: string;
  style?:    React.CSSProperties;
}) {
  return (
    <div
      className={cn('flex items-center justify-between shrink-0', className)}
      style={{
        height:        ds.headerHeight,
        paddingLeft:   ds.headerPaddingX,
        paddingRight:  ds.headerPaddingX,
        borderBottom:  `1px solid ${ds.headerBorderColor}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function DrawerTitle({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Title
      style={{
        fontSize:   ds.titleSize,
        fontWeight: ds.titleWeight,
        color:      ds.titleColor,
        margin:     0,
      }}
    >
      {children}
    </Dialog.Title>
  );
}

/** Visible close button (the × in the header). Keyboard Escape works regardless. */
export function DrawerClose({ ariaLabel = 'Close drawer' }: { ariaLabel?: string }) {
  return (
    <Dialog.Close
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center cursor-pointer rounded-sm hover:bg-neutral-100 transition-colors ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
      style={{ width: 44, height: 44, color: ds.closeIconColor }}
    >
      <X size={ds.closeIconSize} />
    </Dialog.Close>
  );
}

export function DrawerBody({
  children,
  className,
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto', className)}
      style={{
        paddingLeft:   ds.bodyPaddingX,
        paddingRight:  ds.bodyPaddingX,
        paddingTop:    ds.bodyPaddingY,
        paddingBottom: ds.bodyPaddingY,
      }}
    >
      {children}
    </div>
  );
}

export function DrawerFooter({
  children,
  className,
  style,
}: {
  children:   React.ReactNode;
  className?: string;
  style?:     React.CSSProperties;
}) {
  return (
    <div
      className={cn('flex items-center justify-end shrink-0 gap-3', className)}
      style={{
        height:       ds.footerHeight,
        paddingLeft:  ds.footerPaddingX,
        paddingRight: ds.footerPaddingX,
        borderTop:    `1px solid ${ds.footerBorderColor}`,
        backgroundColor: colors.bgSurface,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
