package org.ecocollect.sj

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import org.ecocollect.sj.core.designsystem.EcoCollectTheme
import org.ecocollect.sj.feature.dashboard.ResidentDashboardViewModel
import org.ecocollect.sj.navigation.EcoNavHost

class MainActivity : ComponentActivity() {

    private val dashboardViewModel: ResidentDashboardViewModel by viewModels {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = application as EcoCollectApp
                return ResidentDashboardViewModel(
                    barangayRepository = app.barangayRepository,
                    scheduleRepository = app.scheduleRepository
                ) as T
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as EcoCollectApp

        setContent {
            EcoCollectTheme {
                EcoNavHost(
                    dashboardViewModel = dashboardViewModel,
                    complaintRepository = app.complaintRepository
                )
            }
        }
    }
}
