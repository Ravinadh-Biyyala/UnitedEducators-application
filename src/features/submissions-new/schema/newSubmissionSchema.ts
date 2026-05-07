import { z } from 'zod';

export const SUBMISSION_TYPES = ['NewBusiness', 'CrossSell', 'Renewal'] as const;

export const uploadedDocumentSchema = z.object({
  clientId:     z.string(),
  filename:     z.string(),
  size:         z.number(),
  status:       z.enum(['uploading', 'success', 'error']),
  serverId:     z.string().optional(),
  presignedUrl: z.string().optional(),
  uploadedAt:   z.string().optional(),
  errorMessage: z.string().optional(),
  documentTag:  z.string().optional(),
});
//("EPL" | "ELL" | "GL" | "ML" | "Cyber" | "Property" | "Crime" | "Auto" | "SA")
export const PRODUCT_LINE_VALUES = [
  'EPL', 'ELL', 'GL', 'ML', 'Cyber', 'Property', 'Crime', 'Auto', 'SA',
] as const;

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const newSubmissionSchema = z.object({
  type:                     z.enum(SUBMISSION_TYPES),
  accountId:                z.string().min(1, 'Account is required'),
  group:                    z.string().optional(),
  productLines:             z.array(z.enum(PRODUCT_LINE_VALUES)).min(1, 'Select at least one product line'),
  needByDate:               dateString,
  effectiveDate:            dateString,
  expirationDate:           dateString,
  brokerageId:              z.string().optional(),
  brokerContactId:          z.string().optional(),
  brokerEmail:              z.string().email().optional().or(z.literal('')),
  brokerPhone:              z.string().optional(),
  underwriterId:            z.string().optional(),
  underwritingSpecialistId: z.string().optional(),
  documents:                z.array(uploadedDocumentSchema),
}).refine(
  (data) => !data.needByDate || !data.effectiveDate
    || new Date(data.needByDate) <= new Date(data.effectiveDate),
  { message: 'Need-by date must be on or before effective date', path: ['effectiveDate'] },
).refine(
  (data) => !data.effectiveDate || !data.expirationDate
    || new Date(data.effectiveDate) < new Date(data.expirationDate),
  { message: 'Expiration must be after effective date', path: ['expirationDate'] },
);
