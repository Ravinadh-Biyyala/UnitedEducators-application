import type { MemberDetail } from '@/shared/types';

export const MOCK_MEMBER_DETAILS: Record<string, MemberDetail> = {
  'SUB-7829': {
    quickStats: {
      accountRecordType: 'Institution',
      memberNumber:      '473',
      physicalCity:      'Westport, CT',
      status:            'Active',
      memberSince:       '2014 · 12 yrs',
    },
    accountInfo: {
      accountName:          'Brookfield Day School',
      decPageName:          'Brookfield Day School',
      preferredAccountName: 'Brookfield Day',
      memberNumber:         '473',
      parentAccount:        '—',
      group:                '—',
      groupNumber:          '—',
      accountRecordType:    'Institution',
      accountSubType:       'Insured',
      memberStatus:         'Member',
      accountStatus:        'Active',
    },
    institutionProfile: {
      institutionType:         'K-12',
      subCategory:             'Private',
      boardingOptions:         'Day only · No boarding',
      underwritingTrack:       'Choice',
      intercollegiateFootball: 'N/A',
      educationSegment:        'Schools / Colleges',
      totalEnrollment:         '842',
      renewalType:             'Annual',
      budget:                  '$28,400,000',
      territory:               'Northeast',
    },
    addressInfo: {
      physical: {
        address1: '32 Riverside Avenue',
        address2: '—',
        city:     'Westport',
        state:    'CT',
        zip:      '06880',
        county:   'Fairfield',
        country:  'United States',
      },
      copyFromPhysical: true,
      mailing: {
        address1: '32 Riverside Avenue',
        address2: '—',
        city:     'Westport',
        state:    'CT',
        zip:      '06880',
        country:  'United States',
      },
    },
  },
};

export function getMockMemberDetail(id: string): MemberDetail {
  return MOCK_MEMBER_DETAILS[id] ?? MOCK_MEMBER_DETAILS['SUB-7829'];
}
