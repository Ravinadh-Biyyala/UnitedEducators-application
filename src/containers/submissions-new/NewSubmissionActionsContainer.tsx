import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext, useWatch } from 'react-hook-form';
import { NewSubmissionActions } from '@/components/domain/NewSubmissionActions';
import { useCreateSubmissionMutation } from '@/services/submissions/submissionsApi';
import { runSubmitValidations } from '@/features/submissions-new/utils/submitValidations';
import type { NewSubmissionFormValues, CreateSubmissionPayload } from '@/shared/types';

export function NewSubmissionActionsContainer() {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { isDirty, isSubmitting } } =
    useFormContext<NewSubmissionFormValues>();
  const formValues = useWatch({ control });
  const failures          = runSubmitValidations(formValues);
  const isBlocked         = failures.some((f) => f.blocking);
  const validationMessage = failures.find((f) => f.blocking)?.message ?? null;

  const [createSubmission, { isLoading }] = useCreateSubmissionMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (submitError) setSubmitError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  const onCreateClick = handleSubmit(async (formValues) => {
    const documents = formValues.documents.filter((d) => d.status === 'success');
    const payload: CreateSubmissionPayload = {
      type:                      formValues.type,
      accountId:                 formValues.accountId,
      group:                     formValues.group,
      productLines:              formValues.productLines,
      needByDate:                formValues.needByDate,
      effectiveDate:             formValues.effectiveDate,
      expirationDate:            formValues.expirationDate,
      brokerageId:               formValues.brokerageId,
      brokerContactId:           formValues.brokerContactId,
      underwriterId:             formValues.underwriterId,
      underwritingSpecialistId:  formValues.underwritingSpecialistId,
      documents,
    };
    try {
      await createSubmission(payload).unwrap();
      navigate('/submissions');
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      setSubmitError(err.data?.message ?? 'Failed to create submission. Please try again.');
    }
  });

  const onCancelClick = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    navigate('/submissions');
  };

  return (
    <NewSubmissionActions
      validationMessage={validationMessage}
      isSubmitBlocked={isBlocked}
      submitError={submitError}
      isSubmitting={isSubmitting || isLoading}
      onCreateClick={onCreateClick}
      onCancelClick={onCancelClick}
    />
  );
}
