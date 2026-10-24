import Link from "next/link";
import { ShieldCheck, Clock, AlertTriangle, Truck, MapPin, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { CollectionSchedule } from "@/types";

const PILOT_SCHEDULES: CollectionSchedule[] = [
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
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-[#147D64] text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/icon.svg" alt="EcoCollect SJ Logo" className="h-10 w-10 rounded-xl shadow-sm bg-white p-0.5" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">EcoCollect SJ</h1>
              <p className="text-xs text-white/80">
                Municipality of San Jose de Buenavista, Antique
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="bg-white text-[#147D64] hover:bg-slate-100 font-semibold px-4 py-2 rounded-lg text-sm shadow transition flex items-center space-x-1"
            >
              <span>MENRO Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#147D64] to-[#0C5241] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            <span>Pilot Barangay: Funda-Dalipe</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Cleaner Communities. Smarter Collections.
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Public Waste Collection Verification Portal. View verified collection days, time windows, and municipal segregation policies in real time.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Pilot Disclosure Alert */}
        <div className="mb-8 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Official Municipal Verification Notice: </span>
            The collection schedule for Barangay Funda-Dalipe is currently undergoing administrative review by MENRO San Jose de Buenavista. Entries below represent proposed operational timetables and will display <strong>VERIFIED</strong> once officially signed and approved.
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#11263A]">
                Barangay Collection Timetables
              </h3>
              <p className="text-sm text-slate-500">
                Official and pending collection windows by waste stream
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILOT_SCHEDULES.map((sched) => {
              const isVerified = sched.verificationStatus === "VERIFIED";

              return (
                <div
                  key={sched.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-sm text-[#11263A]">
                        {sched.barangayName}
                      </span>
                      {isVerified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>OFFICIAL</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3" />
                          <span>PENDING CONFIRMATION</span>
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-black text-[#147D64] mb-1">
                      {sched.dayOfWeek}
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600 text-sm mb-4">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{sched.startTime} – {sched.endTime}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Waste Stream
                      </div>
                      <div className="text-sm font-semibold text-[#11263A]">
                        {sched.wasteCategory === "BIODEGRADABLE" && "Biodegradable (Madunot)"}
                        {sched.wasteCategory === "RECYCLABLE" && "Recyclable (Mabaligya)"}
                        {sched.wasteCategory === "RESIDUAL" && "Residual (Di-madunot)"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                    {isVerified ? (
                      <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Ref: {sched.officialReference}</span>
                      </div>
                    ) : (
                      <span className="text-amber-700">
                        Awaiting MENRO Executive Order
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Municipal Policy Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-[#147D64]">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#11263A] mb-1">
                San Jose de Buenavista Municipal Waste Policy
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                In strict compliance with RA 9003 and Municipal Ordinances, our crews enforce a <strong>“No Segregation, No Collection”</strong> rule. Unsegregated garbage bags will be left uncollected with an official non-compliance notice.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                  Green: Madunot (Biodegradable)
                </span>
                <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-lg font-medium">
                  Blue: Maresiklo (Recyclable)
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  Gray: Di-madunot (Residual)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800">
        <p>EcoCollect SJ — Municipal Environment & Natural Resources Office (MENRO)</p>
        <p className="mt-1">San Jose de Buenavista, Antique, Philippines</p>
      </footer>
    </div>
  );
}
