package org.ecocollect.sj

import android.app.Application
import org.ecocollect.sj.data.repository.BarangayRepository
import org.ecocollect.sj.data.repository.BarangayRepositoryImpl
import org.ecocollect.sj.data.repository.ComplaintRepository
import org.ecocollect.sj.data.repository.ComplaintRepositoryImpl
import org.ecocollect.sj.data.repository.ScheduleRepository
import org.ecocollect.sj.data.repository.ScheduleRepositoryImpl

/**
 * Main Application class for EcoCollect SJ.
 * Initializes core repositories and services following Clean Architecture principles.
 */
class EcoCollectApp : Application() {

    lateinit var barangayRepository: BarangayRepository
        private set

    lateinit var scheduleRepository: ScheduleRepository
        private set

    lateinit var complaintRepository: ComplaintRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        barangayRepository = BarangayRepositoryImpl()
        scheduleRepository = ScheduleRepositoryImpl()
        complaintRepository = ComplaintRepositoryImpl()
    }

    companion object {
        lateinit var instance: EcoCollectApp
            private set
    }
}
