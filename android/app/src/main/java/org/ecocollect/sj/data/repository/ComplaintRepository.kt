package org.ecocollect.sj.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.ecocollect.sj.core.model.Complaint
import org.ecocollect.sj.core.model.ComplaintCategory
import org.ecocollect.sj.core.model.ComplaintStatus
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

interface ComplaintRepository {
    fun getComplaintsForResident(residentUserId: String): Flow<List<Complaint>>
    suspend fun submitComplaint(
        residentUserId: String,
        residentDisplayName: String,
        barangayId: String,
        purokId: String,
        category: ComplaintCategory,
        description: String,
        photoUrls: List<String> = emptyList()
    ): Complaint
}

class ComplaintRepositoryImpl : ComplaintRepository {

    private val complaintsFlow = MutableStateFlow<List<Complaint>>(emptyList())

    override fun getComplaintsForResident(residentUserId: String): Flow<List<Complaint>> {
        return complaintsFlow.asStateFlow()
    }

    override suspend fun submitComplaint(
        residentUserId: String,
        residentDisplayName: String,
        barangayId: String,
        purokId: String,
        category: ComplaintCategory,
        description: String,
        photoUrls: List<String>
    ): Complaint {
        val dateFormat = SimpleDateFormat("yyyyMMdd", Locale.US)
        val dateStr = dateFormat.format(Date())
        val randomSuffix = (1000..9999).random()
        val trackingNumber = "EC-$dateStr-$randomSuffix"

        val complaint = Complaint(
            id = UUID.randomUUID().toString(),
            trackingNumber = trackingNumber,
            residentUserId = residentUserId,
            residentDisplayName = residentDisplayName,
            barangayId = barangayId,
            purokId = purokId,
            category = category,
            description = description,
            photoUrls = photoUrls,
            status = ComplaintStatus.SUBMITTED,
            createdAtEpochMillis = System.currentTimeMillis()
        )

        val updated = complaintsFlow.value.toMutableList()
        updated.add(0, complaint)
        complaintsFlow.value = updated
        return complaint
    }
}
