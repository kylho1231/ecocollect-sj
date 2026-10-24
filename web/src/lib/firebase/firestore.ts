import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./client";
import {
  CollectionSchedule,
  Complaint,
  OperationalMetrics,
  CollectorAccount,
  TruckTelemetry,
  CollectionPit,
  WasteLogEntry,
} from "@/types";

// ==========================================
// 1. Schedules Real-time Subscriptions & Actions
// ==========================================

export function subscribeToSchedules(
  callback: (schedules: CollectionSchedule[]) => void,
  barangayId?: string
) {
  const schedulesRef = collection(db, "collection_schedules");
  const q = barangayId
    ? query(schedulesRef, where("barangayId", "==", barangayId))
    : query(schedulesRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const results: CollectionSchedule[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          barangayId: data.barangayId || "",
          barangayName: data.barangayName || "San Jose de Buenavista",
          wasteCategory: data.wasteCategory || "BIODEGRADABLE",
          dayOfWeek: data.dayOfWeek ? getDayName(data.dayOfWeek) : "Monday",
          startTime: data.startTime || "06:00 AM",
          endTime: data.endTime || "09:00 AM",
          verificationStatus: data.verificationStatus || "PENDING_VERIFICATION",
          officialReference: data.officialReference || undefined,
          verifiedByUserName: data.verifiedByUserName || undefined,
          verifiedTimestamp: data.verifiedTimestamp || undefined,
          notes: data.notes || "",
        });
      });
      callback(results);
    },
    (err) => {
      console.warn("Firestore schedule subscription error:", err.message);
    }
  );
}

export async function verifyScheduleInFirestore(
  scheduleId: string,
  officialReference: string,
  officerName: string
) {
  const scheduleDocRef = doc(db, "collection_schedules", scheduleId);
  await updateDoc(scheduleDocRef, {
    verificationStatus: "VERIFIED",
    officialReference: officialReference,
    verifiedByUserName: officerName,
    verifiedTimestamp: Date.now(),
  });
}

// ==========================================
// 2. Complaints Real-time Subscriptions & Actions
// ==========================================

export function subscribeToComplaints(
  callback: (complaints: Complaint[]) => void
) {
  const complaintsRef = collection(db, "complaints");
  const q = query(complaintsRef, limit(30));

  return onSnapshot(
    q,
    (snapshot) => {
      const results: Complaint[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          trackingNumber: data.trackingNumber || `EC-${doc.id.slice(0, 8)}`,
          residentDisplayName: data.residentDisplayName || "Resident",
          barangayId: data.barangayId || "funda_dalipe",
          barangayName: data.barangayName || "Barangay Funda-Dalipe",
          purokName: data.purokId || data.purokName || "Purok Centro",
          category: data.category || "General Waste Issue",
          description: data.description || "",
          status: data.status || "SUBMITTED",
          createdAt: data.createdAtEpochMillis
            ? new Date(data.createdAtEpochMillis).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recently",
        });
      });
      callback(results);
    },
    (err) => {
      console.warn("Firestore complaint subscription error:", err.message);
    }
  );
}

export async function submitResidentComplaint(complaint: {
  residentDisplayName: string;
  barangayId: string;
  barangayName: string;
  purokName: string;
  category: string;
  description: string;
}) {
  const complaintsRef = collection(db, "complaints");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const trackingNumber = `EC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomSuffix}`;

  const docRef = await addDoc(complaintsRef, {
    ...complaint,
    trackingNumber,
    status: "SUBMITTED",
    createdAtEpochMillis: Date.now(),
  });

  return { id: docRef.id, trackingNumber };
}

export async function updateComplaintStatusInFirestore(
  complaintId: string,
  newStatus: "UNDER_REVIEW" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
  notes?: string
) {
  const complaintDocRef = doc(db, "complaints", complaintId);
  const updates: any = { status: newStatus };
  if (notes) updates.resolutionNotes = notes;
  await updateDoc(complaintDocRef, updates);
}

// ==========================================
// 3. Live Trucks Telemetry & Collector GPS Sync
// ==========================================

export function subscribeToLiveTrucks(
  callback: (trucks: TruckTelemetry[]) => void
) {
  const trucksRef = collection(db, "trucks");
  return onSnapshot(
    trucksRef,
    (snapshot) => {
      const results: TruckTelemetry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          driverName: data.driverName || "MENRO Crew",
          plateNumber: data.plateNumber || "SJB-0000",
          assignedBarangayId: data.assignedBarangayId || "funda_dalipe",
          assignedBarangayName: data.assignedBarangayName || "Funda-Dalipe",
          lat: typeof data.lat === "number" ? data.lat : 10.7480,
          lng: typeof data.lng === "number" ? data.lng : 121.9442,
          speed: data.speed || 0,
          heading: data.heading || 0,
          status: data.status || "IDLE",
          currentStopName: data.currentStopName || "Standby at Dispatch Depot",
          wasteStream: data.wasteStream || "Biodegradable",
          updatedAt: data.updatedAt || "Just now",
          lastUpdatedEpoch: data.lastUpdatedEpoch || Date.now(),
        });
      });
      callback(results);
    },
    (err) => {
      console.warn("Firestore live trucks subscription error:", err.message);
    }
  );
}

