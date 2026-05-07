import { Check, User } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { Avatar } from '@/components/domain/Avatar';
import { FormField } from '@/components/common/FormField';
import { SectionPanel } from '@/components/common/SectionPanel';
import { Select } from '@/components/common/Select';
import type { SelectOption } from '@/components/common/Select';
import { useGetUnderwritersQuery } from '@/services/submissions/submissionsApi';
import { formFieldStyles, selectStyles } from '@/theme/tokens';
import type { NewSubmissionFormValues, UnderwriterLookup } from '@/shared/types';
import type { UnderwriterRole } from '@/shared/types/teamPerformance';

const toAvatarRole = (role: 'underwriter' | 'specialist'): UnderwriterRole =>
  role === 'underwriter' ? 'lead' : 'standard';

export function UnderwritingTeamSection() {
  const { control } = useFormContext<NewSubmissionFormValues>();
  const { data: people = [] } = useGetUnderwritersQuery();

  const underwriterId  = useWatch({ control, name: 'underwriterId' });
  const specialistId   = useWatch({ control, name: 'underwritingSpecialistId' });

  const underwriters = useMemo(() => people.filter((p) => p.role === 'underwriter'), [people]);
  const specialists  = useMemo(() => people.filter((p) => p.role === 'specialist'),  [people]);

  const findById = (id: string | undefined) => people.find((p) => p.id === id) ?? null;
  const selectedUnderwriter = findById(underwriterId);
  const selectedSpecialist  = findById(specialistId);

  const renderPersonOption =
    (list: UnderwriterLookup[]) =>
    (opt: SelectOption) => {
      const p = list.find((x) => x.id === opt.id);
      return (
        <span className="flex items-center" style={{ gap: selectStyles.optionRowItemGap }}>
          {p && <Avatar name={p.name} role={toAvatarRole(p.role)} size={24} />}
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
        </span>
      );
    };

  const personOptions = (list: UnderwriterLookup[]): SelectOption[] =>
    list.map((p) => ({ id: p.id, label: p.name }));

  return (
    <SectionPanel title="Underwriting Team">
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
        <Controller
          control={control}
          name="underwriterId"
          render={({ field }) => (
            <FormField
              label="Underwriter"
              helper={
                selectedUnderwriter ? (
                  <span className="inline-flex items-center" style={{ gap: formFieldStyles.helperIconGap }}>
                    <Check size={formFieldStyles.helperIconSize} />
                    {selectedUnderwriter.name} assigned
                  </span>
                ) : undefined
              }
              helperVariant={selectedUnderwriter ? 'success' : 'neutral'}
            >
              <Select
                value={field.value || null}
                onChange={(id) => field.onChange(id ?? '')}
                options={personOptions(underwriters)}
                leftIcon={<User size={13} />}
                placeholder="Select underwriter…"
                renderOption={renderPersonOption(underwriters)}
              />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="underwritingSpecialistId"
          render={({ field }) => (
            <FormField
              label="Underwriting Specialist"
              helper={
                selectedSpecialist ? (
                  <span className="inline-flex items-center" style={{ gap: formFieldStyles.helperIconGap }}>
                    <Check size={formFieldStyles.helperIconSize} />
                    {selectedSpecialist.name} assigned
                  </span>
                ) : undefined
              }
              helperVariant={selectedSpecialist ? 'success' : 'neutral'}
            >
              <Select
                value={field.value || null}
                onChange={(id) => field.onChange(id ?? '')}
                options={personOptions(specialists)}
                leftIcon={<User size={13} />}
                placeholder="Select specialist…"
                renderOption={renderPersonOption(specialists)}
              />
            </FormField>
          )}
        />
      </div>
    </SectionPanel>
  );
}
