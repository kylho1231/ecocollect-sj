import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./client";
import { CollectionSchedule, Complaint, OperationalMetrics } from "@/types";

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
  const q = query(complaintsRef, limit(20));

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
          purokName: data.purokId || "Purok Centro",
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
