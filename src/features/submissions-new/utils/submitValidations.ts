import type { NewSubmissionFormValues } from '@/shared/types';
import { getMissingRequiredFieldsLabels, oxfordCommaJoin } from './getMissingRequiredFields';

export interface ValidationFailure {
  id:       string;
  message:  string;
  blocking: boolean;
}

type SubmitValidator = (v: Partial<NewSubmissionFormValues>) => ValidationFailure | null;

const validateRequiredFields: SubmitValidator = (v) => {
  const missing = getMissingRequiredFieldsLabels(v);
  return missing.length === 0 ? null : {
    id:       'requiredFields',
    message:  `Required: ${oxfordCommaJoin(missing)}.`,
    blocking: true,
  };
};

export const submitValidators: SubmitValidator[] = [
  validateRequiredFields,
  // future validators: append here — no other code changes needed
];

export const runSubmitValidations = (v: Partial<NewSubmissionFormValues>): ValidationFailure[] =>
  submitValidators.map((fn) => fn(v)).filter((f): f is ValidationFailure => f !== null);
