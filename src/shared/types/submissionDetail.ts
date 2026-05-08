import type { SubmissionPriority } from './submission';

export interface SubmissionIdentification {
  submissionId:    string;
  submissionType:  string;
  lineOfBusiness:  string;
  products:        string;
  priority:        SubmissionPriority;
}

export interface SubmissionDates {
  submitted:      string;
  effective:      string;
  expiration:     string;
  needBy:         string;
  decisionTarget: string;
}

export interface SubmissionRouting {
  stage:          string;
  stagePriority:  SubmissionPriority;
  underwriter:    string;
  assistantUw:    string;
  claimsAnalyst:  string;
  daysInQueue:    string;
}

export interface SubmissionPremiumDetail {
  expiring:        string;
  quoted:          string;
  bound:           string;
  indicatedChange: string;
  commissionRate:  string;
}

export interface SubmissionDecision {
  referralsOpen:    number;
  referralNote:     string;
  approvalsNeeded:  string;
  riskScore:        number;
  riskAppetiteNote: string;
  lossPropensity:   string;
  slaStatus:        string;
}

export interface SubmissionCompliance {
  applicationStatus:  string;
  applicationDate:    string;
  lossRunsStatus:     string;
  lossRunsNote:       string;
  financials:         string;
  cyberSupplemental:  string;
  ofacStatus:         string;
  ofacDate:           string;
}

export interface SubmissionMemberDetail {
  account:      string;
  memberNumber: string;
  segment:      string;
  enrollment:   string;
  memberSince:  string;
}

export interface SubmissionBrokerDetail {
  brokerage:          string;
  office:             string;
  officeId:           string;
  producerCode:       string;
  appointmentStatus:  string;
  appointmentNote:    string;
  ytdBound:           string;
  ytdHitRatio:        string;
}

export interface SubmissionBrokerContact {
  producer:   string;
  role:       string;
  permission: string;
  email:      string;
  phone:      string;
}

export interface SubmissionDetail {
  id:           string;
  identification: SubmissionIdentification;
  dates:          SubmissionDates;
  routing:        SubmissionRouting;
  premium:        SubmissionPremiumDetail;
  decision:       SubmissionDecision;
  compliance:     SubmissionCompliance;
  member:         SubmissionMemberDetail;
  broker:         SubmissionBrokerDetail;
  brokerContact:  SubmissionBrokerContact;
}

export interface SubmissionHero {
  id:              string;
  institutionName: string;
  memberNumber:    string;
  memberSince:     string;
  memberType:      string;
  enrollment:      string;
  location:        string;
  needByDate:      string;
  needByUrgency:   string;
  effectiveDate:   string;
  expiryDate:      string;
  expiringPremium: string;
  expiringNote:    string;
  quotedPremium:   string;
  quotedNote:      string;
  boundPremium:    string;
  boundNote:       string;
  lossRatio:       string;
  lossRatioNote:   string;
  brokerage:       string;
  brokerContact:   string;
  underwriter:     { name: string; title: string };
  uwSpecialist:    { name: string; title: string };
  productLines:    string[];
}

export interface CoverageLine {
  name:           string;
  limit:          string;
  aggregateLimit: string;
  retention:      string;
  premium:        string;
}

export interface LossHistoryRow {
  year:     string;
  claims:   number;
  incurred: string;
  ratio:    string;
  up:       boolean;
}
