"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Users,
  Building,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { CollectionSchedule, Complaint, OperationalMetrics } from "@/types";

export default function AdminDashboardPage() {
  const [schedules, setSchedules] = useState<CollectionSchedule[]>([
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
  ]);

  const [metrics] = useState<OperationalMetrics>({
    activeTrucks: 4,
    completedStopsToday: 42,
    totalPlannedStopsToday: 58,
    pendingScheduleVerifications: 2,
    openComplaints: 3,
    verifiedBarangaysCount: 8,
  });

  const [recentComplaints] = useState<Complaint[]>([
    {
      id: "cmp_01",
      trackingNumber: "EC-20261024-8142",
      residentDisplayName: "Maria Santos",
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
      residentDisplayName: "Roberto Tan",
      barangayId: "funda_dalipe",
      barangayName: "Funda-Dalipe",
      purokName: "Purok Baybay",
      category: "Uncollected / Leftover Waste",
      description: "Leftover construction rubble dumped beside designated collection point.",
      status: "ASSIGNED",
      createdAt: "Today at 07:15 AM",
    },
  ]);

  // Demonstration workflow: MENRO Official verifies Funda-Dalipe schedule
  const handleVerifySchedule = (scheduleId: string) => {
    const officialRef = "MENRO-MO-2026-004";
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              verificationStatus: "VERIFIED",
              officialReference: officialRef,
              verifiedByUserName: "MENRO Admin Officer",
              verifiedTimestamp: Date.now(),
            }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Nav */}
      <nav className="bg-[#11263A] text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-[#147D64] p-2 rounded-lg">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">EcoCollect SJ — MENRO Administration</h1>
            <p className="text-xs text-slate-300">San Jose de Buenavista Municipal Environment Office</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white underline underline-offset-4"
          >
            View Public Portal
          </Link>
          <div className="bg-emerald-800/80 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">
            Officer Role: MENRO Administrator
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-[#147D64] rounded-xl">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Crews</div>
              <div className="text-2xl font-black text-slate-900">{metrics.activeTrucks} Trucks</div>
              <div className="text-xs text-emerald-600 font-medium">On scheduled routes</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <CalendarCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stop Completion</div>
              <div className="text-2xl font-black text-slate-900">
                {metrics.completedStopsToday} / {metrics.totalPlannedStopsToday}
              </div>
              <div className="text-xs text-sky-600 font-medium">
                {Math.round((metrics.completedStopsToday / metrics.totalPlannedStopsToday) * 100)}% route adherence
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FileCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</div>
              <div className="text-2xl font-black text-slate-900">{metrics.pendingScheduleVerifications}</div>
              <div className="text-xs text-amber-600 font-medium">Funda-Dalipe drafts</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Incidents</div>
              <div className="text-2xl font-black text-slate-900">{metrics.openComplaints}</div>
              <div className="text-xs text-rose-600 font-medium">Under active review</div>
            </div>
          </div>
        </div>

        {/* Schedule Verification Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#11263A]">
                Schedule Verification & Publication Queue
              </h2>
              <p className="text-xs text-slate-500">
                Government Truth-in-Data Control: Proposed schedules must be signed and approved by authorized MENRO personnel before appearing as official to residents.
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
              Pilot Barangay: Funda-Dalipe
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3 px-4">Barangay</th>
                  <th className="py-3 px-4">Waste Category</th>
                  <th className="py-3 px-4">Day & Time</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Reference Doc</th>
                  <th className="py-3 px-4 text-right">Official Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((s) => {
                  const isVerified = s.verificationStatus === "VERIFIED";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {s.barangayName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                          {s.wasteCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {s.dayOfWeek} ({s.startTime} - {s.endTime})
                      </td>
                      <td className="py-3 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle className="h-3 w-3" />
                            <span>VERIFIED OFFICIAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <ShieldAlert className="h-3 w-3" />
                            <span>AWAITING APPROVAL</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {s.officialReference || "Pending Sign-off"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isVerified ? (
                          <span className="text-xs text-slate-400 font-medium">Published</span>
                        ) : (
                          <button
                            onClick={() => handleVerifySchedule(s.id)}
                            className="bg-[#147D64] hover:bg-[#0C5241] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Approve & Publish
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

        {/* Incident Triage Kanban */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#11263A]">
                Citizen Waste Reports & Missed Collections
              </h2>
              <p className="text-xs text-slate-500">
                Tracked reports routed to MENRO inspection and collection route crews.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentComplaints.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-bold text-[#147D64] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {c.trackingNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    {c.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{c.category}</h3>
                <p className="text-xs text-slate-600 mb-3">{c.description}</p>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <span>
                    {c.barangayName} ({c.purokName})
                  </span>
                  <span>{c.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
