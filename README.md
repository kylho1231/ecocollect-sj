# EcoCollect SJ
**Smart and Centralized Waste Collection, Tracking, Scheduling, and Management System**  
*Municipality of San Jose de Buenavista, Antique, Philippines*  
*Pilot Barangay: Funda-Dalipe*

---

## Overview

EcoCollect SJ is a production-oriented civic technology platform designed to modernize solid waste collection, citizen reporting, route progress tracking, and administrative governance for San Jose de Buenavista, Antique.

### Core Philosophy: Honest Municipal Data
In strict accordance with municipal governance principles:
- **No Fabricated Arrival Times**: Live arrival windows are only calculated and shown when active, fresh (< 15 min) driver GPS telemetry is present. Otherwise, the system honestly states *"Live tracking temporarily unavailable"*.
- **Official Schedule Verification Lifecycle**: Unconfirmed collection timetables are marked **PENDING VERIFICATION** and display *"Schedule Awaiting Official Confirmation"*. Only authorized MENRO officers can sign off with an official executive reference number to mark a schedule **VERIFIED**.
- **No Segregation, No Collection**: Full education and enforcement rules based on Republic Act No. 9003 with local Kinaray-a terms (*Madunot*, *Mabaligya*, *Di-madunot*, *Delikado*).
- **Philippine Data Privacy Act (RA 10173)**: Sensitive complainant PII (phone numbers, exact home addresses) are strictly protected on the backend via verified Cloud Firestore Security Rules.

---

## Project Structure

```
basura/
├── android/                         # Native Android Application (Kotlin, Compose, Clean Arch)
│   ├── app/
│   │   ├── src/main/java/org/ecocollect/sj/
│   │   │   ├── core/
│   │   │   │   ├── designsystem/    # M3 Theme, Civic Palette, Honest Badges
│   │   │   │   └── model/           # Barangay, Schedule, WasteCategory, Complaint
│   │   │   ├── data/repository/     # Schedule, Barangay, Complaint Repositories
│   │   │   ├── feature/
│   │   │   │   ├── dashboard/       # Resident Dashboard (Honest Status & Tracker)
│   │   │   │   ├── segregation/     # RA 9003 Segregation Guide (Kinaray-a terms)
│   │   │   │   └── complaints/      # Incident Reporter (EC-YYYYMMDD-XXXX tracking)
│   │   │   ├── navigation/          # Navigation Compose graph
│   │   │   ├── EcoCollectApp.kt     # Application class & DI
│   │   │   └── MainActivity.kt      # Main Entry Point
│   │   └── src/test/java/           # Unit & ViewModel verification tests
│   ├── build.gradle.kts
│   └── settings.gradle.kts
├── web/                             # Administration Web Portal (Next.js 15, Tailwind)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Public Verification Portal (no app required)
│   │   │   └── admin/dashboard/     # MENRO Management Dashboard & Verification Studio
│   │   └── types/                   # Unified TypeScript contracts
│   ├── package.json
│   └── tailwind.config.ts
├── firebase/                        # Cloud Infrastructure & Security
│   ├── firestore.rules              # RA 10173 & Verification Security Rules
│   ├── firestore.indexes.json       # Production composite indexes
│   ├── firebase.json                # Emulator & deployment config
│   └── seeds/                       # Verified & pending demonstration seed datasets
└── README.md
```

---

## Running the Web Administration Portal

1. Navigate to the `web/` directory:
   ```bash
   cd web
   ```
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open your browser:
   - **Public Citizen Portal**: `http://localhost:3000/`
   - **MENRO Administration Dashboard**: `http://localhost:3000/admin/dashboard`

---

## Running the Android Mobile Application

1. Open **Android Studio** (Koala / Ladybug or newer with JDK 17+ / JBR).
2. Open the directory: `c:\Users\jhonk\OneDrive\Documents\basura\android`.
3. Allow Gradle to sync.
4. Run on an Android Emulator or physical device (API 26+).

---

## Automated Tests

Unit tests verify the core municipal truth-in-data rules:
- Unverified schedules for Funda-Dalipe are never presented as official.
- Stale telemetry (>15 mins) suppresses arrival estimates.
- Complaint tracking numbers strictly conform to `EC-YYYYMMDD-XXXX`.

Run tests via Android Studio or command line:
```bash
cd android
./gradlew test
```
