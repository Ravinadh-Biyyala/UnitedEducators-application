import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorBoundary, PanelErrorState } from '@/components/common';
import {
  NewSubmissionHeaderContainer,
  NewSubmissionFormContainer,
  NewSubmissionSidebarContainer,
  NewSubmissionActionsContainer,
} from '@/containers/submissions';
import { newSubmissionRouteDims as dims } from '@/theme/tokens';
import type { NewSubmissionFormValues } from '@/shared/types';
import { newSubmissionSchema } from '../schema/newSubmissionSchema';
import { NEW_SUBMISSION_DEFAULT_VALUES } from '../schema/defaultValues';

export function SubmissionsNewPage() {
  const formMethods = useForm<NewSubmissionFormValues>({
    resolver:      zodResolver(newSubmissionSchema),
    defaultValues: NEW_SUBMISSION_DEFAULT_VALUES,
    mode:          'onBlur',
  });

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col -mx-8 -mt-7">
        <ErrorBoundary fallback={<PanelErrorState panelName="Header" />}>
          <NewSubmissionHeaderContainer />
        </ErrorBoundary>

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)]"
          style={{
            padding: `${dims.pagePaddingY}px ${dims.pagePaddingX}px`,
            gap:     dims.columnsGap,
          }}
        >
          <ErrorBoundary fallback={<PanelErrorState panelName="Form" />}>
            <NewSubmissionFormContainer />
          </ErrorBoundary>

          <div className="flex flex-col" style={{ gap: dims.columnsGap }}>
            <ErrorBoundary fallback={<PanelErrorState panelName="Sidebar" />}>
              <NewSubmissionSidebarContainer />
            </ErrorBoundary>
            <ErrorBoundary fallback={<PanelErrorState panelName="Actions" />}>
              <NewSubmissionActionsContainer />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
