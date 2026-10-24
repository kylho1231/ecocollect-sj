package org.ecocollect.sj.feature.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.ReportProblem
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.ecocollect.sj.core.designsystem.CardBorder
import org.ecocollect.sj.core.designsystem.DeepNavy
import org.ecocollect.sj.core.designsystem.ForestGreenPrimary
import org.ecocollect.sj.core.designsystem.MintBackground
import org.ecocollect.sj.core.designsystem.SlateTextPrimary
import org.ecocollect.sj.core.designsystem.SlateTextSecondary
import org.ecocollect.sj.core.designsystem.StatusAlertRed
import org.ecocollect.sj.core.designsystem.StatusPendingAmber
import org.ecocollect.sj.core.designsystem.StatusVerifiedGreen
import org.ecocollect.sj.core.designsystem.White
import org.ecocollect.sj.core.designsystem.components.EcoBottomNav
import org.ecocollect.sj.core.designsystem.components.EcoTab
import org.ecocollect.sj.core.designsystem.components.EcoTopBar
import org.ecocollect.sj.core.designsystem.components.HonestScheduleCard
import org.ecocollect.sj.core.model.Barangay
import org.ecocollect.sj.core.model.Purok

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResidentDashboardScreen(
    viewModel: ResidentDashboardViewModel,
    onNavigateToReport: () -> Unit,
    onNavigateToGuide: () -> Unit,
    onNavigateToSchedule: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf(EcoTab.HOME) }

    Scaffold(
        topBar = {
            EcoTopBar(
                currentBarangayName = state.selectedBarangay.name,
                currentPurokName = state.selectedPurok?.name
            )
        },
        bottomBar = {
            EcoBottomNav(
                selectedTab = selectedTab,
                onTabSelected = { tab ->
                    selectedTab = tab
                    when (tab) {
                        EcoTab.GUIDE -> onNavigateToGuide()
                        EcoTab.REPORT -> onNavigateToReport()
                        EcoTab.SCHEDULE -> onNavigateToSchedule()
                        else -> Unit
                    }
                }
            )
        },
        containerColor = MintBackground
    ) { paddingValues ->
        if (state.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = ForestGreenPrimary)
            }
        } else {
            LazyColumn(
                modifier = modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Spacer(modifier = Modifier.height(6.dp))
                    // Pilot Location Banner
                    PilotLocationHeader(
                        selectedBarangay = state.selectedBarangay,
                        allBarangays = state.allBarangays,
                        onSelectBarangay = { viewModel.selectBarangay(it) }
                    )
                }

                // Purok Filter Row (if available)
                if (state.availablePuroks.isNotEmpty()) {
                    item {
                        PurokSelectorRow(
                            puroks = state.availablePuroks,
                            selectedPurok = state.selectedPurok,
                            onSelectPurok = { viewModel.selectPurok(it) }
                        )
                    }
                }

                // Live Collection Tracker Card
                item {
                    LiveCollectorStatusCard(
                        progress = state.liveProgress,
                        barangayName = state.selectedBarangay.name
                    )
                }

                // Next Upcoming Schedule Card (Honest Data presentation)
                item {
                    Text(
                        text = "Next Scheduled Collection",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = DeepNavy
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    if (state.nextSchedule != null) {
                        HonestScheduleCard(
                            schedule = state.nextSchedule!!,
                            onReminderClick = { viewModel.toggleReminder(state.nextSchedule!!.id) }
                        )
                    } else {
                        NoScheduleCard(barangayName = state.selectedBarangay.name)
                    }
                }

                // Quick Action Cards
                item {
                    Text(
                        text = "Resident Quick Actions",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = DeepNavy
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        ActionCard(
                            title = "Report Issue",
                            subtitle = "Missed collection or unsegregated dump",
                            icon = Icons.Default.ReportProblem,
                            tint = StatusAlertRed,
                            modifier = Modifier.weight(1f),
                            onClick = onNavigateToReport
                        )
                        ActionCard(
                            title = "Sorting Guide",
                            subtitle = "No Segregation, No Collection policy",
                            icon = Icons.Default.DeleteSweep,
                            tint = ForestGreenPrimary,
                            modifier = Modifier.weight(1f),
                            onClick = onNavigateToGuide
                        )
                    }
                }

                // Municipal Policy Notice
                item {
                    MunicipalPolicyCard()
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
fun PilotLocationHeader(
    selectedBarangay: Barangay,
    allBarangays: List<Barangay>,
    onSelectBarangay: (Barangay) -> Unit
) {
    var dropdownExpanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorder, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = White),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(MintBackground),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationCity,
                            contentDescription = "Barangay",
                            tint = ForestGreenPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Barangay Jurisdiction",
                            style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary)
                        )
                        Text(
                            text = selectedBarangay.name,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = DeepNavy
                            )
                        )
                    }
                }

                Box {
                    OutlinedButton(
                        onClick = { dropdownExpanded = true },
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(text = "Change", color = ForestGreenPrimary, fontSize = 12.sp)
                        Icon(
                            imageVector = Icons.Default.ArrowDropDown,
                            contentDescription = "Dropdown",
                            tint = ForestGreenPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = dropdownExpanded,
                        onDismissRequest = { dropdownExpanded = false }
                    ) {
                        allBarangays.forEach { barangay ->
                            DropdownMenuItem(
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(text = barangay.name)
                                        if (barangay.isPilot) {
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(
                                                text = "(Pilot)",
                                                color = ForestGreenPrimary,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                },
                                onClick = {
                                    onSelectBarangay(barangay)
                                    dropdownExpanded = false
                                }
                            )
                        }
                    }
                }
            }

            if (selectedBarangay.isPilot) {
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(6.dp))
                        .background(ForestGreenPrimary.copy(alpha = 0.08f))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "Official Pilot Barangay: Funda-Dalipe, San Jose de Buenavista",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = ForestGreenPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun PurokSelectorRow(
    puroks: List<Purok>,
    selectedPurok: Purok?,
    onSelectPurok: (Purok?) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        val isAllSelected = selectedPurok == null
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(if (isAllSelected) ForestGreenPrimary else White)
                .border(1.dp, if (isAllSelected) ForestGreenPrimary else CardBorder, RoundedCornerShape(20.dp))
                .clickable { onSelectPurok(null) }
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Text(
                text = "All Puroks",
                color = if (isAllSelected) White else SlateTextPrimary,
                style = MaterialTheme.typography.labelSmall
            )
        }

        puroks.take(3).forEach { purok ->
            val isSelected = selectedPurok?.id == purok.id
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (isSelected) ForestGreenPrimary else White)
                    .border(1.dp, if (isSelected) ForestGreenPrimary else CardBorder, RoundedCornerShape(20.dp))
                    .clickable { onSelectPurok(purok) }
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = purok.name.replace("Purok ", "P-"),
                    color = if (isSelected) White else SlateTextPrimary,
                    style = MaterialTheme.typography.labelSmall
                )
            }
        }
    }
}

