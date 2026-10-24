"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

export interface TruckLocation {
  id: string;
  driverName: string;
  plateNumber: string;
  lat: number;
  lng: number;
  status: "EN_ROUTE" | "PICKING_UP" | "COMPLETED" | "IDLE";
  currentStopName: string;
  wasteStream: string;
  updatedAt: string;
}

export interface CollectionPit {
  id: string;
  name: string;
  purok: string;
  lat: number;
  lng: number;
  status: "PENDING" | "COLLECTING_NOW" | "COMPLETED";
  wasteCategory: string;
  estimatedVolume: string;
}

interface LiveWasteMapProps {
  trucks?: TruckLocation[];
  pits?: CollectionPit[];
  userLat?: number;
  userLng?: number;
  height?: string;
  interactive?: boolean;
}

const DEFAULT_PITS: CollectionPit[] = [
  {
    id: "pit_01",
    name: "Purok Centro Primary Waste Depot",
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
    purok: "San Pedro Boundary",
    lat: 10.7545,
    lng: 121.9432,
    status: "COMPLETED",
    wasteCategory: "Biodegradable",
    estimatedVolume: "140 kg",
  },
];

const DEFAULT_TRUCKS: TruckLocation[] = [
  {
    id: "truck_01",
    driverName: "Kuya Ruel (MENRO Crew #1)",
    plateNumber: "SJB-0412",
    lat: 10.7480,
    lng: 121.9442,
    status: "PICKING_UP",
    currentStopName: "Purok Centro Primary Waste Depot",
    wasteStream: "Biodegradable (Madunot)",
    updatedAt: "Just now (Live GPS)",
  },
];

export default function LiveWasteMap({
  trucks = DEFAULT_TRUCKS,
  pits = DEFAULT_PITS,
  userLat = 10.7465,
  userLng = 121.9430,
  height = "480px",
  interactive = true,
}: LiveWasteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TRUCKS" | "PITS">("ALL");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around Funda-Dalipe, San Jose de Buenavista
    const centerLat = 10.7475;
    const centerLng = 121.9435;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      // High-resolution OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom Layer Group to easily refresh markers
    const markerGroup = L.layerGroup().addTo(map);

    // 1. Render Citizen User Location Pin
    const userIcon = L.divIcon({
      className: "custom-user-pin",
      html: `
        <div style="background-color: #0284C7; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([userLat, userLng], { icon: userIcon })
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <b style="color: #0284C7;">Your Location</b>
          <p style="margin: 2px 0 0; font-size: 11px; color: #475569;">Barangay Funda-Dalipe, San Jose</p>
        </div>
      `)
      .addTo(markerGroup);

    // 2. Render Collection Pits / Designated Trash Points
    if (activeFilter === "ALL" || activeFilter === "PITS") {
      pits.forEach((pit) => {
        const isCollectingNow = pit.status === "COLLECTING_NOW";
        const isCompleted = pit.status === "COMPLETED";

        const pinColor = isCollectingNow
          ? "#D97706" // Amber / Active
          : isCompleted
          ? "#16A34A" // Green / Done
          : "#64748B"; // Slate / Pending

        const pitIcon = L.divIcon({
          className: "custom-pit-pin",
          html: `
            <div style="background-color: ${pinColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              <span>🗑️</span>
              <span>${pit.purok}</span>
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        L.marker([pit.lat, pit.lng], { icon: pitIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 6px; min-width: 160px;">
              <b style="color: #11263A; font-size: 12px;">${pit.name}</b>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${pit.purok}</div>
              <hr style="margin: 6px 0; border: none; border-top: 1px solid #E2E8F0;" />
              <div style="font-size: 11px;">Status: <b style="color: ${pinColor};">${pit.status.replace("_", " ")}</b></div>
              <div style="font-size: 11px;">Category: <b>${pit.wasteCategory}</b></div>
              <div style="font-size: 11px;">Estimated Volume: <b>${pit.estimatedVolume}</b></div>
            </div>
          `)
          .addTo(markerGroup);
      });
    }

    // 3. Render Active Garbage Trucks / Collectors
    if (activeFilter === "ALL" || activeFilter === "TRUCKS") {
      trucks.forEach((truck) => {
        const isPickingUp = truck.status === "PICKING_UP";

        const truckIcon = L.divIcon({
          className: "custom-truck-pin",
          html: `
            <div style="position: relative;">
              ${
                isPickingUp
                  ? `<div style="position: absolute; top: -6px; left: -6px; width: 44px; height: 44px; border-radius: 50%; background: rgba(20, 125, 100, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                  : ""
              }
              <div style="position: relative; background: #147D64; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                🚛
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        L.marker([truck.lat, truck.lng], { icon: truckIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 6px; min-width: 180px;">
              <div style="background: #EAF7F0; color: #147D64; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 4px;">
                ${truck.plateNumber} • ${truck.status === "PICKING_UP" ? "COLLECTING TRASH NOW" : "EN ROUTE"}
              </div>
              <b style="display: block; color: #11263A; font-size: 12px;">${truck.driverName}</b>
              <div style="font-size: 11px; color: #475569; margin: 4px 0;">
                Current Stop: <b>${truck.currentStopName}</b>
              </div>
              <div style="font-size: 11px; color: #64748B;">Stream: ${truck.wasteStream}</div>
              <div style="font-size: 10px; color: #94A3B8; margin-top: 4px;">GPS Telemetry: ${truck.updatedAt}</div>
            </div>
          `)
          .addTo(markerGroup);
      });
    }

    return () => {
      markerGroup.clearLayers();
    };
  }, [trucks, pits, userLat, userLng, activeFilter]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md">
      {/* Map Control Overlay */}
      <div className="absolute top-3 right-3 z-[400] flex gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === "ALL" ? "bg-[#147D64] text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter("TRUCKS")}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === "TRUCKS" ? "bg-[#147D64] text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🚛 Trucks Only
        </button>
        <button
          onClick={() => setActiveFilter("PITS")}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === "PITS" ? "bg-[#147D64] text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🗑️ Trash Pits
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full" />

      {/* Map Legend Footer */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Truck Active
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            Picking Up Trash
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            Your House
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          OpenStreetMap • San Jose de Buenavista, Antique
        </div>
      </div>
    </div>
  );
}
