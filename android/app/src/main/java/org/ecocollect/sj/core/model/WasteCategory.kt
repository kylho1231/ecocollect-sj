package org.ecocollect.sj.core.model

/**
 * Waste classification categories adhering to Republic Act 9003 (Ecological Solid Waste
 * Management Act of 2000) and the San Jose de Buenavista "No Segregation, No Collection" policy.
 */
enum class WasteCategory(
    val id: String,
    val standardName: String,
    val localKinarayAName: String,
    val description: String,
    val allowedExamples: List<String>,
    val prohibitedExamples: List<String>,
    val colorHex: Long
) {
    BIODEGRADABLE(
        id = "biodegradable",
        standardName = "Biodegradable (Malalata)",
        localKinarayAName = "Madunot",
        description = "Organic matter that decomposes naturally into compost.",
        allowedExamples = listOf(
            "Food waste, vegetable peelings, fruit scraps",
            "Leftover rice and fish bones",
            "Dried leaves, grass clippings, garden cuttings",
            "Eggshells and coffee grounds"
        ),
        prohibitedExamples = listOf(
            "Plastic packaging or containers",
            "Diapers or sanitary napkins",
            "Metal or glass items"
        ),
        colorHex = 0xFF16A34A // Green
    ),
    RECYCLABLE(
        id = "recyclable",
        standardName = "Recyclable (Maresiklo)",
        localKinarayAName = "Mabaligya / Maresiklo",
        description = "Clean, dry materials that can be remanufactured or sold to junk shops.",
        allowedExamples = listOf(
            "Plastic bottles (PET) and hard containers (rinsed & dried)",
            "Cardboard boxes, carton packaging, clean paper",
            "Tin cans, aluminum beverage cans",
            "Glass bottles and glass jars (intact)"
        ),
        prohibitedExamples = listOf(
            "Soiled pizza boxes or wet food containers",
            "Sachets, wrappers, and thin single-use plastic films"
        ),
        colorHex = 0xFF0284C7 // Blue
    ),
    RESIDUAL(
        id = "residual",
        standardName = "Residual (Di-madunot)",
        localKinarayAName = "Di-madunot / Indi Mabaligya",
        description = "Non-compostable and non-recyclable solid waste destined for sanitary landfill disposal.",
        allowedExamples = listOf(
            "Snack wrappers, condiment sachets, plastic bags (sando bags)",
            "Disposable diapers and sanitary pads (wrapped securely)",
            "Worn-out rags, foam, styrofoam packaging",
            "Toothbrushes, disposable cutlery"
        ),
        prohibitedExamples = listOf(
            "Organic food scraps",
            "Hazardous chemical bottles or fluorescent lamps"
        ),
        colorHex = 0xFF475569 // Slate
    ),
    SPECIAL(
        id = "special",
        standardName = "Special / Hazardous (Delikado)",
        localKinarayAName = "Delikado / Espesyal nga Basura",
        description = "Household hazardous waste and electronic scrap requiring special handling. NEVER mix with general trash.",
        allowedExamples = listOf(
            "Used batteries, dry cells, mobile phone batteries",
            "Fluorescent light tubes (CFL / linear bulbs)",
            "Broken glass shards (must be heavily boxed & labeled)",
            "Expired medicine bottles, pesticide containers"
        ),
        prohibitedExamples = listOf(
            "Regular household kitchen trash",
            "Non-hazardous paper and cardboard"
        ),
        colorHex = 0xFFDC2626 // Crimson
    )
}
