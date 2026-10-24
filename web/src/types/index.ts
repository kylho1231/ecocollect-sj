export type VerificationStatus =
  | "VERIFIED"
  | "PENDING_VERIFICATION"
  | "OUTDATED"
  | "DEMO";

export type WasteCategory =
  | "BIODEGRADABLE"
  | "RECYCLABLE"
  | "RESIDUAL"
  | "SPECIAL";

export interface Barangay {
  id: string;
  name: string;
  isPilot: boolean;
  purokCount: number;
}

export interface CollectionSchedule {
  id: string;
  barangayId: string;
  barangayName: string;
  purokNames?: string[];
  wasteCategory: WasteCategory;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  verificationStatus: VerificationStatus;
  officialReference?: string;
  verifiedByUserName?: string;
  verifiedTimestamp?: number;
  notes: string;
}

export interface Complaint {
  id: string;
  trackingNumber: string;
  residentDisplayName: string;
  barangayId: string;
  barangayName: string;
  purokName: string;
  category: string;
  description: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
}

export interface OperationalMetrics {
  activeTrucks: number;
  completedStopsToday: number;
  totalPlannedStopsToday: number;
  pendingScheduleVerifications: number;
  openComplaints: number;
  verifiedBarangaysCount: number;
}
