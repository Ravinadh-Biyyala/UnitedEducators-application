import { submissionTypeLabels } from '@/theme/tokens';
import type { SubmissionType } from '@/shared/types';

const SUFFIX_PATTERNS: RegExp[] = [
  / Public Schools$/i,
  / Public School System$/i,
  / Unified School District$/i,
  / Charter Schools$/i,
  / School District$/i,
  / High School District$/i,
  / University$/i,
  / Academy$/i,
  / ISD$/i,
];

export function shortenAccountName(name: string): string {
  let out = name.trim();
  for (const pat of SUFFIX_PATTERNS) {
    out = out.replace(pat, '');
  }
  return out.trim();
}

interface GenerateNameArgs {
  accountName: string;
  type:        SubmissionType;
  year:        number;
}

export function generateSubmissionName({ accountName, type, year }: GenerateNameArgs): string {
  const shortName  = shortenAccountName(accountName);
  const typeSlug   = submissionTypeLabels[type].replace(/\s+/g, '-');
  return `${shortName}-${typeSlug}-${year}`;
}
