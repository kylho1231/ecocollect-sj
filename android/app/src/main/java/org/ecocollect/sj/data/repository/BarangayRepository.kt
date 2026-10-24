package org.ecocollect.sj.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.ecocollect.sj.core.model.Barangay
import org.ecocollect.sj.core.model.Purok

interface BarangayRepository {
    fun getAllBarangays(): Flow<List<Barangay>>
    fun getPilotBarangay(): Barangay
    fun getPuroksForBarangay(barangayId: String): List<Purok>
}

class BarangayRepositoryImpl : BarangayRepository {
    private val barangaysFlow = MutableStateFlow(Barangay.ALL_SAN_JOSE_BARANGAYS)

    override fun getAllBarangays(): Flow<List<Barangay>> = barangaysFlow.asStateFlow()

    override fun getPilotBarangay(): Barangay = Barangay.PILOT_FUNDA_DALIPE

    override fun getPuroksForBarangay(barangayId: String): List<Purok> {
        return Barangay.ALL_SAN_JOSE_BARANGAYS.find { it.id == barangayId }?.puroks ?: emptyList()
    }
}
