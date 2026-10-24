package org.ecocollect.sj.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import org.ecocollect.sj.core.model.Complaint
import org.ecocollect.sj.core.model.ComplaintCategory
import org.ecocollect.sj.core.model.ComplaintStatus
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

/**
 * Production Cloud Firestore implementation for citizen incident and missed pickup complaints.
 */
class FirestoreComplaintRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ComplaintRepository {

    override fun getComplaintsForResident(residentUserId: String): Flow<List<Complaint>> = callbackFlow {
        val query = firestore.collection("complaints")
            .whereEqualTo("residentUserId", residentUserId)
            .orderBy("createdAtEpochMillis", Query.Direction.DESCENDING)

        val registration: ListenerRegistration = query.addSnapshotListener { snapshot, error ->
            if (error != null) {
                trySend(emptyList())
                return@addSnapshotListener
            }

            if (snapshot != null) {
                val list = snapshot.documents.mapNotNull { doc ->
                    try {
                        val rawCategory = doc.getString("category") ?: "MISSED_COLLECTION"
                        val category = try {
                            ComplaintCategory.valueOf(rawCategory)
                        } catch (e: Exception) {
                            ComplaintCategory.MISSED_COLLECTION
                        }

                        val rawStatus = doc.getString("status") ?: "SUBMITTED"
                        val status = try {
                            ComplaintStatus.valueOf(rawStatus)
                        } catch (e: Exception) {
                            ComplaintStatus.SUBMITTED
                        }

                        Complaint(
                            id = doc.id,
                            trackingNumber = doc.getString("trackingNumber") ?: doc.id,
                            residentUserId = doc.getString("residentUserId") ?: residentUserId,
                            residentDisplayName = doc.getString("residentDisplayName") ?: "Resident",
                            barangayId = doc.getString("barangayId") ?: "",
                            purokId = doc.getString("purokId") ?: "",
                            category = category,
                            description = doc.getString("description") ?: "",
                            photoUrls = (doc.get("photoUrls") as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                            status = status,
                            resolutionNotes = doc.getString("resolutionNotes"),
                            createdAtEpochMillis = doc.getLong("createdAtEpochMillis") ?: System.currentTimeMillis()
                        )
                    } catch (e: Exception) {
                        null
                    }
                }
                trySend(list)
            }
        }

        awaitClose { registration.remove() }
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
        val complaintId = UUID.randomUUID().toString()
        val now = System.currentTimeMillis()

        val complaint = Complaint(
            id = complaintId,
            trackingNumber = trackingNumber,
            residentUserId = residentUserId,
            residentDisplayName = residentDisplayName,
            barangayId = barangayId,
            purokId = purokId,
            category = category,
            description = description,
            photoUrls = photoUrls,
            status = ComplaintStatus.SUBMITTED,
            createdAtEpochMillis = now
        )

        val docData = mapOf(
            "id" to complaintId,
            "trackingNumber" to trackingNumber,
            "residentUserId" to residentUserId,
            "residentDisplayName" to residentDisplayName,
            "barangayId" to barangayId,
            "purokId" to purokId,
            "category" to category.name,
            "description" to description,
            "photoUrls" to photoUrls,
            "status" to "SUBMITTED",
            "createdAtEpochMillis" to now
        )

        // Write directly to Cloud Firestore
        firestore.collection("complaints").document(complaintId).set(docData).await()

        return complaint
    }
}
