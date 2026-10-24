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
  totalWasteCollectedKg: number;
}

export interface CollectorAccount {
  id: string;
  employeeId: string;
  fullName: string;
  phone: string;
  assignedBarangayId: string;
  assignedBarangayName: string;
  assignedTruckPlate: string;
  pin: string;
  status: "ACTIVE" | "INACTIVE" | "ON_DUTY";
  createdAt: number;
  lastActiveEpoch?: number;
}

export interface TruckTelemetry {
  id: string;
  driverName: string;
  plateNumber: string;
  assignedBarangayId: string;
  assignedBarangayName: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  status: "IDLE" | "EN_ROUTE" | "PICKING_UP" | "COMPLETED";
  currentStopName: string;
  wasteStream: string;
  updatedAt: string;
  lastUpdatedEpoch: number;
}

export interface CollectionPit {
  id: string;
  name: string;
  barangayId: string;
  purok: string;
  lat: number;
  lng: number;
  status: "PENDING" | "COLLECTING_NOW" | "COMPLETED";
  wasteCategory: string;
  estimatedVolume: string;
}

export interface WasteLogEntry {
  id: string;
  stopId: string;
  stopName: string;
  barangayId: string;
  barangayName: string;
  collectorId: string;
  collectorName: string;
  truckPlate: string;
  wasteCategory: WasteCategory;
  weightKg: number;
  bagCount: number;
  notes?: string;
  refusalReason?: string;
  timestamp: number;
  dateString: string;
}

