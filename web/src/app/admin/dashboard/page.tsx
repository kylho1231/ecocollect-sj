"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Building,
  ShieldAlert,
  Search,
  Check,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  FileSignature,
} from "lucide-react";
import { CollectionSchedule, Complaint, OperationalMetrics } from "@/types";
import {
  subscribeToSchedules,
  subscribeToComplaints,
  verifyScheduleInFirestore,
  updateComplaintStatusInFirestore,
} from "@/lib/firebase/firestore";

const INITIAL_SCHEDULES: CollectionSchedule[] = [
  {
    id: "sched_fd_bio",
    barangayId: "funda_dalipe",
    barangayName: "Funda-Dalipe",
    wasteCategory: "BIODEGRADABLE",
    dayOfWeek: "Monday",
    startTime: "06:00 AM",
    endTime: "09:00 AM",
    verificationStatus: "PENDING_VERIFICATION",
    notes: "Submitted by Brgy. Captain for approval.",
  },
  {
    id: "sched_fd_rec",
    barangayId: "funda_dalipe",
    barangayName: "Funda-Dalipe",
    wasteCategory: "RECYCLABLE",
    dayOfWeek: "Wednesday",
    startTime: "06:00 AM",
    endTime: "09:00 AM",
    verificationStatus: "PENDING_VERIFICATION",
    notes: "Recyclables collection timetable.",
  },
  {
    id: "sched_atabay_01",
    barangayId: "atabay",
    barangayName: "Atabay",
    wasteCategory: "BIODEGRADABLE",
    dayOfWeek: "Tuesday",
    startTime: "07:00 AM",
    endTime: "10:00 AM",
    verificationStatus: "VERIFIED",
    officialReference: "MENRO-RES-2026-088",
    verifiedByUserName: "Engr. M. Delgado (MENRO)",
    notes: "Official schedule validated per Executive Order No. 12.",
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "cmp_01",
    trackingNumber: "EC-20261024-8142",
    residentDisplayName: "Resident",
    barangayId: "funda_dalipe",
    barangayName: "Funda-Dalipe",
    purokName: "Purok Centro",
    category: "Missed Garbage Collection",
    description: "Biodegradable bins along crossing were not emptied during morning route.",
    status: "UNDER_REVIEW",
    createdAt: "Today at 08:30 AM",
  },
  {
    id: "cmp_02",
    trackingNumber: "EC-20261024-3991",
    residentDisplayName: "Resident",
    barangayId: "funda_dalipe",
    barangayName: "Funda-Dalipe",
    purokName: "Purok Baybay",
    category: "Uncollected / Leftover Waste",
    description: "Leftover construction rubble dumped beside designated collection point.",
    status: "ASSIGNED",
    createdAt: "Today at 07:15 AM",
  },
];

