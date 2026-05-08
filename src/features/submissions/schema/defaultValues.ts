import type { NewSubmissionFormValues } from '@/shared/types';

export const NEW_SUBMISSION_DEFAULT_VALUES: NewSubmissionFormValues = {
  type:                     'NewBusiness',          // matches "selected" state in Figma
  accountId:                '',
  group:                    '',
  productLines:             [],
  needByDate:               '',
  effectiveDate:            '',
  expirationDate:           '',
  brokerageId:              '',
  brokerContactId:          '',
  brokerEmail:              '',
  brokerPhone:              '',
  underwriterId:            '',
  underwritingSpecialistId: '',
  documents:                [],
  notes:                    '',
};
