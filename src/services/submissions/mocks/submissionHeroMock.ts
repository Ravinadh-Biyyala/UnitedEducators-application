import type { SubmissionHero } from '@/shared/types';

export const MOCK_SUBMISSION_HEROES: Record<string, SubmissionHero> = {
  'SUB-7829': {
    id:              'SUB-7829',
    institutionName: 'Brookfield Day School',
    memberNumber:    '473',
    memberSince:     '2014',
    memberType:      'Private K-12',
    enrollment:      '842 students',
    location:        'Westport, CT',
    needByDate:      'Apr 28, 2026',
    needByUrgency:   '7 days',
    effectiveDate:   'Jun 1, 2026',
    expiryDate:      'Jun 1, 2027',
    expiringPremium: '$132,400',
    expiringNote:    '2025 policy',
    quotedPremium:   '$142,800',
    quotedNote:      '+7.8% indicated',
    boundPremium:    '—',
    boundNote:       'Not yet bound',
    lossRatio:       '58%',
    lossRatioNote:   '2 open claims',
    brokerage:       'Marsh McLennan',
    brokerContact:   'T. Owens',
    underwriter:     { name: 'Maya Khanna',  title: 'Sr. UW · Northeast' },
    uwSpecialist:    { name: 'Devon Carter', title: 'Assistant UW'        },
    productLines:    ['epl', 'ell', 'gl', 'cyber'],
  },
};

export function getMockSubmissionHero(id: string): SubmissionHero {
  return MOCK_SUBMISSION_HEROES[id] ?? MOCK_SUBMISSION_HEROES['SUB-7829'];
}
