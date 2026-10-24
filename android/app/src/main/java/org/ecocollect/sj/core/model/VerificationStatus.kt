package org.ecocollect.sj.core.model

/**
 * Honest schedule verification states mandated by municipal governance rules.
 * Never display an unconfirmed schedule as verified or official.
 */
enum class VerificationStatus(val displayName: String, val badgeLabel: String) {
    VERIFIED("Verified Official Schedule", "OFFICIAL"),
    PENDING_VERIFICATION("Schedule Awaiting Official Confirmation", "PENDING VERIFICATION"),
    OUTDATED("Outdated - Confirmation Needed", "OUTDATED"),
    DEMO("Demonstration / Sample Data", "DEMO DATA");

    val isOfficial: Boolean
        get() = this == VERIFIED
}
