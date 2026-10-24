package org.ecocollect.sj.feature.complaints

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.ecocollect.sj.core.designsystem.CardBorder
import org.ecocollect.sj.core.designsystem.DeepNavy
import org.ecocollect.sj.core.designsystem.ForestGreenPrimary
import org.ecocollect.sj.core.designsystem.MintBackground
import org.ecocollect.sj.core.designsystem.SlateTextPrimary
import org.ecocollect.sj.core.designsystem.SlateTextSecondary
import org.ecocollect.sj.core.designsystem.StatusVerifiedGreen
import org.ecocollect.sj.core.designsystem.White
import org.ecocollect.sj.core.model.ComplaintCategory
import org.ecocollect.sj.data.repository.ComplaintRepository

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportIncidentScreen(
    complaintRepository: ComplaintRepository,
    barangayId: String = "funda_dalipe",
    purokId: String = "fd_centro",
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scope = rememberCoroutineScope()
    var selectedCategory by remember { mutableStateOf(ComplaintCategory.MISSED_COLLECTION) }
    var categoryDropdownExpanded by remember { mutableStateOf(false) }
    var descriptionText by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }
    var submittedTrackingNumber by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Report Waste Incident",
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
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Location Badge Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardBorder, RoundedCornerShape(12.dp)),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = White)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationCity,
                        contentDescription = "Location",
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Jurisdiction: Barangay Funda-Dalipe, San Jose de Buenavista",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = DeepNavy
                        )
                    )
                }
            }

            // Category Selection Dropdown
            Text(
                text = "Incident Category",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = DeepNavy
                )
            )

            ExposedDropdownMenuBox(
                expanded = categoryDropdownExpanded,
                onExpandedChange = { categoryDropdownExpanded = !categoryDropdownExpanded }
            ) {
                OutlinedTextField(
                    value = selectedCategory.displayName,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryDropdownExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = White,
                        unfocusedContainerColor = White,
                        focusedBorderColor = ForestGreenPrimary,
                        unfocusedBorderColor = CardBorder
                    )
                )

                ExposedDropdownMenu(
                    expanded = categoryDropdownExpanded,
                    onDismissRequest = { categoryDropdownExpanded = false }
                ) {
                    ComplaintCategory.entries.forEach { category ->
                        DropdownMenuItem(
                            text = { Text(text = category.displayName) },
                            onClick = {
                                selectedCategory = category
                                categoryDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            // Description Input
            Text(
                text = "Incident Description",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = DeepNavy
                )
            )

            OutlinedTextField(
                value = descriptionText,
                onValueChange = { descriptionText = it },
                placeholder = {
                    Text(
                        text = "Provide details such as landmark, approximate street location, or duration waste has remained uncollected...",
                        style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextSecondary)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = White,
                    unfocusedContainerColor = White,
                    focusedBorderColor = ForestGreenPrimary,
                    unfocusedBorderColor = CardBorder
                )
            )

            // Optional Photo Upload Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardBorder, RoundedCornerShape(12.dp)),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.AddAPhoto,
                        contentDescription = "Photo",
                        tint = ForestGreenPrimary,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Attach Photo Evidence (Optional)",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = DeepNavy
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Helps MENRO field inspectors locate the uncollected waste rapidly.",
                        style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                    )
                }
            }

            if (errorMessage != null) {
                Text(
                    text = errorMessage!!,
                    color = androidx.compose.ui.graphics.Color.Red,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Submit Button
            Button(
                onClick = {
                    if (descriptionText.isBlank()) {
                        errorMessage = "Please enter a brief description before submitting."
                        return@Button
                    }
                    errorMessage = null
                    isSubmitting = true

                    scope.launch {
                        try {
                            val result = complaintRepository.submitComplaint(
                                residentUserId = "resident_guest_01",
                                residentDisplayName = "Resident (Brgy. Funda-Dalipe)",
                                barangayId = barangayId,
                                purokId = purokId,
                                category = selectedCategory,
                                description = descriptionText
                            )
                            submittedTrackingNumber = result.trackingNumber
                        } catch (e: Exception) {
                            errorMessage = "Submission failed: ${e.message}"
                        } finally {
                            isSubmitting = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                enabled = !isSubmitting
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(color = White, modifier = Modifier.size(20.dp))
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Submit",
                            tint = White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Submit Official Report",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = White
                            )
                        )
                    }
                }
            }
        }
    }

    // Success Confirmation Dialog
    if (submittedTrackingNumber != null) {
        AlertDialog(
            onDismissRequest = { /* Require user acknowledgment */ },
            icon = {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Success",
                    tint = StatusVerifiedGreen,
                    modifier = Modifier.size(48.dp)
                )
            },
            title = {
                Text(
                    text = "Report Logged Successfully",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = DeepNavy
                )
            },
            text = {
                Column {
                    Text(
                        text = "Your report has been routed to MENRO San Jose de Buenavista.",
                        style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextPrimary)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(MintBackground)
                            .padding(10.dp)
                    ) {
                        Column {
                            Text(
                                text = "Official Tracking Number:",
                                style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary)
                            )
                            Text(
                                text = submittedTrackingNumber!!,
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    color = ForestGreenPrimary
                                )
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        submittedTrackingNumber = null
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                ) {
                    Text(text = "Return to Dashboard")
                }
            }
        )
    }
}
