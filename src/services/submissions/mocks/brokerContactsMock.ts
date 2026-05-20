import type { BrokerContact } from '@/shared/types';

export const MOCK_BROKER_CONTACTS: Record<string, BrokerContact[]> = {
  'SUB-7829': [
    {
      name:      'Tyler Owens',
      phone:     '(283) 555-1142',
      email:     'towens@marshmma.com',
      access:    'All Products',
      roles:     ['Contact Manager', 'GL Producer', 'PL Producer', 'ACK Memo'],
      highlight: false,
    },
    {
      name:      'Ashleigh Choi',
      phone:     '(212) 555-2114',
      email:     'achoi@marshmma.com',
      access:    'All Products',
      roles:     ['Contact Manager', 'GL CSR', 'PL CSR', 'ML CSR'],
      highlight: false,
    },
    {
      name:      'Devon Carter',
      phone:     '(212) 555-3098',
      email:     'dcarter@marshmma.com',
      access:    'All Products',
      roles:     ['GL CSR', 'PL CSR'],
      highlight: true,
    },
    {
      name:      'Sandra Rios',
      phone:     '(212) 555-4471',
      email:     'srios@marshmma.com',
      access:    'GL · PL',
      roles:     ['All LOB Claims Broker Contact'],
      highlight: false,
    },
  ],
};

export const DEFAULT_BROKER_CONTACTS: BrokerContact[] = MOCK_BROKER_CONTACTS['SUB-7829'];