export default function AdminDashboardPage() {
  const [schedules, setSchedules] = useState<CollectionSchedule[]>(INITIAL_SCHEDULES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [selectedScheduleForApproval, setSelectedScheduleForApproval] = useState<CollectionSchedule | null>(null);
  const [execReferenceDoc, setExecReferenceDoc] = useState("MENRO-EO-2026-004");
  const [officerName, setOfficerName] = useState("MENRO Administrator");
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");

  useEffect(() => {
    const unsubSchedules = subscribeToSchedules((liveSchedules) => {
      if (liveSchedules.length > 0) setSchedules(liveSchedules);
    });

    const unsubComplaints = subscribeToComplaints((liveComplaints) => {
      if (liveComplaints.length > 0) setComplaints(liveComplaints);
    });

    return () => {
      unsubSchedules();
      unsubComplaints();
    };
  }, []);

  // Compute live operational metrics
  const pendingApprovalsCount = schedules.filter((s) => s.verificationStatus === "PENDING_VERIFICATION").length;
  const verifiedCount = schedules.filter((s) => s.verificationStatus === "VERIFIED").length;
  const openComplaintsCount = complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;

  const handleConfirmVerification = async () => {
    if (!selectedScheduleForApproval) return;
    setIsPublishing(true);

    try {
      await verifyScheduleInFirestore(
        selectedScheduleForApproval.id,
        execReferenceDoc || "MENRO-CONFIRMED",
        officerName || "Authorized Officer"
      );
      // Optimistic update
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedScheduleForApproval.id
            ? {
                ...s,
                verificationStatus: "VERIFIED",
                officialReference: execReferenceDoc,
                verifiedByUserName: officerName,
                verifiedTimestamp: Date.now(),
              }
            : s
        )
      );
      setSelectedScheduleForApproval(null);
    } catch (e) {
      console.error("Failed to verify in Firestore:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAdvanceComplaintStatus = async (complaintId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "SUBMITTED"
        ? "UNDER_REVIEW"
        : currentStatus === "UNDER_REVIEW"
        ? "ASSIGNED"
        : currentStatus === "ASSIGNED"
        ? "RESOLVED"
        : "CLOSED";

    try {
      await updateComplaintStatusInFirestore(complaintId, nextStatus as any);
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: nextStatus as any } : c))
      );
    } catch (e) {
      console.error("Failed to update complaint in Firestore:", e);
    }
  };

  const displayedSchedules = schedules.filter((s) => {
    if (activeTab === "PENDING") return s.verificationStatus === "PENDING_VERIFICATION";
    if (activeTab === "VERIFIED") return s.verificationStatus === "VERIFIED";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#11263A] text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <img
            src="/icon.svg"
            alt="EcoCollect SJ Logo"
            className="h-10 w-10 rounded-xl shadow-sm bg-white p-0.5"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight">EcoCollect SJ — MENRO Administration</h1>
            <p className="text-xs text-slate-300">San Jose de Buenavista Municipal Environment Office</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white flex items-center space-x-1"
          >
            <span>Public Portal</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <div className="bg-emerald-800/80 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-700">
            Role: Municipal Officer
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-[#147D64] rounded-xl">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Crews</div>
              <div className="text-2xl font-black text-slate-900">4 Trucks</div>
              <div className="text-xs text-emerald-600 font-medium">Servicing routes</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FileCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</div>
              <div className="text-2xl font-black text-amber-600">{pendingApprovalsCount}</div>
              <div className="text-xs text-amber-700 font-medium">Awaiting MENRO review</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <CalendarCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Timetables</div>
              <div className="text-2xl font-black text-slate-900">{verifiedCount}</div>
              <div className="text-xs text-sky-600 font-medium">Published to citizens</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Reports</div>
              <div className="text-2xl font-black text-rose-600">{openComplaintsCount}</div>
              <div className="text-xs text-rose-700 font-medium">Citizen complaints</div>
            </div>
          </div>
        </div>

        {/* Schedule Verification Studio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#11263A]">
                Schedule Verification & Publication Studio
              </h2>
              <p className="text-xs text-slate-500">
                Official Government Control: Draft timetables require authorized signature & executive reference before appearing as official to residents.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "ALL" ? "bg-white text-[#11263A] shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({schedules.length})
              </button>
              <button
                onClick={() => setActiveTab("PENDING")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "PENDING" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({pendingApprovalsCount})
              </button>
              <button
                onClick={() => setActiveTab("VERIFIED")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "VERIFIED" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Verified ({verifiedCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Barangay</th>
                  <th className="py-3 px-4">Waste Stream</th>
                  <th className="py-3 px-4">Window</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Reference Document</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Official Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedSchedules.map((s) => {
                  const isVerified = s.verificationStatus === "VERIFIED";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {s.barangayName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {s.wasteCategory}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <span className="font-semibold text-slate-800">{s.dayOfWeek}</span> ({s.startTime} - {s.endTime})
                      </td>
                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle className="h-3 w-3" />
                            <span>VERIFIED OFFICIAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <ShieldAlert className="h-3 w-3" />
                            <span>PENDING APPROVAL</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                        {s.officialReference || <span className="text-slate-400 italic">None (Awaiting EO)</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isVerified ? (
                          <span className="text-xs text-emerald-600 font-semibold inline-flex items-center space-x-1">
                            <Check className="h-3.5 w-3.5" />
                            <span>Live on Portal</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedScheduleForApproval(s)}
                            className="bg-[#147D64] hover:bg-[#0C5241] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center space-x-1"
                          >
                            <FileSignature className="h-3 w-3" />
                            <span>Approve & Sign</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citizen Waste Reports Kanban */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#11263A]">
                Citizen Waste Reports & Missed Collections
              </h2>
              <p className="text-xs text-slate-500">
                Incoming reports submitted via the EcoCollect SJ Android resident app.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="font-mono text-xs font-bold text-[#147D64] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {c.trackingNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      c.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : c.status === "ASSIGNED"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-sky-50 text-sky-700 border-sky-200"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{c.category}</h3>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    {c.barangayName} ({c.purokName})
                  </span>
                  {c.status !== "RESOLVED" && c.status !== "CLOSED" && (
                    <button
                      onClick={() => handleAdvanceComplaintStatus(c.id, c.status)}
                      className="text-xs font-bold text-[#147D64] hover:underline"
                    >
                      Advance Status &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Sign-off Modal */}
      {selectedScheduleForApproval && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-[#147D64]">
                  <FileSignature className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#11263A]">
                  Verify & Publish Schedule
                </h3>
              </div>
              <button
                onClick={() => setSelectedScheduleForApproval(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              You are certifying this collection timetable as <strong>OFFICIAL</strong> for Barangay {selectedScheduleForApproval.barangayName}. Residents will see this timetable as verified immediately.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Executive Order / Resolution Reference:
                </label>
                <input
                  type="text"
                  value={execReferenceDoc}
                  onChange={(e) => setExecReferenceDoc(e.target.value)}
                  placeholder="e.g. MENRO-EO-2026-004"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#147D64] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Authorizing Officer:
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="Officer Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#147D64] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedScheduleForApproval(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerification}
                disabled={isPublishing}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#147D64] hover:bg-[#0C5241] rounded-xl transition shadow-md flex justify-center items-center space-x-1"
              >
                {isPublishing ? (
                  <span>Signing...</span>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirm & Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
