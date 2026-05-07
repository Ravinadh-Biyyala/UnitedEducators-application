import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { LabelValueRow } from '@/components/common/LabelValueRow';
import { SectionPanel } from '@/components/common/SectionPanel';
import { StageProgress } from '@/components/common/StageProgress';
import type { SubmissionRequiredField } from '@/components/common/StageProgress';
import {
  useGetBrokeragesQuery,
  useSearchAccountsQuery,
} from '@/services/submissions/submissionsApi';
import {
  labelValueRowStyles,
  productLineLabels,
  submissionTypeLabels,
} from '@/theme/tokens';
import { generateSubmissionName } from '@/features/submissions-new/utils/generateSubmissionName';
import type { NewSubmissionFormValues, ProductLine } from '@/shared/types';

const TOTAL_REQUIRED_FIELDS = 4;
const PLACEHOLDER = '—';

export function NewSubmissionSidebar() {
  const { control } = useFormContext<NewSubmissionFormValues>();
  const values = useWatch({ control });

  const { data: accounts = [] }    = useSearchAccountsQuery({ q: '' });
  const { data: brokerages = [] }  = useGetBrokeragesQuery();

  const completedFields: SubmissionRequiredField[] = [];
  if (values.accountId)                                         completedFields.push('account');
  if ((values.productLines ?? []).length > 0)                   completedFields.push('products');
  if (values.needByDate)                                        completedFields.push('needByDate');
  if (values.effectiveDate)                                     completedFields.push('effectiveDate');

  const account     = accounts.find((a) => a.id === values.accountId) ?? null;
  const brokerage   = brokerages.find((b) => b.id === values.brokerageId) ?? null;
  const contact     = brokerage?.contacts.find((c) => c.id === values.brokerContactId) ?? null;

  const typeLabel   = values.type ? submissionTypeLabels[values.type] : PLACEHOLDER;
  const accountText = account?.name ?? PLACEHOLDER;
  const productsText =
    (values.productLines ?? []).length > 0
      ? (values.productLines as ProductLine[]).map((p) => productLineLabels[p]).join(', ')
      : PLACEHOLDER;
  const brokerText      = brokerage?.name  ?? PLACEHOLDER;
  const contactText     = contact?.name    ?? PLACEHOLDER;
  const effectiveText   = values.effectiveDate || PLACEHOLDER;

  const successDocs     = (values.documents ?? []).filter((d) => d.status === 'success').length;
  const docsText        = successDocs === 0 ? 'None' : successDocs === 1 ? '1 attached' : `${successDocs} attached`;

  const generatedName = useMemo(() => {
    if (!account || !values.type) return null;
    return generateSubmissionName({
      accountName: account.name,
      type:        values.type,
      year:        new Date().getFullYear(),
    });
  }, [account, values.type]);

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      <SectionPanel title="Submission Stage">
        <StageProgress
          currentStage="IntakeAndTriage"
          completedFields={completedFields}
          totalRequiredFields={TOTAL_REQUIRED_FIELDS}
        />
      </SectionPanel>

      <SectionPanel title="Summary Preview">
        <div className="flex flex-col" style={{ gap: labelValueRowStyles.rowGap }}>
          <LabelValueRow label="Name"      value={generatedName ?? PLACEHOLDER} />
          <LabelValueRow label="Type"      value={typeLabel} />
          <LabelValueRow label="Account"   value={accountText} />
          <LabelValueRow label="Products"  value={productsText} />
          <LabelValueRow label="Broker"    value={brokerText} />
          <LabelValueRow label="Contact"   value={contactText} />
          <LabelValueRow label="Effective" value={effectiveText} />
          <LabelValueRow label="Stage"     value="Incomplete Submission" />
          <LabelValueRow label="Docs"      value={docsText} />
        </div>
      </SectionPanel>
    </div>
  );
}
