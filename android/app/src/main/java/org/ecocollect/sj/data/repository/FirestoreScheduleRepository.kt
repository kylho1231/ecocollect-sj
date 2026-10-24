package org.ecocollect.sj.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import org.ecocollect.sj.core.model.CollectionSchedule
import org.ecocollect.sj.core.model.LiveCollectionProgress
import org.ecocollect.sj.core.model.RouteProgressState
import org.ecocollect.sj.core.model.VerificationStatus
import org.ecocollect.sj.core.model.WasteCategory
import java.time.DayOfWeek

/**
 * Production implementation of ScheduleRepository that communicates
 * with live Cloud Firestore in real time.
 * Enforces the municipal Truth-in-Data rule: Never display an unconfirmed schedule as verified.
 */
class FirestoreScheduleRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ScheduleRepository {

    override fun getSchedulesForBarangay(barangayId: String, purokId: String?): Flow<List<CollectionSchedule>> = callbackFlow {
        val collectionRef = firestore.collection("collection_schedules")
            .whereEqualTo("barangayId", barangayId)

        val registration: ListenerRegistration = collectionRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                // If permission denied or offline, emit empty list rather than crashing
                trySend(emptyList())
                return@addSnapshotListener
            }

            if (snapshot != null) {
                val schedules = snapshot.documents.mapNotNull { doc ->
                    try {
                        val rawCategory = doc.getString("wasteCategory") ?: "BIODEGRADABLE"
                        val category = try {
                            WasteCategory.valueOf(rawCategory.uppercase())
                        } catch (e: Exception) {
                            WasteCategory.BIODEGRADABLE
                        }

                        val dayNum = doc.getLong("dayOfWeek")?.toInt() ?: 1
                        val dayOfWeek = DayOfWeek.of(dayNum.coerceIn(1, 7))

                        val rawStatus = doc.getString("verificationStatus") ?: "PENDING_VERIFICATION"
                        val verificationStatus = try {
                            VerificationStatus.valueOf(rawStatus)
                        } catch (e: Exception) {
                            VerificationStatus.PENDING_VERIFICATION
                        }

                        CollectionSchedule(
                            id = doc.id,
                            barangayId = doc.getString("barangayId") ?: barangayId,
                            barangayName = doc.getString("barangayName") ?: "Barangay $barangayId",
                            wasteCategory = category,
                            dayOfWeek = dayOfWeek,
                            startTime = doc.getString("startTime") ?: "06:00 AM",
                            endTime = doc.getString("endTime") ?: "09:00 AM",
                            verificationStatus = verificationStatus,
                            officialReference = doc.getString("officialReference"),
                            verifiedByUserName = doc.getString("verifiedByUserName"),
                            verifiedTimestamp = doc.getLong("verifiedTimestamp"),
                            notes = doc.getString("notes") ?: ""
                        )
                    } catch (e: Exception) {
                        null
                    }
                }
                trySend(schedules)
            }
        }

        awaitClose { registration.remove() }
    }

    override fun getLiveRouteProgress(barangayId: String): Flow<LiveCollectionProgress?> = callbackFlow {
        // Query live collection jobs for this barangay
        val jobsRef = firestore.collection("collection_jobs")
            .whereEqualTo("barangayId", barangayId)
            .orderBy("startedAt", Query.Direction.DESCENDING)
            .limit(1)

        val registration = jobsRef.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null || snapshot.isEmpty) {
                trySend(null)
                return@addSnapshotListener
            }

            val doc = snapshot.documents.first()
            val rawState = doc.getString("status") ?: "NOT_STARTED"
            val state = try {
                RouteProgressState.valueOf(rawState)
            } catch (e: Exception) {
                RouteProgressState.NOT_STARTED
            }

            val lastUpdate = doc.getTimestamp("lastTelemetryTimestamp")?.toDate()?.time
                ?: doc.getTimestamp("startedAt")?.toDate()?.time
                ?: 0L

            val progress = LiveCollectionProgress(
                jobId = doc.id,
                barangayId = barangayId,
                state = state,
                currentPurokName = doc.getString("currentPurokName"),
                assignedVehiclePlate = doc.getString("assignedVehiclePlate"),
                totalStops = doc.getLong("totalStops")?.toInt() ?: 0,
                completedStops = doc.getLong("completedStops")?.toInt() ?: 0,
                estimatedArrivalWindow = doc.getString("estimatedArrivalWindow"),
                lastUpdateEpochMillis = lastUpdate,
                isDriverGpsActive = doc.getBoolean("isDriverGpsActive") ?: false
            )
            trySend(progress)
        }

        awaitClose { registration.remove() }
    }

    override suspend fun verifySchedule(
        scheduleId: String,
        officerUserId: String,
        officerName: String,
        referenceDoc: String
    ) {
        val updates = mapOf(
            "verificationStatus" to "VERIFIED",
            "officialReference" to referenceDoc,
            "verifiedByUserId" to officerUserId,
            "verifiedByUserName" to officerName,
            "verifiedTimestamp" to System.currentTimeMillis()
        )
        firestore.collection("collection_schedules").document(scheduleId).update(updates)
    }
}
