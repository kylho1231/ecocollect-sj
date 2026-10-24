package org.ecocollect.sj.navigation

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Schedule : Screen("schedule")
    object SegregationGuide : Screen("segregation_guide")
    object ReportIncident : Screen("report_incident")
    object Profile : Screen("profile")
}