export async function updateTruckTelemetry(
  truckId: string,
  data: Partial<TruckTelemetry>
) {
  const truckRef = doc(db, "trucks", truckId);
  await setDoc(
    truckRef,
    {
      ...data,
      lastUpdatedEpoch: Date.now(),
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    },
    { merge: true }
  );
}

// ==========================================
// 4. Collection Pits & Designated Bins
// ==========================================

export function subscribeToCollectionPits(
  callback: (pits: CollectionPit[]) => void,
  barangayId?: string
) {
  const pitsRef = collection(db, "collection_pits");
  const q = barangayId
    ? query(pitsRef, where("barangayId", "==", barangayId))
    : query(pitsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const results: CollectionPit[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          name: data.name || "Designated Waste Bin",
          barangayId: data.barangayId || "funda_dalipe",
          purok: data.purok || "Purok Centro",
          lat: typeof data.lat === "number" ? data.lat : 10.7482,
          lng: typeof data.lng === "number" ? data.lng : 121.9445,
          status: data.status || "PENDING",
          wasteCategory: data.wasteCategory || "Biodegradable",
          estimatedVolume: data.estimatedVolume || "100 kg",
        });
      });
      callback(results);
    },
    (err) => {
      console.warn("Firestore collection pits error:", err.message);
    }
  );
}

export async function updatePitStatus(
  pitId: string,
  status: "PENDING" | "COLLECTING_NOW" | "COMPLETED"
) {
  const pitRef = doc(db, "collection_pits", pitId);
  await updateDoc(pitRef, { status });
}

// ==========================================
// 5. Collector Accounts & Barangay Assignment Matrix
// ==========================================

export function subscribeToCollectors(
  callback: (collectors: CollectorAccount[]) => void
) {
  const collectorsRef = collection(db, "collectors");
  return onSnapshot(
    collectorsRef,
    (snapshot) => {
      const results: CollectorAccount[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          employeeId: data.employeeId || "MENRO-COL-000",
          fullName: data.fullName || "Collector",
          phone: data.phone || "",
          assignedBarangayId: data.assignedBarangayId || "funda_dalipe",
          assignedBarangayName: data.assignedBarangayName || "Funda-Dalipe",
          assignedTruckPlate: data.assignedTruckPlate || "SJB-0412",
          pin: data.pin || "1234",
          status: data.status || "ACTIVE",
          createdAt: data.createdAt || Date.now(),
          lastActiveEpoch: data.lastActiveEpoch,
        });
      });
      callback(results);
    },
    (err) => {
      console.warn("Firestore collectors error:", err.message);
    }
  );
}

export async function createCollectorAccountInFirestore(
  account: Omit<CollectorAccount, "id" | "createdAt">
) {
  const collectorsRef = collection(db, "collectors");
  const docRef = await addDoc(collectorsRef, {
    ...account,
    createdAt: Date.now(),
    status: "ACTIVE",
  });
  return docRef.id;
}

export async function assignCollectorToBarangay(
  collectorId: string,
  barangayId: string,
  barangayName: string,
  truckPlate: string
) {
  const collectorRef = doc(db, "collectors", collectorId);
  await updateDoc(collectorRef, {
    assignedBarangayId: barangayId,
    assignedBarangayName: barangayName,
    assignedTruckPlate: truckPlate,
  });

  // Also update corresponding truck assignment if truck document exists
  const trucksRef = collection(db, "trucks");
  const q = query(trucksRef, where("plateNumber", "==", truckPlate));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const truckDoc = snap.docs[0];
    await updateDoc(truckDoc.ref, {
      assignedBarangayId: barangayId,
      assignedBarangayName: barangayName,
    });
  }
}

// ==========================================
// 6. Waste Volume Documentation & Manifest Logs
// ==========================================

export function subscribeToWasteLogs(
  callback: (logs: WasteLogEntry[]) => void,
  limitCount = 50
) {
  const logsRef = collection(db, "waste_logs");
  const q = query(logsRef, orderBy("timestamp", "desc"), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const results: WasteLogEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          stopId: data.stopId || "",
          stopName: data.stopName || "Community Collection Pit",
          barangayId: data.barangayId || "funda_dalipe",
          barangayName: data.barangayName || "Barangay Funda-Dalipe",
          collectorId: data.collectorId || "",
          collectorName: data.collectorName || "Assigned Crew",
          truckPlate: data.truckPlate || "SJB-0412",
          wasteCategory: data.wasteCategory || "BIODEGRADABLE",
          weightKg: Number(data.weightKg) || 0,
          bagCount: Number(data.bagCount) || 1,
          notes: data.notes || "",
          refusalReason: data.refusalReason || undefined,
          timestamp: data.timestamp || Date.now(),
          dateString: data.dateString || new Date().toLocaleDateString(),
        });
      });
      callback(results);
    },
    (err) => {
      console.warn("Firestore waste logs error:", err.message);
    }
  );
}

export async function logWasteCollectionInFirestore(
  entry: Omit<WasteLogEntry, "id" | "timestamp" | "dateString">
) {
  const logsRef = collection(db, "waste_logs");
  const now = Date.now();
  const dateString = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const docRef = await addDoc(logsRef, {
    ...entry,
    timestamp: now,
    dateString,
  });

  return docRef.id;
}

// Helper to convert day numbers to text
function getDayName(day: number | string): string {
  if (typeof day === "string") return day;
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day % 7] || "Monday";
}
