import type { CoverageLine } from '@/shared/types';

export const MOCK_COVERAGE_LINES: Record<string, CoverageLine[]> = {
  'SUB-7829': [
    { name: 'General Liability',         limit: '$5,000,000',  aggregateLimit: '$15,000,000', retention: '$100,000', premium: '$28,400' },
    { name: 'Property – Buildings',      limit: '$42,000,000', aggregateLimit: '$42,000,000', retention: '$250,000', premium: '$51,200' },
    { name: 'Student Accident',          limit: '$500,000',    aggregateLimit: '$2,000,000',  retention: '$50,000',  premium: '$12,800' },
    { name: 'Educators Legal Liability', limit: '$3,000,000',  aggregateLimit: '$9,000,000',  retention: '$100,000', premium: '$19,600' },
  ],
};

export const DEFAULT_COVERAGE_LINES: CoverageLine[] = MOCK_COVERAGE_LINES['SUB-7829'];
