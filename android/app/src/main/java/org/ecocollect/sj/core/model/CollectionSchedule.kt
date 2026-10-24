package org.ecocollect.sj.core.model

import java.time.DayOfWeek

/**
 * Immutable collection schedule entity.
 * In accordance with municipal guidelines, unverified schedules must clearly state
 * their pending status and must never be shown as official until verified by an authorized officer.
 */
data class CollectionSchedule(
    val id: String,
    val barangayId: String,
    val barangayName: String,
    val purokIds: List<String> = emptyList(),
    val wasteCategory: WasteCategory,
    val dayOfWeek: DayOfWeek,
    val startTime: String, // e.g. "06:00 AM"
    val endTime: String,   // e.g. "09:00 AM"
    val verificationStatus: VerificationStatus,
    val officialReference: String? = null,
    val verifiedByUserId: String? = null,
    val verifiedByUserName: String? = null,
    val verifiedTimestamp: Long? = null,
    val notes: String = ""
) {
    val isVerified: Boolean
        get() = verificationStatus == VerificationStatus.VERIFIED

    val timeWindowDisplay: String
        get() = "$startTime - $endTime"

    val dayNameDisplay: String
        get() = dayOfWeek.name.lowercase().replaceFirstChar { it.uppercase() }
}
