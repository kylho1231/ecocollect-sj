package org.ecocollect.sj.core.model

/**
 * Citizen incident and missed collection reporting models.
 */
enum class ComplaintCategory(val displayName: String) {
    MISSED_COLLECTION("Missed Garbage Collection"),
    DELAYED_COLLECTION("Unannounced Delay in Service"),
    UNCOLLECTED_WASTE("Uncollected / Leftover Waste"),
    ILLEGAL_DUMPING("Illegal Dumping / Open Burning"),
    OVERFLOWING_BIN("Overflowing Collection Point"),
    OTHER("Other Municipal Waste Issue")
}

enum class ComplaintStatus(val displayName: String, val badgeColorHex: Long) {
    SUBMITTED("Submitted", 0xFF64748B),
    UNDER_REVIEW("Under Review", 0xFF0284C7),
    ASSIGNED("Assigned to Route Team", 0xFF8B5CF6),
    IN_PROGRESS("Action In Progress", 0xFFD97706),
    RESOLVED("Resolved", 0xFF16A34A),
    CLOSED("Closed", 0xFF334155)
}

data class Complaint(
    val id: String,
    val trackingNumber: String,
    val residentUserId: String,
    val residentDisplayName: String,
    val barangayId: String,
    val purokId: String,
    val category: ComplaintCategory,
    val description: String,
    val photoUrls: List<String> = emptyList(),
    val status: ComplaintStatus = ComplaintStatus.SUBMITTED,
    val resolutionNotes: String? = null,
    val createdAtEpochMillis: Long = System.currentTimeMillis()
)
