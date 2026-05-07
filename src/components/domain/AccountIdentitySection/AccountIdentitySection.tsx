import { Controller, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/common/Input';
import { MultiSelect } from '@/components/common/MultiSelect';
import type { MultiSelectOption } from '@/components/common/MultiSelect';
import { SectionPanel } from '@/components/common/SectionPanel';
import { AccountSearchInput } from '@/components/domain/AccountSearchInput';
import {
  productLineLabels,
  SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER,
} from '@/theme/tokens';
import type {
  AccountLookup,
  NewSubmissionFormValues,
  ProductLine,
} from '@/shared/types';

const PRODUCT_OPTIONS: MultiSelectOption<ProductLine>[] =
  SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER.map((p) => ({
    id:    p,
    label: productLineLabels[p],
  }));

export function AccountIdentitySection() {
  const { control, register } = useFormContext<NewSubmissionFormValues>();
  // AccountSearchInput stores the full lookup; RHF only persists the ID.
  // Local state holds the resolved object until a future phase re-hydrates it.
  const [account, setAccount] = useState<AccountLookup | null>(null);

  return (
    <SectionPanel title="Account & Identity">
      <div className="flex flex-col" style={{ gap: 16 }}>
        <Controller
          control={control}
          name="accountId"
          render={({ field, fieldState }) => (
            <FormField label="Account Name" required error={fieldState.error?.message}>
              <AccountSearchInput
                value={account}
                onChange={(acc) => {
                  setAccount(acc);
                  field.onChange(acc?.id ?? '');
                }}
              />
            </FormField>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
          <FormField label="Group">
            <Input
              variant="tokenized"
              placeholder="Optional group or consortium name"
              {...register('group')}
            />
          </FormField>

          <Controller
            control={control}
            name="productLines"
            render={({ field, fieldState }) => (
              <FormField label="Product Line(s)" required error={fieldState.error?.message}>
                <MultiSelect<ProductLine>
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={PRODUCT_OPTIONS}
                  placeholder="Select one or more product lines…"
                />
              </FormField>
            )}
          />
        </div>
      </div>
    </SectionPanel>
  );
}
