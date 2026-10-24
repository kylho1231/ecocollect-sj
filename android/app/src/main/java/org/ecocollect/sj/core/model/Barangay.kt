package org.ecocollect.sj.core.model

/**
 * Representation of a Barangay in San Jose de Buenavista, Antique.
 */
data class Barangay(
    val id: String,
    val name: String,
    val isPilot: Boolean = false,
    val puroks: List<Purok> = emptyList()
) {
    companion object {
        val PILOT_FUNDA_DALIPE = Barangay(
            id = "funda_dalipe",
            name = "Funda-Dalipe",
            isPilot = true,
            puroks = listOf(
                Purok("fd_centro", "Purok Centro (Poblacion Side)"),
                Purok("fd_baybay", "Purok Baybay (Coastal Zone)"),
                Purok("fd_crossing", "Purok Crossing (Highway Corridor)"),
                Purok("fd_san_pedro_bnd", "Purok Boundary San Pedro"),
                Purok("fd_ilaya", "Purok Ilaya (Inland Area)")
            )
        )

        val ALL_SAN_JOSE_BARANGAYS: List<Barangay> = listOf(
            PILOT_FUNDA_DALIPE,
            Barangay("atabay", "Atabay"),
            Barangay("badiang", "Badiang"),
            Barangay("bagumbayan", "Bagumbayan"),
            Barangay("bariri", "Bariri"),
            Barangay("bugarot", "Bugarot"),
            Barangay("cansadan_tuburan", "Cansadan-Tuburan"),
            Barangay("igbators", "Igbators"),
            Barangay("inabasan", "Inabasan"),
            Barangay("madrangca", "Madrangca"),
            Barangay("magcalon", "Magcalon"),
            Barangay("malaiba", "Malaiba"),
            Barangay("maybato_north", "Maybato North"),
            Barangay("maybato_south", "Maybato South"),
            Barangay("mojon", "Mojon"),
            Barangay("pantao", "Pantao"),
            Barangay("san_angel", "San Angel"),
            Barangay("san_fernando", "San Fernando"),
            Barangay("san_pedro", "San Pedro"),
            Barangay("supa", "Supa")
        )
    }
}

data class Purok(
    val id: String,
    val name: String
)
