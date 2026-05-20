import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { DateInput } from '@/components/common/DateInput';
import { FormField } from '@/components/common/FormField';
import { SectionPanel } from '@/components/common/SectionPanel';
import type { NewSubmissionFormValues } from '@/shared/types';

function addOneYear(iso: string): string {
  const [y, m, d] = iso.split('-');
  const yearNum = Number(y) + 1;
  return `${yearNum}-${m}-${d}`;
}

function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const TODAY = todayISO();

export function PolicyDatesSection() {
  const { control, setValue } = useFormContext<NewSubmissionFormValues>();
  const userEditedExpirationRef = useRef(false);

  const needByDate    = useWatch({ control, name: 'needByDate' });
  const effectiveDate = useWatch({ control, name: 'effectiveDate' });
  const expirationDate = useWatch({ control, name: 'expirationDate' });

  // Auto-default expiration to effective + 1 year, unless user has edited it
  useEffect(() => {
    if (!effectiveDate) return;
    if (userEditedExpirationRef.current) return;
    if (expirationDate) return;
    setValue('expirationDate', addOneYear(effectiveDate), {
      shouldValidate: true,
    });
    // Including expirationDate in deps would re-trigger after our own setValue;
    // we intentionally only react to effectiveDate changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDate]);

  return (
    <SectionPanel title="Policy Dates">
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
        <Controller
          control={control}
          name="needByDate"
          render={({ field, fieldState }) => (
            <FormField label="Need By Date" required error={fieldState.error?.message}>
              <DateInput
                value={field.value ?? ''}
                onChange={field.onChange}
                min={TODAY}
              />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="effectiveDate"
          render={({ field, fieldState }) => (
            <FormField label="Effective Date" required error={fieldState.error?.message}>
              <DateInput
                value={field.value ?? ''}
                onChange={field.onChange}
                min={needByDate || undefined}
              />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="expirationDate"
          render={({ field, fieldState }) => (
            <FormField
              label="Expiration Date"
              required
              error={fieldState.error?.message}
              helper="Defaults to one year after effective date"
            >
              <DateInput
                value={field.value ?? ''}
                onChange={(next) => {
                  userEditedExpirationRef.current = true;
                  field.onChange(next);
                }}
                min={effectiveDate || undefined}
              />
            </FormField>
          )}
        />
      </div>
    </SectionPanel>
  );
}
