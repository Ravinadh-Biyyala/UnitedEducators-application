import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { formFieldStyles as f, colors } from '@/theme/tokens';

interface Props {
  label:           string;
  error?:          string;
  /** Renders a red asterisk after the label when true. */
  required?:       boolean;
  /** Helper text shown below the field (suppressed when `error` is set). */
  helper?:         ReactNode;
  /** When true, helper renders in `colors.greenAssigned` (e.g. "Auto-filled below"). */
  helperVariant?:  'neutral' | 'success';
  labelClassName?: string;
  children:        ReactNode;
}

interface InjectedChildProps {
  id?:                  string;
  'aria-invalid'?:      boolean | 'true' | 'false';
  'aria-required'?:     boolean | 'true' | 'false';
  'aria-describedby'?:  string;
}

/**
 * Walks the children and injects `id`, `aria-invalid`, `aria-required`,
 * and `aria-describedby` into the first valid React element it finds.
 * This binds the FormField's label, error, and helper to the control without
 * forcing every consumer to wire ids manually.
 */
function injectFieldProps(children: ReactNode, injected: InjectedChildProps): ReactNode {
  let injectedOnce = false;
  return Children.map(children, (child) => {
    if (injectedOnce || !isValidElement(child)) return child;
    injectedOnce = true;
    const existing = (child.props ?? {}) as Record<string, unknown>;
    const mergedDescribedBy = [existing['aria-describedby'], injected['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      id: existing.id ?? injected.id,
      'aria-invalid': existing['aria-invalid'] ?? injected['aria-invalid'],
      'aria-required': existing['aria-required'] ?? injected['aria-required'],
      'aria-describedby': mergedDescribedBy,
    });
  });
}

export function FormField({
  label,
  error,
  required,
  helper,
  helperVariant = 'neutral',
  labelClassName,
  children,
}: Props) {
  const useTokens = labelClassName === undefined;
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  const enhancedChildren = injectFieldProps(children, {
    id: fieldId,
    'aria-invalid': error ? true : undefined,
    'aria-required': required ? true : undefined,
    'aria-describedby': describedBy,
  });

  return (
    <div className="block">
      <label htmlFor={fieldId} className="block">
        {useTokens ? (
          <span
            className="inline-flex items-center"
            style={{
              gap:        f.labelGap,
              fontSize:   f.labelSize,
              lineHeight: `${f.labelLineHeight}px`,
              fontWeight: f.labelWeight,
              color:      f.labelColor,
            }}
          >
            {label}
            {required && (
              <span
                aria-hidden
                style={{
                  color:      f.asteriskColor,
                  fontSize:   f.asteriskSize,
                  fontWeight: f.asteriskWeight,
                }}
              >
                *
              </span>
            )}
          </span>
        ) : (
          <span className={labelClassName}>
            {label}
            {required && (
              <span aria-hidden style={{ color: f.asteriskColor }}>
                {' '}*
              </span>
            )}
          </span>
        )}
      </label>
      <div style={{ marginTop: f.labelMarginBottom }}>{enhancedChildren}</div>
      {error ? (
        <span
          id={errorId}
          role="alert"
          style={{
            display:    'block',
            marginTop:  f.helperMarginTop,
            fontSize:   f.helperSize,
            lineHeight: `${f.helperLineHeight}px`,
            fontWeight: f.helperWeight,
            color:      colors.dangerRed,
          }}
        >
          {error}
        </span>
      ) : helper ? (
        <span
          id={helperId}
          style={{
            display:    'block',
            marginTop:  f.helperMarginTop,
            fontSize:   f.helperSize,
            lineHeight: `${f.helperLineHeight}px`,
            fontWeight: f.helperWeight,
            color:      helperVariant === 'success' ? f.helperColorSuccess : f.helperColor,
          }}
        >
          {helper}
        </span>
      ) : null}
    </div>
  );
}
