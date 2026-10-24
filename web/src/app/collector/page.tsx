"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  Radio,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
  Play,
  RotateCcw,
  Sparkles,
  RefreshCw,
  PhoneCall,
  FileSpreadsheet,
} from "lucide-react";
import {
  subscribeToCollectionPits,
  updatePitStatus,
  updateTruckTelemetry,
  logWasteCollectionInFirestore,
  subscribeToLiveTrucks,
} from "@/lib/firebase/firestore";
import { CollectionPit, WasteCategory, TruckTelemetry } from "@/types";

// Dynamic Leaflet OpenStreetMap with SSR disabled
const LiveWasteMap = dynamic(() => import("@/components/map/LiveWasteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-800">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <div className="text-xs font-semibold text-emerald-400">Connecting GPS & OpenStreetMap...</div>
    </div>
  ),
});

const DEFAULT_PITS: CollectionPit[] = [
  {
    id: "pit_01",
    name: "Purok Centro Primary Waste Depot",
    barangayId: "funda_dalipe",
    purok: "Purok Centro",
    lat: 10.7482,
    lng: 121.9445,
    status: "COLLECTING_NOW",
    wasteCategory: "Biodegradable",
    estimatedVolume: "120 kg",
  },
  {
    id: "pit_02",
    name: "Baybay Coastal Collection Pit",
    barangayId: "funda_dalipe",
    purok: "Purok Baybay",
    lat: 10.7438,
    lng: 121.9392,
    status: "PENDING",
    wasteCategory: "Recyclable",
    estimatedVolume: "85 kg",
  },
  {
    id: "pit_03",
    name: "Highway Crossing Community Bin",
    barangayId: "funda_dalipe",
    purok: "Purok Crossing",
    lat: 10.7512,
    lng: 121.9481,
    status: "PENDING",
    wasteCategory: "Residual",
    estimatedVolume: "210 kg",
  },
  {
    id: "pit_04",
    name: "Funda-Dalipe Boundary Drop-off",
    barangayId: "funda_dalipe",
    purok: "San Pedro Boundary",
    lat: 10.7545,
    lng: 121.9432,
    status: "COMPLETED",
    wasteCategory: "Biodegradable",
    estimatedVolume: "140 kg",
  },
];

