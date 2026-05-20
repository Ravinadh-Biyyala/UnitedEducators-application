import { useFormContext } from 'react-hook-form';
import { NewSubmissionSidebar } from '@/components/domain/NewSubmissionSidebar';

export function NewSubmissionSidebarContainer() {
  useFormContext();
  return <NewSubmissionSidebar />;
}
