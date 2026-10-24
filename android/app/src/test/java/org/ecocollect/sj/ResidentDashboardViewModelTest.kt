package org.ecocollect.sj

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.ecocollect.sj.core.model.Barangay
import org.ecocollect.sj.core.model.VerificationStatus
import org.ecocollect.sj.data.repository.BarangayRepositoryImpl
import org.ecocollect.sj.data.repository.ComplaintRepositoryImpl
import org.ecocollect.sj.data.repository.ScheduleRepositoryImpl
import org.ecocollect.sj.feature.dashboard.ResidentDashboardViewModel
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ResidentDashboardViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var barangayRepository: BarangayRepositoryImpl
    private lateinit var scheduleRepository: ScheduleRepositoryImpl
    private lateinit var complaintRepository: ComplaintRepositoryImpl
    private lateinit var viewModel: ResidentDashboardViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        barangayRepository = BarangayRepositoryImpl()
        scheduleRepository = ScheduleRepositoryImpl()
        complaintRepository = ComplaintRepositoryImpl()
        viewModel = ResidentDashboardViewModel(barangayRepository, scheduleRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `pilot barangay Funda-Dalipe defaults to pending verification and is never presented as official`() = runTest {
        advanceUntilIdle()

        val state = viewModel.uiState.value

        assertEquals("funda_dalipe", state.selectedBarangay.id)
        assertTrue("Pilot barangay flag should be true", state.selectedBarangay.isPilot)

        // Master Requirement: Funda-Dalipe schedule has NOT been independently confirmed.
        // It must NOT show isScheduleVerified = true
        assertFalse("Unconfirmed schedule must not be verified", state.isScheduleVerified)
        assertEquals(
            VerificationStatus.PENDING_VERIFICATION,
            state.nextSchedule?.verificationStatus
        )
        assertTrue(
            "Banner must honestly alert resident that confirmation is pending",
            state.statusBannerMessage.contains("awaiting official confirmation")
        )
    }

    @Test
    fun `switching to verified barangay updates verification state correctly`() = runTest {
        advanceUntilIdle()

        val atabay = Barangay("atabay", "Atabay")
        viewModel.selectBarangay(atabay)
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("atabay", state.selectedBarangay.id)
        assertTrue("Verified benchmark schedule should show verified", state.isScheduleVerified)
        assertEquals(VerificationStatus.VERIFIED, state.nextSchedule?.verificationStatus)
        assertEquals("MENRO-RES-2026-088", state.nextSchedule?.officialReference)
    }

    @Test
    fun `live telemetry stale check prevents fabricating arrival times`() {
        val staleTimestamp = System.currentTimeMillis() - (20 * 60 * 1000L) // 20 minutes ago (> 15 mins)
        val progress = org.ecocollect.sj.core.model.LiveCollectionProgress(
            jobId = "test_job",
            barangayId = "funda_dalipe",
            state = org.ecocollect.sj.core.model.RouteProgressState.ON_ROUTE,
            currentPurokName = "Purok Centro",
            assignedVehiclePlate = "SJB-0412",
            totalStops = 10,
            completedStops = 3,
            estimatedArrivalWindow = "07:00 AM",
            lastUpdateEpochMillis = staleTimestamp,
            isDriverGpsActive = true
        )

        assertFalse("Telemetry older than 15 mins must not be fresh", progress.isTelemetryFresh())
        assertEquals(
            "Live tracking temporarily unavailable",
            progress.displayEstimatedArrival
        )
    }

    @Test
    fun `complaint tracking number follows official municipal format EC-YYYYMMDD-XXXX`() = runTest {
        val result = complaintRepository.submitComplaint(
            residentUserId = "user_123",
            residentDisplayName = "Juan Dela Cruz",
            barangayId = "funda_dalipe",
            purokId = "fd_centro",
            category = org.ecocollect.sj.core.model.ComplaintCategory.MISSED_COLLECTION,
            description = "Uncollected biodegradable waste on main street"
        )

        assertNotNull(result.trackingNumber)
        assertTrue(
            "Tracking number must match EC-YYYYMMDD-XXXX format",
            result.trackingNumber.matches(Regex("^EC-\\d{8}-\\d{4}$"))
        )
    }
}
