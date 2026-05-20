import { Controller, useFormContext } from 'react-hook-form';
import { SectionPanel } from '@/components/common/SectionPanel';
import { AccountIdentitySection } from '@/components/domain/AccountIdentitySection';
import { AiAutoFillSection } from '@/components/domain/AiAutoFillSection';
import { BrokerContactsSection } from '@/components/domain/BrokerContactsSection';
import { NotesSection } from '@/components/domain/NotesSection';
import { PolicyDatesSection } from '@/components/domain/PolicyDatesSection';
import { SubmissionDocumentsSection } from '@/components/domain/SubmissionDocumentsSection';
import { SubmissionTypeCard } from '@/components/domain/SubmissionTypeCard';
import { UnderwritingTeamSection } from '@/components/domain/UnderwritingTeamSection';
import {
  SUBMISSION_TYPES_DISPLAY_ORDER,
  submissionTypeCardStyles,
} from '@/theme/tokens';
import type { NewSubmissionFormValues, SubmissionType } from '@/shared/types';

export function NewSubmissionForm() {
  const { control } = useFormContext<NewSubmissionFormValues>();

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      <SectionPanel title="New Submission Type">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div
              className="flex flex-wrap"
              style={{ gap: submissionTypeCardStyles.rowGap }}
            >
              {SUBMISSION_TYPES_DISPLAY_ORDER.map((t: SubmissionType) => (
                <SubmissionTypeCard
                  key={t}
                  type={t}
                  selected={field.value === t}
                  onClick={() => field.onChange(t)}
                />
              ))}
            </div>
          )}
        />
      </SectionPanel>

      <AiAutoFillSection />

      <AccountIdentitySection />
      <PolicyDatesSection />
      <BrokerContactsSection />

      <Controller
        control={control}
        name="documents"
        render={({ field }) => (
          <SubmissionDocumentsSection
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <UnderwritingTeamSection />

      <NotesSection />
    </div>
  );
}
