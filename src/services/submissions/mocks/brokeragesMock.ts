import type { BrokerageLookup } from '@/shared/types';

export const MOCK_BROKERAGES: BrokerageLookup[] = [
  {
    id: 'brk-001', name: 'Marsh McLennan',
    contacts: [
      { id: 'bc-001', brokerageId: 'brk-001', name: 'Sarah Goldberg',  email: 'sgoldberg@marshmclennan.com',  phone: '(212) 555-0101' },
      { id: 'bc-002', brokerageId: 'brk-001', name: 'David Park',      email: 'dpark@marshmclennan.com',      phone: '(212) 555-0102' },
      { id: 'bc-003', brokerageId: 'brk-001', name: 'Linda Chen',      email: 'lchen@marshmclennan.com',      phone: '(212) 555-0103' },
    ],
  },
  {
    id: 'brk-002', name: 'Willis Towers Watson',
    contacts: [
      { id: 'bc-004', brokerageId: 'brk-002', name: 'Michael Roberts', email: 'mroberts@wtw.com',             phone: '(312) 555-0201' },
      { id: 'bc-005', brokerageId: 'brk-002', name: 'Jennifer Wu',     email: 'jwu@wtw.com',                  phone: '(312) 555-0202' },
    ],
  },
  {
    id: 'brk-003', name: 'Gallagher Education',
    contacts: [
      { id: 'bc-006', brokerageId: 'brk-003', name: 'Robert Diaz',     email: 'rdiaz@gallagher.com',          phone: '(630) 555-0301' },
      { id: 'bc-007', brokerageId: 'brk-003', name: 'Amanda Foster',   email: 'afoster@gallagher.com',        phone: '(630) 555-0302' },
      { id: 'bc-008', brokerageId: 'brk-003', name: 'Kevin Patel',     email: 'kpatel@gallagher.com',         phone: '(630) 555-0303' },
    ],
  },
  {
    id: 'brk-004', name: 'Lockton Companies',
    contacts: [
      { id: 'bc-009', brokerageId: 'brk-004', name: 'Patricia Nguyen', email: 'pnguyen@lockton.com',          phone: '(816) 555-0401' },
      { id: 'bc-010', brokerageId: 'brk-004', name: 'Thomas Brown',    email: 'tbrown@lockton.com',           phone: '(816) 555-0402' },
    ],
  },
  {
    id: 'brk-005', name: 'Alliant Insurance',
    contacts: [
      { id: 'bc-011', brokerageId: 'brk-005', name: 'Rachel Silverman',email: 'rsilverman@alliant.com',       phone: '(949) 555-0501' },
      { id: 'bc-012', brokerageId: 'brk-005', name: 'James Carter',    email: 'jcarter@alliant.com',          phone: '(949) 555-0502' },
      { id: 'bc-013', brokerageId: 'brk-005', name: 'Sophia Martinez', email: 'smartinez@alliant.com',        phone: '(949) 555-0503' },
    ],
  },
  {
    id: 'brk-006', name: 'Arthur J. Gallagher',
    contacts: [
      { id: 'bc-014', brokerageId: 'brk-006', name: 'Daniel Kim',      email: 'dkim@ajg.com',                 phone: '(630) 555-0601' },
      { id: 'bc-015', brokerageId: 'brk-006', name: 'Emily Johnson',   email: 'ejohnson@ajg.com',             phone: '(630) 555-0602' },
    ],
  },
  {
    id: 'brk-007', name: 'Aon plc',
    contacts: [
      { id: 'bc-016', brokerageId: 'brk-007', name: 'Christopher Lee', email: 'clee@aon.com',                 phone: '(312) 555-0701' },
      { id: 'bc-017', brokerageId: 'brk-007', name: 'Olivia Thompson', email: 'othompson@aon.com',            phone: '(312) 555-0702' },
    ],
  },
  {
    id: 'brk-008', name: 'HUB International',
    contacts: [
      { id: 'bc-018', brokerageId: 'brk-008', name: 'Brian Wallace',   email: 'bwallace@hubinternational.com',phone: '(312) 555-0801' },
      { id: 'bc-019', brokerageId: 'brk-008', name: 'Diana Hayes',     email: 'dhayes@hubinternational.com',  phone: '(312) 555-0802' },
    ],
  },
];
