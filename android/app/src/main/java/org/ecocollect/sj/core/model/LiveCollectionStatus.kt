package org.ecocollect.sj.core.model

/**
 * Real-time collection truck and route progress states.
 * Real and verified rule: Arrival time estimates are only calculated and displayed
 * when active, reliable telemetry is present. If stale (>15 mins), fallback to
 * "Live tracking temporarily unavailable".
 */
enum class RouteProgressState(val label: String, val stepIndex: Int) {
    NOT_STARTED("Not Started", 0),
    PREPARING("Preparing at Motorpool", 1),
    ON_ROUTE("On Route to Barangay", 2),
    APPROACHING_AREA("Approaching Service Area", 3),
    COLLECTING("Collecting Waste in Barangay", 4),
    COMPLETED("Collection Completed", 5),
    DELAYED("Service Delayed", -1),
    CANCELED("Service Canceled", -2)
}

data class LiveCollectionProgress(
    val jobId: String,
    val barangayId: String,
    val state: RouteProgressState,
    val currentPurokName: String?,
    val assignedVehiclePlate: String?,
    val totalStops: Int,
    val completedStops: Int,
    val estimatedArrivalWindow: String?, // null if not reliably computable
    val lastUpdateEpochMillis: Long,
    val isDriverGpsActive: Boolean
) {
    /**
     * Determines whether the telemetry data is fresh enough (within 15 minutes)
     * to show live estimates.
     */
    fun isTelemetryFresh(currentTimeMillis: Long = System.currentTimeMillis()): Boolean {
        val fifteenMinutesMillis = 15 * 60 * 1000L
        return isDriverGpsActive && (currentTimeMillis - lastUpdateEpochMillis) <= fifteenMinutesMillis
    }

    val displayEstimatedArrival: String
        get() = if (isTelemetryFresh() && !estimatedArrivalWindow.isNullOrBlank()) {
            "Estimated arrival: $estimatedArrivalWindow (Live)"
        } else {
            "Live tracking temporarily unavailable"
        }
}
