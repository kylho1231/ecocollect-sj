package org.ecocollect.sj.feature.segregation

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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HighlightOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
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
import org.ecocollect.sj.core.designsystem.StatusVerifiedGreen
import org.ecocollect.sj.core.designsystem.White
import org.ecocollect.sj.core.model.WasteCategory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SegregationGuideScreen(
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val categories = WasteCategory.entries.toTypedArray()
    var selectedCategoryIndex by remember { mutableStateOf(0) }
    val currentCategory = categories[selectedCategoryIndex]

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Waste Segregation Guide",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = White
                        )
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ForestGreenPrimary)
            )
        },
        containerColor = MintBackground
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Category Tabs
            TabRow(
                selectedTabIndex = selectedCategoryIndex,
                containerColor = White,
                contentColor = ForestGreenPrimary,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedCategoryIndex]),
                        color = Color(currentCategory.colorHex)
                    )
                }
            ) {
                categories.forEachIndexed { index, category ->
                    Tab(
                        selected = selectedCategoryIndex == index,
                        onClick = { selectedCategoryIndex = index },
                        text = {
                            Text(
                                text = category.name.substring(0, 3),
                                fontWeight = if (selectedCategoryIndex == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedCategoryIndex == index) DeepNavy else SlateTextSecondary
                            )
                        }
                    )
                }
            }

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header Details Card
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, CardBorder, RoundedCornerShape(16.dp)),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = White)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = currentCategory.standardName,
                                    style = MaterialTheme.typography.titleLarge.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = DeepNavy
                                    )
                                )
                                Box(
                                    modifier = Modifier
                                        .size(16.dp)
                                        .clip(CircleShape)
                                        .background(Color(currentCategory.colorHex))
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Kinaray-a: ${currentCategory.localKinarayAName}",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    color = Color(currentCategory.colorHex),
                                    fontWeight = FontWeight.SemiBold
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = currentCategory.description,
                                style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextPrimary)
                            )
                        }
                    }
                }

                // Allowed Items Section
                item {
                    Text(
                        text = "Allowed in this Bin",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = StatusVerifiedGreen
                        )
                    )
                }

                items(currentCategory.allowedExamples) { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, CardBorder, RoundedCornerShape(10.dp)),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = White)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Allowed",
                                tint = StatusVerifiedGreen,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = item,
                                style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextPrimary)
                            )
                        }
                    }
                }

                // Prohibited Items Section
                item {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Strictly Prohibited (Will Refuse Collection)",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = StatusAlertRed
                        )
                    )
                }

                items(currentCategory.prohibitedExamples) { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, CardBorder, RoundedCornerShape(10.dp)),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = White)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.HighlightOff,
                                contentDescription = "Prohibited",
                                tint = StatusAlertRed,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = item,
                                style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextPrimary)
                            )
                        }
                    }
                }

                // Special Warning for hazardous items
                if (currentCategory == WasteCategory.SPECIAL) {
                    item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, StatusAlertRed.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = StatusAlertRed.copy(alpha = 0.08f))
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Warning,
                                    contentDescription = "Warning",
                                    tint = StatusAlertRed,
                                    modifier = Modifier.size(22.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Special wastes like CFL bulbs, batteries, and medical sharps must never be mixed with regular garbage trucks. Await designated MENRO hazardous e-waste collection drives or drop off at the municipal MRF.",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = DeepNavy,
                                        lineHeight = 18.sp
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
