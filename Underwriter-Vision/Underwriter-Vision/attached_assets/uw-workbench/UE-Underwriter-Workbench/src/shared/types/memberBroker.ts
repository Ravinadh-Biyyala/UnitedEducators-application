export interface MemberQuickStats {
  accountRecordType: string;
  memberNumber:      string;
  physicalCity:      string;
  status:            string;
  memberSince:       string;
}

export interface MemberAccountInfo {
  accountName:          string;
  decPageName:          string;
  preferredAccountName: string;
  memberNumber:         string;
  parentAccount:        string;
  group:                string;
  groupNumber:          string;
  accountRecordType:    string;
  accountSubType:       string;
  memberStatus:         string;
  accountStatus:        string;
}

export interface MemberInstitutionProfile {
  institutionType:          string;
  subCategory:              string;
  boardingOptions:          string;
  underwritingTrack:        string;
  intercollegiateFootball:  string;
  educationSegment:         string;
  totalEnrollment:          string;
  renewalType:              string;
  budget:                   string;
  territory:                string;
}

export interface AddressBlock {
  address1:   string;
  address2:   string;
  city:       string;
  state:      string;
  zip:        string;
  county:     string;
  country:    string;
}

export interface MemberAddressInfo {
  physical:           AddressBlock;
  copyFromPhysical:   boolean;
  mailing:            Omit<AddressBlock, 'county'>;
}

export interface MemberDetail {
  quickStats:          MemberQuickStats;
  accountInfo:         MemberAccountInfo;
  institutionProfile:  MemberInstitutionProfile;
  addressInfo:         MemberAddressInfo;
}

// ── Brokerage ──────────────────────────────────────────────────────────────

export interface BrokerageQuickStats {
  accountRecordType: string;
  accountId:         string;
  physicalCity:      string;
  physicalState:     string;
  parentAccount:     string;
}

export interface BrokerageAccountInfo {
  accountName:          string;
  preferredAccountName: string;
  parentAccount:        string;
  accountRecordType:    string;
  accountSubType:       string;
  accountId:            string;
  accountStatus:        string;
  phone:                string;
  fax:                  string;
}

export interface BrokerageAddressInfo {
  physical: AddressBlock;
  mailing:  Omit<AddressBlock, 'county'>;
}

export interface BrokerageDetail {
  quickStats:  BrokerageQuickStats;
  accountInfo: BrokerageAccountInfo;
  addressInfo: BrokerageAddressInfo;
}

// ── Broker contacts ────────────────────────────────────────────────────────

export interface BrokerContact {
  name:      string;
  phone:     string;
  email:     string;
  access:    string;
  roles:     string[];
  highlight: boolean;
}
