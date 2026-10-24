package org.ecocollect.sj.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.ecocollect.sj.data.repository.ComplaintRepository
import org.ecocollect.sj.feature.complaints.ReportIncidentScreen
import org.ecocollect.sj.feature.dashboard.ResidentDashboardScreen
import org.ecocollect.sj.feature.dashboard.ResidentDashboardViewModel
import org.ecocollect.sj.feature.segregation.SegregationGuideScreen

@Composable
fun EcoNavHost(
    dashboardViewModel: ResidentDashboardViewModel,
    complaintRepository: ComplaintRepository,
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route,
        modifier = modifier
    ) {
        composable(Screen.Dashboard.route) {
            ResidentDashboardScreen(
                viewModel = dashboardViewModel,
                onNavigateToReport = { navController.navigate(Screen.ReportIncident.route) },
                onNavigateToGuide = { navController.navigate(Screen.SegregationGuide.route) },
                onNavigateToSchedule = { /* Schedule tab view */ }
            )
        }

        composable(Screen.SegregationGuide.route) {
            SegregationGuideScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ReportIncident.route) {
            ReportIncidentScreen(
                complaintRepository = complaintRepository,
                barangayId = dashboardViewModel.uiState.value.selectedBarangay.id,
                purokId = dashboardViewModel.uiState.value.selectedPurok?.id ?: "fd_centro",
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
