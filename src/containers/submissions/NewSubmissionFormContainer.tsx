import { useFormContext } from 'react-hook-form';
import { NewSubmissionForm } from '@/components/domain/NewSubmissionForm';

export function NewSubmissionFormContainer() {
  useFormContext();
  return <NewSubmissionForm />;
}
