package org.ecocollect.sj.core.designsystem.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ReportProblem
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import org.ecocollect.sj.core.designsystem.DeepNavy
import org.ecocollect.sj.core.designsystem.ForestGreenPrimary
import org.ecocollect.sj.core.designsystem.MintBackground
import org.ecocollect.sj.core.designsystem.SlateTextSecondary
import org.ecocollect.sj.core.designsystem.White

enum class EcoTab(val title: String, val icon: ImageVector) {
    HOME("Home", Icons.Default.Home),
    SCHEDULE("Schedule", Icons.Default.CalendarMonth),
    GUIDE("Segregate", Icons.Default.DeleteSweep),
    REPORT("Report", Icons.Default.ReportProblem),
    PROFILE("Profile", Icons.Default.Person)
}

@Composable
fun EcoBottomNav(
    selectedTab: EcoTab,
    onTabSelected: (EcoTab) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        modifier = modifier,
        containerColor = White,
        tonalElevation = 8.dp
    ) {
        EcoTab.entries.forEach { tab ->
            val isSelected = tab == selectedTab
            NavigationBarItem(
                selected = isSelected,
                onClick = { onTabSelected(tab) },
                icon = {
                    Icon(
                        imageVector = tab.icon,
                        contentDescription = tab.title
                    )
                },
                label = {
                    Text(text = tab.title)
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = ForestGreenPrimary,
                    selectedTextColor = ForestGreenPrimary,
                    indicatorColor = MintBackground,
                    unselectedIconColor = SlateTextSecondary,
                    unselectedTextColor = SlateTextSecondary
                )
            )
        }
    }
}
