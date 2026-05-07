import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { NewSubmissionHeader } from '@/components/domain/NewSubmissionHeader';
import { useSearchAccountsQuery } from '@/services/submissions/submissionsApi';
import { generateSubmissionName } from '@/features/submissions-new/utils/generateSubmissionName';
import type { NewSubmissionFormValues } from '@/shared/types';

export function NewSubmissionHeaderContainer() {
  const { control } = useFormContext<NewSubmissionFormValues>();
  const accountId   = useWatch({ control, name: 'accountId' });
  const type        = useWatch({ control, name: 'type' });

  // RTK Query caches by arg; passing q:'' returns the first 10 mock accounts —
  // enough to resolve any selected accountId since the typeahead also pulls
  // from the same cache. For larger datasets in the real backend this would
  // become a dedicated `getAccountById` query.
  const { data: accounts = [] } = useSearchAccountsQuery({ q: '' });
  const account = accounts.find((a) => a.id === accountId) ?? null;

  const generatedName = useMemo(() => {
    if (!account || !type) return null;
    return generateSubmissionName({
      accountName: account.name,
      type,
      year: new Date().getFullYear(),
    });
  }, [account, type]);

  return <NewSubmissionHeader generatedName={generatedName} />;
}
