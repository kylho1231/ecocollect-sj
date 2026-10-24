package org.ecocollect.sj.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import org.ecocollect.sj.core.model.CollectionSchedule
import org.ecocollect.sj.core.model.LiveCollectionProgress
import org.ecocollect.sj.core.model.RouteProgressState
import org.ecocollect.sj.core.model.VerificationStatus
import org.ecocollect.sj.core.model.WasteCategory
import java.time.DayOfWeek

interface ScheduleRepository {
    fun getSchedulesForBarangay(barangayId: String, purokId: String? = null): Flow<List<CollectionSchedule>>
    fun getLiveRouteProgress(barangayId: String): Flow<LiveCollectionProgress?>
    suspend fun verifySchedule(scheduleId: String, officerUserId: String, officerName: String, referenceDoc: String)
}

class ScheduleRepositoryImpl : ScheduleRepository {

    // Pilot Repository State: Funda-Dalipe schedule is PENDING_VERIFICATION as mandated by Municipal rules
    private val mockSchedules = MutableStateFlow<List<CollectionSchedule>>(
        listOf(
            // FUNDA-DALIPE PROPOSED SCHEDULE (Awaiting MENRO Official Confirmation)
            CollectionSchedule(
                id = "sched_fd_bio",
                barangayId = "funda_dalipe",
                barangayName = "Funda-Dalipe",
                wasteCategory = WasteCategory.BIODEGRADABLE,
                dayOfWeek = DayOfWeek.MONDAY,
                startTime = "06:00 AM",
                endTime = "09:00 AM",
                verificationStatus = VerificationStatus.PENDING_VERIFICATION,
                notes = "Proposed collection window for Purok Centro & Baybay. Awaiting MENRO signed endorsement."
            ),
            CollectionSchedule(
                id = "sched_fd_rec",
                barangayId = "funda_dalipe",
                barangayName = "Funda-Dalipe",
                wasteCategory = WasteCategory.RECYCLABLE,
                dayOfWeek = DayOfWeek.WEDNESDAY,
                startTime = "06:00 AM",
                endTime = "09:00 AM",
                verificationStatus = VerificationStatus.PENDING_VERIFICATION,
                notes = "Proposed recyclable pickup. Resident sorting required."
            ),
            CollectionSchedule(
                id = "sched_fd_res",
                barangayId = "funda_dalipe",
                barangayName = "Funda-Dalipe",
                wasteCategory = WasteCategory.RESIDUAL,
                dayOfWeek = DayOfWeek.FRIDAY,
                startTime = "06:00 AM",
                endTime = "09:00 AM",
                verificationStatus = VerificationStatus.PENDING_VERIFICATION,
                notes = "Proposed residual waste collection."
            ),
            // ATABAY (VERIFIED OFFICIAL BENCHMARK EXAMPLE)
            CollectionSchedule(
                id = "sched_atabay_01",
                barangayId = "atabay",
                barangayName = "Atabay",
                wasteCategory = WasteCategory.BIODEGRADABLE,
                dayOfWeek = DayOfWeek.TUESDAY,
                startTime = "07:00 AM",
                endTime = "10:00 AM",
                verificationStatus = VerificationStatus.VERIFIED,
                officialReference = "MENRO-RES-2026-088",
                verifiedByUserId = "menro_officer_01",
                verifiedByUserName = "Engr. M. Delgado (MENRO)",
                verifiedTimestamp = 1774000000000L,
                notes = "Official schedule validated per Executive Order No. 12."
            )
        )
    )

    override fun getSchedulesForBarangay(barangayId: String, purokId: String?): Flow<List<CollectionSchedule>> {
        return mockSchedules.map { list ->
            list.filter { it.barangayId == barangayId }
        }
    }

    override fun getLiveRouteProgress(barangayId: String): Flow<LiveCollectionProgress?> {
        // Honest data rule: For Funda-Dalipe, active driver telemetry is only simulated if configured.
        // If driver GPS is not active, LiveCollectionProgress will reflect isDriverGpsActive = false.
        val progress = if (barangayId == "funda_dalipe") {
            LiveCollectionProgress(
                jobId = "job_pilot_01",
                barangayId = "funda_dalipe",
                state = RouteProgressState.APPROACHING_AREA,
                currentPurokName = "Purok Centro",
                assignedVehiclePlate = "SJB-0412",
                totalStops = 14,
                completedStops = 8,
                estimatedArrivalWindow = "07:15 AM - 07:30 AM",
                lastUpdateEpochMillis = System.currentTimeMillis() - (5 * 60 * 1000L), // 5 minutes ago (Fresh)
                isDriverGpsActive = true
            )
        } else {
            null
        }
        return MutableStateFlow(progress).asStateFlow()
    }

    override suspend fun verifySchedule(
        scheduleId: String,
        officerUserId: String,
        officerName: String,
        referenceDoc: String
    ) {
        val current = mockSchedules.value.toMutableList()
        val index = current.indexOfFirst { it.id == scheduleId }
        if (index != -1) {
            val item = current[index]
            current[index] = item.copy(
                verificationStatus = VerificationStatus.VERIFIED,
                officialReference = referenceDoc,
                verifiedByUserId = officerUserId,
                verifiedByUserName = officerName,
                verifiedTimestamp = System.currentTimeMillis()
            )
            mockSchedules.value = current
        }
    }
}
