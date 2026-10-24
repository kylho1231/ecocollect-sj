#!/bin/bash
# ==============================================================================
# EcoCollect SJ: Live Cloud Firestore Seeder (Run in Google Cloud Shell)
# ==============================================================================
set -e

PROJECT_ID="ecocollect-sj-10314"
TOKEN=$(gcloud auth print-access-token)
BASE_URL="https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents"

echo ">>> Seeding Live Cloud Firestore for project [$PROJECT_ID]..."

# 1. Pilot Barangay: Funda-Dalipe
echo "Seeding Barangay Funda-Dalipe..."
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/barangays?documentId=funda_dalipe" \
  -d '{
    "fields": {
      "name": {"stringValue": "Funda-Dalipe"},
      "municipality": {"stringValue": "San Jose de Buenavista"},
      "province": {"stringValue": "Antique"},
      "isPilot": {"booleanValue": true},
      "purokCount": {"integerValue": "5"}
    }
  }' > /dev/null

# 2. Benchmark Barangay: Atabay
echo "Seeding Barangay Atabay..."
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/barangays?documentId=atabay" \
  -d '{
    "fields": {
      "name": {"stringValue": "Atabay"},
      "municipality": {"stringValue": "San Jose de Buenavista"},
      "province": {"stringValue": "Antique"},
      "isPilot": {"booleanValue": false},
      "purokCount": {"integerValue": "2"}
    }
  }' > /dev/null

# 3. Funda-Dalipe Proposed Schedules (Pending Verification)
echo "Seeding Funda-Dalipe Proposed Schedules..."
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/collection_schedules?documentId=sched_fd_bio" \
  -d '{
    "fields": {
      "barangayId": {"stringValue": "funda_dalipe"},
      "barangayName": {"stringValue": "Funda-Dalipe"},
      "wasteCategory": {"stringValue": "BIODEGRADABLE"},
      "dayOfWeek": {"integerValue": "1"},
      "startTime": {"stringValue": "06:00 AM"},
      "endTime": {"stringValue": "09:00 AM"},
      "verificationStatus": {"stringValue": "PENDING_VERIFICATION"},
      "statusDescription": {"stringValue": "Schedule Awaiting Official Confirmation"},
      "notes": {"stringValue": "Proposed morning route for food and garden waste."}
    }
  }' > /dev/null

curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/collection_schedules?documentId=sched_fd_rec" \
  -d '{
    "fields": {
      "barangayId": {"stringValue": "funda_dalipe"},
      "barangayName": {"stringValue": "Funda-Dalipe"},
      "wasteCategory": {"stringValue": "RECYCLABLE"},
      "dayOfWeek": {"integerValue": "3"},
      "startTime": {"stringValue": "06:00 AM"},
      "endTime": {"stringValue": "09:00 AM"},
      "verificationStatus": {"stringValue": "PENDING_VERIFICATION"},
      "statusDescription": {"stringValue": "Schedule Awaiting Official Confirmation"},
      "notes": {"stringValue": "Proposed recyclable collection for bottles, cardboard, and tins."}
    }
  }' > /dev/null

# 4. Atabay Verified Official Benchmark Schedule
echo "Seeding Atabay Verified Schedule..."
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/collection_schedules?documentId=sched_atabay_01" \
  -d '{
    "fields": {
      "barangayId": {"stringValue": "atabay"},
      "barangayName": {"stringValue": "Atabay"},
      "wasteCategory": {"stringValue": "BIODEGRADABLE"},
      "dayOfWeek": {"integerValue": "2"},
      "startTime": {"stringValue": "07:00 AM"},
      "endTime": {"stringValue": "10:00 AM"},
      "verificationStatus": {"stringValue": "VERIFIED"},
      "officialReference": {"stringValue": "MENRO-RES-2026-088"},
      "verifiedByUserName": {"stringValue": "Engr. M. Delgado (MENRO)"},
      "notes": {"stringValue": "Official schedule validated per Executive Order No. 12."}
    }
  }' > /dev/null

echo "✓ Live Cloud Firestore seeding complete!"
