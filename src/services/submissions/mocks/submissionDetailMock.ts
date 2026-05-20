import type { SubmissionDetail } from '@/shared/types';

export const MOCK_SUBMISSION_DETAILS: Record<string, SubmissionDetail> = {
  'SUB-7829': {
    id: 'SUB-7829',
    identification: {
      submissionId:   'SUB-7829',
      submissionType: 'Renewal',
      lineOfBusiness: 'GL · PL · ML',
      products:       'Educators Legal Liability',
      priority:       'High',
    },
    dates: {
      submitted:      'Apr 14, 2026',
      effective:      'Jun 1, 2026',
      expiration:     'Jun 1, 2027',
      needBy:         'Apr 28, 2026',
      decisionTarget: 'Apr 26, 2026',
    },
    routing: {
      stage:         'Needs review',
      stagePriority: 'Medium',
      underwriter:   'Maya Khanna',
      assistantUw:   'Devon Carter',
      claimsAnalyst: 'Anika Shah',
      daysInQueue:   '11 days',
    },
    premium: {
      expiring:        '$132,400',
      quoted:          '$142,800',
      bound:           '—',
      indicatedChange: '+7.8%',
      commissionRate:  '12%',
    },
    decision: {
      referralsOpen:    1,
      referralNote:     '(manager notify)',
      approvalsNeeded:  '1 of 4',
      riskScore:        82,
      riskAppetiteNote: '· In appetite',
      lossPropensity:   'Medium',
      slaStatus:        '7 days · at risk',
    },
    compliance: {
      applicationStatus: 'On file',
      applicationDate:   'Apr 14',
      lossRunsStatus:    '5-yr',
      lossRunsNote:      '· validated',
      financials:        'On file',
      cyberSupplemental: 'Missing',
      ofacStatus:        'Cleared',
      ofacDate:          'Apr 14',
    },
    member: {
      account:      'Brookfield Day School',
      memberNumber: '473',
      segment:      'K-12 · Private · Day',
      enrollment:   '842 students',
      memberSince:  'Aug 15, 2019',
    },
    broker: {
      brokerage:         'Marsh McLennan Agency',
      office:            'Stamford, CT',
      officeId:          'ID 10591',
      producerCode:      'MMA-NE-0427',
      appointmentStatus: 'Active',
      appointmentNote:   '· Resident CT',
      ytdBound:          '$4.2M',
      ytdHitRatio:       '87% hit ratio',
    },
    brokerContact: {
      producer:   'Tessa Owens',
      role:       'Producer of record',
      permission: 'Full access · Bind',
      email:      't.owens@mma.com',
      phone:      '(203) 555-1142',
    },
  },
};

export function getMockSubmissionDetail(id: string): SubmissionDetail {
  return MOCK_SUBMISSION_DETAILS[id] ?? MOCK_SUBMISSION_DETAILS['SUB-7829'];
}
