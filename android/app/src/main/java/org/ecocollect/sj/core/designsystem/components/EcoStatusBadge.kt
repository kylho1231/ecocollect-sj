package org.ecocollect.sj.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import org.ecocollect.sj.core.designsystem.StatusAlertRed
import org.ecocollect.sj.core.designsystem.StatusDemoPurple
import org.ecocollect.sj.core.designsystem.StatusOutdatedGray
import org.ecocollect.sj.core.designsystem.StatusPendingAmber
import org.ecocollect.sj.core.designsystem.StatusVerifiedGreen
import org.ecocollect.sj.core.model.VerificationStatus

/**
 * Status badge enforcing the Municipal Truth-in-Data rule:
 * Every schedule status MUST display both an icon and explicit text,
 * so residents and officials are never misled by color alone.
 */
@Composable
fun EcoStatusBadge(
    status: VerificationStatus,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor, borderColor, icon) = when (status) {
        VerificationStatus.VERIFIED -> Quadruple(
            StatusVerifiedGreen.copy(alpha = 0.12f),
            StatusVerifiedGreen,
            StatusVerifiedGreen.copy(alpha = 0.4f),
            Icons.Default.CheckCircle
        )
        VerificationStatus.PENDING_VERIFICATION -> Quadruple(
            StatusPendingAmber.copy(alpha = 0.15f),
            StatusPendingAmber,
            StatusPendingAmber.copy(alpha = 0.5f),
            Icons.Default.HourglassEmpty
        )
        VerificationStatus.OUTDATED -> Quadruple(
            StatusOutdatedGray.copy(alpha = 0.15f),
            StatusOutdatedGray,
            StatusOutdatedGray.copy(alpha = 0.4f),
            Icons.Default.Warning
        )
        VerificationStatus.DEMO -> Quadruple(
            StatusDemoPurple.copy(alpha = 0.12f),
            StatusDemoPurple,
            StatusDemoPurple.copy(alpha = 0.4f),
            Icons.Default.Info
        )
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = status.badgeLabel,
                tint = textColor,
                modifier = Modifier.size(13.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = status.badgeLabel,
                color = textColor,
                style = MaterialTheme.typography.labelSmall
            )
        }
    }
}

private data class Quadruple<A, B, C, D>(
    val first: A,
    val second: B,
    val third: C,
    val fourth: D
)
