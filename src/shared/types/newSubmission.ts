import type { z } from 'zod';
import type { newSubmissionSchema } from '@/features/submissions/schema/newSubmissionSchema';
import type { ProductLine } from './submission';

export type NewSubmissionFormValues = z.infer<typeof newSubmissionSchema>;

export type SubmissionType = 'NewBusiness' | 'CrossSell' | 'Renewal';

export type SubmissionStage =
  | 'IncompleteSubmission'
  | 'IntakeAndTriage'
  | 'Underwriting'
  | 'Quoting'
  | 'Decision'
  | 'PostBind';

export interface AccountLookup {
  id:    string;
  name:  string;
  city:  string;
  state: string;       // 2-letter
  type:  string;       // institution type
}

export interface BrokerContactLookup {
  id:          string;
  name:        string;
  email:       string;
  phone:       string;
  brokerageId: string;
}

export interface BrokerageLookup {
  id:       string;
  name:     string;
  contacts: BrokerContactLookup[];
}

export interface UnderwriterLookup {
  id:   string;
  name: string;
  role: 'underwriter' | 'specialist';
}

export interface UploadedDocument {
  clientId:     string;
  filename:     string;
  size:         number;
  status:       'uploading' | 'success' | 'error';
  serverId?:    string;
  presignedUrl?: string;
  uploadedAt?:  string;
  errorMessage?: string;
  documentTag?: string;
}

export interface CreateSubmissionPayload {
  type:                      SubmissionType;
  accountId:                 string;
  group?:                    string;
  productLines:              ProductLine[];
  needByDate:                string;
  effectiveDate:             string;
  expirationDate:            string;
  brokerageId?:              string;
  brokerContactId?:          string;
  underwriterId?:            string;
  underwritingSpecialistId?: string;
  documents:                 UploadedDocument[];
  notes?:                    string;
}

export interface CreateSubmissionResponse {
  id:    string;
  subId: string;       // SUB-NNNN format
}

export interface UploadDocumentPayload {
  file: File;
}

export interface UploadDocumentResponse {
  id:          string;
  filename:    string;
  size:        number;
  presignedUrl: string;
  uploadedAt:  string;
}