@Composable
fun LiveCollectorStatusCard(
    progress: org.ecocollect.sj.core.model.LiveCollectionProgress?,
    barangayName: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorder, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = White)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocalShipping,
                        contentDescription = "Truck",
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Collection Live Status",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = DeepNavy
                        )
                    )
                }

                if (progress != null && progress.isTelemetryFresh()) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(StatusVerifiedGreen.copy(alpha = 0.12f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "ACTIVE ROUTE",
                            style = MaterialTheme.typography.labelSmall.copy(color = StatusVerifiedGreen)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (progress != null && progress.isTelemetryFresh()) {
                Text(
                    text = progress.state.label,
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = ForestGreenPrimary,
                        fontSize = 18.sp
                    )
                )

                if (progress.currentPurokName != null) {
                    Text(
                        text = "Currently servicing: ${progress.currentPurokName} (Truck: ${progress.assignedVehiclePlate ?: "MENRO"})",
                        style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextSecondary)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Progress Bar
                val fraction = if (progress.totalStops > 0) progress.completedStops.toFloat() / progress.totalStops.toFloat() else 0f
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Stops Completed: ${progress.completedStops} / ${progress.totalStops}",
                            style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary)
                        )
                        Text(
                            text = "${(fraction * 100).toInt()}%",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = ForestGreenPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(CardBorder)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(fraction)
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(ForestGreenPrimary)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = progress.displayEstimatedArrival,
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = DeepNavy
                    )
                )
            } else {
                // Truth in Data: Never fabricate arrival time when driver telemetry is stale/unavailable
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(MintBackground)
                        .padding(12.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "Notice",
                            tint = SlateTextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "No collection truck actively operating in $barangayName at this time. Live tracking will activate during assigned shifts.",
                            style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextSecondary, fontSize = 12.sp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tint: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .border(1.dp, CardBorder, RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = White)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(tint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = tint,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = DeepNavy
                )
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = SlateTextSecondary,
                    lineHeight = 16.sp
                )
            )
        }
    }
}

@Composable
fun MunicipalPolicyCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, ForestGreenPrimary.copy(alpha = 0.3f), RoundedCornerShape(14.dp)),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = ForestGreenPrimary.copy(alpha = 0.05f))
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.VerifiedUser,
                contentDescription = "Policy",
                tint = ForestGreenPrimary,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "No Segregation, No Collection Policy",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = DeepNavy
                    )
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Enforced by Municipal Environment & Natural Resources Office (MENRO) San Jose de Buenavista. Mixed waste will not be collected.",
                    style = MaterialTheme.typography.bodySmall.copy(color = SlateTextPrimary)
                )
            }
        }
    }
}

@Composable
fun NoScheduleCard(barangayName: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorder, RoundedCornerShape(14.dp)),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = "No Schedule",
                tint = SlateTextSecondary,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "No Verified Schedule for $barangayName",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = DeepNavy)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "MENRO has not yet published an approved collection timetable for this jurisdiction.",
                style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}
