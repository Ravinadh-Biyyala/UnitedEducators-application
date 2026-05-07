import { Building2, User, Mail, Phone } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/common/Input';
import { SectionPanel } from '@/components/common/SectionPanel';
import { Select } from '@/components/common/Select';
import type { SelectOption } from '@/components/common/Select';
import { useGetBrokeragesQuery } from '@/services/submissions/submissionsApi';
import { selectStyles } from '@/theme/tokens';
import type { NewSubmissionFormValues } from '@/shared/types';

export function BrokerContactsSection() {
  const { control, setValue } = useFormContext<NewSubmissionFormValues>();
  const { data: brokerages = [] } = useGetBrokeragesQuery();

  const brokerageId      = useWatch({ control, name: 'brokerageId' });
  const brokerContactId  = useWatch({ control, name: 'brokerContactId' });

  const brokerageOptions: SelectOption[] = useMemo(
    () => brokerages.map((b) => ({ id: b.id, label: b.name })),
    [brokerages],
  );

  const selectedBrokerage = useMemo(
    () => brokerages.find((b) => b.id === brokerageId) ?? null,
    [brokerages, brokerageId],
  );

  const contactOptions: SelectOption[] = useMemo(
    () => (selectedBrokerage?.contacts ?? []).map((c) => ({ id: c.id, label: c.name })),
    [selectedBrokerage],
  );

  const selectedContact = useMemo(
    () => selectedBrokerage?.contacts.find((c) => c.id === brokerContactId) ?? null,
    [selectedBrokerage, brokerContactId],
  );

  // Auto-fill email + phone from selected contact
  useEffect(() => {
    if (selectedContact) {
      setValue('brokerEmail', selectedContact.email,  { shouldValidate: true });
      setValue('brokerPhone', selectedContact.phone,  { shouldValidate: true });
    } else {
      setValue('brokerEmail', '', { shouldValidate: true });
      setValue('brokerPhone', '', { shouldValidate: true });
    }
  }, [selectedContact, setValue]);

  // Clear contact when brokerage changes/clears
  useEffect(() => {
    if (!brokerageId) {
      setValue('brokerContactId', '', { shouldValidate: false });
    } else if (
      brokerContactId &&
      selectedBrokerage &&
      !selectedBrokerage.contacts.some((c) => c.id === brokerContactId)
    ) {
      setValue('brokerContactId', '', { shouldValidate: false });
    }
  }, [brokerageId, brokerContactId, selectedBrokerage, setValue]);

  return (
    <SectionPanel title="Broker & Contacts">
      <div className="flex flex-col" style={{ gap: 16 }}>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
          <Controller
            control={control}
            name="brokerageId"
            render={({ field }) => (
              <FormField
                label="Brokerage"
                helper={
                  selectedBrokerage
                    ? `${selectedBrokerage.contacts.length} contact${
                        selectedBrokerage.contacts.length === 1 ? '' : 's'
                      } available`
                    : undefined
                }
              >
                <Select
                  value={field.value || null}
                  onChange={(id) => field.onChange(id ?? '')}
                  options={brokerageOptions}
                  leftIcon={<Building2 size={13} />}
                  placeholder="Select a brokerage…"
                  renderOption={(opt) => {
                    const b = brokerages.find((x) => x.id === opt.id);
                    return (
                      <span className="flex flex-col">
                        <span
                          style={{
                            fontSize:   selectStyles.primarySize,
                            lineHeight: `${selectStyles.primaryLineHeight}px`,
                            fontWeight: selectStyles.primaryWeight,
                            color:      selectStyles.primaryColor,
                          }}
                        >
                          {opt.label}
                        </span>
                        {b && (
                          <span
                            style={{
                              fontSize:   selectStyles.secondarySize,
                              lineHeight: `${selectStyles.secondaryLineHeight}px`,
                              color:      selectStyles.secondaryColor,
                            }}
                          >
                            {b.contacts.length} contact{b.contacts.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </span>
                    );
                  }}
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="brokerContactId"
            render={({ field }) => (
              <FormField
                label="Broker Contact"
                helper={selectedContact ? '✓ Contact details auto-filled below' : undefined}
                helperVariant={selectedContact ? 'success' : 'neutral'}
              >
                <Select
                  value={field.value || null}
                  onChange={(id) => field.onChange(id ?? '')}
                  options={contactOptions}
                  leftIcon={<User size={13} />}
                  placeholder="Select a broker contact…"
                  disabled={!brokerageId}
                  renderOption={(opt) => {
                    const c = selectedBrokerage?.contacts.find((x) => x.id === opt.id);
                    return (
                      <span className="flex flex-col">
                        <span
                          style={{
                            fontSize:   selectStyles.primarySize,
                            lineHeight: `${selectStyles.primaryLineHeight}px`,
                            fontWeight: selectStyles.primaryWeight,
                            color:      selectStyles.primaryColor,
                          }}
                        >
                          {opt.label}
                        </span>
                        {c && (
                          <span
                            style={{
                              fontSize:   selectStyles.secondarySize,
                              lineHeight: `${selectStyles.secondaryLineHeight}px`,
                              color:      selectStyles.secondaryColor,
                            }}
                          >
                            {c.email}
                          </span>
                        )}
                      </span>
                    );
                  }}
                />
              </FormField>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
          <Controller
            control={control}
            name="brokerEmail"
            render={({ field, fieldState }) => (
              <FormField label="Broker Email" error={fieldState.error?.message}>
                <Input
                  variant="tokenized"
                  type="email"
                  placeholder="Auto-filled from contact"
                  leftIcon={<Mail size={13} />}
                  readOnly={Boolean(selectedContact)}
                  mutedValue={Boolean(selectedContact)}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="brokerPhone"
            render={({ field, fieldState }) => (
              <FormField label="Broker Phone" error={fieldState.error?.message}>
                <Input
                  variant="tokenized"
                  type="tel"
                  placeholder="Auto-filled from contact"
                  leftIcon={<Phone size={13} />}
                  readOnly={Boolean(selectedContact)}
                  mutedValue={Boolean(selectedContact)}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </FormField>
            )}
          />
        </div>
      </div>
    </SectionPanel>
  );
}
