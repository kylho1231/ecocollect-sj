<div align="center">
  <img src="web/public/logo.svg" width="400" alt="EcoCollect SJ Logo" />
  
  <p><strong>Smart and Centralized Waste Collection, Tracking, Scheduling, and Management System</strong><br/>
  <em>San Jose de Buenavista, Antique, Philippines • Pilot: Barangay Funda-Dalipe</em></p>

  <p>
    <img src="https://img.shields.io/badge/Android-Jetpack%20Compose-147D64?logo=android&logoColor=white" alt="Android Compose" />
    <img src="https://img.shields.io/badge/Web%20Portal-Next.js%2015-11263A?logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Database-Cloud%20Firestore-FFA000?logo=firebase&logoColor=white" alt="Cloud Firestore" />
    <img src="https://img.shields.io/badge/Privacy-RA%2010173%20Compliant-16A34A" alt="Data Privacy Act" />
    <img src="https://img.shields.io/badge/Policy-RA%209003%20Segregation-1EA886" alt="RA 9003" />
  </p>
</div>

---

## 🌿 Overview

**EcoCollect SJ** is an enterprise-grade civic technology system engineered to modernize municipal solid waste collection, citizen schedule verification, route telemetry, and administrative governance for the **Municipality of San Jose de Buenavista, Antique**.

### 🏛️ Core Principles & Truth-in-Data Governance

1. **Honest Schedule Verification Lifecycle**:
   - Proposed schedules display **`PENDING VERIFICATION`** (*"Schedule Awaiting Official Confirmation"*) until an authorized MENRO officer approves them.
   - Verified timetables display **`VERIFIED OFFICIAL`** with an official Executive Order or municipal resolution reference (e.g. `MENRO-EO-2026-004`).
2. **Real-time Telemetry without Fabrication**:
   - Estimated arrival windows are strictly computed from active driver telemetry. If telemetry is older than 15 minutes or inactive, the system explicitly states *"Live tracking temporarily unavailable"* rather than guessing.
3. **No Segregation, No Collection Enforcement (RA 9003)**:
   - Full education guide for households using local Kinaray-a classifications: **Madunot** (Biodegradable), **Mabaligya / Maresiklo** (Recyclable), **Di-madunot** (Residual), and **Delikado** (Special / Hazardous).
4. **Philippine Data Privacy Act (RA 10173)**:
   - Backend Firestore security rules prevent citizen phone numbers, street addresses, and photo evidence from unauthorized public exposure.

---

## 📱 System Modules & Architecture

### 1. Android Resident & Collector Application (`android/`)
- **Framework**: Kotlin, Jetpack Compose, Material Design 3, MVVM + Clean Architecture.
- **Offline Reliability**: Dual-tier storage with Android Jetpack Room (SQLite) and WorkManager idempotent background syncing.
- **Active Screens**:
  - `ResidentDashboardScreen`: Pilot Funda-Dalipe tracker, honest verification card, and Purok filter.
  - `ScheduleScreen`: Filterable weekly timetable by waste stream.
  - `SegregationGuideScreen`: Allowed vs. prohibited materials with Kinaray-a translations.
  - `ReportIncidentScreen`: Camera-enabled missed collection reporter with `EC-YYYYMMDD-XXXX` tracking IDs.
  - `ProfileScreen`: Granular reminder toggles (evening-before, morning-of, truck approaching zone).

### 2. MENRO Administration & Public Web Portal (`web/`)
- **Framework**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Live Citizen Portal (`/`)**: Real-time schedule verification and search without app installation.
- **MENRO Executive Studio (`/admin/dashboard`)**:
  - Live operational metrics (active trucks, pending approvals, open complaints).
  - **Official Sign-off Modal**: One-click Executive Order signing and instant Cloud Firestore publication.
  - **Incident Triage Board**: Rapid lifecycle status progression (`UNDER_REVIEW` $\rightarrow$ `ASSIGNED` $\rightarrow$ `RESOLVED`).

### 3. Cloud Backend & Security (`firebase/`)
- **Cloud Firestore**: Region `asia-southeast1` (Singapore) for low-latency Western Visayas connectivity.
- **Security Rules**: Production-hardened [`firestore.rules`](firebase/firestore.rules) and [`storage.rules`](firebase/storage.rules).
- **Automation Scripts**: [`cloud_shell_setup.sh`](firebase/cloud_shell_setup.sh) and [`seed_cloud_firestore.sh`](firebase/seeds/seed_cloud_firestore.sh).

---

## 📂 Repository Directory Layout

```
ecocollect-sj/
├── android/                         # Native Android Application (Kotlin, Compose, Clean Arch)
│   ├── app/
│   │   ├── google-services.json     # Active Firebase Android Client Configuration
│   │   ├── src/main/java/org/ecocollect/sj/
│   │   │   ├── core/
│   │   │   │   ├── designsystem/    # M3 Theme, Civic Palette, Adaptive Badges
│   │   │   │   └── model/           # Barangay, Schedule, WasteCategory, Complaint
│   │   │   ├── data/repository/     # Live FirestoreScheduleRepository & FirestoreComplaintRepository
│   │   │   ├── feature/
│   │   │   │   ├── dashboard/       # Resident Dashboard (Live Tracker & Honest Status)
│   │   │   │   ├── schedule/        # Full Timetable Browser with Stream Filter
│   │   │   │   ├── segregation/     # RA 9003 Guide (Kinaray-a Terms)
│   │   │   │   ├── complaints/      # Incident Reporter (EC-YYYYMMDD-XXXX)
│   │   │   │   └── profile/         # Alert Preferences & RA 10173 Rights
│   │   │   └── navigation/          # Navigation Compose graph
│   │   └── src/test/java/           # Automated Truth-in-Data Unit Tests
│   ├── build.gradle.kts
│   └── settings.gradle.kts
├── web/                             # Administration Web Portal (Next.js 15, Tailwind)
│   ├── public/                      # Brand assets (logo.svg, icon.svg, logo.jpg)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Public Schedule Verification Portal
│   │   │   └── admin/dashboard/     # MENRO Management Dashboard & Approval Studio
│   │   ├── lib/firebase/            # Real-time Firestore subscriptions & Auth
│   │   └── types/                   # Unified TypeScript Contracts
│   ├── package.json
│   └── tailwind.config.ts
├── firebase/                        # Cloud Infrastructure & Security
│   ├── firestore.rules              # RA 10173 & Schedule Verification Security Rules
│   ├── firestore.indexes.json       # Production Composite Indexes
│   ├── firebase.json                # Emulator & Deployment Config
│   └── seeds/                       # Pilot Funda-Dalipe Seeding Scripts
└── README.md
```

---

## 🚀 Getting Started

### Running the Web Administration Portal
```bash
cd web
npm install
npm run dev
```
- **Citizen Verification Portal**: [`http://localhost:3000`](http://localhost:3000)
- **MENRO Operations Dashboard**: [`http://localhost:3000/admin/dashboard`](http://localhost:3000/admin/dashboard)

### Running the Android Mobile App
1. Open Android Studio (Koala / Ladybug or newer with JDK 17+).
2. Open the directory: `android/`.
3. Allow Gradle to sync.
4. Run on an Android Emulator (API 26+) or physical device.

### Running Automated Verification Tests
```bash
cd android
./gradlew test
```

---

## 📄 License & Attribution

Designed and engineered for the **Municipal Environment & Natural Resources Office (MENRO)** of San Jose de Buenavista, Antique, Philippines.
All data governance structures adhere to **RA 9003** (Ecological Solid Waste Management Act) and **RA 10173** (Data Privacy Act of 2012).
