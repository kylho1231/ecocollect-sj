package org.ecocollect.sj.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import org.ecocollect.sj.core.designsystem.StatusPendingAmber
import org.ecocollect.sj.core.designsystem.White
import org.ecocollect.sj.core.model.CollectionSchedule
import org.ecocollect.sj.core.model.VerificationStatus

@Composable
fun HonestScheduleCard(
    schedule: CollectionSchedule,
    modifier: Modifier = Modifier,
    onReminderClick: () -> Unit = {}
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, CardBorder, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            // Header: Category Pill & Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Waste Category Indicator
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(Color(schedule.wasteCategory.colorHex))
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = schedule.wasteCategory.standardName,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = DeepNavy
                    )
                }

                // Verification Badge (Real & Honest Data Principle)
                EcoStatusBadge(status = schedule.verificationStatus)
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Main Time and Day Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = "Day",
                            tint = ForestGreenPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = schedule.dayNameDisplay,
                            style = MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = DeepNavy
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AccessTime,
                            contentDescription = "Time Window",
                            tint = SlateTextSecondary,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = schedule.timeWindowDisplay,
                            style = MaterialTheme.typography.bodyLarge.copy(
                                color = SlateTextPrimary,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                    }
                }

                // Kinaray-a Local Translation Pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(MintBackground)
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "Local: ${schedule.wasteCategory.localKinarayAName}",
                        color = ForestGreenPrimary,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = CardBorder, thickness = 1.dp)
            Spacer(modifier = Modifier.height(12.dp))

            // Verification Notice Section
            if (schedule.verificationStatus == VerificationStatus.PENDING_VERIFICATION) {
                // Honest Government Disclosure: Awaiting Official Confirmation
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(StatusPendingAmber.copy(alpha = 0.08f))
                        .border(1.dp, StatusPendingAmber.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                        .padding(12.dp)
                ) {
                    Row(verticalAlignment = Alignment.Top) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "Pending Notice",
                            tint = StatusPendingAmber,
                            modifier = Modifier
                                .size(18.dp)
                                .padding(top = 2.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Schedule Awaiting Official Confirmation",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                ),
                                color = StatusPendingAmber
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Submitted for Barangay ${schedule.barangayName}. Awaiting formal approval and publication by MENRO San Jose de Buenavista.",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                color = SlateTextPrimary
                            )
                        }
                    }
                }
            } else if (schedule.verificationStatus == VerificationStatus.VERIFIED) {
                // Official Verified Details
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Official",
                            tint = ForestGreenPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Ref: ${schedule.officialReference ?: "MENRO-CONFIRMED"}",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                            color = SlateTextSecondary
                        )
                    }

                    if (schedule.verifiedByUserName != null) {
                        Text(
                            text = "Verified by: ${schedule.verifiedByUserName}",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                            color = SlateTextSecondary
                        )
                    }
                }
            }
        }
    }
}
