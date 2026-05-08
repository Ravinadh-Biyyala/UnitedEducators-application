import type { BrokerageDetail } from '@/shared/types';

export const MOCK_BROKERAGE_DETAILS: Record<string, BrokerageDetail> = {
  'SUB-7829': {
    quickStats: {
      accountRecordType: 'Agency · Brokerage',
      accountId:         '10591',
      physicalCity:      'New York',
      physicalState:     'NY',
      parentAccount:     'Marsh & McLennan Companies',
    },
    accountInfo: {
      accountName:          'Marsh McLennan Agency',
      preferredAccountName: 'Marsh McLennan',
      parentAccount:        'Marsh & McLennan Companies',
      accountRecordType:    'Agency · Brokerage',
      accountSubType:       'Brokerage',
      accountId:            '10591',
      accountStatus:        'Active',
      phone:                '(203) 555-1100',
      fax:                  '(203) 555-1109',
    },
    addressInfo: {
      physical: {
        address1: '1166 Ave of the Americas',
        address2: 'Floor 4',
        city:     'New York',
        state:    'NY',
        zip:      '10036-2708',
        county:   '—',
        country:  'United States',
      },
      mailing: {
        address1: '1166 Ave of the Americas',
        address2: 'Floor 4',
        city:     'New York',
        state:    'NY',
        zip:      '10036-2708',
        country:  'United States',
      },
    },
  },
};

export function getMockBrokerageDetail(id: string): BrokerageDetail {
  return MOCK_BROKERAGE_DETAILS[id] ?? MOCK_BROKERAGE_DETAILS['SUB-7829'];
}
