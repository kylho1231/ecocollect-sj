"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Truck,
  MapPin,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Building,
  ShieldCheck,
  Search,
  Check,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  Plus,
  Scale,
  Users,
  Radio,
  FileSpreadsheet,
  Printer,
  KeyRound,
  Lock,
  RefreshCw,
  FileSignature,
  Filter,
} from "lucide-react";
import {
  CollectionSchedule,
  Complaint,
  OperationalMetrics,
  CollectorAccount,
  TruckTelemetry,
  CollectionPit,
  WasteLogEntry,
  WasteCategory,
} from "@/types";
import {
  subscribeToSchedules,
  subscribeToComplaints,
  subscribeToLiveTrucks,
  subscribeToCollectionPits,
  subscribeToCollectors,
  subscribeToWasteLogs,
  assignCollectorToBarangay,
  createCollectorAccountInFirestore,
  verifyScheduleInFirestore,
  updateComplaintStatusInFirestore,
} from "@/lib/firebase/firestore";

// Dynamically import Leaflet OpenStreetMap with SSR disabled
const LiveWasteMap = dynamic(() => import("@/components/map/LiveWasteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-800">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <div className="text-xs font-semibold text-emerald-400">Loading MENRO Central Fleet Radar...</div>
    </div>
  ),
});

const DEFAULT_BARANGAYS = [
  { id: "funda_dalipe", name: "Barangay Funda-Dalipe (Pilot)", isPilot: true },
  { id: "san_pedro", name: "Barangay San Pedro", isPilot: false },
  { id: "atabay", name: "Barangay Atabay", isPilot: false },
  { id: "maybato", name: "Barangay Maybato North & South", isPilot: false },
  { id: "mojon", name: "Barangay Mojon", isPilot: false },
  { id: "malaiba", name: "Barangay Mala-iba", isPilot: false },
];

const DEFAULT_TRUCKS_POOL = [
  { plate: "SJB-0412", model: "Isuzu Forward Compactor (6-Ton)" },
  { plate: "SJB-0881", model: "Hino Dutro Mini Compactor (3-Ton)" },
  { plate: "SJB-1092", model: "Mitsubishi Fuso Open Dump (4-Ton)" },
  { plate: "SJB-3344", model: "Isuzu ELF Recyclables Carrier (2.5-Ton)" },
];

const INITIAL_COLLECTORS: CollectorAccount[] = [
  {
    id: "col_ruel",
    employeeId: "MENRO-COL-001",
    fullName: "Kuya Ruel (MENRO Crew #1)",
    phone: "09171234567",
    assignedBarangayId: "funda_dalipe",
    assignedBarangayName: "Barangay Funda-Dalipe",
    assignedTruckPlate: "SJB-0412",
    pin: "1234",
    status: "ON_DUTY",
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: "col_dante",
    employeeId: "MENRO-COL-002",
    fullName: "Kuya Dante (MENRO Crew #2)",
    phone: "09187654321",
    assignedBarangayId: "san_pedro",
    assignedBarangayName: "Barangay San Pedro",
    assignedTruckPlate: "SJB-0881",
    pin: "5678",
    status: "ACTIVE",
    createdAt: Date.now() - 86400000 * 25,
  },
];

const INITIAL_TRUCKS: TruckTelemetry[] = [
  {
    id: "truck_01",
    driverName: "Kuya Ruel (MENRO Crew #1)",
    plateNumber: "SJB-0412",
    assignedBarangayId: "funda_dalipe",
    assignedBarangayName: "Barangay Funda-Dalipe",
    lat: 10.7480,
    lng: 121.9442,
    speed: 18,
    heading: 45,
    status: "PICKING_UP",
    currentStopName: "Purok Centro Primary Waste Depot",
    wasteStream: "Biodegradable (Madunot)",
    updatedAt: "Just now (Live Telemetry)",
    lastUpdatedEpoch: Date.now(),
  },
  {
    id: "truck_02",
    driverName: "Kuya Dante (MENRO Crew #2)",
    plateNumber: "SJB-0881",
    assignedBarangayId: "san_pedro",
    assignedBarangayName: "Barangay San Pedro",
    lat: 10.7562,
    lng: 121.9410,
    speed: 24,
    heading: 90,
    status: "EN_ROUTE",
    currentStopName: "San Pedro Highway Junction",
    wasteStream: "Recyclable (Mabaligya)",
    updatedAt: "1 min ago",
    lastUpdatedEpoch: Date.now() - 60000,
  },
];

