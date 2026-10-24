package org.ecocollect.sj.feature.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.ecocollect.sj.core.model.Barangay
import org.ecocollect.sj.core.model.CollectionSchedule
import org.ecocollect.sj.core.model.LiveCollectionProgress
import org.ecocollect.sj.core.model.Purok
import org.ecocollect.sj.core.model.VerificationStatus
import org.ecocollect.sj.data.repository.BarangayRepository
import org.ecocollect.sj.data.repository.ScheduleRepository

data class ResidentDashboardUiState(
    val isLoading: Boolean = true,
    val allBarangays: List<Barangay> = emptyList(),
    val selectedBarangay: Barangay = Barangay.PILOT_FUNDA_DALIPE,
    val selectedPurok: Purok? = null,
    val availablePuroks: List<Purok> = emptyList(),
    val schedules: List<CollectionSchedule> = emptyList(),
    val liveProgress: LiveCollectionProgress? = null,
    val nextSchedule: CollectionSchedule? = null,
    val isScheduleVerified: Boolean = false,
    val statusBannerMessage: String = "",
    val activeReminderScheduleIds: Set<String> = emptySet(),
    val userErrorMessage: String? = null
)

class ResidentDashboardViewModel(
    private val barangayRepository: BarangayRepository,
    private val scheduleRepository: ScheduleRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ResidentDashboardUiState(
            selectedBarangay = barangayRepository.getPilotBarangay(),
            availablePuroks = barangayRepository.getPuroksForBarangay(Barangay.PILOT_FUNDA_DALIPE.id)
        )
    )
    val uiState: StateFlow<ResidentDashboardUiState> = _uiState.asStateFlow()

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        viewModelScope.launch {
            barangayRepository.getAllBarangays().collect { barangays ->
                _uiState.update { it.copy(allBarangays = barangays) }
            }
        }

        observeSchedulesForBarangay(_uiState.value.selectedBarangay.id)
    }

    private fun observeSchedulesForBarangay(barangayId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            combine(
                scheduleRepository.getSchedulesForBarangay(barangayId),
                scheduleRepository.getLiveRouteProgress(barangayId)
            ) { schedules, liveProgress ->
                val next = schedules.firstOrNull()
                val isVerified = next?.isVerified ?: false
                val bannerMsg = if (!isVerified && schedules.isNotEmpty()) {
                    "Notice: Schedule for ${_uiState.value.selectedBarangay.name} is awaiting official confirmation by MENRO San Jose."
                } else if (isVerified) {
                    "Official MENRO verified collection schedule active."
                } else {
                    "No published schedule available for this barangay."
                }

                Pair(schedules, liveProgress) to Triple(next, isVerified, bannerMsg)
            }.collect { (dataPair, statusTriple) ->
                val (schedules, liveProgress) = dataPair
                val (next, isVerified, bannerMsg) = statusTriple

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        schedules = schedules,
                        liveProgress = liveProgress,
                        nextSchedule = next,
                        isScheduleVerified = isVerified,
                        statusBannerMessage = bannerMsg
                    )
                }
            }
        }
    }

    fun selectBarangay(barangay: Barangay) {
        val puroks = barangayRepository.getPuroksForBarangay(barangay.id)
        _uiState.update {
            it.copy(
                selectedBarangay = barangay,
                availablePuroks = puroks,
                selectedPurok = null
            )
        }
        observeSchedulesForBarangay(barangay.id)
    }

    fun selectPurok(purok: Purok?) {
        _uiState.update { it.copy(selectedPurok = purok) }
    }

    fun toggleReminder(scheduleId: String) {
        _uiState.update { current ->
            val set = current.activeReminderScheduleIds.toMutableSet()
            if (set.contains(scheduleId)) {
                set.remove(scheduleId)
            } else {
                set.add(scheduleId)
            }
            current.copy(activeReminderScheduleIds = set)
        }
    }
}