export default function CollectorPwaPage() {
  const router = useRouter();
  const [collectorUser, setCollectorUser] = useState<any>(null);

  // Live GPS Telemetry
  const [currentLat, setCurrentLat] = useState<number>(10.7480);
  const [currentLng, setCurrentLng] = useState<number>(121.9442);
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsActive, setGpsActive] = useState<boolean>(true);
  const [lastTelemetryPing, setLastTelemetryPing] = useState<string>("Connecting...");
  const [isSimulatingGps, setIsSimulatingGps] = useState<boolean>(false);

  // Operational Route & Stops State
  const [pits, setPits] = useState<CollectionPit[]>(DEFAULT_PITS);
  const [activeStop, setActiveStop] = useState<CollectionPit | null>(DEFAULT_PITS[0]);
  const [totalShiftWeightKg, setTotalShiftWeightKg] = useState<number>(140);
  const [currentShiftStatus, setCurrentShiftStatus] = useState<"EN_ROUTE" | "PICKING_UP" | "COMPLETED">("PICKING_UP");

  // Modals
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isRefusalModalOpen, setIsRefusalModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState("120");
  const [bagCountInput, setBagCountInput] = useState("6");
  const [wasteCategoryInput, setWasteCategoryInput] = useState<WasteCategory>("BIODEGRADABLE");
  const [collectionNotes, setCollectionNotes] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [refusalReason, setRefusalReason] = useState("Unsegregated Waste (RA 9003 Non-compliance)");

  // 1. Authenticate Collector Session
  useEffect(() => {
    const rawSession = localStorage.getItem("ecocollect_collector_session");
    if (!rawSession) {
      router.replace("/collector/login");
      return;
    }
    try {
      const user = JSON.parse(rawSession);
      setCollectorUser(user);
    } catch (e) {
      router.replace("/collector/login");
    }
  }, [router]);

  // 2. Real-time Firestore Pits Subscription
  useEffect(() => {
    const unsubPits = subscribeToCollectionPits((livePits) => {
      if (livePits.length > 0) {
        setPits(livePits);
        // keep active stop in sync
        if (activeStop) {
          const matched = livePits.find((p) => p.id === activeStop.id);
          if (matched) setActiveStop(matched);
        }
      }
    });

    return () => unsubPits();
  }, [activeStop]);

  // 3. Always-on GPS Geolocation Tracking & Firestore Streaming
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    let watchId: number;

    const pushTelemetryToFirestore = async (lat: number, lng: number, spd: number, hdg: number) => {
      const truckId = collectorUser?.assignedTruckPlate || "SJB-0412";
      const nowString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastTelemetryPing(nowString);

      try {
        await updateTruckTelemetry(truckId, {
          driverName: collectorUser?.fullName || "Kuya Ruel",
          plateNumber: truckId,
          assignedBarangayId: collectorUser?.assignedBarangayId || "funda_dalipe",
          assignedBarangayName: collectorUser?.assignedBarangayName || "Barangay Funda-Dalipe",
          lat,
          lng,
          speed: spd,
          heading: hdg,
          status: currentShiftStatus,
          currentStopName: activeStop?.name || "En Route in Funda-Dalipe",
          wasteStream: activeStop?.wasteCategory || "Biodegradable",
        });
      } catch (err) {
        console.warn("Telemetry push warning:", err);
      }
    };

    if (gpsActive && !isSimulatingGps) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const spd = Math.round((pos.coords.speed || 0) * 3.6); // convert to km/h
          const hdg = Math.round(pos.coords.heading || 0);

          setCurrentLat(lat);
          setCurrentLng(lng);
          setSpeed(spd);
          setHeading(hdg);
          setGpsAccuracy(Math.round(pos.coords.accuracy));

          pushTelemetryToFirestore(lat, lng, spd, hdg);
        },
        (err) => {
          console.warn("Live GPS watch notification (using municipal baseline coords):", err.message);
          // Keep current fallback coordinates and stream them
          pushTelemetryToFirestore(currentLat, currentLng, speed, heading);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 10000,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [gpsActive, isSimulatingGps, collectorUser, currentShiftStatus, activeStop]);

  // 4. GPS Simulation Loop (for instant testing without needing a moving truck)
  useEffect(() => {
    if (!isSimulatingGps) return;

    const interval = setInterval(() => {
      // Simulate slow vehicle movement through Funda-Dalipe streets
      setCurrentLat((prev) => prev + (Math.random() - 0.48) * 0.0003);
      setCurrentLng((prev) => prev + (Math.random() - 0.48) * 0.0003);
      setSpeed(Math.floor(15 + Math.random() * 12));
      setLastTelemetryPing(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

      if (collectorUser) {
        const truckId = collectorUser?.assignedTruckPlate || "SJB-0412";
        updateTruckTelemetry(truckId, {
          lat: currentLat,
          lng: currentLng,
          speed: 18,
          status: currentShiftStatus,
          currentStopName: activeStop?.name || "Funda-Dalipe Route",
        }).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingGps, currentLat, currentLng, collectorUser, currentShiftStatus, activeStop]);

  // Action: Arrived at Stop
  const handleArrivedAtStop = async (pit: CollectionPit) => {
    setActiveStop(pit);
    setCurrentShiftStatus("PICKING_UP");

    try {
      await updatePitStatus(pit.id, "COLLECTING_NOW");
      setPits((prev) =>
        prev.map((p) => (p.id === pit.id ? { ...p, status: "COLLECTING_NOW" } : p))
      );
      if (collectorUser) {
        await updateTruckTelemetry(collectorUser.assignedTruckPlate || "SJB-0412", {
          status: "PICKING_UP",
          currentStopName: pit.name,
        });
      }
    } catch (e) {
      console.error("Failed to update stop status:", e);
    }
  };

  // Action: Submit Waste Collection Log
  const handleSubmitWasteLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStop) return;

    setIsSubmittingLog(true);
    const weightNum = parseFloat(weightInput) || 0;
    const bagNum = parseInt(bagCountInput) || 1;

    try {
      await logWasteCollectionInFirestore({
        stopId: activeStop.id,
        stopName: activeStop.name,
        barangayId: activeStop.barangayId || collectorUser?.assignedBarangayId || "funda_dalipe",
        barangayName: collectorUser?.assignedBarangayName || "Barangay Funda-Dalipe",
        collectorId: collectorUser?.id || "col_ruel",
        collectorName: collectorUser?.fullName || "Kuya Ruel",
        truckPlate: collectorUser?.assignedTruckPlate || "SJB-0412",
        wasteCategory: wasteCategoryInput,
        weightKg: weightNum,
        bagCount: bagNum,
        notes: collectionNotes,
      });

      await updatePitStatus(activeStop.id, "COMPLETED");

      // Update local state
      setPits((prev) =>
        prev.map((p) => (p.id === activeStop.id ? { ...p, status: "COMPLETED" } : p))
      );
      setTotalShiftWeightKg((prev) => prev + weightNum);
      setCurrentShiftStatus("EN_ROUTE");

      if (collectorUser) {
        await updateTruckTelemetry(collectorUser.assignedTruckPlate || "SJB-0412", {
          status: "EN_ROUTE",
          currentStopName: "En route to next depot stop",
        });
      }

      setIsWeightModalOpen(false);
      setCollectionNotes("");
    } catch (err) {
      console.error("Failed to log waste:", err);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Action: Submit Non-collection Refusal
  const handleSubmitRefusal = async () => {
    if (!activeStop) return;

    setIsSubmittingLog(true);
    try {
      await logWasteCollectionInFirestore({
        stopId: activeStop.id,
        stopName: activeStop.name,
        barangayId: activeStop.barangayId || "funda_dalipe",
        barangayName: collectorUser?.assignedBarangayName || "Barangay Funda-Dalipe",
        collectorId: collectorUser?.id || "col_ruel",
        collectorName: collectorUser?.fullName || "Kuya Ruel",
        truckPlate: collectorUser?.assignedTruckPlate || "SJB-0412",
        wasteCategory: "RESIDUAL",
        weightKg: 0,
        bagCount: 0,
        notes: `REFUSAL / INCIDENT: ${refusalReason}`,
        refusalReason,
      });

      setIsRefusalModalOpen(false);
      alert(`Incident recorded: ${refusalReason}. Notification logged for MENRO San Jose Inspector.`);
    } catch (e) {
      console.error("Failed to submit refusal:", e);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ecocollect_collector_session");
    router.push("/collector/login");
  };

  // Prepare trucks data for Leaflet Map
  const liveTrucksForMap = [
    {
      id: collectorUser?.assignedTruckPlate || "truck_01",
      driverName: collectorUser?.fullName || "Kuya Ruel (MENRO Field Crew)",
      plateNumber: collectorUser?.assignedTruckPlate || "SJB-0412",
      lat: currentLat,
      lng: currentLng,
      status: currentShiftStatus,
      currentStopName: activeStop?.name || "Funda-Dalipe Route",
      wasteStream: activeStop?.wasteCategory || "Biodegradable",
      updatedAt: `GPS ${lastTelemetryPing} (${speed} km/h)`,
    },
  ];

  const completedStopsCount = pits.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-800 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top App Bar with High-Visibility Telemetry Badge */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-tight">EcoCollect FIELD</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {collectorUser?.assignedTruckPlate || "SJB-0412"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>{collectorUser?.fullName || "Field Crew"}</span>
                <span>•</span>
                <span className="text-emerald-400">{collectorUser?.assignedBarangayName || "Brgy. Funda-Dalipe"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleLogout}
              title="End Shift / Logout"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Real-time GPS Telemetry Streaming Pill */}
        <div className="mt-2.5 flex items-center justify-between bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 relative"></span>
            </div>
            <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
              GPS Streaming Live to MENRO
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Ping: {lastTelemetryPing}
          </div>
        </div>
      </header>

      {/* Main Field Cockpit */}
      <main className="flex-1 p-4 space-y-4 pb-24 overflow-y-auto">
        {/* OpenStreetMap Section */}
        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Assigned Barangay Route Map</span>
            </span>
            <button
              onClick={() => setIsSimulatingGps(!isSimulatingGps)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                isSimulatingGps
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isSimulatingGps ? "Moving GPS Route..." : "Simulate Motion"}</span>
            </button>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
            <LiveWasteMap
              trucks={liveTrucksForMap}
              pits={pits}
              userLat={currentLat}
              userLng={currentLng}
              height="340px"
            />
          </div>
        </section>

        {/* Current Active Collection Stop Card */}
        {activeStop && (
          <section className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Target Collection Stop
                </span>
                <h2 className="text-base font-extrabold text-white mt-1">
                  {activeStop.name}
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  <span>{activeStop.purok} • Expected: {activeStop.wasteCategory}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {activeStop.estimatedVolume}
                </span>
                <div className="text-[10px] text-slate-500">Est. Volume</div>
              </div>
            </div>

            {/* Stop Action Cockpit Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsWeightModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950 transition active:scale-95 text-xs"
              >
                <Scale className="h-4 w-4" />
                <span>Log Collected Weight</span>
              </button>

              <button
                onClick={() => setIsRefusalModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold py-3 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition active:scale-95 text-xs"
              >
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Report Non-Pickup</span>
              </button>
            </div>
          </section>
        )}

        {/* Route Stops Checklist */}
        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Barangay Stops ({completedStopsCount}/{pits.length} Done)
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              {totalShiftWeightKg} kg Total Loaded
            </span>
          </div>

          <div className="space-y-2">
            {pits.map((pit, idx) => {
              const isSelected = activeStop?.id === pit.id;
              const isDone = pit.status === "COMPLETED";
              const isCollecting = pit.status === "COLLECTING_NOW";

              return (
                <div
                  key={pit.id}
                  onClick={() => setActiveStop(pit)}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-slate-800 border-emerald-500 shadow-md"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isCollecting
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{pit.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {pit.purok} • {pit.wasteCategory} ({pit.estimatedVolume})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isDone ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                        Cleared
                      </span>
                    ) : isCollecting ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-semibold">
                        Active Stop
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArrivedAtStop(pit);
                        }}
                        className="text-[11px] bg-slate-800 hover:bg-emerald-600 text-slate-200 px-2.5 py-1 rounded-lg font-bold border border-slate-700 hover:border-transparent transition"
                      >
                        Arrive
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Direct Radio / Dispatch Contact Button */}
        <div className="pt-2">
          <a
            href="tel:09170000000"
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-300 font-semibold transition"
          >
            <div className="flex items-center space-x-2.5">
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <span>Contact MENRO San Jose Radio Dispatch</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">Call HQ →</span>
          </a>
        </div>
      </main>

      {/* MODAL 1: Weight & Volume Logging Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Log Collected Waste</h3>
                <p className="text-xs text-slate-400">{activeStop?.name}</p>
              </div>
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWasteLog} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Waste Category
                </label>
                <select
                  value={wasteCategoryInput}
                  onChange={(e) => setWasteCategoryInput(e.target.value as WasteCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BIODEGRADABLE">Biodegradable (Madunot)</option>
                  <option value="RECYCLABLE">Recyclable (Mabaligya / Magamit Liwat)</option>
                  <option value="RESIDUAL">Residual (Non-recyclable)</option>
                  <option value="SPECIAL">Special / Household Hazardous</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="120"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sacks / Bins
                  </label>
                  <input
                    type="number"
                    value={bagCountInput}
                    onChange={(e) => setBagCountInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="6"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Crew Notes / Remarks
                </label>
                <input
                  type="text"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  placeholder="e.g. Well-segregated by community leaders"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLog}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition"
              >
                {isSubmittingLog ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm & Mark Stop Completed</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Refusal & Violation Report Modal */}
      {isRefusalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Report Non-Collection</span>
                </h3>
                <p className="text-xs text-slate-400">{activeStop?.name}</p>
              </div>
              <button
                onClick={() => setIsRefusalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Municipal Violation / Obstruction:
              </label>

              {[
                "Unsegregated Waste (RA 9003 Non-compliance)",
                "Road Obstruction / Truck Inaccessible",
                "Hazardous / Medical Contamination",
                "Locked Gate / Private Area Impasse",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRefusalReason(reason)}
                  className={`w-full p-3 rounded-xl text-left text-xs font-semibold border transition ${
                    refusalReason === reason
                      ? "bg-amber-500/20 border-amber-500 text-amber-200"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {reason}
                </button>
              ))}

              <button
                onClick={handleSubmitRefusal}
                disabled={isSubmittingLog}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-950 flex items-center justify-center space-x-2 transition mt-2"
              >
                <span>Submit Refusal Incident to MENRO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