const INITIAL_WASTE_LOGS: WasteLogEntry[] = [
  {
    id: "log_01",
    stopId: "pit_04",
    stopName: "Funda-Dalipe Boundary Drop-off",
    barangayId: "funda_dalipe",
    barangayName: "Barangay Funda-Dalipe",
    collectorId: "col_ruel",
    collectorName: "Kuya Ruel",
    truckPlate: "SJB-0412",
    wasteCategory: "BIODEGRADABLE",
    weightKg: 140,
    bagCount: 7,
    notes: "Segregated market organic waste cleared.",
    timestamp: Date.now() - 3600000,
    dateString: new Date().toLocaleDateString(),
  },
  {
    id: "log_02",
    stopId: "pit_01",
    stopName: "Purok Centro Primary Depot",
    barangayId: "funda_dalipe",
    barangayName: "Barangay Funda-Dalipe",
    collectorId: "col_ruel",
    collectorName: "Kuya Ruel",
    truckPlate: "SJB-0412",
    wasteCategory: "BIODEGRADABLE",
    weightKg: 120,
    bagCount: 6,
    notes: "Residential yard trimmings and kitchen scraps.",
    timestamp: Date.now() - 1800000,
    dateString: new Date().toLocaleDateString(),
  },
];

export default function AdminDashboardPage() {
  // Navigation & Security
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [officerName, setOfficerName] = useState("Engr. M. Delgado (MENRO SJ Officer)");

  // Active Tab View
  const [activeTab, setActiveTab] = useState<
    "FLEET_RADAR" | "CREW_ASSIGNMENTS" | "WASTE_DOCS" | "SCHEDULES_COMPLAINTS"
  >("FLEET_RADAR");

  // Operational State
  const [trucks, setTrucks] = useState<TruckTelemetry[]>(INITIAL_TRUCKS);
  const [pits, setPits] = useState<CollectionPit[]>([]);
  const [collectors, setCollectors] = useState<CollectorAccount[]>(INITIAL_COLLECTORS);
  const [wasteLogs, setWasteLogs] = useState<WasteLogEntry[]>(INITIAL_WASTE_LOGS);
  const [schedules, setSchedules] = useState<CollectionSchedule[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Modals & Forms
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isScheduleApprovalModalOpen, setIsScheduleApprovalModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CollectionSchedule | null>(null);
  const [execReferenceDoc, setExecReferenceDoc] = useState("MENRO-EO-2026-004");

  // Form State: New Collector Provisioning
  const [newColFullName, setNewColFullName] = useState("");
  const [newColEmpId, setNewColEmpId] = useState(`MENRO-COL-00${collectors.length + 1}`);
  const [newColPhone, setNewColPhone] = useState("");
  const [newColBarangay, setNewColBarangay] = useState(DEFAULT_BARANGAYS[0].name);
  const [newColBarangayId, setNewColBarangayId] = useState(DEFAULT_BARANGAYS[0].id);
  const [newColTruck, setNewColTruck] = useState(DEFAULT_TRUCKS_POOL[0].plate);
  const [newColPin, setNewColPin] = useState("1234");
  const [isSubmittingProvision, setIsSubmittingProvision] = useState(false);

  // Form State: Assignment Modal
  const [assignTargetCollector, setAssignTargetCollector] = useState<CollectorAccount | null>(null);
  const [assignTargetBarangayId, setAssignTargetBarangayId] = useState(DEFAULT_BARANGAYS[0].id);
  const [assignTargetBarangayName, setAssignTargetBarangayName] = useState(DEFAULT_BARANGAYS[0].name);
  const [assignTargetTruck, setAssignTargetTruck] = useState(DEFAULT_TRUCKS_POOL[0].plate);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Manifest Filter
  const [manifestDateFilter, setManifestDateFilter] = useState("TODAY");

  // 1. Real-time Subscriptions to Cloud Firestore
  useEffect(() => {
    const unsubTrucks = subscribeToLiveTrucks((liveTrucks) => {
      if (liveTrucks.length > 0) setTrucks(liveTrucks);
    });

    const unsubPits = subscribeToCollectionPits((livePits) => {
      if (livePits.length > 0) setPits(livePits);
    });

    const unsubCollectors = subscribeToCollectors((liveCollectors) => {
      if (liveCollectors.length > 0) setCollectors(liveCollectors);
    });

    const unsubWasteLogs = subscribeToWasteLogs((liveLogs) => {
      if (liveLogs.length > 0) setWasteLogs(liveLogs);
    });

    const unsubSchedules = subscribeToSchedules((liveSchedules) => {
      if (liveSchedules.length > 0) setSchedules(liveSchedules);
    });

    const unsubComplaints = subscribeToComplaints((liveComplaints) => {
      if (liveComplaints.length > 0) setComplaints(liveComplaints);
    });

    return () => {
      unsubTrucks();
      unsubPits();
      unsubCollectors();
      unsubWasteLogs();
      unsubSchedules();
      unsubComplaints();
    };
  }, []);

  // Compute Live Metrics
  const totalKgToday = wasteLogs.reduce((acc, log) => acc + (log.weightKg || 0), 0);
  const totalTonsToday = (totalKgToday / 1000).toFixed(2);
  const activeTrucksCount = trucks.filter((t) => t.status === "PICKING_UP" || t.status === "EN_ROUTE").length;
  const pendingApprovalsCount = schedules.filter((s) => s.verificationStatus === "PENDING_VERIFICATION").length;
  const openComplaintsCount = complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;

  // Waste breakdown by category
  const bioKg = wasteLogs
    .filter((l) => l.wasteCategory === "BIODEGRADABLE")
    .reduce((a, b) => a + b.weightKg, 0);
  const recKg = wasteLogs
    .filter((l) => l.wasteCategory === "RECYCLABLE")
    .reduce((a, b) => a + b.weightKg, 0);
  const resKg = wasteLogs
    .filter((l) => l.wasteCategory === "RESIDUAL")
    .reduce((a, b) => a + b.weightKg, 0);
  const specKg = wasteLogs
    .filter((l) => l.wasteCategory === "SPECIAL")
    .reduce((a, b) => a + b.weightKg, 0);

  // Security Gatekeeper Action
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === "2026" || adminPinInput === "1234") {
      setIsAdminAuthenticated(true);
      setAdminAuthError(null);
    } else {
      setAdminAuthError("Invalid Municipal Officer Security PIN. Authorized MENRO staff only.");
    }
  };

  // Action: Provision New Collector Account
  const handleProvisionCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColFullName.trim() || !newColPhone.trim()) {
      alert("Please provide the Collector's full legal name and mobile contact.");
      return;
    }

    setIsSubmittingProvision(true);
    try {
      await createCollectorAccountInFirestore({
        employeeId: newColEmpId,
        fullName: newColFullName,
        phone: newColPhone,
        assignedBarangayId: newColBarangayId,
        assignedBarangayName: newColBarangay,
        assignedTruckPlate: newColTruck,
        pin: newColPin,
        status: "ACTIVE",
      });

      // Optimistic addition
      setCollectors((prev) => [
        ...prev,
        {
          id: `col_${Date.now()}`,
          employeeId: newColEmpId,
          fullName: newColFullName,
          phone: newColPhone,
          assignedBarangayId: newColBarangayId,
          assignedBarangayName: newColBarangay,
          assignedTruckPlate: newColTruck,
          pin: newColPin,
          status: "ACTIVE",
          createdAt: Date.now(),
        },
      ]);

      setIsProvisionModalOpen(false);
      setNewColFullName("");
      setNewColPhone("");
      alert(`Collector account created successfully for ${newColFullName} (${newColEmpId}). Account credentials can now be provided to the crew member.`);
    } catch (err: any) {
      console.error("Provisioning error:", err);
      alert("Failed to provision account: " + err.message);
    } finally {
      setIsSubmittingProvision(false);
    }
  };

  // Action: Open Assignment Modal for a Collector
  const handleOpenAssignModal = (col: CollectorAccount) => {
    setAssignTargetCollector(col);
    setAssignTargetBarangayId(col.assignedBarangayId);
    setAssignTargetBarangayName(col.assignedBarangayName);
    setAssignTargetTruck(col.assignedTruckPlate);
    setIsAssignModalOpen(true);
  };

  // Action: Submit Assignment Update
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetCollector) return;

    setIsSubmittingAssign(true);
    try {
      await assignCollectorToBarangay(
        assignTargetCollector.id,
        assignTargetBarangayId,
        assignTargetBarangayName,
        assignTargetTruck
      );

      // Local update
      setCollectors((prev) =>
        prev.map((c) =>
          c.id === assignTargetCollector.id
            ? {
                ...c,
                assignedBarangayId: assignTargetBarangayId,
                assignedBarangayName: assignTargetBarangayName,
                assignedTruckPlate: assignTargetTruck,
              }
            : c
        )
      );

      // Also update matching truck in state
      setTrucks((prev) =>
        prev.map((t) =>
          t.plateNumber === assignTargetTruck
            ? {
                ...t,
                driverName: assignTargetCollector.fullName,
                assignedBarangayId: assignTargetBarangayId,
                assignedBarangayName: assignTargetBarangayName,
              }
            : t
        )
      );

      setIsAssignModalOpen(false);
      alert(`Successfully assigned ${assignTargetCollector.fullName} to ${assignTargetBarangayName} on truck ${assignTargetTruck}. The collector's PWA route will automatically sync.`);
    } catch (err: any) {
      console.error("Assignment error:", err);
      alert("Failed to update assignment: " + err.message);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Action: Confirm Schedule Verification
  const handleConfirmScheduleVerification = async () => {
    if (!selectedSchedule) return;
    try {
      await verifyScheduleInFirestore(
        selectedSchedule.id,
        execReferenceDoc || "MENRO-CONFIRMED",
        officerName
      );
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedSchedule.id
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
      setIsScheduleApprovalModalOpen(false);
      setSelectedSchedule(null);
    } catch (e: any) {
      alert("Verification error: " + e.message);
    }
  };

  // Action: Update Complaint Status
  const handleAdvanceComplaint = async (complaintId: string, currentStatus: string) => {
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
    } catch (e: any) {
      alert("Complaint status update error: " + e.message);
    }
  };

  // Prepare trucks data for the Leaflet component
  const liveTrucksForLeaflet = trucks.map((t) => ({
    id: t.id,
    driverName: t.driverName,
    plateNumber: t.plateNumber,
    lat: t.lat,
    lng: t.lng,
    status: t.status,
    currentStopName: t.currentStopName,
    wasteStream: t.wasteStream,
    updatedAt: `${t.updatedAt} (${t.speed || 0} km/h)`,
  }));

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">MENRO Security Gateway</h1>
            <p className="text-xs text-slate-400 mt-1">
              San Jose de Buenavista Municipal Environment & Natural Resources Office
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {adminAuthError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
                {adminAuthError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Municipal Officer Security PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-950 transition"
            >
              Verify Officer Credentials
            </button>
          </form>

          <div className="text-[11px] text-slate-500">
            Default Demo PIN: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-bold">2026</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Municipal Executive Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex justify-between items-center sticky top-0 z-40 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <img
            src="/icon.svg"
            alt="EcoCollect SJ Logo"
            className="h-10 w-10 rounded-2xl shadow-sm bg-white p-0.5"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-tight text-white">
                EcoCollect SJ — MENRO Command & Fleet Center
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE CLOUD SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              San Jose de Buenavista, Antique • Municipal Waste Telemetry & Scheduling
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">{officerName}</span>
          </div>

          <Link
            href="/"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition flex items-center space-x-1 border border-slate-700"
          >
            <span>Public Portal</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Link
            href="/collector"
            className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 px-3 py-2 rounded-xl transition flex items-center space-x-1 border border-emerald-500/40 font-semibold"
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Open Field PWA</span>
          </Link>
        </div>
      </nav>

      {/* Main Executive Body */}
      <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* KPI Performance Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Crews On Route</div>
              <div className="text-2xl font-black text-white">{activeTrucksCount} Trucks</div>
              <div className="text-[11px] text-emerald-400 font-medium">Streaming Live GPS Telemetry</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Waste Tonnage Today</div>
              <div className="text-2xl font-black text-sky-400">{totalKgToday} kg</div>
              <div className="text-[11px] text-slate-400 font-medium">{totalTonsToday} Metric Tons Documented</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</div>
              <div className="text-2xl font-black text-amber-400">{pendingApprovalsCount} Timetables</div>
              <div className="text-[11px] text-amber-300 font-medium">Awaiting MENRO Endorsement</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Citizen Inquiries</div>
              <div className="text-2xl font-black text-rose-400">{openComplaintsCount} Open</div>
              <div className="text-[11px] text-rose-300 font-medium">Tracked in Pilot Jurisdiction</div>
            </div>
          </div>
        </div>

        {/* Modern Tab Bar Selector */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("FLEET_RADAR")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition ${
              activeTab === "FLEET_RADAR"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>🛰️ Live Fleet & Crew Radar</span>
          </button>

          <button
            onClick={() => setActiveTab("CREW_ASSIGNMENTS")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition ${
              activeTab === "CREW_ASSIGNMENTS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>🚛 Collector Assignments & Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab("WASTE_DOCS")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition ${
              activeTab === "WASTE_DOCS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>📊 Waste Volume & Manifest Documents</span>
          </button>

          <button
            onClick={() => setActiveTab("SCHEDULES_COMPLAINTS")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition ${
              activeTab === "SCHEDULES_COMPLAINTS"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>📋 Timetables & Resident Complaints</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: LIVE FLEET & CREW RADAR (OpenStreetMap Monitoring)
        ========================================================================= */}
        {activeTab === "FLEET_RADAR" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* OpenStreetMap Component */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>San Jose de Buenavista Live Municipal Waste Radar</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Coordinates updated via Collector Field PWAs
                </span>
              </div>
              <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <LiveWasteMap
                  trucks={liveTrucksForLeaflet}
                  pits={pits}
                  height="520px"
                />
              </div>
            </div>

            {/* Live Fleet Telemetry Panel */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-400" />
                    <span>Active Municipal Fleet Units</span>
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded">
                    {trucks.length} Total
                  </span>
                </div>

                <div className="space-y-3">
                  {trucks.map((truck) => {
                    const isPickingUp = truck.status === "PICKING_UP";
                    const isEnRoute = truck.status === "EN_ROUTE";

                    return (
                      <div
                        key={truck.id}
                        className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-black text-white">{truck.plateNumber}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                  isPickingUp
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                                    : isEnRoute
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                                }`}
                              >
                                {truck.status.replace("_", " ")}
                              </span>
                            </div>
                            <div className="text-xs text-slate-300 font-semibold mt-0.5">
                              {truck.driverName}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {truck.speed || 0} km/h
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono">Speed</div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl">
                          <span className="font-semibold text-slate-300">Current Stop: </span>
                          <span>{truck.currentStopName}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                          <span>Jurisdiction: {truck.assignedBarangayName}</span>
                          <span>{truck.updatedAt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: COLLECTOR ASSIGNMENTS & SECURE ACCOUNT PROVISIONING
        ========================================================================= */}
        {activeTab === "CREW_ASSIGNMENTS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white">Collector Field Force & Assignment Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign collectors to target Barangays & vehicles. Provision secure field accounts with anti-impersonation protection.
                </p>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-950 flex items-center space-x-1.5 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Provision New Collector Account</span>
              </button>
            </div>

            {/* Collectors Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Authorized Municipal Collectors ({collectors.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Strictly Admin-Provisioned • Self-registration Disabled
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-5">Badge / ID</th>
                      <th className="py-3.5 px-5">Collector Full Name</th>
                      <th className="py-3.5 px-5">Assigned Barangay</th>
                      <th className="py-3.5 px-5">Designated Truck</th>
                      <th className="py-3.5 px-5">Duty Status</th>
                      <th className="py-3.5 px-5">PIN Access</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {collectors.map((col) => (
                      <tr key={col.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                          {col.employeeId}
                        </td>
                        <td className="py-4 px-5 font-bold text-white">
                          <div>{col.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{col.phone}</div>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-200">
                          {col.assignedBarangayName}
                        </td>
                        <td className="py-4 px-5 font-mono text-emerald-300">
                          {col.assignedTruckPlate}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              col.status === "ON_DUTY"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {col.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-500">
                          •••• (Configured)
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleOpenAssignModal(col)}
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white border border-slate-700 font-bold px-3 py-1.5 rounded-xl transition text-[11px]"
                          >
                            Reassign Route / Truck
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: WASTE VOLUME & MANIFEST DOCUMENTS (MENRO Tally & Reports)
        ========================================================================= */}
        {activeTab === "WASTE_DOCS" && (
          <div className="space-y-6">
            {/* Stream Category Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Biodegradable (Madunot)
                </div>
                <div className="text-2xl font-black text-white mt-1">{bioKg} kg</div>
                <div className="text-[10px] text-slate-400">Diverted to Municipal Composting</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Recyclable (Mabaligya)
                </div>
                <div className="text-2xl font-black text-white mt-1">{recKg} kg</div>
                <div className="text-[10px] text-slate-400">Forwarded to Materials Recovery (MRF)</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Residual Non-recyclable
                </div>
                <div className="text-2xl font-black text-white mt-1">{resKg} kg</div>
                <div className="text-[10px] text-slate-400">Sanitary Landfill Route</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Special / Hazardous
                </div>
                <div className="text-2xl font-black text-white mt-1">{specKg} kg</div>
                <div className="text-[10px] text-slate-400">Segregated Hazardous Containment</div>
              </div>
            </div>

            {/* Official Waste Collection Manifest Document Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                    <span>Official Municipal Waste Collection Manifest</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compliant with Republic Act 9003 & San Jose de Buenavista Environmental Code
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Manifest</span>
                  </button>
                </div>
              </div>

              {/* Manifest Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Log Timestamp</th>
                      <th className="py-3 px-4">Stop / Depot Name</th>
                      <th className="py-3 px-4">Barangay</th>
                      <th className="py-3 px-4">Collector & Truck</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4">Sacks</th>
                      <th className="py-3 px-4">Notes / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {wasteLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{log.stopName}</td>
                        <td className="py-3.5 px-4">{log.barangayName}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-emerald-300">{log.collectorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-1">
                            ({log.truckPlate})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            {log.wasteCategory}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {log.weightKg} kg
                        </td>
                        <td className="py-3.5 px-4 font-mono">{log.bagCount}</td>
                        <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                          {log.refusalReason ? (
                            <span className="text-amber-400 font-semibold">{log.refusalReason}</span>
                          ) : (
                            log.notes || "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SCHEDULE VERIFICATIONS & COMPLAINTS DISPATCH
        ========================================================================= */}
        {activeTab === "SCHEDULES_COMPLAINTS" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timetables Verification Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-emerald-400" />
                    <span>Official Barangay Collection Timetables</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Municipal review and executive order confirmation
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {schedules.map((sched) => {
                  const isVerified = sched.verificationStatus === "VERIFIED";

                  return (
                    <div
                      key={sched.id}
                      className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-black text-white">{sched.barangayName}</div>
                          <div className="text-xs text-slate-400">
                            {sched.dayOfWeek} • {sched.startTime} - {sched.endTime}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isVerified
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                          }`}
                        >
                          {sched.verificationStatus.replace("_", " ")}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl">
                        Stream: <strong className="text-emerald-400">{sched.wasteCategory}</strong> — {sched.notes}
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {isVerified ? `Ref: ${sched.officialReference}` : "Awaiting signed order"}
                        </span>
                        {!isVerified && (
                          <button
                            onClick={() => {
                              setSelectedSchedule(sched);
                              setIsScheduleApprovalModalOpen(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow"
                          >
                            Verify & Approve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resident Complaints Triage Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-400" />
                    <span>Citizen Waste Inquiries & Reports</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct reports submitted through Citizen PWA
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {complaints.map((cmp) => {
                  const isResolved = cmp.status === "RESOLVED" || cmp.status === "CLOSED";

                  return (
                    <div
                      key={cmp.id}
                      className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-mono font-bold text-sky-400">
                              {cmp.trackingNumber}
                            </span>
                            <span className="text-xs text-slate-400">• {cmp.purokName}</span>
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">{cmp.category}</div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isResolved
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {cmp.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{cmp.description}</p>

                      <div className="flex justify-between items-center pt-1 text-[11px]">
                        <span className="text-[10px] text-slate-500">{cmp.createdAt}</span>
                        {!isResolved && (
                          <button
                            onClick={() => handleAdvanceComplaint(cmp.id, cmp.status)}
                            className="bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition text-[11px]"
                          >
                            Advance Status →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: PROVISION NEW COLLECTOR ACCOUNT (ADMIN ONLY)
      ========================================================================= */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Provision Collector Account</h3>
                <p className="text-xs text-slate-400">Authorizes a crew member for the Collector PWA</p>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionCollector} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={newColFullName}
                  onChange={(e) => setNewColFullName(e.target.value)}
                  placeholder="e.g. Juan De La Cruz"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Employee Badge ID
                  </label>
                  <input
                    type="text"
                    value={newColEmpId}
                    onChange={(e) => setNewColEmpId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={newColPhone}
                    onChange={(e) => setNewColPhone(e.target.value)}
                    placeholder="09170000000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Assigned Barangay
                </label>
                <select
                  value={newColBarangayId}
                  onChange={(e) => {
                    const b = DEFAULT_BARANGAYS.find((x) => x.id === e.target.value);
                    if (b) {
                      setNewColBarangayId(b.id);
                      setNewColBarangay(b.name);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {DEFAULT_BARANGAYS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Designated Truck
                  </label>
                  <select
                    value={newColTruck}
                    onChange={(e) => setNewColTruck(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {DEFAULT_TRUCKS_POOL.map((t) => (
                      <option key={t.plate} value={t.plate}>
                        {t.plate} ({t.model.split(" ")[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Field Access PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newColPin}
                    onChange={(e) => setNewColPin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingProvision}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition mt-2"
              >
                {isSubmittingProvision ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Create & Authorize Collector</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REASSIGN COLLECTOR TO BARANGAY & TRUCK
      ========================================================================= */}
      {isAssignModalOpen && assignTargetCollector && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Reassign Route & Truck</h3>
                <p className="text-xs text-emerald-400 font-semibold">{assignTargetCollector.fullName}</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Target Barangay Assignment
                </label>
                <select
                  value={assignTargetBarangayId}
                  onChange={(e) => {
                    const b = DEFAULT_BARANGAYS.find((x) => x.id === e.target.value);
                    if (b) {
                      setAssignTargetBarangayId(b.id);
                      setAssignTargetBarangayName(b.name);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  {DEFAULT_BARANGAYS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Assigned Compactor Vehicle
                </label>
                <select
                  value={assignTargetTruck}
                  onChange={(e) => setAssignTargetTruck(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  {DEFAULT_TRUCKS_POOL.map((t) => (
                    <option key={t.plate} value={t.plate}>
                      {t.plate} — {t.model}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAssign}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition mt-2"
              >
                {isSubmittingAssign ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save & Push to Collector PWA</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SCHEDULE EXECUTIVE ORDER APPROVAL MODAL
      ========================================================================= */}
      {isScheduleApprovalModalOpen && selectedSchedule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Approve Municipal Schedule</h3>
                <p className="text-xs text-slate-400">{selectedSchedule.barangayName}</p>
              </div>
              <button
                onClick={() => setIsScheduleApprovalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Executive Order / MENRO Resolution Number
                </label>
                <input
                  type="text"
                  value={execReferenceDoc}
                  onChange={(e) => setExecReferenceDoc(e.target.value)}
                  placeholder="e.g. MENRO-EO-2026-004"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Signing Municipal Officer
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                Approving will publish this timetable as official to all citizens in {selectedSchedule.barangayName} on their PWA.
              </div>

              <button
                onClick={handleConfirmScheduleVerification}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Confirm & Sign Official Timetable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
