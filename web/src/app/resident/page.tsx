"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  Search,
  Filter,
  FileText,
  UserCheck,
  ShieldCheck,
  Calendar,
  LogOut,
  Plus,
  Send,
  X,
  Sparkles,
} from "lucide-react";
import {
  subscribeToLiveTrucks,
  subscribeToCollectionPits,
  subscribeToSchedules,
  submitResidentComplaint,
} from "@/lib/firebase/firestore";
import { TruckTelemetry, CollectionPit, CollectionSchedule } from "@/types";

// Dynamically import Leaflet OpenStreetMap with SSR disabled to prevent window is not defined
const LiveWasteMap = dynamic(() => import("@/components/map/LiveWasteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-200">
      <div className="w-10 h-10 border-4 border-[#147D64] border-t-transparent rounded-full animate-spin mb-3"></div>
      <div className="text-xs font-semibold">Loading Live OpenStreetMap (San Jose de Buenavista)...</div>
    </div>
  ),
});

export default function ResidentPwaHome() {
  const [residentUser, setResidentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"MAP" | "SCHEDULE" | "GUIDE">("MAP");

  // Real-time Firestore sync
  const [liveTrucks, setLiveTrucks] = useState<TruckTelemetry[]>([]);
  const [livePits, setLivePits] = useState<CollectionPit[]>([]);
  const [schedules, setSchedules] = useState<CollectionSchedule[]>([]);

  // Complaint reporting modal
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState("Missed Garbage Pickup");
  const [complaintPurok, setComplaintPurok] = useState("Purok Centro");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSuccessNotice, setComplaintSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    // Check if resident is registered/verified from localStorage
    const saved = localStorage.getItem("ecocollect_resident_user");
    if (saved) {
      try {
        setResidentUser(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Default verified guest state for immediate testing
      setResidentUser({
        fullName: "Resident Citizen",
        barangay: "Funda-Dalipe",
        addressLocation: "Purok Centro",
        isVerified: true,
      });
    }

    // Subscribe to Firestore collections
    const unsubTrucks = subscribeToLiveTrucks((trucks) => {
      if (trucks.length > 0) setLiveTrucks(trucks);
    });

    const unsubPits = subscribeToCollectionPits((pits) => {
      if (pits.length > 0) setLivePits(pits);
    });

    const unsubSchedules = subscribeToSchedules((scheds) => {
      if (scheds.length > 0) setSchedules(scheds);
    });

    return () => {
      unsubTrucks();
      unsubPits();
      unsubSchedules();
    };
  }, []);

  const handleSubmitComplaintForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDescription.trim()) return;

    setIsSubmittingComplaint(true);
    try {
      const res = await submitResidentComplaint({
        residentDisplayName: residentUser?.fullName || "Resident Citizen",
        barangayId: "funda_dalipe",
        barangayName: `Barangay ${residentUser?.barangay || "Funda-Dalipe"}`,
        purokName: complaintPurok,
        category: complaintCategory,
        description: complaintDescription,
      });

      setComplaintSuccessNotice(`Report submitted! Tracking Ticket: ${res.trackingNumber}. Assigned to MENRO Dispatch.`);
      setComplaintDescription("");
      setTimeout(() => {
        setIsComplaintModalOpen(false);
        setComplaintSuccessNotice(null);
      }, 3000);
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // Convert live trucks to Leaflet map format
  const trucksForMap = liveTrucks.map((t) => ({
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

  const primaryTruck = liveTrucks[0] || {
    plateNumber: "SJB-0412",
    driverName: "Kuya Ruel (MENRO Crew #1)",
    currentStopName: "Purok Centro Primary Depot",
    status: "PICKING_UP",
    wasteStream: "Biodegradable (Madunot)",
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-200 selection:bg-emerald-500 selection:text-white">
      {/* Mobile PWA Top App Bar */}
      <header className="bg-[#147D64] text-white pt-4 pb-3 px-5 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <img src="/icon.svg" alt="EcoCollect" className="h-8 w-8 rounded-xl bg-white p-0.5 shadow-sm" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight">EcoCollect PWA</span>
                <span className="bg-emerald-300/30 text-emerald-100 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-300/40">
                  CITIZEN
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Barangay {residentUser?.barangay || "Funda-Dalipe"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[11px]">Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
        {/* Resident Verification Pill Banner */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-emerald-50 rounded-xl text-[#147D64]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#11263A] flex items-center gap-1">
                <span>{residentUser?.fullName || "Verified Resident"}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">
                  VERIFIED ID
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {residentUser?.addressLocation || "Purok Centro, Funda-Dalipe"}
              </div>
            </div>
          </div>

          <Link
            href="/resident/register"
            className="text-[11px] font-bold text-[#147D64] hover:underline"
          >
            Update ID
          </Link>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("MAP")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === "MAP" ? "bg-white text-[#11263A] shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🗺️ Live OpenStreetMap</span>
          </button>
          <button
            onClick={() => setActiveTab("SCHEDULE")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === "SCHEDULE" ? "bg-white text-[#11263A] shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📅 Schedules</span>
          </button>
          <button
            onClick={() => setActiveTab("GUIDE")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === "GUIDE" ? "bg-white text-[#11263A] shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>♻️ Segregation</span>
          </button>
        </div>

        {/* TAB 1: Live OpenStreetMap Feature */}
        {activeTab === "MAP" && (
          <div className="space-y-3">
            {/* Live Operational Status Banner */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">
                  🚛
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Live Truck in Your Jurisdiction
                  </div>
                  <div className="text-sm font-black">
                    {primaryTruck.plateNumber} • {primaryTruck.driverName.split("(")[0]}
                  </div>
                  <div className="text-[11px] text-emerald-100">
                    Status: <strong>{primaryTruck.status === "PICKING_UP" ? `Picking up at ${primaryTruck.currentStopName}` : "En Route"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive OpenStreetMap Container */}
            <div className="w-full">
              <LiveWasteMap
                trucks={trucksForMap.length > 0 ? trucksForMap : undefined}
                pits={livePits.length > 0 ? livePits : undefined}
                height="420px"
              />
            </div>

            {/* Legend & Guide Notice */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2">
              <div className="font-bold text-[#11263A]">How to read this live map:</div>
              <ul className="text-slate-600 text-[11px] space-y-1 list-disc pl-4">
                <li><strong className="text-emerald-700">Green Truck:</strong> Real-time collector position updated via GPS.</li>
                <li><strong className="text-amber-600">Pulsing Marker:</strong> Waste crew is currently loading trash at this designated depot.</li>
                <li><strong className="text-slate-600">Trash Pins:</strong> Official community drop-off pits and roadside collection bins.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: Collection Schedule */}
        {activeTab === "SCHEDULE" && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
              <strong>Notice:</strong> Barangay Funda-Dalipe collection schedule is awaiting formal confirmation by MENRO San Jose de Buenavista.
            </div>

            <div className="space-y-2.5">
              {schedules.map((sched) => {
                const isVerified = sched.verificationStatus === "VERIFIED";

                return (
                  <div key={sched.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {sched.dayOfWeek} • {sched.startTime} – {sched.endTime}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isVerified
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-amber-700 bg-amber-50 border-amber-200"
                        }`}
                      >
                        {sched.verificationStatus.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-[#11263A]">
                      {sched.wasteCategory} ({sched.barangayName})
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{sched.notes}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Segregation Policy */}
        {activeTab === "GUIDE" && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="font-extrabold text-sm text-[#11263A] flex items-center gap-1.5">
                <span>🚫</span>
                <span>No Segregation, No Collection Policy</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mandated by San Jose de Buenavista Municipal Environmental Ordinance. Mixed bags will be stamped with a non-compliance ticket and refused by collection personnel.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="font-bold text-emerald-800">1. Madunot (Biodegradable)</div>
                  <div className="text-emerald-700 text-[11px]">Food waste, garden trimmings, spoiled fruit.</div>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                  <div className="font-bold text-sky-800">2. Maresiklo (Recyclable)</div>
                  <div className="text-sky-700 text-[11px]">PET bottles, tin cans, dry cardboard.</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">3. Di-madunot (Residual)</div>
                  <div className="text-slate-600 text-[11px]">Sachets, single-use films, styrofoam.</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="font-bold text-rose-800">4. Delikado (Special Waste)</div>
                  <div className="text-rose-700 text-[11px]">Batteries, broken glass, mercury bulbs. Never mix with general trash!</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Report Missed Pickup / Dumping */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#11263A]">Report Waste Issue</h3>
                <p className="text-xs text-slate-500">Directly dispatched to MENRO San Jose</p>
              </div>
              <button
                onClick={() => setIsComplaintModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {complaintSuccessNotice ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold text-center">
                {complaintSuccessNotice}
              </div>
            ) : (
              <form onSubmit={handleSubmitComplaintForm} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Issue Category
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#147D64]"
                  >
                    <option value="Missed Garbage Pickup">Missed Garbage Pickup</option>
                    <option value="Illegal Dumping / Overflowing Depot">Illegal Dumping / Overflowing Depot</option>
                    <option value="Uncollected Residual Waste">Uncollected Residual Waste</option>
                    <option value="Improper Waste Handling">Improper Waste Handling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Purok / Street
                  </label>
                  <select
                    value={complaintPurok}
                    onChange={(e) => setComplaintPurok(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#147D64]"
                  >
                    <option value="Purok Centro">Purok Centro</option>
                    <option value="Purok Baybay">Purok Baybay</option>
                    <option value="Purok Crossing">Purok Crossing</option>
                    <option value="San Pedro Boundary">San Pedro Boundary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Description of Issue
                  </label>
                  <textarea
                    rows={3}
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    placeholder="Describe what happened or location details..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#147D64]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingComplaint}
                  className="w-full bg-[#147D64] hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
                >
                  {isSubmittingComplaint ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Report to Dispatch</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar for PWA */}
      <nav className="bg-white border-t border-slate-200 px-4 py-2.5 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 flex justify-around text-xs font-bold">
        <button
          onClick={() => setActiveTab("MAP")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "MAP" ? "text-[#147D64]" : "text-slate-400"
          }`}
        >
          <span className="text-base">🗺️</span>
          <span className="text-[10px]">Live Map</span>
        </button>
        <button
          onClick={() => setActiveTab("SCHEDULE")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "SCHEDULE" ? "text-[#147D64]" : "text-slate-400"
          }`}
        >
          <span className="text-base">📅</span>
          <span className="text-[10px]">Schedule</span>
        </button>
        <button
          onClick={() => setActiveTab("GUIDE")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "GUIDE" ? "text-[#147D64]" : "text-slate-400"
          }`}
        >
          <span className="text-base">♻️</span>
          <span className="text-[10px]">Sorting</span>
        </button>
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700"
        >
          <span className="text-base">🏛️</span>
          <span className="text-[10px]">Portal</span>
        </Link>
      </nav>
    </div>
  );
}
