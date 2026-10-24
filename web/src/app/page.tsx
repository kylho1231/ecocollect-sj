"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  FileText,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { CollectionSchedule } from "@/types";
import { subscribeToSchedules } from "@/lib/firebase/firestore";

const INITIAL_FALLBACK_SCHEDULES: CollectionSchedule[] = [
  {
    id: "sched_fd_bio",
    barangayId: "funda_dalipe",
    barangayName: "Funda-Dalipe",
    wasteCategory: "BIODEGRADABLE",
    dayOfWeek: "Monday",
    startTime: "06:00 AM",
    endTime: "09:00 AM",
    verificationStatus: "PENDING_VERIFICATION",
    notes: "Proposed collection for Purok Centro & Baybay. Awaiting MENRO signed endorsement.",
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
    notes: "Proposed recyclable pickup. Resident sorting required.",
  },
  {
    id: "sched_fd_res",
    barangayId: "funda_dalipe",
    barangayName: "Funda-Dalipe",
    wasteCategory: "RESIDUAL",
    dayOfWeek: "Friday",
    startTime: "06:00 AM",
    endTime: "09:00 AM",
    verificationStatus: "PENDING_VERIFICATION",
    notes: "Proposed residual non-recyclable solid waste collection.",
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

export default function PublicPortalPage() {
  const [schedules, setSchedules] = useState<CollectionSchedule[]>(INITIAL_FALLBACK_SCHEDULES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    // Connect to live Cloud Firestore
    const unsubscribe = subscribeToSchedules((liveSchedules) => {
      if (liveSchedules.length > 0) {
        setSchedules(liveSchedules);
        setIsLiveConnected(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.barangayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dayOfWeek.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === "ALL" || s.wasteCategory === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-[#147D64] text-white py-3.5 px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/icon.svg"
              alt="EcoCollect SJ Logo"
              className="h-10 w-10 rounded-xl shadow-sm bg-white p-0.5 transition transform hover:scale-105"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight">EcoCollect SJ</h1>
                {isLiveConnected && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse mr-1"></span>
                    LIVE CLOUD
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90">
                Municipality of San Jose de Buenavista, Antique
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="bg-white text-[#147D64] hover:bg-emerald-50 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center space-x-1.5 active:scale-95"
            >
              <span>MENRO Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Modern Gradient */}
      <section className="bg-gradient-to-b from-[#147D64] via-[#0E604C] to-[#11263A] text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 backdrop-blur-md border border-white/15">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            <span>Pilot Jurisdiction: Barangay Funda-Dalipe</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            Cleaner Communities.<br className="hidden sm:inline" /> Smarter Collections.
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            San Jose de Buenavista Public Waste Verification Portal. View authorized collection windows, verify official municipal schedules, and review solid waste sorting rules.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        {/* 3 High-Impact Modern Application Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Citizen PWA */}
          <Link
            href="/resident"
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                📱
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold text-[#11263A] group-hover:text-[#147D64] transition">
                  Citizen PWA
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  MOBILE
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Real-time OpenStreetMap tracking of garbage trucks, community waste pits, schedule alerts, and secure AI government ID verification.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#147D64] pt-3 border-t border-slate-100">
              <span>Open Citizen App</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Collector PWA */}
          <Link
            href="/collector/login"
            className="group bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between text-slate-100"
          >
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition border border-emerald-500/20">
                🚛
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition">
                  Collector Field PWA
                </h3>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  CREW ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Admin-provisioned login, continuous GPS telemetry streaming to HQ, assigned route stops, waste volume logging, and refusal reporting.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-3 border-t border-slate-800">
              <span>Collector Shift Login</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: MENRO Command Dashboard */}
          <Link
            href="/admin/dashboard"
            className="group bg-gradient-to-br from-[#11263A] to-slate-900 rounded-3xl p-6 border border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all flex flex-col justify-between text-white"
          >
            <div>
              <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition border border-sky-500/20">
                🛰️
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold text-white group-hover:text-sky-300 transition">
                  MENRO Command Center
                </h3>
                <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Monitor fleet GPS in real time on OpenStreetMap, assign collectors to barangays, provision crew accounts, and generate official waste manifests.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-sky-300 pt-3 border-t border-slate-700/80">
              <span>Access Command Center</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Pilot Disclosure Alert */}
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 text-amber-900 flex items-start space-x-3 shadow-sm backdrop-blur-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">Government Truth-in-Data Notice: </span>
            The garbage collection timetable for <strong>Barangay Funda-Dalipe</strong> is currently undergoing official municipal confirmation by MENRO San Jose de Buenavista. Timetables are marked <strong>PENDING CONFIRMATION</strong> until signed into executive order.
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Barangay or Day..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#147D64] focus:bg-white transition"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {["ALL", "BIODEGRADABLE", "RECYCLABLE", "RESIDUAL"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  categoryFilter === cat
                    ? "bg-[#147D64] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "ALL" && "All Categories"}
                {cat === "BIODEGRADABLE" && "Biodegradable (Madunot)"}
                {cat === "RECYCLABLE" && "Recyclable (Mabaligya)"}
                {cat === "RESIDUAL" && "Residual (Di-madunot)"}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Cards Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#11263A]">
                Published & Pending Collection Timetables
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Displaying {filteredSchedules.length} schedules across San Jose de Buenavista
              </p>
            </div>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Clock className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <div className="font-bold text-slate-700">No schedules matched your criteria</div>
              <div className="text-xs">Try clearing your search or category filters.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((sched) => {
                const isVerified = sched.verificationStatus === "VERIFIED";

                return (
                  <div
                    key={sched.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group hover:border-emerald-300"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-sm text-[#11263A] group-hover:text-[#147D64] transition">
                          {sched.barangayName}
                        </span>
                        {isVerified ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>OFFICIAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3" />
                            <span>AWAITING APPROVAL</span>
                          </span>
                        )}
                      </div>

                      <div className="text-2xl font-black text-[#147D64] mb-1">
                        {sched.dayOfWeek}
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-600 text-sm mb-4 font-medium">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{sched.startTime} – {sched.endTime}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl mb-4 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Designated Waste Stream
                        </div>
                        <div className="text-sm font-bold text-[#11263A]">
                          {sched.wasteCategory === "BIODEGRADABLE" && "Biodegradable (Madunot)"}
                          {sched.wasteCategory === "RECYCLABLE" && "Recyclable (Mabaligya)"}
                          {sched.wasteCategory === "RESIDUAL" && "Residual (Di-madunot)"}
                          {sched.wasteCategory === "SPECIAL" && "Special / Hazardous (Delikado)"}
                        </div>
                        {sched.notes && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {sched.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                      {isVerified ? (
                        <div className="flex items-center justify-between text-emerald-700 font-semibold">
                          <span className="flex items-center space-x-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Ref: {sched.officialReference || "MENRO-CONFIRMED"}</span>
                          </span>
                          {sched.verifiedByUserName && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              by {sched.verifiedByUserName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Pending confirmation by MENRO San Jose
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Municipal Policy Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-100 p-3 rounded-2xl text-[#147D64]">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#11263A] mb-1">
                San Jose de Buenavista Municipal Waste Policy
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                In strict compliance with RA 9003 and Municipal Ordinances, our collection crews enforce an uncompromising <strong>“No Segregation, No Collection”</strong> rule. Unsegregated or mixed garbage bags will not be collected.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-semibold border border-emerald-100">
                  Green Bin: Madunot (Biodegradable)
                </span>
                <span className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl font-semibold border border-sky-100">
                  Blue Bin: Maresiklo / Mabaligya (Recyclable)
                </span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200">
                  Gray Bin: Di-madunot (Residual)
                </span>
                <span className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl font-semibold border border-rose-100">
                  Red Bin: Delikado (Hazardous / E-Waste)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#11263A] text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800">
        <p className="text-slate-300 font-medium">EcoCollect SJ — Municipal Environment & Natural Resources Office (MENRO)</p>
        <p className="mt-1">San Jose de Buenavista, Antique, Philippines • Republic Act 9003 & 10173 Compliant</p>
      </footer>
    </div>
  );
}
